import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { supabase } from '../lib/supabase';

const PURPLE = '#A855F7';
const PURPLE_DARK = '#6D28D9';
const BG = '#07050B';
const CARD = '#120D1B';
const MUTED = '#9B92A8';
const fallbackAvatar = 'https://i.pravatar.cc/160';

type MediaType = 'image' | 'video' | 'reel';
type Tab = 'home' | 'search' | 'create' | 'reels' | 'activity' | 'profile';
type ComposerMode = 'post' | 'story' | 'reel';
type Post = { id: string; user_id: string; image_url: string; media_type: MediaType; caption: string; created_at: string; profiles: any; };
type Story = { id: string; user_id: string; media_url: string; media_type: 'image' | 'video'; caption: string; expires_at: string; profiles: any; };

const nameEmail = (name: string) => {
  const clean = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9_]+/g, '');
  return `${clean.slice(0, 24) || 'jogador'}@rpgram.local`;
};

function MediaView({ uri, type, style }: { uri: string; type: MediaType | 'image' | 'video'; style?: any }) {
  if (type === 'video' || type === 'reel') return <VideoContent uri={uri} style={style} />;
  return <Image source={{ uri }} style={style} />;
}

function VideoContent({ uri, style }: { uri: string; style?: any }) {
  const player = useVideoPlayer(uri, p => { p.loop = true; p.muted = true; p.play(); });
  return <VideoView player={player} style={style} contentFit="cover" nativeControls={false} />;
}

