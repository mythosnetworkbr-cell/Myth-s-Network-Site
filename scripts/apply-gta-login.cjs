const fs = require('fs');

const file = 'App.web.tsx';
let s = fs.readFileSync(file, 'utf8');

// The two production servers are the only selectable cities.
s = s.replace(/const CITIES=\[[^\]]*\];/, "const CITIES=['Lex City RP','Nyx Roleplay'];");

// Keep the existing application logic and replace only the visual layer of the auth screen.
const gtaCss = `
/* GTA / SA-MP inspired login — original Mythøs Network visual treatment */
.auth{position:relative;display:flex;flex-direction:column;justify-content:flex-start;overflow:hidden;background:#111 url('${'${BG}'}') center/cover fixed}
.auth:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#0004 0%,#0009 45%,#05050bf2 100%);pointer-events:none}
.auth:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 18%,#ffcf0060,transparent 18%),linear-gradient(90deg,#00a8ff10,#0000 25%,#0000 75%,#ff174410);pointer-events:none}
.authBrand{position:relative;z-index:2;padding:42px 18px 145px;text-align:center;font-family:Impact,Haettenschweiler,'Arial Narrow Bold',sans-serif;font-size:clamp(52px,18vw,92px);line-height:.82;letter-spacing:2px;text-transform:uppercase;color:#f5f1df;-webkit-text-stroke:2px #161616;text-shadow:4px 4px 0 #111,0 10px 28px #000,0 0 24px #ffd40055;transform:skew(-3deg)}
.authBrand:after{content:'MYTHØS NETWORK';display:block;margin-top:16px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;color:#fff;text-shadow:0 2px 5px #000;transform:skew(3deg)}
.authBox{position:relative;z-index:3;margin:-106px 14px 0;padding:22px 18px 20px;border:2px solid #d8b14a;border-radius:8px;background:linear-gradient(180deg,#171812f2,#07080af7);box-shadow:0 12px 55px #000,0 0 0 1px #000,inset 0 1px #fff2}
.authBox:before{content:'';position:absolute;left:10px;right:10px;top:8px;height:2px;background:linear-gradient(90deg,transparent,#ffd84a,transparent);opacity:.7}
.authBox h1{font-family:Impact,Haettenschweiler,'Arial Narrow Bold',sans-serif;text-transform:uppercase;letter-spacing:1px;font-size:31px;margin:6px 0;color:#f4f0dc;text-shadow:2px 2px #000}
.authBox p{color:#c3c3b8}
.cityBox{border:1px solid #81743f;border-radius:6px;padding:13px;background:#11130ff2;box-shadow:inset 0 0 20px #000;margin:14px 0 18px}
.cityBox b{font-family:Impact,Haettenschweiler,'Arial Narrow Bold',sans-serif;letter-spacing:1px;color:#ffd84a}
.citySelect{width:100%;padding:14px;border-radius:5px;background:#050607;color:#f3f1df;border:1px solid #73653b;outline:none;font-weight:900}
.cityBadge{display:block;width:max-content;margin-top:8px;padding:5px 8px;border-radius:3px;border:1px solid #d8b14a;color:#ffd84a;background:#0008}
.field{color:#c9c7b8;letter-spacing:1px}
.field input{border-radius:5px;background:#050607;border:1px solid #5e5a49;color:#fff}
.field input:focus{border-color:#ffd84a;box-shadow:0 0 0 2px #ffd84a22}
.primary{border-radius:5px;background:linear-gradient(180deg,#e4bd52,#9d6f1d);border:1px solid #f6d879;color:#17130a;box-shadow:0 3px 0 #5b3d0d,0 8px 22px #000;font-family:Impact,Haettenschweiler,'Arial Narrow Bold',sans-serif;letter-spacing:1.5px}
.switch,.forgot{color:#aaa99f}.switch b,.forgot{color:#ffd84a}.authBox .eyebrow{color:#ffd84a;letter-spacing:2px}
.auth .error{border-radius:5px;background:#4a100fcc;border-color:#d14a4a;color:#ffd0d0}
.gtaCopyright{position:relative;z-index:3;text-align:center;margin:20px 14px 0;color:#aaa;font-size:10px;letter-spacing:1.5px;text-transform:uppercase}.gtaCopyright b{color:#ffd84a}
@media(max-width:380px){.authBrand{padding-top:34px;font-size:58px}.authBox{margin-top:-92px}}
`;

// Inject the override before the existing CSS template closes.
if (!s.includes('/* GTA / SA-MP inspired login')) {
  const marker = '\n`;';
  if (!s.includes(marker)) throw new Error('CSS template not found in App.web.tsx');
  s = s.replace(marker, '\n' + gtaCss + marker);
}

const newAuth = `if(!session)return <div className="app auth"><div className="authBrand">{city}</div><div className="authBox"><div className="eyebrow">CENTRAL OFICIAL • SA-MP ROLEPLAY</div><h1>{mode==='login'?'Entrar na cidade':mode==='signup'?'Criar conta':'Recuperar acesso'}</h1><p>{mode==='login'?'Escolha o servidor e entre na sua conta.':mode==='signup'?'Crie sua conta para acessar a comunidade.':'Recupere o acesso à sua conta Mythøs Network.'}</p><div className="cityBox"><b>ESCOLHA SEU SERVIDOR</b><select className="citySelect" value={city} onChange={e=>changeCity(e.target.value)}>{CITIES.map(c=><option key={c}>{c}</option>)}</select><span className="cityBadge">{city}</span></div>{err&&<div className="error">{err}</div>}<form onSubmit={doAuth}>{mode==='signup'&&<label className="field">NOME<input value={name} onChange={e=>setName(e.target.value)} required/></label>}<label className="field">E-MAIL<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>{mode!=='forgot'&&<label className="field">SENHA<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/></label>}<button className="primary">{mode==='login'?'ENTRAR':mode==='signup'?'CRIAR CONTA':'SOLICITAR RECUPERAÇÃO'}</button></form>{mode==='login'&&<button className="forgot" onClick={()=>{setMode('forgot');setErr('')}}>Esqueci minha senha</button>}<button className="switch" onClick={()=>{setMode(mode==='login'?'signup':'login');setErr('')}}>{mode==='login'?<>Ainda não tem conta? <b>Criar agora</b></>:<>Já possui conta? <b>Entrar</b></>}</button></div><div className="gtaCopyright">{city} • <b>Criada por Mythøs Network</b></div></div>;
`;

const authPattern = /if\(!session\)return .*?;\n const go=/s;
if (!authPattern.test(s)) throw new Error('Login block not found in App.web.tsx');
s = s.replace(authPattern, newAuth + ' const go=');

fs.writeFileSync(file, s, 'utf8');
console.log('Applied GTA SA-MP login design and corrected server selector: Lex City RP / Nyx Roleplay');
