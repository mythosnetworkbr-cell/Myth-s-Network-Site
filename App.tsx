import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

type Page = 'home' | 'news' | 'ranking' | 'rules' | 'support' | 'profile';
type RankTab = 'PONTUAÇÃO' | 'NÍVEL' | 'ABATES' | 'TEMPO';

const BG = '#05070a';
const PANEL = '#090c10';
const PANEL_2 = '#0c1115';
const CYAN = '#21d7ee';
const CYAN_DARK = '#0b7887';
const PURPLE = '#d44cff';
const GOLD = '#f3c83b';
const TEXT = '#f4f5f7';
const MUTED = '#9299a3';
const GRID = '#10191f';
const BORDER = '#263038';
const DISCORD_URL = 'https://discord.com';
const APK_URL = 'https://github.com/mythosnetworkbr-cell/RP/releases';

const NEWS = [
  { tag: 'ATUALIZAÇÃO', title: 'Nova atualização da cidade', text: 'Correções, melhorias de desempenho e novidades para a experiência RP mobile.', date: '18 AGO 2026' },
  { tag: 'EVENTO', title: 'Eventos da semana', text: 'Fique atento aos eventos, recompensas e atividades especiais da Mythøs Network.', date: '17 AGO 2026' },
  { tag: 'COMUNICADO', title: 'Manutenção programada', text: 'Comunicados oficiais e informações importantes da administração serão publicados aqui.', date: '15 AGO 2026' },
];

const RANKING = [
  { pos: 1, name: 'HOME FLORIANO', org: 'LOS VAGOS', score: 9820, level: 87, kills: 421, time: '184h' },
  { pos: 2, name: 'MATEUS RP', org: 'POLÍCIA', score: 9140, level: 82, kills: 318, time: '171h' },
  { pos: 3, name: 'NYX PLAYER', org: 'BALLAS', score: 8610, level: 79, kills: 295, time: '159h' },
  { pos: 4, name: 'DARK CITY', org: 'GROVE', score: 8040, level: 73, kills: 247, time: '146h' },
  { pos: 5, name: 'KING MOBILE', org: 'MECÂNICO', score: 7620, level: 69, kills: 211, time: '138h' },
];

const RULES = [
  ['01', 'RESPEITO', 'Respeite jogadores, membros da equipe e demais participantes da comunidade.'],
  ['02', 'ROLEPLAY', 'Mantenha a interpretação do personagem e preserve a imersão da cidade.'],
  ['03', 'ANTI-RDM / VDM', 'Ataques ou atropelamentos sem contexto válido de RP são proibidos.'],
  ['04', 'CHEATS', 'Uso de modificações, scripts ou ferramentas que ofereçam vantagem é proibido.'],
  ['05', 'BUGS', 'Não explore falhas do servidor. Reporte qualquer bug encontrado à equipe.'],
  ['06', 'EQUIPE', 'Siga as orientações da administração e utilize o suporte para contestações.'],
];

