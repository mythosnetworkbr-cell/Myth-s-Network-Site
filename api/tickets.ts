import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { readDB, writeDB, currentUser } from './_github';

const CATEGORIES=['Reclamação contra Jogadores','Entender Punição','Reclamação contra Orgs','Reclamação Técnica','Marcar Ação','Solicitar Ajuda','Seja Influência','Candidato a Administração'];
const clean=(v:any,max=4000)=>String(v??'').trim().slice(0,max);
const safeTicket=(t:any)=>({id:t.id,code:t.code,category:t.category,subject:t.subject,name:t.name,status:t.status,created_at:t.created_at,updated_at:t.updated_at,messages:(t.messages||[]).map((m:any)=>({id:m.id,author:m.author,body:m.body,staff:!!m.staff,created_at:m.created_at}))});
const makeCode=()=>`MYT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

export default async function handler(req:VercelRequest,res:VercelResponse){
  try{
    const {db,sha}=await readDB();
    db.tickets=db.tickets||[];
    if(req.method==='GET'){
      const code=clean(req.query.code,40).toUpperCase();
      if(code){const t=db.tickets.find((x:any)=>x.code===code);if(!t)return res.status(404).json({error:'Ticket não encontrado.'});return res.status(200).json({ticket:safeTicket(t)});}
      const u=currentUser(req,db); if(!u||u.role!=='admin')return res.status(403).json({error:'Acesso restrito ao administrador.'});
      return res.status(200).json({tickets:db.tickets.map(safeTicket).sort((a:any,b:any)=>String(b.updated_at).localeCompare(String(a.updated_at)))});
    }
    if(req.method!=='POST')return res.status(405).json({error:'Método não permitido'});
    const b:any=req.body||{}; const action=clean(b.action,20);
    if(action==='create'){
      const category=clean(b.category,80),name=clean(b.name,80),subject=clean(b.subject,160),body=clean(b.body,4000);
      if(!CATEGORIES.includes(category)||!name||!subject||!body)return res.status(400).json({error:'Preencha nome, categoria, assunto e mensagem.'});
      let code=makeCode(); while(db.tickets.some((x:any)=>x.code===code))code=makeCode();
      const now=new Date().toISOString(); const t={id:crypto.randomUUID(),code,category,name,subject,status:'open',created_at:now,updated_at:now,messages:[{id:crypto.randomUUID(),author:name,body,staff:false,created_at:now}]};
      db.tickets.push(t); await writeDB(db,sha,`suporte: abrir ticket ${code}`); return res.status(201).json({ticket:safeTicket(t)});
    }
    if(action==='reply'){
      const code=clean(b.code,40).toUpperCase(),body=clean(b.body,4000),u=currentUser(req,db); const t=db.tickets.find((x:any)=>x.code===code);
      if(!t)return res.status(404).json({error:'Ticket não encontrado.'}); if(!body)return res.status(400).json({error:'Mensagem vazia.'});
      const isStaff=!!u&&u.role==='admin'; if(t.status==='closed'&&!isStaff)return res.status(400).json({error:'Este ticket está encerrado.'});
      const now=new Date().toISOString(); t.messages=t.messages||[]; t.messages.push({id:crypto.randomUUID(),author:isStaff?(u.display_name||u.username):t.name,body,staff:isStaff,created_at:now}); t.status=isStaff?'waiting_user':'open'; t.updated_at=now;
      await writeDB(db,sha,`suporte: responder ticket ${code}`); return res.status(200).json({ticket:safeTicket(t)});
    }
    if(action==='close'||action==='reopen'){
      const u=currentUser(req,db); if(!u||u.role!=='admin')return res.status(403).json({error:'Acesso restrito ao administrador.'}); const code=clean(b.code,40).toUpperCase(),t=db.tickets.find((x:any)=>x.code===code); if(!t)return res.status(404).json({error:'Ticket não encontrado.'}); t.status=action==='close'?'closed':'open';t.updated_at=new Date().toISOString();await writeDB(db,sha,`admin: ${action} ticket ${code}`);return res.status(200).json({ticket:safeTicket(t)});
    }
    return res.status(400).json({error:'Ação inválida.'});
  }catch(e:any){return res.status(500).json({error:e.message||'Erro interno'});}
}
