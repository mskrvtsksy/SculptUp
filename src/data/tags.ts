export type TagIconKey =
  | 'coffee'
  | 'travel'
  | 'business'
  | 'books'
  | 'music'
  | 'cinema'
  | 'photo'
  | 'art'
  | 'tech'
  | 'gym'
  | 'running'
  | 'boxing'
  | 'swimming'
  | 'yoga'
  | 'calisthenics'
  | 'streetwear'
  | 'oldmoney'
  | 'minimalism'
  | 'quietluxury'
  | 'vintage'
  | 'jawline'
  | 'huntereyes'
  | 'skincare'
  | 'posture'
  | 'fragrance';

export interface TagItem {
  id: string;
  label: string;
  englishLabel?: string;
  iconName: TagIconKey;
  category: 'interests' | 'sport' | 'style' | 'looks';
  description?: string;
  aliases?: string[];
}

export interface TagCategory {
  id?: string;
  category: string;
  tags: TagItem[];
  isAdvanced?: boolean;
}

// 1. Core Universal Interests (Интересы)
export const HUMAN_INTERESTS: TagItem[] = [
  {
    id: 'coffee',
    label: 'Кофе',
    englishLabel: 'Coffee',
    iconName: 'coffee',
    category: 'interests',
    description: 'Спешелти кофе и культура эспрессо',
    aliases: ['Coffee'],
  },
  {
    id: 'music',
    label: 'Музыка',
    englishLabel: 'Music',
    iconName: 'music',
    category: 'interests',
    description: 'Электронная музыка, винил и лайвы',
    aliases: ['Music'],
  },
  {
    id: 'books',
    label: 'Книги',
    englishLabel: 'Books',
    iconName: 'books',
    category: 'interests',
    description: 'Нон-фикшн, философия и литература',
    aliases: ['Books'],
  },
  {
    id: 'travel',
    label: 'Путешествия',
    englishLabel: 'Travel',
    iconName: 'travel',
    category: 'interests',
    description: 'Экспедиции, новые города и культуры',
    aliases: ['Travel', 'Море'],
  },
  {
    id: 'art',
    label: 'Искусство',
    englishLabel: 'Art',
    iconName: 'art',
    category: 'interests',
    description: 'Галереи, дизайн и contemporary art',
    aliases: ['Дизайн', 'Art', 'Современное искусство'],
  },
  {
    id: 'cinema',
    label: 'Кино',
    englishLabel: 'Cinema',
    iconName: 'cinema',
    category: 'interests',
    description: 'Авторское кино и фестивальный артхаус',
    aliases: ['Cinema', 'Фильмы'],
  },
  {
    id: 'photo',
    label: 'Фотография',
    englishLabel: 'Photography',
    iconName: 'photo',
    category: 'interests',
    description: 'Плёнка, стрит-фото и визуальные архивы',
    aliases: ['Photography'],
  },
  {
    id: 'business',
    label: 'Бизнес',
    englishLabel: 'Business',
    iconName: 'business',
    category: 'interests',
    description: 'Стартапы, инвестиции и продукты',
    aliases: ['Business'],
  },
  {
    id: 'tech',
    label: 'Технологии',
    englishLabel: 'Tech',
    iconName: 'tech',
    category: 'interests',
    description: 'AI, разработка и будущее технологий',
    aliases: ['Tech', 'IT'],
  },
];

// 2. Sport & Body (Спорт & Тело)
export const SPORT_TAGS: TagItem[] = [
  {
    id: 'gym',
    label: 'Зал & Силовые',
    englishLabel: 'Gym',
    iconName: 'gym',
    category: 'sport',
    description: 'Регулярный прогресс и дисциплина весов',
    aliases: ['Спорт', 'Зал 5 раз в неделю', 'Зал', 'Gym'],
  },
  {
    id: 'running',
    label: 'Бег',
    englishLabel: 'Running',
    iconName: 'running',
    category: 'sport',
    description: 'Марафоны, трейлы и темповые пробежки',
    aliases: ['Бег & Марафон', 'Running'],
  },
  {
    id: 'boxing',
    label: 'Бокс & Единоборства',
    englishLabel: 'Boxing',
    iconName: 'boxing',
    category: 'sport',
    description: 'Реакция, тайминг и ударная техника',
    aliases: ['Бокс', 'Boxing'],
  },
  {
    id: 'swimming',
    label: 'Плавание',
    englishLabel: 'Swimming',
    iconName: 'swimming',
    category: 'sport',
    description: 'Выносливость и техника на длинной воде',
    aliases: ['Плавание & Силовые', 'Swimming'],
  },
  {
    id: 'yoga',
    label: 'Йога & Растяжка',
    englishLabel: 'Yoga & Stretch',
    iconName: 'yoga',
    category: 'sport',
    description: 'Мобильность суставов, гибкость и баланс',
    aliases: ['Йога & Хайкинг', 'Стретчинг & Йога', 'Пилатес & Стретчинг', 'Пилатес & Зал'],
  },
  {
    id: 'calisthenics',
    label: 'Калистеника',
    englishLabel: 'Calisthenics',
    iconName: 'calisthenics',
    category: 'sport',
    description: 'Контроль собственного веса и гимнастика',
    aliases: ['Калистеника & Зал', 'Кроссфит & Парусный спорт'],
  },
];

