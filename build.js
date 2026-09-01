const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, 'index.html');
const out = path.join(__dirname, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(src, path.join(out, 'index.html'));
console.log('Production build created in dist/');
