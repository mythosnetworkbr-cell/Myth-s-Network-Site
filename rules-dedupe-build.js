const fs=require('fs');
const path=require('path');
const dist=path.join(__dirname,'dist');
const file=path.join(dist,'regras.html');
if(!fs.existsSync(file))throw new Error('dist/regras.html não encontrado');
const html=fs.readFileSync(file,'utf8');
const cards=[...html.matchAll(/<a\b[^>]*href=["']\/regras-(\d+)\.html["'][^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>/gi)].map(m=>({n:Number(m[1]),title:m[2].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim()}));
const seen=new Set();
for(const c of cards){const k=c.title.toLocaleLowerCase('pt-BR');if(seen.has(k))throw new Error('Categoria duplicada na Central de Regras: '+c.title);seen.add(k)}
for(let i=1;i<=cards.length;i++){if(!fs.existsSync(path.join(dist,'regras-'+i+'.html')))throw new Error('Página de regra ausente: regras-'+i+'.html')}
console.log('Rules dedupe: Central já consolidada pelo full-build; '+cards.length+' categorias únicas e numeradas. Nenhuma categoria foi removida.');
