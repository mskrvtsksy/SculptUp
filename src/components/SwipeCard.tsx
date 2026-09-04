import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import {
  Heart,
  X,
  Sliders,
  Bookmark,
  Check,
  Sparkles,
  ChevronDown,
  MapPin,
  Flame,
  Activity,
  Award,
} from 'lucide-react';
import { UserProfile } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { CircleVerifiedCheck } from './BrandAssets';
import { TagBadge } from './TagBadge';

interface SwipeCardProps {
  profile: UserProfile;
  isTop: boolean;
  onSwipe: (direction: 'left' | 'right' | 'down') => void;
  onOpenAudit: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  isTop,
  onSwipe,
  onOpenAudit,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotation based on horizontal drag
  const rotate = useTransform(x, [-200, 200], [-14, 14]);

  // Opacity for LIKE and NOPE badges
  const likeOpacity = useTransform(x, [20, 110], [0, 1]);
  const nopeOpacity = useTransform(x, [-110, -20], [1, 0]);
  const auditPromptOpacity = useTransform(y, [30, 100], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    const offsetThreshold = 100;
    const velocityThreshold = 350;

    if (info.offset.y > 90 || info.velocity.y > velocityThreshold) {
      triggerHaptic('medium');
      onSwipe('down');
      onOpenAudit();
    } else if (info.offset.x > offsetThreshold || info.velocity.x > velocityThreshold) {
      triggerHaptic('medium');
      onSwipe('right');
    } else if (info.offset.x < -offsetThreshold || info.velocity.x < -velocityThreshold) {
      triggerHaptic('light');
      onSwipe('left');
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('selection');
    if (photoIndex < profile.photos.length - 1) {
      setPhotoIndex((prev) => prev + 1);
    } else {
      setPhotoIndex(0);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('selection');
    if (photoIndex > 0) {
      setPhotoIndex((prev) => prev - 1);
    } else {
      setPhotoIndex(profile.photos.length - 1);
    }
  };

  const currentPhoto = profile.photos[photoIndex] || profile.photos[0];

  return (
    <motion.div
      style={isTop ? { x, y, rotate, touchAction: 'none' } : undefined}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.65}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className={`absolute inset-0 select-none rounded-[32px] overflow-hidden bg-[#0A0A0A] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-all ${
        isTop ? 'cursor-grab active:cursor-grabbing z-10' : 'scale-[0.96] translate-y-3 opacity-60 pointer-events-none'
      }`}
    >
      {/* Photo container with fallback */}
      <div className="relative w-full h-full bg-[#111]">
        {!imageError ? (
          <img
            src={currentPhoto}
            alt={profile.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center filter saturate-[1.1] contrast-[1.05]"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1c1c] via-[#111] to-[#080808] p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center mb-3">
              <span className="text-3xl font-black text-[#CCFF00] font-mono">
                {profile.name[0]}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white">{profile.name}, {profile.age}</h4>
            <p className="text-xs text-gray-400 mt-1">{profile.city}</p>
          </div>
        )}

        {/* Cinematic Vignette & Rich Contrast Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 via-65% to-black/25 pointer-events-none" />

        {/* Top photo progress dashes */}
        {profile.photos.length > 1 && (
          <div className="absolute top-3 inset-x-4 flex gap-1.5 z-20 pointer-events-none">
            {profile.photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx === photoIndex ? 'bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Top Floating Controls: Match Tag & Verified Badge (left) and Bookmark (right) */}
        <div className="absolute top-5 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            {profile.verified ? (
              <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#CCFF00]/50 flex items-center gap-1.5 shadow-[0_0_12px_rgba(204,255,0,0.2)]">
                <Check className="w-3.5 h-3.5 text-[#CCFF00] stroke-[3]" />
                <span className="text-[10px] font-mono font-black text-[#CCFF00] tracking-wider uppercase">
                  ПРОВЕРЕН
                </span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-gray-300 tracking-wider">
                  {profile.distanceKm} km
                </span>
              </div>
            )}

            {/* High Match compatibility badge */}
            <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#CCFF00]/30 flex items-center gap-1 text-[10px] font-mono font-bold text-[#CCFF00]">
              <Flame className="w-3 h-3 text-[#CCFF00]" />
              <span>92% ВЗАИМНО</span>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              setIsBookmarked(!isBookmarked);
            }}
            className={`w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border flex items-center justify-center transition-all pointer-events-auto active:scale-90 ${
              isBookmarked
                ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/20 shadow-[0_0_12px_rgba(204,255,0,0.4)]'
                : 'border-white/20 text-white hover:border-white/40'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#CCFF00]' : ''}`} />
          </button>
        </div>

        {/* Click zones to navigate photos */}
        <div
          onClick={handlePrevPhoto}
          className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
        />
        <div
          onClick={handleNextPhoto}
          className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
        />

        {/* Swipe Feedback Badges in OKX neon styling */}
        {isTop && (
          <>
            {/* LIKE BADGE */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-16 left-6 z-30 pointer-events-none transform -rotate-12 border-2 border-[#CCFF00] bg-black/90 text-[#CCFF00] px-4 py-1.5 rounded-2xl font-black text-xl font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(204,255,0,0.5)]"
            >
              LIKE 🔥
            </motion.div>

            {/* PASS BADGE */}
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-16 right-6 z-30 pointer-events-none transform rotate-12 border-2 border-rose-500 bg-black/90 text-rose-400 px-4 py-1.5 rounded-2xl font-black text-xl font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(244,63,94,0.4)]"
            >
              PASS ✖
            </motion.div>

            {/* SWIPE DOWN AUDIT HINT */}
            <motion.div
              style={{ opacity: auditPromptOpacity }}
              className="absolute top-28 inset-x-8 z-30 pointer-events-none flex flex-col items-center justify-center p-3 rounded-2xl border border-[#CCFF00] bg-black/95 text-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.4)] text-center font-mono"
            >
              <Sliders className="w-5 h-5 animate-bounce text-[#CCFF00] mb-1" />
              <span className="text-[11px] font-black tracking-wider uppercase">
                СВАЙП ВНИЗ ДЛЯ АУДИТА
              </span>
            </motion.div>
          </>
        )}

        {/* Card Bottom Profile Content with High Density & Contrast */}
        <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col justify-end p-5 pb-5 bg-gradient-to-t from-black via-black/90 to-transparent">
          {/* Name, Age, Custom Circle Verified Badge */}
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-white font-mono tracking-tight drop-shadow-md">
              {profile.name}, {profile.age}
            </h2>
            {profile.verified && <CircleVerifiedCheck size={22} />}
          </div>

          {/* Subtitle Line: Workout · Location · Occupation */}
          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
            <span className="text-white font-bold">{profile.city}</span>
            <span className="text-gray-500">·</span>
            <span className="truncate">{profile.occupation || 'Creator'}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-400">{profile.distanceKm} км</span>
          </div>

          {/* Bio text */}
          <p className="text-sm text-gray-200 mt-2 font-normal leading-snug line-clamp-2">
            {profile.bio}
          </p>

          {/* Interest Tags / Looksmaxxing Badges */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {profile.tags.slice(0, 3).map((tag, idx) => (
                <TagBadge key={idx} tag={tag} size="sm" />
              ))}
              {profile.workout && (
                <TagBadge
                  tag={profile.workout}
                  size="sm"
                  className="border-[#CCFF00]/30 bg-[#CCFF00]/10 text-[#CCFF00]"
                />
              )}
            </div>
          )}

          {/* Quick Sculpt Score Pill bar & Audit launcher */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('medium');
              onOpenAudit();
            }}
            className="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#CCFF00]/60 flex items-center justify-between text-xs text-gray-300 transition-all pointer-events-auto active:scale-98 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                Sculpt Score
              </span>
              <span className="text-[11px] font-mono font-black text-[#CCFF00] px-1.5 py-0.5 rounded bg-black/60 border border-[#CCFF00]/30">
                {profile.glowUpScore.toFixed(1)} / 10
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-[#CCFF00] font-bold">
              <span>Аудит</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#CCFF00]" />
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
