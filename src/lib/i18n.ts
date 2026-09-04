import { createContext, useCallback, useContext } from 'react';
import { SupportedLanguage } from '../types';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export const SPOKEN_LANGUAGES_LIST = [
  { id: 'ru', name: 'Русский', flag: '🇷🇺' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { id: 'fr', name: 'Français', flag: '🇫🇷' },
  { id: 'it', name: 'Italiano', flag: '🇮🇹' },
  { id: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { id: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { id: 'ar', name: 'العربية (Arabic)', flag: '🇦🇪' },
];

const LanguageContext = createContext<SupportedLanguage>('ru');

export const LanguageProvider = LanguageContext.Provider;

/** Returns the active interface language and a translator for React components. */
export function useTranslation() {
  const language = useContext(LanguageContext);
  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) => t(language, key, params),
    [language],
  );

  return { language, t: translate };
}

export function getTelegramRawLanguageCode(): string | undefined {
  if (typeof window !== 'undefined') {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  }
  return undefined;
}

export function getLanguageOption(code: SupportedLanguage): LanguageOption {
  const found = AVAILABLE_LANGUAGES.find((item) => item.code === code);
  return found || AVAILABLE_LANGUAGES[0];
}

export function detectTelegramOrBrowserLanguage(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    // 1. Saved user preference from settings
    const saved = localStorage.getItem('sculpup_ui_language') as SupportedLanguage | null;
    if (saved && AVAILABLE_LANGUAGES.some((item) => item.code === saved)) {
      return saved;
    }

    // 2. Telegram WebApp user language
    const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code?.toLowerCase();
    if (tgLang) {
      if (tgLang.startsWith('ru') || tgLang.startsWith('uk') || tgLang.startsWith('be') || tgLang.startsWith('kz')) return 'ru';
      if (tgLang.startsWith('es')) return 'es';
      if (tgLang.startsWith('de')) return 'de';
      if (tgLang.startsWith('fr')) return 'fr';
      if (tgLang.startsWith('en')) return 'en';
    }

    // 3. Browser fallback
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (browserLang.startsWith('ru') || browserLang.startsWith('uk') || browserLang.startsWith('be') || browserLang.startsWith('kz')) return 'ru';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('en')) return 'en';
  }
  return 'ru';
}

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  ru: {
    // General
    next: 'Продолжить',
    back: 'Назад',
    finish: 'Завершить регистрацию',
    skip: 'Пройти позже',
    save: 'Сохранить',
    cancel: 'Отмена',
    step: 'Шаг',
    of: 'из',

    // Step 0: Legal & Age Gate
    legalTitle: 'Добро пожаловать в SCULPT',
    legalSubtitle: 'Премиальный дейтинг и Looksmaxxing комьюнити',
    ageGateHeader: 'Подтверждение возраста и правил',
    ageGateText: 'Сервис предназначен строго для лиц, достигших 18-летнего возраста. Доступ несовершеннолетним строго запрещен.',
    termsCheckbox: 'Мне есть 18 лет, и я полностью принимаю условия использования и политику конфиденциальности сервиса.',
    termsDisclaimerNotice: 'Внимание: Данный чекбокс снимает юридическую ответственность с разработчика сервиса за предоставление недостоверных сведений пользователем. Все фото и анкеты модерируются.',
    viewTermsLink: 'Читать соглашение пользователя (EULA)',
    ageWarning: 'Для продолжения необходимо подтвердить совершеннолетие (18+).',

    // Step 1: Language & i18n
    langTitle: 'Язык и Локализация',
    langSubtitle: 'Определен автоматически из настроек Telegram',
    uiLangHeader: 'Язык интерфейса приложения',
    uiLangSub: 'Выбери язык, на котором комфортно пользоваться приложением',
    autoDetected: 'Авто-определено из Telegram',
    spokenLangHeader: 'Какими языками ты владеешь?',
    spokenLangSub: 'Используется для точного алгоритма мэтчинга и фильтрации анкет в ленте',

    // Step 2: Basic Profile
    profileTitle: 'Создание базовой анкеты',
    profileSubtitle: 'Расскажи о себе для оценки и подбора пар',
    nameLabel: 'Имя или Никнейм',
    namePlaceholder: 'Твое имя',
    ageLabel: 'Возраст (18+)',
    genderLabel: 'Твой пол',
    genderMale: 'Парень',
    genderFemale: 'Девушка',
    genderNonbinary: 'Другой',
    seekingLabel: 'Кого ты ищешь?',
    seekingFemale: 'Девушек',
    seekingMale: 'Парней',
    seekingAll: 'Всех',
    cityLabel: 'Город проживания',
    cityPlaceholder: 'Например, Москва или Дубай',
    heightLabel: 'Рост (см)',
    bioLabel: 'О себе / Стиль и цели',
    bioPlaceholder: 'Твой стиль, увлечения или на чем делаешь акцент в образе...',

    // Step 3: WebRTC Anti-Fake Verification
    verifyTitle: 'Верификация личности',
    verifySubtitle: 'WebRTC Anti-Fake проверка с живой камеры',
    verifyBadgeDesc: 'Верифицированные анкеты получают системную синюю галочку, 3x буст показов и максимальное доверие комьюнити.',
    cameraPrompt: 'Разреши доступ к камере, чтобы сделать селфи с контрольным жестом',
    randomPoseLabel: 'Контрольный жест для подтверждения:',
    takeSelfie: 'Сделать селфи',
    retake: 'Переснять',
    verifying: 'Анализ биометрии и жеста...',
    verificationSuccess: 'Личность успешно подтверждена!',
    verificationSuccessDesc: 'Твоему профилю присвоена системная галочка верификации и буст в умной ленте.',
    cameraError: 'Камера недоступна или нет разрешения. Вы можете использовать контрольную верификацию.',
    simulateVerify: 'Пройти проверку жеста',

    // App Navigation
    navFeed: 'Лента',
    navMatches: 'Мэтчи',
    navAudit: 'Аудит',
    navProfile: 'Профиль',

    // Top Bar
    sculptScore: 'SCULPT SCORE',
    filters: 'Фильтры',
    verifiedBadge: 'Верифицирован',
    unverifiedBadge: 'Не верифицирован',
    swipesLeft: 'Свайпов осталось',
    archDocs: 'Архитектура',

    // Deck & Feed
    noMoreProfiles: 'Анкеты временно закончились',
    noMoreProfilesDesc: 'Расширь параметры поиска или измени радиус в фильтрах.',
    resetFilters: 'Сбросить фильтры',
    skipCard: 'Пропустить',
    superlikeCard: 'Суперлайк',
    likeCard: 'Лайк',
    itsAMatch: 'Взаимная симпатия!',

    // Matches
    tabMatches: 'Пары',
    tabWhoLiked: 'Лайки',
    noMatchesYet: 'Пока нет новых совпадений',
    noMatchesDesc: 'Свайпай в ленте — при взаимной симпатии диалог откроется мгновенно.',
    startChat: 'Написать',
    chatActive: 'Чат активен',
    whoLikedTitle: 'Кто проявил интерес',
    whoLikedSub: 'Взаимный лайк откроет личный диалог',
    unlockLikesBtn: 'Открыть всех за 50 Stars',
    mutualMatch: 'Взаимное совпадение',

    // Audit Screen
    auditTitle: 'Profile Score & Glow-Up',
    auditSubtitle: 'Честная оценка привлекательности профиля и зоны роста',
    tabResult: 'Результат',
    tabRecommendations: 'Рекомендации',
    tabDetails: 'Метрики качества',
    profileScoreLabel: 'Profile Score',
    communityScoreLabel: 'Вероятность позитивного восприятия анкеты',
    topPercentBadge: 'ТОП 12%',
    metricPhoto: 'Качество главного фото (40%)',
    metricBio: 'Биография и стиль (20%)',
    metricVerify: 'Верификация анкеты (20%)',
    metricCompleteness: 'Заполненность интересов (20%)',
    recFramingTitle: 'Кадрирование и композиция',
    recFramingDesc: 'Лицо занимает 24% кадра — идеальный ракурс для первого впечатления в ленте.',
    recLightingTitle: 'Освещение и тени',
    recLightingDesc: 'Мягкий рассеянный дневной свет подчеркивает рельеф лица без жестких теней сверху.',
    recFullBodyTitle: 'Динамика и полный рост',
    recFullBodyDesc: 'Добавь 1 ростовое фото в движении или за любимым делом: +40% к конверсии в мэтчи.',
    detailsLighting: 'Освещение и контрастность',
    detailsSharpness: 'Резкость и фокус кадра',
    detailsFraming: 'Композиция и угол лица',
    detailsExpression: 'Естественность и харизма',
    vipAuditBtn: 'Получить детальный персональный аудит',

    // Filters
    filtersTitle: 'Параметры поиска',
    countryLabel: 'Страна',
    filterCityLabel: 'Город',
    allCountries: 'Все страны',
    allCities: 'Все локации',
    searchCityPlaceholder: 'Поиск города...',
    ageLabelFilter: 'Возраст',
    distanceLabel: 'Радиус поиска',
    interestsSection: 'Интересы',
    sportSection: 'Спорт & Тренировки',
    styleSection: 'Стиль & Эстетика',
    looksSection: 'Сигналы внешности & Glow-Up',
    showLooksBtn: 'Показать сигналы внешности',
    hideLooksBtn: 'Скрыть сигналы',
    resetFiltersBtn: 'Сбросить',
    applyFiltersBtn: 'Применить фильтры',

    // Profile
    myProfileTitle: 'Мой профиль',
    verifiedProfile: 'Верифицированный профиль',
    unverifiedProfile: 'Анкета без верификации',
    verifyNowBtn: 'Пройти видео-проверку',
    aboutSection: 'О себе',
    interestsSectionProfile: 'Интересы и стиль',
    languagesSection: 'Языки общения',
    locationSection: 'Локация',
    settingsSection: 'Настройки',
    appLanguageLabel: 'Язык интерфейса',
  },
  en: {
    next: 'Continue',
    back: 'Back',
    finish: 'Complete Setup',
    skip: 'Do it later',
    save: 'Save',
    cancel: 'Cancel',
    step: 'Step',
    of: 'of',

    legalTitle: 'Welcome to SCULPT',
    legalSubtitle: 'Next-Gen Swipe Dating & Looksmaxxing Community',
    ageGateHeader: 'Age Verification & Legal Terms',
    ageGateText: 'This service is strictly reserved for individuals 18 years of age or older. Underage access is prohibited.',
    termsCheckbox: 'I am 18 years of age or older, and I fully accept the Terms of Service and Privacy Policy.',
    termsDisclaimerNotice: 'Notice: This confirmation releases developers from legal liability regarding fraudulent or falsified user information. All photos are monitored.',
    viewTermsLink: 'View End User Agreement (EULA)',
    ageWarning: 'You must confirm that you are at least 18 years old to proceed.',

    langTitle: 'Language & Localization',
    langSubtitle: 'Auto-detected from your Telegram settings',
    uiLangHeader: 'App Interface Language',
    uiLangSub: 'Choose your preferred language for the application',
    autoDetected: 'Detected from Telegram',
    spokenLangHeader: 'What languages do you speak?',
    spokenLangSub: 'Used by our ranking algorithm to pair you with matching profiles',

    profileTitle: 'Basic Profile Setup',
    profileSubtitle: 'Tell us about yourself for accurate rating and matching',
    nameLabel: 'Name or Nickname',
    namePlaceholder: 'Your name',
    ageLabel: 'Age (18+)',
    genderLabel: 'Your Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderNonbinary: 'Non-binary',
    seekingLabel: 'Who are you looking for?',
    seekingFemale: 'Women',
    seekingMale: 'Men',
    seekingAll: 'Everyone',
    cityLabel: 'City / Location',
    cityPlaceholder: 'e.g., London, New York or Dubai',
    heightLabel: 'Height (cm)',
    bioLabel: 'Bio & Aesthetic Vibe',
    bioPlaceholder: 'Your style, fitness routine or look highlight...',

    verifyTitle: 'Identity Verification',
    verifySubtitle: 'WebRTC Anti-Fake Live Camera Check',
    verifyBadgeDesc: 'Verified profiles receive a verified badge, 3x discovery boost and high trust.',
    cameraPrompt: 'Allow camera access to take a selfie with the requested gesture',
    randomPoseLabel: 'Required verification gesture:',
    takeSelfie: 'Take Selfie',
    retake: 'Retake',
    verifying: 'Analyzing biometric gesture...',
    verificationSuccess: 'Identity successfully verified!',
    verificationSuccessDesc: 'Your profile has received a verified badge and ranking boost.',
    cameraError: 'Camera unavailable or permission denied. You can verify gesture directly.',
    simulateVerify: 'Verify Gesture',

    // App Navigation
    navFeed: 'Feed',
    navMatches: 'Matches',
    navAudit: 'Audit',
    navProfile: 'Profile',

    // Top Bar
    sculptScore: 'SCULPT SCORE',
    filters: 'Filters',
    verifiedBadge: 'Verified',
    unverifiedBadge: 'Unverified',
    swipesLeft: 'Swipes remaining',
    archDocs: 'Architecture',

    // Deck & Feed
    noMoreProfiles: 'No more profiles nearby',
    noMoreProfilesDesc: 'Broaden your search radius or update your filter settings.',
    resetFilters: 'Reset filters',
    skipCard: 'Skip',
    superlikeCard: 'Superlike',
    likeCard: 'Like',
    itsAMatch: "It's a Match!",

    // Matches
    tabMatches: 'Matches',
    tabWhoLiked: 'Likes',
    noMatchesYet: 'No matches yet',
    noMatchesDesc: 'Keep swiping — when there is mutual interest, conversation opens instantly.',
    startChat: 'Message',
    chatActive: 'Chat Active',
    whoLikedTitle: 'Who liked your profile',
    whoLikedSub: 'Like back to start talking immediately',
    unlockLikesBtn: 'Unlock all for 50 Stars',
    mutualMatch: 'Mutual Match',

    // Audit Screen
    auditTitle: 'Profile Score & Glow-Up',
    auditSubtitle: 'Objective profile quality assessment & practical advice',
    tabResult: 'Score Result',
    tabRecommendations: 'Recommendations',
    tabDetails: 'Quality Metrics',
    profileScoreLabel: 'Profile Score',
    communityScoreLabel: 'Community positive perception likelihood',
    topPercentBadge: 'TOP 12%',
    metricPhoto: 'Main Photo Quality (40%)',
    metricBio: 'Bio & Depth (20%)',
    metricVerify: 'Verification Status (20%)',
    metricCompleteness: 'Profile Completeness (20%)',
    recFramingTitle: 'Framing & Proportions',
    recFramingDesc: 'Face occupies 24% of the frame — optimal balance for first impressions.',
    recLightingTitle: 'Soft Diffused Lighting',
    recLightingDesc: 'Natural side lighting accents facial structure without harsh overhead shadows.',
    recFullBodyTitle: 'Dynamic Full-Body Shot',
    recFullBodyDesc: 'Add 1 lifestyle or active full-body photo: increases match rate by 40%.',
    detailsLighting: 'Lighting & Contrast',
    detailsSharpness: 'Sharpness & Focus',
    detailsFraming: 'Framing & Face Angle',
    detailsExpression: 'Expression & Posture',
    vipAuditBtn: 'Get VIP in-depth audit',

    // Filters
    filtersTitle: 'Search Filters',
    countryLabel: 'Country',
    filterCityLabel: 'City',
    allCountries: 'All countries',
    allCities: 'All locations',
    searchCityPlaceholder: 'Search city...',
    ageLabelFilter: 'Age',
    distanceLabel: 'Search radius',
    interestsSection: 'Interests',
    sportSection: 'Sport & Fitness',
    styleSection: 'Style & Aesthetics',
    looksSection: 'Looks & Glow-Up Signals',
    showLooksBtn: 'Show advanced looks signals',
    hideLooksBtn: 'Hide looks signals',
    resetFiltersBtn: 'Reset',
    applyFiltersBtn: 'Apply Filters',

    // Profile
    myProfileTitle: 'My Profile',
    verifiedProfile: 'Verified Profile',
    unverifiedProfile: 'Unverified Profile',
    verifyNowBtn: 'Verify Identity',
    aboutSection: 'About Me',
    interestsSectionProfile: 'Interests & Aesthetics',
    languagesSection: 'Languages',
    locationSection: 'Location',
    settingsSection: 'Settings',
    appLanguageLabel: 'Interface Language',
  },
  es: {
    next: 'Continuar',
    back: 'Atrás',
    finish: 'Completar registro',
    skip: 'Más tarde',
    save: 'Guardar',
    cancel: 'Cancelar',
    step: 'Paso',
    of: 'de',

    legalTitle: 'Bienvenido a SCULPT',
    legalSubtitle: 'Comunidad de citas y Looksmaxxing',
    ageGateHeader: 'Confirmación de edad y términos',
    ageGateText: 'Servicio exclusivo para mayores de 18 años.',
    termsCheckbox: 'Tengo más de 18 años y acepto los términos de servicio y la política de privacidad.',
    termsDisclaimerNotice: 'Aviso: Esta casilla exime a los desarrolladores de responsabilidad legal por datos falsos.',
    viewTermsLink: 'Ver acuerdo de usuario (EULA)',
    ageWarning: 'Debes confirmar que tienes al menos 18 años.',

    langTitle: 'Idioma y Localización',
    langSubtitle: 'Detectado de tu Telegram',
    uiLangHeader: 'Idioma de la interfaz',
    uiLangSub: 'Elige el idioma de la aplicación',
    autoDetected: 'Detectado de Telegram',
    spokenLangHeader: '¿Qué idiomas hablas?',
    spokenLangSub: 'Utilizado para filtrar y emparejar perfiles',

    profileTitle: 'Perfil básico',
    profileSubtitle: 'Cuéntanos sobre ti para mejorar tus matches',
    nameLabel: 'Nombre',
    namePlaceholder: 'Tu nombre',
    ageLabel: 'Edad (18+)',
    genderLabel: 'Tu género',
    genderMale: 'Hombre',
    genderFemale: 'Mujer',
    genderNonbinary: 'Otro',
    seekingLabel: '¿A quién buscas?',
    seekingFemale: 'Mujeres',
    seekingMale: 'Hombres',
    seekingAll: 'Todos',
    cityLabel: 'Ciudad',
    cityPlaceholder: 'Madrid, Barcelona o CDMX',
    heightLabel: 'Altura (cm)',
    bioLabel: 'Biografía',
    bioPlaceholder: 'Tu estilo, entrenamiento y vibra...',

    verifyTitle: 'Verificación de identidad',
    verifySubtitle: 'Control anti-fraude WebRTC',
    verifyBadgeDesc: 'Los perfiles verificados obtienen una insignia azul y 3x más visibilidad.',
    cameraPrompt: 'Permite el acceso a la cámara para tomarte un selfie con el gesto requerido',
    randomPoseLabel: 'Gesto de verificación requerido:',
    takeSelfie: 'Tomar selfie',
    retake: 'Repetir',
    verifying: 'Analizando biometría...',
    verificationSuccess: '¡Identidad verificada con éxito!',
    verificationSuccessDesc: 'Tu perfil ahora cuenta con el distintivo verificado.',
    cameraError: 'Cámara no disponible. Puedes verificar el gesto.',
    simulateVerify: 'Verificar gesto',
  },
  de: {
    next: 'Weiter',
    back: 'Zurück',
    finish: 'Abschließen',
    skip: 'Später',
    save: 'Speichern',
    cancel: 'Abbrechen',
    step: 'Schritt',
    of: 'von',

    legalTitle: 'Willkommen bei SCULPT',
    legalSubtitle: 'Dating & Looksmaxxing Community',
    ageGateHeader: 'Altersprüfung & Nutzungsbedingungen',
    ageGateText: 'Streng ab 18 Jahren zugelassen.',
    termsCheckbox: 'Ich bin mindestens 18 Jahre alt und akzeptiere die Bedingungen.',
    termsDisclaimerNotice: 'Hinweis: Bestätigung entbindet Entwickler von Haftung für falsche Angaben.',
    viewTermsLink: 'Nutzungsbedingungen lesen',
    ageWarning: 'Sie müssen mindestens 18 Jahre alt sein.',

    langTitle: 'Sprache & Lokalisierung',
    langSubtitle: 'Aus Telegram-Einstellungen erkannt',
    uiLangHeader: 'App-Sprache',
    uiLangSub: 'Wählen Sie Ihre bevorzugte Sprache',
    autoDetected: 'Aus Telegram erkannt',
    spokenLangHeader: 'Welche Sprachen sprichst du?',
    spokenLangSub: 'Für präzises Matching und Filter',

    profileTitle: 'Basisprofil',
    profileSubtitle: 'Erzähle über dich für passende Matches',
    nameLabel: 'Name',
    namePlaceholder: 'Dein Name',
    ageLabel: 'Alter (18+)',
    genderLabel: 'Dein Geschlecht',
    genderMale: 'Mann',
    genderFemale: 'Frau',
    genderNonbinary: 'Divers',
    seekingLabel: 'Wen suchst du?',
    seekingFemale: 'Frauen',
    seekingMale: 'Männer',
    seekingAll: 'Alle',
    cityLabel: 'Stadt',
    cityPlaceholder: 'Berlin, München oder Wien',
    heightLabel: 'Größe (cm)',
    bioLabel: 'Bio & Style',
    bioPlaceholder: 'Dein Stil, Training und Ausstrahlung...',

    verifyTitle: 'Identitätsprüfung',
    verifySubtitle: 'WebRTC Anti-Fake Kamera-Check',
    verifyBadgeDesc: 'Verifizierte Profile erhalten das Häkchen und 3x Reichweite.',
    cameraPrompt: 'Erlaube Kamerazugriff für das Selfie mit der vorgegebenen Geste',
    randomPoseLabel: 'Geforderte Prüfungsgeste:',
    takeSelfie: 'Selfie aufnehmen',
    retake: 'Wiederholen',
    verifying: 'Biometrische Prüfung...',
    verificationSuccess: 'Identität erfolgreich bestätigt!',
    verificationSuccessDesc: 'Dein Profil ist nun verifiziert.',
    cameraError: 'Kamera nicht verfügbar. Geste bestätigen.',
    simulateVerify: 'Geste verifizieren',
  },
  fr: {
    next: 'Continuer',
    back: 'Retour',
    finish: 'Terminer',
    skip: 'Plus tard',
    save: 'Enregistrer',
    cancel: 'Annuler',
    step: 'Étape',
    of: 'sur',

    legalTitle: 'Bienvenue sur SCULPT',
    legalSubtitle: 'Rencontres & communauté Looksmaxxing',
    ageGateHeader: 'Vérification de l’âge et conditions',
    ageGateText: 'Réservé exclusivement aux personnes majeures de 18 ans et plus.',
    termsCheckbox: 'J’ai au moins 18 ans et j’accepte les conditions d’utilisation.',
    termsDisclaimerNotice: 'Avertissement: Cette case décharge le développeur de toute responsabilité légale.',
    viewTermsLink: 'Conditions d’utilisation (EULA)',
    ageWarning: 'Vous devez confirmer avoir au moins 18 ans.',

    langTitle: 'Langue & Localisation',
    langSubtitle: 'Détecté depuis vos paramètres Telegram',
    uiLangHeader: 'Langue de l’interface',
    uiLangSub: 'Choisissez votre langue pour l’application',
    autoDetected: 'Détecté depuis Telegram',
    spokenLangHeader: 'Quelles langues parlez-vous ?',
    spokenLangSub: 'Utilisé pour cibler les profils et affiner le matching',

    profileTitle: 'Profil de base',
    profileSubtitle: 'Présentez-vous pour commencer à swiper',
    nameLabel: 'Nom ou pseudo',
    namePlaceholder: 'Votre prénom',
    ageLabel: 'Âge (18+)',
    genderLabel: 'Votre genre',
    genderMale: 'Homme',
    genderFemale: 'Femme',
    genderNonbinary: 'Autre',
    seekingLabel: 'Qui recherchez-vous ?',
    seekingFemale: 'Femmes',
    seekingMale: 'Hommes',
    seekingAll: 'Tout le monde',
    cityLabel: 'Ville',
    cityPlaceholder: 'Paris, Lyon ou Genève',
    heightLabel: 'Taille (cm)',
    bioLabel: 'Bio & Style',
    bioPlaceholder: 'Votre style, forme physique ou particularité...',

    verifyTitle: 'Vérification d’identité',
    verifySubtitle: 'Contrôle anti-faux WebRTC en direct',
    verifyBadgeDesc: 'Les profils vérifiés obtiennent un badge officiel et 3x plus de visibilité.',
    cameraPrompt: 'Autorisez l’accès caméra pour faire un selfie avec le geste demandé',
    randomPoseLabel: 'Geste de vérification aléatoire :',
    takeSelfie: 'Prendre le selfie',
    retake: 'Reprendre',
    verifying: 'Analyse biométrique...',
    verificationSuccess: 'Identité vérifiée avec succès !',
    verificationSuccessDesc: 'Votre profil a reçu le badge vérifié.',
    cameraError: 'Caméra indisponible. Vous pouvez vérifier le geste.',
    simulateVerify: 'Vérifier le geste',
  },
};

