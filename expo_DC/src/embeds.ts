import { EmbedBuilder, type ColorResolvable } from 'discord.js';

export type EmbedPreset = 'info' | 'success' | 'warning' | 'error' | 'announcement';

const colors: Record<EmbedPreset, ColorResolvable> = {
  info: 0x2563eb,
  success: 0x16a34a,
  warning: 0xf59e0b,
  error: 0xdc2626,
  announcement: 0x7c3aed,
};

export function buildEmbed(preset: EmbedPreset, title: string, description: string) {
  return new EmbedBuilder()
    .setColor(colors[preset])
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Mythøs Network • NYX Roleplay' })
    .setTimestamp();
}

export function buildAnnouncement(title: string, description: string) {
  return buildEmbed('announcement', `📢 ${title}`, description);
}
