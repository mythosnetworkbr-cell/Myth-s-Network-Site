import { EmbedBuilder, type GuildMember } from 'discord.js';
import { getGuildSettings } from './store.js';

function render(template: string | undefined, member: GuildMember, projectName: string) {
  return (template ?? 'Bem-vindo(a), {user}! Você entrou em **{server}**.').replaceAll('{user}', `<@${member.id}>`).replaceAll('{username}', member.user.username).replaceAll('{server}', projectName).replaceAll('{memberCount}', String(member.guild.memberCount));
}

export async function sendWelcome(member: GuildMember) {
  const settings = await getGuildSettings(member.guild.id);
  if (!settings?.welcomeChannelId) return;
  const channel = member.guild.channels.cache.get(settings.welcomeChannelId);
  if (!channel?.isTextBased()) return;
  const embed = new EmbedBuilder().setColor(0x8b5cf6).setTitle(`Bem-vindo(a) à ${settings.projectName}`).setDescription(render(settings.welcomeMessage, member, settings.projectName)).setThumbnail(member.user.displayAvatarURL({ size: 256 })).addFields({ name: 'Membro', value: `${member.user} • #${member.guild.memberCount}`, inline: true }).setTimestamp().setFooter({ text: 'Mythøs Network • Boas-vindas' });
  await channel.send({ embeds: [embed] }).catch(() => undefined);
  if (settings.welcomeRoleId) await member.roles.add(settings.welcomeRoleId).catch(() => undefined);
}

export async function sendGoodbye(member: GuildMember) {
  const settings = await getGuildSettings(member.guild.id);
  if (!settings?.goodbyeChannelId) return;
  const channel = member.guild.channels.cache.get(settings.goodbyeChannelId);
  if (!channel?.isTextBased()) return;
  const embed = new EmbedBuilder().setColor(0xef4444).setTitle(`Até logo, ${member.user.username}`).setDescription(render(settings.goodbyeMessage, member, settings.projectName)).setThumbnail(member.user.displayAvatarURL({ size: 256 })).setTimestamp().setFooter({ text: 'Mythøs Network • Despedida' });
  await channel.send({ embeds: [embed] }).catch(() => undefined);
}
