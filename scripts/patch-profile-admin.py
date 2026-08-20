from pathlib import Path

# Idempotent cleanup/patch for the MØ profile and admin UI.
p=Path('App.web.tsx')
s=p.read_text(encoding='utf-8')

s=s.replace("import{supabase,MASTER_ADMIN_EMAIL,canManageRoles,listUsers,setUserRole}from'./lib/supabase';", "import{supabase,MASTER_ADMIN_EMAIL,canManageRoles,listUsers,setUserRole,getUserCount,getProfileAvatar,setProfileAvatar}from'./lib/supabase';")
s=s.replace("type Page='home'|'rules'|'tickets'|'new'|'staff';", "type Page='home'|'rules'|'tickets'|'new'|'profile'|'staff';")
s=s.replace("[users,setUsers]=useState<User[]>([]);", "[users,setUsers]=useState<User[]>([]),[avatar,setAvatar]=useState<string|null>(null);")
effect="useEffect(()=>{if(session?.user?.id)getProfileAvatar(session.user.id).then(setAvatar)},[session?.user?.id]);"
while s.count(effect)>1:
    s=s.replace(effect, '', 1)
staff_effect="useEffect(()=>{if(page==='staff'&&isAdmin)listUsers().then(setUsers)},[page,isAdmin]);"
if staff_effect in s and effect not in s:
    s=s.replace(staff_effect,staff_effect+'\n '+effect)

old="""<header className=\"appHead\"><button className=\"brand\"onClick={()=>go('home')}><span className=\"logo\">MØ</span><span className=\"brandWords\"><b>MYTHØS</b><small>NETWORK SAMP</small></span></button><button className=\"menu\"onClick={()=>setMobile(true)}>☰</button></header>"""
new="""<header className=\"appHead\"><button className=\"brand\"onClick={()=>go('home')} aria-label=\"MØ\"><span className=\"logo\">MØ</span></button><button className=\"menu\"onClick={()=>setMobile(true)}>☰</button></header>"""
s=s.replace(old,new)
profile_page="{page==='profile'&&<Profile session={session}avatar={avatar}setAvatar={setAvatar}displayName={displayName}/>}"
first=s.find(profile_page)
while first!=-1:
    second=s.find(profile_page,first+len(profile_page))
    if second==-1: break
    s=s[:second]+s[second+len(profile_page):]
    first=s.find(profile_page)
if profile_page not in s:
    anchor="{page==='new'&&<NewTicket category={category}setCategory={setCategory}subject={subject}setSubject={setSubject}message={message}setMessage={setMessage}createTicket={createTicket}/>}"
    s=s.replace(anchor,anchor+' '+profile_page)
s=s.replace("<footer className=\"page\"><div className=\"brandHero\" style={{fontSize:20,letterSpacing:2}}>MYTHØS <span style={{color:'#ff2037'}}>NETWORK</span><small style={{fontSize:8}}>ROLEPLAY SAMP</small></div></footer>", "<footer className=\"page\"><div className=\"logo\" style={{margin:'0 auto'}}>MØ</div></footer>")
s=s.replace("<div className=\"brandHero\"><strong>MYTH<span>Ø</span>S</strong><small>NETWORK</small><div style={{fontSize:10,letterSpacing:5,color:'#ddd',marginTop:7}}>ROLEPLAY SAMP</div></div>", "<div className=\"brandHero\"><strong>MØ</strong></div>")
s=s.replace("<div className=\"drawerTop\"><b>MYTHØS NETWORK</b><button", "<div className=\"drawerTop\"><b style={{fontSize:24,letterSpacing:3}}>MØ</b><button")
s=s.replace("{[['home','INÍCIO'],['rules','REGRAS'],['tickets','MEUS TICKETS'],['new','NOVO TICKET']].map", "{[['home','INÍCIO'],['profile','MEU PERFIL'],['rules','REGRAS'],['tickets','MEUS TICKETS'],['new','NOVO TICKET']].map")
needle="<main className=\"page\"><span className=\"eyebrow\">{p.isAdmin?'ADMINISTRAÇÃO':'SUPORTE'}</span><h1>Painel da <span>equipe.</span></h1>"
repl="<main className=\"page\"><span className=\"eyebrow\">{p.isAdmin?'ADMINISTRAÇÃO':'SUPORTE'}</span><h1>Painel da <span>equipe.</span></h1>{p.isAdmin&&<div className=\"card\"style={{marginBottom:18}}><span className=\"eyebrow\">CADASTROS</span><div style={{fontSize:42,fontWeight:950,marginTop:8}}>{p.users.length}</div><p>usuário{p.users.length===1?'':'s'} cadastrado{p.users.length===1?'':'s'} no site.</p></div>}"
s=s.replace(needle,repl)
marker="function Drawer({go,close,isStaff,isAdmin,logout}:any){"
profile="""function Profile({session,avatar,setAvatar,displayName}:{session:any;avatar:string|null;setAvatar:(x:string|null)=>void;displayName:string}){\n const[fileError,setFileError]=useState('');\n async function choose(e:any){const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){setFileError('Escolha uma imagem.');return}if(file.size>4*1024*1024){setFileError('A foto deve ter no máximo 4 MB.');return}setFileError('');const reader=new FileReader();reader.onload=async()=>{const value=String(reader.result||'');await setProfileAvatar(session.user.id,value);setAvatar(value)};reader.readAsDataURL(file)}\n async function removePhoto(){await setProfileAvatar(session.user.id,null);setAvatar(null)}\n return <main className=\"page\"><span className=\"eyebrow\">CONTA</span><h1>Meu <span>perfil.</span></h1><div className=\"card\"style={{textAlign:'center'}}><div style={{width:120,height:120,borderRadius:'50%',margin:'4px auto 18px',display:'grid',placeItems:'center',overflow:'hidden',border:'2px solid #ff2037',background:'#151515',fontSize:36,fontWeight:950}}>{avatar?<img src={avatar}alt=\"Foto de perfil\"style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'MØ'}</div><h2 style={{margin:'0 0 5px'}}>{displayName}</h2><p className=\"muted\"style={{marginTop:0}}>{session.user.email}</p><label className=\"primary\"style={{display:'block',cursor:'pointer',marginTop:18}}>ESCOLHER FOTO<input type=\"file\"accept=\"image/*\"onChange={choose}style={{display:'none'}}/></label>{avatar&&<button className=\"danger\"onClick={removePhoto}>REMOVER FOTO</button>}{fileError&&<div className=\"error\">{fileError}</div>}</div><div className=\"card\"style={{marginTop:12}}><h3>Seu cargo</h3><p className=\"muted\">{session.user.app_metadata?.role==='admin'?'Administrador':session.user.app_metadata?.role==='support'?'Suporte':'Jogador'}</p></div></main>}\n"""
if s.count('function Profile(')>1:
    before,after=s.split(marker,1)
    parts=before.split('function Profile(',1)
    rest=parts[1]
    second=rest.find('function Profile(')
    if second!=-1:
        before=parts[0]+'function Profile('+rest[:second]
        s=before+marker+after
elif 'function Profile(' not in s:
    s=s.replace(marker,profile+marker)

p.write_text(s,encoding='utf-8')
print('patched App.web.tsx')
