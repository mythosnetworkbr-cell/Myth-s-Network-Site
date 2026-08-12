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

const avatarFallback = 'https://i.pravatar.cc/160';

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
    const mapped = (data || []).map((p: any) => {
      const ls = (likes.data || []).filter((x: any) => x.post_id === p.id);
      return { ...p, profile: p.profiles, likes: ls.length, liked: ls.some((x: any) => x.user_id === userId), comments: (comments.data || []).filter((x: any) => x.post_id === p.id).length };
    });
    setPosts(mapped);
    setRefreshing(false);
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
    setComments((data || []).map((x: any) => ({ ...x, profile: x.profiles })));
  }

  async function addComment() {
    if (!supabase || !session || !commentsPost || !commentText.trim()) return;
    const body = commentText.trim();
    const { data, error } = await supabase.from('comments').insert({ post_id: commentsPost.id, user_id: session.user.id, body }).select('id,body,created_at,profiles(id,username,display_name,bio,avatar_url)').single();
    if (error) return Alert.alert('Comentário', error.message);
    setComments(v => [...v, { ...data, profile: data.profiles }]); setCommentText('');
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
    {tab === 'home' && <Home posts={posts} me={me} like={like} comments={openComments} refresh={() => loadFeed(session.user.id)} refreshing={refreshing} />}
    {tab === 'search' && <Search query={query} search={searchUsers} users={users} following={following} follow={toggleFollow} />}
    {tab === 'create' && <Create image={image} caption={caption} setCaption={setCaption} pick={pickImage} publish={publish} busy={busy} />}
    {tab === 'activity' && <Activity notifications={notifications} />}
    {tab === 'profile' && <Profile me={me} posts={posts.filter(p => p.user_id === session.user.id)} edit={() => setEditProfile(true)} logout={logout} />}
    <Nav tab={tab} setTab={setTab} unread={notifications.filter(n => !n.read).length} />
    <Modal visible={!!commentsPost} animationType="slide" transparent onRequestClose={() => setCommentsPost(null)}>
      <View style={styles.modalBackdrop}><View style={styles.commentsSheet}><View style={styles.sheetHead}><Text style={styles.title}>Comentários</Text><Pressable onPress={() => setCommentsPost(null)}><Ionicons name="close" size={26} color="#fff" /></Pressable></View><FlatList data={comments} keyExtractor={x => x.id} contentContainerStyle={{ padding: 16 }} ListEmptyComponent={<Text style={styles.muted}>Seja o primeiro a comentar.</Text>} renderItem={({ item }) => <View style={styles.comment}><Image source={{ uri: item.profile?.avatar_url || avatarFallback }} style={styles.smallAvatar} /><View style={{ flex: 1 }}><Text style={styles.commentText}><Text style={styles.bold}>@{item.profile?.username || 'jogador'}</Text> {item.body}</Text></View></View>} /><View style={styles.commentComposer}><TextInput value={commentText} onChangeText={setCommentText} placeholder="Adicione um comentário..." placeholderTextColor="#777" style={styles.commentInput} /><Pressable onPress={addComment}><Ionicons name="send" size={23} color="#fff" /></Pressable></View></View></View>
    </Modal>
    <Modal visible={editProfile} animationType="slide" transparent onRequestClose={() => setEditProfile(false)}><View style={styles.modalBackdrop}><View style={styles.editSheet}><View style={styles.sheetHead}><Text style={styles.title}>Editar perfil</Text><Pressable onPress={() => setEditProfile(false)}><Ionicons name="close" size={26} color="#fff" /></Pressable></View><TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nome" placeholderTextColor="#777" /><TextInput value={bio} onChangeText={setBio} style={[styles.input, { height: 100 }]} multiline placeholder="Bio" placeholderTextColor="#777" /><Pressable style={styles.primary} onPress={saveProfile}><Text style={styles.primaryText}>{busy ? 'Salvando...' : 'Salvar'}</Text></Pressable></View></View></Modal>
  </SafeAreaView>;
}

