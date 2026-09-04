import type { IncomingMessage, ServerResponse } from 'node:http';
import { validateInitData } from '../telegram/session';

type AuditRequest = { initData?: string; imageDataUrl?: string; consent?: boolean };

function readBody(req: IncomingMessage): Promise<AuditRequest> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_800_000) {
        req.destroy();
        reject(new Error('Request too large'));
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  try {
    const { initData, imageDataUrl, consent } = await readBody(req);
    const user = initData && process.env.TELEGRAM_BOT_TOKEN
      ? validateInitData(initData, process.env.TELEGRAM_BOT_TOKEN)
      : null;
    if (!user) return json(res, 401, { error: 'UNAUTHORIZED' });
    if (!consent) return json(res, 400, { error: 'CONSENT_REQUIRED' });
    const matched = imageDataUrl?.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!matched || matched[2].length > 1_500_000) return json(res, 400, { error: 'INVALID_IMAGE' });
    if (!process.env.GEMINI_API_KEY) return json(res, 503, { error: 'AUDIT_NOT_CONFIGURED' });

    const model = process.env.GEMINI_AUDIT_MODEL || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: 'You review a consenting adult dating-profile photo. Return JSON only: {"summary":string,"strengths":string[],"improvements":string[],"photoQuality":number}. Focus on lighting, framing, expression, grooming, clothing and clarity. Do not identify the person, infer protected traits, estimate age, make medical claims, rank attractiveness, or state that identity/liveness is verified. photoQuality is 0-100 for technical presentation only.' },
          { inlineData: { mimeType: matched[1], data: matched[2] } },
        ] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      }),
    });
    if (!response.ok) return json(res, 502, { error: 'AUDIT_PROVIDER_ERROR' });
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return json(res, 502, { error: 'AUDIT_PROVIDER_EMPTY' });
    const audit = JSON.parse(text) as { summary?: string; strengths?: unknown; improvements?: unknown; photoQuality?: unknown };
    if (typeof audit.summary !== 'string' || !Array.isArray(audit.strengths) || !Array.isArray(audit.improvements) || typeof audit.photoQuality !== 'number') {
      return json(res, 502, { error: 'AUDIT_PROVIDER_INVALID' });
    }
    return json(res, 200, { audit: { summary: audit.summary.slice(0, 500), strengths: audit.strengths.slice(0, 4).map(String), improvements: audit.improvements.slice(0, 4).map(String), photoQuality: Math.max(0, Math.min(100, Math.round(audit.photoQuality))) } });
  } catch {
    return json(res, 400, { error: 'INVALID_REQUEST' });
  }
}
