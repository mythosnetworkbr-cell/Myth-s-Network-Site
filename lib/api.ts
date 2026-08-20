import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppRole='player'|'moderator'|'support'|'admin'|'developer';
export const MASTER_ADMIN_EMAIL='quenidyyonline.17@gmail.com';
export const APP_ROLES:AppRole[]=['player','moderator','support','admin','developer'];
const KEY='mythos_local_session';

type StoredSession={token:string;user:any};
async function getStored(){try{const raw=typeof window!=='undefined'?localStorage.getItem(KEY):await AsyncStorage.getItem(KEY);return raw?JSON.parse(raw):null}catch{return null}}
async function store(value:StoredSession|null){try{const raw=value?JSON.stringify(value):null;if(typeof window!=='undefined'){if(raw)localStorage.setItem(KEY,raw);else localStorage.removeItem(KEY)}else{if(raw)await AsyncStorage.setItem(KEY,raw);else await AsyncStorage.removeItem(KEY)}}catch{}}
async function api(path:string,init:RequestInit={}){const s=await getStored();const response=await fetch(path,{...init,headers:{'Content-Type':'application/json',...(s?.token?{Authorization:`Bearer ${s.token}`}:{})}});const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.error||'Erro no servidor');return data}

export const auth={
 async getSession(){const s=await getStored();if(!s)return{data:{session:null},error:null};try{const d=await api('/api/auth?action=me');if(!d.user){await store(null);return{data:{session:null},error:null}}return{data:{session:{access_token:s.token,user:d.user}},error:null}}catch{return{data:{session:null},error:null}}},
 async signInWithPassword({email,password}:{email:string;password:string}){try{const d=await api('/api/auth?action=login',{method:'POST',body:JSON.stringify({email,password})});await store({token:d.token,user:d.user});return{data:{session:{access_token:d.token,user:d.user}},error:null}}catch(e:any){return{data:{session:null},error:{message:e.message}}}},
 async signUp({email,password,options}:{email:string;password:string;options?:any}){try{const d=await api('/api/auth?action=signup',{method:'POST',body:JSON.stringify({email,password,displayName:options?.data?.display_name})});await store({token:d.token,user:d.user});return{data:{session:{access_token:d.token,user:d.user}},error:null}}catch(e:any){return{data:{session:null},error:{message:e.message}}}},
 async signOut(){await store(null);return{error:null}}
};

export function roleOf(u:any):AppRole{return String(u?.role||'player') as AppRole}
export function canManageRoles(u:any){return!!u&&(String(u.email||'').toLowerCase()===MASTER_ADMIN_EMAIL||roleOf(u)==='admin')}
export function canManageTickets(u:any){return!!u&&['admin','support'].includes(roleOf(u))}
export async function listUsers(){return(await api('/api/db?table=users')).users||[]}
export async function getUserCount(){return Number((await api('/api/db?table=stats')).count||0)}
export async function setUserRole(id:string,role:AppRole){try{await api('/api/db?table=users',{method:'PATCH',body:JSON.stringify({id,role})});return{error:null}}catch(e:any){return{error:{message:e.message}}}}
export async function setProfileAvatar(id:string,dataUrl:string|null,display_name?:string){try{const d=await api('/api/auth?action=profile',{method:'POST',body:JSON.stringify({avatar_url:dataUrl,display_name})});const s=await getStored();if(s){s.user=d.user;await store(s)}return{data:d.user,error:null}}catch(e:any){return{data:null,error:{message:e.message}}}}
export async function getNotifications(){return api('/api/db?table=notifications')}
export async function markAllNotificationsRead(){try{await api('/api/db?table=notifications',{method:'PATCH',body:'{}'});return{error:null}}catch(e:any){return{error:{message:e.message}}}}
export async function getTickets(){return api('/api/db?table=tickets')}
export async function createTicket(category:string,subject:string,message:string){return api('/api/db?table=tickets',{method:'POST',body:JSON.stringify({action:'create',category,subject,message})})}
export async function replyTicket(id:string,message:string){return api('/api/db?table=tickets',{method:'POST',body:JSON.stringify({action:'reply',id,message})})}
export async function closeTicket(id:string){return api('/api/db?table=tickets',{method:'POST',body:JSON.stringify({action:'close',id})})}