export default function RPgramPolished() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [me, setMe] = useState<any>(null);
  const [composer, setComposer] = useState<ComposerMode>('post');
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [storyViewer, setStoryViewer] = useState<Story | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
      if (data.session) bootstrap(data.session.user.id);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) bootstrap(next.user.id);
      else setMe(null);
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  async function bootstrap(userId: string) {
    if (!supabase) return;
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!profile) {
      const raw = session?.user?.user_metadata || {};
      const displayName = String(raw.user_name || 'jogador').trim() || 'jogador';
      const username = displayName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '').slice(0, 20) || 'jogador';
      const result = await supabase.from('profiles').insert({ id: userId, username: `${username}${Date.now().toString().slice(-4)}`, display_name: displayName, bio: 'Aventureiro no universo RPgram.' }).select().single();
      profile = result.data;
    }
    if (profile) setMe(profile);
    await Promise.all([loadFeed(), loadStories(), loadReels()]);
  }

  async function loadFeed() {
    if (!supabase) return;
    const { data, error } = await supabase.from('posts').select('id,user_id,image_url,media_type,caption,created_at,profiles(id,username,display_name,avatar_url)').neq('media_type', 'reel').order('created_at', { ascending: false }).limit(50);
    if (error) return Alert.alert('RPgram', error.message);
    setPosts((data || []) as Post[]);
  }

  async function loadReels() {
    if (!supabase) return;
    const { data } = await supabase.from('posts').select('id,user_id,image_url,media_type,caption,created_at,profiles(id,username,display_name,avatar_url)').eq('media_type', 'reel').order('created_at', { ascending: false }).limit(50);
    setReels((data || []) as Post[]);
  }

  async function loadStories() {
    if (!supabase) return;
    const { data } = await supabase.from('stories').select('id,user_id,media_url,media_type,caption,expires_at,profiles(id,username,display_name,avatar_url)').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(50);
    setStories((data || []) as Story[]);
  }

  async function submitAuth() {
    if (!supabase) return Alert.alert('RPgram', 'Supabase não configurado.');
    const cleanName = name.trim();
    if (cleanName.length < 3) return Alert.alert('Atenção', 'Digite seu nome com pelo menos 3 caracteres.');
    if (password.length < 6) return Alert.alert('Atenção', 'A senha precisa ter pelo menos 6 caracteres.');
    setBusy(true);
    try {
      const email = nameEmail(cleanName);
      if (authMode === 'signup') {
        const exists = await supabase.from('profiles').select('id').ilike('display_name', cleanName).limit(1);
        if (exists.data?.length) throw new Error('Esse nome já está em uso. Escolha outro.');
      }
      const result = authMode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { data: { user_name: cleanName } } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (authMode === 'signup' && !result.data.session) {
        Alert.alert('Conta criada', 'A conta foi criada. Se a confirmação de e-mail estiver ativa no Supabase, desative-a para o login somente com nome e senha funcionar sem e-mail.');
      }
    } catch (e: any) {
      Alert.alert('Autenticação', e.message || 'Não foi possível concluir.');
    } finally { setBusy(false); }
  }

  async function pickMedia(kind: ComposerMode) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Mídia', 'Permita acesso às fotos e vídeos para publicar.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.86,
      allowsEditing: kind !== 'reel',
      aspect: kind === 'reel' ? [9, 16] : [1, 1],
      videoMaxDuration: kind === 'story' ? 30 : kind === 'reel' ? 90 : 60,
    });
    if (!result.canceled) setMedia(result.assets[0]);
  }

  async function publish() {
    if (!supabase || !session || !media) return Alert.alert('Publicar', 'Escolha uma foto ou vídeo.');
    setBusy(true);
    try {
      const isVideo = media.type === 'video';
      const mediaType: MediaType = composer === 'reel' ? 'reel' : isVideo ? 'video' : 'image';
      const bytes = await (await fetch(media.uri)).arrayBuffer();
      const extension = isVideo ? (media.uri.split('.').pop()?.split('?')[0] || 'mp4') : 'jpg';
      const path = `${session.user.id}/${Date.now()}.${extension}`;
      const contentType = media.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg');
      const upload = await supabase.storage.from('rpgram-media').upload(path, bytes, { contentType, upsert: false });
      if (upload.error) throw upload.error;
      const url = supabase.storage.from('rpgram-media').getPublicUrl(path).data.publicUrl;

      if (composer === 'story') {
        const result = await supabase.from('stories').insert({ user_id: session.user.id, media_url: url, media_type: isVideo ? 'video' : 'image', caption: caption.trim() });
        if (result.error) throw result.error;
      } else {
        const result = await supabase.from('posts').insert({ user_id: session.user.id, image_url: url, media_type: mediaType, caption: caption.trim() });
        if (result.error) throw result.error;
      }

      setMedia(null); setCaption(''); setTab(composer === 'reel' ? 'reels' : 'home');
      await Promise.all([loadFeed(), loadStories(), loadReels()]);
      Alert.alert('RPgram', composer === 'story' ? 'Story publicada por 24 horas.' : composer === 'reel' ? 'Reel publicado.' : 'Publicação publicada.');
    } catch (e: any) {
      Alert.alert('Publicação', e.message || 'Falha ao publicar.');
    } finally { setBusy(false); }
  }

  if (loading) return <View style={styles.boot}><Logo /><ActivityIndicator color={PURPLE} size="large" /></View>;
  if (!session) return <AuthScreen mode={authMode} setMode={setAuthMode} name={name} setName={setName} password={password} setPassword={setPassword} submit={submitAuth} busy={busy} />;

  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="light-content" />
    {tab === 'home' && <Home posts={posts} stories={stories} refresh={() => Promise.all([loadFeed(), loadStories()])} openStory={setStoryViewer} />}
    {tab === 'search' && <Search />}
    {tab === 'create' && <Create composer={composer} setComposer={setComposer} media={media} caption={caption} setCaption={setCaption} pick={() => pickMedia(composer)} publish={publish} busy={busy} />}
    {tab === 'reels' && <Reels reels={reels} />}
    {tab === 'activity' && <Empty title="Atividade" icon="notifications-outline" text="Suas curtidas, comentários e seguidores aparecerão aqui." />}
    {tab === 'profile' && <Profile me={me} logout={() => supabase?.auth.signOut()} />}
    <BottomNav tab={tab} setTab={setTab} />
    <Modal visible={!!storyViewer} transparent animationType="fade" onRequestClose={() => setStoryViewer(null)}>
      <View style={styles.storyModal}><Pressable style={styles.storyClose} onPress={() => setStoryViewer(null)}><Ionicons name="close" size={30} color="#fff" /></Pressable>{storyViewer ? <MediaView uri={storyViewer.media_url} type={storyViewer.media_type} style={styles.storyMedia} /> : null}{storyViewer?.caption ? <Text style={styles.storyCaption}>{storyViewer.caption}</Text> : null}</View>
    </Modal>
  </SafeAreaView>;
}

