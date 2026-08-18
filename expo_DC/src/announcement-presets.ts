import { buildEmbed, type EmbedPreset } from './embeds.js';

export const announcementPresets: Record<EmbedPreset, { label: string; titlePrefix: string }> = {
  info: { label: 'Informação', titlePrefix: 'ℹ️' },
  success: { label: 'Sucesso', titlePrefix: '✅' },
  warning: { label: 'Atenção', titlePrefix: '⚠️' },
  error: { label: 'Alerta', titlePrefix: '🚨' },
  announcement: { label: 'Anúncio', titlePrefix: '📢' },
};

export function buildPresetAnnouncement(preset: EmbedPreset, title: string, message: string) {
  const p = announcementPresets[preset];
  return buildEmbed(preset, `${p.titlePrefix} ${title}`, message);
}