const TICKET_TYPES = [
  'RECLAMAÇÃO CONTRA JOGADORES',
  'ENTENDER PUNIÇÃO',
  'RECLAMAÇÃO CONTRA ORGS',
  'RECLAMAÇÃO TÉCNICA',
];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [drawer, setDrawer] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketType, setTicketType] = useState<string | null>(null);
  const [rankTab, setRankTab] = useState<RankTab>('PONTUAÇÃO');
  const [newsModal, setNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const { width } = useWindowDimensions();
  const mobile = width < 760;

  const navigate = (next: Page) => {
    setPage(next);
    setDrawer(false);
  };

  const openTicket = (type?: string) => {
    setTicketType(type ?? null);
    setTicketOpen(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header onMenu={() => setDrawer(true)} onHome={() => navigate('home')} mobile={mobile} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {page === 'home' && <Home mobile={mobile} navigate={navigate} openTicket={() => openTicket()} />}
        {page === 'news' && <News mobile={mobile} onPublish={() => setNewsModal(true)} />}
        {page === 'ranking' && <Ranking mobile={mobile} tab={rankTab} setTab={setRankTab} />}
        {page === 'rules' && <Rules mobile={mobile} />}
        {page === 'support' && <Support mobile={mobile} openTicket={openTicket} />}
        {page === 'profile' && <Profile mobile={mobile} />}
      </ScrollView>

      <Drawer visible={drawer} mobile={mobile} close={() => setDrawer(false)} navigate={navigate} />
      <TicketModal visible={ticketOpen} close={() => setTicketOpen(false)} selectedType={ticketType} selectType={setTicketType} />
      <NewsModal visible={newsModal} close={() => setNewsModal(false)} title={newsTitle} setTitle={setNewsTitle} />
    </SafeAreaView>
  );
}

function Header({ onMenu, onHome, mobile }: { onMenu: () => void; onHome: () => void; mobile: boolean }) {
  return (
    <View style={[styles.header, mobile && styles.headerMobile]}>
      <Pressable onPress={onHome} style={styles.brandWrap}>
        <View style={styles.logoMark}><Ionicons name="flash" size={mobile ? 21 : 25} color={CYAN} /></View>
        <Text style={[styles.brand, mobile && styles.brandMobile]}>MYTHØS<Text style={styles.brandCyan}>NETWORK</Text></Text>
      </Pressable>
      <Pressable onPress={onMenu} style={styles.menuButton} accessibilityLabel="Abrir menu">
        <Ionicons name="menu" size={mobile ? 34 : 38} color={CYAN} />
      </Pressable>
    </View>
  );
}

function PageShell({ children, mobile }: { children: React.ReactNode; mobile: boolean }) {
  return <View style={[styles.pageShell, mobile && styles.pageShellMobile]}>{children}</View>;
}

function Kicker({ children, color = CYAN, icon }: { children: string; color?: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={[styles.kicker, { borderColor: color }]}>
      {icon && <Ionicons name={icon} size={18} color={color} />}
      <Text style={[styles.kickerText, { color }]}>{children}</Text>
    </View>
  );
}

function HeroTitle({ first, second }: { first: string; second: string }) {
  return <Text style={styles.heroTitle}>{first}{'\n'}<Text style={styles.heroAccent}>{second}</Text></Text>;
}

function Home({ mobile, navigate, openTicket }: { mobile: boolean; navigate: (p: Page) => void; openTicket: () => void }) {
  return (
    <View>
      <View style={[styles.hero, mobile && styles.heroMobile]}>
        <Grid />
        <View style={styles.heroGlow} />
        <View style={styles.heroContent}>
          <Kicker icon="radio">ROLEPLAY MOBILE · BRASIL</Kicker>
          <HeroTitle first="MYTHØS" second="NETWORK" />
          <Text style={styles.heroText}>Entre para a cidade mais insana do RP mobile. Vida real, trabalhos, facções, carros e muita ação direto no seu celular.</Text>
          <View style={[styles.actionRow, mobile && styles.actionColumn]}>
            <Pressable style={styles.primaryButton} onPress={() => Linking.openURL(APK_URL)}>
              <Ionicons name="download-outline" size={23} color="#031014" />
              <Text style={styles.primaryButtonText}>INICIALIZAR DOWNLOAD</Text>
            </Pressable>
            <Pressable style={styles.discordButton} onPress={() => Linking.openURL(DISCORD_URL)}>
              <Ionicons name="chatbubble-outline" size={21} color={PURPLE} />
              <Text style={styles.discordText}>ENTRAR NO DISCORD</Text>
            </Pressable>
          </View>
          <View style={styles.liveRow}><View style={styles.liveDot} /><Text style={styles.liveText}>COMUNIDADE ATIVA · ENTRE PARA A CIDADE AGORA</Text></View>
        </View>
      </View>

      <PageShell mobile={mobile}>
        <View style={styles.statsStrip}>
          <Stat label="DOWNLOADS" value="11" icon="download-outline" purple />
          <Stat label="JOGADORES ONLINE" value="247" icon="people-outline" />
          <Stat label="SERVIDOR" value="ONLINE" icon="radio" />
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View><Kicker icon="newspaper-outline">BLOG OFICIAL</Kicker><Text style={styles.sectionTitle}>NOTÍCIAS & <Text style={styles.cyanText}>COMUNICADOS</Text></Text></View>
            <Pressable style={styles.smallOutline} onPress={() => navigate('news')}><Text style={styles.smallOutlineText}>VER TODAS</Text></Pressable>
          </View>
          <View style={[styles.newsGrid, mobile && styles.newsGridMobile]}>
            {NEWS.slice(0, 3).map((n) => <NewsCard key={n.title} item={n} />)}
          </View>
        </View>

        <View style={[styles.cityBanner, mobile && styles.cityBannerMobile]}>
          <Grid />
          <View style={styles.cityGlow} />
          <Kicker icon="flash">ROLEPLAY MOBILE · BRASIL</Kicker>
          <Text style={styles.cityTitle}>A CIDADE <Text style={styles.cyanText}>É SUA.</Text></Text>
          <Text style={styles.cityText}>Construa sua história, conquiste seu espaço e viva o RP do seu jeito.</Text>
          <View style={[styles.actionRow, mobile && styles.actionColumn]}>
            <Pressable style={styles.primaryButton} onPress={() => Linking.openURL(APK_URL)}><Ionicons name="download-outline" size={22} color="#031014" /><Text style={styles.primaryButtonText}>BAIXAR AGORA</Text></Pressable>
            <Pressable style={styles.secondaryButton} onPress={openTicket}><Ionicons name="headset-outline" size={21} color={CYAN} /><Text style={styles.secondaryButtonText}>SUPORTE</Text></Pressable>
          </View>
        </View>
      </PageShell>
    </View>
  );
}

function Stat({ label, value, icon, purple }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; purple?: boolean }) {
  return <View style={styles.stat}><Ionicons name={icon} size={20} color={purple ? PURPLE : CYAN} /><View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View></View>;
}

