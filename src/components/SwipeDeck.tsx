import React, { useState } from 'react';
import {
  RotateCcw,
  X,
  Heart,
  Star,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { UserProfile, LooksmaxxingRating } from '../types';
import { SwipeCard } from './SwipeCard';
import { DetailedRatingModal } from './DetailedRatingModal';
import { triggerHaptic } from '../lib/telegram';
import { playHoverSound, playClickSound, playSwipeSound } from '../lib/sound';

interface SwipeDeckProps {
  profiles: UserProfile[];
  swipesRemaining: number;
  isPremium: boolean;
  onLike: (profile: UserProfile, rating?: LooksmaxxingRating) => void;
  onDislike: (profile: UserProfile) => void;
  onOpenShop: () => void;
  onOpenFilters: () => void;
  onResetDeck: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  profiles,
  swipesRemaining,
  isPremium,
  onLike,
  onDislike,
  onOpenShop,
  onOpenFilters,
  onResetDeck,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [auditProfile, setAuditProfile] = useState<UserProfile | null>(null);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const handleSwipeAction = (direction: 'left' | 'right' | 'down') => {
    if (!currentProfile) return;

    if (direction === 'down') {
      setAuditProfile(currentProfile);
      return;
    }

    if (direction === 'right') {
      if (!isPremium && swipesRemaining <= 0) {
        triggerHaptic('warning');
        onOpenShop();
        return;
      }
      onLike(currentProfile);
    } else {
      onDislike(currentProfile);
    }

    setHistory((prev) => [...prev, currentIndex]);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    triggerHaptic('medium');
    const lastIndex = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(lastIndex);
  };

  const handleAuditSubmit = (rating: LooksmaxxingRating, isLike: boolean) => {
    if (!currentProfile) return;

    if (isLike) {
      if (!isPremium && swipesRemaining <= 0) {
        triggerHaptic('warning');
        onOpenShop();
        return;
      }
      onLike(currentProfile, rating);
    } else {
      onDislike(currentProfile);
    }

    setHistory((prev) => [...prev, currentIndex]);
    setCurrentIndex((prev) => prev + 1);
    setAuditProfile(null);
  };

  const cardCounter = String(currentIndex + 1).padStart(2, '0');

  return (
    <div className="relative w-full h-full flex flex-col justify-between max-w-md mx-auto px-3.5 sm:px-4 pb-2 overflow-y-auto overscroll-contain">
      {/* 5 Thin Horizontal Segment Bars matching Screenshot 3 */}
      <div className="w-full flex items-center gap-1.5 pt-0.5 pb-1.5 shrink-0">
        {[0, 1, 2, 3, 4].map((seg) => {
          const isFilled = seg <= (currentIndex % 5);
          return (
            <div
              key={seg}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                isFilled
                  ? 'bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.5)]'
                  : 'bg-[#222]'
              }`}
            />
          );
        })}
      </div>

      {/* Header: Premium Dating OS Recommendation Bar */}
      <div className="flex items-center justify-between py-1 mb-1.5 px-0.5 shrink-0">
        <div className="flex-1 pr-2">
          {/* Tag & Match Indicator */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-black text-[#CCFF00] tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-[#CCFF00]" />
              Подобрано для вас
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[10px] font-mono font-black text-[#CCFF00] tracking-tight">
              87% совпадение
            </span>
          </div>
          {/* Subtitle description requested by user */}
          <p className="text-[10.5px] text-gray-300 font-mono mt-0.5 leading-tight truncate">
            На основе интересов и поведения
          </p>
        </div>

        {/* Circular Filters Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenFilters();
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#121212] border border-white/15 hover:border-[#CCFF00]/60 flex items-center justify-center text-white transition-all active:scale-95 shadow-sm hover:shadow-[0_0_12px_rgba(204,255,0,0.2)] shrink-0"
          title="Фильтры поиска"
        >
          <SlidersHorizontal className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main Card Container with Adaptive Mobile Heights */}
      <div className="relative flex-1 w-full min-h-[350px] sm:min-h-[440px] max-h-[540px]">
        {currentProfile ? (
          <div className="relative w-full h-full">
            {nextProfile && (
              <SwipeCard
                key={nextProfile.id}
                profile={nextProfile}
                isTop={false}
                onSwipe={() => {}}
                onOpenAudit={() => {}}
              />
            )}

            <SwipeCard
              key={currentProfile.id}
              profile={currentProfile}
              isTop={true}
              onSwipe={handleSwipeAction}
              onOpenAudit={() => {
                triggerHaptic('medium');
                setAuditProfile(currentProfile);
              }}
            />
          </div>
        ) : (
          /* Empty Deck State */
          <div className="w-full h-full rounded-[32px] border border-white/10 bg-[#0D0D0D] p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-[#CCFF00]" />
            </div>

            <h3 className="text-lg font-black text-white mb-2 font-mono">
              Анкеты в этом радиусе закончились
            </h3>
            <p className="text-xs text-gray-400 max-w-xs mb-6 leading-relaxed">
              Измени фильтры возраста и города или начни просмотр заново, чтобы продолжить оценивать вайб и looksmaxxing профили.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setCurrentIndex(0);
                  setHistory([]);
                  onResetDeck();
                }}
                className="px-4 py-2.5 rounded-full bg-[#141414] hover:bg-[#202020] border border-white/10 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Сбросить колоду</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenFilters();
                }}
                className="px-5 py-2.5 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:bg-[#b8e600] transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Фильтры</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Control Dock matching Screenshot 3 */}
      <div className="mt-3">
        <div className="flex items-center justify-center gap-4 py-1">
          {/* 1. Undo button */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              handleUndo();
            }}
            onMouseEnter={() => {
              if (history.length > 0) playHoverSound();
            }}
            disabled={history.length === 0}
            className={`w-14 h-14 rounded-full border transition-all flex items-center justify-center ${
              history.length > 0
                ? 'bg-[#121212] border-[#222] text-gray-300 hover:text-white hover:bg-[#1c1c1c] active:scale-95 hover-glow-green cursor-pointer'
                : 'bg-[#0a0a0a] border-[#181818] text-gray-700 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* 2. Pass (X) Button */}
          <button
            type="button"
            onClick={() => {
              playSwipeSound();
              triggerHaptic('light');
              handleSwipeAction('left');
            }}
            onMouseEnter={playHoverSound}
            disabled={!currentProfile}
            className="w-14 h-14 rounded-full bg-[#181114] border border-[#2a1720] hover:border-rose-500/60 flex items-center justify-center text-rose-500 hover:bg-[#20141a] active:scale-95 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
            title="Pass"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* 3. Like Button (Big glowing lime circle with black heart) */}
          <button
            type="button"
            onClick={() => {
              playSwipeSound();
              triggerHaptic('heavy');
              handleSwipeAction('right');
            }}
            onMouseEnter={playHoverSound}
            disabled={!currentProfile}
            className="w-16 h-16 rounded-full bg-[#CCFF00] hover:bg-[#d8ff33] flex items-center justify-center shadow-[0_0_25px_rgba(204,255,0,0.5)] active:scale-95 transition-all text-black hover-glow-green cursor-pointer"
            title="Like"
          >
            <Heart className="w-7 h-7 fill-black text-black" />
          </button>

          {/* 4. Superlike / Star Button */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              triggerHaptic('medium');
              onOpenShop();
            }}
            onMouseEnter={playHoverSound}
            className="w-14 h-14 rounded-full bg-[#181510] border border-[#2e2612] hover:border-[#CCFF00]/50 flex items-center justify-center text-[#ffcc00] hover:bg-[#221c12] active:scale-95 transition-all shadow-lg hover-glow-green cursor-pointer"
            title="Stars / Superlike"
          >
            <Star className="w-6 h-6 fill-[#ffcc00] text-[#ffcc00]" />
          </button>
        </div>

        {/* Action Prompt Hint matching Screenshot 3 */}
        <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase text-center mt-2.5 select-none">
          ПОТЯНИТЕ КАРТОЧКУ ИЛИ ВЫБЕРИТЕ ДЕЙСТВИЕ
        </p>
      </div>

      {/* Detailed Rating Modal */}
      {auditProfile && (
        <DetailedRatingModal
          profile={auditProfile}
          isOpen={Boolean(auditProfile)}
          onClose={() => setAuditProfile(null)}
          onSubmitRating={handleAuditSubmit}
        />
      )}
    </div>
  );
};
