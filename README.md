# 📱 RPGRAM

**RPGRAM** é uma rede social mobile criada para comunidades de **Roleplay**.

## ✨ MVP

- 🔐 Login e cadastro
- 🏠 Feed de publicações
- ❤️ Curtidas
- 🔎 Pesquisa de jogadores
- ➕ Publicação de fotos
- 👤 Perfil
- 🔔 Atividade
- 📱 Navegação mobile
- 🗄️ Estrutura Supabase
- 🔒 Row Level Security (RLS)
- 📦 Configuração para geração de APK

## 🧰 Tecnologias

- React Native
- Expo
- TypeScript
- Supabase
- Expo Image Picker

## 🚀 Instalação

```bash
npm install
```

Crie `.env` baseado em `.env.example` e preencha as credenciais públicas do Supabase. Depois execute `supabase/schema.sql` no SQL Editor do Supabase.

Para testar:

```bash
npx expo start
```

## 📦 APK

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

## 🗂️ Estrutura

```text
RPGRAMBR/
├── .github/
├── assets/
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
├── tsconfig.json
└── CONTRIBUTING.md
```

## 🛣️ Roadmap

- [ ] Feed conectado ao banco
- [ ] Upload real no Storage
- [ ] Comentários
- [ ] Seguidores/seguindo
- [ ] Chat privado
- [ ] Stories
- [ ] Notificações push
- [ ] Perfis de personagens
- [ ] Sistema de servidores RP
- [ ] Denúncias e moderação
- [ ] Painel administrativo
- [ ] Perfil verificado
- [ ] Hashtags e busca avançada
- [ ] Publicação de vídeos
- [ ] Preparação para Play Store

## 🔐 Segurança

Nunca publique `.env`, senhas, tokens ou chaves privadas. O `.gitignore` já protege arquivos de ambiente.

<!-- stable mobile web redeploy -->
