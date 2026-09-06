const fs=require('fs'),path=require('path');
const dist=path.join(__dirname,'dist');
const required=['index.html','regras.html','admin.html','regras-policia.html'];
if(!fs.existsSync(dist))throw new Error('dist não existe após o build');
for(const file of required){const f=path.join(dist,file);if(!fs.existsSync(f))throw new Error(`arquivo obrigatório ausente: dist/${file}`);const s=fs.readFileSync(f,'utf8');if(!s.trim())throw new Error(`arquivo vazio: dist/${file}`);if(!/<html[\s>]/i.test(s))throw new Error(`HTML inválido: dist/${file}`);if(!/<\/html>/i.test(s))throw new Error(`HTML incompleto: dist/${file}`)}
const html=fs.readdirSync(dist).filter(x=>x.endsWith('.html'));
for(const file of html){const s=fs.readFileSync(path.join(dist,file),'utf8');if(/<<<<<<<|=======|>>>>>>>/.test(s))throw new Error(`marcador de merge em dist/${file}`);if(!/mythos-modern-system/.test(s))throw new Error(`sistema visual ausente em dist/${file}`)}
console.log(`Mythøs build verification OK — ${html.length} páginas HTML verificadas.`);
