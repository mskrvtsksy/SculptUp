import type { OnboardingData } from '../types';

async function telegramFetch(path: string, init: RequestInit = {}) {
  const initData = window.Telegram?.WebApp?.initData;
  if (!initData) throw new Error('TELEGRAM_CONTEXT_REQUIRED');
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || 'REQUEST_FAILED');
  }
  return response.json();
}

export async function saveOnboardingProfile(data: OnboardingData) {
  return telegramFetch('/api/me/profile', {
    method: 'PUT',
    body: JSON.stringify({
      displayName: data.name,
      age: data.age,
      gender: data.gender,
      interestedIn: data.interestedIn,
      bio: data.bio,
      city: data.city,
      country: data.country,
      countryId: data.countryId,
      cityId: data.cityId,
      latitude: data.latitude,
      longitude: data.longitude,
      searchRadiusKm: data.searchRadiusKm,
      uiLanguage: data.uiLanguage,
      termsAccepted: data.termsAccepted,
      ageConfirmed: data.ageConfirmed,
    }),
  });
}

export type StoredProfile = {
  display_name: string;
  age: number;
  gender: 'male' | 'female' | 'nonbinary';
  interested_in: 'male' | 'female' | 'all';
  bio: string;
  city: string;
  country: string;
  country_id: string | null;
  city_id: string | null;
  latitude: number | null;
  longitude: number | null;
  search_radius_km: number;
  ui_language: 'ru' | 'en' | 'es' | 'de' | 'fr';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  onboarding_completed_at: string | null;
};

export async function getMyProfile(): Promise<StoredProfile | null> {
  const response = await telegramFetch('/api/me/profile');
  return (response as { profile?: StoredProfile | null }).profile ?? null;
}