function News({ mobile, onPublish }: { mobile: boolean; onPublish: () => void }) {
  return <PageShell mobile={mobile}>
    <View style={styles.pageIntro}><Kicker icon="newspaper-outline">BLOG OFICIAL</Kicker><HeroTitle first="NOTÍCIAS &" second="COMUNICADOS" /><Text style={styles.pageLead}>Fique por dentro de tudo que acontece no Mythøs Network: atualizações, eventos, manutenções e comunicados oficiais da administração.</Text><Pressable style={styles.primaryButton} onPress={onPublish}><Ionicons name="add" size={24} color="#031014" /><Text style={styles.primaryButtonText}>PUBLICAR NOTÍCIA</Text></Pressable></View>
    <View style={[styles.newsGrid, mobile && styles.newsGridMobile]}>{NEWS.map((n) => <NewsCard key={n.title} item={n} large />)}</View>
  </PageShell>;
}

function NewsCard({ item, large }: { item: typeof NEWS[number]; large?: boolean }) {
  return <View style={[styles.newsCard, large && styles.newsCardLarge]}>
    <View style={styles.newsImage}><Grid /><Ionicons name="newspaper-outline" size={large ? 40 : 32} color={CYAN} /></View>
    <View style={styles.newsBody}><View style={styles.newsMeta}><Text style={styles.newsTag}>{item.tag}</Text><Text style={styles.newsDate}>{item.date}</Text></View><Text style={styles.newsTitle}>{item.title}</Text><Text style={styles.newsText}>{item.text}</Text><Pressable><Text style={styles.readMore}>LER COMUNICADO →</Text></Pressable></View>
  </View>;
}

