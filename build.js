const fs = require('fs');
const path = require('path');
const root = __dirname;
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const staticExtensions = new Set(['.html','.css','.js','.json','.ico','.png','.jpg','.jpeg','.webp','.gif','.svg','.mp4','.webm','.txt','.xml','.webmanifest']);
for (const entry of fs.readdirSync(root,{withFileTypes:true})) if(entry.isFile()&&staticExtensions.has(path.extname(entry.name).toLowerCase())) fs.copyFileSync(path.join(root,entry.name),path.join(out,entry.name));
for (const dirName of ['public','assets','images','img']) { const source=path.join(root,dirName); if(fs.existsSync(source)&&fs.statSync(source).isDirectory()) fs.cpSync(source,path.join(out,dirName),{recursive:true}); }
if(fs.existsSync(path.join(root,'404.html'))) fs.copyFileSync(path.join(root,'404.html'),path.join(out,'404.html'));

// PUBLIC STORE REMOVAL + MOBILE-ONLY HOME + TWO MUTED AUTOPLAY VIDEOS.
const home=path.join(out,'index.html');
if(fs.existsSync(home)){
 let html=fs.readFileSync(home,'utf8');
 html=html.replace(/<button class="action store"[\s\S]*?<\/button>/gi,'');
 html=html.replace(/<article class="feature" onclick="goStore\(\)">[\s\S]*?<\/article>/gi,'');
 html=html.replace(/<div id="store" class="supportCard">[\s\S]*?<\/div>\s*<\/div><\/section>/gi,'</div></section>');
 html=html.replace(/<section id="store"[\s\S]*?<\/section>/gi,'');
 html=html.replace(/<a[^>]*href="#store"[^>]*>[\s\S]*?<\/a>/gi,'');
 html=html.replace(/<a[^>]*onclick="goStore\(\)"[^>]*>[\s\S]*?<\/a>/gi,'');
 html=html.replace(/Suporte e Loja/gi,'Suporte');
 html=html.replace(/ou à loja/gi,'');
 html=html.replace(/storeUrl\s*:\s*['"][^'"]*['"],?/gi,'');
 html=html.replace(/function\s+goStore\s*\([^)]*\)\s*\{[\s\S]*?\}/gi,'');
 html=html.replace(/\.action\.store\{[^}]*\}/gi,'');
 html=html.replace(/<[^>]*>[^<]*LOJA[^<]*<\/[^>]+>/gi,'');
 const mobileOnlyCss=`<style id="mythos-mobile-only">
html,body{width:100%;min-width:0!important;max-width:100%!important;overflow-x:hidden!important}
body{display:flex!important;justify-content:center!important;background:#020106!important}
.app{width:100%!important;max-width:480px!important;min-width:0!important;margin:0 auto!important;overflow:hidden!important;background:radial-gradient(circle at 75% 0,#40105b66,transparent 35%),#05020a!important}
.nav{height:68px!important;padding:0 16px!important;gap:10px!important}.links,.adminAccess{display:none!important}.navRight{margin-left:auto!important}.menuBtn{display:flex!important;align-items:center!important;justify-content:center!important;width:42px!important;height:42px!important}
.hero{min-height:760px!important;height:auto!important;padding:0 18px 42px!important;align-items:flex-end!important}.heroContent{width:100%!important;max-width:none!important;padding-top:100px!important}.hero h1{font-size:64px!important;line-height:.84!important;letter-spacing:-4px!important}.hero p{font-size:16px!important;line-height:1.55!important}
.actions{display:grid!important;grid-template-columns:1fr!important;width:100%!important;max-width:none!important;gap:10px!important}.action{width:100%!important;min-height:58px!important}.section{padding:34px 18px 6px!important}.sectionHead{display:block!important}.cards,.videoGrid,.supportGrid{display:grid!important;grid-template-columns:1fr!important;gap:12px!important}.feature{min-height:190px!important}.videoGrid{grid-template-columns:1fr!important}.videoBox{min-height:0!important;aspect-ratio:auto!important;display:grid!important;grid-template-columns:1fr!important;gap:12px!important}.videoBox iframe{width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:16/9!important;display:block!important}.videoInfo{padding:20px!important}.stats{grid-template-columns:1fr 1fr!important}.footer{padding:38px 18px!important}.drawerPanel{width:min(330px,88vw)!important}.drawer a{font-size:13px!important}.supportCard{padding:22px!important}.section h2{font-size:24px!important}@media(max-width:360px){.hero h1{font-size:56px!important}.stats{grid-template-columns:1fr!important}}
</style>`;
 html=html.replace('</head>',mobileOnlyCss+'</head>');
 const multiVideoScript=`<script id="mythos-two-videos">(function(){function normalizeVideo(url){if(!url)return '';try{const u=new URL(url,location.origin);u.searchParams.set('autoplay','1');u.searchParams.set('mute','1');u.searchParams.set('playsinline','1');u.searchParams.set('controls','1');u.searchParams.set('rel','0');u.searchParams.set('modestbranding','1');return u.toString()}catch{return url}}async function renderVideos(){try{const r=await fetch('/api/settings',{cache:'no-store'});if(!r.ok)return;const j=await r.json();const s=j.settings||{};const urls=Array.isArray(s.videoUrls)?s.videoUrls.filter(Boolean):[s.videoUrl].filter(Boolean);const box=document.querySelector('.videoBox');if(!box||urls.length<2)return;box.innerHTML='';urls.slice(0,2).forEach(function(url,i){const f=document.createElement('iframe');f.id=i===0?'videoFrame':'videoFrame'+(i+1);f.src=normalizeVideo(url);f.title='Mythøs Media '+(i+1);f.allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share';f.allowFullscreen=true;box.appendChild(f)})}catch(e){}}renderVideos()})();</script>`;
 html=html.replace('</body>',multiVideoScript+'</body>');
 fs.writeFileSync(home,html);
}

