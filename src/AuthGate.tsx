import React,{useEffect,useState}from'react';
import{ActivityIndicator,Alert,Pressable,SafeAreaView,ScrollView,StyleSheet,Text,TextInput,View}from'react-native';
import*as WebBrowser from'expo-web-browser';
import{supabase}from'../lib/supabase';
import RPgramPolished from'./RPgramPolished';

const P='#A855F7',PD='#6D28D9',BG='#07050B',CARD='#120D1B',M='#9B92A8';
const redirectUri='rpgram://auth/callback';
const slug=(n:string)=>n.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,20);
const loginEmail=(key:string)=>`${key.replace(/[^a-zA-Z0-9]/g,'')}@rpgram.app`;

export default function AuthGate(){
 const[session,setSession]=useState<any>(null),[loading,setLoading]=useState(true),[mode,setMode]=useState<'login'|'signup'>('login'),[name,setName]=useState(''),[pass,setPass]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!supabase){setLoading(false);return}supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});const sub=supabase.auth.onAuthStateChange((_,s)=>setSession(s));return()=>sub.data.subscription.unsubscribe()},[]);
 async function passwordAuth(){if(!supabase)return;const n=name.trim(),u=slug(n);if(n.length<3)return Alert.alert('Nome','Escolha um nome com pelo menos 3 caracteres.');if(pass.length<6)return Alert.alert('Senha','A senha precisa ter pelo menos 6 caracteres.');if(!u)return Alert.alert('Nome','Escolha outro nome.');setBusy(true);try{
   const existing=await supabase.from('profiles').select('id,login_key,username').eq('display_name',n).maybeSingle();
   if(mode==='signup'&&existing.data)throw Error('Esse nome já está em uso.');
   if(mode==='login'&&!existing.data)throw Error('Conta não encontrada. Crie sua conta primeiro.');
   let key=existing.data?.login_key;
   if(mode==='signup'){
     const r=await supabase.auth.signUp({email:loginEmail(crypto.randomUUID()),password:pass,options:{data:{display_name:n,username:u,auth_type:'password'}}});
     if(r.error)throw r.error;if(!r.data.user)throw Error('Não foi possível criar a conta.');
     key=r.data.user.id;
     const p=await supabase.from('profiles').upsert({id:r.data.user.id,display_name:n,username:u,login_key:key},{onConflict:'id'});if(p.error)throw p.error;
     if(!r.data.session)throw Error('A autenticação por e-mail do Supabase está exigindo confirmação. Desative a confirmação de e-mail no Supabase para o cadastro Nome + Senha funcionar sem e-mail.');
     setSession(r.data.session);
   }else{
     if(!key)throw Error('Esta conta antiga precisa ser atualizada. Entre pela conta Google ou crie uma nova conta.');
     const r=await supabase.auth.signInWithPassword({email:loginEmail(key),password:pass});if(r.error)throw r.error;setSession(r.data.session);
   }
 }catch(e:any){Alert.alert('Autenticação',e.message||'Não foi possível entrar.')}finally{setBusy(false)}}
 async function google(){if(!supabase)return;setBusy(true);try{const r=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirectUri,skipBrowserRedirect:true,queryParams:{access_type:'offline',prompt:'select_account'}}});if(r.error)throw r.error;if(!r.data?.url)throw Error('Google OAuth não está configurado no Supabase.');const result=await WebBrowser.openAuthSessionAsync(r.data.url,redirectUri);if(result.type==='success'&&result.url){const u=new URL(result.url),code=u.searchParams.get('code');if(code){const x=await supabase.auth.exchangeCodeForSession(code);if(x.error)throw x.error}else{const hash=new URLSearchParams(u.hash.replace(/^#/,' '));const at=hash.get('access_token'),rt=hash.get('refresh_token');if(at&&rt){const x=await supabase.auth.setSession({access_token:at,refresh_token:rt});if(x.error)throw x.error}}const s=await supabase.auth.getSession();if(!s.data.session)throw Error('A conta Google não foi autenticada.');setSession(s.data.session)} }catch(e:any){Alert.alert('Google',e.message||'Não foi possível autenticar com o Google.')}finally{setBusy(false)}}
 if(loading)return <View style={st.boot}><Text style={st.logo}>RPgram</Text><ActivityIndicator color={P}/></View>;
 if(session)return <RPgramPolished/>;
 return <SafeAreaView style={st.safe}><ScrollView contentContainerStyle={st.auth}><Text style={st.logo}>RPgram</Text><Text style={st.title}>{mode==='login'?'Bem-vindo de volta':'Criar conta'}</Text><Text style={st.sub}>Entre com nome e senha ou use uma conta Google.</Text><TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={M} style={st.input}/><TextInput value={pass} onChangeText={setPass} placeholder="Sua senha" placeholderTextColor={M} secureTextEntry style={st.input}/><Pressable style={st.primary} onPress={passwordAuth} disabled={busy}><Text style={st.primaryText}>{busy?'Aguarde...':mode==='login'?'Entrar':'Criar conta'}</Text></Pressable><View style={st.or}><View style={st.line}/><Text style={st.orText}>OU</Text><View style={st.line}/></View><Pressable style={st.google} onPress={google} disabled={busy}><Text style={st.googleText}>G  Continuar com Google</Text></Pressable><Pressable onPress={()=>setMode(mode==='login'?'signup':'login')}><Text style={st.switch}>{mode==='login'?'Ainda não tenho conta':'Já tenho uma conta'}</Text></Pressable><Text style={st.note}>O Google só autentica a conta. No primeiro acesso você escolhe seu próprio nome e @ no RPgram.</Text></ScrollView></SafeAreaView>;
}
const st=StyleSheet.create({safe:{flex:1,backgroundColor:BG},auth:{flexGrow:1,justifyContent:'center',padding:24},boot:{flex:1,backgroundColor:BG,alignItems:'center',justifyContent:'center',gap:18},logo:{color:'#fff',fontSize:32,fontWeight:'900'},title:{color:'#fff',fontSize:27,fontWeight:'900',marginTop:24,marginBottom:8},sub:{color:M,marginBottom:20,lineHeight:20},input:{backgroundColor:'#100B17',borderWidth:1,borderColor:'#241A30',borderRadius:15,color:'#fff',padding:16,marginBottom:12},primary:{backgroundColor:PD,borderRadius:15,padding:16,alignItems:'center',justifyContent:'center',marginVertical:6},primaryText:{color:'#fff',fontWeight:'900'},or:{flexDirection:'row',alignItems:'center',gap:10,marginVertical:14},line:{flex:1,height:1,backgroundColor:'#2B2037'},orText:{color:M,fontSize:11,fontWeight:'900'},google:{backgroundColor:'#fff',borderRadius:15,padding:16,alignItems:'center',justifyContent:'center'},googleText:{color:'#171219',fontWeight:'900'},switch:{color:'#B995E8',textAlign:'center',margin:16,fontWeight:'800'},note:{color:'#777080',fontSize:11,textAlign:'center',lineHeight:16,marginTop:4}});