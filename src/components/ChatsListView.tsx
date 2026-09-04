import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageCircle,
  Search,
  CheckCheck,
  Flame,
  Sliders,
  Sparkles,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Match } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { playClickSound, playHoverSound } from '../lib/sound';
import { useTranslation } from '../lib/i18n';

interface ChatsListViewProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  onGoToDeck: () => void;
}

export const ChatsListView: React.FC<ChatsListViewProps> = ({
  matches,
  onSelectMatch,
  onGoToDeck,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatches = matches.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.user.name.toLowerCase().includes(q) ||
      m.user.city.toLowerCase().includes(q) ||
      (m.lastMessage && m.lastMessage.toLowerCase().includes(q)) ||
      (m.theirRatingForYou?.adviceTag &&
        m.theirRatingForYou.adviceTag.toLowerCase().includes(q))
    );
  });

  const totalUnread = matches.reduce((acc, m) => acc + (m.unreadCount || 0), 0);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col h-full min-h-0 space-y-4 overflow-y-auto overscroll-contain pb-16">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-mono font-black text-white flex items-center gap-2 tracking-tight">
            <span>{t('chatsTitle')}</span>
            {totalUnread > 0 && (
              <span className="text-[10px] font-mono font-bold text-black bg-[#CCFF00] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                {totalUnread}
              </span>
            )}
          </h2>
          <p className="text-[11px] font-mono text-gray-400">
            {t('chatsSubtitle')}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t('chatsSearch')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D0D0D] border border-white/10 rounded-2xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#CCFF00] transition-colors"
        />
      </div>

      {/* Horizontal Strip: Recent Mutual Matches */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider px-1">
            {t('chatsNewMatches')}
          </span>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {matches.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  triggerHaptic('light');
                  onSelectMatch(m);
                }}
                onMouseEnter={playHoverSound}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer hover-glow-green"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-tr from-[#CCFF00] to-white/40 group-hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all">
                    <img
                      src={m.user.photos[0]}
                      alt={m.user.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#CCFF00] border-2 border-black rounded-full" />
                </div>
                <span className="text-[11px] font-mono font-bold text-white group-hover:text-[#CCFF00] transition-colors truncate max-w-[64px]">
                  {m.user.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dialogues List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider">
            {t('chatsAllMessages', { count: filteredMatches.length })}
          </span>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#0D0D0D] border border-white/10 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center mx-auto text-[#CCFF00]">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-mono font-bold text-white">
              {searchQuery ? t('chatsNoResults') : t('chatsEmpty')}
            </h4>
            <p className="text-xs font-mono text-gray-400 max-w-xs mx-auto">
              {searchQuery
                ? t('chatsNoResultsHint')
                : t('chatsEmptyHint')}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  triggerHaptic('medium');
                  onGoToDeck();
                }}
                onMouseEnter={playHoverSound}
                className="mt-2 py-2.5 px-5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover-glow-green"
              >
                <Flame className="w-3.5 h-3.5 fill-black" />
                <span>{t('chatsGoToProfiles')}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  playClickSound();
                  triggerHaptic('light');
                  onSelectMatch(m);
                }}
                onMouseEnter={playHoverSound}
                className="p-3.5 rounded-2xl bg-[#0D0D0D] border border-white/10 hover:border-[#CCFF00]/50 transition-all cursor-pointer flex items-center justify-between group hover-glow-green"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={m.user.photos[0]}
                      alt={m.user.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/15 group-hover:border-[#CCFF00] transition-colors"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#CCFF00] border-2 border-black rounded-full" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white group-hover:text-[#CCFF00] transition-colors truncate">
                        {m.user.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/15 px-1.5 py-0.5 rounded border border-[#CCFF00]/30 shrink-0">
                        ★ {m.user.glowUpScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 ml-auto shrink-0">
                        {m.matchedAt}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-gray-400 truncate mt-0.5 group-hover:text-gray-300 transition-colors">
                      {m.lastMessage || t('chatsStartConversation')}
                    </p>

                    {/* Mutual Looksmaxxing advice chip */}
                    {m.theirRatingForYou?.adviceTag && (
                      <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-1.5 py-0.5 rounded border border-[#CCFF00]/25 truncate max-w-full">
                        <Sliders className="w-2.5 h-2.5 text-[#CCFF00] shrink-0" />
                        <span className="truncate">{m.theirRatingForYou.adviceTag}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {m.unreadCount ? (
                    <span className="w-5 h-5 rounded-full bg-[#CCFF00] text-black font-mono font-black text-[10px] flex items-center justify-center shadow-[0_0_10px_rgba(204,255,0,0.5)]">
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
    </div>
  );
};
