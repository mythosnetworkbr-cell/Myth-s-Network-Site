const fs=require('fs');
const path=require('path');
require('./build');
const root=__dirname;
const rulesPath=path.join(root,'dist','regras.html');
const sourcePath=path.join(root,'src','data','mythos-rules.ts');
if(!fs.existsSync(rulesPath)||!fs.existsSync(sourcePath)) process.exit(0);
const source=fs.readFileSync(sourcePath,'utf8');
const match=source.match(/export const MYTHOS_RULES[^=]*=\s*(\[[\s\S]*?\]);/);
if(!match) process.exit(0);
let data;
try{data=Function('return '+match[1])();}catch(e){console.error('rules parse failed',e);process.exit(1)}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
const css=`<style>body{background:#050507;color:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.wrap{width:min(1100px,100%);margin:auto;padding:18px}.top{position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;padding:14px 0;background:#050507ee;border-bottom:1px solid #20202a}.logo{font-size:22px;font-weight:950}.grad{background:linear-gradient(90deg,#18d9ff,#a83cff,#ff18d0);-webkit-background-clip:text;color:transparent}.back{color:#20ddf5;text-decoration:none}.hero{padding:34px 0}.eyebrow{color:#16def4;font-size:10px;font-weight:900;letter-spacing:2px}.hero h1{font-size:clamp(40px,8vw,72px);margin:18px 0 10px}.hero p{color:#9895a1;line-height:1.7}.index{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.index a{padding:14px;border:1px solid #2b2935;border-radius:13px;background:#0c0c11;color:#ddd;text-decoration:none;font-weight:850;font-size:12px}.category{margin:32px 0 44px;scroll-margin-top:85px}.category h2{font-size:28px}.chapter{margin:18px 0;border:1px solid #282633;border-radius:16px;background:#0b0a10;overflow:hidden}.chapter h3{margin:0;padding:16px 18px;background:#101019;border-bottom:1px solid #252330;font-size:16px}.chapter ul{margin:0;padding:10px 18px 16px;list-style:none}.chapter li{padding:10px 0;border-bottom:1px solid #191820;color:#c8c6ce;font-size:13px;line-height:1.65;white-space:pre-line}.chapter li:last-child{border-bottom:0}.count{float:right;color:#16def4;font-size:10px}.footer{border-top:1px solid #1a1920;padding:30px 0 50px;color:#66636f;font-size:11px}@media(max-width:760px){.wrap{padding:12px}.index{grid-template-columns:1fr 1fr}}@media(max-width:420px){.index{grid-template-columns:1fr}}</style>`;
let out='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050507"><title>Mythøs • Central de Regras</title>'+css+'</head><body><main class="wrap"><header class="top"><div class="logo">REDE <span class="grad">MYTHØS</span></div><a class="back" href="/">← VOLTAR AO SITE</a></header><section class="hero"><span class="eyebrow">MYTHØS · REGULAMENTO OFICIAL</span><h1>Central de <span class="grad">Regras</span></h1><p>Regulamento oficial da comunidade, organizado em 13 seções e '+data.reduce((n,r)=>n+r.items.length,0)+' itens.</p></section><nav class="index">'+data.map((r,i)=>'<a href="#cat-'+i+'">'+esc(r.number+'. '+r.title)+'</a>').join('')+'</nav>';
for(let i=0;i<data.length;i++){const r=data[i];out+='<section class="category" id="cat-'+i+'"><h2>'+esc(r.number+'. '+r.title)+' <span class="count">'+r.items.length+' itens</span></h2><article class="chapter"><h3>Conteúdo integral da seção</h3><ul>'+r.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></article></section>';}
out+='<footer class="footer">MYTHØS NETWORK • Regulamento Oficial</footer></main></body></html>';
fs.writeFileSync(rulesPath,out);
console.log('Full rules generated:',data.length,'sections,',data.reduce((n,r)=>n+r.items.length,0),'items');
