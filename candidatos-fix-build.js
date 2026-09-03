const fs=require('fs');
const path=require('path');
const file=path.join(__dirname,'dist','admin.html');
if(fs.existsSync(file)){
  let html=fs.readFileSync(file,'utf8');
  html=html.replace(/\\\\'/g,"'");
  fs.writeFileSync(file,html);
  console.log('Candidate action handlers normalized.');
}
