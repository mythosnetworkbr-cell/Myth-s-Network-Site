import type { VercelRequest,VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import {readDB,writeDB,currentUser,addLog} from './_github';

const APPROVERS=['owner','staff','all','manager'];
const STAFF=['owner','staff','all','manager','admin_lider','admin_2','sublider','suporte','admin','developer','admin_assistente','atendimento'];
const meta=(req:any)=>({ip:String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'desconhecido').split(',')[0].trim(),userAgent:String(req.headers['user-agent']||'').slice(0,300)});

export default async function handler(req:VercelRequest,res:VercelResponse){
  try{
    const {db,sha}=await readDB();
    db.candidates=db.candidates||[];
    const u=currentUser(req,db);
    if(!u||!STAFF.includes(String(u.role)))return res.status(403).json({error:'Sem permissão.'});
    if(req.method==='GET')return res.status(200).json({candidates:db.candidates});
    if(req.method!=='POST'&&req.method!=='PATCH')return res.status(405).json({error:'Método não permitido'});
    const b:any=req.body||{};

    if(req.method==='POST'){
      const candidato=String(b.candidato||'').trim();
      const nomeReal=String(b.nome_real||'').trim();
      const nomeJogo=String(b.nome_jogo||'').trim();
      if(!candidato||!nomeReal||!nomeJogo)return res.status(400).json({error:'Preencha candidato, nome real e nome em jogo.'});
      const c={id:crypto.randomUUID(),status:'pendente',created_at:new Date().toISOString(),created_by:u.email,created_by_name:u.display_name,...b,candidato,nome_real:nomeReal,nome_jogo:nomeJogo};
      db.candidates.unshift(c);
      addLog(db,{type:'candidate_create',email:u.email,display_name:u.display_name,role:u.role,candidate:c.candidato,...meta(req)});
      await writeDB(db,sha,`candidatos: novo candidato ${c.candidato}`);
      return res.status(201).json({candidate:c});
    }

    const id=String(b.id||'');
    const c=db.candidates.find((x:any)=>x.id===id);
    if(!c)return res.status(404).json({error:'Candidato não encontrado.'});
    if(!APPROVERS.includes(String(u.role)))return res.status(403).json({error:'Somente Owner, Staff, ALL ou Manager aprovam candidatos.'});
    const action=String(b.action||'');
    if(!['aprovar','rejeitar'].includes(action))return res.status(400).json({error:'Ação inválida.'});
    const note=String(b.note||'').trim().slice(0,1000);
    if(action==='rejeitar'&&!note)return res.status(400).json({error:'Informe a justificativa para rejeitar o candidato.'});
    c.status=action==='aprovar'?'aprovado':'rejeitado';
    c.reviewed_at=new Date().toISOString();
    c.reviewed_by=u.email;
    c.reviewed_by_name=u.display_name;
    c.review_note=note;
    addLog(db,{type:`candidate_${action}`,email:u.email,display_name:u.display_name,role:u.role,candidate:c.candidato,note,...meta(req)});
    await writeDB(db,sha,`candidatos: ${action} ${c.candidato}`);
    return res.status(200).json({candidate:c});
  }catch(e:any){return res.status(500).json({error:e.message||'Erro interno'});}
}
