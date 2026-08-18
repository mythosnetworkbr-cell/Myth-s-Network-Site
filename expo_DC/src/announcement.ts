import { PermissionFlagsBits, type ChatInputCommandInteraction } from 'discord.js';
import { buildAnnouncement } from './embeds.js';

export async function sendAnnouncement(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.channel || !('send' in interaction.channel)) {
    return interaction.reply({ content: 'Este comando só pode ser usado em um canal de texto do servidor.', ephemeral: true });
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    return interaction.reply({ content: 'Você não possui permissão para enviar avisos.', ephemeral: true });
  }

  const title = interaction.options.getString('titulo', true);
  const message = interaction.options.getString('mensagem', true);
  const embed = buildAnnouncement(title, message);

  await interaction.channel.send({ embeds: [embed] });
  return interaction.reply({ content: 'Aviso publicado com sucesso.', ephemeral: true });
}
