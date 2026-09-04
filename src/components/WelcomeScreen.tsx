import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { LogoS } from './BrandAssets';
import { triggerHaptic } from '../lib/telegram';
import { playClickSound, playLikeSound } from '../lib/sound';
import { useTranslation } from '../lib/i18n';

interface WelcomeScreenProps {
  onStartRegistration: () => void;
  onQuickEnter?: () => void;
  isRegistered?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartRegistration,
  onQuickEnter,
  isRegistered = false,
}) => {
  const { t } = useTranslation();
  const handleStart = () => {
    playClickSound();
    triggerHaptic('heavy');
    onStartRegistration();
  };

  const valueProps = [
    t('welcomeVerified'),
    t('welcomeRealPhotos'),
    t('welcomeMutualInterest'),
  ];

  return (
    <div className="fixed inset-0 z-40 bg-[#070707] text-white overflow-y-auto overscroll-contain font-sans">
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-[#CCFF00]/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] h-[280px] bg-[#CCFF00]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative min-h-[var(--tg-viewport-height)] w-full max-w-sm mx-auto flex flex-col justify-between p-5 sm:p-6">
        {/* Top Spacer & App Category */}
        <div className="pt-2 sm:pt-4 flex items-center justify-center">
          <span className="text-[10px] font-mono tracking-[0.25em] text-gray-500 uppercase">
            Dating OS
          </span>
        </div>

        {/* Center Content: Logo + Name + Tagline + Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-6 w-full"
        >
          {/* Logo */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playLikeSound();
              triggerHaptic('medium');
            }}
            className="relative mb-5 cursor-pointer"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#111111] border border-white/10 shadow-[0_0_40px_rgba(204,255,0,0.2)] flex items-center justify-center">
              <LogoS size={60} className="drop-shadow-[0_8px_24px_rgba(204,255,0,0.4)]" />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight uppercase">
            SCULPT
          </h1>

          {/* Headline / Value statement */}
          <p className="mt-1.5 text-sm sm:text-base text-gray-300 font-sans font-medium">
            {t('welcomeHeadline')}
          </p>

          {/* 3 Clear Core Benefits (Result over tech) */}
          <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3 w-full max-w-[260px] text-left">
            {valueProps.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/40 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#CCFF00] stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-200">
                  {benefit}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Action: Clean [ Начать ] Button */}
        <div className="relative z-10 pt-4 pb-2 sm:pb-4 w-full">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(204,255,0,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{t('welcomeStart')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Subtle quick return for registered users */}
          {isRegistered && onQuickEnter && (
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  triggerHaptic('light');
                  onQuickEnter();
                }}
                className="text-[11px] font-mono text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-wider py-1"
              >
                {t('welcomeEnterFeed')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
