import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, MessageSquare } from 'lucide-react';
import { UserProfile, TelegramUser } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { playHoverSound, playClickSound } from '../lib/sound';

interface MatchCelebrationModalProps {
  partner: UserProfile | null;
  currentUser: TelegramUser;
  isOpen: boolean;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  partner,
  currentUser,
  isOpen,
  onSendMessage,
  onKeepSwiping,
}) => {
  if (!isOpen || !partner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="w-full max-w-sm bg-[#0D0D0D] border border-white/15 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(204,255,0,0.15)] relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>IT'S A MATCH!</span>
          </div>

          <h3 className="text-2xl font-mono font-black text-white mb-2 tracking-tight">
            Взаимная симпатия 🔥
          </h3>
          <p className="text-xs font-mono text-gray-400 mb-6">
            Ты и <strong className="text-white">{partner.name}</strong> высоко оценили стиль и эстетику друг друга.
          </p>

          {/* Dual Avatars */}
          <div className="flex items-center justify-center -space-x-4 mb-6">
            <div className="relative z-10">
              <img
                src={currentUser.photo_url}
                alt={currentUser.first_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#CCFF00] shadow-xl"
              />
              <span className="absolute -bottom-1 -left-1 bg-[#CCFF00] text-black text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full">
                Ты
              </span>
            </div>

            <div className="w-10 h-10 rounded-full bg-black border border-[#CCFF00] z-20 flex items-center justify-center text-[#CCFF00] shadow-md">
              <Heart className="w-5 h-5 fill-[#CCFF00]" />
            </div>

            <div className="relative z-10">
              <img
                src={partner.photos[0]}
                alt={partner.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/40 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 bg-white text-black text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full">
                ★ {partner.glowUpScore.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => {
                playClickSound();
                triggerHaptic('success');
                onSendMessage();
              }}
              onMouseEnter={playHoverSound}
              className="w-full py-3.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.35)] active:scale-95 transition-all hover-glow-green"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Написать первое сообщение</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                triggerHaptic('light');
                onKeepSwiping();
              }}
              onMouseEnter={playHoverSound}
              className="w-full py-3 px-4 rounded-xl border border-white/10 bg-[#141414] hover:bg-white/5 text-gray-300 font-mono text-xs font-bold transition-colors hover-glow-green"
            >
              Продолжить свайпать
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
