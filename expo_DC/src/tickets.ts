import { ChannelType, PermissionFlagsBits, type ChatInputCommandInteraction, type Guild } from 'discord.js';
import { config } from './config.js';

export async function openTicket(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return interaction.reply({ content: 'Este comando só pode ser usado em um servidor.', ephemeral: true });
  const existing = guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.name === `ticket-${interaction.user.id}`);
  if (existing) return interaction.reply({ content: `Você já possui um ticket aberto: ${existing}`, ephemeral: true });
  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.id}`, type: ChannelType.GuildText, parent: config.ticketCategoryId || undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...(config.supportRoleId ? [{ id: config.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }] : []),
    ],
  });
  await channel.send(`🎫 **Atendimento Mythøs Network**\nOlá <@${interaction.user.id}>. Explique seu problema e aguarde a equipe.\n\nUse **/close** para encerrar.`);
  return interaction.reply({ content: `Ticket criado: ${channel}`, ephemeral: true });
}

export async function closeTicket(interaction: ChatInputCommandInteraction) {
  const channel = interaction.channel;
  if (!channel || channel.type !== ChannelType.GuildText || !channel.name.startsWith('ticket-')) return interaction.reply({ content: 'Use este comando dentro de um ticket.', ephemeral: true });
  await interaction.reply({ content: '🔒 Ticket encerrado. O canal será removido em 5 segundos.' });
  setTimeout(() => channel.delete('Ticket encerrado').catch(() => undefined), 5000);
}

export async function sendLog(guild: Guild | null, message: string) {
  if (!guild || !config.logChannelId) return;
  const channel = guild.channels.cache.get(config.logChannelId);
  if (channel?.isTextBased()) await channel.send(message).catch(() => undefined);
}
