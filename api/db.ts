import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { readDB, writeDB, currentUser, publicUser } from './_github';
const MASTER='quenidyyonline.17@gmail.com';
export const ROLES=['player','owner','staff','all','manager','admin_lider','admin_2','sublider','suporte','atendimento'];
export const ROLE_LABELS:any={player:'Player',owner:'Owner',staff:'Staff',all:'ALL',manager:'Manager','admin_lider':'Admin Líder','admin_2':'Admin 2',sublider:'Sublíder',suporte:'Suporte','atendimento':'Atendimento'};
export const PERMISSIONS:any={
 owner:['all'],staff:['all'],all:['all'],
 manager:['logs','audit','point','justification'],
 admin_lider:['logs','point','justification'],
 admin_2:['point','justification'],
 sublider:['point','justification'],
 suporte:['tickets','point','justification'],
 atendimento:['tickets','point','justification'],
 player:[]
};
const has=(u:any,p:string)=>!!u&&(u.email===MASTER||u.role==='owner'||u.role==='staff'||u.role==='all'||(PERMISSIONS[u.role]||[]).includes('all')||(PERMISSIONS[u.role]||[]).includes(p));
const staff=(u:any)=>has(u,'tickets');
const admin=(u:any)=>has(u,'roles');
const canManageRoles=(u:any)=>!!u&&(u.email===MASTER||['owner','staff','all'].includes(u.role));
export const roleLabel=(r:string)=>ROLE_LABELS[r]||r;
export default async function handler(req:VercelRequest,res:VercelResponse){try{const {db,sha}=await readDB();const u=currentUser(req,db);const table=String(req.query.table||'');const b:any=req.body||{};
if(req.method==='GET'){
 if(table==='stats')return res.json({count:db.users.length});
 if(table==='users'){if(!canManageRoles(u))return res.status(403).json({error:'Acesso negado'});return res.json({users:db.users.map(publicUser),count:db.users.length,roles:ROLES,roleLabels:ROLE_LABELS,permissions:PERMISSIONS});}
 if(table==='logs'){if(!has(u,'logs'))return res.status(403).json({error:'Acesso negado'});return res.json({logs:(db.logs||[]).slice(0,500)});
 }
 if(table==='notifications'){if(!u)return res.status(401).json({error:'Sessão inválida'});return res.json(db.notifications.filter(n=>n.user_id===u.id).sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,50));}
 if(table==='tickets'){if(!u)return res.status(401).json({error:'Sessão inválida'});return res.json((staff(u)?db.tickets:db.tickets.filter(t=>t.user_id===u.id)).sort((a,b)=>b.created_at.localeCompare(a.created_at)));}
}
if(table==='users'&&req.method==='PATCH'){if(!canManageRoles(u))return res.status(403).json({error:'Somente Owner, Staff ou ALL podem gerenciar cargos'});const t=db.users.find(x=>x.id===b.id);if(!t)return res.status(404).json({error:'Usuário não encontrado'});if(t.email===MASTER)return res.status(403).json({error:'Administrador principal protegido'});if(!ROLES.includes(b.role))return res.status(400).json({error:'Cargo inválido'});t.role=b.role;db.logs=db.logs||[];db.logs.unshift({id:crypto.randomUUID(),type:'role_change',email:u.email,display_name:u.display_name,target:t.email,role:b.role,role_label:roleLabel(b.role),created_at:new Date().toISOString()});await writeDB(db,sha,'admin: alterar cargo');return res.json({user:publicUser(t)});}
if(table==='notifications'&&req.method==='PATCH'){if(!u)return res.status(401).json({error:'Sessão inválida'});db.notifications.filter(n=>n.user_id===u.id).forEach(n=>n.read=true);await writeDB(db,sha,'site: ler notificações');return res.json({ok:true});}
if(table==='tickets'&&req.method==='POST'){if(!u)return res.status(401).json({error:'Sessão inválida'});const action=String(b.action||'create');let t=db.tickets.find(x=>x.id===b.id);
 if(action==='create'){t={id:crypto.randomUUID(),user_id:u.id,user_name:u.display_name,category:String(b.category||'Suporte'),subject:String(b.subject||'Ticket'),message:String(b.message||''),status:'open',assigned_to:null,replies:[],created_at:new Date().toISOString(),updated_at:new Date().toISOString()};db.tickets.push(t);}
 else{if(!t)return res.status(404).json({error:'Ticket não encontrado'});if(!staff(u))return res.status(403).json({error:'Somente Suporte ou Atendimento pode atender tickets');}if(action==='reply'){const now=new Date().toISOString();t.replies.push({id:crypto.randomUUID(),user_id:u.id,user_name:u.display_name,role:u.role,message:String(b.message||''),created_at:now});t.status='in_progress';t.assigned_to=u.id;t.updated_at=now;db.notifications.push({id:crypto.randomUUID(),user_id:t.user_id,type:'ticket_reply',title:'Ticket atendido',body:`${u.display_name} respondeu ao seu ticket.`,ticket_id:t.id,read:false,created_at:now});}if(action==='close'){const now=new Date().toISOString();t.status='closed';t.assigned_to=u.id;t.updated_at=now;db.notifications.push({id:crypto.randomUUID(),user_id:t.user_id,type:'ticket_closed',title:'Ticket fechado',body:`Seu ticket foi fechado por ${u.display_name}.`,ticket_id:t.id,read:false,created_at:now});}}
 await writeDB(db,sha,`site: ticket ${action}`);return res.json({ticket:t});}
return res.status(400).json({error:'Requisição inválida'});}catch(e:any){return res.status(500).json({error:e.message||'Erro interno'});}}
