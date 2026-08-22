import crypto from 'node:crypto';
const REPO=process.env.GITHUB_REPO||'mythosnetworkbr-cell/Myth-s-Network-Site';
const TOKEN=process.env.GITHUB_TOKEN||'';
const DB_PATH='data/database.json';
function auth(){if(!TOKEN)throw new Error('GITHUB_TOKEN não configurado na Vercel.');return{Authorization:`Bearer ${TOKEN}`,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'};}
export type DB={users:any[];tickets:any[];notifications:any[]};
export async function readDB():Promise<{db:DB;sha:string}>{const r=await fetch(`https://api.github.com/repos/${REPO}/contents/${DB_PATH}`,{headers:auth()});if(!r.ok)throw new Error(`GitHub database read failed: ${r.status}`);const j:any=await r.json();const raw=Buffer.from(j.content.replace(/\n/g,''),'base64').toString('utf8');return{db:JSON.parse(raw),sha:j.sha};}
export async function writeDB(db:DB,sha:string,message:string){const content=Buffer.from(JSON.stringify(db,null,2)+'\n').toString('base64');const r=await fetch(`https://api.github.com/repos/${REPO}/contents/${DB_PATH}`,{method:'PUT',headers:auth(),body:JSON.stringify({message,content,sha,branch:'main'})});if(!r.ok)throw new Error(`GitHub database write failed: ${r.status}`);return r.json();}
const secret=()=>process.env.SESSION_SECRET||'change-this-in-vercel';
const b64=(s:string)=>Buffer.from(s).toString('base64url');
export function signSession(userId:string){const p=b64(JSON.stringify({sub:userId,exp:Date.now()+2592000000}));const sig=crypto.createHmac('sha256',secret()).update(p).digest('base64url');return`${p}.${sig}`;}
export function verifySession(token:string){try{const[p,s]=token.split('.');const good=crypto.createHmac('sha256',secret()).update(p).digest('base64url');if(!s||s.length!==good.length||s!==good)return null;const d=JSON.parse(Buffer.from(p,'base64url').toString());return d.exp>Date.now()?d.sub:null;}catch{return null;}}
export function passwordHash(password:string,salt=crypto.randomBytes(16).toString('hex')){return{hash:crypto.scryptSync(password,salt,64).toString('hex'),salt};}
export function passwordOk(password:string,hash:string,salt:string){return crypto.scryptSync(password,salt,64).toString('hex')===hash;}
export function currentUser(req:any,db:DB){const h=String(req.headers.authorization||'');const id=verifySession(h.replace(/^Bearer\s+/i,''));return id?db.users.find(u=>u.id===id)||null:null;}
export function publicUser(u:any){const{passwordHash:_,passwordSalt:__,...safe}=u;return safe;}