function Ranking({ mobile, tab, setTab }: { mobile: boolean; tab: RankTab; setTab: (t: RankTab) => void }) {
  const sorted = useMemo(() => [...RANKING].sort((a, b) => {
    if (tab === 'NÍVEL') return b.level - a.level;
    if (tab === 'ABATES') return b.kills - a.kills;
    if (tab === 'TEMPO') return Number(b.time.replace('h', '')) - Number(a.time.replace('h', ''));
    return b.score - a.score;
  }), [tab]);
  return <PageShell mobile={mobile}>
    <View style={styles.pageIntro}><Kicker icon="trophy-outline" color={GOLD}>PLACAR DE LÍDERES</Kicker><HeroTitle first="RANKING DE" second="JOGADORES" /><Text style={styles.pageLead}>Os melhores jogadores do servidor, classificados por diferentes estatísticas. Suba no ranking e mostre seu domínio na cidade.</Text></View>
    <View style={styles.tabWrap}>{(['PONTUAÇÃO', 'NÍVEL', 'ABATES', 'TEMPO'] as RankTab[]).map((x) => <Pressable key={x} onPress={() => setTab(x)} style={[styles.rankTab, tab === x && styles.rankTabActive]}><Ionicons name={x === 'PONTUAÇÃO' ? 'trophy-outline' : x === 'NÍVEL' ? 'diamond-outline' : x === 'ABATES' ? 'locate-outline' : 'time-outline'} size={19} color={tab === x ? '#031014' : MUTED} /><Text style={[styles.rankTabText, tab === x && styles.rankTabTextActive]}>{x}</Text></Pressable>)}</View>
    <View style={styles.rankTable}>{sorted.map((p, i) => <View key={p.name} style={[styles.rankRow, i === 0 && styles.rankFirst]}><View style={styles.rankPos}><Text style={[styles.posText, i === 0 && { color: GOLD }]}>{i + 1}</Text></View><View style={styles.avatarSmall}><Text style={styles.avatarText}>{p.name.charAt(0)}</Text></View><View style={styles.rankName}><Text style={styles.rankPlayer}>{p.name}</Text><Text style={styles.rankOrg}>{p.org}</Text></View><View style={styles.rankStat}><Text style={styles.rankStatValue}>{tab === 'NÍVEL' ? p.level : tab === 'ABATES' ? p.kills : tab === 'TEMPO' ? p.time : p.score.toLocaleString('pt-BR')}</Text><Text style={styles.rankStatLabel}>{tab}</Text></View></View>)}</View>
  </PageShell>;
}

function Rules({ mobile }: { mobile: boolean }) {
  return <PageShell mobile={mobile}>
    <View style={styles.pageIntro}><Kicker icon="shield-checkmark-outline">CÓDIGO DA CIDADE</Kicker><HeroTitle first="REGRAS DA" second="CIDADE" /><Text style={styles.pageLead}>Leia as regras antes de entrar. Elas existem para preservar um ambiente justo, organizado e divertido para todos.</Text></View>
    <View style={styles.rulesList}>{RULES.map(([num, title, text]) => <View key={num} style={styles.ruleCard}><Text style={styles.ruleNumber}>{num}</Text><View style={styles.ruleContent}><Text style={styles.ruleTitle}>{title}</Text><Text style={styles.ruleText}>{text}</Text></View><Ionicons name="chevron-forward" size={20} color={CYAN} /></View>)}</View>
  </PageShell>;
}

function Support({ mobile, openTicket }: { mobile: boolean; openTicket: (type?: string) => void }) {
  return <PageShell mobile={mobile}>
    <View style={styles.pageIntro}><Kicker icon="help-circle-outline" color={PURPLE}>CENTRAL DE SUPORTE</Kicker><HeroTitle first="CENTRAL DE" second="SUPORTE" /><Text style={styles.pageLead}>Abra um ticket para relatar problemas técnicos, denúncias de jogadores ou tirar dúvidas. Nossa equipe responde o mais rápido possível.</Text><Pressable style={styles.primaryButton} onPress={() => openTicket()}><Ionicons name="add" size={24} color="#031014" /><Text style={styles.primaryButtonText}>ABRIR TICKET</Text></Pressable></View>
    <View style={[styles.ticketGrid, mobile && styles.ticketGridMobile]}>{TICKET_TYPES.map((type, i) => <Pressable key={type} style={styles.ticketCard} onPress={() => openTicket(type)}><View style={styles.ticketIcon}><Ionicons name={i === 3 ? 'construct-outline' : 'shield-outline'} size={25} color={PURPLE} /></View><Text style={styles.ticketCardTitle}>{type}</Text><Text style={styles.ticketCardText}>Abra um atendimento específico para este assunto.</Text><Text style={styles.ticketOpen}>ABRIR →</Text></Pressable>)}</View>
  </PageShell>;
}

