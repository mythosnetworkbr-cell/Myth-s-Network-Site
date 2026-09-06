const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'dist');
const PUBLIC_PAGES = ['index.html','tickets.html','regras.html','regras-policia.html','videos.html'];
function injectPublicMeta(file){
  if(!fs.existsSync(file))return;
  let html=fs.readFileSync(file,'utf8');
  if(!html.includes('name="mythos-public-access"'))html=html.replace('</head>','<meta name="mythos-public-access" content="true"></head>');
  if(!html.includes('id="mythos-public-access"'))html=html.replace('</body>','<script id="mythos-public-access">(()=>{document.documentElement.dataset.mythosPublicAccess="true";})();</script></body>');
  if(path.basename(file)==='index.html')html=html.replace(/Sem login obrigatório\. Escolha o que você precisa\./g,'Site público para consulta. Para abrir um ticket é necessário entrar ou criar uma conta Mythøs.');
  fs.writeFileSync(file,html);
}
for(const page of PUBLIC_PAGES)injectPublicMeta(path.join(root,page));
if(fs.existsSync(root))for(const name of fs.readdirSync(root))if(/^regras-\d+\.html$/i.test(name))injectPublicMeta(path.join(root,name));
console.log('Public access enabled: home, ticket page, rules and videos remain viewable without login; ticket creation is account-protected.');
