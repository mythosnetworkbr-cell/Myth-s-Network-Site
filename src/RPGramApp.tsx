import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();
const redirectUri = makeRedirectUri({ scheme: 'rpgram', path: 'auth/callback' });

type Tab = 'home' | 'search' | 'create' | 'activity' | 'profile';
type Profile = { id: string; username: string; display_name: string; bio: string; avatar_url: string | null };
type Post = { id: string; user_id: string; image_url: string; caption: string; created_at: string; profile: Profile | null; likes: number; liked: boolean; comments: number };
type Comment = { id: string; body: string; created_at: string; profile: Profile | null };
type CommentRow = { id: string; body: string; created_at: string; profiles: Profile | Profile[] | null };
const avatarFallback = 'https://i.pravatar.cc/160';
const normalizeProfile = (value: CommentRow['profiles']): Profile | null => Array.isArray(value) ? (value[0] || null) : value;

export default function RPGramApp() {
  const [session, setSession] = useState<any>(null);
  const [boot, setBoot] = useState(true);
  const [tab, setTab] = useState<Tab>('home');
  const [me, setMe] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [commentsPost, setCommentsPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [editProfile, setEditProfile] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!supabase) { setBoot(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) await bootstrap(data.session.user.id);
      setBoot(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) bootstrap(next.user.id);
      else { setMe(null); setPosts([]); }
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  async function bootstrap(userId: string) {
    if (!supabase) return;
    let { data: p } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!p) {
      const raw = session?.user?.user_metadata || {};
      const base = String(raw.user_name || raw.preferred_username || session?.user?.email?.split('@')[0] || 'jogador').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'jogador';
      const result = await supabase.from('profiles').insert({ id: userId, username: `${base}${Date.now().toString().slice(-4)}`, display_name: raw.full_name || base, avatar_url: raw.avatar_url || null }).select().single();
      p = result.data;
    }
    if (p) { setMe(p); setName(p.display_name || ''); setBio(p.bio || ''); }
    await Promise.all([loadFeed(userId), loadNotifications(userId)]);
  }

  async function loadFeed(userId = session?.user?.id) {
    if (!supabase || !userId) return;
    setRefreshing(true);
    const { data, error } = await supabase.from('posts').select('id,user_id,image_url,caption,created_at,profiles(id,username,display_name,bio,avatar_url)').order('created_at', { ascending: false }).limit(50);
    if (error) { setRefreshing(false); return Alert.alert('Feed', error.message); }
    const ids = (data || []).map((x: any) => x.id);
    const likes = ids.length ? await supabase.from('likes').select('post_id,user_id').in('post_id', ids) : { data: [] as any[] };
    const comments = ids.length ? await supabase.from('comments').select('post_id').in('post_id', ids) : { data: [] as any[] };
    const mapped = (data || []).map((p: any) => { const ls = (likes.data || []).filter((x: any) => x.post_id === p.id); return { ...p, profile: p.profiles, likes: ls.length, liked: ls.some((x: any) => x.user_id === userId), comments: (comments.data || []).filter((x: any) => x.post_id === p.id).length }; });
    setPosts(mapped); setRefreshing(false);
  }

  async function loadNotifications(userId: string) {
    if (!supabase) return;
    const { data } = await supabase.from('notifications').select('id,type,read,created_at,profiles:actor_id(username,display_name,avatar_url)').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
    setNotifications(data || []);
  }

  async function login() {
    if (!supabase) return Alert.alert('RPGRAM', 'Supabase não configurado.');
    if (!email || !password) return Alert.alert('RPGRAM', 'Informe e-mail e senha.');
    setBusy(true);
    const result = signup ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) return Alert.alert('Autenticação', result.error.message);
    if (signup && !result.data.session) Alert.alert('RPGRAM', 'Conta criada. Confirme seu e-mail.');
  }

  async function google() {
    if (!supabase) return;
    setBusy(true);
    try {
      const result = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUri, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } } });
      if (result.error || !result.data.url) throw result.error || new Error('URL do Google não disponível.');
      const auth = await WebBrowser.openAuthSessionAsync(result.data.url, redirectUri);
      if (auth.type !== 'success') return;
      const url = new URL(auth.url);
      const code = url.searchParams.get('code');
      if (code) { const x = await supabase.auth.exchangeCodeForSession(code); if (x.error) throw x.error; return; }
      const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
      const access_token = hash.get('access_token'); const refresh_token = hash.get('refresh_token');
      if (access_token && refresh_token) { const x = await supabase.auth.setSession({ access_token, refresh_token }); if (x.error) throw x.error; }
    } catch (e: any) { Alert.alert('Google', e.message || 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  }

  async function like(post: Post) {
    if (!supabase || !session) return;
    const next = !post.liked;
    setPosts(v => v.map(p => p.id === post.id ? { ...p, liked: next, likes: p.likes + (next ? 1 : -1) } : p));
    const result = next ? await supabase.from('likes').insert({ post_id: post.id, user_id: session.user.id }) : await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', session.user.id);
    if (result.error) await loadFeed(session.user.id);
    if (next && post.user_id !== session.user.id) await supabase.from('notifications').insert({ user_id: post.user_id, actor_id: session.user.id, type: 'like', post_id: post.id });
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Fotos', 'Permita acesso às fotos para publicar.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.86, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled) setImage(result.assets[0].uri);
  }

  async function publish() {
    if (!supabase || !session || !image) return Alert.alert('Publicar', 'Escolha uma foto.');
    setBusy(true);
    try {
      const bytes = await (await fetch(image)).arrayBuffer();
      const path = `${session.user.id}/${Date.now()}.jpg`;
      const upload = await supabase.storage.from('rpgram-media').upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
      if (upload.error) throw upload.error;
      const url = supabase.storage.from('rpgram-media').getPublicUrl(path).data.publicUrl;
      const result = await supabase.from('posts').insert({ user_id: session.user.id, image_url: url, caption: caption.trim() });
      if (result.error) throw result.error;
      setImage(null); setCaption(''); setTab('home'); await loadFeed(session.user.id);
    } catch (e: any) { Alert.alert('Publicação', e.message || 'Falha ao publicar.'); }
    finally { setBusy(false); }
  }

  async function openComments(post: Post) {
    if (!supabase) return;
    setCommentsPost(post);
    const { data, error } = await supabase.from('comments').select('id,body,created_at,profiles(id,username,display_name,bio,avatar_url)').eq('post_id', post.id).order('created_at', { ascending: true });
    if (error) return Alert.alert('Comentários', error.message);
    const rows = (data || []) as unknown as CommentRow[];
    setComments(rows.map(x => ({ id: x.id, body: x.body, created_at: x.created_at, profile: normalizeProfile(x.profiles) })));
  }

  async function addComment() {
    if (!supabase || !session || !commentsPost || !commentText.trim()) return;
    const body = commentText.trim();
    const { data, error } = await supabase.from('comments').insert({ post_id: commentsPost.id, user_id: session.user.id, body }).select('id,body,created_at,profiles(id,username,display_name,bio,avatar_url)').single();
    if (error) return Alert.alert('Comentário', error.message);
    const row = data as unknown as CommentRow;
    setComments(v => [...v, { id: row.id, body: row.body, created_at: row.created_at, profile: normalizeProfile(row.profiles) }]);
    setCommentText('');
    if (commentsPost.user_id !== session.user.id) await supabase.from('notifications').insert({ user_id: commentsPost.user_id, actor_id: session.user.id, type: 'comment', post_id: commentsPost.id });
    setPosts(v => v.map(p => p.id === commentsPost.id ? { ...p, comments: p.comments + 1 } : p));
  }

  async function searchUsers(value: string) {
    setQuery(value);
    if (!supabase || !value.trim()) { setUsers([]); return; }
    const q = value.trim().replace(/[%_]/g, '');
    const { data } = await supabase.from('profiles').select('id,username,display_name,bio,avatar_url').or(`username.ilike.%${q}%,display_name.ilike.%${q}%`).neq('id', session.user.id).limit(30);
    setUsers(data || []);
    const ids = (data || []).map((x: any) => x.id);
    if (ids.length) { const f = await supabase.from('follows').select('following_id').eq('follower_id', session.user.id).in('following_id', ids); setFollowing(new Set((f.data || []).map((x: any) => x.following_id))); }
  }

  async function toggleFollow(userId: string) {
    if (!supabase || !session) return;
    const isFollowing = following.has(userId);
    const result = isFollowing ? await supabase.from('follows').delete().eq('follower_id', session.user.id).eq('following_id', userId) : await supabase.from('follows').insert({ follower_id: session.user.id, following_id: userId });
    if (result.error) return Alert.alert('Seguir', result.error.message);
    setFollowing(prev => { const next = new Set(prev); isFollowing ? next.delete(userId) : next.add(userId); return next; });
    if (!isFollowing) await supabase.from('notifications').insert({ user_id: userId, actor_id: session.user.id, type: 'follow' });
  }

  async function saveProfile() {
    if (!supabase || !session) return;
    setBusy(true);
    const result = await supabase.from('profiles').update({ display_name: name.trim(), bio: bio.trim() }).eq('id', session.user.id).select().single();
    setBusy(false);
    if (result.error) return Alert.alert('Perfil', result.error.message);
    setMe(result.data); setEditProfile(false);
  }

  async function logout() { await supabase?.auth.signOut(); }

  if (boot) return <View style={styles.center}><Text style={styles.brand}>RPGRAM</Text><ActivityIndicator color="#fff" /></View>;
  if (!session) return <Auth email={email} password={password} setEmail={setEmail} setPassword={setPassword} signup={signup} setSignup={setSignup} login={login} google={google} busy={busy} />;

  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="light-content" />
    {tab === 'home' && <Home posts={posts} like={like} comments={openComments} refresh={() => loadFeed(session.user.id)} refreshing={refreshing} />}
    {tab === 'search' && <Search query={query} search={searchUsers} users={users} following={following} follow={toggleFollow} />}
    {tab === 'create' && <Create image={image} caption={caption} setCaption={setCaption} pick={pickImage} publish={publish} busy={busy} />}
    {tab === 'activity' && <Activity notifications={notifications} />}
    {tab === 'profile' && <Profile me={me} posts={posts.filter(p => p.user_id === session.user.id)} edit={() => setEditProfile(true)} logout={logout} />}
    <Nav tab={tab} setTab={setTab} unread={notifications.filter(n => !n.read).length} />
    <Modal visible={!!commentsPost} animationType="slide" transparent onRequestClose={() => setCommentsPost(null)}>
      <View style={styles.modalBackdrop}><View style={styles.commentsSheet}><View style={styles.sheetHead}><Text style={styles.title}>Comentários</Text><Pressable onPress={() => setCommentsPost(null)}><Ionicons name="close" size={26} color="#fff" /></Pressable></View><FlatList data={comments} keyExtractor={x => x.id} contentContainerStyle={{ padding: 16 }} ListEmptyComponent={<Text style={styles.muted}>Seja o primeiro a comentar.</Text>} renderItem={({ item }) => <View style={styles.comment}><Image source={{ uri: item.profile?.avatar_url || avatarFallback }} style={styles.smallAvatar} /><View style={{ flex: 1 }}><Text style={styles.commentText}><Text style={styles.bold}>@{item.profile?.username || 'jogador'}</Text> {item.body}</Text></View></View>} /><View style={styles.commentComposer}><TextInput value={commentText} onChangeText={setCommentText} placeholder="Adicione um comentário..." placeholderTextColor="#777" style={styles.commentInput} /><Pressable onPress={addComment}><Ionicons name="send" size={23} color="#fff" /></Pressable></View></View></View>
    </Modal>
    <Modal visible={editProfile} animationType="slide" transparent onRequestClose={() => setEditProfile(false)}>
      <View style={styles.modalBackdrop}><View style={styles.editSheet}><Text style={styles.title}>Editar perfil</Text><TextInput value={name} onChangeText={setName} placeholder="Nome" placeholderTextColor="#777" style={styles.input} /><TextInput value={bio} onChangeText={setBio} placeholder="Bio" placeholderTextColor="#777" style={[styles.input, { minHeight: 90 }]} multiline /><Pressable style={styles.primary} onPress={saveProfile}><Text style={styles.primaryText}>{busy ? 'Salvando...' : 'Salvar'}</Text></Pressable></View></View>
    </Modal>
  </SafeAreaView>;
}

