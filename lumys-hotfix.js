const fs = require('node:fs');
const path = 'index.html';
if (fs.existsSync(path)) {
  let html = fs.readFileSync(path, 'utf8');
  const fixed = "function renderChips(){const genres=['Todos','Romance','Fantasia','Suspense','Ficção científica','Não ficção','Biografia','Infantojuvenil'];$('chips').innerHTML=genres.map((g,i)=>'<button class=\"chip '+(i===0?'active':'')+'\" data-genre=\"'+g+'\">'+g+'</button>').join('');document.querySelectorAll('.chip').forEach(btn=>btn.addEventListener('click',()=>filterGenre(btn.dataset.genre,btn)))}\n";
  html = html.replace(/function renderChips\(\)\{[\s\S]*?\nfunction filterGenre/, fixed + 'function filterGenre');
  fs.writeFileSync(path, html, 'utf8');
  console.log('LÜMYS hotfix: filtro de categorias corrigido.');
}
