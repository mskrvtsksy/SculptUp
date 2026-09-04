import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Check, Sparkles } from 'lucide-react';
import { SupportedLanguage } from '../types';
import {
  AVAILABLE_LANGUAGES,
  SPOKEN_LANGUAGES_LIST,
  getTelegramRawLanguageCode,
  getLanguageOption,
  useTranslation,
} from '../lib/i18n';
import { triggerHaptic } from '../lib/telegram';

interface LanguageSettingsModalProps {
  isOpen: boolean;
  uiLanguage: SupportedLanguage;
  spokenLanguages: string[];
  onLanguageChange: (lang: SupportedLanguage) => void;
  onSpokenLanguagesChange: (languages: string[]) => void;
  onClose: () => void;
}

export const LanguageSettingsModal: React.FC<LanguageSettingsModalProps> = ({
  isOpen,
  uiLanguage,
  spokenLanguages,
  onLanguageChange,
  onSpokenLanguagesChange,
  onClose,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  const rawTgCode = getTelegramRawLanguageCode();
  const currentOption = getLanguageOption(uiLanguage);

  const toggleSpokenLang = (id: string) => {
    triggerHaptic('selection');
    if (spokenLanguages.includes(id)) {
      if (spokenLanguages.length > 1) {
        onSpokenLanguagesChange(spokenLanguages.filter((l) => l !== id));
      }
    } else {
      onSpokenLanguagesChange([...spokenLanguages, id]);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-[#090b10] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl text-white flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {t('langTitle')}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {t('uiLangSub')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-[#161616] hover:bg-[#222] border border-[#262626] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-5 no-scrollbar">
            {/* Telegram Auto-Detection Callout */}
            <div className="p-3.5 rounded-2xl bg-[#0c1208] border border-[#CCFF00]/20 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#CCFF00]/15 flex items-center justify-center text-[#CCFF00] shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {t('autoDetected')}
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40">
                    Auto-detect
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  {t('langSubtitle')}{' '}
                  {rawTgCode ? (
                    <span className="text-gray-200 font-mono font-bold">({rawTgCode})</span>
                  ) : (
                    'Telegram'
                  )}
                  .
                </p>
              </div>
            </div>

            {/* UI Language Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  {t('uiLangHeader')}
                </label>
                <span className="text-[11px] font-mono text-[#CCFF00] font-bold">
                  {currentOption.flag} {currentOption.nativeName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_LANGUAGES.map((item) => {
                  const isSelected = uiLanguage === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        onLanguageChange(item.code);
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all select-none ${
                        isSelected
                          ? 'bg-[#CCFF00]/10 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                          : 'bg-[#111] border-[#222] hover:border-[#333]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.flag}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {item.nativeName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {item.name}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#CCFF00] flex items-center justify-center text-black shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spoken Languages for Matchmaking */}
            <div className="space-y-2.5 pt-2 border-t border-[#1a1a1a]">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  {t('spokenLangHeader')}
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {t('spokenLangSub')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {SPOKEN_LANGUAGES_LIST.map((lang) => {
                  const isChosen = spokenLanguages.includes(lang.id);
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => toggleSpokenLang(lang.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all select-none ${
                        isChosen
                          ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.2)]'
                          : 'bg-[#111] border-[#222] text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      {isChosen && <Check className="w-3 h-3 text-[#CCFF00]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1a1a1a] bg-black/40 flex justify-end">
            <button
              onClick={() => {
                triggerHaptic('success');
                onClose();
              }}
              className="w-full py-3 px-5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(204,255,0,0.35)] active:scale-95 transition-all text-center"
            >
              {t('save')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
