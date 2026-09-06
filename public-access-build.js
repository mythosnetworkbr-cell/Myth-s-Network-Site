const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist');
const PUBLIC_PAGES = ['index.html','tickets.html','regras.html','regras-policia.html','videos.html'];

function injectPublicMeta(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('name="mythos-public-access"')) {
    html = html.replace('</head>', '<meta name="mythos-public-access" content="true"></head>');
  }
  if (!html.includes('id="mythos-public-access"')) {
    const script = '<script id="mythos-public-access">(()=>{document.documentElement.dataset.mythosPublicAccess="true";})();</script>';
    html = html.replace('</body>', script + '</body>');
  }
  fs.writeFileSync(file, html);
}

for (const page of PUBLIC_PAGES) injectPublicMeta(path.join(root, page));
if (fs.existsSync(root)) {
  for (const name of fs.readdirSync(root)) {
    if (/^regras-\d+\.html$/i.test(name)) injectPublicMeta(path.join(root, name));
  }
}

console.log('Public access enabled: home, tickets, rules, videos and generated rule pages require no site login.');
