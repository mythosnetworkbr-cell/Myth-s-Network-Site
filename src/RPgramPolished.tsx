import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();
const redirectUri = makeRedirectUri({ scheme: 'rpgram', path: 'auth/callback' });
const PURPLE = '#A855F7';
const PURPLE_DARK = '#6D28D9';
const BG = '#07050B';
const CARD = '#120D1B';
const MUTED = '#9B92A8';
const fallbackAvatar = 'https://i.pravatar.cc/160';

type Post = { id: string; user_id: string; image_url: string; caption: string; created_at: string; profiles: any; };
type Tab = 'home' | 'search' | 'activity' | 'profile';

export default function RPgramPolished() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { if (mounted) { setSession(data.session); setLoading(false); if (data.session) bootstrap(data.session.user.id); } });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); if (next) bootstrap(next.user.id); else setMe(null); });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  async function bootstrap(userId: string) {
    if (!supabase) return;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (profile) setMe(profile);
    await loadFeed();
  }

  async function loadFeed() {
    if (!supabase) return;
    const { data, error } = await supabase.from('posts').select('id,user_id,image_url,caption,created_at,profiles(id,username,display_name,avatar_url)').order('created_at', { ascending: false }).limit(50);
    if (error) return Alert.alert('RPgram', error.message);
    setPosts((data || []) as Post[]);
  }

  async function submitAuth() {
    if (!supabase) return Alert.alert('RPgram', 'Supabase não configurado.');
    if (!email.trim() || password.length < 6) return Alert.alert('Atenção', 'Informe um e-mail e uma senha com pelo menos 6 caracteres.');
    setBusy(true);
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (result.error) return Alert.alert('Autenticação', result.error.message);
    if (authMode === 'signup' && !result.data.session) Alert.alert('RPgram', 'Conta criada. Verifique seu e-mail para continuar.');
  }

  async function googleLogin() {
    if (!supabase) return;
    setBusy(true);
    try {
      const result = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUri, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } } });
      if (result.error || !result.data.url) throw result.error || new Error('Google não disponível.');
      const resultBrowser = await WebBrowser.openAuthSessionAsync(result.data.url, redirectUri);
      if (resultBrowser.type !== 'success') return;
      const url = new URL(resultBrowser.url);
      const code = url.searchParams.get('code');
      if (code) { const exchange = await supabase.auth.exchangeCodeForSession(code); if (exchange.error) throw exchange.error; }
    } catch (e: any) { Alert.alert('Google', e.message || 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  }

  if (loading) return <View style={styles.boot}><Logo /><ActivityIndicator color={PURPLE} size="large" /></View>;
  if (!session) return <AuthScreen mode={authMode} setMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} submit={submitAuth} google={googleLogin} busy={busy} />;

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" />
    {tab === 'home' && <Home posts={posts} refresh={loadFeed} />}
    {tab === 'search' && <Search />}
    {tab === 'activity' && <Empty title="Atividade" icon="notifications-outline" text="Suas curtidas, comentários e seguidores aparecerão aqui." />}
    {tab === 'profile' && <Profile me={me} logout={() => supabase?.auth.signOut()} />}
    <BottomNav tab={tab} setTab={setTab} />
  </SafeAreaView>;
}

function Logo() { return <View style={styles.logoWrap}><View style={styles.logoMark}><Text style={styles.logoMarkText}>R</Text></View><View><Text style={styles.logo}>RPgram</Text><Text style={styles.logoBy}>MYTHØS NETWORK</Text></View></View>; }

function AuthScreen({ mode, setMode, email, setEmail, password, setPassword, submit, google, busy }: any) {
  return <SafeAreaView style={styles.safe}><View style={styles.auth}>
    <View style={styles.glow} /><Logo /><Text style={styles.authTitle}>{mode === 'login' ? 'Bem-vindo de volta' : 'Crie seu perfil'}</Text><Text style={styles.authSub}>Sua rede social para RPG, personagens e histórias.</Text>
    <TextInput value={email} onChangeText={setEmail} placeholder="Seu e-mail" placeholderTextColor="#766C80" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
    <TextInput value={password} onChangeText={setPassword} placeholder="Sua senha" placeholderTextColor="#766C80" secureTextEntry style={styles.input} />
    <Pressable style={styles.primary} onPress={submit}><Text style={styles.primaryText}>{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar no RPgram' : 'Criar minha conta'}</Text><Ionicons name="arrow-forward" size={19} color="#fff" /></Pressable>
    <View style={styles.or}><View style={styles.line} /><Text style={styles.orText}>ou</Text><View style={styles.line} /></View>
    <Pressable style={styles.secondary} onPress={google}><Ionicons name="logo-google" size={18} color="#fff" /><Text style={styles.secondaryText}>Continuar com Google</Text></Pressable>
    <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}><Text style={styles.switch}>{mode === 'login' ? 'Ainda não tenho conta · Criar agora' : 'Já tenho uma conta · Entrar'}</Text></Pressable>
    <Text style={styles.company}>Criado pela Mythøs Network</Text>
  </View></SafeAreaView>;
}

