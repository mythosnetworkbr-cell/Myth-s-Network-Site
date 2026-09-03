const fs=require('fs'),path=require('path');
const root=__dirname,out=path.join(root,'dist');
const script=`<script id="mythos-analytics">(function(){try{if(!sessionStorage.getItem('mythos_entry_recorded')){sessionStorage.setItem('mythos_entry_recorded','1');fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'site_entry',page:location.pathname})}).catch(function(){})}}catch(e){}})();</script>`;
for(const name of fs.readdirSync(out)){if(!name.endsWith('.html'))continue;const f=path.join(out,name);let h=fs.readFileSync(f,'utf8');if(!h.includes('mythos-analytics'))h=h.replace('</body>',script+'</body>');fs.writeFileSync(f,h)}
console.log('Analytics build: site entries are counted once per browser session.');