function Logo() { return <View style={styles.logoWrap}><View style={styles.logoMark}><Text style={styles.logoMarkText}>R</Text></View><View><Text style={styles.logo}>RPgram</Text><Text style={styles.logoBy}>MYTHØS NETWORK</Text></View></View>; }

function AuthScreen({ mode, setMode, name, setName, password, setPassword, submit, busy }: any) {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.auth}>
    <View style={styles.glow} /><Logo />
    <Text style={styles.authTitle}>{mode === 'login' ? 'Bem-vindo de volta' : 'Crie seu perfil'}</Text>
    <Text style={styles.authSub}>Entre no RPgram somente com seu nome e senha.</Text>
    <TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#766C80" autoCapitalize="words" style={styles.input} />
    <TextInput value={password} onChangeText={setPassword} placeholder="Sua senha" placeholderTextColor="#766C80" secureTextEntry style={styles.input} />
    <Pressable style={styles.primary} onPress={submit}><Text style={styles.primaryText}>{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar no RPgram' : 'Criar minha conta'}</Text><Ionicons name="arrow-forward" size={19} color="#fff" /></Pressable>
    <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}><Text style={styles.switch}>{mode === 'login' ? 'Ainda não tenho conta · Criar agora' : 'Já tenho uma conta · Entrar'}</Text></Pressable>
    <Text style={styles.company}>Criado pela Mythøs Network</Text>
  </ScrollView></SafeAreaView>;
}

function Home({ posts, stories, refresh, openStory }: any) {
  return <View style={styles.page}>
    <View style={styles.top}><Logo /><Pressable style={styles.iconButton} onPress={refresh}><Ionicons name="refresh" size={22} color="#fff" /></Pressable></View>
    <View style={styles.storyHeader}><Text style={styles.sectionTitle}>Stories</Text><Text style={styles.storyHint}>24h</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyList}>
      {stories.map((story: Story) => <Pressable key={story.id} style={styles.storyItem} onPress={() => openStory(story)}><View style={styles.storyRing}><Image source={{ uri: story.profiles?.avatar_url || fallbackAvatar }} style={styles.storyAvatar} /></View><Text numberOfLines={1} style={styles.storyName}>@{story.profiles?.username || 'jogador'}</Text></Pressable>)}
      {!stories.length ? <Text style={styles.muted}>Ainda não há Stories. Crie o primeiro.</Text> : null}
    </ScrollView>
    <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Seu feed</Text><Text style={styles.sectionSub}>Fotos e vídeos da comunidade</Text></View><Ionicons name="sparkles" size={20} color={PURPLE} /></View>
    <FlatList data={posts} keyExtractor={(x: Post) => x.id} onRefresh={refresh} refreshing={false} renderItem={({ item }: any) => <View style={styles.postCard}>
      <View style={styles.postHead}><Image source={{ uri: item.profiles?.avatar_url || fallbackAvatar }} style={styles.avatar} /><View style={{ flex: 1 }}><Text style={styles.user}>@{item.profiles?.username || 'jogador'}</Text><Text style={styles.postTime}>{item.media_type === 'video' ? 'Vídeo' : 'Foto'} · RPgram</Text></View><Ionicons name="ellipsis-horizontal" size={20} color={MUTED} /></View>
      <MediaView uri={item.image_url} type={item.media_type} style={styles.postImage} />
      <View style={styles.postActions}><Ionicons name="heart-outline" size={25} color="#fff" /><Ionicons name="chatbubble-outline" size={24} color="#fff" /><Ionicons name="paper-plane-outline" size={23} color="#fff" /></View>
      {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
    </View>} ListEmptyComponent={<View style={styles.emptyCard}><View style={styles.emptyIcon}><Ionicons name="sparkles" size={28} color={PURPLE} /></View><Text style={styles.emptyTitle}>Ainda não há publicações</Text><Text style={styles.emptyText}>Poste uma foto ou vídeo para começar a movimentar o RPgram.</Text></View>} contentContainerStyle={{ paddingBottom: 110 }} />
  </View>;
}

