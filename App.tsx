import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground, Linking, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type Page = 'home' | 'download' | 'installation' | 'updates' | 'support';

const BG = '#05050a';
const CYAN = '#09d9ee';
const PURPLE = '#c20cff';
const TEXT = '#f4f2f7';
const MUTED = '#9a96a7';
const BORDER = '#292534';
const HERO = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=85';
const CITY = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=85';

const menu: { id: Page; label: string; icon: any }[] = [
  { id: 'download', label: 'DOWNLOAD', icon: 'download-outline' },
  { id: 'installation', label: 'INSTALAÇÃO', icon: 'construct-outline' },
  { id: 'updates', label: 'ATUALIZAÇÕES', icon: 'refresh-outline' },
  { id: 'support', label: 'SUPORTE', icon: 'help-circle-outline' },
];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [drawer, setDrawer] = useState(false);
  const [ticket, setTicket] = useState(false);
  const { width } = useWindowDimensions();
  const mobile = width < 760;

  const go = (p: Page) => { setPage(p); setDrawer(false); };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => go('home')}><Text style={s.brand}><Text style={s.cyan}>REDE </Text><Text style={s.purple}>MYTHØS</Text></Text></Pressable>
        <Pressable style={s.menuButton} onPress={() => setDrawer(true)} accessibilityLabel="Abrir menu">
          <Ionicons name="menu" size={38} color="#fff" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {page === 'home' && <Home mobile={mobile} openTicket={() => setTicket(true)} />}
        {page === 'download' && <Download />}
        {page === 'installation' && <Info title="INSTALAÇÃO" text="Instale o Mythøs Network Launcher e entre no servidor. O instalador e os arquivos necessários ficam centralizados nesta página." />}
        {page === 'updates' && <Info title="ATUALIZAÇÕES" text="Acompanhe as atualizações do launcher, correções e novos recursos da Mythøs Network." />}
        {page === 'support' && <Support openTicket={() => setTicket(true)} />}
      </ScrollView>

      <Modal visible={drawer} animationType="slide" transparent onRequestClose={() => setDrawer(false)}>
        <View style={s.drawerBackdrop}>
          <View style={s.drawer}>
            <View style={s.drawerTop}>
              <Text style={s.brand}><Text style={s.cyan}>REDE </Text><Text style={s.purple}>MYTHØS</Text></Text>
              <Pressable onPress={() => setDrawer(false)}><Ionicons name="close" size={34} color="#fff" /></Pressable>
            </View>
            {menu.map(item => <Pressable key={item.id} style={s.drawerItem} onPress={() => go(item.id)}>
              <Ionicons name={item.icon} size={22} color={MUTED} /><Text style={s.drawerText}>{item.label}</Text>
            </Pressable>)}
            <Pressable style={s.downloadButton} onPress={() => go('download')}>
              <Ionicons name="download-outline" size={24} color="#001014" /><Text style={s.downloadText}>BAIXAR APK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={ticket} animationType="slide" transparent onRequestClose={() => setTicket(false)}>
        <View style={s.modalBackdrop}><View style={s.ticketModal}>
          <Pressable style={s.modalClose} onPress={() => setTicket(false)}><Ionicons name="close" size={28} color="#fff" /></Pressable>
          <Text style={s.kicker}>CENTRAL DE JOGO</Text>
          <Text style={s.modalTitle}>Abrir um ticket</Text>
          <Text style={s.body}>Escolha o atendimento necessário. O site poderá integrar o sistema de tickets do Discord posteriormente.</Text>
          {['RECLAMAÇÃO CONTRA JOGADORES','ENTENDER PUNIÇÃO','RECLAMAÇÃO CONTRA ORGS','RECLAMAÇÃO TÉCNICA'].map(x => <Pressable key={x} style={s.ticketOption} onPress={() => setTicket(false)}><Ionicons name="shield-checkmark-outline" size={20} color={PURPLE}/><Text style={s.ticketOptionText}>{x}</Text></Pressable>)}
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

