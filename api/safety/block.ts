import type { IncomingMessage, ServerResponse } from 'node:http';
import { json, readJson, telegramUser } from '../_lib/request';
import { supabaseRest } from '../_lib/supabase';

type BlockInput = { targetProfileId?: unknown };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = telegramUser(req);
  if (!user) return json(res, 401, { error: 'UNAUTHORIZED' });
  try {
    const input = await readJson<BlockInput>(req);
    const targetProfileId = typeof input.targetProfileId === 'string' ? input.targetProfileId : '';
    if (!/^[0-9a-f-]{36}$/i.test(targetProfileId)) return json(res, 400, { error: 'INVALID_BLOCK' });
    const targetRows = await (await supabaseRest(`profiles?id=eq.${encodeURIComponent(targetProfileId)}&select=telegram_id`)).json() as Array<{ telegram_id: number }>;
    const target = targetRows[0]?.telegram_id;
    if (!target || target === user.id) return json(res, 404, { error: 'PROFILE_NOT_FOUND' });
    if (req.method === 'POST') {
      await supabaseRest('blocks?on_conflict=actor_telegram_id,target_telegram_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify({ actor_telegram_id: user.id, target_telegram_id: target }),
      });
      return json(res, 201, { ok: true });
    }
    if (req.method === 'DELETE') {
      await supabaseRest(`blocks?actor_telegram_id=eq.${user.id}&target_telegram_id=eq.${target}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
      return json(res, 204, {});
    }
    return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    return json(res, status, { error: (error as Error).message === 'DATABASE_NOT_CONFIGURED' ? 'DATABASE_NOT_CONFIGURED' : 'REQUEST_FAILED' });
  }
}
