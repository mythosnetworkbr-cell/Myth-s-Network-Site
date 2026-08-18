import dgram from 'node:dgram';

export type ServerInfo = {
  online: boolean; host: string; port: number; players: number; maxPlayers: number;
  hostname?: string; gamemode?: string; language?: string; latencyMs?: number; error?: string;
};

function ipBytes(host: string): Buffer {
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) throw new Error('SAMP_HOST deve ser um IPv4.');
  return Buffer.from(parts);
}

export async function querySamp(host: string, port: number, timeoutMs = 2500): Promise<ServerInfo> {
  const base: ServerInfo = { online: false, host, port, players: 0, maxPlayers: 0 };
  if (!host) return { ...base, error: 'SAMP_HOST não configurado.' };
  return await new Promise(resolve => {
    const socket = dgram.createSocket('udp4');
    const started = Date.now();
    const packet = Buffer.alloc(11);
    Buffer.from('SAMP').copy(packet, 0);
    ipBytes(host).copy(packet, 4);
    packet.writeUInt16LE(port, 8); packet.write('i', 10, 1, 'ascii');
    const finish = (result: ServerInfo) => { clearTimeout(timer); socket.close(); resolve(result); };
    const timer = setTimeout(() => finish({ ...base, error: 'Servidor sem resposta.' }), timeoutMs);
    socket.once('error', () => finish({ ...base, error: 'Falha na consulta UDP.' }));
    socket.once('message', data => {
      try {
        if (data.length < 15 || data.subarray(0, 4).toString() !== 'SAMP' || data[10] !== 105) return finish({ ...base, error: 'Resposta SAMP inválida.' });
        let offset = 11;
        const password = data.readUInt8(offset); offset += 1;
        const players = data.readUInt16LE(offset); offset += 2;
        const maxPlayers = data.readUInt16LE(offset); offset += 2;
        const readString = () => { const length = data.readUInt32LE(offset); offset += 4; const value = data.subarray(offset, offset + length).toString('utf8'); offset += length; return value; };
        finish({ online: true, host, port, players, maxPlayers, hostname: readString(), gamemode: readString(), language: readString(), latencyMs: Date.now() - started, error: password ? 'Servidor protegido por senha.' : undefined });
      } catch { finish({ ...base, error: 'Resposta SAMP incompleta.' }); }
    });
    socket.send(packet, port, host, error => { if (error) finish({ ...base, error: 'Não foi possível enviar a consulta UDP.' }); });
  });
}
