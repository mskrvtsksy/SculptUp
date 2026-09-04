import type { IncomingMessage, ServerResponse } from 'node:http';
import { validateInitData, type TelegramUser } from '../telegram/session.js';

export function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

export function telegramUser(req: IncomingMessage): TelegramUser | null {
  const initData = req.headers['x-telegram-init-data'];
  const raw = Array.isArray(initData) ? initData[0] : initData;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return raw && token ? validateInitData(raw, token) : null;
}

export function readJson<T>(req: IncomingMessage, maxBytes = 32_000): Promise<T> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > maxBytes) {
        req.destroy();
        reject(new Error('REQUEST_TOO_LARGE'));
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}') as T); } catch { reject(new Error('INVALID_JSON')); }
    });
    req.on('error', reject);
  });
}
