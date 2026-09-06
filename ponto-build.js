const fs=require('fs');
const path=require('path');
const f=path.join(__dirname,'dist','admin.html');
if(!fs.existsSync(f))throw new Error('dist/admin.html não encontrado');
let h=fs.readFileSync(f,'utf8');

const css=`<style id="mythos-ponto-style">
.pointBox{border:1px solid #3a1d4b;border-radius:16px;background:#0d0712;padding:16px;margin:10px 0}.pointStatus{font-size:26px;font-weight:950;margin:8px 0}.pointOpen{color:#4fffd0}.pointClosed{color:#ff769f}.pointGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.pointTable{width:100%;border-collapse:collapse;font-size:11px}.pointTable th,.pointTable td{padding:9px;border-bottom:1px solid #2b2033;text-align:left}.approve{display:flex;gap:7px;flex-wrap:wrap}.pending{color:#ffd36b}.approved{color:#4fffd0}.rejected{color:#ff769f}.pointError{padding:12px;border:1px solid #5b2940;border-radius:10px;background:#180a12;color:#ff9dbb;font-size:12px}@media(max-width:600px){.pointGrid{grid-template-columns:1fr}.pointTable{display:block;overflow:auto}}
</style>`;

const js=`<script id="mythos-ponto-script">(()=>{
const A=['owner','staff','all','manager','admin_lider','admin_2','sublider','admin','developer'];
const P=[...A,'suporte','admin_assistente','atendimento'];
const auth=()=>({Authorization:'Bearer '+localStorage.getItem('mythos_admin_token'),'Content-Type':'application/json'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getRole=()=>String(window.__role||window.__mythosRole||'');
async function load(){
 try{
  const r=await fetch('/api/ponto',{headers:auth(),cache:'no-store'});
  const j=await r.json().catch(()=>({error:'Resposta inválida do servidor.'}));
  if(!r.ok)throw new Error(j.error||'Erro ao carregar o cartão ponto.');
  const current=document.getElementById('pointCurrent');
  if(current)current.innerHTML=j.current
   ? '<div class="pointStatus pointOpen">PONTO ABERTO</div><div>Início: '+esc(j.current.opened_at)+' · Brasília</div><button class="btn" onclick=\'pointAction("close")\'>FECHAR PONTO</button>'
   : '<div class="pointStatus pointClosed">PONTO FECHADO</div><div>Abra seu ponto para registrar entrada e saída.</div><button class="btn" onclick=\'pointAction("open")\'>ABRIR PONTO</button>';
  const entries=document.getElementById('pointEntries');
  if(entries)entries.innerHTML='<table class="pointTable"><tr><th>Colaborador</th><th>Entrada</th><th>Saída</th><th>Horas</th></tr>'+((j.entries||[]).map(x=>'<tr><td>'+esc(x.name)+'<br><small>'+esc(x.role)+'</small></td><td>'+esc(x.opened_at)+'</td><td>'+esc(x.closed_at||'Aberto')+'</td><td>'+Number(x.hours||0).toFixed(2)+'</td></tr>').join('')||'<tr><td colspan="4">Nenhum registro.</td></tr>')+'</table>';
  const just=document.getElementById('pointJust');
  if(just){const oldDate=document.getElementById('justDate')?.value||'';const oldReason=document.getElementById('justReason')?.value||'';just.innerHTML='<div class="field"><label>DATA</label><input id="justDate" type="date" value="'+esc(oldDate)+'"></div><div class="field"><label>MOTIVO</label><textarea id="justReason" placeholder="Motivo da justificativa">'+esc(oldReason)+'</textarea></div><button class="btn" onclick="pointJustify()">ENVIAR JUSTIFICATIVA</button>'+((j.justifications||[]).map(x=>'<div class="pointBox"><b>'+esc(x.name)+'</b> · '+esc(x.date)+'<br>'+esc(x.reason)+'<br><span class="'+esc(x.status)+'">'+esc(x.status)+'</span>'+(x.reviewed_by?' · '+esc(x.reviewed_by.name):'')+(A.includes(getRole())&&x.status==='pending'?'<div class="approve"><button class="btn" onclick=\'reviewJust("'+esc(x.id)+'","approved")\'>APROVAR</button><button class="btn alt" onclick=\'reviewJust("'+esc(x.id)+'","rejected")\'>RECUSAR</button></div>':'')+'</div>').join('')||'<div class="muted">Nenhuma justificativa.</div>')}}
  if(A.includes(getRole()))await loadReport();
 }catch(e){const msg=esc(e.message||e);['pointCurrent','pointEntries','pointJust','pointReport'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<div class="pointError">Falha ao carregar o cartão ponto: '+msg+'</div>'})}
}
async function post(b){const r=await fetch('/api/ponto',{method:'POST',headers:auth(),body:JSON.stringify(b)});const j=await r.json().catch(()=>({error:'Resposta inválida do servidor.'}));if(!r.ok)throw new Error(j.error||'Erro');return j}
window.pointAction=async a=>{try{await post({action:a});await load()}catch(e){alert(e.message)}};
window.pointJustify=async()=>{try{const date=document.getElementById('justDate')?.value||'';const reason=document.getElementById('justReason')?.value||'';await post({action:'justify',date,reason});await load()}catch(e){alert(e.message)}};
window.reviewJust=async(id,status)=>{try{await post({action:'review',id,status});await load()}catch(e){alert(e.message)}};
async function loadReport(){try{const j=await post({action:'report'});const el=document.getElementById('pointReport');if(el)el.innerHTML='<b>Relatório geral</b><br>'+Number(j.totalHours||0).toFixed(2)+' horas · '+Number(j.entries||0)+' registros<br>'+Object.entries(j.byRole||{}).map(([k,v])=>esc(k)+': '+Number(v||0).toFixed(2)+'h').join(' · ')}catch(e){const el=document.getElementById('pointReport');if(el)el.innerHTML='<div class="pointError">Falha no relatório: '+esc(e.message||e)+'</div>'}}
const oldShow=window.show;
window.show=async()=>{await oldShow();try{const m=await fetch('/api/auth?action=me',{headers:auth(),cache:'no-store'}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||'Sessão inválida.');return j});const r=m.user?.role||'player';window.__role=r;window.__mythosRole=r;if(P.includes(r))await load()}catch(e){console.error('Ponto:',e)}};
const oldTab=window.tab;
window.tab=function(id,el){oldTab(id,el);if(id==='point')setTimeout(load,50)};
})();</script>`;

if(!h.includes('mythos-ponto-style'))h=h.replace('</head>',css+'</head>');
const pointPanel='<section id="point" class="panel"><div class="box"><h2>CARTÃO PONTO</h2><div class="muted">Horário padrão de Brasília — America/Sao_Paulo.</div><div id="pointCurrent" class="pointBox">Carregando...</div><div class="pointGrid"><div class="pointBox"><h3>LOGS DOS PONTOS</h3><div id="pointEntries">Carregando...</div></div><div class="pointBox"><h3>JUSTIFICATIVAS</h3><div class="muted">Data + Motivo. Um responsável poderá aprovar ou recusar.</div><div id="pointJust">Carregando...</div></div></div><div class="pointBox"><h3>RELATÓRIOS DE PONTO</h3><div id="pointReport">Relatórios para liderança, Manager, ALL, Staff e Owner.</div></div></div></section>';
h=h.replace(/<section id="point" class="panel">[\s\S]*?<\/section>/,pointPanel);
if(!h.includes('mythos-ponto-script'))h=h.replace('</body>',js+'</body>');
fs.writeFileSync(f,h);
console.log('Ponto panel generated.');
