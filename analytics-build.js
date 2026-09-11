const fs=require('fs'),path=require('path');
const root=__dirname,out=path.join(root,'dist');
// Analytics are intentionally read-only in production. Writing page-view events
// to data/database.json on every visit creates a Git commit and can trigger an
// unnecessary Vercel deployment loop. Existing analytics remain available to
// the admin panel; explicit administrative events can still use /api/analytics.
for(const name of fs.readdirSync(out)){if(!name.endsWith('.html'))continue;const f=path.join(out,name);let h=fs.readFileSync(f,'utf8');h=h.replace(/<script id="mythos-analytics">[\s\S]*?<\/script>/g,'');fs.writeFileSync(f,h)}
console.log('Analytics build: automatic page-entry writes disabled to keep production deployments stable.');