function Create({ composer, setComposer, media, caption, setCaption, pick, publish, busy }: any) {
  const options: [ComposerMode, string, any][] = [['post', 'Post', 'images-outline'], ['story', 'Story', 'play-circle-outline'], ['reel', 'Reel', 'film-outline']];
  return <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 110 }}>
    <Text style={styles.pageTitle}>Criar</Text>
    <View style={styles.modeRow}>{options.map(([key, label, icon]) => <Pressable key={key} onPress={() => setComposer(key)} style={[styles.modeButton, composer === key && styles.modeActive]}><Ionicons name={icon} size={19} color={composer === key ? '#fff' : MUTED} /><Text style={[styles.modeText, composer === key && styles.modeTextActive]}>{label}</Text></Pressable>)}</View>
    <Text style={styles.createHint}>{composer === 'post' ? 'Compartilhe uma foto ou vídeo.' : composer === 'story' ? 'Story desaparece automaticamente em 24 horas.' : 'Reels verticais de até 90 segundos.'}</Text>
    <Pressable onPress={pick} style={styles.mediaPicker}>{media ? <MediaView uri={media.uri} type={media.type === 'video' ? 'video' : 'image'} style={styles.mediaPreview} /> : <><Ionicons name={composer === 'reel' ? 'film-outline' : 'cloud-upload-outline'} size={44} color={PURPLE} /><Text style={styles.pickTitle}>Escolher foto ou vídeo</Text><Text style={styles.pickSub}>Galeria do aparelho</Text></>}</Pressable>
    <TextInput value={caption} onChangeText={setCaption} placeholder={composer === 'story' ? 'Texto do Story...' : 'Escreva uma legenda...'} placeholderTextColor={MUTED} style={[styles.input, styles.captionInput]} multiline />
    <Pressable style={[styles.primary, !media && { opacity: .5 }]} onPress={publish} disabled={!media || busy}><Text style={styles.primaryText}>{busy ? 'Publicando...' : composer === 'story' ? 'Publicar Story' : composer === 'reel' ? 'Publicar Reel' : 'Publicar'}</Text><Ionicons name="send" size={18} color="#fff" /></Pressable>
  </ScrollView>;
}

function Reels({ reels }: { reels: Post[] }) {
  return <View style={styles.page}><Text style={styles.pageTitle}>Reels</Text><Text style={styles.createHint}>Vídeos curtos da comunidade.</Text><FlatList data={reels} keyExtractor={x => x.id} pagingEnabled renderItem={({ item }) => <View style={styles.reelCard}><MediaView uri={item.image_url} type="reel" style={styles.reelMedia} /><View style={styles.reelOverlay}><Text style={styles.user}>@{item.profiles?.username || 'jogador'}</Text>{item.caption ? <Text style={styles.reelCaption}>{item.caption}</Text> : null}</View></View>} ListEmptyComponent={<Empty title="Ainda não há Reels" icon="film-outline" text="Publique o primeiro Reel de até 90 segundos." />} contentContainerStyle={{ paddingBottom: 100 }} /></View>;
}