// 3. Style & Aesthetics (Стиль & Эстетика)
export const STYLE_TAGS: TagItem[] = [
  {
    id: 'streetwear',
    label: 'Streetwear',
    englishLabel: 'Streetwear',
    iconName: 'streetwear',
    category: 'style',
    description: 'Уличная эстетика, японский деним и оверсайз',
    aliases: ['Уличный стиль'],
  },
  {
    id: 'oldmoney',
    label: 'Old Money',
    englishLabel: 'Old Money',
    iconName: 'oldmoney',
    category: 'style',
    description: 'Сдержанная аристократическая классика',
    aliases: ['Классика'],
  },
  {
    id: 'minimalism',
    label: 'Тёмный минимализм',
    englishLabel: 'Dark Minimalism',
    iconName: 'minimalism',
    category: 'style',
    description: 'Монохром, чистые силуэты и фактура',
    aliases: ['Dark Minimalism', 'Минимализм'],
  },
  {
    id: 'quietluxury',
    label: 'Quiet Luxury',
    englishLabel: 'Quiet Luxury',
    iconName: 'quietluxury',
    category: 'style',
    description: 'Безупречный крой без кричащих логотипов',
    aliases: ['Тихая роскошь'],
  },
  {
    id: 'vintage',
    label: 'Винтаж & Архивы',
    englishLabel: 'Vintage',
    iconName: 'vintage',
    category: 'style',
    description: 'Архивные релизы и винтажные находки',
    aliases: ['Vintage & Thrift'],
  },
];

// 4. Advanced Facial & Glow-Up Signals (Продвинутый уровень: сигналы внешности & Glow-Up)
export const LOOKS_TAGS: TagItem[] = [
  {
    id: 'jawline',
    label: 'Чёткая челюсть',
    englishLabel: 'Chiseled Jaw',
    iconName: 'jawline',
    category: 'looks',
    description: 'Выраженный контур нижней трети лица и челюсти',
    aliases: ['Chiseled Jaw', 'Jawline', 'Челюсть'],
  },
  {
    id: 'huntereyes',
    label: 'Выразительный взгляд',
    englishLabel: 'Hunter Eyes',
    iconName: 'huntereyes',
    category: 'looks',
    description: 'Глубокая посадка глаз с уверенным горизонтальным вектором',
    aliases: ['Hunter Eyes', 'Взгляд'],
  },
  {
    id: 'skincare',
    label: 'Уход за кожей',
    englishLabel: 'Skincare',
    iconName: 'skincare',
    category: 'looks',
    description: 'Чистый микрорельеф, увлажнение и SPF-защита',
    aliases: ['Skincare Routine', 'Skincare', 'Кожа'],
  },
  {
    id: 'posture',
    label: 'Правильная осанка',
    englishLabel: 'Posture & Mewing',
    iconName: 'posture',
    category: 'looks',
    description: 'Вертикальный вектор шеи, расправленные плечи и постура',
    aliases: ['Mewing & Постура', 'Королевская осанка', 'Mewing', 'Осанка', 'Постура'],
  },
  {
    id: 'fragrance',
    label: 'Нишевый парфюм',
    englishLabel: 'Fragrance',
    iconName: 'fragrance',
    category: 'looks',
    description: 'Индивидуальный селективный древесно-минеральный шлейф',
    aliases: ['Парфюм', 'Fragrance'],
  },
];

// All tag categories grouped for filters & modals
export const ALL_TAG_ITEMS: TagItem[] = [
  ...HUMAN_INTERESTS,
  ...SPORT_TAGS,
  ...STYLE_TAGS,
  ...LOOKS_TAGS,
];

