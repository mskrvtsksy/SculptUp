import React from 'react';
import {
  Coffee,
  Plane,
  Briefcase,
  BookOpen,
  Music,
  Film,
  Camera,
  Palette,
  Cpu,
  Dumbbell,
  Activity,
  Target,
  Waves,
  HeartPulse,
  Shirt,
  Landmark,
  Minimize2,
  Gem,
  Sparkles,
  Diamond,
  Eye,
  ArrowUpRight,
  FlaskConical,
  Check,
  Tag,
  LucideIcon,
} from 'lucide-react';
import { TagIconKey, TagItem, getTagMeta } from '../data/tags';

export const TAG_ICON_MAP: Record<TagIconKey, LucideIcon> = {
  coffee: Coffee,
  travel: Plane,
  business: Briefcase,
  books: BookOpen,
  music: Music,
  cinema: Film,
  photo: Camera,
  art: Palette,
  tech: Cpu,
  gym: Dumbbell,
  running: Activity,
  boxing: Target,
  swimming: Waves,
  yoga: HeartPulse,
  calisthenics: Dumbbell,
  streetwear: Shirt,
  oldmoney: Landmark,
  minimalism: Minimize2,
  quietluxury: Gem,
  vintage: Sparkles,
  jawline: Diamond,
  huntereyes: Eye,
  skincare: Sparkles,
  posture: ArrowUpRight,
  fragrance: FlaskConical,
};

export interface TagIconProps {
  iconName?: TagIconKey | string;
  className?: string;
  size?: number;
}

export const TagIcon: React.FC<TagIconProps> = ({
  iconName,
  className = 'w-3.5 h-3.5',
  size,
}) => {
  const IconComponent = (iconName && TAG_ICON_MAP[iconName as TagIconKey]) || Tag;
  return (
    <IconComponent
      className={className}
      size={size}
      strokeWidth={1.75}
      aria-hidden="true"
    />
  );
};

export interface TagBadgeProps {
  tag: string | TagItem;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCheck?: boolean;
  showCategory?: boolean;
  interactive?: boolean;
  className?: string;
  lang?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  isSelected = false,
  onClick,
  size = 'md',
  showCheck = true,
  interactive = false,
  className = '',
  lang = 'ru',
}) => {
  const meta: TagItem = typeof tag === 'string' ? getTagMeta(tag) : tag;
  const isClickable = interactive || Boolean(onClick);
  const displayLabel = (lang && lang !== 'ru' && meta.englishLabel) ? meta.englishLabel : meta.label;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 rounded-full',
    md: 'text-xs px-3 py-1.5 gap-1.5 rounded-xl',
    lg: 'text-sm px-3.5 py-2 gap-2 rounded-xl',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <button
      type={isClickable ? 'button' : undefined}
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`font-mono font-medium border inline-flex items-center justify-center transition-all select-none ${sizeClasses} ${
        isSelected
          ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] font-bold shadow-[0_0_12px_rgba(204,255,0,0.25)]'
          : isClickable
          ? 'border-white/10 bg-[#121212] text-gray-400 hover:border-white/20 hover:text-white hover-glow-green cursor-pointer'
          : 'border-white/10 bg-white/5 text-gray-300'
      } ${className}`}
      title={meta.description || meta.label}
    >
      <TagIcon
        iconName={meta.iconName}
        className={`${iconSizes} shrink-0 ${isSelected ? 'text-[#CCFF00]' : 'text-gray-400'}`}
      />
      <span className="truncate leading-none">{displayLabel}</span>
      
      {/* Zero-Layout-Shift Check Slot: space is ALWAYS reserved when interactive/showCheck, toggles opacity */}
      {isClickable && showCheck && (
        <span
          className={`w-3 h-3 flex items-center justify-center shrink-0 transition-all duration-200 ${
            isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
        >
          <Check className="w-3 h-3 text-[#CCFF00] stroke-[2.5]" />
        </span>
      )}
    </button>
  );
};
