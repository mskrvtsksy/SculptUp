import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Sliders, CheckCircle2, Flame, Award, Heart } from 'lucide-react';
import { UserProfile, LooksmaxxingRating } from '../types';
import { LOOKSMAXXING_TIPS_OPTIONS } from '../data/tags';
import { triggerHaptic } from '../lib/telegram';
import { playHoverSound, playClickSound } from '../lib/sound';

interface DetailedRatingModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (rating: LooksmaxxingRating, isLike: boolean) => void;
}

export const DetailedRatingModal: React.FC<DetailedRatingModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSubmitRating,
}) => {
  const [facialStructure, setFacialStructure] = useState<number>(8.5);
  const [hairGrooming, setHairGrooming] = useState<number>(8.0);
  const [styleAndFit, setStyleAndFit] = useState<number>(9.0);
  const [physique, setPhysique] = useState<number>(8.5);
  const [glowUpPotential, setGlowUpPotential] = useState<number>(9.5);
  const [selectedTip, setSelectedTip] = useState<string>(LOOKSMAXXING_TIPS_OPTIONS[0]);
  const [customComment, setCustomComment] = useState<string>('');

  if (!isOpen) return null;

  const averageScore = Number(
    ((facialStructure + hairGrooming + styleAndFit + physique + glowUpPotential) / 5).toFixed(1)
  );

  const getTierBadge = (score: number) => {
    if (score >= 9.0) return { label: 'AESTHETIC GOD / ASCENDANT', color: 'text-[#CCFF00] border-[#CCFF00]/50 bg-[#CCFF00]/15 glow-lime' };
    if (score >= 8.0) return { label: 'HIGH-TIER CHAD / STACY', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40 glow-emerald' };
    if (score >= 7.0) return { label: 'MASSIVE GLOW-UP POTENTIAL', color: 'text-amber-400 border-amber-500/50 bg-amber-950/40 glow-amber' };
    return { label: 'RAW DIAMOND (HIGH UPSIDE)', color: 'text-rose-400 border-rose-500/50 bg-rose-950/40' };
  };

  const tier = getTierBadge(averageScore);

  const handleSliderChange = (setter: (v: number) => void, val: number) => {
    setter(val);
    triggerHaptic('selection');
  };

  const handleSend = (isLike: boolean) => {
    triggerHaptic('success');
    onSubmitRating(
      {
        facialStructure,
        hairGrooming,
        styleAndFit,
        physique,
        glowUpPotential,
        adviceTag: selectedTip,
        comment: customComment.trim() || undefined,
        ratedAt: new Date().toISOString(),
      },
      isLike
    );
    onClose();
  };

  const criteria = [
    {
      id: 'facial',
      label: 'Челюсть & Симметрия лица',
      desc: 'Jawline, hunter eyes, углы подбородка',
      val: facialStructure,
      setter: setFacialStructure,
      icon: '📐',
    },
    {
      id: 'hair',
      label: 'Прическа & Ухоженность',
      desc: 'Фейд, текстура, здоровье волос и кожи',
      val: hairGrooming,
      setter: setHairGrooming,
      icon: '✂️',
    },
    {
      id: 'style',
      label: 'Стиль, Посадка & Вайб',
      desc: 'Аутфит, колористика и аксессуары',
      val: styleAndFit,
      setter: setStyleAndFit,
      icon: '🕶️',
    },
    {
      id: 'physique',
      label: 'Телосложение & Осанка',
      desc: 'V-taper, тонус, процент жира, плечи',
      val: physique,
      setter: setPhysique,
      icon: '🏋️',
    },
    {
      id: 'glowup',
      label: 'Общий Glow-Up Потенциал',
      desc: 'Насколько взлетит эстетика при тюнинге',
      val: glowUpPotential,
      setter: setGlowUpPotential,
      icon: '⚡',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 sm:rounded-[32px] rounded-t-[32px] overflow-hidden flex flex-col max-h-[92vh] shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
        >
          {/* Header */}
          <div className="relative px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between bg-black">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/15"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#CCFF00] text-black text-[10px] font-black px-1.5 rounded-full shadow-sm">
                  {profile.age}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {profile.name}
                  </h3>
                  <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
                </div>
                <p className="text-xs text-gray-400">
                  {profile.city} • Аудит Looksmaxxing
                </p>
              </div>
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

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
            {/* Real-time calculated score indicator */}
            <div className="p-4 rounded-2xl bg-[#111] border border-[#222] text-center relative overflow-hidden shadow-inner">
              <div className="text-[10px] tracking-widest font-bold uppercase text-gray-400 mb-1 flex items-center justify-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#CCFF00]" />
                Итоговый индекс внешности
              </div>
              <div className="flex items-baseline justify-center gap-1 my-1">
                <span className="text-4xl font-black text-[#CCFF00] font-mono">
                  {averageScore.toFixed(1)}
                </span>
                <span className="text-lg text-gray-500 font-bold font-mono">/ 10.0</span>
              </div>
              <div className="inline-block mt-1">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${tier.color} tracking-wider uppercase`}>
                  {tier.label}
                </span>
              </div>
            </div>

            {/* Sliders list */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#CCFF00]" />
                Точечные параметры оценки
              </h4>

              {criteria.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#111] border border-[#222] hover:border-[#333] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-gray-200">{item.label}</span>
                        <p className="text-[10px] text-gray-500 leading-tight">{item.desc}</p>
                      </div>
                    </div>
                    <div className="px-2 py-0.5 rounded-lg bg-black border border-white/10 text-[#CCFF00] font-mono text-xs font-bold min-w-[36px] text-center">
                      {item.val.toFixed(1)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-bold text-gray-600">1</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={item.val}
                      onChange={(e) => handleSliderChange(item.setter, parseFloat(e.target.value))}
                      className="w-full accent-[#CCFF00] bg-[#222] h-1.5 rounded-full cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-[#CCFF00]">10</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actionable looksmaxxing advice tag */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#CCFF00]" />
                Совет для Glow-Up
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LOOKSMAXXING_TIPS_OPTIONS.map((tip) => {
                  const isSelected = selectedTip === tip;
                  return (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => {
                        setSelectedTip(tip);
                        triggerHaptic('selection');
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border text-left transition-all ${
                        isSelected
                          ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00] font-bold shadow-[0_0_10px_rgba(204,255,0,0.2)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {tip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom comment */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Личный отзыв (анонимно)
              </label>
              <input
                type="text"
                placeholder="Напиши комплимент или конструктивную подсказку..."
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                maxLength={100}
                className="w-full bg-[#111] border border-[#222] rounded-xl px-3.5 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#CCFF00] transition-colors"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 border-t border-[#1a1a1a] bg-black flex gap-3">
            <button
              onClick={() => {
                playClickSound();
                handleSend(false);
              }}
              onMouseEnter={playHoverSound}
              className="flex-1 py-3 px-4 rounded-full border border-white/10 hover:bg-white/5 text-gray-300 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors hover-glow-green"
            >
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              Только оценка
            </button>
            <button
              onClick={() => {
                playClickSound();
                handleSend(true);
              }}
              onMouseEnter={playHoverSound}
              className="flex-1 py-3 px-4 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.35)] active:scale-95 transition-all hover-glow-green"
            >
              <Heart className="w-4 h-4 fill-black text-black" />
              Оценка + Лайк
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