// Structured categories for UI accordion / tabs
export const AESTHETIC_SIGNALS: TagCategory[] = [
  {
    id: 'sport',
    category: 'Спорт & Тело',
    tags: SPORT_TAGS,
  },
  {
    id: 'style',
    category: 'Стиль & Эстетика',
    tags: STYLE_TAGS,
  },
  {
    id: 'looks',
    category: 'Сигналы внешности & Glow-Up',
    tags: LOOKS_TAGS,
    isAdvanced: true,
  },
];

export const ALL_TAGS: TagCategory[] = [
  {
    id: 'interests',
    category: 'Основные интересы',
    tags: HUMAN_INTERESTS,
  },
  ...AESTHETIC_SIGNALS,
];

/**
 * Resolves a tag string (label, id, or legacy alias) into its canonical TagItem metadata
 */
export function getTagMeta(tagIdentifier: string): TagItem {
  if (!tagIdentifier) {
    return {
      id: 'custom',
      label: 'Тег',
      iconName: 'art',
      category: 'interests',
    };
  }

  const clean = tagIdentifier.trim().toLowerCase();

  // 1. Match by ID
  const byId = ALL_TAG_ITEMS.find((t) => t.id.toLowerCase() === clean);
  if (byId) return byId;

  // 2. Match by Label
  const byLabel = ALL_TAG_ITEMS.find((t) => t.label.toLowerCase() === clean);
  if (byLabel) return byLabel;

  // 3. Match by English Label
  const byEnglish = ALL_TAG_ITEMS.find(
    (t) => t.englishLabel && t.englishLabel.toLowerCase() === clean
  );
  if (byEnglish) return byEnglish;

  // 4. Match by Aliases
  const byAlias = ALL_TAG_ITEMS.find(
    (t) => t.aliases && t.aliases.some((a) => a.toLowerCase() === clean)
  );
  if (byAlias) return byAlias;

  // Partial matches
  if (clean.includes('кофе')) return getTagMeta('coffee');
  if (clean.includes('спорт') || clean.includes('зал') || clean.includes('силов')) return getTagMeta('gym');
  if (clean.includes('бег') || clean.includes('марафон')) return getTagMeta('running');
  if (clean.includes('бокс')) return getTagMeta('boxing');
  if (clean.includes('музык') || clean.includes('sound')) return getTagMeta('music');
  if (clean.includes('книг')) return getTagMeta('books');
  if (clean.includes('путешеств')) return getTagMeta('travel');
  if (clean.includes('фото')) return getTagMeta('photo');
  if (clean.includes('кино') || clean.includes('фильм')) return getTagMeta('cinema');
  if (clean.includes('бизнес') || clean.includes('стартап')) return getTagMeta('business');
  if (clean.includes('искусств') || clean.includes('дизайн')) return getTagMeta('art');
  if (clean.includes('old money')) return getTagMeta('oldmoney');
  if (clean.includes('streetwear')) return getTagMeta('streetwear');
  if (clean.includes('minimal')) return getTagMeta('minimalism');
  if (clean.includes('luxury')) return getTagMeta('quietluxury');
  if (clean.includes('jaw') || clean.includes('челюст')) return getTagMeta('jawline');
  if (clean.includes('eyes') || clean.includes('взгляд') || clean.includes('глаз')) return getTagMeta('huntereyes');
  if (clean.includes('skin') || clean.includes('кож')) return getTagMeta('skincare');
  if (clean.includes('mewing') || clean.includes('осанк') || clean.includes('постур')) return getTagMeta('posture');
  if (clean.includes('парфюм') || clean.includes('аромат')) return getTagMeta('fragrance');

  // Fallback item for arbitrary user text without emoji
  return {
    id: clean,
    label: tagIdentifier,
    iconName: 'art',
    category: 'interests',
  };
}

export const LOOKSMAXXING_TIPS_OPTIONS = [
  'Улучшить линию челюсти (chewing/mewing)',
  'Дропнуть процент жира на 2-3%',
  'Попробовать текстурный кроп или фейд',
  'Увлажняющий SPF и ретинол',
  'Оверсайз пиджак или темные тона',
  'Добавить акцентные украшения (кольца, цепь)',
  'Идеальная посадка плеч и осанка',
  'Шикарная симметрия и харизма 10/10',
];


