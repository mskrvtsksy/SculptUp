import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sliders,
  CheckCheck,
  Flame,
  Sparkles,
  Mic,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { Match, ChatMessage } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { playHoverSound, playClickSound, playLikeSound } from '../lib/sound';

interface ChatModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLastMessage?: (matchId: string, text: string) => void;
  storageScope: string;
  enableDemoReplies?: boolean;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  match,
  isOpen,
  onClose,
  onUpdateLastMessage,
  storageScope,
  enableDemoReplies = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Per-match local conversation storage
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!match) return;

    // Load conversation from localStorage or initialize with natural default
    const saved = localStorage.getItem(`${storageScope}:chat:${match.id}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch {
        // fallback
      }
    }

    const defaultMsgs: ChatMessage[] = [
      {
        id: 'c1',
        senderId: 'them',
        text: match.lastMessage || 'Привет! Заценил(а) твой стиль и профиль в SCULPT 🔥',
        timestamp: '14:22',
      },
    ];

    if (match.theirRatingForYou?.adviceTag) {
      defaultMsgs.push({
        id: 'c2',
        senderId: 'them',
        text: `Кстати, твой стиль — чистый ${match.theirRatingForYou.styleAndFit || 9.5}/10! «${match.theirRatingForYou.adviceTag}»`,
        timestamp: '14:23',
        isLooksmaxxingTip: true,
      });
    }

    setMessages(defaultMsgs);
  }, [match?.id, storageScope]);

  useEffect(() => {
    if (match && messages.length > 0) {
      localStorage.setItem(`${storageScope}:chat:${match.id}`, JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, match?.id, storageScope]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !match) return;

    playClickSound();
    triggerHaptic('light');

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    if (onUpdateLastMessage) {
      onUpdateLastMessage(match.id, text);
    }

    // Simulated replies are available only in an explicitly enabled demo.
    // A production chat must receive messages from the server/realtime layer.
    if (!enableDemoReplies) return;

    setIsTyping(true);
    setTimeout(() => {
      triggerHaptic('selection');
      setIsTyping(false);

      const replies = [
        'Согласен(на)! Какой у тебя сейчас главный фокус в glow-up и тренировках?',
        'Кстати, у тебя реально сильный профиль и посадка плеч на фотографиях!',
        'Спасибо за взаимную оценку! Когда свободен(на) на кофе или прогулку?',
        'Твой вайб в SCULPT — топ 1%! Давно занимаешься стилем?',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: 'them',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, replyMsg]);
      playLikeSound();
      if (onUpdateLastMessage) {
        onUpdateLastMessage(match.id, randomReply);
      }
    }, 1400);
  };

  const quickIcebreakers = [
    'Твой стиль — чистый 10/10 🔥',
    'В какой зал ходишь тренироваться?',
    'Посоветуешь свой любимый нишевый парфюм?',
    'Когда свободен(на) на кофе?',
  ];

  return (
    <AnimatePresence>
      {isOpen && match && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-lg bg-[#0D0D0D] border border-white/10 sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col h-[100dvh] sm:h-[92vh] shadow-[0_0_50px_rgba(0,0,0,0.95)]"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between bg-black">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={match.user.photos[0]}
                    alt={match.user.name}
                    className="w-10 h-10 rounded-xl object-cover border border-white/15"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#CCFF00] border-2 border-black rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-mono font-bold text-white">{match.user.name}</h4>
                    <span className="text-[10px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/15 px-1.5 py-0.5 rounded border border-[#CCFF00]/30">
                      ★ {match.user.glowUpScore.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">
                    {match.user.city} • <span className="text-[#CCFF00]">онлайн</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  triggerHaptic('light');
                  onClose();
                }}
                onMouseEnter={playHoverSound}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors hover-glow-green cursor-pointer"
                title="Закрыть диалог"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mutual Looksmaxxing Scores Banner */}
            <div className="bg-[#121212] p-3 border-b border-white/10">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-[#CCFF00] font-bold">
                  <Sliders className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Взаимный аудит SCULPT</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  Оценка стиля:{' '}
                  <strong className="text-[#CCFF00]">
                    {match.theirRatingForYou?.styleAndFit || 9.2}/10
                  </strong>
                </span>
              </div>
              {match.theirRatingForYou?.adviceTag && (
                <div className="mt-1.5 text-[11px] font-mono text-gray-300 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Совет: «{match.theirRatingForYou.adviceTag}»</span>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-black">
              {messages.map((m) => {
                const isMe = m.senderId === 'me';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-mono leading-relaxed ${
                        isMe
                          ? 'bg-[#CCFF00] text-black font-semibold rounded-br-none shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                          : m.isLooksmaxxingTip
                          ? 'bg-[#12160d] border border-[#CCFF00]/40 text-[#CCFF00] rounded-bl-none shadow-[0_0_12px_rgba(204,255,0,0.15)]'
                          : 'bg-[#121212] border border-white/10 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p>{m.text}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-gray-500 mt-1 px-1">
                      <span>{m.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#CCFF00]" />}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 bg-[#121212] border border-white/10 px-3 py-2 rounded-2xl w-max rounded-bl-none">
                  <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce" />
                  <span className="ml-1 text-[10px] text-[#CCFF00] font-bold">
                    {match.user.name} печатает...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Icebreaker Suggestions */}
            <div className="px-4 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-white/10 bg-[#0a0a0a]">
              {quickIcebreakers.map((ice, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSend(ice);
                  }}
                  onMouseEnter={playHoverSound}
                  className="whitespace-nowrap text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#141414] border border-white/10 text-gray-300 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors hover-glow-green cursor-pointer"
                >
                  {ice}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-white/10 bg-black flex items-center gap-2">
              <input
                type="text"
                placeholder="Напиши сообщение..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#CCFF00] transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                onMouseEnter={playHoverSound}
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-xl transition-all hover-glow-green ${
                  inputText.trim()
                    ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.4)] cursor-pointer'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                }`}
                title="Отправить"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
