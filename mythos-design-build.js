const fs=require('fs'),path=require('path');
const out=path.join(__dirname,'dist');
if(!fs.existsSync(out))throw new Error('dist não encontrado');
const files=fs.readdirSync(out).filter(x=>x.endsWith('.html'));
const css=`<style id="mythos-modern-system">
:root{--mx-bg:#050507;--mx-panel:#0d0d12;--mx-panel2:#111119;--mx-line:#262630;--mx-text:#f8f7fb;--mx-muted:#9998a6;--mx-purple:#b85cff;--mx-cyan:#22d3ee;--mx-pink:#ff4fa3;--mx-radius:16px}
html{scroll-behavior:smooth}body{background:var(--mx-bg)!important;color:var(--mx-text)!important}body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:9999;background:radial-gradient(circle at 15% 0,#8b3dff12,transparent 30%),radial-gradient(circle at 85% 10%,#22d3ee0d,transparent 28%)}
button,.btn,.action,.chip,.tab{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease!important}button:hover,.btn:hover,.action:hover,.chip:hover,.tab:hover{transform:translateY(-2px)}
.btn,.action,.primary{box-shadow:0 0 0 1px #ffffff12,0 0 24px #b85cff18}.btn:hover,.action:hover,.primary:hover{box-shadow:0 0 0 1px #b85cff66,0 0 28px #b85cff35,0 8px 25px #0008}.secondary{box-shadow:inset 0 0 0 1px #ffffff12,0 0 20px #22d3ee0c}.secondary:hover{border-color:#22d3ee55!important;box-shadow:0 0 24px #22d3ee22}
.box,.card,.feature,.videoBox,.supportCard,.stat,.adminCard,.pointBox,.candidateCard{border-color:var(--mx-line)!important;background:linear-gradient(145deg,#12121aee,#0b0b10ee)!important;box-shadow:0 18px 55px #0006, inset 0 1px #ffffff08!important}
.card:hover,.feature:hover,.videoBox:hover,.supportCard:hover{border-color:#b85cff55!important;box-shadow:0 18px 55px #0008,0 0 28px #b85cff16!important}
input,textarea,select{background:#08080c!important;border-color:#2f2f3b!important;color:#fff!important}input:focus,textarea:focus,select:focus{outline:none!important;border-color:#b85cff88!important;box-shadow:0 0 0 3px #b85cff16,0 0 18px #b85cff18!important}
.nav{border-bottom:1px solid #ffffff08}.logo{filter:drop-shadow(0 0 15px #b85cff22)}.eyebrow{ text-shadow:0 0 18px #b85cff55}.footer{border-top-color:#ffffff0c!important}
@media(max-width:700px){.box,.card,.feature,.videoBox,.supportCard,.stat{border-radius:14px!important}.section{padding-left:20px!important;padding-right:20px!important}.hero{padding-left:20px!important;padding-right:20px!important}.nav{padding-left:18px!important;padding-right:18px!important}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
</style>`;
for(const name of files){const f=path.join(out,name);let h=fs.readFileSync(f,'utf8');if(!h.includes('mythos-modern-system'))h=h.replace('</head>',css+'</head>');fs.writeFileSync(f,h)}
console.log(`Modern Mythøs design applied to ${files.length} HTML files.`);
