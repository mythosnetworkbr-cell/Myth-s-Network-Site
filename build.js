const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'dist');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const staticExtensions = new Set([
  '.html', '.css', '.js', '.json', '.ico', '.png', '.jpg', '.jpeg',
  '.webp', '.gif', '.svg', '.mp4', '.webm', '.txt', '.xml', '.webmanifest'
]);

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && staticExtensions.has(path.extname(entry.name).toLowerCase())) {
    fs.copyFileSync(path.join(root, entry.name), path.join(out, entry.name));
  }
}

for (const dirName of ['public', 'assets', 'images', 'img']) {
  const source = path.join(root, dirName);
  if (fs.existsSync(source) && fs.statSync(source).isDirectory()) {
    fs.cpSync(source, path.join(out, dirName), { recursive: true });
  }
}

if (fs.existsSync(path.join(root, '404.html'))) {
  fs.copyFileSync(path.join(root, '404.html'), path.join(out, '404.html'));
}

const home = path.join(out, 'index.html');
if (fs.existsSync(home)) {
  let html = fs.readFileSync(home, 'utf8');

  // Remove completamente a Loja Mythos da Home pública.
  html = html.replace(/<button class="action store"[\s\S]*?<\/button>/g, '');
  html = html.replace(/<article class="feature" onclick="goStore\(\)">[\s\S]*?<\/article>/g, '');
  html = html.replace(/<div id="store" class="supportCard">[\s\S]*?<\/div>\s*<\/div><\/section>/g, '</div></section>');
  html = html.replace(/<section id="store"[\s\S]*?<\/section>/g, '');
  html = html.replace(/<a[^>]*href="#store"[^>]*>[\s\S]*?<\/a>/g, '');
  html = html.replace(/<a[^>]*onclick="goStore\(\)"[^>]*>[\s\S]*?<\/a>/g, '');
  html = html.replace(/\s*LOJA\s*\/\s*/gi, ' / ');
  html = html.replace(/Suporte e Loja/gi, 'Suporte');
  html = html.replace(/goStore\s*=\s*[^;]+;?/g, '');
  html = html.replace(/function goStore\([^)]*\)\s*\{[\s\S]*?\}/g, '');

  // Home exclusivamente mobile: em qualquer viewport a página mantém o canvas de telefone.
  const mobileOnlyCss = `<style id="mythos-mobile-only">\nhtml,body{width:100%;min-width:0!important;max-width:100%!important;overflow-x:hidden!important}body{display:flex!important;justify-content:center!important;background:#020106!important}.app{width:100%!important;max-width:480px!important;min-width:0!important;margin:0 auto!important;overflow:hidden!important;background:radial-gradient(circle at 75% 0,#40105b66,transparent 35%),#05020a!important}.nav{height:68px!important;padding:0 16px!important;gap:10px!important}.links,.adminAccess{display:none!important}.navRight{margin-left:auto!important}.menuBtn{display:flex!important;align-items:center!important;justify-content:center!important;width:42px!important;height:42px!important}.hero{min-height:760px!important;height:auto!important;padding:0 18px 42px!important;align-items:flex-end!important}.heroContent{width:100%!important;max-width:none!important;padding-top:100px!important}.hero h1{font-size:64px!important;line-height:.84!important;letter-spacing:-4px!important}.hero p{font-size:16px!important;line-height:1.55!important}.actions{display:grid!important;grid-template-columns:1fr!important;width:100%!important;max-width:none!important;gap:10px!important}.action{width:100%!important;min-height:58px!important}.section{padding:34px 18px 6px!important}.sectionHead{display:block!important}.cards,.videoGrid,.supportGrid{display:grid!important;grid-template-columns:1fr!important;gap:12px!important}.feature{min-height:190px!important}.videoGrid{grid-template-columns:1fr!important}.videoBox{min-height:0!important;aspect-ratio:16/9!important}.videoBox iframe{width:100%!important;height:100%!important;min-height:0!important;aspect-ratio:16/9!important;display:block!important}.videoInfo{padding:20px!important}.stats{grid-template-columns:1fr 1fr!important}.footer{padding:38px 18px!important}.drawerPanel{width:min(330px,88vw)!important}.drawer a{font-size:13px!important}.supportCard{padding:22px!important}.section h2{font-size:24px!important}@media(max-width:360px){.hero h1{font-size:56px!important}.stats{grid-template-columns:1fr!important}}\n</style>`;
  html = html.replace('</head>', mobileOnlyCss + '</head>');

  // Exibe os dois vídeos configurados pela API, sempre sem áudio e com autoplay.
  const multiVideoScript = `<script id="mythos-two-videos">\n(function(){\n  function normalizeVideo(url){\n    if(!url)return '';\n    try{\n      const u=new URL(url,location.origin);\n      u.searchParams.set('autoplay','1');\n      u.searchParams.set('mute','1');\n      u.searchParams.set('playsinline','1');\n      u.searchParams.set('controls','1');\n      u.searchParams.set('rel','0');\n      u.searchParams.set('modestbranding','1');\n      return u.toString();\n    }catch{return url}\n  }\n  async function renderVideos(){\n    try{\n      const r=await fetch('/api/settings',{cache:'no-store'});\n      if(!r.ok)return;\n      const j=await r.json();\n      const settings=j.settings||{};\n      const urls=Array.isArray(settings.videoUrls)?settings.videoUrls.filter(Boolean):[settings.videoUrl].filter(Boolean);\n      const box=document.querySelector('.videoBox');\n      if(!box||urls.length<2)return;\n      box.innerHTML='';\n      urls.slice(0,2).forEach(function(url,i){\n        const iframe=document.createElement('iframe');\n        iframe.id=i===0?'videoFrame':'videoFrame'+(i+1);\n        iframe.src=normalizeVideo(url);\n        iframe.title='Mythøs Media '+(i+1);\n        iframe.allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share';\n        iframe.allowFullscreen=true;\n        box.appendChild(iframe);\n      });\n      box.style.display='grid';\n      box.style.gridTemplateColumns='1fr';\n      box.style.gap='12px';\n      box.style.aspectRatio='auto';\n    }catch(e){}\n  }\n  renderVideos();\n})();\n</script>`;
  html = html.replace('</body>', multiVideoScript + '</body>');

  fs.writeFileSync(home, html);
}

console.log('Production build created in dist/ as mobile-only Mythos public site, with no public store and two videos.');
