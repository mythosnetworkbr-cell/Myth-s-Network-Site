export const TICKET_CATEGORIES = {
  reclamacao_jogadores: { label: 'Reclamação contra Jogadores', slug: 'jogadores', emoji: '👤' },
  entender_punicao: { label: 'Entender Punição', slug: 'punicao', emoji: '⚖️' },
  reclamacao_orgs: { label: 'Reclamação contra Orgs', slug: 'orgs', emoji: '🏢' },
  reclamacao_tecnica: { label: 'Reclamação Técnica', slug: 'tecnica', emoji: '🛠️' },
  marcar_acao: { label: 'Marcar Ação', slug: 'acao', emoji: '🎬' },
  solicitar_ajuda: { label: 'Solicitar Ajuda', slug: 'ajuda', emoji: '🆘' },
  seja_influencia: { label: 'Seja Influência', slug: 'influencia', emoji: '📣' },
  candidato_administracao: { label: 'Candidato a Administração', slug: 'administracao', emoji: '👮' },
} as const;

export type TicketCategoryKey = keyof typeof TICKET_CATEGORIES;