function Home({ posts, refresh }: any) { return <View style={styles.page}><View style={styles.top}><Logo /><Pressable style={styles.iconButton}><Ionicons name="chatbubble-ellipses-outline" size={23} color="#fff" /></Pressable></View><View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Seu feed</Text><Text style={styles.sectionSub}>O que está acontecendo no seu RPG?</Text></View><Pressable onPress={refresh}><Ionicons name="refresh" size={20} color={PURPLE} /></Pressable></View><FlatList data={posts} keyExtractor={(x: Post) => x.id} onRefresh={refresh} refreshing={false} renderItem={({ item }: any) => <View style={styles.postCard}><View style={styles.postHead}><Image source={{ uri: item.profiles?.avatar_url || fallbackAvatar }} style={styles.avatar} /><View style={{ flex: 1 }}><Text style={styles.user}>@{item.profiles?.username || 'jogador'}</Text><Text style={styles.postTime}>RPgram</Text></View><Ionicons name="ellipsis-horizontal" size={20} color={MUTED} /></View><Image source={{ uri: item.image_url }} style={styles.postImage} /><View style={styles.postActions}><Ionicons name="heart-outline" size={25} color="#fff" /><Ionicons name="chatbubble-outline" size={24} color="#fff" /><Ionicons name="paper-plane-outline" size={23} color="#fff" /></View>{item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}</View>} ListEmptyComponent={<View style={styles.emptyCard}><View style={styles.emptyIcon}><Ionicons name="sparkles" size={28} color={PURPLE} /></View><Text style={styles.emptyTitle}>Ainda não há publicações</Text><Text style={styles.emptyText}>Quando a comunidade começar a postar, as aventuras vão aparecer aqui.</Text></View>} contentContainerStyle={{ paddingBottom: 100 }} /></View>; }