function Profile({ mobile }: { mobile: boolean }) {
  return <PageShell mobile={mobile}>
    <View style={styles.pageIntro}><Kicker icon="person-outline">PAINEL DO JOGADOR</Kicker><Text style={styles.profileTitle}>MEU <Text style={styles.cyanText}>PERFIL</Text></Text></View>
    <View style={styles.profileCard}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>H</Text></View><Text style={styles.profileName}>HOME FLORIANO</Text><Text style={styles.profileEmail}>homefloriano@gmail.com</Text><View style={styles.badgeRow}><View style={styles.orgBadge}><Text style={styles.orgBadgeText}>LOS VAGOS</Text></View><View style={styles.levelBadge}><Text style={styles.levelBadgeText}>NÍVEL 87</Text></View></View></View>
    <Text style={styles.statsHeading}>ESTATÍSTICAS</Text>
    <View style={[styles.profileStats, mobile && styles.profileStatsMobile]}><StatBox label="PONTUAÇÃO" value="9.820" /><StatBox label="ABATES" value="421" /><StatBox label="TEMPO DE JOGO" value="184h" /><StatBox label="RANKING" value="#1" /></View>
  </PageShell>;
}

function StatBox({ label, value }: { label: string; value: string }) { return <View style={styles.statBox}><Text style={styles.statBoxValue}>{value}</Text><Text style={styles.statBoxLabel}>{label}</Text></View>; }

function Drawer({ visible, close, navigate, mobile }: { visible: boolean; close: () => void; navigate: (p: Page) => void; mobile: boolean }) {
  const items: { page: Page; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { page: 'home', label: 'INÍCIO', icon: 'home-outline' },
    { page: 'news', label: 'NOTÍCIAS', icon: 'newspaper-outline' },
    { page: 'ranking', label: 'RANKING', icon: 'trophy-outline' },
    { page: 'rules', label: 'REGRAS', icon: 'shield-checkmark-outline' },
    { page: 'support', label: 'SUPORTE', icon: 'help-circle-outline' },
    { page: 'profile', label: 'PERFIL', icon: 'person-outline' },
  ];
  return <Modal visible={visible} animationType="fade" transparent onRequestClose={close}><View style={styles.drawerBackdrop}><View style={[styles.drawer, mobile && styles.drawerMobile]}><View style={styles.drawerHeader}><Pressable onPress={() => navigate('home')} style={styles.brandWrap}><View style={styles.logoMark}><Ionicons name="flash" size={22} color={CYAN} /></View><Text style={styles.brand}>MYTHØS<Text style={styles.brandCyan}>NETWORK</Text></Text></Pressable><Pressable onPress={close}><Ionicons name="close" size={32} color={CYAN} /></Pressable></View>{items.map((item) => <Pressable key={item.page} style={styles.drawerItem} onPress={() => navigate(item.page)}><Ionicons name={item.icon} size={22} color={MUTED} /><Text style={styles.drawerLabel}>{item.label}</Text></Pressable>)}<Pressable style={styles.drawerDownload} onPress={() => Linking.openURL(APK_URL)}><Ionicons name="download-outline" size={22} color={CYAN} /><Text style={styles.drawerDownloadText}>BAIXAR</Text></Pressable><View style={styles.drawerFooter}><View style={styles.liveDot} /><Text style={styles.drawerFooterText}>COMUNIDADE ATIVA</Text></View></View></View></Modal>;
}

function TicketModal({ visible, close, selectedType, selectType }: { visible: boolean; close: () => void; selectedType: string | null; selectType: (v: string) => void }) {
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={close}><View style={styles.modalBackdrop}><View style={styles.ticketModal}><Pressable style={styles.modalClose} onPress={close}><Ionicons name="close" size={30} color={CYAN} /></Pressable><Kicker icon="headset-outline" color={PURPLE}>CENTRAL DE SUPORTE</Kicker><Text style={styles.modalTitle}>ABRIR TICKET</Text><Text style={styles.modalText}>Selecione o assunto do atendimento.</Text>{TICKET_TYPES.map((type) => <Pressable key={type} onPress={() => selectType(type)} style={[styles.ticketOption, selectedType === type && styles.ticketOptionActive]}><Ionicons name={selectedType === type ? 'radio-button-on' : 'radio-button-off'} size={21} color={selectedType === type ? PURPLE : MUTED} /><Text style={styles.ticketOptionText}>{type}</Text></Pressable>)}<Pressable style={[styles.primaryButton, !selectedType && styles.disabledButton]} disabled={!selectedType} onPress={() => Alert.alert('Ticket', `Solicitação preparada: ${selectedType}`)}><Ionicons name="send-outline" size={21} color="#031014" /><Text style={styles.primaryButtonText}>CONTINUAR</Text></Pressable></View></View></Modal>;
}

