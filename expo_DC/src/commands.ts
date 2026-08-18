import { PermissionFlagsBits, SlashCommandBuilder, ChannelType } from 'discord.js';

const mod = (command: SlashCommandBuilder, permission: bigint) => command.setDefaultMemberPermissions(permission);
const embedCommand = (name: 'aviso' | 'embed', description: string) => mod(new SlashCommandBuilder().setName(name).setDescription(description).addStringOption(o => o.setName('tipo').setDescription('Tipo do embed').setRequired(true).addChoices({ name: 'Anúncio', value: 'announcement' }, { name: 'Informação', value: 'info' }, { name: 'Sucesso', value: 'success' }, { name: 'Atenção', value: 'warning' }, { name: 'Alerta', value: 'error' })).addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true)).addStringOption(o => o.setName('mensagem').setDescription('Mensagem').setRequired(true)), PermissionFlagsBits.ManageMessages);
const setup = new SlashCommandBuilder().setName('config').setDescription('Configura o bot neste servidor.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName('projeto').setDescription('Define o nome do projeto.').addStringOption(o => o.setName('nome').setDescription('NYX Roleplay, Lex City RP, etc.').setRequired(true)))
  .addSubcommand(s => s.setName('entrada').setDescription('Define canal e cargo de boas-vindas.').addChannelOption(o => o.setName('canal').setDescription('Canal de entrada').addChannelTypes(ChannelType.GuildText).setRequired(true)).addRoleOption(o => o.setName('cargo').setDescription('Cargo automático')))
  .addSubcommand(s => s.setName('saida').setDescription('Define canal de despedida.').addChannelOption(o => o.setName('canal').setDescription('Canal de saída').addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName('mensagens').setDescription('Define textos de entrada e saída.').addStringOption(o => o.setName('entrada').setDescription('Use {user}, {username}, {server}, {memberCount}')).addStringOption(o => o.setName('saida').setDescription('Use {user}, {username}, {server}, {memberCount}')))
  .addSubcommand(s => s.setName('ver').setDescription('Mostra a configuração atual.'));
export const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Verifica se o bot está online.'),
  new SlashCommandBuilder().setName('server').setDescription('Mostra o status do servidor configurado.'),
  new SlashCommandBuilder().setName('players').setDescription('Mostra jogadores e capacidade do servidor.'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Mostra informações do usuário.'),
  new SlashCommandBuilder().setName('ticket').setDescription('Abre um atendimento com a equipe.'),
  new SlashCommandBuilder().setName('close').setDescription('Fecha o ticket atual.'),
  embedCommand('aviso', 'Publica um aviso oficial em Embed.'), embedCommand('embed', 'Publica um Embed personalizado.'), setup,
  mod(new SlashCommandBuilder().setName('clear').setDescription('Apaga mensagens do canal.').addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade (1-100)').setMinValue(1).setMaxValue(100).setRequired(true)), PermissionFlagsBits.ManageMessages),
  mod(new SlashCommandBuilder().setName('kick').setDescription('Expulsa um membro.').addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')), PermissionFlagsBits.KickMembers),
  mod(new SlashCommandBuilder().setName('ban').setDescription('Bane um membro.').addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')), PermissionFlagsBits.BanMembers),
  mod(new SlashCommandBuilder().setName('warn').setDescription('Registra uma advertência.').addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(true)), PermissionFlagsBits.ModerateMembers),
  mod(new SlashCommandBuilder().setName('warnings').setDescription('Consulta advertências.').addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true)), PermissionFlagsBits.ModerateMembers),
  mod(new SlashCommandBuilder().setName('clearwarnings').setDescription('Remove advertências.').addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true)), PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName('whitelist').setDescription('Gerencia sua whitelist.').addSubcommand(s => s.setName('solicitar').setDescription('Solicita whitelist.').addStringOption(o => o.setName('nick').setDescription('Nick').setRequired(true)).addStringOption(o => o.setName('sampid').setDescription('ID'))).addSubcommand(s => s.setName('status').setDescription('Consulta status.')),
  mod(new SlashCommandBuilder().setName('whitelist-aprovar').setDescription('Aprova whitelist.').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)), PermissionFlagsBits.ManageRoles),
  mod(new SlashCommandBuilder().setName('whitelist-rejeitar').setDescription('Rejeita whitelist.').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)), PermissionFlagsBits.ManageRoles),
].map(command => command.toJSON());
