# Mythøs Network — Discord Bot

Bot oficial do Discord da Mythøs Network, isolado em `discord/` dentro deste repositório.

## Sistemas

- Status online real do servidor SA-MP via consulta UDP.
- `/server` e `/players` com jogadores, capacidade, gamemode e latência.
- Tickets privados por usuário.
- Moderação: `/clear`, `/kick`, `/ban`, `/warn`.
- Persistência local de advertências: `/warnings` e `/clearwarnings`.
- Whitelist: `/whitelist solicitar`, `/whitelist status`, aprovação e rejeição pela equipe.
- Cargo automático de whitelist quando `WHITELIST_ROLE_ID` estiver configurado.
- Logs de moderação, tickets e whitelist.
- Slash commands registrados automaticamente no servidor de desenvolvimento ou globalmente.
- Presença personalizada Mythøs Network | NYX Roleplay.

## Configuração

1. Copie `.env.example` para `.env`.
2. Crie o bot no Discord Developer Portal.
3. Preencha `DISCORD_TOKEN` e `DISCORD_CLIENT_ID`.
4. Para registro imediato dos comandos, preencha `DISCORD_GUILD_ID`.
5. Configure categoria de tickets, cargo de suporte, canal de logs e cargo de whitelist.
6. Informe `SAMP_HOST` e `SAMP_PORT` para consulta do servidor.
7. Execute `npm install` e `npm run build`.
8. Execute `npm start`.

Nunca coloque o token do bot no GitHub. Use somente variáveis de ambiente.

## Estrutura

```text
discord/
├── src/
│   ├── commands.ts
│   ├── config.ts
│   ├── index.ts
│   ├── server.ts
│   ├── store.ts
│   └── tickets.ts
├── .env.example
├── package.json
└── tsconfig.json
```

O arquivo `data.json` é criado em runtime para persistir advertências e whitelist e não deve ser versionado.
