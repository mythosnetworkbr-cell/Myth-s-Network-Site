import 'dotenv/config';
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error('DISCORD_TOKEN e DISCORD_CLIENT_ID são obrigatórios.');
}

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Verifica se o bot está online.'),
  new SlashCommandBuilder().setName('server').setDescription('Mostra o servidor NYX Roleplay configurado.'),
  new SlashCommandBuilder().setName('players').setDescription('Mostra o status básico do servidor.'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Mostra informações do seu usuário Discord.'),
  new SlashCommandBuilder().setName('ticket').setDescription('Abre um atendimento com a equipe.'),
].map(command => command.toJSON());

const commandHandlers = new Collection<string, (interaction: ChatInputCommandInteraction) => Promise<void>>();

commandHandlers.set('ping', async interaction => {
  await interaction.reply({ content: `Pong! Latência: ${client.ws.ping}ms.`, flags: MessageFlags.Ephemeral });
});

commandHandlers.set('server', async interaction => {
  await interaction.reply({
    content: '🎮 **NYX Roleplay**\nServidor configurado para a Mythøs Network. A consulta automática de jogadores será adicionada na próxima etapa.',
  });
});

commandHandlers.set('players', async interaction => {
  await interaction.reply({
    content: '📡 Status: **online/configurado**\nConsulta direta de jogadores SAMP/Open.MP será integrada na próxima etapa.',
  });
});

commandHandlers.set('userinfo', async interaction => {
  const user = interaction.user;
  await interaction.reply({
    content: `👤 **${user.username}**\nID: \`${user.id}\`\nConta criada: <t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
    flags: MessageFlags.Ephemeral,
  });
});

commandHandlers.set('ticket', async interaction => {
  await interaction.reply({
    content: '🎫 Sistema de tickets iniciado. A criação automática de canais e categorias será adicionada na próxima etapa.',
    flags: MessageFlags.Ephemeral,
  });
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, readyClient => {
  readyClient.user.setPresence({
    activities: [{ name: process.env.BOT_STATUS ?? 'Mythøs Network | NYX Roleplay' }],
    status: 'online',
  });
  console.log(`Mythøs Bot conectado como ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const handler = commandHandlers.get(interaction.commandName);
  if (!handler) return;

  try {
    await handler(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Ocorreu um erro ao executar o comando.', flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: 'Ocorreu um erro ao executar o comando.', flags: MessageFlags.Ephemeral });
    }
  }
});

const rest = new REST({ version: '10' }).setToken(token);

async function registerCommands() {
  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);
  await rest.put(route, { body: commands });
  console.log(`Comandos registrados${guildId ? ' no servidor de desenvolvimento' : ' globalmente'}.`);
}

await registerCommands();
await client.login(token);
