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
const home=path.join(out,'index.html');
if(fs.existsSync(home)){
 let html=fs.readFileSync(home,'utf8');
 // PUBLIC STORE REMOVAL: no public store button/card/section/text/function/config.
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
 // MOBILE ONLY: the public home is a phone canvas at every viewport size.
 const mobileOnlyCss=`<style id="mythos-mobile-only">
html,body{width:100%;min-width:0!important;max-width:100%!important;overflow-x:hidden!important}
body{display:flex!important;justify-content:center!important;background:#020106!important}
.app{width:100%!important;max-width:480px!important;min-width:0!important;margin:0 auto!important;overflow:hidden!important;background:radial-gradient(circle at 75% 0,#40105b66,transparent 35%),#05020a!important}
.nav{height:68px!important;padding:0 16px!important;gap:10px!important}.links,.adminAccess{display:none!important}.navRight{margin-left:auto!important}.menuBtn{display:flex!important;align-items:center!important;justify-content:center!important;width:42px!important;height:42px!important}
.hero{min-height:760px!important;height:auto!important;padding:0 18px 42px!important;align-items:flex-end!important}.heroContent{width:100%!important;max-width:none!important;padding-top:100px!important}.hero h1{font-size:64px!important;line-height:.84!important;letter-spacing:-4px!important}.hero p{font-size:16px!important;line-height:1.55!important}
.actions{display:grid!important;grid-template-columns:1fr!important;width:100%!important;max-width:none!important;gap:10px!important}.action{width:100%!important;min-height:58px!important}.section{padding:34px 18px 6px!important}.sectionHead{display:block!important}.cards,.videoGrid,.supportGrid{display:grid!important;grid-template-columns:1fr!important;gap:12px!important}.feature{min-height:190px!important}
.videoGrid{grid-template-columns:1fr!important}.videoBox{min-height:0!important;aspect-ratio:auto!important;display:grid!important;grid-template-columns:1fr!important;gap:12px!important}.videoBox iframe{width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:16/9!important;display:block!important}.videoInfo{padding:20px!important}.stats{grid-template-columns:1fr 1fr!important}.footer{padding:38px 18px!important}.drawerPanel{width:min(330px,88vw)!important}.drawer a{font-size:13px!important}.supportCard{padding:22px!important}.section h2{font-size:24px!important}@media(max-width:360px){.hero h1{font-size:56px!important}.stats{grid-template-columns:1fr!important}}
</style>`;
 html=html.replace('</head>',mobileOnlyCss+'</head>');
 // TWO VIDEOS: render the two configured videos, muted and with autoplay parameters.
 const multiVideoScript=`<script id="mythos-two-videos">(function(){function normalizeVideo(url){if(!url)return '';try{const u=new URL(url,location.origin);u.searchParams.set('autoplay','1');u.searchParams.set('mute','1');u.searchParams.set('playsinline','1');u.searchParams.set('controls','1');u.searchParams.set('rel','0');u.searchParams.set('modestbranding','1');return u.toString()}catch{return url}}async function renderVideos(){try{const r=await fetch('/api/settings',{cache:'no-store'});if(!r.ok)return;const j=await r.json();const s=j.settings||{};const urls=Array.isArray(s.videoUrls)?s.videoUrls.filter(Boolean):[s.videoUrl].filter(Boolean);const box=document.querySelector('.videoBox');if(!box||urls.length<2)return;box.innerHTML='';urls.slice(0,2).forEach(function(url,i){const f=document.createElement('iframe');f.id=i===0?'videoFrame':'videoFrame'+(i+1);f.src=normalizeVideo(url);f.title='Mythøs Media '+(i+1);f.allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share';f.allowFullscreen=true;box.appendChild(f)})}catch(e){}}renderVideos()})();</script>`;
 html=html.replace('</body>',multiVideoScript+'</body>');
 fs.writeFileSync(home,html);
}
console.log('Production build: mobile-only Mythos public site, public store removed, two muted autoplay videos.');
