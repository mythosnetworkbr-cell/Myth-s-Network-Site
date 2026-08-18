import { promises as fs } from 'node:fs';
import path from 'node:path';

export type Warning = { id: string; userId: string; moderatorId: string; reason: string; createdAt: string };
export type Whitelist = { discordId: string; nick: string; sampId?: string; status: 'pending' | 'approved' | 'rejected'; updatedAt: string };
type Data = { warnings: Warning[]; whitelist: Whitelist[] };

const file = path.resolve(process.cwd(), 'data.json');
const initial: Data = { warnings: [], whitelist: [] };
let queue = Promise.resolve();

async function read(): Promise<Data> {
  try { return JSON.parse(await fs.readFile(file, 'utf8')) as Data; }
  catch { await fs.writeFile(file, JSON.stringify(initial, null, 2)); return structuredClone(initial); }
}

function write(data: Data) {
  queue = queue.then(() => fs.writeFile(file, JSON.stringify(data, null, 2)));
  return queue;
}

export async function addWarning(userId: string, moderatorId: string, reason: string): Promise<Warning> {
  const data = await read();
  const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId, moderatorId, reason, createdAt: new Date().toISOString() };
  data.warnings.push(item);
  await write(data);
  return item;
}

export async function getWarnings(userId: string) { return (await read()).warnings.filter(w => w.userId === userId); }

export async function removeWarnings(userId: string) {
  const data = await read();
  const before = data.warnings.length;
  data.warnings = data.warnings.filter(w => w.userId !== userId);
  await write(data);
  return before - data.warnings.length;
}

export async function upsertWhitelist(item: Omit<Whitelist, 'updatedAt'>) {
  const data = await read();
  const current = data.whitelist.find(w => w.discordId === item.discordId);
  const next = { ...item, updatedAt: new Date().toISOString() };
  if (current) Object.assign(current, next); else data.whitelist.push(next);
  await write(data);
  return next;
}

export async function getWhitelist(discordId: string) { return (await read()).whitelist.find(w => w.discordId === discordId); }