function Search() { return <View style={styles.page}><Text style={styles.pageTitle}>Explorar</Text><View style={styles.searchBox}><Ionicons name="search" size={20} color={MUTED} /><TextInput placeholder="Pesquisar jogadores" placeholderTextColor={MUTED} style={styles.searchInput} /></View><Empty title="Encontre sua comunidade" icon="people-outline" text="Busque jogadores, personagens e novos companheiros de aventura." /></View>; }
function Profile({ me, logout }: any) { return <View style={styles.page}><Text style={styles.pageTitle}>Meu perfil</Text><View style={styles.profileCard}><Image source={{ uri: me?.avatar_url || fallbackAvatar }} style={styles.bigAvatar} /><Text style={styles.profileName}>{me?.display_name || 'Jogador'}</Text><Text style={styles.profileHandle}>@{me?.username || 'jogador'}</Text><Text style={styles.bio}>{me?.bio || 'Aventureiro no universo RPgram.'}</Text><Pressable style={styles.secondary} onPress={logout}><Text style={styles.secondaryText}>Sair da conta</Text></Pressable></View><Text style={styles.company}>RPgram · Criado pela Mythøs Network</Text></View>; }
function Empty({ title, icon, text }: any) { return <View style={styles.emptyScreen}><View style={styles.emptyIcon}><Ionicons name={icon} size={30} color={PURPLE} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>; }
function BottomNav({ tab, setTab }: any) { const items: [Tab, any, string][] = [['home','home','Início'],['search','search','Explorar'],['activity','heart-outline','Atividade'],['profile','person-outline','Perfil']]; return <View style={styles.nav}>{items.map(([key, icon, label]) => <Pressable key={key} onPress={() => setTab(key)} style={styles.navItem}><Ionicons name={icon} size={24} color={tab === key ? PURPLE : '#81788C'} /><Text style={[styles.navLabel, tab === key && { color: '#fff' }]}>{label}</Text></Pressable>)}</View>; }

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:BG}, page:{flex:1,backgroundColor:BG,paddingHorizontal:18}, boot:{flex:1,backgroundColor:BG,alignItems:'center',justifyContent:'center',gap:28}, auth:{flex:1,padding:24,justifyContent:'center',overflow:'hidden'}, glow:{position:'absolute',width:300,height:300,borderRadius:150,backgroundColor:'#3B0764',opacity:.28,top:-80,right:-120}, logoWrap:{flexDirection:'row',alignItems:'center',gap:11}, logoMark:{width:42,height:42,borderRadius:14,backgroundColor:PURPLE_DARK,alignItems:'center',justifyContent:'center',shadowColor:PURPLE,shadowOpacity:.5,shadowRadius:16}, logoMarkText:{color:'#fff',fontSize:23,fontWeight:'900'}, logo:{color:'#fff',fontSize:30,fontWeight:'900',letterSpacing:-1}, logoBy:{color:'#8C8197',fontSize:8,fontWeight:'800',letterSpacing:2.1,marginTop:1}, authTitle:{color:'#fff',fontSize:29,fontWeight:'900',marginTop:48}, authSub:{color:MUTED,fontSize:15,lineHeight:22,marginTop:8,marginBottom:24}, input:{backgroundColor:'#100B17',borderWidth:1,borderColor:'#241A30',borderRadius:15,color:'#fff',padding:16,marginBottom:12,fontSize:15}, primary:{backgroundColor:PURPLE_DARK,borderRadius:15,padding:16,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:9,marginTop:4,shadowColor:PURPLE,shadowOpacity:.35,shadowRadius:12}, primaryText:{color:'#fff',fontWeight:'900',fontSize:15}, or:{flexDirection:'row',alignItems:'center',gap:10,marginVertical:18}, line:{height:1,backgroundColor:'#211A28',flex:1}, orText:{color:'#6F6577'}, secondary:{backgroundColor:'#15101C',borderWidth:1,borderColor:'#2B2037',borderRadius:15,padding:15,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:10}, secondaryText:{color:'#fff',fontWeight:'800'}, switch:{color:'#B995E8',textAlign:'center',marginTop:20,fontWeight:'700'}, company:{color:'#62596A',textAlign:'center',fontSize:11,marginTop:28}, top:{height:72,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, iconButton:{width:42,height:42,borderRadius:14,backgroundColor:CARD,alignItems:'center',justifyContent:'center'}, sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:18}, sectionTitle:{color:'#fff',fontSize:22,fontWeight:'900'}, sectionSub:{color:MUTED,fontSize:12,marginTop:4}, postCard:{backgroundColor:CARD,borderRadius:20,borderWidth:1,borderColor:'#21172B',marginBottom:18,overflow:'hidden'}, postHead:{flexDirection:'row',alignItems:'center',padding:14,gap:11}, avatar:{width:40,height:40,borderRadius:20}, user:{color:'#fff',fontWeight:'900'}, postTime:{color:'#716779',fontSize:11,marginTop:2}, postImage:{width:'100%',aspectRatio:1}, postActions:{flexDirection:'row',gap:18,padding:14,paddingBottom:7}, caption:{color:'#E8E1EE',fontSize:14,lineHeight:20,paddingHorizontal:14,paddingBottom:15}, emptyCard:{backgroundColor:CARD,borderRadius:22,borderWidth:1,borderColor:'#24192F',padding:28,alignItems:'center',marginTop:20}, emptyScreen:{flex:1,alignItems:'center',justifyContent:'center',padding:35}, emptyIcon:{width:68,height:68,borderRadius:22,backgroundColor:'#1B1026',alignItems:'center',justifyContent:'center',marginBottom:14}, emptyTitle:{color:'#fff',fontSize:18,fontWeight:'900',textAlign:'center'}, emptyText:{color:MUTED,fontSize:13,lineHeight:20,textAlign:'center',marginTop:8}, pageTitle:{color:'#fff',fontSize:27,fontWeight:'900',marginTop:22,marginBottom:18}, searchBox:{height:50,borderRadius:15,backgroundColor:CARD,borderWidth:1,borderColor:'#24192F',flexDirection:'row',alignItems:'center',paddingHorizontal:14,gap:10}, searchInput:{flex:1,color:'#fff',fontSize:15}, profileCard:{backgroundColor:CARD,borderRadius:24,borderWidth:1,borderColor:'#24192F',padding:24,alignItems:'center'}, bigAvatar:{width:100,height:100,borderRadius:50,borderWidth:3,borderColor:PURPLE,marginBottom:15}, profileName:{color:'#fff',fontSize:22,fontWeight:'900'}, profileHandle:{color:PURPLE,fontWeight:'800',marginTop:4}, bio:{color:MUTED,textAlign:'center',marginVertical:14,lineHeight:20}, nav:{position:'absolute',bottom:0,left:0,right:0,height:78,backgroundColor:'#0C0910',borderTopWidth:1,borderTopColor:'#241A2D',flexDirection:'row',justifyContent:'space-around',alignItems:'center',paddingBottom:7}, navItem:{alignItems:'center',gap:4,minWidth:70}, navLabel:{color:'#81788C',fontSize:10,fontWeight:'800'}
});
