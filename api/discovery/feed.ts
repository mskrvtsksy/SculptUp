import type { IncomingMessage, ServerResponse } from 'node:http';
import { json, telegramUser } from '../_lib/request';
import { supabaseRest } from '../_lib/supabase';

/** Returns opaque profile IDs only; Telegram IDs never leave the server. */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  const user = telegramUser(req);
  if (!user) return json(res, 401, { error: 'UNAUTHORIZED' });
  try {
    const response = await supabaseRest('rpc/discovery_profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_actor: user.id, p_limit: 25 }),
    });
    const profiles = await response.json();
    return json(res, 200, { profiles });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    return json(res, status, { error: (error as Error).message === 'DATABASE_NOT_CONFIGURED' ? 'DATABASE_NOT_CONFIGURED' : 'REQUEST_FAILED' });
  }
}
