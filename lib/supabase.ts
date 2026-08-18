import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local compatibility layer kept under the old import path so the existing
 * web UI does not need a backend SDK. No Supabase URL, key, OAuth endpoint,
 * or network request is used here.
 */

type User={id:string;email:string;user_metadata:any;app_metadata:any};
type Session={user:User};
type Ticket=Record<string,any>;

const isWeb=typeof window!=='undefined';
const key=(k:string)=>`mythos_${k}`;
const read=async<T>(k:string, fallback:T):Promise<T>=>{
  try{
    const raw=isWeb?window.localStorage.getItem(key(k)):await AsyncStorage.getItem(key(k));
    return raw?JSON.parse(raw):fallback;
  }catch{return fallback;}
};
const write=async(k:string,v:any)=>{
  const raw=JSON.stringify(v);
  if(isWeb) window.localStorage.setItem(key(k),raw); else await AsyncStorage.setItem(key(k),raw);
};
const remove=async(k:string)=>{if(isWeb)window.localStorage.removeItem(key(k));else await AsyncStorage.removeItem(key(k));};
const id=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const digest=async(value:string)=>{
  if(typeof crypto!=='undefined'&&crypto.subtle){
    const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
    return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  let h=0;for(let i=0;i<value.length;i++)h=((h<<5)-h)+value.charCodeAt(i)|0;return String(h);
};
const staffEmails=()=>String((import.meta as any)?.env?.VITE_STAFF_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
const makeUser=(email:string,name:string,role?:string):User=>({id:id(),email,user_metadata:{display_name:name},app_metadata:{role:role||'user'}});

let listeners:Array<(event:string,session:Session|null)=>void>=[];
const notify=(event:string,session:Session|null)=>listeners.forEach(fn=>fn(event,session));

async function currentSession():Promise<Session|null>{return read<Session|null>('session',null);}

const auth={
  async getSession(){return {data:{session:await currentSession()},error:null};},
  onAuthStateChange(callback:(event:string,session:Session|null)=>void){listeners.push(callback);return{data:{subscription:{unsubscribe(){listeners=listeners.filter(x=>x!==callback)}}}}},
  async signInWithPassword({email,password}:{email:string;password:string}){
    const accounts=await read<any[]>('accounts',[]);const e=email.trim().toLowerCase();const p=await digest(password);const a=accounts.find(x=>x.email===e&&x.password===p);
    if(!a)return{data:{session:null},error:{message:'E-mail ou senha incorretos.'}};
    const session={user:{...a.user}} as Session;await write('session',session);notify('SIGNED_IN',session);return{data:{session},error:null};
  },
  async signUp({email,password,options}:{email:string;password:string;options?:any}){
    const accounts=await read<any[]>('accounts',[]);const e=email.trim().toLowerCase();
    if(accounts.some(x=>x.email===e))return{data:{session:null,user:null},error:{message:'Esta conta já existe.'}};
    const role=staffEmails().includes(e)?'support':'user';const user=makeUser(e,options?.data?.display_name||e.split('@')[0],role);accounts.push({email:e,password:await digest(password),user});await write('accounts',accounts);const session={user};await write('session',session);notify('SIGNED_IN',session);return{data:{session,user},error:null};
  },
  async signInWithOAuth({provider}:{provider:string}){
    if(provider!=='google')return{data:null,error:{message:'Provedor não suportado.'}};
    const clientId=String((import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID||'');
    if(!clientId)return{data:null,error:{message:'Login Google ainda não foi configurado: defina VITE_GOOGLE_CLIENT_ID na Vercel. O login não usa Supabase.'}};
    if(isWeb)window.location.href=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=id_token&scope=openid%20email%20profile&nonce=${encodeURIComponent(id())}`;
    return{data:null,error:null};
  },
  async signOut(){await remove('session');notify('SIGNED_OUT',null);return{error:null};}
};

function table(name:string){
 const get=async()=>read<Ticket[]>(name,[]);const result=(data:any,error:any=null)=>({data,error});
 return{
  select(){const chain:any={};chain.order=async(_field:string,{ascending}:{ascending:boolean})=>result((await get()).sort((a:any,b:any)=>ascending?String(a.created_at||'').localeCompare(String(b.created_at||'')):String(b.created_at||'').localeCompare(String(a.created_at||''))));return chain;},
  insert(row:any){const chain:any={};chain.select=()=>({single:async()=>{const all=await get();const item={id:id(),created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...row};all.push(item);await write(name,all);return result(item)}});return chain;},
  update(patch:any){const chain:any={};chain.eq=(_field:string,value:any)=>({select:()=>({single:async()=>{const all=await get();const i=all.findIndex((x:any)=>x.id===value);if(i<0)return result(null,{message:'Ticket não encontrado.'});all[i]={...all[i],...patch};await write(name,all);return result(all[i])}})});return chain;}
 };
}

export const supabase={auth,from:table};
