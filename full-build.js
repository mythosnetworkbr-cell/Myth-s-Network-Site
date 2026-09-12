const fs=require('fs');
const path=require('path');
require('./build');
const root=__dirname;
const dist=path.join(root,'dist');
const sourcePath=path.join(root,'src','data','mythos-rules.ts');
const hospitalPath=path.join(root,'src','data','hospital-rules.ts');
const policePath=path.join(root,'src','data','police-rules.ts');
const additionalPath=path.join(root,'src','data','additional-rules.js');
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function parseArray(file,name){
  if(!fs.existsSync(file))return[];
  const s=fs.readFileSync(file,'utf8');
  const m=s.match(new RegExp('export const '+name+'[^=]*=\\s*(\\[[\\s\\S]*?\\]);'));
  if(!m)return[];
  try{return Function('return '+m[1])()}catch(e){console.warn(name,e.message);return[]}
}
function parseObject(file,name){
  if(!fs.existsSync(file))return null;
  const s=fs.readFileSync(file,'utf8');
  const m=s.match(new RegExp('export const '+name+'[^=]*=\\s*(\\{[\\s\\S]*?\\});'));
  if(!m)return null;
  try{return Function('return '+m[1])()}catch(e){console.warn(name,e.message);return null}
}
function normalizeSection(r){
  return {number:String(r?.number||''),title:String(r?.title||'').trim(),items:Array.isArray(r?.items)?r.items.map(x=>String(x||'').trim()).filter(Boolean):[]};
}
function dedupe(data){
  const out=[];const titles=new Set();
  for(const raw of data){const r=normalizeSection(raw);if(!r.title||!r.items.length)continue;const key=r.title.toLocaleLowerCase('pt-BR').replace(/[^a-z0-9áéíóúãõçàâêôü ]/gi,'').replace(/\\s+/g,' ').trim();
    if(titles.has(key)){const old=out.find(x=>x._key===key);if(old){const seen=new Set(old.items.map(x=>x.toLocaleLowerCase('pt-BR')));for(const item of r.items){const k=item.toLocaleLowerCase('pt-BR');if(!seen.has(k)){old.items.push(item);seen.add(k)}}}continue;}
    titles.add(key);r._key=key;out.push(r);
  }
  return out.map(r=>{delete r._key;const seen=new Set();r.items=r.items.filter(x=>{const k=x.toLocaleLowerCase('pt-BR').replace(/\\s+/g,' ').trim();if(seen.has(k))return false;seen.add(k);return true});return r});
}
function loadRules(){
  const local=parseArray(sourcePath,'MYTHOS_RULES');
  const extra=fs.existsSync(additionalPath)?(require(additionalPath).ADDITIONAL_RULES||[]):[];
  const hospital=parseObject(hospitalPath,'HOSPITAL_RULES');
  const police=parseObject(policePath,'POLICE_RULES');
  const all=[...local,...extra];
  if(hospital)all.push(hospital);
  if(police)all.push(police);
  const rules=dedupe(all);
  // A numeração exibida é sequencial e independente de números antigos/duplicados.
  rules.forEach((r,i)=>{r.number=String(i+1);r.items=r.items.map((item,j)=>{
    const m=item.match(/^\\d+(?:\\.\\d+)?\\s+(.+)$/s);
    return m?String(i+1)+'.'+String(j+1)+' '+m[1].trim():String(i+1)+'.'+String(j+1)+' '+item;
  })});
  return rules;
}
const css=`<style>*{box-sizing:border-box}html{background:#050507;scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 50% -10%,#21102f 0,#0a0810 38%,#050507 80%);color:#f7f5fb;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh}.wrap{width:min(1120px,100%);margin:auto;padding:18px}.top{position:sticky;top:0;z-index:30;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 0;background:#050507e8;backdrop-filter:blur(18px);border-bottom:1px solid #2c2535}.logo{font-size:20px;font-weight:950;letter-spacing:.5px}.grad{background:linear-gradient(90deg,#18d9ff,#a83cff,#ff18d0);-webkit-background-clip:text;background-clip:text;color:transparent}.back{color:#20ddf5;text-decoration:none;font-size:11px;font-weight:900}.hero{padding:58px 0 28px}.eyebrow{color:#18d9ff;font-size:10px;font-weight:900;letter-spacing:2.5px}.hero h1{font-size:clamp(38px,7vw,76px);line-height:.95;margin:16px 0 14px;letter-spacing:-2px}.hero p{max-width:760px;color:#a39dac;line-height:1.7;margin:0}.stats{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.pill{border:1px solid #342b3e;background:#0c0911;border-radius:999px;padding:8px 11px;color:#aaa3b2;font-size:10px;font-weight:800}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:13px}.card{position:relative;display:block;padding:21px;border:1px solid #352b40;border-radius:18px;background:linear-gradient(145deg,#110d17,#09070c);color:#fff;text-decoration:none;overflow:hidden;transition:.2s transform,.2s border-color,.2s box-shadow}.card:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,#18d9ff0d,#a83cff12,#ff18d00d);pointer-events:none}.card:hover{transform:translateY(-4px);border-color:#6b4a82;box-shadow:0 18px 50px #0008}.num{color:#18d9ff;font-size:10px;font-weight:950;letter-spacing:1px}.card strong{display:block;font-size:15px;margin-top:8px;line-height:1.3}.card span{display:block;color:#817a8b;font-size:11px;margin-top:8px}.embed{position:relative;margin:12px 0;padding:18px 20px 19px 23px;border:1px solid #30283a;border-radius:14px;background:linear-gradient(180deg,#0e0b13,#09070c);box-shadow:0 10px 30px #0005;overflow:hidden}.embed:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#18d9ff,#a83cff,#ff18d0)}.item{font-size:10px;color:#8f899b;font-weight:950;letter-spacing:1px;margin-bottom:8px}.text{font-size:13px;line-height:1.8;color:#dedbe4;white-space:pre-line;overflow-wrap:anywhere}.footer{border-top:1px solid #1c1921;margin-top:40px;padding:28px 0 60px;color:#65616d;font-size:11px}@media(max-width:600px){.wrap{padding:12px}.hero{padding:40px 0 22px}.grid{grid-template-columns:1fr}.card{padding:18px}.embed{padding:16px 15px 17px 19px}.text{font-size:12.5px}}
</style>`;
function shell(title,body){return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050507"><title>'+esc(title)+'</title>'+css+'</head><body><main class="wrap">'+body+'</main></body></html>'}
const rules=loadRules();
let index='<header class="top"><div class="logo">REDE <span class="grad">MYTHØS</span></div><a class="back" href="/">← INÍCIO</a></header><section class="hero"><span class="eyebrow">MYTHØS NETWORK · REGULAMENTO OFICIAL</span><h1>Central de <span class="grad">Regras</span></h1><p>Regulamento organizado por categorias, sem duplicatas e com numeração sequencial. Abra qualquer seção para consultar o conteúdo completo em formato de embed.</p><div class="stats"><span class="pill">'+rules.length+' categorias</span><span class="pill">'+rules.reduce((n,r)=>n+r.items.length,0)+' itens</span><span class="pill">100% organizado</span></div></section><section class="grid">';
rules.forEach((r,i)=>{const n=i+1;index+='<a class="card" href="/regras-'+n+'.html"><div class="num">REGRA '+String(n).padStart(2,'0')+'</div><strong>'+esc(r.title)+'</strong><span>'+r.items.length+' itens · Abrir categoria →</span></a>'});
index+='</section><footer class="footer">MYTHØS NETWORK • Regulamento Oficial</footer>';
fs.writeFileSync(path.join(dist,'regras.html'),shell('Mythøs • Central de Regras',index));
for(const [i,r] of rules.entries()){
  const items=r.items.map((x,j)=>'<article class="embed"><div class="item">ITEM '+String(j+1).padStart(3,'0')+' · '+String(r.number)+'.'+String(j+1)+'</div><div class="text">'+esc(x)+'</div></article>').join('');
  const body='<header class="top"><div class="logo">REDE <span class="grad">MYTHØS</span></div><a class="back" href="/regras.html">← CENTRAL</a></header><section class="hero"><span class="eyebrow">MYTHØS · REGULAMENTO OFICIAL</span><h1>'+esc(r.number+'. '+r.title)+'</h1><p>'+r.items.length+' itens · seção completa, numerada e sem duplicações.</p></section><section>'+items+'</section><footer class="footer"><a class="back" href="/regras.html">← Voltar para a Central</a></footer>';
  fs.writeFileSync(path.join(dist,'regras-'+(i+1)+'.html'),shell('Mythøs • '+r.title,body));
}
console.log('Full build: regras consolidadas, duplicatas removidas, numeração sequencial e novo layout da Central aplicado.');
