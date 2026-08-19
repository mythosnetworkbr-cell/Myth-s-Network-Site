import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return res.status(503).json({ error: 'Discord webhook not configured' });
  try {
    const { type, ticket } = req.body || {};
    if (!ticket || type !== 'new_ticket') return res.status(400).json({ error: 'Invalid notification' });
    const origin = req.headers.origin || 'https://rpgrambr.vercel.app';
    const embed = {
      title: '🚨 NOVO TICKET — MYTHØS NETWORK',
      color: 0xd44cff,
      fields: [
        { name: 'Categoria', value: String(ticket.category || 'Não informada'), inline: true },
        { name: 'Status', value: String(ticket.status || 'ABERTO'), inline: true },
        { name: 'Assunto', value: String(ticket.subject || 'Sem assunto') },
        { name: 'Jogador', value: String(ticket.user_email || ticket.user_id || 'Não informado'), inline: true },
      ],
      footer: { text: 'Mythøs Network • Central de Suporte' },
      timestamp: new Date().toISOString(),
    };
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'Mythøs Support', embeds: [embed], components: [{ type: 1, components: [{ type: 2, style: 5, label: 'Abrir painel', url: origin }] }] }),
    });
    if (!response.ok) return res.status(502).json({ error: 'Discord webhook rejected notification' });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Notification failed' });
  }
}
