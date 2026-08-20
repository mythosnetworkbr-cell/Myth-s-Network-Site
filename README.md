# MYTHØS NETWORK SAMP

> **Roleplay. Sua cidade. Sua história.**

Portal mobile oficial da **Mythøs Network Samp**, desenvolvido com foco em smartphones Android e experiência de comunidade para servidores SAMP Roleplay.

---

## 📱 Sobre o projeto

O Mythøs Network Samp centraliza em uma única experiência web/mobile os principais recursos da comunidade:

- Autenticação e criação de conta
- Perfil do jogador
- Central de suporte e tickets
- Integração de notificações com Discord
- Links configuráveis do Discord e APK
- Servidores Roleplay e status dos servidores
- Feed e publicação de fotos
- Rede social IC para personagens
- Jornal da cidade — Mythøs Chronicle
- Mapa com zonas dos servidores
- Mercado de veículos
- Recompensa diária
- Sistema de Coins e pacotes
- Área administrativa
- Interface otimizada para smartphone

---

## 🎮 Identidade

**Marca:** Mythøs Network Samp  
**Plataforma:** Web Mobile / Android  
**Tema:** SAMP Roleplay  
**Estilo:** Dark, vermelho, preto e neon  
**Orientação:** Portrait / Smartphone

O projeto utiliza uma identidade visual inspirada no universo de GTA San Andreas / SAMP Roleplay, com personagens, cidade, veículos, facções e elementos urbanos.

---

## 🔐 Autenticação

A estrutura de autenticação suporta diferentes identificadores:

- E-mail
- Discord
- Telefone

Após o login, a aplicação pode carregar informações personalizadas da conta, servidores disponíveis, notificações e pacotes de Coins.

A tela de login foi projetada prioritariamente para dispositivos móveis, com composição vertical, imagem de fundo temática e formulário centralizado.

---

## 🎫 Tickets e suporte

O sistema de suporte segue uma separação por permissões:

### Jogador

- Pode abrir um ticket próprio.
- Pode acompanhar o próprio atendimento.
- Não visualiza tickets de outros jogadores.
- Não visualiza tickets fechados de terceiros.

### Administração

Usuários com cargo administrativo podem acessar a central de tickets conforme suas permissões.

A abertura de ticket também pode disparar uma **notificação no Discord** através de webhook configurado no ambiente do projeto.

> Webhooks, tokens e credenciais nunca devem ser colocados diretamente no código-fonte.

---

## 👑 Administração

O portal possui estrutura preparada para controle administrativo, incluindo gerenciamento de permissões e usuários.

A conta administrativa principal definida para o projeto é:

`mythosnetworkbr@gmail.com`

Essa conta deve ser tratada como administradora principal no sistema de autorização do backend, permitindo o gerenciamento de cargos de outros usuários.

---

## 🔗 Links configuráveis

A administração pode controlar os principais links exibidos no portal, incluindo:

- **Link do APK**
- **Link do Discord**

Esses valores devem ser mantidos em configuração segura/backend, evitando alterações diretamente no código da interface.

---

## 💰 Coins

O portal possui estrutura de pacotes de Coins e aplicação de cupom de boas-vindas.

A regra atual do modelo é:

**1 Coin = R$ 1,00**

Pacotes disponíveis na API:

| Coins | Valor |
|---:|---:|
| 25 | R$ 25,00 |
| 50 | R$ 50,00 |
| 80 | R$ 80,00 |
| 100 | R$ 100,00 |
| 150 | R$ 150,00 |
| 200 | R$ 200,00 |

Cupom inicial configurado: **5% de desconto**.

---

## 🌐 Recursos da comunidade

### Feed de fotos

Jogadores podem publicar fotos com:

- Avatar
- Nome
- Imagem
- Legenda
- Curtidas
- Data da publicação

### Rede social IC

Sistema de publicações dentro do universo Roleplay, no estilo de uma rede social de personagem:

- Nome do personagem
- Servidor
- @handle
- Texto
- Mídia
- Curtidas
- Data

### Mythøs Chronicle

Jornal da cidade com categorias como:

- Policial
- Eventos
- Facções
- Economia

### Mapa dinâmico

Exibe zonas e informações do servidor, incluindo atividade de jogadores e facção dominante.

### Mercado de veículos

Classificados de veículos com:

- Modelo
- Quilometragem
- Preço
- Moeda
- Contato
- Imagem
- Servidor
- Personagem vendedor

### Recompensa diária

Sistema de recompensa diária que libera Coins de acordo com o intervalo configurado.

---

## 🧰 Stack

### Frontend

- React Native
- Expo
- TypeScript
- Expo Image Picker

### Backend / API

- Java
- Spring Boot
- REST API

### Dados e infraestrutura

- Supabase
- Vercel
- GitHub

---

## 📡 API principal

Os endpoints principais seguem a estrutura `/api/v1`.

```text
POST /api/v1/auth/login
GET  /api/v1/coins/packages
GET  /api/v1/servers
GET  /api/v1/photos
POST /api/v1/photos/publish
POST /api/v1/photos/{id}/like
POST /api/v1/community/daily-reward
GET  /api/v1/community/live-map
GET  /api/v1/community/feed
POST /api/v1/community/feed/publish
GET  /api/v1/community/chronicle
GET  /api/v1/community/marketplace/vehicles
POST /api/v1/community/marketplace/vehicles
```

---

## 🚀 Desenvolvimento

Instale as dependências:

```bash
npm install
```

Execute o projeto Expo:

```bash
npx expo start
```

Para testar a versão web:

```bash
npx expo start --web
```

---

## 📦 Android / APK

Configuração Expo/EAS:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

O aplicativo utiliza orientação **portrait** e identidade própria da Mythøs Network Samp.

---

## ☁️ Deploy

O frontend web é preparado para deploy na **Vercel**.

O fluxo recomendado é:

```text
GitHub
   ↓
Vercel
   ↓
Build Expo Web
   ↓
Mythøs Network Samp
```

Qualquer alteração no `main` pode gerar um novo deployment conforme a integração configurada no projeto.

---

## 📁 Estrutura

```text
Myth-s-Network-Site/
├── .github/
├── assets/
│   ├── icon.png
│   ├── login-hero.svg
│   └── mythos-site-icon.svg
├── lib/
│   └── supabase.ts
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
├── App.tsx
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

---

## 🎨 Identidade visual

O portal utiliza:

- Fundo predominantemente preto
- Vermelho Mythøs como cor principal
- Elementos neon
- Cards escuros
- Bordas e sombras suaves
- Layout vertical para Android
- Imagens temáticas de SAMP Roleplay
- Ícone oficial da Mythøs Network

A interface deve priorizar **smartphone**, evitando componentes desktop que prejudiquem a experiência em telas pequenas.

---

## 🔒 Segurança

Nunca versionar:

- Senhas
- Tokens
- Webhooks privados do Discord
- Chaves privadas
- Credenciais do Supabase
- Segredos de autenticação

Utilize variáveis de ambiente para informações sensíveis.

Exemplo:

```env
DISCORD_WEBHOOK_URL=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
APK_URL=...
DISCORD_URL=...
```

---

## 📌 Estado do projeto

O projeto está em desenvolvimento ativo e recebe atualizações de interface, autenticação, comunidade, suporte, administração e integração com os serviços da Mythøs Network.

**Mythøs Network Samp — Viva sua história. Escreva sua lenda.**