// OFFICIAL RULES: inject the exact Code Q supplied by the community.
const rulesPath=path.join(out,'regras.html');
if(fs.existsSync(rulesPath)){
 let rules=fs.readFileSync(rulesPath,'utf8');
 const codeQ=`<section class="category" id="cat-codigo"><h2>📻 Código Q</h2><p>O Código Q é o padrão de comunicação utilizado no rádio dos servidores. Aprenda os códigos abaixo para se comunicar com a equipe e demais jogadores.</p><article class="chapter"><h3>◆ Código Q Completo — 32 códigos</h3><ul><li><strong>QAP</strong> — Está na escuta?</li><li><strong>QSL</strong> — Entendido, acusado o recebimento da mensagem.</li><li><strong>QTH</strong> — Qual endereço, local, posição.</li><li><strong>QAR</strong> — Desligar.</li><li><strong>QRN</strong> — Está com interferência na comunicação?</li><li><strong>QRA</strong> — Qual nome do operador ou da estação (indicativo).</li><li><strong>QRL</strong> — Você está ocupado?</li><li><strong>QRM</strong> — Está sofrendo interferência humana?</li><li><strong>QRQ</strong> — Transmita mais depressa.</li><li><strong>QRS</strong> — Transmita mais devagar.</li><li><strong>QRT</strong> — Devo parar de transmitir? Fora do ar.</li><li><strong>QRU</strong> — Tens algo para mim?</li><li><strong>QRV</strong> — Está preparado? As suas ordens.</li><li><strong>QRX</strong> — Quando você vai me ligar de novo?</li><li><strong>QRZ</strong> — Quem está me chamando?</li><li><strong>QSA</strong> — Como está recebendo? Qual a força do sinal?</li><li><strong>QSM</strong> — Devo repetir a última mensagem?</li><li><strong>QSO</strong> — Comunicado, aviso.</li><li><strong>QSP</strong> — Fazer ponte. Pode transmitir para...</li><li><strong>QTC</strong> — Quantas mensagens para enviar? Tem mensagem para enviar?</li><li><strong>QTR</strong> — Qual o horário exato?</li><li><strong>QTU</strong> — Em qual horário irá operar?</li><li><strong>QTA</strong> — Devo cancelar a última mensagem?</li><li><strong>QSV</strong> — Viatura.</li><li><strong>QSD</strong> — Motorista.</li><li><strong>QSJ</strong> — Dinheiro, pagamento.</li><li><strong>TKS</strong> — Obrigado.</li><li><strong>QRB</strong> — Qual distância da estação. Qual sua distância.</li><li><strong>QSN</strong> — Escutou-me.</li><li><strong>QSR</strong> — Devo repetir.</li><li><strong>QTN</strong> — Que horas saiu.</li><li><strong>QUA</strong> — Você tem notícias de...</li></ul></article><article class="chapter"><h3>◆ Código Q Mais Usados — 17 códigos</h3><ul><li><strong>QAP</strong> — Na escuta</li><li><strong>QSL</strong> — Entendido</li><li><strong>TKS</strong> — Obrigado</li><li><strong>QAR</strong> — Desligar</li><li><strong>QRL</strong> — Estou ocupado</li><li><strong>QTH</strong> — Endereço</li><li><strong>QRX</strong> — Aguarde</li><li><strong>UM</strong> — Primeiro</li><li><strong>DOIS</strong> — Segundo</li><li><strong>TRÊS</strong> — Terceiro</li><li><strong>QUATRO</strong> — Quarto</li><li><strong>CINCO</strong> — Quinto</li><li><strong>SEIS</strong> — Sexto</li><li><strong>SETE</strong> — Sétimo</li><li><strong>OITO</strong> — Oitavo</li><li><strong>NOVE</strong> — Nono</li><li><strong>ZERO</strong> — Nulo / Negativo</li></ul></article></section>`;
 rules=rules.replace(/<section class="category" id="cat-codigo">[\s\S]*?<\/section><section class="category" id="cat-alfabeto">/i,codeQ+'<section class="category" id="cat-alfabeto">');
 fs.writeFileSync(rulesPath,rules);
}

console.log('Production build: mobile-only Mythos public site, public store removed, two muted autoplay videos, official Code Q applied.');