function Home({ mobile, openTicket }: { mobile: boolean; openTicket: () => void }) {
  return <View>
    <ImageBackground source={{ uri: HERO }} style={[s.hero, mobile && s.heroMobile]} imageStyle={s.heroImage}>
      <View style={s.heroShade}>
        <Text style={s.heroTitle}>Central de <Text style={s.purple}>jogo</Text></Text>
        <Text style={s.heroText}>Abra um ticket para que a equipe te ajude.{"\n"}Acompanhe o status e as respostas aqui.</Text>
        <Pressable style={s.outlineButton} onPress={openTicket}><Ionicons name="shield-checkmark-outline" size={21} color={PURPLE}/><Text style={s.outlineText}>MODO EQUIPE</Text></Pressable>
      </View>
    </ImageBackground>

    <View style={s.section}>
      <View style={s.sectionHead}><Text style={s.sectionTitle}>Meus{mobile ? '\n' : ' '}ingressos</Text><Pressable style={s.ticketButton} onPress={openTicket}><Text style={s.plus}>＋</Text><Text style={s.ticketButtonText}>BILHETE{mobile ? '\n' : ' '}ABRIR</Text></Pressable></View>
      <View style={s.ticketList}>
        <Ticket title="SOS" status="ABERTO" code="1F78E8" />
        <Ticket title="" status="FECHADO" code="0B43DD" />
        <Ticket title="" status="FECHADO" code="72C6FF" />
      </View>
    </View>

    <ImageBackground source={{ uri: CITY }} style={s.promo} imageStyle={s.promoImage}>
      <View style={s.promoShade}>
        <View style={s.pill}><Text style={s.pillText}>• ROLEPLAY MOBILE · BRASIL</Text></View>
        <Text style={s.promoTitle}><Text style={s.pink}>MITOS</Text>{'\n'}REDE</Text>
        <Text style={s.promoText}>Entre para a cidade mais insana do RP mobile. Vida real, trabalhos, facções, carros e muita ação direto no seu celular.</Text>
      </View>
    </ImageBackground>
  </View>;
}

