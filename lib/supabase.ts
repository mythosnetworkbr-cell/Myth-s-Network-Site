import AsyncStorage from '@react-native-async-storage/async-storage';
export type AppRole='player'|'moderator'|'support'|'admin'|'developer';
export const MASTER_ADMIN_EMAIL='quenidyyonline.17@gmail.com';
export const APP_ROLES:AppRole[]=['player','moderator','support','admin','developer'];
type S={token:string;user:any};const KEY='mythos_local_session';
async function get(){try{const x=typeof window!=='undefined'?localStorage.getItem(KEY):await AsyncStorage.getItem(KEY);return x?JSON.parse(x):null}catch{return null}}
async function put(s:S|null){try{const x=s?JSON.stringify(s):null;if(typeof window!=='undefined'){if(x)localStorage.setItem(KEY,x);else localStorage.removeItem(KEY)}else{if(x)await AsyncStorage.setItem(KEY,x);else await AsyncStorage.removeItem(KEY)}}catch{}}
async function api(path:string,init:RequestInit={}){const s=await get();const r=await fetch(path,{...init,headers:{'Content-Type':'application/json',...(s?.token?{Authorization:`Bearer ${s.token}`}:{})}});const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.error||'Erro no servidor');return d}
export const supabase={auth:{async getSession(){const s=await get();if(!s)return{data:{session:null},error:null};try{const d=await api('/api/auth?action=me');if(!d.user){await put(null);return{data:{session:null},error:null}}return{data:{session:{access_token:s.token,user:d.user}},error:null}}catch{return{data:{session:null},error:null}}},onAuthStateChange(cb:any){return{data:{subscription:{unsubscribe(){}}}}},async signInWithPassword({email,password}:{email:string;password:string}){try{const d=await api('/api/auth?action=login',{method:'POST',body:JSON.stringify({email,password})});await put({token:d.token,user:d.user});return{data:{session:{access_token:d.token,user:d.user}},error:null}}catch(e:any){return{data:{session:null},error:{message:e.message}}}},async signUp({email,password,options}:{email:string;password:string;options?:any}){try{const d=await api('/api/auth?action=signup',{method:'POST',body:JSON.stringify({email,password,displayName:options?.data?.display_name})});await put({token:d.token,user:d.user});return{data:{session:{access_token:d.token,user:d.user},user:d.user},error:null}}catch(e:any){return{data:{session:null,user:null},error:{message:e.message}}}},async signOut(){await put(null);return{error:null}}}};
export function roleOf(u:any):AppRole{return String(u?.role||u?.app_metadata?.role||'player') as AppRole}
export function canManageRoles(u:any){return!!u&&(String(u.email||'').toLowerCase()===MASTER_ADMIN_EMAIL||roleOf(u)==='admin')}
export function canManageTickets(u:any){return!!u&&['admin','support'].includes(roleOf(u))}
export async function listUsers(){return(await api('/api/db?table=users')).users||[]}
export async function getUserCount(){return Number((await api('/api/db?table=users')).count||0)}
export async function setUserRole(id:string,role:AppRole){try{await api('/api/db?table=users',{method:'PATCH',body:JSON.stringify({id,role})});return{data:true,error:null}}catch(e:any){return{error:{message:e.message}}}}
export async function getProfileAvatar(id:string){const s=await get();return s?.user?.id===id?s.user.avatar_url:null}
export async function setProfileAvatar(id:string,dataUrl:string|null){try{const d=await api('/api/auth?action=profile',{method:'POST',body:JSON.stringify({avatar_url:dataUrl})});const s=await get();if(s){s.user=d.user;await put(s)}return{data:dataUrl,error:null}}catch(e:any){return{data:null,error:{message:e.message}}}}
export async function getNotifications(){return api('/api/db?table=notifications')}
export async function markNotificationRead(_id:string){return{error:null}}
export async function markAllNotificationsRead(){try{await api('/api/db?table=notifications',{method:'PATCH',body:'{}'});return{error:null}}catch(e:any){return{error:{message:e.message}}}}
export async function currentSessionUser(){const s=await get();return s?.user||null}
export async function getTickets(){return api('/api/db?table=tickets')}
export async function createTicket(category:string,subject:string,message:string){return api('/api/db?table=tickets',{method:'POST',body:JSON.stringify({action:'create',category,subject,message})})}
export async function replyTicket(id:string,message:string){return api('/api/db?table=tickets',{method:'POST',body:JSON.stringify({action:'reply',id,message})})}
export async function closeTicket(id:string){return api('/api/db?table=tickets',{method:'POST',body:JSON.stringify({action:'close',id})})}
