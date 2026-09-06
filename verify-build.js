const fs=require('fs'),path=require('path');
const dist=path.join(__dirname,'dist');
const required=['index.html','regras.html','admin.html','tickets.html','regras-policia.html','videos.html'];
if(!fs.existsSync(dist))throw new Error('dist não existe após o build');
for(const file of required){const f=path.join(dist,file);if(!fs.existsSync(f))throw new Error(`arquivo obrigatório ausente: dist/${file}`);const s=fs.readFileSync(f,'utf8');if(!s.trim())throw new Error(`arquivo vazio: dist/${file}`);if(!/<html[\s>]/i.test(s))throw new Error(`HTML inválido: dist/${file}`);if(!/<\/html>/i.test(s))throw new Error(`HTML incompleto: dist/${file}`)}
const html=fs.readdirSync(dist).filter(x=>x.endsWith('.html'));
for(const file of html){const s=fs.readFileSync(path.join(dist,file),'utf8');if(/<<<<<<<|=======|>>>>>>>/.test(s))throw new Error(`marcador de merge em dist/${file}`);if(!/mythos-modern-system/.test(s))throw new Error(`sistema visual ausente em dist/${file}`)}
const ticket=fs.readFileSync(path.join(dist,'tickets.html'),'utf8');if(!/ticketAuthGate|mythos-ticket-auth-fix/.test(ticket))throw new Error('proteção de conta ausente em dist/tickets.html');
const police=fs.readFileSync(path.join(__dirname,'src/data/police-rules.ts'),'utf8');const policeItems=(police.match(/^\s*'/gm)||[]).length;if(policeItems<25)throw new Error(`regulamento da polícia incompleto: ${policeItems} itens`);
const policeHtml=fs.readFileSync(path.join(dist,'regras-policia.html'),'utf8');if(!new RegExp(`const RULES=\\[`).test(policeHtml))throw new Error('Polícia não está embutida como fallback estático');
console.log(`Mythøs build verification OK — ${html.length} páginas HTML verificadas, vídeos disponíveis, suporte protegido e Polícia com ${policeItems} itens.`);