function Auth(p: any) { return <KeyboardAvoidingView style={styles.auth} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Text style={styles.brand}>RPGRAM</Text><Text style={styles.tag}>A rede social do seu Roleplay.</Text><TextInput style={styles.input} value={p.email} onChangeText={p.setEmail} placeholder="E-mail" placeholderTextColor="#777" autoCapitalize="none" keyboardType="email-address" /><TextInput style={styles.input} value={p.password} onChangeText={p.setPassword} placeholder="Senha" placeholderTextColor="#777" secureTextEntry /><Pressable style={styles.primary} onPress={p.login} disabled={p.busy}><Text style={styles.primaryText}>{p.busy ? 'Aguarde...' : p.signup ? 'Criar conta' : 'Entrar'}</Text></Pressable><View style={styles.or}><View style={styles.line} /><Text style={styles.muted}>ou</Text><View style={styles.line} /></View><Pressable style={styles.google} onPress={p.google}><Text style={styles.googleText}>G  Continuar com Google</Text></Pressable><Pressable onPress={() => p.setSignup(!p.signup)}><Text style={styles.switch}>{p.signup ? 'Já tenho uma conta' : 'Criar nova conta'}</Text></Pressable></KeyboardAvoidingView>; }

function Home({ posts, me, like, comments, refresh, refreshing }: any) { return <View style={styles.screen}><View style={styles.topbar}><Text style={styles.headerLogo}>RPGRAM</Text><View style={styles.topActions}><Ionicons name="heart-outline" size={26} color="#fff" /><Pressable onPress={refresh}><Ionicons name="refresh" size={23} color="#fff" /></Pressable></View></View><FlatList data={posts} keyExtractor={(x: Post) => x.id} refreshing={refreshing} onRefresh={refresh} contentContainerStyle={{ paddingBottom: 88 }} ListEmptyComponent={<View style={styles.empty}><Ionicons name="images-outline" size={52} color="#555" /><Text style={styles.muted}>Nenhuma publicação ainda.</Text><Text style={styles.muted}>Comece compartilhando uma foto.</Text></View>} renderItem={({ item }: { item: Post }) => <View style={styles.post}><View style={styles.postHead}><Image source={{ uri: item.profile?.avatar_url || avatarFallback }} style={styles.avatar} /><View style={{ flex: 1 }}><Text style={styles.bold}>{item.profile?.display_name || item.profile?.username || 'Jogador'}</Text><Text style={styles.handle}>@{item.profile?.username || 'jogador'}</Text></View><Ionicons name="ellipsis-horizontal" size={21} color="#fff" /></View><Image source={{ uri: item.image_url }} style={styles.postImage} /><View style={styles.actions}><Pressable onPress={() => like(item)}><Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={29} color={item.liked ? '#ff3040' : '#fff'} /></Pressable><Pressable onPress={() => comments(item)}><Ionicons name="chatbubble-outline" size={26} color="#fff" /></Pressable><Ionicons name="paper-plane-outline" size={27} color="#fff" /><Ionicons name="bookmark-outline" size={27} color="#fff" style={{ marginLeft: 'auto' }} /></View><Text style={styles.likes}>{item.likes} curtidas</Text>{item.caption ? <Text style={styles.caption}><Text style={styles.bold}>@{item.profile?.username || 'jogador'} </Text>{item.caption}</Text> : null}<Pressable onPress={() => comments(item)}><Text style={styles.viewComments}>Ver {item.comments} comentários</Text></Pressable></View>} /></View>; }

function Search({ query, search, users, following, follow }: any) { return <View style={styles.screen}><Text style={styles.title}>Pesquisar</Text><View style={styles.searchBox}><Ionicons name="search" size={20} color="#777" /><TextInput value={query} onChangeText={search} placeholder="Pesquisar" placeholderTextColor="#777" style={{ flex: 1, color: '#fff' }} /></View><FlatList data={users} keyExtractor={(x: Profile) => x.id} contentContainerStyle={{ paddingBottom: 90 }} renderItem={({ item }: { item: Profile }) => <View style={styles.userRow}><Image source={{ uri: item.avatar_url || avatarFallback }} style={styles.avatar} /><View style={{ flex: 1 }}><Text style={styles.bold}>{item.display_name || item.username}</Text><Text style={styles.handle}>@{item.username}</Text>{item.bio ? <Text style={styles.muted}>{item.bio}</Text> : null}</View><Pressable style={following.has(item.id) ? styles.following : styles.follow} onPress={() => follow(item.id)}><Text style={following.has(item.id) ? styles.primaryText : styles.followText}>{following.has(item.id) ? 'Seguindo' : 'Seguir'}</Text></Pressable></View>} ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={48} color="#555" /><Text style={styles.muted}>Pesquise jogadores por nome ou @usuário.</Text></View>} /></View>; }

