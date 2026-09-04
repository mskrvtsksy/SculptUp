import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Search, Sliders, Check, Sparkles, RefreshCw, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { FilterSettings, SupportedLanguage } from '../types';
import {
  HUMAN_INTERESTS,
  SPORT_TAGS,
  STYLE_TAGS,
  LOOKS_TAGS,
} from '../data/tags';
import { TagBadge } from './TagBadge';
import {
  searchLocations,
  GeoLocationResult,
  WORLD_COUNTRIES,
  getCitiesByCountryId,
  getCountryById,
  filterLocalCities,
  getCountryDisplayName,
  getCityDisplayName,
} from '../lib/geo';
import { triggerHaptic } from '../lib/telegram';
import { t } from '../lib/i18n';

interface FiltersModalProps {
  isOpen: boolean;
  filters: FilterSettings;
  onClose: () => void;
  onApply: (filters: FilterSettings) => void;
  lang?: SupportedLanguage;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  filters,
  onClose,
  onApply,
  lang = 'ru',
}) => {
  const [localFilters, setLocalFilters] = useState<FilterSettings>(filters);
  const [selectedCountryId, setSelectedCountryId] = useState<string>(filters.countryId || '');
  const [cityQuery, setCityQuery] = useState(filters.city);
  const [geoResults, setGeoResults] = useState<GeoLocationResult[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showAdvancedTags, setShowAdvancedTags] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
    setSelectedCountryId(filters.countryId || '');
    setCityQuery(filters.city);
  }, [filters, isOpen]);

  // Load default suggestions when country changes or query changes
  useEffect(() => {
    const q = cityQuery.trim().toLowerCase();
    const localMatches = filterLocalCities(q, selectedCountryId || undefined).map((c) => ({
      city: getCityDisplayName(c, lang),
      country: c.countryRu,
      countryId: c.countryId,
      cityId: c.id,
      latitude: c.lat,
      longitude: c.lng,
      flag: c.flag,
      region: c.region,
    }));

    setGeoResults(localMatches.slice(0, 8));

    if (q.length >= 2 && localMatches.length < 3) {
      setIsSearchingCity(true);
      const handler = setTimeout(async () => {
        try {
          const results = await searchLocations(q, selectedCountryId || undefined, lang);
          setGeoResults(results.slice(0, 8));
        } catch {
          // ignore
        } finally {
          setIsSearchingCity(false);
        }
      }, 350);
      return () => clearTimeout(handler);
    }
  }, [cityQuery, selectedCountryId, lang]);

  if (!isOpen) return null;

  const toggleTag = (tagLabel: string) => {
    triggerHaptic('selection');
    setLocalFilters((prev) => {
      const exists = prev.selectedTags.includes(tagLabel);
      if (exists) {
        return {
          ...prev,
          selectedTags: prev.selectedTags.filter((t) => t !== tagLabel),
        };
      } else {
        return {
          ...prev,
          selectedTags: [...prev.selectedTags, tagLabel],
        };
      }
    });
  };

  // Strictly enforce Geo Rule: country change ALWAYS resets city
  const handleCountryChange = (cId: string) => {
    triggerHaptic('selection');
    setSelectedCountryId(cId);
    if (!cId) {
      setLocalFilters((prev) => ({
        ...prev,
        countryId: '',
        country: '',
        city: '',
        cityId: undefined,
      }));
      setCityQuery('');
    } else {
      const countryObj = getCountryById(cId);
      setLocalFilters((prev) => ({
        ...prev,
        countryId: cId,
        country: countryObj ? getCountryDisplayName(countryObj, lang) : '',
        city: '',
        cityId: undefined,
      }));
      setCityQuery('');
    }
  };

  const handleSelectCity = (item: GeoLocationResult) => {
    triggerHaptic('selection');
    setLocalFilters((prev) => ({
      ...prev,
      city: item.city,
      cityId: item.cityId,
      country: item.country,
      countryId: item.countryId || selectedCountryId,
    }));
    if (item.countryId && item.countryId !== selectedCountryId) {
      setSelectedCountryId(item.countryId);
    }
    setCityQuery(item.city);
  };

  const handleResetCity = () => {
    triggerHaptic('light');
    setLocalFilters((prev) => ({
      ...prev,
      city: '',
      cityId: undefined,
    }));
    setCityQuery('');
  };

  const handleApply = () => {
    triggerHaptic('success');
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    triggerHaptic('medium');
    const defaultFilters: FilterSettings = {
      gender: 'all',
      minAge: 18,
      maxAge: 35,
      maxDistanceKm: 100,
      city: '',
      country: '',
      countryId: '',
      cityId: undefined,
      selectedTags: [],
    };
    setLocalFilters(defaultFilters);
    setSelectedCountryId('');
    setCityQuery('');
    setShowAdvancedTags(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 sm:rounded-[32px] rounded-t-[32px] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between bg-black shrink-0">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#CCFF00]" />
              <h3 className="text-base font-bold text-white tracking-wide">
                {t(lang, 'filtersTitle')}
              </h3>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-[#111] border border-[#222] hover:bg-[#1a1a1a] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
            {/* 1. Кого искать */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                {t(lang, 'seekingLabel')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'all', label: t(lang, 'seekingAll') },
                  { id: 'female', label: t(lang, 'seekingFemale') },
                  { id: 'male', label: t(lang, 'seekingMale') },
                  { id: 'nonbinary', label: t(lang, 'genderNonbinary') },
                ].map((g) => {
                  const isActive = localFilters.gender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setLocalFilters((prev) => ({
                          ...prev,
                          gender: g.id as any,
                        }));
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all text-center ${
                        isActive
                          ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                          : 'border-white/10 bg-[#121212] text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Возраст */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#121212] border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                  {t(lang, 'ageLabelFilter')}
                </span>
                <span className="text-xs font-mono font-bold text-[#CCFF00]">
                  {localFilters.minAge} — {localFilters.maxAge}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-mono text-gray-500 font-bold">18</span>
                <input
                  type="range"
                  min="18"
                  max="45"
                  value={localFilters.maxAge}
                  onChange={(e) => {
                    triggerHaptic('selection');
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxAge: parseInt(e.target.value),
                    }));
                  }}
                  className="w-full accent-[#CCFF00] bg-black h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-[#CCFF00] font-bold">45</span>
              </div>
            </div>

            {/* 3. Страна и Город (Linked) */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-[#121212] border border-white/10">
              {/* Country Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#CCFF00]" />
                    {t(lang, 'countryLabel')}
                  </label>
                  {selectedCountryId && (
                    <button
                      type="button"
                      onClick={() => handleCountryChange('')}
                      className="text-[10px] font-mono text-[#CCFF00] hover:underline"
                    >
                      {t(lang, 'allCountries')}
                    </button>
                  )}
                </div>

                <select
                  value={selectedCountryId}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-black border border-white/15 focus:border-[#CCFF00] rounded-xl px-3 py-2 text-xs text-white font-mono transition-colors outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#141414] text-white">
                    🌍 {t(lang, 'allCountries')}
                  </option>
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#141414] text-white">
                      {c.flag} {getCountryDisplayName(c, lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Input & Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" />
                    {t(lang, 'filterCityLabel')} {localFilters.country ? `(${localFilters.country})` : ''}
                  </label>
                  {localFilters.city && localFilters.city !== 'Все локации' && localFilters.city !== 'All locations' && (
                    <button
                      type="button"
                      onClick={handleResetCity}
                      className="text-[10px] font-mono text-[#CCFF00] hover:underline"
                    >
                      {t(lang, 'allCities')}
                    </button>
                  )}
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t(lang, 'searchCityPlaceholder')}
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      setLocalFilters((prev) => ({ ...prev, city: '', cityId: undefined }));
                    }}
                    className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#CCFF00] transition-colors font-mono"
                  />
                  {isSearchingCity && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#CCFF00] animate-pulse">
                      ...
                    </div>
                  )}
                </div>

                {/* Selected city display */}
                {localFilters.city && localFilters.city !== 'Все локации' && localFilters.city !== 'All locations' && (
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-xs font-mono">
                    <span className="text-white flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#CCFF00]" />
                      <strong className="text-[#CCFF00]">{localFilters.city}</strong>
                      {localFilters.country && ` (${localFilters.country})`}
                    </span>
                    <button
                      type="button"
                      onClick={handleResetCity}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Curated / Found Cities Chips */}
                {geoResults.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {geoResults.slice(0, 8).map((item, idx) => {
                      const isSelected = localFilters.city.toLowerCase() === item.city.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCity(item)}
                          className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00] font-bold shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                              : 'border-white/10 bg-black text-gray-300 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <span>{item.flag || '📍'}</span>
                          <span>{item.city}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Расстояние */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#121212] border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                  {t(lang, 'distanceLabel')}
                </span>
                <span className="text-xs font-mono font-bold text-[#CCFF00]">
                  {localFilters.maxDistanceKm} km
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-mono text-gray-500 font-bold">5 km</span>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={localFilters.maxDistanceKm}
                  onChange={(e) => {
                    triggerHaptic('selection');
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxDistanceKm: parseInt(e.target.value),
                    }));
                  }}
                  className="w-full accent-[#CCFF00] bg-black h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-[#CCFF00] font-mono font-bold">150 km</span>
              </div>
            </div>

            {/* 5. Интересы (Interests) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                  {t(lang, 'interestsSection')}
                </label>
                {localFilters.selectedTags.length > 0 && (
                  <span className="text-[11px] font-mono text-[#CCFF00] font-bold">
                    {localFilters.selectedTags.length}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {HUMAN_INTERESTS.map((tag) => {
                  const isSelected = localFilters.selectedTags.includes(tag.label);
                  return (
                    <TagBadge
                      key={tag.id}
                      tag={tag}
                      isSelected={isSelected}
                      onClick={() => toggleTag(tag.label)}
                      lang={lang}
                      interactive
                    />
                  );
                })}
              </div>
            </div>

            {/* 6. Спорт & Тело (Sport & Body) */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block">
                {t(lang, 'sportSection')}
              </label>
              <div className="flex flex-wrap gap-2">
                {SPORT_TAGS.map((tag) => {
                  const isSelected = localFilters.selectedTags.includes(tag.label);
                  return (
                    <TagBadge
                      key={tag.id}
                      tag={tag}
                      isSelected={isSelected}
                      onClick={() => toggleTag(tag.label)}
                      lang={lang}
                      interactive
                    />
                  );
                })}
              </div>
            </div>

            {/* 7. Стиль & Эстетика (Style & Aesthetic) */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block">
                {t(lang, 'styleSection')}
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_TAGS.map((tag) => {
                  const isSelected = localFilters.selectedTags.includes(tag.label);
                  return (
                    <TagBadge
                      key={tag.id}
                      tag={tag}
                      isSelected={isSelected}
                      onClick={() => toggleTag(tag.label)}
                      lang={lang}
                      interactive
                    />
                  );
                })}
              </div>
            </div>

            {/* 8. Продвинутый уровень: Сигналы внешности & Glow-Up */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowAdvancedTags(!showAdvancedTags);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl border border-white/10 bg-[#111] hover:bg-[#161616] text-gray-400 hover:text-white text-xs font-mono font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 text-gray-200">
                  <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>{t(lang, 'looksSection')}</span>
                </span>
                {showAdvancedTags ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {showAdvancedTags && (
                <div className="mt-2.5 space-y-3 p-4 rounded-2xl bg-[#0f0f0f] border border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {LOOKS_TAGS.map((tag) => {
                      const isSelected = localFilters.selectedTags.includes(tag.label);
                      return (
                        <TagBadge
                          key={tag.id}
                          tag={tag}
                          isSelected={isSelected}
                          onClick={() => toggleTag(tag.label)}
                          lang={lang}
                          interactive
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1a1a1a] bg-black flex gap-3">
            <button
              onClick={handleReset}
              className="py-3 px-5 rounded-full border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t(lang, 'resetFiltersBtn')}
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 px-5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.35)] active:scale-95 transition-all"
            >
              {t(lang, 'applyFiltersBtn')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
