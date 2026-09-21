const fs = require('node:fs');
const path = require('node:path');

const roots = [process.cwd(), path.join(process.cwd(), 'dist'), path.join(process.cwd(), 'public')];
const seen = new Set();

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.vercel'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const neonCss = `
<style id="lumys-neon-theme">
:root{
  --bg:#050507!important;
  --panel:#0b0b10!important;
  --panel2:#101017!important;
  --line:#27202f!important;
  --text:#f8f8fb!important;
  --muted:#aaa7b5!important;
  --gold:#ff1744!important;
  --gold2:#ff3159!important;
  --violet:#9d4edd!important;
  --rose:#9d4edd!important;
  --green:#00ff88!important;
  --neon-red:#ff1744;
  --neon-green:#00ff88;
  --neon-purple:#9d4edd;
  --shadow:0 24px 80px #000b!important;
}
body{
  background:
    radial-gradient(circle at 8% 8%,#ff17443b,transparent 27%),
    radial-gradient(circle at 92% 18%,#9d4edd3b,transparent 30%),
    radial-gradient(circle at 55% 95%,#00ff8820,transparent 30%),
    #050507!important;
}
body:before{
  opacity:.13!important;
  background-image:linear-gradient(#9d4edd 1px,transparent 1px),linear-gradient(90deg,#00ff88 1px,transparent 1px)!important;
}
.topbar{background:#050507e8!important;border-bottom-color:#9d4edd55!important;box-shadow:0 0 28px #9d4edd18}
.brand i,.price{color:#00ff88!important;text-shadow:0 0 14px #00ff8888}
.hero{border-bottom-color:#ff174433!important}
.hero:after{background:linear-gradient(transparent,#050507)!important}
.orb.a{background:radial-gradient(circle,#9d4edd99,transparent 68%)!important}
.orb.b{background:radial-gradient(circle,#ff174466,transparent 67%)!important}
.heroContent .eyebrow{border-color:#00ff8866!important;background:#00ff8810!important;color:#00ff88!important;box-shadow:0 0 22px #00ff8818}
.hero h1 em{color:#ff1744!important;text-shadow:0 0 24px #ff174488}
.btn.primary,.navbtn.gold{background:linear-gradient(135deg,#9d4edd,#ff1744 55%,#00ff88)!important;color:#fff!important;border-color:#ffffff55!important;box-shadow:0 0 22px #9d4edd55,0 0 42px #ff174422!important}
.btn.violet{background:linear-gradient(135deg,#9d4edd,#ff1744)!important;border-color:#c47dff!important;box-shadow:0 0 24px #9d4edd55!important}
.btn:hover,.navbtn:hover{box-shadow:0 0 22px #00ff8840,0 0 36px #9d4edd30!important}
.search input:focus,.field input:focus,.field textarea:focus,.field select:focus{border-color:#00ff88!important;box-shadow:0 0 0 3px #00ff8818,0 0 18px #00ff8822!important}
.chip.active,.chip:hover{border-color:#9d4edd!important;background:#9d4edd18!important;box-shadow:0 0 16px #9d4edd24!important}
.cover.c1{background:linear-gradient(145deg,#5b248c,#17091e)!important}
.cover.c2{background:linear-gradient(145deg,#8f1233,#18070d)!important}
.cover.c3{background:linear-gradient(145deg,#08754e,#06140e)!important}
.cover.c4{background:linear-gradient(145deg,#7c1632,#16070d)!important}
.cover.c5{background:linear-gradient(145deg,#54228a,#0e0716)!important}
.cover.c6{background:linear-gradient(145deg,#08734b,#06140d)!important}
.book:hover .cover{box-shadow:0 26px 45px #000b,0 0 24px #9d4edd35!important}
.featurePanel,.libraryCard,.authorCta,.modalBox{border-color:#9d4edd44!important;box-shadow:0 0 28px #9d4edd12,0 24px 70px #0008!important}
.featureItem{border-color:#00ff8830!important}
.progress i{background:linear-gradient(90deg,#9d4edd,#ff1744,#00ff88)!important;box-shadow:0 0 12px #00ff8877}
.footer{border-top-color:#9d4edd33!important}
.bottom{background:#08080d!important;border-color:#9d4edd44!important}
.modal{background:#000d!important}
.notice{border-color:#ff174455!important;background:#ff17440d!important;color:#ff91a4!important}
</style>`;

for (const root of roots) {
  for (const file of walk(root)) {
    const real = fs.realpathSync(file);
    if (seen.has(real)) continue;
    seen.add(real);
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('LÜMYS')) continue;
    html = html.replace(/<style id="lumys-neon-theme">[\\s\\S]*?<\\/style>/g, '');
    if (html.includes('</head>')) html = html.replace('</head>', `${neonCss}</head>`);
    else html = neonCss + html;
    fs.writeFileSync(file, html);
    console.log(`LÜMYS neon theme applied: ${file}`);
  }
}
