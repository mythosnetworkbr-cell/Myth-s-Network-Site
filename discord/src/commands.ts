import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Verifica se o bot está online.'),
  new SlashCommandBuilder().setName('server').setDescription('Mostra o servidor NYX Roleplay configurado.'),
  new SlashCommandBuilder().setName('players').setDescription('Mostra o status do servidor.'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Mostra informações do usuário.'),
  new SlashCommandBuilder().setName('ticket').setDescription('Abre um atendimento com a equipe.'),
  new SlashCommandBuilder().setName('close').setDescription('Fecha o ticket atual.'),
  new SlashCommandBuilder().setName('clear').setDescription('Apaga mensagens do canal.')
    .addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade de mensagens (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('kick').setDescription('Expulsa um membro.')
    .addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName('ban').setDescription('Bane um membro.')
    .addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName('warn').setDescription('Registra uma advertência.')
    .addUserOption(o => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
].map(command => command.toJSON());
