const fs=require('fs');
const path=require('path');
const dist=path.join(__dirname,'dist');
const file=path.join(dist,'regras.html');
if(!fs.existsSync(file))throw new Error('dist/regras.html não encontrado');
let html=fs.readFileSync(file,'utf8');
// The canonical Police regulation has its own page. Remove the short duplicate
// generated inside the general Bible index and its numbered detail page.
html=html.replace(/<a\b[^>]*href=["']\/regras-[^"']+["'][^>]*>[\s\S]*?<\/a>/gi,m=>/pol[ií]cia/i.test(m)?'':'');
html=html.replace(/\s+/g,' ').trim();
fs.writeFileSync(file,html+'\n');
for(const name of fs.readdirSync(dist)){if(/^regras-\d+\.html$/i.test(name)){const p=path.join(dist,name);const s=fs.readFileSync(p,'utf8');if(/Regras de Pol[ií]cia|REGULAMENTO DA POL[IÍ]CIA|Regras da Pol[ií]cia/i.test(s)){fs.unlinkSync(p);}}}
console.log('Rules dedupe: removed duplicate Police index/detail page.');
