import React from 'react';
import { Search, Heart, MessageCircle, User, Sparkles, ShieldCheck, Scan, Flame } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';
import { SupportedLanguage } from '../types';
import { LogoS } from './BrandAssets';
import { playHoverSound, playClickSound } from '../lib/sound';
import { useTranslation } from '../lib/i18n';

export type NavTabType = 'deck' | 'audit' | 'matches' | 'chats' | 'profile';

interface NavbarProps {
  currentTab: NavTabType;
  matchesCount: number;
  likesCount: number;
  isPremium: boolean;
  onTabChange: (tab: NavTabType) => void;
  onOpenShop: () => void;
}

export const TopNavbar: React.FC<{
  isPremium?: boolean;
  isVerified?: boolean;
  uiLanguage?: SupportedLanguage;
  starsBalance?: number;
  onOpenShop?: () => void;
  onOpenSettings?: () => void;
  onOpenOnboarding?: () => void;
  onOpenWelcome?: () => void;
}> = ({ isVerified, starsBalance = 150, onOpenShop, onOpenWelcome }) => {
  const { t } = useTranslation();
  return (
    <header className="w-full max-w-md mx-auto pt-3 pb-1.5 px-4 flex items-center justify-between z-30 select-none bg-black relative">
      {/* 1. LEFT OF THE NOTCH: Logo & Sculpt Brand positioned symmetrically */}
      <button
        type="button"
        onClick={() => {
          playClickSound();
          triggerHaptic('light');
          if (onOpenWelcome) onOpenWelcome();
        }}
        onMouseEnter={playHoverSound}
        className="flex items-center gap-2 py-1 px-2.5 rounded-2xl bg-[#0c0c0c] border border-white/10 hover:border-[#CCFF00] hover:shadow-[0_0_15px_rgba(204,255,0,0.35)] transition-all active:scale-95 group text-left cursor-pointer hover-glow-green"
        title={t('navFeed')}
      >
        <LogoS size={28} className="transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-xs tracking-tight text-white group-hover:text-[#CCFF00] transition-colors leading-none">
              SCULPT
            </span>
            {isVerified && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] shadow-[0_0_6px_#CCFF00]" />
            )}
          </div>
          <span className="text-[9px] font-mono text-gray-400 group-hover:text-gray-200 tracking-wider leading-none mt-0.5">
            /skʌlpt/
          </span>
        </div>
      </button>

      {/* 2. CENTER CLEARANCE: Perfectly clear area reserved for the camera notch ('шторка') */}
      <div className="w-24 h-4 pointer-events-none shrink-0" aria-hidden="true" />

      {/* 3. RIGHT OF THE NOTCH: Symmetrical high-tech telemetry / Stars button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            triggerHaptic('medium');
            if (onOpenShop) onOpenShop();
          }}
          onMouseEnter={playHoverSound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101010] border border-white/10 hover:border-[#CCFF00] text-xs font-mono font-bold text-[#CCFF00] shadow-sm hover-glow-green active:scale-95 transition-all cursor-pointer"
          title="Telegram Stars"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#CCFF00] animate-pulse" />
          <span>{starsBalance} ★</span>
        </button>
      </div>
    </header>
  );
};

export const BottomNavbar: React.FC<NavbarProps> = ({
  currentTab,
  matchesCount: _matchesCount,
  likesCount: _likesCount,
  onTabChange,
}) => {
  const { t } = useTranslation();
  const tabs = [
    {
      id: 'deck' as NavTabType,
      label: 'SCULPT',
      icon: Flame,
      hasDot: false,
    },
    {
      id: 'audit' as NavTabType,
      label: 'AUDIT',
      icon: Scan,
      hasDot: false,
    },
    {
      id: 'matches' as NavTabType,
      label: t('navMatches'),
      icon: Heart,
      hasDot: false,
    },
    {
      id: 'chats' as NavTabType,
      label: t('chatsTitle'),
      icon: MessageCircle,
      hasDot: true, // Pink/red unread dot from Screenshot 3 & 4
    },
    {
      id: 'profile' as NavTabType,
      label: t('navProfile'),
      icon: User,
      hasDot: false,
    },
  ];

  return (
    <nav aria-label="Основная навигация" className="fixed bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur-xl border-t border-[#141414] pb-[max(0.5rem,var(--tg-safe-bottom))]">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
              onClick={() => {
                playClickSound();
                triggerHaptic('selection');
                onTabChange(tab.id);
              }}
              onMouseEnter={playHoverSound}
              className={`relative flex flex-col items-center justify-center py-1 px-3 transition-all rounded-xl hover:bg-white/5 group ${
                isActive
                  ? 'text-[#CCFF00]'
                  : 'text-gray-500 hover:text-[#CCFF00]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'scale-110 text-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]' : 'text-gray-400 group-hover:text-[#CCFF00]'
                  }`}
                />
                {tab.hasDot && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF4565] shadow-[0_0_8px_#FF4565]" />
                )}
              </div>
              <span
                className={`text-[10px] font-mono mt-1 transition-colors ${
                  isActive ? 'font-bold text-[#CCFF00]' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-0.5 rounded-full bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
