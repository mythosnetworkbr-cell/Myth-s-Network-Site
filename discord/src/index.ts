import 'dotenv/config';
import {
  Client, Collection, EmbedBuilder, Events, GatewayIntentBits, MessageFlags,
  REST, Routes, type ChatInputCommandInteraction,
} from 'discord.js';
import { commands } from './commands.js';
import { config } from './config.js';
import { closeTicket, openTicket, sendLog } from './tickets.js';
import { querySamp } from './server.js';
import { addWarning, getWarnings, removeWarnings, getWhitelist, upsertWhitelist } from './store.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const handlers = new Collection<string, (i: ChatInputCommandInteraction) => Promise<void>>();

handlers.set('ping', async i => i.reply({ content: `Pong! Latência: ${client.ws.ping}ms.`, flags: MessageFlags.Ephemeral }));

handlers.set('server', async i => {
  const info = await querySamp(config.serverHost, config.serverPort);
  const embed = new EmbedBuilder().setTitle('Mythøs Network • NYX Roleplay').setColor(info.online ? 0x16a34a : 0xdc2626)
    .setDescription(info.online ? `**ONLINE**\n${info.hostname ?? 'NYX Roleplay'}\n\`${info.host}:${info.port}\`` : `**OFFLINE**\n\`${info.host || 'não configurado'}:${info.port}\`\n${info.error ?? ''}`);
  if (info.online) embed.addFields(
    { name: 'Jogadores', value: `${info.players}/${info.maxPlayers}`, inline: true },
    { name: 'Modo', value: info.gamemode || '—', inline: true },
    { name: 'Ping', value: `${info.latencyMs ?? 0} ms`, inline: true },
  );
  await i.reply({ embeds: [embed] });
});

handlers.set('players', async i => {
  const info = await querySamp(config.serverHost, config.serverPort);
  if (!info.online) return i.reply({ content: `Servidor indisponível: ${info.error ?? 'sem resposta'}`, flags: MessageFlags.Ephemeral });
  await i.reply({ content: `🎮 **NYX Roleplay**\nJogadores: **${info.players}/${info.maxPlayers}**\nModo: **${info.gamemode || '—'}**\nPing: **${info.latencyMs ?? 0} ms**` });
});

handlers.set('userinfo', async i => {
  const u = i.user;
  await i.reply({ content: `👤 **${u.username}**\nID: \`${u.id}\`\nConta: <t:${Math.floor(u.createdTimestamp / 1000)}:F>`, flags: MessageFlags.Ephemeral });
});

handlers.set('ticket', openTicket);
handlers.set('close', closeTicket);

handlers.set('clear', async i => {
  const amount = i.options.getInteger('quantidade', true);
  if (!i.channel || !('bulkDelete' in i.channel)) return i.reply({ content: 'Canal incompatível.', flags: MessageFlags.Ephemeral });
  const deleted = await i.channel.bulkDelete(amount, true);
  await i.reply({ content: `🧹 ${deleted.size} mensagens apagadas.`, flags: MessageFlags.Ephemeral });
  await sendLog(i.guild, `🧹 **Clear** — <@${i.user.id}> apagou ${deleted.size} mensagens.`);
});

handlers.set('kick', async i => {
  const user = i.options.getUser('usuario', true); const reason = i.options.getString('motivo') ?? 'Sem motivo';
  const member = await i.guild?.members.fetch(user.id).catch(() => null);
  if (!member?.kickable) return i.reply({ content: 'Não consigo expulsar esse membro.', flags: MessageFlags.Ephemeral });
  await member.kick(reason); await i.reply({ content: `👢 ${user} foi expulso. **${reason}**` });
  await sendLog(i.guild, `👢 **Kick** — <@${i.user.id}> → <@${user.id}> — ${reason}`);
});

handlers.set('ban', async i => {
  const user = i.options.getUser('usuario', true); const reason = i.options.getString('motivo') ?? 'Sem motivo';
  const member = await i.guild?.members.fetch(user.id).catch(() => null);
  if (member && !member.bannable) return i.reply({ content: 'Não consigo banir esse membro.', flags: MessageFlags.Ephemeral });
  await i.guild?.members.ban(user.id, { reason }); await i.reply({ content: `🔨 ${user} foi banido. **${reason}**` });
  await sendLog(i.guild, `🔨 **Ban** — <@${i.user.id}> → <@${user.id}> — ${reason}`);
});

