import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

const mod = (command: SlashCommandBuilder, permission: bigint) => command.setDefaultMemberPermissions(permission);

const embedCommand = (name: 'aviso' | 'embed', description: string) =>
  mod(new SlashCommandBuilder().setName(name).setDescription(description)
    .addStringOption(o => o.setName('tipo').setDescription('Tipo do embed').setRequired(true)
      .addChoices(
        { name: 'Anúncio', value: 'announcement' },
        { name: 'Informação', value: 'info' },
        { name: 'Sucesso', value: 'success' },
        { name: 'Atenção', value: 'warning' },
        { name: 'Alerta', value: 'error' },
      ))
    .addStringOption(o => o.setName('titulo').setDescription('Título do aviso').setRequired(true))
    .addStringOption(o => o.setName('mensagem').setDescription('Mensagem do aviso').setRequired(true)), PermissionFlagsBits.ManageMessages);

export const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Verifica se o bot está online.'),
  new SlashCommandBuilder().setName('server').setDescription('Mostra o status do NYX Roleplay.'),
  new SlashCommandBuilder().setName('players').setDescription('Mostra jogadores e capacidade do servidor.'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Mostra informações do usuário.'),
  new SlashCommandBuilder().setName('ticket').setDescription('Abre um atendimento com a equipe.'),
  new SlashCommandBuilder().setName('close').setDescription('Fecha o ticket atual.'),
  embedCommand('aviso', 'Publica um aviso oficial em Embed.'),
  embedCommand('embed', 'Publica um Embed personalizado de aviso.'),
  mod(new SlashCommandBuilder().setName('clear').setDescription('Apaga mensagens do canal.')
    .addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade (1-100)').setMinValue(1).setMaxValue(100).setRequired(true)), PermissionFlagsBits.ManageMessages),
  mod(new SlashCommandBuilder().setName('kick').setDescription('Expulsa um membro.')
    .addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo')), PermissionFlagsBits.KickMembers),
  mod(new SlashCommandBuilder().setName('ban').setDescription('Bane um membro.')
    .addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo')), PermissionFlagsBits.BanMembers),
  mod(new SlashCommandBuilder().setName('warn').setDescription('Registra uma advertência.')
    .addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(true)), PermissionFlagsBits.ModerateMembers),
  mod(new SlashCommandBuilder().setName('warnings').setDescription('Consulta advertências de um usuário.')
    .addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true)), PermissionFlagsBits.ModerateMembers),
  mod(new SlashCommandBuilder().setName('clearwarnings').setDescription('Remove advertências de um usuário.')
    .addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true)), PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName('whitelist').setDescription('Gerencia sua whitelist NYX.')
    .addSubcommand(s => s.setName('solicitar').setDescription('Envia uma solicitação de whitelist.')
      .addStringOption(o => o.setName('nick').setDescription('Nick no SAMP/Open.MP').setRequired(true))
      .addStringOption(o => o.setName('sampid').setDescription('ID do jogador')))
    .addSubcommand(s => s.setName('status').setDescription('Consulta sua whitelist.')),
  mod(new SlashCommandBuilder().setName('whitelist-aprovar').setDescription('Aprova uma whitelist.')
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)), PermissionFlagsBits.ManageRoles),
  mod(new SlashCommandBuilder().setName('whitelist-rejeitar').setDescription('Rejeita uma whitelist.')
    .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)), PermissionFlagsBits.ManageRoles),
].map(command => command.toJSON());
