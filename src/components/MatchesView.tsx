import React, { useState } from 'react';
import {
  Lock,
  Heart,
  Eye,
  Star,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Match, WhoLikedItem, SupportedLanguage } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { t } from '../lib/i18n';

interface MatchesViewProps {
  matches: Match[];
  whoLikedList: WhoLikedItem[];
  isWhoLikedUnlocked: boolean;
  isPremium: boolean;
  onOpenShop: () => void;
  onSelectMatch: (match: Match) => void;
  onLikeBack: (item: WhoLikedItem) => void;
  lang?: SupportedLanguage;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  whoLikedList,
  isWhoLikedUnlocked,
  isPremium,
  onOpenShop,
  onSelectMatch,
  onLikeBack,
  lang = 'ru',
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'who_liked'>('matches');
  const canSeeWhoLiked = isPremium || isWhoLikedUnlocked;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col h-full min-h-0 space-y-3">
      {/* Subtabs styling */}
      <div className="p-1 rounded-full bg-[#111] border border-[#222] flex gap-1 shrink-0">
        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('matches');
          }}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'matches'
              ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40 shadow-[0_0_12px_rgba(204,255,0,0.2)]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{t(lang, 'tabMatches')} ({matches.length})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('who_liked');
          }}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'who_liked'
              ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40 shadow-[0_0_12px_rgba(204,255,0,0.2)]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t(lang, 'tabWhoLiked')} ({whoLikedList.length})</span>
          {!canSeeWhoLiked && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
          )}
        </button>
      </div>

      {/* MATCHES TAB */}
      {activeTab === 'matches' && (
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain pb-16">
          {matches.length === 0 ? (
            <div className="space-y-4 my-2">
              <div className="p-5 rounded-3xl bg-[#0e0e0e] border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#CCFF00]" />
                      {t(lang, 'whoLikedTitle')}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {whoLikedList.length > 0
                        ? `${whoLikedList.length} ${lang === 'ru' ? 'проявили интерес к анкете' : 'showed interest in your profile'}`
                        : (lang === 'ru' ? 'Пока новых симпатий нет' : 'No new likes yet')}
                    </p>
                  </div>

                  {whoLikedList.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-mono font-black border border-[#CCFF00]/30">NEW</span>
                  )}
                </div>

                {/* 3 blurred teaser photos */}
                {whoLikedList.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {whoLikedList.slice(0, 3).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#161616]"
                    >
                      <img
                        src={item.user.photos[0]}
                        alt="Teaser"
                        className="w-full h-full object-cover filter blur-md scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-1 text-center">
                        <div className="w-7 h-7 rounded-full bg-black/70 border border-[#CCFF00]/50 flex items-center justify-center mb-1">
                          <Lock className="w-3.5 h-3.5 text-[#CCFF00]" />
                        </div>
                        <span className="text-[10px] font-mono font-black text-white">
                          {item.user.age} y.o.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="py-5 text-center text-xs text-gray-500 font-mono">{lang === 'ru' ? 'Заполните профиль и начните знакомиться — здесь появятся реальные симпатии.' : 'Complete your profile and start discovering people — real likes will appear here.'}</p>
                )}

                {/* CTA Button */}
                {whoLikedList.length > 0 && <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    onOpenShop();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-98"
                >
                  <Star className="w-4 h-4 fill-black text-black" />
                  <span>{t(lang, 'unlockLikesBtn')}</span>
                </button>}
              </div>

              <div className="text-center py-2">
                <p className="text-xs text-gray-500 font-mono">
                  {t(lang, 'noMatchesDesc')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider px-1">
                {t(lang, 'tabMatches')}
              </span>

              {/* Clean, Non-Cluttered Match Cards */}
              {matches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectMatch(m);
                  }}
                  className="p-3.5 rounded-2xl bg-[#0e0e0e] border border-white/10 hover:border-[#CCFF00]/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={m.user.photos[0]}
                        alt={m.user.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:border-[#CCFF00] transition-colors"
                      />
                      {m.user.isVerified && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0088cc] rounded-full flex items-center justify-center text-white border border-[#0e0e0e]">
                          <ShieldCheck className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                          {m.user.name}, {m.user.age}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          • {m.user.city}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-md border border-[#CCFF00]/25">
                          <Heart className="w-2.5 h-2.5 fill-[#CCFF00]" />
                          <span>{t(lang, 'mutualMatch')}</span>
                        </span>
                        {m.lastMessage && (
                          <span className="text-xs text-gray-500 truncate max-w-[140px]">
                            {m.lastMessage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.unreadCount ? (
                      <span className="w-5 h-5 rounded-full bg-[#CCFF00] text-black font-black text-[11px] flex items-center justify-center shadow-[0_0_10px_rgba(204,255,0,0.5)]">
                        {m.unreadCount}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#CCFF00] transition-colors" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WHO LIKED YOU TAB */}
      {activeTab === 'who_liked' && (
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain pb-16">
          {!canSeeWhoLiked ? (
            <div className="p-5 rounded-3xl bg-[#0e0e0e] border border-[#CCFF00]/30 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center mx-auto text-[#CCFF00]">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  {whoLikedList.length} {lang === 'ru' ? 'человек проявили интерес' : 'people liked your profile'}
                </h4>
                <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto leading-relaxed">
                  {t(lang, 'whoLikedSub')}
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    onOpenShop();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all"
                >
                  <Star className="w-4 h-4 fill-black text-black" />
                  <span>{t(lang, 'unlockLikesBtn')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center gap-2 text-[#CCFF00] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00] shrink-0" />
              <span>{lang === 'ru' ? 'Доступ разблокирован. Ты видишь всех, кто проявил интерес.' : 'Access unlocked. You can see everyone who liked you.'}</span>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {whoLikedList.map((item) => (
              <div
                key={item.id}
                className="relative rounded-2xl overflow-hidden bg-[#0e0e0e] border border-white/10 shadow-lg group"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={item.user.photos[0]}
                    alt={item.user.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      !canSeeWhoLiked ? 'blur-xl scale-110' : 'group-hover:scale-105'
                    }`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {!canSeeWhoLiked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10">
                      <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-[#CCFF00]/40 flex items-center justify-center mb-1.5">
                        <Lock className="w-4 h-4 text-[#CCFF00]" />
                      </div>
                      <span className="text-[11px] font-black text-white">
                        {item.user.age} y.o., {item.user.city}
                      </span>
                      <span className="text-[9px] text-[#CCFF00] font-bold mt-0.5">
                        {item.likedAt}
                      </span>
                    </div>
                  )}

                  {canSeeWhoLiked && (
                    <div className="absolute bottom-0 inset-x-0 p-3 z-10 space-y-2">
                      <div>
                        <span className="text-sm font-black text-white block">
                          {item.user.name}, {item.user.age}
                        </span>
                        <span className="text-[10px] text-gray-300 block font-mono">
                          {item.user.city}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('success');
                          onLikeBack(item);
                        }}
                        className="w-full py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 fill-black" />
                        <span>{t(lang, 'startChat')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
