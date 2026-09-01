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

// Remove a Loja do site público, mantendo o restante da página intacto.
const home = path.join(out, 'index.html');
if (fs.existsSync(home)) {
  let html = fs.readFileSync(home, 'utf8');
  html = html.replace(/<button class="action store"[\s\S]*?<\/button>/g, '');
  html = html.replace(/<article class="feature" onclick="goStore\(\)">[\s\S]*?<\/article>/g, '');
  html = html.replace(/<div id="store" class="supportCard">[\s\S]*?<\/div>\s*<\/div><\/section>/g, '</div></section>');
  html = html.replace(/<a href="#store" onclick="closeDrawer\(\)">LOJA<\/a>/g, '');
  html = html.replace(/<a href="#store"[^>]*>LOJA<\/a>/g, '');
  html = html.replace(/<a href="#store"[^>]*>[^<]*LOJA[^<]*<\/a>/g, '');
  html = html.replace(/<a class="[^\"]*"[^>]*onclick="goStore\(\)"[^>]*>[\s\S]*?<\/a>/g, '');
  html = html.replace(/\s*LOJA\s*\/\s*/g, ' / ');
  html = html.replace(/\n\s*<section id="store"[\s\S]*?<\/section>/g, '');
  fs.writeFileSync(home, html);
}

console.log('Production build created in dist/ with all static pages.');