function Create({ image, caption, setCaption, pick, publish, busy }: any) { return <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 110 }}><Text style={styles.title}>Nova publicação</Text><Pressable style={styles.picker} onPress={pick}>{image ? <Image source={{ uri: image }} style={styles.preview} /> : <><Ionicons name="add-circle-outline" size={58} color="#777" /><Text style={styles.muted}>Escolher foto</Text></>}</Pressable><TextInput value={caption} onChangeText={setCaption} multiline style={[styles.input, { height: 110 }]} placeholder="Escreva uma legenda..." placeholderTextColor="#777" /><Pressable style={styles.primary} onPress={publish} disabled={busy}><Text style={styles.primaryText}>{busy ? 'Publicando...' : 'Compartilhar'}</Text></Pressable></ScrollView>; }

function Activity({ notifications }: any) { return <View style={styles.screen}><Text style={styles.title}>Atividade</Text><FlatList data={notifications} keyExtractor={x => x.id} contentContainerStyle={{ paddingBottom: 90 }} ListEmptyComponent={<View style={styles.empty}><Ionicons name="heart-outline" size={50} color="#555" /><Text style={styles.muted}>Nenhuma atividade ainda.</Text></View>} renderItem={({ item }) => <View style={styles.activity}><Image source={{ uri: item.profiles?.avatar_url || avatarFallback }} style={styles.smallAvatar} /><Text style={styles.commentText}><Text style={styles.bold}>@{item.profiles?.username || 'jogador'}</Text> {item.type === 'like' ? 'curtiu sua publicação.' : item.type === 'comment' ? 'comentou sua publicação.' : 'começou a seguir você.'}</Text></View>} /></View>; }

