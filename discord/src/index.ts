import 'dotenv/config';
import {
  Client,
  Collection,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  REST,
  Routes,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { commands } from './commands.js';
import { config } from './config.js';
import { closeTicket, openTicket, sendLog } from './tickets.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const handlers = new Collection<string, (interaction: ChatInputCommandInteraction) => Promise<void>>();

handlers.set('ping', async interaction => {
  await interaction.reply({ content: `Pong! Latência: ${client.ws.ping}ms.`, flags: MessageFlags.Ephemeral });
});

handlers.set('server', async interaction => {
  const host = config.serverHost ? `${config.serverHost}:${config.serverPort}` : 'não configurado';
  await interaction.reply({ embeds: [new EmbedBuilder().setTitle('NYX Roleplay').setDescription(`Servidor: \`${host}\`\nStatus: **configurado**`).setColor(0x8b0000)] });
});

handlers.set('players', async interaction => {
  await interaction.reply({ content: config.serverHost ? `📡 Consulta do servidor **${config.serverHost}:${config.serverPort}** está preparada para integração SAMP/Open.MP.` : '📡 SAMP_HOST ainda não foi configurado.', flags: MessageFlags.Ephemeral });
});

handlers.set('userinfo', async interaction => {
  const user = interaction.user;
  await interaction.reply({ content: `👤 **${user.username}**\nID: \`${user.id}\`\nConta criada: <t:${Math.floor(user.createdTimestamp / 1000)}:F>`, flags: MessageFlags.Ephemeral });
});

handlers.set('ticket', async interaction => {
  await openTicket(interaction);
});

handlers.set('close', async interaction => {
  await closeTicket(interaction);
});

handlers.set('clear', async interaction => {
  const amount = interaction.options.getInteger('quantidade', true);
  if (!interaction.channel || !('bulkDelete' in interaction.channel)) return interaction.reply({ content: 'Este canal não permite limpeza.', flags: MessageFlags.Ephemeral });
  const deleted = await interaction.channel.bulkDelete(amount, true);
  await interaction.reply({ content: `🧹 ${deleted.size} mensagens apagadas.`, flags: MessageFlags.Ephemeral });
  await sendLog(interaction.guild, `🧹 **Limpeza**\nModerador: <@${interaction.user.id}>\nQuantidade: ${deleted.size}`);
});

handlers.set('kick', async interaction => {
  const user = interaction.options.getUser('usuario', true);
  const reason = interaction.options.getString('motivo') ?? 'Sem motivo informado';
  const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
  if (!member?.kickable) return interaction.reply({ content: 'Não consigo expulsar esse membro.', flags: MessageFlags.Ephemeral });
  await member.kick(reason);
  await interaction.reply({ content: `👢 ${user} foi expulso. Motivo: **${reason}**` });
  await sendLog(interaction.guild, `👢 **Kick**\nModerador: <@${interaction.user.id}>\nMembro: <@${user.id}>\nMotivo: ${reason}`);
});

handlers.set('ban', async interaction => {
  const user = interaction.options.getUser('usuario', true);
  const reason = interaction.options.getString('motivo') ?? 'Sem motivo informado';
  const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
  if (member && !member.bannable) return interaction.reply({ content: 'Não consigo banir esse membro.', flags: MessageFlags.Ephemeral });
  await interaction.guild?.members.ban(user.id, { reason });
  await interaction.reply({ content: `🔨 ${user} foi banido. Motivo: **${reason}**` });
  await sendLog(interaction.guild, `🔨 **Ban**\nModerador: <@${interaction.user.id}>\nMembro: <@${user.id}>\nMotivo: ${reason}`);
});

handlers.set('warn', async interaction => {
  const user = interaction.options.getUser('usuario', true);
  const reason = interaction.options.getString('motivo', true);
  await interaction.reply({ content: `⚠️ Advertência registrada para ${user}. Motivo: **${reason}**` });
  await sendLog(interaction.guild, `⚠️ **Warn**\nModerador: <@${interaction.user.id}>\nMembro: <@${user.id}>\nMotivo: ${reason}`);
});

client.once(Events.ClientReady, ready => {
  ready.user.setPresence({ activities: [{ name: config.status }], status: 'online' });
  console.log(`Mythøs Bot conectado como ${ready.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const handler = handlers.get(interaction.commandName);
  if (!handler) return;
  try {
    await handler(interaction);
  } catch (error) {
    console.error(error);
    const content = 'Ocorreu um erro ao executar o comando.';
    if (interaction.replied || interaction.deferred) await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
    else await interaction.reply({ content, flags: MessageFlags.Ephemeral });
  }
});

const rest = new REST({ version: '10' }).setToken(config.token);
const route = config.guildId ? Routes.applicationGuildCommands(config.clientId, config.guildId) : Routes.applicationCommands(config.clientId);
await rest.put(route, { body: commands });
console.log(`Comandos registrados${config.guildId ? ' no servidor configurado' : ' globalmente'}.`);
await client.login(config.token);
