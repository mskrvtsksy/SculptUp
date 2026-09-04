/**
 * Worldwide Geolocation & GeoNames/OpenStreetMap Registry
 * Relational model: Countries linked to Cities by ID
 */

export interface WorldCountry {
  id: string; // ISO 3166-1 alpha-2 e.g. "GE", "GB", "US"
  nameRu: string;
  nameEn: string;
  flag: string;
  defaultLat: number;
  defaultLng: number;
}

export interface WorldCity {
  id: string;
  countryId: string; // Foreign Key to WorldCountry.id
  countryRu: string;
  countryEn: string;
  nameRu: string;
  nameEn: string;
  region?: string;
  lat: number;
  lng: number;
  population?: number;
  flag?: string;
}

export const WORLD_COUNTRIES: WorldCountry[] = [
  // СНГ & Кавказ & Центральная Азия
  { id: 'GE', nameRu: 'Грузия', nameEn: 'Georgia', flag: '🇬🇪', defaultLat: 41.7151, defaultLng: 44.8271 },
  { id: 'AM', nameRu: 'Армения', nameEn: 'Armenia', flag: '🇦🇲', defaultLat: 40.1792, defaultLng: 44.4991 },
  { id: 'AZ', nameRu: 'Азербайджан', nameEn: 'Azerbaijan', flag: '🇦🇿', defaultLat: 40.4093, defaultLng: 49.8671 },
  { id: 'KZ', nameRu: 'Казахстан', nameEn: 'Kazakhstan', flag: '🇰🇿', defaultLat: 51.1694, defaultLng: 71.4491 },
  { id: 'UZ', nameRu: 'Узбекистан', nameEn: 'Uzbekistan', flag: '🇺🇿', defaultLat: 41.2995, defaultLng: 69.2401 },
  { id: 'KG', nameRu: 'Кыргызстан', nameEn: 'Kyrgyzstan', flag: '🇰🇬', defaultLat: 42.8746, defaultLng: 74.5698 },
  { id: 'BY', nameRu: 'Беларусь', nameEn: 'Belarus', flag: '🇧🇾', defaultLat: 53.9045, defaultLng: 27.5615 },
  { id: 'MD', nameRu: 'Молдова', nameEn: 'Moldova', flag: '🇲🇩', defaultLat: 47.0105, defaultLng: 28.8638 },
  { id: 'TJ', nameRu: 'Таджикистан', nameEn: 'Tajikistan', flag: '🇹🇯', defaultLat: 38.5598, defaultLng: 68.787 },
  { id: 'TM', nameRu: 'Туркменистан', nameEn: 'Turkmenistan', flag: '🇹🇲', defaultLat: 37.9601, defaultLng: 58.3261 },

  // Ближний Восток & Азия
  { id: 'AE', nameRu: 'ОАЭ', nameEn: 'United Arab Emirates', flag: '🇦🇪', defaultLat: 25.2048, defaultLng: 55.2708 },
  { id: 'TR', nameRu: 'Турция', nameEn: 'Turkey', flag: '🇹🇷', defaultLat: 41.0082, defaultLng: 28.9784 },
  { id: 'TH', nameRu: 'Таиланд', nameEn: 'Thailand', flag: '🇹🇭', defaultLat: 13.7563, defaultLng: 100.5018 },
  { id: 'ID', nameRu: 'Индонезия (Бали)', nameEn: 'Indonesia', flag: '🇮🇩', defaultLat: -8.4095, defaultLng: 115.1889 },
  { id: 'CY', nameRu: 'Кипр', nameEn: 'Cyprus', flag: '🇨🇾', defaultLat: 34.7071, defaultLng: 33.0226 },
  { id: 'IL', nameRu: 'Израиль', nameEn: 'Israel', flag: '🇮🇱', defaultLat: 32.0853, defaultLng: 34.7818 },
  { id: 'QA', nameRu: 'Катар', nameEn: 'Qatar', flag: '🇶🇦', defaultLat: 25.2854, defaultLng: 51.531 },
  { id: 'SG', nameRu: 'Сингапур', nameEn: 'Singapore', flag: '🇸🇬', defaultLat: 1.3521, defaultLng: 103.8198 },
  { id: 'JP', nameRu: 'Япония', nameEn: 'Japan', flag: '🇯🇵', defaultLat: 35.6762, defaultLng: 139.6503 },
  { id: 'KR', nameRu: 'Южная Корея', nameEn: 'South Korea', flag: '🇰🇷', defaultLat: 37.5665, defaultLng: 126.978 },
  { id: 'VN', nameRu: 'Вьетнам', nameEn: 'Vietnam', flag: '🇻🇳', defaultLat: 10.8231, defaultLng: 106.6297 },
  { id: 'MY', nameRu: 'Малайзия', nameEn: 'Malaysia', flag: '🇲🇾', defaultLat: 3.139, defaultLng: 101.6869 },

  // Европа
  { id: 'GB', nameRu: 'Великобритания', nameEn: 'United Kingdom', flag: '🇬🇧', defaultLat: 51.5074, defaultLng: -0.1278 },
  { id: 'DE', nameRu: 'Германия', nameEn: 'Germany', flag: '🇩🇪', defaultLat: 52.52, defaultLng: 13.405 },
  { id: 'FR', nameRu: 'Франция', nameEn: 'France', flag: '🇫🇷', defaultLat: 48.8566, defaultLng: 2.3522 },
  { id: 'ES', nameRu: 'Испания', nameEn: 'Spain', flag: '🇪🇸', defaultLat: 40.4168, defaultLng: -3.7038 },
  { id: 'IT', nameRu: 'Италия', nameEn: 'Italy', flag: '🇮🇹', defaultLat: 41.9028, defaultLng: 12.4964 },
  { id: 'PT', nameRu: 'Португалия', nameEn: 'Portugal', flag: '🇵🇹', defaultLat: 38.7223, defaultLng: -9.1393 },
  { id: 'NL', nameRu: 'Нидерланды', nameEn: 'Netherlands', flag: '🇳🇱', defaultLat: 52.3676, defaultLng: 4.9041 },
  { id: 'PL', nameRu: 'Польша', nameEn: 'Poland', flag: '🇵🇱', defaultLat: 52.2297, defaultLng: 21.0122 },
  { id: 'RS', nameRu: 'Сербия', nameEn: 'Serbia', flag: '🇷🇸', defaultLat: 44.7866, defaultLng: 20.4489 },
  { id: 'ME', nameRu: 'Черногория', nameEn: 'Montenegro', flag: '🇲🇪', defaultLat: 42.4411, defaultLng: 19.2636 },
  { id: 'CZ', nameRu: 'Чехия', nameEn: 'Czech Republic', flag: '🇨🇿', defaultLat: 50.0755, defaultLng: 14.4378 },
  { id: 'AT', nameRu: 'Австрия', nameEn: 'Austria', flag: '🇦🇹', defaultLat: 48.2082, defaultLng: 16.3738 },
  { id: 'CH', nameRu: 'Швейцария', nameEn: 'Switzerland', flag: '🇨🇭', defaultLat: 47.3769, defaultLng: 8.5417 },
  { id: 'GR', nameRu: 'Греция', nameEn: 'Greece', flag: '🇬🇷', defaultLat: 37.9838, defaultLng: 23.7275 },
  { id: 'HU', nameRu: 'Венгрия', nameEn: 'Hungary', flag: '🇭🇺', defaultLat: 47.4979, defaultLng: 19.0402 },
  { id: 'FI', nameRu: 'Финляндия', nameEn: 'Finland', flag: '🇫🇮', defaultLat: 60.1699, defaultLng: 24.9384 },
  { id: 'SE', nameRu: 'Швеция', nameEn: 'Sweden', flag: '🇸🇪', defaultLat: 59.3293, defaultLng: 18.0686 },
  { id: 'NO', nameRu: 'Норвегия', nameEn: 'Norway', flag: '🇳🇴', defaultLat: 59.9139, defaultLng: 10.7522 },
  { id: 'RO', nameRu: 'Румыния', nameEn: 'Romania', flag: '🇷🇴', defaultLat: 44.4268, defaultLng: 26.1025 },
  { id: 'BG', nameRu: 'Болгария', nameEn: 'Bulgaria', flag: '🇧🇬', defaultLat: 42.6977, defaultLng: 23.3219 },

  // Северная & Южная Америка
  { id: 'US', nameRu: 'США', nameEn: 'United States', flag: '🇺🇸', defaultLat: 40.7128, defaultLng: -74.006 },
  { id: 'CA', nameRu: 'Канада', nameEn: 'Canada', flag: '🇨🇦', defaultLat: 43.6532, defaultLng: -79.3832 },
  { id: 'MX', nameRu: 'Мексика', nameEn: 'Mexico', flag: '🇲🇽', defaultLat: 19.4326, defaultLng: -99.1332 },
  { id: 'BR', nameRu: 'Бразилия', nameEn: 'Brazil', flag: '🇧🇷', defaultLat: -23.5505, defaultLng: -46.6333 },
  { id: 'AR', nameRu: 'Аргентина', nameEn: 'Argentina', flag: '🇦🇷', defaultLat: -34.6037, defaultLng: -58.3816 },

  // Россия
  { id: 'RU', nameRu: 'Россия', nameEn: 'Russia', flag: '🇷🇺', defaultLat: 55.7558, defaultLng: 37.6173 },
];

