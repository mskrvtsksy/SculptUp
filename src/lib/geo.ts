/**
 * Geolocation, Worldwide GeoNames & OpenStreetMap Nominatim Utilities
 * Strictly links Countries and Cities, provides high-accuracy GPS & reverse geocoding
 */

import {
  WorldCountry,
  WorldCity,
  WORLD_COUNTRIES,
  WORLD_CITIES,
  getCitiesByCountryId,
  findCountryByName,
  getCountryById,
  filterLocalCities,
  getCityDisplayName,
  getCountryDisplayName,
} from '../data/worldGeo';

export type { WorldCountry, WorldCity };
export {
  WORLD_COUNTRIES,
  WORLD_CITIES,
  getCitiesByCountryId,
  findCountryByName,
  getCountryById,
  filterLocalCities,
  getCityDisplayName,
  getCountryDisplayName,
};

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoLocationResult {
  city: string;
  country: string;
  countryId?: string;
  cityId?: string;
  latitude: number;
  longitude: number;
  flag?: string;
  region?: string;
  nameRu?: string;
  nameEn?: string;
}

/**
 * Backwards compatibility exports
 */
export const VERIFIED_CITIES: GeoLocationResult[] = WORLD_CITIES.map((c) => ({
  city: c.nameRu,
  country: c.countryRu,
  countryId: c.countryId,
  cityId: c.id,
  latitude: c.lat,
  longitude: c.lng,
  flag: c.flag,
  region: c.region,
}));

export const POPULAR_CITIES = VERIFIED_CITIES;

export const POPULAR_COUNTRIES: string[] = WORLD_COUNTRIES.map((c) => c.nameRu);

/**
 * Calculates distance between two coordinates in kilometers (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const calculateDistance = calculateDistanceKm;

/**
 * Finds the closest known world city for given coordinates
 */