function NewsModal({ visible, close, title, setTitle }: { visible: boolean; close: () => void; title: string; setTitle: (v: string) => void }) {
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={close}><View style={styles.modalBackdrop}><View style={styles.newsModal}><Pressable style={styles.modalClose} onPress={close}><Ionicons name="close" size={30} color={CYAN} /></Pressable><Kicker icon="create-outline">ADMINISTRAÇÃO</Kicker><Text style={styles.modalTitle}>PUBLICAR NOTÍCIA</Text><TextInput value={title} onChangeText={setTitle} placeholder="Título da notícia" placeholderTextColor="#68727b" style={styles.input} /><Pressable style={styles.primaryButton} onPress={() => { Alert.alert('Notícia', title ? 'Notícia criada como rascunho.' : 'Informe um título.'); if (title) close(); }}><Ionicons name="checkmark" size={22} color="#031014" /><Text style={styles.primaryButtonText}>SALVAR RASCUNHO</Text></Pressable></View></View></Modal>;
}

function Grid() { return <View pointerEvents="none" style={styles.gridOverlay}>{Array.from({ length: 12 }).map((_, i) => <View key={`v${i}`} style={[styles.gridV, { left: `${i * 9}%` }]} />)}{Array.from({ length: 10 }).map((_, i) => <View key={`h${i}`} style={[styles.gridH, { top: `${i * 11}%` }]} />)}</View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingBottom: 70 },
  header: { height: 78, backgroundColor: '#070a0d', borderBottomWidth: 1, borderBottomColor: '#132027', paddingHorizontal: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerMobile: { height: 68, paddingHorizontal: 18 },
  brandWrap: { flexDirection: 'row', alignItems: 'center' },
  logoMark: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  brand: { color: '#f6f7f8', fontSize: 25, fontWeight: '800', letterSpacing: -1.3 },
  brandMobile: { fontSize: 20 },
  brandCyan: { color: CYAN },
  menuButton: { padding: 5 },
  hero: { minHeight: 650, position: 'relative', overflow: 'hidden', backgroundColor: BG },
  heroMobile: { minHeight: 690 },
  gridOverlay: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', opacity: 0.9 },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: GRID },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: GRID },
  heroGlow: { position: 'absolute', width: 500, height: 500, borderRadius: 250, backgroundColor: '#063e4b', opacity: 0.17, right: -180, top: 30 },
  heroContent: { paddingHorizontal: 56, paddingTop: 100, paddingBottom: 60, maxWidth: 980 },
  kicker: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderRadius: 28, paddingHorizontal: 17, paddingVertical: 9, marginBottom: 28, backgroundColor: 'rgba(5,12,16,.55)' },
  kickerText: { fontSize: 15, fontWeight: '700', letterSpacing: 2.1 },
  heroTitle: { fontSize: 82, lineHeight: 82, fontWeight: '300', color: TEXT, letterSpacing: -2 },
  heroAccent: { color: CYAN, fontWeight: '700' },
  heroText: { color: '#a9b0b7', fontSize: 22, lineHeight: 34, marginTop: 24, maxWidth: 850 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 34 },
  actionColumn: { flexDirection: 'column', alignItems: 'stretch' },
  primaryButton: { minHeight: 58, paddingHorizontal: 25, backgroundColor: CYAN, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  primaryButtonText: { color: '#031014', fontSize: 16, fontWeight: '800', letterSpacing: 2.1 },
  discordButton: { minHeight: 58, paddingHorizontal: 25, borderWidth: 1.5, borderColor: PURPLE, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  discordText: { color: PURPLE, fontSize: 16, fontWeight: '800', letterSpacing: 2.1 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 38 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: PURPLE },
  liveText: { color: '#737d86', fontSize: 13, letterSpacing: 2.1 },
  pageShell: { paddingHorizontal: 56, paddingTop: 55, maxWidth: 1180, width: '100%', alignSelf: 'center' },
  pageShellMobile: { paddingHorizontal: 18, paddingTop: 38 },
  statsStrip: { flexDirection: 'row', borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, marginBottom: 65 },
  stat: { flex: 1, paddingHorizontal: 22, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', gap: 12, borderRightWidth: 1, borderRightColor: BORDER },
  statValue: { color: TEXT, fontSize: 20, fontWeight: '800' },
  statLabel: { color: MUTED, fontSize: 10, letterSpacing: 1.7, marginTop: 2 },
  sectionBlock: { marginBottom: 70 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 },
  sectionTitle: { color: TEXT, fontSize: 42, lineHeight: 48, fontWeight: '400', marginTop: -5 },
  cyanText: { color: CYAN },
  smallOutline: { borderWidth: 1, borderColor: BORDER, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 7 },
  smallOutlineText: { color: MUTED, fontSize: 11, letterSpacing: 1.8, fontWeight: '800' },
  newsGrid: { flexDirection: 'row', gap: 18 },
  newsGridMobile: { flexDirection: 'column' },
  newsCard: { flex: 1, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, overflow: 'hidden' },
  newsCardLarge: { minWidth: 0 },
  newsImage: { height: 150, backgroundColor: '#0a151b', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  newsBody: { padding: 20 },
  newsMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  newsTag: { color: CYAN, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  newsDate: { color: '#68727b', fontSize: 10, letterSpacing: 1 },
  newsTitle: { color: TEXT, fontSize: 23, fontWeight: '700' },
  newsText: { color: MUTED, fontSize: 14, lineHeight: 22, marginTop: 10, minHeight: 66 },
  readMore: { color: CYAN, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 16 },
  cityBanner: { minHeight: 420, borderWidth: 1, borderColor: CYAN_DARK, padding: 48, position: 'relative', overflow: 'hidden', backgroundColor: '#061016' },
  cityBannerMobile: { padding: 28, minHeight: 460 },
  cityGlow: { position: 'absolute', width: 500, height: 500, borderRadius: 250, backgroundColor: CYAN, opacity: .06, right: -160, bottom: -260 },
  cityTitle: { color: TEXT, fontSize: 58, lineHeight: 62, fontWeight: '800' },
  cityText: { color: '#a5adb4', fontSize: 18, lineHeight: 29, maxWidth: 650, marginTop: 15 },
  secondaryButton: { minHeight: 58, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 25, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  secondaryButtonText: { color: CYAN, fontSize: 16, fontWeight: '800', letterSpacing: 2.1 },
  pageIntro: { marginBottom: 50, maxWidth: 850 },
  pageLead: { color: '#9ea6ad', fontSize: 18, lineHeight: 30, marginTop: 22, maxWidth: 800 },
  tabWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  rankTab: { borderWidth: 1, borderColor: BORDER, borderRadius: 7, minHeight: 48, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankTabActive: { backgroundColor: CYAN, borderColor: CYAN },
  rankTabText: { color: MUTED, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  rankTabTextActive: { color: '#031014' },
  rankTable: { borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL },
  rankRow: { minHeight: 82, borderBottomWidth: 1, borderBottomColor: BORDER, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  rankFirst: { backgroundColor: '#0d1518' },
  rankPos: { width: 42 },
  posText: { color: MUTED, fontSize: 18, fontWeight: '800' },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: CYAN_DARK, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09161a' },
  avatarText: { color: CYAN, fontSize: 18, fontWeight: '800' },
  rankName: { flex: 1, paddingLeft: 15 },
  rankPlayer: { color: TEXT, fontSize: 15, fontWeight: '800' },
  rankOrg: { color: MUTED, fontSize: 11, letterSpacing: 1.3, marginTop: 4 },
  rankStat: { width: 110, alignItems: 'flex-end' },
  rankStatValue: { color: CYAN, fontSize: 17, fontWeight: '800' },
  rankStatLabel: { color: '#68727b', fontSize: 9, letterSpacing: 1.3, marginTop: 3 },
  rulesList: { gap: 12, marginBottom: 30 },
  ruleCard: { borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 22, flexDirection: 'row', alignItems: 'center', gap: 18 },
  ruleNumber: { color: CYAN, fontSize: 16, fontWeight: '800', width: 30 },
  ruleContent: { flex: 1 },
  ruleTitle: { color: TEXT, fontSize: 16, fontWeight: '800', letterSpacing: 1.5 },
  ruleText: { color: MUTED, fontSize: 14, lineHeight: 21, marginTop: 6 },
  ticketGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  ticketGridMobile: { flexDirection: 'column' },
  ticketCard: { flexGrow: 1, flexBasis: '45%', minHeight: 180, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 22 },
  ticketIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#592266', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  ticketCardTitle: { color: TEXT, fontSize: 15, fontWeight: '800', letterSpacing: 1.2 },
  ticketCardText: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 7 },
  ticketOpen: { color: PURPLE, fontSize: 10, fontWeight: '800', letterSpacing: 1.7, marginTop: 17 },
  profileTitle: { color: TEXT, fontSize: 54, fontWeight: '300' },
  profileCard: { borderWidth: 1, borderColor: CYAN_DARK, backgroundColor: '#071014', alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 },
  profileAvatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 2, borderColor: CYAN, alignItems: 'center', justifyContent: 'center', backgroundColor: '#091a20' },
  profileAvatarText: { color: CYAN, fontSize: 55, fontWeight: '300' },
  profileName: { color: TEXT, fontSize: 30, fontWeight: '800', marginTop: 25, textAlign: 'center' },
  profileEmail: { color: MUTED, fontSize: 15, marginTop: 5 },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
  orgBadge: { backgroundColor: CYAN, borderRadius: 18, paddingHorizontal: 17, paddingVertical: 8 },
  orgBadgeText: { color: '#031014', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  levelBadge: { borderWidth: 1, borderColor: BORDER, borderRadius: 18, paddingHorizontal: 17, paddingVertical: 8 },
  levelBadgeText: { color: MUTED, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  statsHeading: { color: TEXT, fontSize: 25, marginTop: 48, marginBottom: 18, fontWeight: '600' },
  profileStats: { flexDirection: 'row', gap: 12 },
  profileStatsMobile: { flexWrap: 'wrap' },
  statBox: { flex: 1, minWidth: 150, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 22 },
  statBoxValue: { color: CYAN, fontSize: 27, fontWeight: '800' },
  statBoxLabel: { color: MUTED, fontSize: 10, letterSpacing: 1.5, marginTop: 5 },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.72)', flexDirection: 'row' },
  drawer: { width: 360, maxWidth: '88%', height: '100%', backgroundColor: '#070a0d', borderRightWidth: 1, borderRightColor: CYAN_DARK, paddingHorizontal: 24, paddingTop: 26 },
  drawerMobile: { width: '86%', paddingHorizontal: 19 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 14 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 18 },
  drawerLabel: { color: '#c3c9ce', fontSize: 15, letterSpacing: 2.3, fontWeight: '600' },
  drawerDownload: { minHeight: 55, borderWidth: 1, borderColor: CYAN, borderRadius: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 },
  drawerDownloadText: { color: CYAN, fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  drawerFooter: { position: 'absolute', left: 24, right: 24, bottom: 28, flexDirection: 'row', alignItems: 'center', gap: 9 },
  drawerFooterText: { color: '#68727b', fontSize: 10, letterSpacing: 1.8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.8)', justifyContent: 'flex-end' },
  ticketModal: { backgroundColor: '#080c10', borderTopWidth: 1, borderTopColor: PURPLE, padding: 26, paddingBottom: 40, maxHeight: '92%' },
  newsModal: { backgroundColor: '#080c10', borderTopWidth: 1, borderTopColor: CYAN, padding: 26, paddingBottom: 40 },
  modalClose: { alignSelf: 'flex-end', marginBottom: 8 },
  modalTitle: { color: TEXT, fontSize: 34, fontWeight: '800', letterSpacing: 1 },
  modalText: { color: MUTED, fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 16 },
  ticketOption: { minHeight: 52, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 15, marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ticketOptionActive: { borderColor: PURPLE, backgroundColor: '#160c1a' },
  ticketOptionText: { color: TEXT, fontSize: 12, fontWeight: '700', letterSpacing: .8, flex: 1 },
  disabledButton: { opacity: .35, marginTop: 20 },
  input: { minHeight: 54, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, color: TEXT, paddingHorizontal: 16, fontSize: 15, borderRadius: 7, marginVertical: 20 },
});