export const WORLD_CITIES: WorldCity[] = [
  // ==========================================
  // ГРУЗИЯ (GE) - ПОЛНАЯ БАЗА
  // ==========================================
  { id: 'ge_tbilisi', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Тбилиси', nameEn: 'Tbilisi', region: 'Картли', lat: 41.7151, lng: 44.8271, population: 1200000, flag: '🇬🇪' },
  { id: 'ge_batumi', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Батуми', nameEn: 'Batumi', region: 'Аджария', lat: 41.6423, lng: 41.6339, population: 170000, flag: '🇬🇪' },
  { id: 'ge_kutaisi', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Кутаиси', nameEn: 'Kutaisi', region: 'Имеретия', lat: 42.2679, lng: 42.6946, population: 140000, flag: '🇬🇪' },
  { id: 'ge_rustavi', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Рустави', nameEn: 'Rustavi', region: 'Квемо-Картли', lat: 41.5342, lng: 45.0194, population: 128000, flag: '🇬🇪' },
  { id: 'ge_gori', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Гори', nameEn: 'Gori', region: 'Шида-Картли', lat: 41.9842, lng: 44.1158, population: 48000, flag: '🇬🇪' },
  { id: 'ge_zugdidi', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Зугдиди', nameEn: 'Zugdidi', region: 'Самегрело', lat: 42.5088, lng: 41.8709, population: 43000, flag: '🇬🇪' },
  { id: 'ge_poti', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Поти', nameEn: 'Poti', region: 'Самегрело', lat: 42.1462, lng: 41.672, population: 41000, flag: '🇬🇪' },
  { id: 'ge_kobuleti', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Кобулети', nameEn: 'Kobuleti', region: 'Аджария', lat: 41.8174, lng: 41.7772, population: 27000, flag: '🇬🇪' },
  { id: 'ge_telavi', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Телави', nameEn: 'Telavi', region: 'Кахетия', lat: 41.9198, lng: 45.4731, population: 20000, flag: '🇬🇪' },
  { id: 'ge_borjomi', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Боржоми', nameEn: 'Borjomi', region: 'Самцхе-Джавахети', lat: 41.8389, lng: 43.3883, population: 11000, flag: '🇬🇪' },
  { id: 'ge_mtskheta', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Мцхета', nameEn: 'Mtskheta', region: 'Мцхета-Мтианети', lat: 41.8458, lng: 44.7188, population: 8000, flag: '🇬🇪' },
  { id: 'ge_gudauri', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Гудаури', nameEn: 'Gudauri', region: 'Казбеги', lat: 42.4784, lng: 44.4735, population: 1500, flag: '🇬🇪' },
  { id: 'ge_stepantsminda', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Степанцминда (Казбеги)', nameEn: 'Stepantsminda', region: 'Мтианети', lat: 42.6569, lng: 44.6433, population: 1800, flag: '🇬🇪' },
  { id: 'ge_sighnaghi', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Сигнахи', nameEn: 'Sighnaghi', region: 'Кахетия', lat: 41.6213, lng: 45.922, population: 1500, flag: '🇬🇪' },
  { id: 'ge_akhaltsikhe', countryId: 'GE', countryRu: 'Грузия', countryEn: 'Georgia', nameRu: 'Ахалцихе', nameEn: 'Akhaltsikhe', region: 'Самцхе-Джавахети', lat: 41.6392, lng: 42.9831, population: 18000, flag: '🇬🇪' },

  // ==========================================
  // АРМЕНИЯ (AM)
  // ==========================================
  { id: 'am_yerevan', countryId: 'AM', countryRu: 'Армения', countryEn: 'Armenia', nameRu: 'Ереван', nameEn: 'Yerevan', region: 'Столица', lat: 40.1792, lng: 44.4991, population: 1090000, flag: '🇦🇲' },
  { id: 'am_gyumri', countryId: 'AM', countryRu: 'Армения', countryEn: 'Armenia', nameRu: 'Гюмри', nameEn: 'Gyumri', region: 'Ширак', lat: 40.7894, lng: 43.8474, population: 112000, flag: '🇦🇲' },
  { id: 'am_vanadzor', countryId: 'AM', countryRu: 'Армения', countryEn: 'Armenia', nameRu: 'Ванадзор', nameEn: 'Vanadzor', region: 'Лори', lat: 40.8074, lng: 44.497, population: 77000, flag: '🇦🇲' },
  { id: 'am_dilijan', countryId: 'AM', countryRu: 'Армения', countryEn: 'Armenia', nameRu: 'Дилижан', nameEn: 'Dilijan', region: 'Тавуш', lat: 40.7411, lng: 44.8638, population: 17000, flag: '🇦🇲' },
  { id: 'am_tsaghkadzor', countryId: 'AM', countryRu: 'Армения', countryEn: 'Armenia', nameRu: 'Цахкадзор', nameEn: 'Tsaghkadzor', region: 'Котайк', lat: 40.5317, lng: 44.7214, population: 2800, flag: '🇦🇲' },

  // ==========================================
  // КАЗАХСТАН (KZ)
  // ==========================================
  { id: 'kz_almaty', countryId: 'KZ', countryRu: 'Казахстан', countryEn: 'Kazakhstan', nameRu: 'Алматы', nameEn: 'Almaty', region: 'Южная столица', lat: 43.222, lng: 76.8512, population: 2150000, flag: '🇰🇿' },
  { id: 'kz_astana', countryId: 'KZ', countryRu: 'Казахстан', countryEn: 'Kazakhstan', nameRu: 'Астана', nameEn: 'Astana', region: 'Столица', lat: 51.1694, lng: 71.4491, population: 1350000, flag: '🇰🇿' },
  { id: 'kz_shymkent', countryId: 'KZ', countryRu: 'Казахстан', countryEn: 'Kazakhstan', nameRu: 'Шымкент', nameEn: 'Shymkent', region: 'Юг', lat: 42.3417, lng: 69.5901, population: 1190000, flag: '🇰🇿' },
  { id: 'kz_karaganda', countryId: 'KZ', countryRu: 'Казахстан', countryEn: 'Kazakhstan', nameRu: 'Караганда', nameEn: 'Karaganda', region: 'Центр', lat: 49.8047, lng: 73.1094, population: 500000, flag: '🇰🇿' },
  { id: 'kz_aktobe', countryId: 'KZ', countryRu: 'Казахстан', countryEn: 'Kazakhstan', nameRu: 'Актобе', nameEn: 'Aktobe', region: 'Запад', lat: 50.2839, lng: 57.167, population: 550000, flag: '🇰🇿' },
  { id: 'kz_aktau', countryId: 'KZ', countryRu: 'Казахстан', countryEn: 'Kazakhstan', nameRu: 'Актау', nameEn: 'Aktau', region: 'Каспий', lat: 43.6481, lng: 51.1722, population: 260000, flag: '🇰🇿' },
  { id: 'kz_atyrau', countryId: 'KZ', countryRu: 'Казахстан', countryEn: 'Kazakhstan', nameRu: 'Атырау', nameEn: 'Atyrau', region: 'Запад', lat: 47.1164, lng: 51.8839, population: 315000, flag: '🇰🇿' },

  // ==========================================
  // УЗБЕКИСТАН (UZ)
  // ==========================================
  { id: 'uz_tashkent', countryId: 'UZ', countryRu: 'Узбекистан', countryEn: 'Uzbekistan', nameRu: 'Ташкент', nameEn: 'Tashkent', region: 'Столица', lat: 41.2995, lng: 69.2401, population: 2900000, flag: '🇺🇿' },
  { id: 'uz_samarkand', countryId: 'UZ', countryRu: 'Узбекистан', countryEn: 'Uzbekistan', nameRu: 'Самарканд', nameEn: 'Samarkand', region: 'Самаркандская обл.', lat: 39.6542, lng: 66.9597, population: 550000, flag: '🇺🇿' },
  { id: 'uz_bukhara', countryId: 'UZ', countryRu: 'Узбекистан', countryEn: 'Uzbekistan', nameRu: 'Бухара', nameEn: 'Bukhara', region: 'Бухарская обл.', lat: 39.7747, lng: 64.4286, population: 280000, flag: '🇺🇿' },

  // ==========================================
  // БЕЛАРУСЬ (BY)
  // ==========================================
  { id: 'by_minsk', countryId: 'BY', countryRu: 'Беларусь', countryEn: 'Belarus', nameRu: 'Минск', nameEn: 'Minsk', region: 'Столица', lat: 53.9045, lng: 27.5615, population: 2000000, flag: '🇧🇾' },
  { id: 'by_brest', countryId: 'BY', countryRu: 'Беларусь', countryEn: 'Belarus', nameRu: 'Брест', nameEn: 'Brest', region: 'Брестская обл.', lat: 52.0976, lng: 23.7341, population: 340000, flag: '🇧🇾' },
  { id: 'by_grodno', countryId: 'BY', countryRu: 'Беларусь', countryEn: 'Belarus', nameRu: 'Гродно', nameEn: 'Grodno', region: 'Гродненская обл.', lat: 53.6694, lng: 23.8131, population: 360000, flag: '🇧🇾' },
  { id: 'by_gomel', countryId: 'BY', countryRu: 'Беларусь', countryEn: 'Belarus', nameRu: 'Гомель', nameEn: 'Gomel', region: 'Гомельская обл.', lat: 52.4345, lng: 30.9754, population: 500000, flag: '🇧🇾' },

  // ==========================================
  // ВЕЛИКОБРИТАНИЯ (GB)
  // ==========================================
  { id: 'gb_london', countryId: 'GB', countryRu: 'Великобритания', countryEn: 'United Kingdom', nameRu: 'Лондон', nameEn: 'London', region: 'Англия', lat: 51.5074, lng: -0.1278, population: 8900000, flag: '🇬🇧' },
  { id: 'gb_manchester', countryId: 'GB', countryRu: 'Великобритания', countryEn: 'United Kingdom', nameRu: 'Манчестер', nameEn: 'Manchester', region: 'Большой Манчестер', lat: 53.4808, lng: -2.2426, population: 550000, flag: '🇬🇧' },
  { id: 'gb_birmingham', countryId: 'GB', countryRu: 'Великобритания', countryEn: 'United Kingdom', nameRu: 'Бирмингем', nameEn: 'Birmingham', region: 'Уэст-Мидлендс', lat: 52.4862, lng: -1.8904, population: 1140000, flag: '🇬🇧' },
  { id: 'gb_edinburgh', countryId: 'GB', countryRu: 'Великобритания', countryEn: 'United Kingdom', nameRu: 'Эдинбург', nameEn: 'Edinburgh', region: 'Шотландия', lat: 55.9533, lng: -3.1883, population: 530000, flag: '🇬🇧' },
  { id: 'gb_liverpool', countryId: 'GB', countryRu: 'Великобритания', countryEn: 'United Kingdom', nameRu: 'Ливерпуль', nameEn: 'Liverpool', region: 'Мерсисайд', lat: 53.4084, lng: -2.9916, population: 500000, flag: '🇬🇧' },
  { id: 'gb_bristol', countryId: 'GB', countryRu: 'Великобритания', countryEn: 'United Kingdom', nameRu: 'Бристоль', nameEn: 'Bristol', region: 'Юго-Запад', lat: 51.4545, lng: -2.5879, population: 470000, flag: '🇬🇧' },
  { id: 'gb_cambridge', countryId: 'GB', countryRu: 'Великобритания', countryEn: 'United Kingdom', nameRu: 'Кембридж', nameEn: 'Cambridge', region: 'Кембриджшир', lat: 52.2053, lng: 0.1218, population: 130000, flag: '🇬🇧' },
  { id: 'gb_oxford', countryId: 'GB', countryRu: 'Великобритания', countryEn: 'United Kingdom', nameRu: 'Оксфорд', nameEn: 'Oxford', region: 'Оксфордшир', lat: 51.752, lng: -1.2577, population: 152000, flag: '🇬🇧' },

  // ==========================================
  // ОАЭ (AE)
  // ==========================================
  { id: 'ae_dubai', countryId: 'AE', countryRu: 'ОАЭ', countryEn: 'United Arab Emirates', nameRu: 'Дубай', nameEn: 'Dubai', region: 'Дубай', lat: 25.2048, lng: 55.2708, population: 3500000, flag: '🇦🇪' },
  { id: 'ae_abudhabi', countryId: 'AE', countryRu: 'ОАЭ', countryEn: 'United Arab Emirates', nameRu: 'Абу-Даби', nameEn: 'Abu Dhabi', region: 'Столица', lat: 24.4539, lng: 54.3773, population: 1500000, flag: '🇦🇪' },
  { id: 'ae_sharjah', countryId: 'AE', countryRu: 'ОАЭ', countryEn: 'United Arab Emirates', nameRu: 'Шарджа', nameEn: 'Sharjah', region: 'Шарджа', lat: 25.3463, lng: 55.4209, population: 1400000, flag: '🇦🇪' },

  // ==========================================
  // ТУРЦИЯ (TR)
  // ==========================================
  { id: 'tr_istanbul', countryId: 'TR', countryRu: 'Турция', countryEn: 'Turkey', nameRu: 'Стамбул', nameEn: 'Istanbul', region: 'Мраморное море', lat: 41.0082, lng: 28.9784, population: 15500000, flag: '🇹🇷' },
  { id: 'tr_antalya', countryId: 'TR', countryRu: 'Турция', countryEn: 'Turkey', nameRu: 'Анталья', nameEn: 'Antalya', region: 'Средиземноморье', lat: 36.8969, lng: 30.7133, population: 1400000, flag: '🇹🇷' },
  { id: 'tr_ankara', countryId: 'TR', countryRu: 'Турция', countryEn: 'Turkey', nameRu: 'Анкара', nameEn: 'Ankara', region: 'Столица', lat: 39.9334, lng: 32.8597, population: 5700000, flag: '🇹🇷' },
  { id: 'tr_izmir', countryId: 'TR', countryRu: 'Турция', countryEn: 'Turkey', nameRu: 'Измир', nameEn: 'Izmir', region: 'Эгейское море', lat: 38.4237, lng: 27.1428, population: 4400000, flag: '🇹🇷' },
  { id: 'tr_bodrum', countryId: 'TR', countryRu: 'Турция', countryEn: 'Turkey', nameRu: 'Бодрум', nameEn: 'Bodrum', region: 'Мугла', lat: 37.0344, lng: 27.4305, population: 180000, flag: '🇹🇷' },
  { id: 'tr_alanya', countryId: 'TR', countryRu: 'Турция', countryEn: 'Turkey', nameRu: 'Аланья', nameEn: 'Alanya', region: 'Анталья', lat: 36.5438, lng: 31.9998, population: 330000, flag: '🇹🇷' },

  // ==========================================
  // ГЕРМАНИЯ (DE)
  // ==========================================
  { id: 'de_berlin', countryId: 'DE', countryRu: 'Германия', countryEn: 'Germany', nameRu: 'Берлин', nameEn: 'Berlin', region: 'Столица', lat: 52.52, lng: 13.405, population: 3700000, flag: '🇩🇪' },
  { id: 'de_munich', countryId: 'DE', countryRu: 'Германия', countryEn: 'Germany', nameRu: 'Мюнхен', nameEn: 'Munich', region: 'Бавария', lat: 48.1351, lng: 11.582, population: 1500000, flag: '🇩🇪' },
  { id: 'de_frankfurt', countryId: 'DE', countryRu: 'Германия', countryEn: 'Germany', nameRu: 'Франкфурт', nameEn: 'Frankfurt', region: 'Гессен', lat: 50.1109, lng: 8.6821, population: 750000, flag: '🇩🇪' },
  { id: 'de_hamburg', countryId: 'DE', countryRu: 'Германия', countryEn: 'Germany', nameRu: 'Гамбург', nameEn: 'Hamburg', region: 'Север', lat: 53.5511, lng: 9.9937, population: 1900000, flag: '🇩🇪' },
  { id: 'de_cologne', countryId: 'DE', countryRu: 'Германия', countryEn: 'Germany', nameRu: 'Кёльн', nameEn: 'Cologne', region: 'Северный Рейн', lat: 50.9375, lng: 6.9603, population: 1080000, flag: '🇩🇪' },

  // ==========================================
  // ФРАНЦИЯ (FR)
  // ==========================================
  { id: 'fr_paris', countryId: 'FR', countryRu: 'Франция', countryEn: 'France', nameRu: 'Париж', nameEn: 'Paris', region: 'Иль-де-Франс', lat: 48.8566, lng: 2.3522, population: 2160000, flag: '🇫🇷' },
  { id: 'fr_nice', countryId: 'FR', countryRu: 'Франция', countryEn: 'France', nameRu: 'Ницца', nameEn: 'Nice', region: 'Лазурный берег', lat: 43.7102, lng: 7.262, population: 340000, flag: '🇫🇷' },
  { id: 'fr_lyon', countryId: 'FR', countryRu: 'Франция', countryEn: 'France', nameRu: 'Лион', nameEn: 'Lyon', region: 'Овернь', lat: 45.764, lng: 4.8357, population: 520000, flag: '🇫🇷' },
  { id: 'fr_marseille', countryId: 'FR', countryRu: 'Франция', countryEn: 'France', nameRu: 'Марсель', nameEn: 'Marseille', region: 'Прованс', lat: 43.2965, lng: 5.3698, population: 870000, flag: '🇫🇷' },

  // ==========================================
  // ИСПАНИЯ (ES)
  // ==========================================
  { id: 'es_madrid', countryId: 'ES', countryRu: 'Испания', countryEn: 'Spain', nameRu: 'Мадрид', nameEn: 'Madrid', region: 'Кастилия', lat: 40.4168, lng: -3.7038, population: 3300000, flag: '🇪🇸' },
  { id: 'es_barcelona', countryId: 'ES', countryRu: 'Испания', countryEn: 'Spain', nameRu: 'Барселона', nameEn: 'Barcelona', region: 'Каталония', lat: 41.3851, lng: 2.1734, population: 1620000, flag: '🇪🇸' },
  { id: 'es_valencia', countryId: 'ES', countryRu: 'Испания', countryEn: 'Spain', nameRu: 'Валенсия', nameEn: 'Valencia', region: 'Валенсия', lat: 39.4699, lng: -0.3763, population: 800000, flag: '🇪🇸' },
  { id: 'es_malaga', countryId: 'ES', countryRu: 'Испания', countryEn: 'Spain', nameRu: 'Малага', nameEn: 'Malaga', region: 'Андалусия', lat: 36.7213, lng: -4.4214, population: 580000, flag: '🇪🇸' },
  { id: 'es_alicante', countryId: 'ES', countryRu: 'Испания', countryEn: 'Spain', nameRu: 'Аликанте', nameEn: 'Alicante', region: 'Коста-Бланка', lat: 38.3452, lng: -0.481, population: 340000, flag: '🇪🇸' },

  // ==========================================
  // ИТАЛИЯ (IT)
  // ==========================================
  { id: 'it_rome', countryId: 'IT', countryRu: 'Италия', countryEn: 'Italy', nameRu: 'Рим', nameEn: 'Rome', region: 'Лацио', lat: 41.9028, lng: 12.4964, population: 2800000, flag: '🇮🇹' },
  { id: 'it_milan', countryId: 'IT', countryRu: 'Италия', countryEn: 'Italy', nameRu: 'Милан', nameEn: 'Milan', region: 'Ломбардия', lat: 45.4642, lng: 9.19, population: 1400000, flag: '🇮🇹' },
  { id: 'it_florence', countryId: 'IT', countryRu: 'Италия', countryEn: 'Italy', nameRu: 'Флоренция', nameEn: 'Florence', region: 'Тоскана', lat: 43.7696, lng: 11.2558, population: 380000, flag: '🇮🇹' },

  // ==========================================
  // ТАИЛАНД (TH) & БАЛИ (ID)
  // ==========================================
  { id: 'th_bangkok', countryId: 'TH', countryRu: 'Таиланд', countryEn: 'Thailand', nameRu: 'Бангкок', nameEn: 'Bangkok', region: 'Центр', lat: 13.7563, lng: 100.5018, population: 10500000, flag: '🇹🇭' },
  { id: 'th_phuket', countryId: 'TH', countryRu: 'Таиланд', countryEn: 'Thailand', nameRu: 'Пхукет', nameEn: 'Phuket', region: 'Остров Пхукет', lat: 7.8804, lng: 98.3923, population: 420000, flag: '🇹🇭' },
  { id: 'th_pattaya', countryId: 'TH', countryRu: 'Таиланд', countryEn: 'Thailand', nameRu: 'Паттайя', nameEn: 'Pattaya', region: 'Чонбури', lat: 12.9276, lng: 100.8771, population: 320000, flag: '🇹🇭' },
  { id: 'id_bali_denpasar', countryId: 'ID', countryRu: 'Индонезия (Бали)', countryEn: 'Indonesia', nameRu: 'Бали (Денпасар)', nameEn: 'Bali (Denpasar)', region: 'Бали', lat: -8.6705, lng: 115.2126, population: 900000, flag: '🇮🇩' },
  { id: 'id_canggu', countryId: 'ID', countryRu: 'Индонезия (Бали)', countryEn: 'Indonesia', nameRu: 'Чангу (Canggu)', nameEn: 'Canggu', region: 'Бали', lat: -8.648, lng: 115.1385, population: 40000, flag: '🇮🇩' },
  { id: 'id_ubud', countryId: 'ID', countryRu: 'Индонезия (Бали)', countryEn: 'Indonesia', nameRu: 'Убуд (Ubud)', nameEn: 'Ubud', region: 'Бали', lat: -8.5069, lng: 115.2625, population: 75000, flag: '🇮🇩' },

  // ==========================================
  // КИПР (CY)
  // ==========================================
  { id: 'cy_limassol', countryId: 'CY', countryRu: 'Кипр', countryEn: 'Cyprus', nameRu: 'Лимассол', nameEn: 'Limassol', region: 'Юг', lat: 34.6786, lng: 33.0413, population: 240000, flag: '🇨🇾' },
  { id: 'cy_nicosia', countryId: 'CY', countryRu: 'Кипр', countryEn: 'Cyprus', nameRu: 'Никосия', nameEn: 'Nicosia', region: 'Столица', lat: 35.1856, lng: 33.3823, population: 330000, flag: '🇨🇾' },
  { id: 'cy_paphos', countryId: 'CY', countryRu: 'Кипр', countryEn: 'Cyprus', nameRu: 'Пафос', nameEn: 'Paphos', region: 'Запад', lat: 34.7754, lng: 32.4245, population: 90000, flag: '🇨🇾' },
  { id: 'cy_larnaca', countryId: 'CY', countryRu: 'Кипр', countryEn: 'Cyprus', nameRu: 'Ларнака', nameEn: 'Larnaca', region: 'Восток', lat: 34.9167, lng: 33.6292, population: 85000, flag: '🇨🇾' },

  // ==========================================
  // СЕРБИЯ (RS) & ПОЛЬША (PL)
  // ==========================================
  { id: 'rs_belgrade', countryId: 'RS', countryRu: 'Сербия', countryEn: 'Serbia', nameRu: 'Белград', nameEn: 'Belgrade', region: 'Столица', lat: 44.7866, lng: 20.4489, population: 1400000, flag: '🇷🇸' },
  { id: 'rs_novisad', countryId: 'RS', countryRu: 'Сербия', countryEn: 'Serbia', nameRu: 'Нови-Сад', nameEn: 'Novi Sad', region: 'Воеводина', lat: 45.2671, lng: 19.8335, population: 300000, flag: '🇷🇸' },
  { id: 'pl_warsaw', countryId: 'PL', countryRu: 'Польша', countryEn: 'Poland', nameRu: 'Варшава', nameEn: 'Warsaw', region: 'Мазовия', lat: 52.2297, lng: 21.0122, population: 1800000, flag: '🇵🇱' },
  { id: 'pl_krakow', countryId: 'PL', countryRu: 'Польша', countryEn: 'Poland', nameRu: 'Краков', nameEn: 'Krakow', region: 'Малопольша', lat: 50.0647, lng: 19.945, population: 780000, flag: '🇵🇱' },
  { id: 'pl_wroclaw', countryId: 'PL', countryRu: 'Польша', countryEn: 'Poland', nameRu: 'Вроцлав', nameEn: 'Wroclaw', region: 'Нижняя Силезия', lat: 51.1079, lng: 17.0385, population: 640000, flag: '🇵🇱' },

  // ==========================================
  // ФИНЛЯНДИЯ (FI)
  // ==========================================
  { id: 'fi_helsinki', countryId: 'FI', countryRu: 'Финляндия', countryEn: 'Finland', nameRu: 'Хельсинки', nameEn: 'Helsinki', region: 'Уусимаа', lat: 60.1699, lng: 24.9384, population: 660000, flag: '🇫🇮' },
  { id: 'fi_vantaa', countryId: 'FI', countryRu: 'Финляндия', countryEn: 'Finland', nameRu: 'Вантаа', nameEn: 'Vantaa', region: 'Уусимаа', lat: 60.2934, lng: 25.0378, population: 240000, flag: '🇫🇮' },
  { id: 'fi_espoo', countryId: 'FI', countryRu: 'Финляндия', countryEn: 'Finland', nameRu: 'Эспоо', nameEn: 'Espoo', region: 'Уусимаа', lat: 60.2055, lng: 24.6559, population: 300000, flag: '🇫🇮' },
  { id: 'fi_tampere', countryId: 'FI', countryRu: 'Финляндия', countryEn: 'Finland', nameRu: 'Тампере', nameEn: 'Tampere', region: 'Пирканмаа', lat: 61.4978, lng: 23.761, population: 245000, flag: '🇫🇮' },
  { id: 'fi_turku', countryId: 'FI', countryRu: 'Финляндия', countryEn: 'Finland', nameRu: 'Турку', nameEn: 'Turku', region: 'Варсинайс-Суоми', lat: 60.4518, lng: 22.2666, population: 195000, flag: '🇫🇮' },
  { id: 'fi_oulu', countryId: 'FI', countryRu: 'Финляндия', countryEn: 'Finland', nameRu: 'Оулу', nameEn: 'Oulu', region: 'Северная Остроботния', lat: 65.0121, lng: 25.4651, population: 210000, flag: '🇫🇮' },

  // ==========================================
  // НИДЕРЛАНДЫ (NL)
  // ==========================================
  { id: 'nl_amsterdam', countryId: 'NL', countryRu: 'Нидерланды', countryEn: 'Netherlands', nameRu: 'Амстердам', nameEn: 'Amsterdam', region: 'Северная Голландия', lat: 52.3676, lng: 4.9041, population: 900000, flag: '🇳🇱' },
  { id: 'nl_rotterdam', countryId: 'NL', countryRu: 'Нидерланды', countryEn: 'Netherlands', nameRu: 'Роттердам', nameEn: 'Rotterdam', region: 'Южная Голландия', lat: 51.9244, lng: 4.4777, population: 650000, flag: '🇳🇱' },
  { id: 'nl_hague', countryId: 'NL', countryRu: 'Нидерланды', countryEn: 'Netherlands', nameRu: 'Гаага', nameEn: 'The Hague', region: 'Южная Голландия', lat: 52.0705, lng: 4.3007, population: 550000, flag: '🇳🇱' },
  { id: 'nl_utrecht', countryId: 'NL', countryRu: 'Нидерланды', countryEn: 'Netherlands', nameRu: 'Утрехт', nameEn: 'Utrecht', region: 'Утрехт', lat: 52.0907, lng: 5.1214, population: 360000, flag: '🇳🇱' },

  // ==========================================
  // ШВЕЙЦАРИЯ (CH) & АВСТРИЯ (AT)
  // ==========================================
  { id: 'ch_zurich', countryId: 'CH', countryRu: 'Швейцария', countryEn: 'Switzerland', nameRu: 'Цюрих', nameEn: 'Zurich', region: 'Цюрих', lat: 47.3769, lng: 8.5417, population: 430000, flag: '🇨🇭' },
  { id: 'ch_geneva', countryId: 'CH', countryRu: 'Швейцария', countryEn: 'Switzerland', nameRu: 'Женева', nameEn: 'Geneva', region: 'Женева', lat: 46.2044, lng: 6.1432, population: 205000, flag: '🇨🇭' },
  { id: 'at_vienna', countryId: 'AT', countryRu: 'Австрия', countryEn: 'Austria', nameRu: 'Вена', nameEn: 'Vienna', region: 'Столица', lat: 48.2082, lng: 16.3738, population: 1900000, flag: '🇦🇹' },

  // ==========================================
  // ЧЕХИЯ (CZ) & ШВЕЦИЯ (SE)
  // ==========================================
  { id: 'cz_prague', countryId: 'CZ', countryRu: 'Чехия', countryEn: 'Czech Republic', nameRu: 'Прага', nameEn: 'Prague', region: 'Столица', lat: 50.0755, lng: 14.4378, population: 1300000, flag: '🇨🇿' },
  { id: 'se_stockholm', countryId: 'SE', countryRu: 'Швеция', countryEn: 'Sweden', nameRu: 'Стокгольм', nameEn: 'Stockholm', region: 'Столица', lat: 59.3293, lng: 18.0686, population: 980000, flag: '🇸🇪' },
  { id: 'no_oslo', countryId: 'NO', countryRu: 'Норвегия', countryEn: 'Norway', nameRu: 'Осло', nameEn: 'Oslo', region: 'Столица', lat: 59.9139, lng: 10.7522, population: 700000, flag: '🇳🇴' },

  // ==========================================
  // США (US) & КАНАДА (CA)
  // ==========================================
  { id: 'us_nyc', countryId: 'US', countryRu: 'США', countryEn: 'United States', nameRu: 'Нью-Йорк', nameEn: 'New York', region: 'NY', lat: 40.7128, lng: -74.006, population: 8300000, flag: '🇺🇸' },
  { id: 'us_brooklyn', countryId: 'US', countryRu: 'США', countryEn: 'United States', nameRu: 'Бруклин (New York)', nameEn: 'Brooklyn, NY', region: 'NY', lat: 40.6782, lng: -73.9442, population: 2600000, flag: '🇺🇸' },
  { id: 'us_la', countryId: 'US', countryRu: 'США', countryEn: 'United States', nameRu: 'Лос-Анджелес', nameEn: 'Los Angeles', region: 'CA', lat: 34.0522, lng: -118.2437, population: 3900000, flag: '🇺🇸' },
  { id: 'us_miami', countryId: 'US', countryRu: 'США', countryEn: 'United States', nameRu: 'Майами', nameEn: 'Miami', region: 'FL', lat: 25.7617, lng: -80.1918, population: 450000, flag: '🇺🇸' },
  { id: 'us_sf', countryId: 'US', countryRu: 'США', countryEn: 'United States', nameRu: 'Сан-Франциско', nameEn: 'San Francisco', region: 'CA', lat: 37.7749, lng: -122.4194, population: 870000, flag: '🇺🇸' },
  { id: 'ca_toronto', countryId: 'CA', countryRu: 'Канада', countryEn: 'Canada', nameRu: 'Торонто', nameEn: 'Toronto', region: 'Ontario', lat: 43.6532, lng: -79.3832, population: 2800000, flag: '🇨🇦' },

  // ==========================================
  // РОССИЯ (RU)
  // ==========================================
  { id: 'ru_moscow', countryId: 'RU', countryRu: 'Россия', countryEn: 'Russia', nameRu: 'Москва', nameEn: 'Moscow', region: 'Московская обл.', lat: 55.7558, lng: 37.6173, population: 13000000, flag: '🇷🇺' },
  { id: 'ru_spb', countryId: 'RU', countryRu: 'Россия', countryEn: 'Russia', nameRu: 'Санкт-Петербург', nameEn: 'Saint Petersburg', region: 'Ленинградская обл.', lat: 59.9343, lng: 30.3351, population: 5600000, flag: '🇷🇺' },
  { id: 'ru_kazan', countryId: 'RU', countryRu: 'Россия', countryEn: 'Russia', nameRu: 'Казань', nameEn: 'Kazan', region: 'Татарстан', lat: 55.7961, lng: 49.1064, population: 1300000, flag: '🇷🇺' },
  { id: 'ru_nsk', countryId: 'RU', countryRu: 'Россия', countryEn: 'Russia', nameRu: 'Новосибирск', nameEn: 'Novosibirsk', region: 'Сибирь', lat: 55.0084, lng: 82.9357, population: 1600000, flag: '🇷🇺' },
  { id: 'ru_ekb', countryId: 'RU', countryRu: 'Россия', countryEn: 'Russia', nameRu: 'Екатеринбург', nameEn: 'Yekaterinburg', region: 'Урал', lat: 56.8389, lng: 60.6057, population: 1500000, flag: '🇷🇺' },
  { id: 'ru_sochi', countryId: 'RU', countryRu: 'Россия', countryEn: 'Russia', nameRu: 'Сочи', nameEn: 'Sochi', region: 'Краснодарский край', lat: 43.6028, lng: 39.7342, population: 470000, flag: '🇷🇺' },
  { id: 'ru_krasnodar', countryId: 'RU', countryRu: 'Россия', countryEn: 'Russia', nameRu: 'Краснодар', nameEn: 'Krasnodar', region: 'Кубань', lat: 45.0355, lng: 38.9753, population: 1100000, flag: '🇷🇺' },
];

/**
 * Get country by ISO code
 */
export function getCountryById(countryId: string): WorldCountry | undefined {
  if (!countryId) return undefined;
  const upper = countryId.trim().toUpperCase();
  return WORLD_COUNTRIES.find((c) => c.id === upper);
}

/**
 * Match country by Russian or English name
 */
export function findCountryByName(name: string): WorldCountry | undefined {
  if (!name) return undefined;
  const q = name.trim().toLowerCase();
  return WORLD_COUNTRIES.find(
    (c) =>
      c.nameRu.toLowerCase() === q ||
      c.nameEn.toLowerCase() === q ||
      c.id.toLowerCase() === q ||
      c.nameRu.toLowerCase().includes(q) ||
      q.includes(c.nameRu.toLowerCase())
  );
}

/**
 * Get all cities belonging strictly to a country ID
 * Replaces SELECT * FROM cities WHERE country_id = :countryId
 */
export function getCitiesByCountryId(countryId: string): WorldCity[] {
  if (!countryId) return [];
  const upper = countryId.trim().toUpperCase();
  return WORLD_CITIES.filter((city) => city.countryId === upper);
}

/**
 * Filter cities within a country or globally
 */
export function filterLocalCities(query: string, countryId?: string): WorldCity[] {
  const q = query.trim().toLowerCase();
  let baseList = countryId
    ? getCitiesByCountryId(countryId)
    : WORLD_CITIES;

  if (!q) {
    return baseList.slice(0, 12);
  }

  return baseList.filter((c) => {
    const matchNameRu = c.nameRu.toLowerCase().includes(q);
    const matchNameEn = c.nameEn.toLowerCase().includes(q);
    const matchRegion = c.region ? c.region.toLowerCase().includes(q) : false;
    const matchCountry = !countryId && (c.countryRu.toLowerCase().includes(q) || c.countryEn.toLowerCase().includes(q));
    return matchNameRu || matchNameEn || matchRegion || matchCountry;
  });
}

/**
 * Format localized display name according to client language
 */
export function getCityDisplayName(city: WorldCity, lang: string = 'ru'): string {
  if (lang !== 'ru' && city.nameEn) {
    return city.nameEn;
  }
  return city.nameRu;
}

export function getCountryDisplayName(country: WorldCountry, lang: string = 'ru'): string {
  if (lang !== 'ru' && country.nameEn) {
    return country.nameEn;
  }
  return country.nameRu;
}