function Search() { return <View style={styles.page}><Text style={styles.pageTitle}>Explorar</Text><View style={styles.searchBox}><Ionicons name="search" size={20} color={MUTED} /><TextInput placeholder="Pesquisar jogadores" placeholderTextColor={MUTED} style={styles.searchInput} /></View><Empty title="Encontre sua comunidade" icon="people-outline" text="Busque jogadores, personagens e novos companheiros de aventura." /></View>; }
function Profile({ me, logout }: any) { return <View style={styles.page}><Text style={styles.pageTitle}>Meu perfil</Text><View style={styles.profileCard}><Image source={{ uri: me?.avatar_url || fallbackAvatar }} style={styles.bigAvatar} /><Text style={styles.profileName}>{me?.display_name || 'Jogador'}</Text><Text style={styles.profileHandle}>@{me?.username || 'jogador'}</Text><Text style={styles.bio}>{me?.bio || 'Aventureiro no universo RPgram.'}</Text><Pressable style={styles.secondary} onPress={logout}><Text style={styles.secondaryText}>Sair da conta</Text></Pressable></View><Text style={styles.company}>RPgram · Criado pela Mythøs Network</Text></View>; }
function Empty({ title, icon, text }: any) { return <View style={styles.emptyScreen}><View style={styles.emptyIcon}><Ionicons name={icon} size={30} color={PURPLE} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>; }
function BottomNav({ tab, setTab }: any) { const items: [Tab, any, string][] = [['home','home','Início'],['search','search','Explorar'],['create','add-circle','Criar'],['reels','film-outline','Reels'],['activity','heart-outline','Atividade'],['profile','person-outline','Perfil']]; return <View style={styles.nav}>{items.map(([key, icon, label]) => <Pressable key={key} onPress={() => setTab(key)} style={styles.navItem}><Ionicons name={icon} size={22} color={tab === key ? PURPLE : '#81788C'} /><Text style={[styles.navLabel, tab === key && { color: '#fff' }]}>{label}</Text></Pressable>)}</View>; }

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:BG}, page:{flex:1,backgroundColor:BG,paddingHorizontal:18}, boot:{flex:1,backgroundColor:BG,alignItems:'center',justifyContent:'center',gap:28},
  auth:{flexGrow:1,padding:24,justifyContent:'center'}, glow:{position:'absolute',width:300,height:300,borderRadius:150,backgroundColor:'#3B0764',opacity:.28,top:-80,right:-120},
  logoWrap:{flexDirection:'row',alignItems:'center',gap:11}, logoMark:{width:42,height:42,borderRadius:14,backgroundColor:PURPLE_DARK,alignItems:'center',justifyContent:'center',shadowColor:PURPLE,shadowOpacity:.5,shadowRadius:16}, logoMarkText:{color:'#fff',fontSize:23,fontWeight:'900'}, logo:{color:'#fff',fontSize:30,fontWeight:'900',letterSpacing:-1}, logoBy:{color:'#8C8197',fontSize:8,fontWeight:'800',letterSpacing:2.1,marginTop:1},
  authTitle:{color:'#fff',fontSize:29,fontWeight:'900',marginTop:48}, authSub:{color:MUTED,fontSize:15,lineHeight:22,marginTop:8,marginBottom:24},
  input:{backgroundColor:'#100B17',borderWidth:1,borderColor:'#241A30',borderRadius:15,color:'#fff',padding:16,marginBottom:12,fontSize:15}, primary:{backgroundColor:PURPLE_DARK,borderRadius:15,padding:16,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:9,marginTop:4,shadowColor:PURPLE,shadowOpacity:.35,shadowRadius:12}, primaryText:{color:'#fff',fontWeight:'900',fontSize:15},
  switch:{color:'#B995E8',textAlign:'center',marginTop:20,fontWeight:'700'}, company:{color:'#62596A',textAlign:'center',fontSize:11,marginTop:28},
  top:{height:72,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, iconButton:{width:42,height:42,borderRadius:14,backgroundColor:CARD,alignItems:'center',justifyContent:'center'},
  storyHeader:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:9}, storyHint:{color:PURPLE,fontSize:11,fontWeight:'900'}, storyList:{gap:12,paddingBottom:18}, storyItem:{width:66,alignItems:'center'}, storyRing:{width:58,height:58,borderRadius:29,borderWidth:2,borderColor:PURPLE,padding:3}, storyAvatar:{width:'100%',height:'100%',borderRadius:25}, storyName:{color:'#BEB4C8',fontSize:9,marginTop:5},
  sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12}, sectionTitle:{color:'#fff',fontSize:22,fontWeight:'900'}, sectionSub:{color:MUTED,fontSize:12,marginTop:4}, muted:{color:MUTED,fontSize:12},
  postCard:{backgroundColor:CARD,borderRadius:20,borderWidth:1,borderColor:'#21172B',marginBottom:18,overflow:'hidden'}, postHead:{flexDirection:'row',alignItems:'center',padding:14,gap:11}, avatar:{width:40,height:40,borderRadius:20}, user:{color:'#fff',fontWeight:'900'}, postTime:{color:'#716779',fontSize:11,marginTop:2}, postImage:{width:'100%',aspectRatio:1}, postActions:{flexDirection:'row',gap:18,padding:14,paddingBottom:7}, caption:{color:'#E8E1EE',fontSize:14,lineHeight:20,paddingHorizontal:14,paddingBottom:15},
  emptyCard:{backgroundColor:CARD,borderRadius:22,borderWidth:1,borderColor:'#24192F',padding:28,alignItems:'center',marginTop:20}, emptyScreen:{flex:1,alignItems:'center',justifyContent:'center',padding:35}, emptyIcon:{width:68,height:68,borderRadius:22,backgroundColor:'#1B1026',alignItems:'center',justifyContent:'center',marginBottom:14}, emptyTitle:{color:'#fff',fontSize:18,fontWeight:'900',textAlign:'center'}, emptyText:{color:MUTED,fontSize:13,lineHeight:20,textAlign:'center',marginTop:8},
  pageTitle:{color:'#fff',fontSize:27,fontWeight:'900',marginTop:22,marginBottom:18}, searchBox:{height:50,borderRadius:15,backgroundColor:CARD,borderWidth:1,borderColor:'#24192F',flexDirection:'row',alignItems:'center',paddingHorizontal:14,gap:10}, searchInput:{flex:1,color:'#fff',fontSize:15},
  profileCard:{backgroundColor:CARD,borderRadius:24,borderWidth:1,borderColor:'#24192F',padding:24,alignItems:'center'}, bigAvatar:{width:100,height:100,borderRadius:50,borderWidth:3,borderColor:PURPLE,marginBottom:15}, profileName:{color:'#fff',fontSize:22,fontWeight:'900'}, profileHandle:{color:PURPLE,fontWeight:'800',marginTop:4}, bio:{color:MUTED,textAlign:'center',marginVertical:14,lineHeight:20},
  modeRow:{flexDirection:'row',gap:8,marginBottom:10}, modeButton:{flex:1,backgroundColor:CARD,borderRadius:12,borderWidth:1,borderColor:'#24192F',paddingVertical:11,alignItems:'center',gap:4}, modeActive:{backgroundColor:PURPLE_DARK,borderColor:PURPLE}, modeText:{color:MUTED,fontSize:11,fontWeight:'800'}, modeTextActive:{color:'#fff'}, createHint:{color:MUTED,fontSize:12,marginBottom:14}, mediaPicker:{height:420,borderRadius:20,borderWidth:1,borderColor:'#32213F',borderStyle:'dashed',backgroundColor:CARD,alignItems:'center',justifyContent:'center',overflow:'hidden',marginBottom:14}, mediaPreview:{width:'100%',height:'100%'}, pickTitle:{color:'#fff',fontSize:16,fontWeight:'900',marginTop:10}, pickSub:{color:MUTED,fontSize:12,marginTop:4}, captionInput:{minHeight:95,textAlignVertical:'top'},
  reelCard:{height:620,borderRadius:20,overflow:'hidden',backgroundColor:'#000',marginBottom:14}, reelMedia:{width:'100%',height:'100%'}, reelOverlay:{position:'absolute',left:18,right:18,bottom:18}, reelCaption:{color:'#fff',fontSize:14,marginTop:6,textShadowColor:'#000',textShadowRadius:8},
  storyModal:{flex:1,backgroundColor:'#000',alignItems:'center',justifyContent:'center'}, storyMedia:{width:'100%',height:'82%'}, storyClose:{position:'absolute',zIndex:2,top:48,right:20,width:42,height:42,borderRadius:21,backgroundColor:'rgba(0,0,0,.45)',alignItems:'center',justifyContent:'center'}, storyCaption:{position:'absolute',bottom:60,left:24,right:24,color:'#fff',fontSize:16,textAlign:'center'},
  secondary:{backgroundColor:'#15101C',borderWidth:1,borderColor:'#2B2037',borderRadius:15,padding:15,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:10}, secondaryText:{color:'#fff',fontWeight:'800'},
  nav:{position:'absolute',bottom:0,left:0,right:0,height:78,backgroundColor:'#0C0910',borderTopWidth:1,borderTopColor:'#241A2D',flexDirection:'row',justifyContent:'space-around',alignItems:'center',paddingBottom:7}, navItem:{alignItems:'center',gap:4,minWidth:52}, navLabel:{color:'#81788C',fontSize:9,fontWeight:'800'}
});
