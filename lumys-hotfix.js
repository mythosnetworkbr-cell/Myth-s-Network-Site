const fs = require('node:fs');
const path = 'index.html';
if (fs.existsSync(path)) {
  let html = fs.readFileSync(path, 'utf8');
  html = html.replace(
    'onclick="filterGenre(\'\'+g+\'\',this)"',
    'onclick="filterGenre(\\\'\'+g+\'\\\',this)"'
  );
  fs.writeFileSync(path, html, 'utf8');
  console.log('LÜMYS hotfix: filtro de categorias corrigido.');
}