function Ticket({ title, status, code }: any) { return <View style={s.ticketRow}><View><Text style={s.ticketTitle}>{title || '—'}</Text><Text style={s.ticketError}>-- Erro</Text><Text style={s.ticketCode}># {code}</Text></View><View style={[s.status, status === 'ABERTO' ? s.open : s.closed]}><Text style={s.statusText}>{status}</Text></View></View>; }

function Download() { return <View style={s.page}><Text style={s.kicker}>MYTHØS NETWORK</Text><Text style={s.pageTitle}>DOWNLOAD</Text><Text style={s.body}>Baixe o launcher oficial da Mythøs Network para acessar o RP mobile.</Text><Pressable style={s.downloadButton} onPress={() => Linking.openURL('https://github.com/mythosnetworkbr-cell/RP/releases')}><Ionicons name="download-outline" size={25} color="#001014"/><Text style={s.downloadText}>BAIXAR APK</Text></Pressable></View>; }
function Info({ title, text }: { title: string; text: string }) { return <View style={s.page}><Text style={s.kicker}>MYTHØS NETWORK</Text><Text style={s.pageTitle}>{title}</Text><Text style={s.body}>{text}</Text><View style={s.infoCard}><Ionicons name="information-circle-outline" size={30} color={CYAN}/><Text style={s.infoText}>Conteúdo desta área será integrado ao fluxo oficial do site.</Text></View></View>; }
function Support({ openTicket }: { openTicket: () => void }) { return <View style={s.page}><Text style={s.kicker}>ATENDIMENTO</Text><Text style={s.pageTitle}>SUPORTE</Text><Text style={s.body}>Precisa de ajuda? Abra um ticket e acompanhe o atendimento.</Text><Pressable style={s.downloadButton} onPress={openTicket}><Ionicons name="ticket-outline" size={25} color="#001014"/><Text style={s.downloadText}>ABRIR TICKET</Text></Pressable></View>; }

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:BG}, header:{height:105,backgroundColor:'#07070c',borderBottomWidth:1,borderBottomColor:'#252332',paddingHorizontal:46,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},brand:{fontSize:25,fontWeight:'800',letterSpacing:-1},cyan:{color:CYAN},purple:{color:PURPLE},pink:{color:'#ff37ef'},menuButton:{padding:8},hero:{height:470,justifyContent:'flex-end'},heroMobile:{height:465},heroImage:{opacity:.46},heroShade:{flex:1,justifyContent:'flex-end',paddingHorizontal:46,paddingBottom:55,backgroundColor:'rgba(2,2,7,.45)'},heroTitle:{fontSize:64,color:TEXT,fontWeight:'300',lineHeight:68},heroText:{fontSize:23,color:'#aaa5b6',lineHeight:35,marginTop:12,maxWidth:760},outlineButton:{alignSelf:'flex-start',borderWidth:2,borderColor:PURPLE,paddingHorizontal:22,paddingVertical:14,marginTop:28,flexDirection:'row',alignItems:'center',gap:10},outlineText:{color:PURPLE,fontWeight:'800',fontSize:18,letterSpacing:3},section:{paddingHorizontal:46,paddingTop:70,paddingBottom:70,backgroundColor:BG},sectionHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:35},sectionTitle:{fontSize:42,color:TEXT,fontWeight:'500',lineHeight:58},ticketButton:{backgroundColor:CYAN,minWidth:280,minHeight:92,paddingHorizontal:25,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:18},plus:{fontSize:30,color:'#001014'},ticketButtonText:{fontSize:20,fontWeight:'700',color:'#001014',letterSpacing:1,textAlign:'center'},ticketList:{borderWidth:1,borderColor:BORDER},ticketRow:{minHeight:130,borderBottomWidth:1,borderBottomColor:BORDER,paddingHorizontal:35,paddingVertical:28,flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between'},ticketTitle:{fontSize:28,color:TEXT},ticketError:{fontSize:19,color:MUTED,marginTop:6},ticketCode:{fontSize:19,color:'#817b91',marginTop:12},status:{paddingHorizontal:13,paddingVertical:8,borderWidth:2},open:{borderColor:CYAN},closed:{borderColor:'#34303d'},statusText:{fontSize:15,color:MUTED,letterSpacing:2},promo:{minHeight:620,justifyContent:'flex-end'},promoImage:{opacity:.58},promoShade:{paddingHorizontal:46,paddingBottom:70,paddingTop:80,backgroundColor:'rgba(2,4,12,.35)'},pill:{alignSelf:'flex-start',borderWidth:2,borderColor:'#0bbfd0',borderRadius:16,paddingHorizontal:20,paddingVertical:9,marginBottom:35},pillText:{color:CYAN,fontWeight:'700',letterSpacing:5,fontSize:14},promoTitle:{fontSize:70,lineHeight:72,fontWeight:'900',color:'#fff',textShadowColor:PURPLE,textShadowOffset:{width:3,height:0},textShadowRadius:1},promoText:{fontSize:26,color:'#d0ccd5',lineHeight:40,maxWidth:820,marginTop:30},drawerBackdrop:{flex:1,backgroundColor:'rgba(0,0,0,.65)'},drawer:{width:'min(100%,560px)',height:'100%',backgroundColor:'#07070c',paddingHorizontal:46,paddingTop:35,borderRightWidth:1,borderRightColor:'#302b3d'},drawerTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingBottom:35,borderBottomWidth:1,borderBottomColor:'#252332'},drawerItem:{flexDirection:'row',alignItems:'center',gap:14,paddingVertical:21},drawerText:{color:MUTED,fontSize:18,letterSpacing:4},downloadButton:{backgroundColor:CYAN,borderRadius:12,minHeight:62,paddingHorizontal:25,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,marginTop:25},downloadText:{color:'#001014',fontSize:20,fontWeight:'800',letterSpacing:1},modalBackdrop:{flex:1,backgroundColor:'rgba(0,0,0,.78)',justifyContent:'flex-end'},ticketModal:{backgroundColor:'#0b0910',borderTopWidth:1,borderTopColor:PURPLE,padding:28,paddingBottom:45},modalClose:{alignSelf:'flex-end'},kicker:{color:CYAN,fontSize:15,fontWeight:'800',letterSpacing:4,marginBottom:15},modalTitle:{color:TEXT,fontSize:38,fontWeight:'700'},body:{color:'#a9a4b2',fontSize:19,lineHeight:30,marginTop:15},ticketOption:{borderWidth:1,borderColor:BORDER,padding:17,marginTop:12,flexDirection:'row',alignItems:'center',gap:12},ticketOptionText:{color:TEXT,fontWeight:'700',fontSize:14,letterSpacing:1},page:{paddingHorizontal:46,paddingVertical:80,minHeight:650,backgroundColor:BG},pageTitle:{fontSize:60,color:TEXT,fontWeight:'800'},infoCard:{borderWidth:1,borderColor:BORDER,padding:25,marginTop:35,flexDirection:'row',gap:15},infoText:{color:'#aaa5b6',fontSize:18,flex:1}
});