const EXTRA_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  ru: {
    chatsTitle: 'Чаты',
    welcomeHeadline: 'Новые знакомства без ботов',
    welcomeStart: 'Начать',
    welcomeEnterFeed: 'Войти в ленту →',
    welcomeVerified: 'Проверенные анкеты',
    welcomeRealPhotos: 'Реальные фото',
    welcomeMutualInterest: 'Взаимный интерес',
    chatsSubtitle: 'Диалоги и обратная связь Looksmaxxing',
    chatsSearch: 'Поиск по диалогам и оценкам...',
    chatsNewMatches: 'Новые совпадения',
    chatsAllMessages: 'Все сообщения ({count})',
    chatsNoResults: 'Ничего не найдено',
    chatsEmpty: 'Пока нет сообщений',
    chatsNoResultsHint: 'Попробуйте изменить поисковый запрос.',
    chatsEmptyHint: 'Оценивайте профили в ленте и находите взаимные мэтчи, чтобы общаться!',
    chatsGoToProfiles: 'Перейти к анкетам',
    chatsStartConversation: 'Начните диалог...',
  },
  en: {
    chatsTitle: 'Chats',
    welcomeHeadline: 'New connections, no bots',
    welcomeStart: 'Get started',
    welcomeEnterFeed: 'Open feed →',
    welcomeVerified: 'Verified profiles',
    welcomeRealPhotos: 'Real photos',
    welcomeMutualInterest: 'Mutual interest',
    chatsSubtitle: 'Conversations and Looksmaxxing feedback',
    chatsSearch: 'Search conversations and ratings...',
    chatsNewMatches: 'New matches',
    chatsAllMessages: 'All messages ({count})',
    chatsNoResults: 'Nothing found',
    chatsEmpty: 'No messages yet',
    chatsNoResultsHint: 'Try changing your search query.',
    chatsEmptyHint: 'Rate profiles in the feed to make mutual matches and start chatting!',
    chatsGoToProfiles: 'Browse profiles',
    chatsStartConversation: 'Start a conversation...',
  },
  es: {
    chatsTitle: 'Chats',
    welcomeHeadline: 'Nuevas conexiones, sin bots',
    welcomeStart: 'Empezar',
    welcomeEnterFeed: 'Ir al feed →',
    welcomeVerified: 'Perfiles verificados',
    welcomeRealPhotos: 'Fotos reales',
    welcomeMutualInterest: 'Interés mutuo',
    chatsSubtitle: 'Conversaciones y comentarios de Looksmaxxing', chatsSearch: 'Buscar diálogos y valoraciones...', chatsNewMatches: 'Nuevos matches', chatsAllMessages: 'Todos los mensajes ({count})', chatsNoResults: 'No se encontró nada', chatsEmpty: 'Aún no hay mensajes', chatsNoResultsHint: 'Prueba a cambiar la búsqueda.', chatsEmptyHint: 'Valora perfiles para hacer matches y empezar a hablar.', chatsGoToProfiles: 'Ver perfiles', chatsStartConversation: 'Empieza una conversación...',
  },
  de: {
    chatsTitle: 'Chats',
    welcomeHeadline: 'Neue Kontakte ohne Bots',
    welcomeStart: 'Starten',
    welcomeEnterFeed: 'Zum Feed →',
    welcomeVerified: 'Verifizierte Profile',
    welcomeRealPhotos: 'Echte Fotos',
    welcomeMutualInterest: 'Gegenseitiges Interesse',
    chatsSubtitle: 'Unterhaltungen und Looksmaxxing-Feedback', chatsSearch: 'Chats und Bewertungen suchen...', chatsNewMatches: 'Neue Matches', chatsAllMessages: 'Alle Nachrichten ({count})', chatsNoResults: 'Nichts gefunden', chatsEmpty: 'Noch keine Nachrichten', chatsNoResultsHint: 'Versuche eine andere Suche.', chatsEmptyHint: 'Bewerte Profile, um Matches zu finden und zu chatten.', chatsGoToProfiles: 'Profile ansehen', chatsStartConversation: 'Starte eine Unterhaltung...',
  },
  fr: {
    chatsTitle: 'Discussions',
    welcomeHeadline: 'De nouvelles rencontres, sans bots',
    welcomeStart: 'Commencer',
    welcomeEnterFeed: 'Accéder au fil →',
    welcomeVerified: 'Profils vérifiés',
    welcomeRealPhotos: 'Photos réelles',
    welcomeMutualInterest: 'Intérêt réciproque',
    chatsSubtitle: 'Discussions et avis Looksmaxxing', chatsSearch: 'Rechercher des discussions et avis...', chatsNewMatches: 'Nouveaux matchs', chatsAllMessages: 'Tous les messages ({count})', chatsNoResults: 'Aucun résultat', chatsEmpty: 'Pas encore de messages', chatsNoResultsHint: 'Essayez de modifier votre recherche.', chatsEmptyHint: 'Évaluez des profils pour matcher et échanger.', chatsGoToProfiles: 'Voir les profils', chatsStartConversation: 'Commencez une discussion...',
  },
};

export function getTranslation(lang: SupportedLanguage | string = 'ru', key: string): string {
  const table = TRANSLATIONS[lang as SupportedLanguage] || TRANSLATIONS['ru'];
  const extras = EXTRA_TRANSLATIONS[lang as SupportedLanguage] || EXTRA_TRANSLATIONS.ru;
  return table[key] || extras[key] || TRANSLATIONS.en?.[key] || EXTRA_TRANSLATIONS.en[key] || key;
}

export function t(lang: SupportedLanguage | string = 'ru', key: string, params?: Record<string, string | number>): string {
  const table = TRANSLATIONS[lang as SupportedLanguage] || TRANSLATIONS['ru'];
  const extras = EXTRA_TRANSLATIONS[lang as SupportedLanguage] || EXTRA_TRANSLATIONS.ru;
  let val = table[key] || extras[key] || TRANSLATIONS.en?.[key] || EXTRA_TRANSLATIONS.en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return val;
}