handlers.set('warn', async i => {
  const user = i.options.getUser('usuario', true); const reason = i.options.getString('motivo', true);
  const item = await addWarning(user.id, i.user.id, reason);
  await i.reply({ content: `⚠️ Advertência #${item.id} registrada para ${user}. **${reason}**` });
  await sendLog(i.guild, `⚠️ **Warn** — <@${i.user.id}> → <@${user.id}> — ${reason}`);
});

handlers.set('warnings', async i => {
  const user = i.options.getUser('usuario', true); const list = await getWarnings(user.id);
  const text = list.length ? list.map((w, n) => `${n + 1}. <t:${Math.floor(new Date(w.createdAt).getTime() / 1000)}:d> — ${w.reason}`).join('\n') : 'Nenhuma advertência.';
  await i.reply({ content: `⚠️ **Advertências de ${user}**\n${text}`, flags: MessageFlags.Ephemeral });
});

handlers.set('clearwarnings', async i => {
  const user = i.options.getUser('usuario', true); const count = await removeWarnings(user.id);
  await i.reply({ content: `🧹 ${count} advertência(s) removida(s) de ${user}.`, flags: MessageFlags.Ephemeral });
  await sendLog(i.guild, `🧹 **Clear Warnings** — <@${i.user.id}> → <@${user.id}> — ${count} removidas`);
});

handlers.set('whitelist', async i => {
  const sub = i.options.getSubcommand();
  if (sub === 'solicitar') {
    const nick = i.options.getString('nick', true); const sampId = i.options.getString('sampid') ?? undefined;
    const item = await upsertWhitelist({ discordId: i.user.id, nick, sampId, status: 'pending' });
    await i.reply({ content: `📋 Solicitação enviada. Nick: **${item.nick}**\nStatus: **Pendente**`, flags: MessageFlags.Ephemeral });
    await sendLog(i.guild, `📋 **Whitelist solicitada** — <@${i.user.id}> — ${nick}`);
  } else {
    const item = await getWhitelist(i.user.id);
    await i.reply({ content: item ? `📋 Nick: **${item.nick}**\nStatus: **${item.status}**${item.sampId ? `\nSAMP ID: **${item.sampId}**` : ''}` : 'Você ainda não possui solicitação.', flags: MessageFlags.Ephemeral });
  }
});

async function decideWhitelist(i: ChatInputCommandInteraction, status: 'approved' | 'rejected') {
  const user = i.options.getUser('usuario', true); const current = await getWhitelist(user.id);
  if (!current) return i.reply({ content: 'Esse usuário não possui solicitação.', flags: MessageFlags.Ephemeral });
  const item = await upsertWhitelist({ ...current, status });
  if (status === 'approved' && config.whitelistRoleId) await i.guild?.members.fetch(user.id).then(m => m.roles.add(config.whitelistRoleId)).catch(() => undefined);
  await i.reply({ content: `Whitelist de ${user} marcada como **${status === 'approved' ? 'APROVADA' : 'REJEITADA'}**.` });
  await sendLog(i.guild, `📋 **Whitelist ${status}** — <@${i.user.id}> → <@${user.id}> — ${item.nick}`);
}
handlers.set('whitelist-aprovar', i => decideWhitelist(i, 'approved'));
handlers.set('whitelist-rejeitar', i => decideWhitelist(i, 'rejected'));

client.once(Events.ClientReady, ready => {
  ready.user.setPresence({ activities: [{ name: config.status }], status: 'online' });
  console.log(`Mythøs Bot conectado como ${ready.user.tag}`);
});

client.on(Events.InteractionCreate, async i => {
  if (!i.isChatInputCommand()) return;
  const handler = handlers.get(i.commandName); if (!handler) return;
  try { await handler(i); } catch (error) {
    console.error(error);
    const content = 'Ocorreu um erro ao executar o comando.';
    if (i.replied || i.deferred) await i.followUp({ content, flags: MessageFlags.Ephemeral });
    else await i.reply({ content, flags: MessageFlags.Ephemeral });
  }
});

const rest = new REST({ version: '10' }).setToken(config.token);
const route = config.guildId ? Routes.applicationGuildCommands(config.clientId, config.guildId) : Routes.applicationCommands(config.clientId);
await rest.put(route, { body: commands });
console.log(`Comandos registrados${config.guildId ? ' no servidor configurado' : ' globalmente'}.`);
await client.login(config.token);
