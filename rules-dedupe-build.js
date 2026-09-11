const fs=require('fs');
const path=require('path');
const dist=path.join(__dirname,'dist');
const file=path.join(dist,'regras.html');
if(!fs.existsSync(file))throw new Error('dist/regras.html não encontrado');
let html=fs.readFileSync(file,'utf8');
// Keep every canonical category. Police is only removed if it is a duplicate;
// the standalone police page is generated separately by police-build.js.
const links=[];
html=html.replace(/<a\b[^>]*href=["']\/regras-[^"']+["'][^>]*>[\s\S]*?<\/a>/gi,m=>{if(/pol[ií]cia/i.test(m))return '';links.push(m);return m});
html=html.replace(/\s+/g,' ').trim();
fs.writeFileSync(file,html+'\n');
// Never delete normal rule pages. Only remove an unmistakable duplicate Police page.
for(const name of fs.readdirSync(dist)){if(/^regras-\d+\.html$/i.test(name)){const p=path.join(dist,name);const s=fs.readFileSync(p,'utf8');if(/Regulamento Oficial|MYTHØS/i.test(s)&&/Regras de Pol[ií]cia|REGULAMENTO DA POL[IÍ]CIA|Regras da Pol[ií]cia/i.test(s)&&/POL[IÍ]CIA/i.test(s)){fs.unlinkSync(p);}}}
console.log('Rules dedupe: preserved all general categories and kept Police canonical standalone.');
