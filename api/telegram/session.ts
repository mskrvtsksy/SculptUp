import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

function parseBody(req: IncomingMessage): Promise<{ initData?: string }> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 20_000) reject(new Error('Request too large'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

export function validateInitData(initData: string, botToken: string): TelegramUser | null {
  if (initData.length === 0 || initData.length > 16_000) return null;
  const params = new URLSearchParams(initData);
  const receivedHash = params.get('hash');
  const authDate = Number(params.get('auth_date'));
  const rawUser = params.get('user');
  if (!receivedHash || !rawUser || !Number.isFinite(authDate)) return null;

  // Do not accept replayed login payloads. Telegram's auth_date is in seconds.
  const now = Date.now() / 1000;
  if (authDate > now + 60 || now - authDate > 86_400) return null;

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expectedHash = createHmac('sha256', secret).update(dataCheckString).digest('hex');
  const received = Buffer.from(receivedHash, 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const user = JSON.parse(rawUser) as TelegramUser;
    return Number.isSafeInteger(user.id) && Boolean(user.first_name) ? user : null;
  } catch {
    return null;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const { initData } = await parseBody(req);
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const user = initData && token ? validateInitData(initData, token) : null;
    if (!user) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Invalid Telegram authorization' }));
    }
    return res.end(JSON.stringify({ user }));
  } catch {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Invalid request' }));
  }
}