function Auth({ email, password, setEmail, setPassword, signup, setSignup, login, google, busy }: any) { return <SafeAreaView style={styles.safe}><View style={styles.auth}><Text style={styles.logo}>RPGRAM</Text><Text style={styles.subtitle}>Sua rede social de RPG</Text><TextInput value={email} onChangeText={setEmail} placeholder="E-mail" placeholderTextColor="#777" autoCapitalize="none" keyboardType="email-address" style={styles.input} /><TextInput value={password} onChangeText={setPassword} placeholder="Senha" placeholderTextColor="#777" secureTextEntry style={styles.input} /><Pressable style={styles.primary} onPress={login}><Text style={styles.primaryText}>{busy ? 'Aguarde...' : signup ? 'Criar conta' : 'Entrar'}</Text></Pressable><Pressable style={styles.google} onPress={google}><Text style={styles.googleText}>Continuar com Google</Text></Pressable><Pressable onPress={() => setSignup(!signup)}><Text style={styles.link}>{signup ? 'Já tenho uma conta' : 'Criar uma conta'}</Text></Pressable></View></SafeAreaView>; }
function Home({ posts, like, comments, refresh, refreshing }: any) { return <View style={styles.page}><View style={styles.header}><Text style={styles.headerBrand}>RPGRAM</Text><Ionicons name="chatbubble-ellipses-outline" size={25} color="#fff" /></View><FlatList data={posts} keyExtractor={(x: Post) => x.id} refreshing={refreshing} onRefresh={refresh} renderItem={({ item }: any) => <View style={styles.post}><View style={styles.postHead}><Image source={{ uri: item.profile?.avatar_url || avatarFallback }} style={styles.avatar} /><Text style={styles.bold}>@{item.profile?.username || 'jogador'}</Text></View><Image source={{ uri: item.image_url }} style={styles.postImage} /><View style={styles.actions}><Pressable onPress={() => like(item)}><Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={28} color={item.liked ? '#ff375f' : '#fff'} /></Pressable><Pressable onPress={() => comments(item)}><Ionicons name="chatbubble-outline" size={27} color="#fff" /></Pressable></View><Text style={styles.likes}>{item.likes} curtidas</Text>{item.caption ? <Text style={styles.caption}><Text style={styles.bold}>@{item.profile?.username || 'jogador'}</Text> {item.caption}</Text> : null}<Pressable onPress={() => comments(item)}><Text style={styles.muted}>Ver {item.comments} comentários</Text></Pressable></View>} ListEmptyComponent={<Text style={styles.muted}>Ainda não há publicações.</Text>} contentContainerStyle={{ paddingBottom: 90 }} /></View>; }
function Search({ query, search, users, following, follow }: any) { return <View style={styles.page}><TextInput value={query} onChangeText={search} placeholder="Pesquisar jogadores" placeholderTextColor="#777" style={styles.search} />{users.map((u: Profile) => <View key={u.id} style={styles.userRow}><Image source={{ uri: u.avatar_url || avatarFallback }} style={styles.avatar} /><View style={{ flex: 1 }}><Text style={styles.bold}>@{u.username}</Text><Text style={styles.muted}>{u.display_name}</Text></View><Pressable style={styles.follow} onPress={() => follow(u.id)}><Text style={styles.followText}>{following.has(u.id) ? 'Seguindo' : 'Seguir'}</Text></Pressable></View>)}</View>; }
function Create({ image, caption, setCaption, pick, publish, busy }: any) { return <View style={styles.page}><Text style={styles.title}>Nova publicação</Text><Pressable onPress={pick} style={styles.picker}>{image ? <Image source={{ uri: image }} style={styles.preview} /> : <Ionicons name="add" size={45} color="#aaa" />}</Pressable><TextInput value={caption} onChangeText={setCaption} placeholder="Escreva uma legenda..." placeholderTextColor="#777" style={styles.input} /><Pressable style={styles.primary} onPress={publish}><Text style={styles.primaryText}>{busy ? 'Publicando...' : 'Publicar'}</Text></Pressable></View>; }
function Activity({ notifications }: any) { return <View style={styles.page}><Text style={styles.title}>Atividade</Text><FlatList data={notifications} keyExtractor={(x: any) => x.id} renderItem={({ item }: any) => <View style={styles.userRow}><Text style={styles.muted}>{item.type === 'like' ? '❤️ curtiu sua publicação' : item.type === 'comment' ? '💬 comentou na sua publicação' : '👤 começou a seguir você'}</Text></View>} ListEmptyComponent={<Text style={styles.muted}>Nenhuma atividade ainda.</Text>} /></View>; }
function Profile({ me, posts, edit, logout }: any) { return <View style={styles.page}><View style={styles.profileHead}><Image source={{ uri: me?.avatar_url || avatarFallback }} style={styles.profileAvatar} /><View><Text style={styles.title}>@{me?.username}</Text><Text style={styles.muted}>{me?.display_name}</Text><Text style={styles.muted}>{me?.bio}</Text></View></View><Pressable style={styles.secondary} onPress={edit}><Text style={styles.primaryText}>Editar perfil</Text></Pressable><Pressable style={styles.secondary} onPress={logout}><Text style={styles.primaryText}>Sair</Text></Pressable><View style={styles.grid}>{posts.map((p: Post) => <Image key={p.id} source={{ uri: p.image_url }} style={styles.gridImage} />)}</View></View>; }
function Nav({ tab, setTab, unread }: any) { const items: [Tab, string][] = [['home','home'],['search','search'],['create','add-circle'],['activity','heart'],['profile','person']]; return <View style={styles.nav}>{items.map(([key, icon]) => <Pressable key={key} onPress={() => setTab(key)}><Ionicons name={icon as any} size={27} color={tab === key ? '#fff' : '#777'} />{key === 'activity' && unread > 0 ? <Text style={styles.badge}>{unread}</Text> : null}</Pressable>)}</View>; }
const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:'#050505'},page:{flex:1,backgroundColor:'#050505',padding:16},center:{flex:1,backgroundColor:'#050505',alignItems:'center',justifyContent:'center'},brand:{color:'#fff',fontSize:30,fontWeight:'800',marginBottom:15},auth:{flex:1,justifyContent:'center',padding:24},logo:{color:'#fff',fontSize:42,fontWeight:'900',textAlign:'center'},subtitle:{color:'#aaa',textAlign:'center',marginBottom:28},input:{backgroundColor:'#151515',borderRadius:10,color:'#fff',padding:14,marginBottom:12},primary:{backgroundColor:'#fff',borderRadius:10,padding:14,alignItems:'center',marginBottom:12},primaryText:{color:'#000',fontWeight:'800'},google:{backgroundColor:'#202020',borderRadius:10,padding:14,alignItems:'center',marginBottom:16},googleText:{color:'#fff',fontWeight:'700'},link:{color:'#aaa',textAlign:'center'},header:{height:52,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},headerBrand:{color:'#fff',fontSize:25,fontWeight:'900'},post:{marginBottom:24},postHead:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10},avatar:{width:38,height:38,borderRadius:19},postImage:{width:'100%',aspectRatio:1,borderRadius:4},actions:{flexDirection:'row',gap:18,paddingVertical:10},likes:{color:'#fff',fontWeight:'800'},caption:{color:'#fff',marginTop:7},muted:{color:'#777',marginTop:7},bold:{color:'#fff',fontWeight:'800'},search:{backgroundColor:'#151515',color:'#fff',borderRadius:12,padding:13,marginBottom:15},userRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#161616'},follow:{paddingHorizontal:14,paddingVertical:8,borderRadius:8,backgroundColor:'#fff'},followText:{color:'#000',fontWeight:'800'},picker:{height:340,borderRadius:10,borderWidth:1,borderColor:'#333',borderStyle:'dashed',alignItems:'center',justifyContent:'center',overflow:'hidden',marginVertical:15},preview:{width:'100%',height:'100%'},title:{color:'#fff',fontSize:22,fontWeight:'800',marginBottom:15},profileHead:{flexDirection:'row',gap:15,alignItems:'center',marginBottom:18},profileAvatar:{width:90,height:90,borderRadius:45},secondary:{backgroundColor:'#222',padding:12,borderRadius:9,alignItems:'center',marginBottom:10},grid:{flexDirection:'row',flexWrap:'wrap',gap:2,marginTop:15},gridImage:{width:'32.8%',aspectRatio:1},nav:{position:'absolute',bottom:0,left:0,right:0,height:65,backgroundColor:'#090909',borderTopWidth:1,borderTopColor:'#222',flexDirection:'row',justifyContent:'space-around',alignItems:'center'},badge:{color:'#fff',backgroundColor:'#e33',fontSize:9,fontWeight:'800',borderRadius:8,paddingHorizontal:4},modalBackdrop:{flex:1,backgroundColor:'rgba(0,0,0,.65)',justifyContent:'flex-end'},commentsSheet:{height:'72%',backgroundColor:'#111',borderTopLeftRadius:20,borderTopRightRadius:20},sheetHead:{padding:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},comment:{flexDirection:'row',gap:10,marginBottom:14},smallAvatar:{width:32,height:32,borderRadius:16},commentText:{color:'#ddd'},commentComposer:{flexDirection:'row',alignItems:'center',padding:12,borderTopWidth:1,borderTopColor:'#222'},commentInput:{flex:1,color:'#fff',backgroundColor:'#1b1b1b',borderRadius:20,paddingHorizontal:14,paddingVertical:10,marginRight:10},editSheet:{backgroundColor:'#111',padding:20,borderTopLeftRadius:20,borderTopRightRadius:20}});