function Profile({ me, posts, edit, logout }: any) { return <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}><View style={styles.profileHead}><Image source={{ uri: me?.avatar_url || avatarFallback }} style={styles.profileAvatar} /><View style={styles.stats}><Stat value={posts.length} label="publicações" /><Stat value="0" label="seguidores" /><Stat value="0" label="seguindo" /></View></View><Text style={styles.profileName}>{me?.display_name || me?.username}</Text><Text style={styles.handle}>@{me?.username}</Text>{me?.bio ? <Text style={styles.bio}>{me.bio}</Text> : null}<View style={styles.profileButtons}><Pressable style={styles.outline} onPress={edit}><Text style={styles.primaryText}>Editar perfil</Text></Pressable><Pressable style={styles.outline} onPress={logout}><Text style={styles.primaryText}>Sair</Text></Pressable></View><View style={styles.grid}>{posts.map((p: Post) => <Image key={p.id} source={{ uri: p.image_url }} style={styles.gridImage} />)}</View></ScrollView>; }
function Stat({ value, label }: any) { return <View style={{ alignItems: 'center' }}><Text style={styles.stat}>{value}</Text><Text style={styles.muted}>{label}</Text></View>; }
function Nav({ tab, setTab, unread }: any) { const items: [Tab, string, string][] = [['home', 'home-outline', 'home'], ['search', 'search-outline', 'search'], ['create', 'add-circle-outline', 'create'], ['activity', 'heart-outline', 'activity'], ['profile', 'person-outline', 'profile']]; return <View style={styles.nav}>{items.map(([id, icon, label]) => <Pressable key={id} onPress={() => setTab(id)} style={styles.navItem}><Ionicons name={tab === id ? icon.replace('-outline', '') as any : icon as any} size={27} color="#fff" />{id === 'activity' && unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View> : null}</Pressable>)}</View>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#000' }, screen: { flex: 1, backgroundColor: '#000' }, center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 16 }, auth: { flex: 1, backgroundColor: '#000', padding: 26, justifyContent: 'center' }, brand: { color: '#fff', fontSize: 38, fontWeight: '900', letterSpacing: -2, textAlign: 'center' }, tag: { color: '#aaa', textAlign: 'center', marginBottom: 28, marginTop: 8 }, input: { backgroundColor: '#171717', color: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#262626' }, primary: { backgroundColor: '#fff', borderRadius: 10, padding: 15, alignItems: 'center', marginVertical: 6 }, primaryText: { color: '#000', fontWeight: '800' }, google: { backgroundColor: '#181818', borderRadius: 10, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' }, googleText: { color: '#fff', fontWeight: '800' }, switch: { color: '#fff', textAlign: 'center', marginTop: 20, fontWeight: '700' }, or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 }, line: { flex: 1, height: 1, backgroundColor: '#292929' }, muted: { color: '#888' }, topbar: { height: 58, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#222', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerLogo: { color: '#fff', fontSize: 25, fontWeight: '900', letterSpacing: -1 }, topActions: { flexDirection: 'row', gap: 18 }, post: { borderBottomWidth: 1, borderBottomColor: '#202020', paddingBottom: 18 }, postHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#222' }, postImage: { width: '100%', aspectRatio: 1, backgroundColor: '#111' }, actions: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 10, paddingBottom: 4 }, likes: { color: '#fff', fontWeight: '800', paddingHorizontal: 12, marginBottom: 6 }, caption: { color: '#ddd', paddingHorizontal: 12, lineHeight: 20 }, viewComments: { color: '#777', paddingHorizontal: 12, marginTop: 7 }, bold: { color: '#fff', fontWeight: '800' }, handle: { color: '#777', fontSize: 12 }, title: { color: '#fff', fontSize: 25, fontWeight: '900', padding: 16 }, searchBox: { margin: 0, marginHorizontal: 16, backgroundColor: '#181818', borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' }, follow: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 }, following: { backgroundColor: '#222', borderWidth: 1, borderColor: '#444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }, followText: { color: '#000', fontWeight: '800' }, picker: { margin: 16, height: 360, borderRadius: 14, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: 10 }, preview: { width: '100%', height: '100%' }, empty: { alignItems: 'center', justifyContent: 'center', padding: 45, gap: 10 }, nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 66, backgroundColor: '#050505', borderTopWidth: 1, borderTopColor: '#222', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }, navItem: { width: 55, height: 55, alignItems: 'center', justifyContent: 'center' }, badge: { position: 'absolute', right: 2, top: 2, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: '#ff3040', alignItems: 'center', justifyContent: 'center' }, badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' }, modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.65)', justifyContent: 'flex-end' }, commentsSheet: { height: '72%', backgroundColor: '#101010', borderTopLeftRadius: 18, borderTopRightRadius: 18 }, editSheet: { backgroundColor: '#101010', padding: 18, borderTopLeftRadius: 18, borderTopRightRadius: 18 }, sheetHead: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, comment: { flexDirection: 'row', gap: 10, marginBottom: 18 }, smallAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#222' }, commentText: { color: '#ddd', lineHeight: 20 }, commentComposer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderTopWidth: 1, borderTopColor: '#292929' }, commentInput: { flex: 1, backgroundColor: '#181818', color: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 }, activity: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' }, profileHead: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 28 }, profileAvatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#222' }, stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' }, stat: { color: '#fff', fontSize: 18, fontWeight: '900' }, profileName: { color: '#fff', fontSize: 18, fontWeight: '900', paddingHorizontal: 18 }, bio: { color: '#ddd', padding: 18, paddingTop: 6 }, profileButtons: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginBottom: 18 }, outline: { flex: 1, borderWidth: 1, borderColor: '#444', padding: 10, borderRadius: 8, alignItems: 'center' }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, gridImage: { width: '33.33%', aspectRatio: 1, borderWidth: .5, borderColor: '#000' } });
