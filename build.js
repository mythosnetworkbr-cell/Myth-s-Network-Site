const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'dist');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Publica todas as páginas HTML da raiz. Antes o build copiava somente
// index.html, fazendo /suporte, /tickets, /admin, /perfil, /regras e 404
// desaparecerem do diretório de saída e retornarem NOT_FOUND na Vercel.
const staticExtensions = new Set([
  '.html', '.css', '.js', '.json', '.ico', '.png', '.jpg', '.jpeg',
  '.webp', '.gif', '.svg', '.mp4', '.webm', '.txt', '.xml', '.webmanifest'
]);

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && staticExtensions.has(path.extname(entry.name).toLowerCase())) {
    fs.copyFileSync(path.join(root, entry.name), path.join(out, entry.name));
  }
}

// Mantém diretórios de assets estáticos, quando existirem.
for (const dirName of ['public', 'assets', 'images', 'img']) {
  const source = path.join(root, dirName);
  if (fs.existsSync(source) && fs.statSync(source).isDirectory()) {
    fs.cpSync(source, path.join(out, dirName), { recursive: true });
  }
}

// Garante que o fallback estático da Vercel esteja presente.
if (fs.existsSync(path.join(root, '404.html'))) {
  fs.copyFileSync(path.join(root, '404.html'), path.join(out, '404.html'));
}

console.log('Production build created in dist/ with all static pages.');
