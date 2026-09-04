import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Star,
  Edit3,
  Check,
  Link2,
  Shield,
  Languages,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Heart,
  Plus,
} from 'lucide-react';
import { TelegramUser, SupportedLanguage } from '../types';
import { triggerHaptic } from '../lib/telegram';
import {
  HUMAN_INTERESTS,
  SPORT_TAGS,
  STYLE_TAGS,
  LOOKS_TAGS,
} from '../data/tags';
import { TagBadge } from './TagBadge';
import { t } from '../lib/i18n';

interface ProfileViewProps {
  currentUser: TelegramUser;
  isPremium: boolean;
  isVerified: boolean;
  userCity?: string;
  userCountry?: string;
  userLatitude?: number;
  userLongitude?: number;
  uiLanguage: SupportedLanguage;
  spokenLanguages?: string[];
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenLanguageSettings: () => void;
  onOpenShop: () => void;
  onOpenOnboarding: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  isPremium: _isPremium,
  isVerified = true,
  userCity,
  userCountry,
  uiLanguage,
  onOpenLanguageSettings,
  onOpenShop,
  onOpenOnboarding,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.first_name);
  const [age, setAge] = useState(23);
  const [title, setTitle] = useState('');
  const [city, setCity] = useState(userCity);
  const [country, setCountry] = useState(userCountry);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (userCity) setCity(userCity);
    if (userCountry) setCountry(userCountry);
  }, [userCity, userCountry]);
  const [userInterests, setUserInterests] = useState<string[]>([
    'Спорт',
    'Бизнес',
    'Кофе',
    'Путешествия',
  ]);
  const [showSculptScore, setShowSculptScore] = useState(false);
  const [showAllProfileTags, setShowAllProfileTags] = useState(false);

  const toggleInterest = (tagLabel: string) => {
    triggerHaptic('selection');
    setUserInterests((prev) =>
      prev.includes(tagLabel)
        ? prev.filter((t) => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-1 pb-24 space-y-4 overflow-y-auto overscroll-contain">
      {/* Top Header Row */}
      <div className="flex items-center justify-between py-1 px-0.5">
        <div>
          <span className="text-[11px] font-mono font-black text-[#CCFF00] tracking-widest uppercase block">
            SCULPT / PROFILE
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            {t(uiLanguage, 'myProfileTitle')}
          </h1>
        </div>

        {/* Circular Edit Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsEditing(!isEditing);
          }}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-sm ${
            isEditing
              ? 'bg-[#CCFF00] border-[#CCFF00] text-black'
              : 'bg-[#141414] border-[#222] hover:border-white/30 text-white'
          }`}
          title={t(uiLanguage, 'myProfileTitle')}
        >
          {isEditing ? <Check className="w-4 h-4 stroke-[3]" /> : <Edit3 className="w-4 h-4" />}
        </button>
      </div>

      {/* 1. ИДЕНТИЧНОСТЬ ПРОФИЛЯ */}
      <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-5 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-[#161616]">
            {currentUser.photo_url ? (
              <img src={currentUser.photo_url} alt={name} className="w-full h-full object-cover object-top filter contrast-105" />
            ) : (
              <span className="w-full h-full flex items-center justify-center font-mono text-2xl font-black text-[#CCFF00]">
                {currentUser.first_name.slice(0, 1).toUpperCase()}
              </span>
            )}
            {isVerified && (
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#CCFF00] border-2 border-black flex items-center justify-center shadow-md"
                title="Проверен"
              >
                <Check className="w-3.5 h-3.5 text-black stroke-[3.5]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white font-mono tracking-tight">
              {name}, {age}
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
              {title} · {city}{country ? `, ${country}` : ''}
            </p>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-black text-[#CCFF00] tracking-wider uppercase mt-1.5">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                ПРОВЕРЕН
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenOnboarding();
                }}
                className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1404] border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 hover:border-amber-400 transition-colors cursor-pointer"
              >
                <span>Пройти верификацию</span>
                <span className="text-[#CCFF00]">→</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit fields if editing mode */}
        {isEditing && (
          <div className="space-y-2.5 mt-4 pt-3 border-t border-[#1a1a1a]">
            <div>
              <label className="text-[10px] font-mono text-gray-400 uppercase">Имя и возраст</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-[#141414] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 23)}
                  className="w-16 bg-[#141414] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-gray-400 uppercase">Деятельность и город</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 bg-[#141414] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-32 bg-[#141414] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('success');
                setIsEditing(false);
              }}
              className="w-full py-2 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#b8e600] transition-colors"
            >
              Готово
            </button>
          </div>
        )}
      </div>

      {/* 2. О СЕБЕ */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-1">
          <span className="shrink-0 text-xs font-mono uppercase text-gray-400 tracking-wider">
            О себе
          </span>
          <div className="h-[1px] bg-[#1a1a1a] flex-1" />
        </div>

        <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-4 shadow-md">
          {!isEditing ? (
            <p className="text-sm text-gray-200 leading-relaxed font-normal">
              {bio}
            </p>
          ) : (
            <div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-[#CCFF00]"
                placeholder="Расскажи о своих целях, вкусах и увлечениях..."
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. ИНТЕРЕСЫ & ТЕГИ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">
            Интересы & Стиль
          </span>
          <span className="text-[11px] font-mono text-[#CCFF00] font-bold">
            {userInterests.length} выбрано
          </span>
        </div>

        <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-4 space-y-4 shadow-md">
          {/* Main Interests */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-gray-500 font-bold tracking-wider block">
              Основные интересы
            </span>
            <div className="flex flex-wrap gap-2">
              {HUMAN_INTERESTS.map((tag) => {
                const isSelected = userInterests.includes(tag.label);
                return (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    isSelected={isSelected}
                    onClick={() => toggleInterest(tag.label)}
                    interactive
                  />
                );
              })}
            </div>
          </div>

          {/* Expandable Extra Categories: Sport, Style, Looksmaxxing */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowAllProfileTags(!showAllProfileTags);
              }}
              className="w-full py-2 px-3 rounded-xl border border-white/10 bg-[#141414] hover:bg-[#1a1a1a] text-xs font-mono font-bold text-gray-300 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Дополнительные теги: спорт, стиль, сигналы внешности</span>
              </span>
              {showAllProfileTags ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showAllProfileTags && (
              <div className="mt-3 space-y-3 pt-2 border-t border-white/5">
                {/* Sport */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-gray-500 font-bold tracking-wider block">
                    Спорт & Тело
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_TAGS.map((tag) => {
                      const isSelected = userInterests.includes(tag.label);
                      return (
                        <TagBadge
                          key={tag.id}
                          tag={tag}
                          isSelected={isSelected}
                          onClick={() => toggleInterest(tag.label)}
                          interactive
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-gray-500 font-bold tracking-wider block">
                    Стиль & Эстетика
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_TAGS.map((tag) => {
                      const isSelected = userInterests.includes(tag.label);
                      return (
                        <TagBadge
                          key={tag.id}
                          tag={tag}
                          isSelected={isSelected}
                          onClick={() => toggleInterest(tag.label)}
                          interactive
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Looks */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-gray-500 font-bold tracking-wider block">
                    Сигналы внешности & Glow-Up
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {LOOKS_TAGS.map((tag) => {
                      const isSelected = userInterests.includes(tag.label);
                      return (
                        <TagBadge
                          key={tag.id}
                          tag={tag}
                          isSelected={isSelected}
                          onClick={() => toggleInterest(tag.label)}
                          interactive
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. ВЕРИФИКАЦИЯ И БЕЗОПАСНОСТЬ */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-1">
          <span className="shrink-0 text-xs font-mono uppercase text-gray-400 tracking-wider">
            Верификация
          </span>
          <div className="h-[1px] bg-[#1a1a1a] flex-1" />
        </div>

        <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-4 space-y-3 shadow-md">
          {/* Telegram */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00]">
                <Link2 className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div className="text-sm font-bold text-white">
                Telegram
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#CCFF00] tracking-wider uppercase">
              ПОДКЛЮЧЕН
            </span>
          </div>

          <div className="h-[1px] bg-[#1a1a1a]" />

          {/* Фото-верификация */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00]">
                <Shield className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Проверка фото
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {isVerified ? 'Селфи совпадает с анкетой' : 'Требуется подтверждение'}
                </div>
              </div>
            </div>
            {isVerified ? (
              <span className="text-xs font-mono font-bold text-[#CCFF00] tracking-wider uppercase">
                ПОДТВЕРЖДЕНО
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenOnboarding();
                }}
                className="py-1 px-2.5 rounded-lg bg-amber-400 text-black text-[10px] font-mono font-black uppercase"
              >
                Пройти
              </button>
            )}
          </div>

          <div className="h-[1px] bg-[#1a1a1a]" />

          {/* GPS Геолокация */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00]">
                <MapPin className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Геолокация
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {city}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onOpenOnboarding();
              }}
              className="text-xs font-mono font-bold text-[#CCFF00] tracking-wider uppercase hover:underline"
            >
              ИЗМЕНИТЬ
            </button>
          </div>
        </div>
      </div>

      {/* 5. SCULPT SCORE & АНАЛИТИКА (Внутри / по кнопке) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setShowSculptScore(!showSculptScore);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-[#0D0D0D] border border-white/10 hover:border-[#CCFF00]/40 flex items-center justify-between transition-colors shadow-md text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                SCULPT Score & Аналитика
              </span>
              <span className="text-[11px] font-mono text-[#CCFF00]">
                850 / 1,000 XP (85%)
              </span>
            </div>
          </div>
          {showSculptScore ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showSculptScore && (
          <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-4 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00]">
                  <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight">
                    Sculpt score
                  </div>
                  <div className="text-xs font-mono font-bold text-[#CCFF00] mt-0.5">
                    850 / 1,000 XP
                  </div>
                </div>
              </div>
              <div className="text-lg font-mono font-black text-white">
                85%
              </div>
            </div>

            <div className="h-[1px] bg-[#1a1a1a]" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00]">
                <Star className="w-4 h-4 text-[#CCFF00]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">
                  Core signal
                </div>
                <div className="text-xs text-gray-400 font-sans mt-0.5">
                  Дисциплина, аутентичность, стиль
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. НАСТРОЙКИ */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-1">
          <span className="shrink-0 text-xs font-mono uppercase text-gray-400 tracking-wider">
            {t(uiLanguage, 'settingsSection')}
          </span>
          <div className="h-[1px] bg-[#1a1a1a] flex-1" />
        </div>

        <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 divide-y divide-[#1a1a1a] overflow-hidden shadow-md">
          {/* Row 1: Язык */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenLanguageSettings();
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-[#CCFF00]" />
              <span className="text-sm font-bold text-white">{t(uiLanguage, 'appLanguageLabel')}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">
                {uiLanguage.toUpperCase()}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          </button>

          {/* Row 2: Магазин Stars */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenShop();
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-[#CCFF00] fill-[#CCFF00]/20" />
              <span className="text-sm font-bold text-white">Магазин Stars</span>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>

          {/* Row 3: Account controls */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenOnboarding();
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#CCFF00]" />
              <span className="text-sm font-bold text-white">Управление аккаунтом</span>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