export function getClosestCity(coords: Coordinates): GeoLocationResult {
  let closest = WORLD_CITIES[0];
  let minDistance = Infinity;

  for (const city of WORLD_CITIES) {
    const dist = calculateDistanceKm(
      coords.latitude,
      coords.longitude,
      city.lat,
      city.lng
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return {
    city: closest.nameRu,
    country: closest.countryRu,
    countryId: closest.countryId,
    cityId: closest.id,
    latitude: closest.lat,
    longitude: closest.lng,
    flag: closest.flag,
    region: closest.region,
  };
}

/**
 * Attempt high-reliability reverse geocoding
 * 1. OpenStreetMap Nominatim
 * 2. BigDataCloud Client Reverse Geocoder
 * 3. Fallback to closest world city in our database
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<GeoLocationResult> {
  // 1. Try OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'ru,en',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const detectedCity =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        addr.state ||
        data.name;
      const detectedCountry = addr.country || '';
      const countryCode = (addr.country_code || '').toUpperCase();

      if (detectedCity && detectedCountry) {
        const countryObj = getCountryById(countryCode) || findCountryByName(detectedCountry);
        return {
          city: detectedCity,
          country: countryObj ? countryObj.nameRu : detectedCountry,
          countryId: countryCode || countryObj?.id,
          latitude: lat,
          longitude: lon,
          flag: countryObj?.flag || '📍',
          region: addr.state || addr.county || addr.region,
        };
      }
    }
  } catch {
    // continue to fallback 2
  }

  // 2. Try BigDataCloud Client Geocode (fast, no CORS issues, no rate-limits)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ru`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const detectedCity = data.city || data.locality || data.principalSubdivision;
      const detectedCountry = data.countryName;
      const countryCode = (data.countryCode || '').toUpperCase();

      if (detectedCity && detectedCountry) {
        const countryObj = getCountryById(countryCode) || findCountryByName(detectedCountry);
        return {
          city: detectedCity,
          country: countryObj ? countryObj.nameRu : detectedCountry,
          countryId: countryCode || countryObj?.id,
          latitude: lat,
          longitude: lon,
          flag: countryObj?.flag || '📍',
          region: data.principalSubdivision,
        };
      }
    }
  } catch {
    // continue to fallback 3
  }

  // 3. Fallback to closest world city from our comprehensive dataset
  return getClosestCity({ latitude: lat, longitude: lon });
}

/**
 * IP-based fallback geolocation when GPS is denied or unavailable
 */
export async function detectLocationByIP(): Promise<GeoLocationResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.city && data.country_name) {
        const countryCode = (data.country_code || '').toUpperCase();
        const countryObj = getCountryById(countryCode) || findCountryByName(data.country_name);
        return {
          city: data.city,
          country: countryObj ? countryObj.nameRu : data.country_name,
          countryId: countryCode,
          latitude: data.latitude,
          longitude: data.longitude,
          flag: countryObj?.flag || '🌐',
          region: data.region,
        };
      }
    }
  } catch {
    // secondary IP geocoder
    try {
      const res = await fetch('https://freeipapi.com/api/json');
      if (res.ok) {
        const data = await res.json();
        if (data.cityName && data.countryName) {
          const countryCode = (data.countryCode || '').toUpperCase();
          const countryObj = getCountryById(countryCode);
          return {
            city: data.cityName,
            country: countryObj ? countryObj.nameRu : data.countryName,
            countryId: countryCode,
            latitude: data.latitude,
            longitude: data.longitude,
            flag: countryObj?.flag || '🌐',
            region: data.regionName,
          };
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Location search strictly respecting the chosen Country ID
 * If countryId is set (e.g. "GE"):
 *   Searches local Georgian cities first.
 *   If not found, queries OpenStreetMap strictly filtered by `&countrycodes=ge`.
 * If countryId is not set:
 *   Searches global database, then OpenStreetMap worldwide.
 */
export async function searchLocations(
  query: string,
  countryId?: string,
  lang: string = 'ru'
): Promise<GeoLocationResult[]> {
  const q = query.trim().toLowerCase();
  const countryObj = countryId ? getCountryById(countryId) : undefined;

  // 1. Local relational database search (Instant <1ms)
  const localMatches: GeoLocationResult[] = filterLocalCities(q, countryId).map((c) => ({
    city: getCityDisplayName(c, lang),
    country: countryObj ? getCountryDisplayName(countryObj, lang) : (lang !== 'ru' ? c.countryEn : c.countryRu),
    countryId: c.countryId,
    cityId: c.id,
    latitude: c.lat,
    longitude: c.lng,
    flag: c.flag,
    region: c.region,
    nameRu: c.nameRu,
    nameEn: c.nameEn,
  }));

  // If query is short or we already have good local matches, return them immediately
  if (localMatches.length >= 4 || q.length < 2) {
    return localMatches;
  }

  // 2. OpenStreetMap Nominatim with strict countrycodes filter
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`;
    if (countryId) {
      url += `&countrycodes=${countryId.toLowerCase()}`;
    }

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': lang === 'ru' ? 'ru,en' : 'en,ru',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const combined: GeoLocationResult[] = [...localMatches];

        for (const item of data) {
          const addr = item.address || {};
          const cityName =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.county ||
            item.name;
          if (!cityName) continue;

          const cCode = (addr.country_code || countryId || '').toUpperCase();
          const matchedCountry = getCountryById(cCode) || countryObj || findCountryByName(addr.country);

          const osmLat = parseFloat(item.lat);
          const osmLon = parseFloat(item.lon);

          // Check if this OSM entry corresponds to a canonical city in our WORLD_CITIES database
          const canonicalCity = WORLD_CITIES.find((wc) => {
            if (cCode && wc.countryId !== cCode) return false;
            const matchName =
              wc.nameRu.toLowerCase() === cityName.toLowerCase() ||
              wc.nameEn.toLowerCase() === cityName.toLowerCase();
            if (matchName) return true;
            // Proximity match within 20km
            const dLat = Math.abs(wc.lat - osmLat);
            const dLng = Math.abs(wc.lng - osmLon);
            return dLat < 0.18 && dLng < 0.25;
          });

          if (canonicalCity) {
            // Check if already present in combined results
            const alreadyExists = combined.some((existing) => existing.cityId === canonicalCity.id);
            if (!alreadyExists) {
              combined.push({
                city: getCityDisplayName(canonicalCity, lang),
                country: matchedCountry ? getCountryDisplayName(matchedCountry, lang) : (lang !== 'ru' ? canonicalCity.countryEn : canonicalCity.countryRu),
                countryId: canonicalCity.countryId,
                cityId: canonicalCity.id,
                latitude: canonicalCity.lat,
                longitude: canonicalCity.lng,
                flag: canonicalCity.flag,
                region: canonicalCity.region,
                nameRu: canonicalCity.nameRu,
                nameEn: canonicalCity.nameEn,
              });
            }
          } else {
            // New city discovered via OSM - deduplicate against combined
            const lowerCity = cityName.toLowerCase();
            const alreadyExists = combined.some(
              (c) =>
                (c.nameEn && c.nameEn.toLowerCase() === lowerCity) ||
                (c.nameRu && c.nameRu.toLowerCase() === lowerCity) ||
                c.city.toLowerCase() === lowerCity
            );

            if (!alreadyExists) {
              const countryDisplayName = matchedCountry
                ? getCountryDisplayName(matchedCountry, lang)
                : (addr.country || '');

              combined.push({
                city: cityName,
                country: countryDisplayName,
                countryId: cCode || matchedCountry?.id,
                latitude: osmLat,
                longitude: osmLon,
                flag: matchedCountry?.flag || countryObj?.flag || '📍',
                region: addr.state || addr.county || addr.region,
                nameRu: lang === 'ru' ? cityName : undefined,
                nameEn: lang !== 'ru' ? cityName : undefined,
              });
            }
          }
        }
        return combined.slice(0, 10);
      }
    }
  } catch {
    // Network or timeout -> return local matches
  }

  return localMatches;
}

/**
 * Check if a city is valid in a specific country
 */
export function isCityValidInCountry(cityName: string, countryId?: string): boolean {
  if (!cityName || !cityName.trim()) return false;
  const q = cityName.trim().toLowerCase();

  const citiesToCheck = countryId
    ? getCitiesByCountryId(countryId)
    : WORLD_CITIES;

  return citiesToCheck.some(
    (c) =>
      c.nameRu.toLowerCase() === q ||
      c.nameEn.toLowerCase() === q ||
      c.nameRu.toLowerCase().split('(')[0].trim() === q ||
      q.includes(c.nameRu.toLowerCase())
  );
}

export function isVerifiedCity(cityName: string, countryId?: string): boolean {
  return isCityValidInCountry(cityName, countryId);
}
