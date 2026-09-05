const fs=require('fs');
const path=require('path');
const file=path.join(__dirname,'dist','index.html');
if(!fs.existsSync(file))throw new Error('dist/index.html não encontrado');
let html=fs.readFileSync(file,'utf8');
const fix=`<script id="mythos-video-url-fix">(()=>{function fixUrl(src){try{const u=new URL(src,location.origin);if(u.hostname.includes('youtube.com')&&u.pathname==='/watch'){const id=u.searchParams.get('v');if(id)return 'https://www.youtube.com/embed/'+encodeURIComponent(id)+'?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&modestbranding=1'}if(u.hostname==='youtu.be'){const id=u.pathname.replace(/^\\//,'');if(id)return 'https://www.youtube.com/embed/'+encodeURIComponent(id)+'?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&modestbranding=1'}return src}catch{return src}}function apply(){document.querySelectorAll('.videoBox iframe').forEach(f=>{const next=fixUrl(f.src);if(next&&next!==f.src)f.src=next})}new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});apply();setTimeout(apply,500);setTimeout(apply,1500);})();</script>`;
if(!html.includes('mythos-video-url-fix'))html=html.replace('</body>',fix+'</body>');
fs.writeFileSync(file,html);
console.log('Video URL normalization enabled.');
