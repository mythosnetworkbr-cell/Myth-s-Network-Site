import { ActionRowBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, type ChatInputCommandInteraction, type Guild, type StringSelectMenuInteraction } from 'discord.js';
import { config } from './config.js';

export const TICKET_TYPES = {
  reclamacao_jogadores: { label: 'Reclamação contra Jogadores', emoji: '👤', description: 'Denuncie uma conduta de outro jogador.' },
  entender_punicao: { label: 'Entender Punição', emoji: '⚖️', description: 'Solicite esclarecimentos sobre uma punição.' },
  reclamacao_orgs: { label: 'Reclamação contra Orgs', emoji: '🏢', description: 'Reclamações relacionadas a organizações.' },
  reclamacao_tecnica: { label: 'Reclamação Técnica', emoji: '🛠️', description: 'Relate problemas técnicos ou bugs.' },
  marcar_acao: { label: 'Marcar Ação', emoji: '📅', description: 'Solicite o agendamento ou marcação de uma ação.' },
  solicitar_ajuda: { label: 'Solicitar Ajuda', emoji: '🆘', description: 'Peça ajuda à equipe.' },
  seja_influencia: { label: 'Seja Influência', emoji: '⭐', description: 'Solicite informações sobre o programa de influência.' },
  candidato_administracao: { label: 'Candidato a Administração', emoji: '🛡️', description: 'Demonstre interesse em fazer parte da administração.' },
} as const;

export async function openTicket(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return interaction.reply({ content: 'Este comando só pode ser usado em um servidor.', ephemeral: true });
  const embed = new EmbedBuilder()
    .setTitle('🎫 Central de Atendimento • Mythøs Network')
    .setDescription('Selecione abaixo o motivo do seu atendimento. Um canal privado será criado exclusivamente para você e a equipe responsável.')
    .setFooter({ text: 'Mythøs Network • Atendimento' });
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket:type')
    .setPlaceholder('Selecione o tipo de atendimento...')
    .addOptions(Object.entries(TICKET_TYPES).map(([value, item]) => ({ label: item.label, value, emoji: item.emoji, description: item.description })));
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
  return interaction.reply({ embeds: [embed], components: [row] });
}

export async function createTicket(interaction: StringSelectMenuInteraction) {
  const guild = interaction.guild;
  if (!guild) return interaction.reply({ content: 'Este atendimento só pode ser aberto em um servidor.', ephemeral: true });
  const type = interaction.values[0] as keyof typeof TICKET_TYPES;
  const ticketType = TICKET_TYPES[type];
  if (!ticketType) return interaction.reply({ content: 'Tipo de atendimento inválido.', ephemeral: true });
  const existing = guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.topic?.includes(`ticket-owner:${interaction.user.id}`));
  if (existing) return interaction.reply({ content: `Você já possui um ticket aberto: ${existing}`, ephemeral: true });
  const safeName = ticketType.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
  const channel = await guild.channels.create({
    name: `ticket-${safeName}-${interaction.user.id.slice(-4)}`,
    type: ChannelType.GuildText,
    topic: `ticket-owner:${interaction.user.id} ticket-type:${type}`,
    parent: config.ticketCategoryId || undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...(config.supportRoleId ? [{ id: config.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }] : []),
    ],
  });
  const embed = new EmbedBuilder()
    .setTitle(`${ticketType.emoji} ${ticketType.label}`)
    .setDescription(`Olá <@${interaction.user.id}>. Seu atendimento foi aberto.\n\n**Categoria:** ${ticketType.label}\n\nExplique o caso com o máximo de detalhes possível e envie provas, prints ou vídeos quando necessário. A equipe responderá neste canal.`)
    .setFooter({ text: 'Use /close para encerrar o atendimento.' });
  await channel.send({ content: `<@${interaction.user.id}>${config.supportRoleId ? ` <@&${config.supportRoleId}>` : ''}`, embeds: [embed] });
  await interaction.reply({ content: `Seu atendimento foi criado: ${channel}`, ephemeral: true });
}

export async function closeTicket(interaction: ChatInputCommandInteraction) {
  const channel = interaction.channel;
  if (!channel || channel.type !== ChannelType.GuildText || !channel.topic?.includes('ticket-owner:')) return interaction.reply({ content: 'Use este comando dentro de um ticket.', ephemeral: true });
  await interaction.reply({ content: '🔒 Ticket encerrado. O canal será removido em 5 segundos.' });
  setTimeout(() => channel.delete('Ticket encerrado').catch(() => undefined), 5000);
}

export async function sendLog(guild: Guild | null, message: string) {
  if (!guild || !config.logChannelId) return;
  const channel = guild.channels.cache.get(config.logChannelId);
  if (channel?.isTextBased()) await channel.send(message).catch(() => undefined);
}
