import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readDB, writeDB, currentUser, addLog } from './_github';

const STAFF = new Set(['admin','developer','owner','staff','all','manager','admin_lider']);
const meta = (req:any) => ({
  ip: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconhecido').split(',')[0].trim(),
  userAgent: String(req.headers['user-agent'] || '').slice(0,300)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { db, sha } = await readDB();
    if (req.method === 'POST') {
      const b:any = req.body || {};
      const type = String(b.type || 'site_entry');
      if (!['site_entry','site_click'].includes(type)) return res.status(400).json({error:'Evento inválido.'});
      addLog(db, { type, page:String(b.page||'/').slice(0,120), target:String(b.target||'').slice(0,120), ...meta(req) });
      await writeDB(db, sha, `analytics: ${type}`);
      return res.status(204).end();
    }
    if (req.method !== 'GET') return res.status(405).json({error:'Método não permitido'});
    const u = currentUser(req, db);
    if (!u || !STAFF.has(String(u.role))) return res.status(403).json({error:'Sem permissão.'});
    const logs = Array.isArray(db.logs) ? db.logs : [];
    const entries = logs.filter(x => x.type === 'site_entry');
    const clicks = logs.filter(x => x.type === 'site_click');
    const logins = logs.filter(x => x.type === 'login');
    const signups = logs.filter(x => x.type === 'signup');
    const byDay = (items:any[]) => items.reduce((a,x)=>{const d=String(x.created_at||'').slice(0,10);if(d)a[d]=(a[d]||0)+1;return a;},{} as Record<string,number>);
    return res.status(200).json({
      totals:{entries:entries.length, clicks:clicks.length, logins:logins.length, signups:signups.length},
      byDay:{entries:byDay(entries),logins:byDay(logins)},
      recent:logs.filter(x=>['site_entry','site_click','login','signup'].includes(x.type)).slice(0,100)
    });
  } catch(e:any) { return res.status(500).json({error:e.message||'Erro interno'}); }
}
