const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;
const root = path.join(__dirname, 'dist');
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = pathname === '/' ? path.join(root, 'index.html') : path.join(root, pathname.replace(/^\/+/, ''));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    return res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}).end('Not Found');
  }
  const ext = path.extname(file);
  const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
  res.writeHead(200, {'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'});
  fs.createReadStream(file).pipe(res);
});
server.listen(port, () => console.log(`Mythøs Network listening on ${port}`));
