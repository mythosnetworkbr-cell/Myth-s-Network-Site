import 'dotenv/config';

export const config = {
  token: process.env.DISCORD_TOKEN ?? '',
  clientId: process.env.DISCORD_CLIENT_ID ?? '',
  guildId: process.env.DISCORD_GUILD_ID ?? '',
  status: process.env.BOT_STATUS ?? 'Mythøs Network | NYX Roleplay',
  ticketCategoryId: process.env.TICKET_CATEGORY_ID ?? '',
  supportRoleId: process.env.SUPPORT_ROLE_ID ?? '',
  logChannelId: process.env.LOG_CHANNEL_ID ?? '',
  serverHost: process.env.SAMP_HOST ?? '',
  serverPort: Number(process.env.SAMP_PORT ?? 7777),
  adminRoleId: process.env.ADMIN_ROLE_ID ?? '',
  whitelistRoleId: process.env.WHITELIST_ROLE_ID ?? '',
};

if (!config.token || !config.clientId) throw new Error('DISCORD_TOKEN e DISCORD_CLIENT_ID são obrigatórios.');
