import type { IncomingMessage, ServerResponse } from 'node:http';
import { json, readJson, telegramUser } from '../_lib/request';
import { supabaseRest } from '../_lib/supabase';

type ReportInput = { targetProfileId?: unknown; reason?: unknown; details?: unknown };
const reasons = new Set(['fake', 'spam', 'harassment', 'underage', 'other']);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  const user = telegramUser(req);
  if (!user) return json(res, 401, { error: 'UNAUTHORIZED' });
  try {
    const input = await readJson<ReportInput>(req);
    const targetProfileId = typeof input.targetProfileId === 'string' ? input.targetProfileId : '';
    const reason = typeof input.reason === 'string' ? input.reason : '';
    const details = typeof input.details === 'string' ? input.details.trim().slice(0, 1000) : '';
    if (!/^[0-9a-f-]{36}$/i.test(targetProfileId) || !reasons.has(reason)) return json(res, 400, { error: 'INVALID_REPORT' });
    const targetRows = await (await supabaseRest(`profiles?id=eq.${encodeURIComponent(targetProfileId)}&select=telegram_id`)).json() as Array<{ telegram_id: number }>;
    const target = targetRows[0]?.telegram_id;
    if (!target || target === user.id) return json(res, 404, { error: 'PROFILE_NOT_FOUND' });
    await supabaseRest('reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ reporter_telegram_id: user.id, target_telegram_id: target, reason, details }),
    });
    return json(res, 201, { ok: true });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    return json(res, status, { error: (error as Error).message === 'DATABASE_NOT_CONFIGURED' ? 'DATABASE_NOT_CONFIGURED' : 'REQUEST_FAILED' });
  }
}
