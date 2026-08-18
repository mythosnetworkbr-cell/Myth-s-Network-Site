# Mythøs Network — Discord Bot

Bot oficial do Discord da Mythøs Network.

## Estrutura

Este bot fica isolado em `discord/` dentro do repositório `RPGRAMBR`, sem interferir no aplicativo existente.

## Configuração

1. Copie `.env.example` para `.env`.
2. Crie uma aplicação/bot no Discord Developer Portal.
3. Preencha `DISCORD_TOKEN` e `DISCORD_CLIENT_ID`.
4. Para desenvolvimento em um servidor específico, preencha `DISCORD_GUILD_ID`.
5. Execute `npm install` e depois `npm run dev`.

## Comandos iniciais

- `/ping`
- `/server`
- `/players`
- `/userinfo`
- `/ticket`

## Próximas integrações

- Tickets reais com categorias e permissões.
- Moderação e logs.
- Cargos administrativos da Mythøs Network.
- Consulta de jogadores do SAMP/Open.MP.
- Integração com a NYX Roleplay.
- Banco de dados para whitelist, contas e logs.

Nunca coloque o token do bot no GitHub. Use somente variáveis de ambiente.
