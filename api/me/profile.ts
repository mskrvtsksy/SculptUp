import type { IncomingMessage, ServerResponse } from 'node:http';
import { json, readJson, telegramUser } from '../_lib/request';
import { supabaseRest } from '../_lib/supabase';

type ProfileInput = {
  displayName?: unknown;
  age?: unknown;
  gender?: unknown;
  interestedIn?: unknown;
  bio?: unknown;
  city?: unknown;
  country?: unknown;
  countryId?: unknown;
  cityId?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  searchRadiusKm?: unknown;
  uiLanguage?: unknown;
  termsAccepted?: unknown;
  ageConfirmed?: unknown;
};

const string = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const finite = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;

function normalize(input: ProfileInput, telegramId: number) {
  const gender = string(input.gender, 12);
  const interestedIn = string(input.interestedIn, 12);
  if (!['male', 'female', 'nonbinary'].includes(gender) || !['male', 'female', 'all'].includes(interestedIn)) return null;
  const displayName = string(input.displayName, 60);
  const age = finite(input.age, 18, 99);
  const city = string(input.city, 100);
  const country = string(input.country, 100);
  if (!displayName || age === null || !city || !country || input.ageConfirmed !== true || input.termsAccepted !== true) return null;
  return {
    telegram_id: telegramId,
    display_name: displayName,
    age,
    gender,
    interested_in: interestedIn,
    bio: string(input.bio, 500),
    city,
    country,
    country_id: string(input.countryId, 8) || null,
    city_id: string(input.cityId, 120) || null,
    latitude: finite(input.latitude, -90, 90),
    longitude: finite(input.longitude, -180, 180),
    search_radius_km: finite(input.searchRadiusKm, 5, 150) ?? 50,
    ui_language: ['ru', 'en', 'es', 'de', 'fr'].includes(string(input.uiLanguage, 5)) ? string(input.uiLanguage, 5) : 'ru',
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = telegramUser(req);
  if (!user) return json(res, 401, { error: 'UNAUTHORIZED' });
  try {
    if (req.method === 'GET') {
      const response = await supabaseRest(`profiles?telegram_id=eq.${user.id}&select=*`);
      const rows = await response.json() as unknown[];
      return json(res, 200, { profile: rows[0] ?? null });
    }
    if (req.method === 'PUT') {
      const input = await readJson<ProfileInput>(req);
      const profile = normalize(input, user.id);
      if (!profile) return json(res, 400, { error: 'INVALID_PROFILE' });
      const response = await supabaseRest('profiles?on_conflict=telegram_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(profile),
      });
      const rows = await response.json() as unknown[];
      return json(res, 200, { profile: rows[0] ?? null });
    }
    res.setHeader('Allow', 'GET, PUT');
    return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    return json(res, status, { error: (error as Error).message === 'DATABASE_NOT_CONFIGURED' ? 'DATABASE_NOT_CONFIGURED' : 'REQUEST_FAILED' });
  }
}
