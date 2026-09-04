import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Scale,
  Sparkles,
  MapPin,
  Camera,
  Users,
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../lib/sound';
import { triggerHaptic } from '../lib/telegram';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAndClose?: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
  onAcceptAndClose,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>('age');

  const toggleSection = (id: string) => {
    playClickSound();
    triggerHaptic('selection');
    setActiveSection((prev) => (prev === id ? null : id));
  };

  const sections = [
    {
      id: 'age',
      icon: AlertTriangle,
      badge: 'СТРОГО 18+',
      title: '1. Возрастной ценз и подтверждение совершеннолетия',
      summary:
        'Платформа SCULPT предназначена исключительно для совершеннолетних пользователей (18+).',
      content: `1.1. Вы подтверждаете, что вам исполнилось 18 лет на момент регистрации в сервисе.
1.2. Сервис ориентирован на взрослую аудиторию, поэтому регистрация лиц младше 18 лет не поддерживается.
1.3. Мы ценим честность и открытость нашего сообщества и просим указывать ваш реальный возраст.`,
    },
    {
      id: 'telegram',
      icon: Lock,
      badge: 'ВХОД TELEGRAM',
      title: '2. Вход через Telegram и защита от фейков',
      summary:
        'Ваш аккаунт используется для подтверждения личности и защиты от фейков.',
      content: `2.1. Вход в сервис осуществляется через Telegram, что обеспечивает надежную защиту данных и гарантирует, что вы общаетесь с реальными людьми.
2.2. Запрещается создание ботов, поддельных или чужих профилей. Один аккаунт Telegram соответствует одной анкете в SCULPT.
2.3. Доступ к вашему профилю надежно закреплен за вашим личным Telegram-аккаунтом.`,
    },
    {
      id: 'looksmaxxing',
      icon: Sparkles,
      badge: 'СТАНДАРТЫ КАЧЕСТВА',
      title: '3. Стандарты качества профиля и рекомендации',
      summary:
        'Оценки и рекомендации направлены на позитивное вдохновение, стиль и уход.',
      content: `3.1. Функция взаимных подсказок и оценок создана, чтобы помочь подчеркнуть индивидуальный стиль, подачу и лучшие стороны вашей анкеты.
3.2. В сообществе действуют правила взаимного уважения: запрещены оскорбления, токсичное поведение, дискриминация и публикация интимных материалов без согласия собеседника.
3.3. Мы бережно поддерживаем дружелюбную, открытую и безопасную атмосферу для каждого участника.`,
    },
    {
      id: 'geo',
      icon: MapPin,
      badge: 'ПРИВАТНОСТЬ ГЕОДАННЫХ',
      title: '4. Геолокация, города и расчет дистанции',
      summary:
        'Точные координаты GPS никогда не передаются другим пользователям и не публикуются.',
      content: `4.1. Для предотвращения спама и фейковых локаций выбор города ограничен официальным реестром реальных населенных пунктов.
4.2. GPS-координаты устройства запрашиваются исключительно с Вашего согласия и используются только в математических расчетах дистанции (в километрах) между Вами и другими анкетами по формуле Haversine.
4.3. Точный домашний адрес, улица, номер дома и текущие гео-координаты остаются конфиденциальными и НИКОГДА не раскрываются другим участникам сервиса. В анкете отображается лишь город, страна и приблизительный радиус.`,
    },
    {
      id: 'verification',
      icon: Camera,
      badge: 'ГАЛОЧКА ДОВЕРИЯ',
      title: '5. Верификация селфи и политика знака «ПРОВЕРЕН»',
      summary:
        'Верификация селфи через WebRTC добровольна, но дает верифицированную галочку доверия.',
      content: `5.1. Верификация фото и селфи в реальном времени служит инструментом подтверждения подлинности владельца анкеты и защиты от ботов.
5.2. Прохождение верификации является добровольным:
   • При успешном прохождении пользователь получает официальный статус и значок «ПРОВЕРЕН» (Verified Badge), приоритетный показ в рекомендациях и повышенный уровень доверия.
   • Пользователь имеет право пропустить данный шаг (Skip). В таком случае профиль регистрируется без галочки верификации. Пользователь может пройти верификацию в любое время позже.
5.3. Биометрические контрольные снимки не передаются третьим лицам и используются исключительно для подтверждения соответствия фото профиля реальному человеку.`,
    },
    {
      id: 'stars',
      icon: Scale,
      badge: 'TELEGRAM STARS',
      title: '6. Виртуальные услуги и Telegram Stars',
      summary:
        'Приобретение виртуальных функций регулируется официальными правилами Telegram Digital Goods.',
      content: `6.1. Внутренние функции (SCULPT PRO, дополнительные свайпы, открытие лайков, радар) могут приобретаться за Telegram Stars.
6.2. Все цифровые услуги оказываются мгновенно после подтверждения транзакции в Telegram. Возврат звезд за активированные услуги не предусмотрен, за исключением технических сбоев подтвержденных разработчиком.`,
    },
    {
      id: 'liability',
      icon: Users,
      badge: 'ОТВЕТСТВЕННОСТЬ',
      title: '7. Персональная безопасность при оффлайн-встречах',
      summary:
        'Сервис является коммуникационной площадкой. Соблюдайте правила личной безопасности.',
      content: `7.1. Пользователи несут личную ответственность за взаимодействие вне цифровой среды платформы. Рекомендуется проводить первые встречи в публичных местах и не раскрывать персональные финансовые данные.
7.2. Администрация сервиса не несет ответственности за поведение пользователей вне рамок Telegram Mini App. При любых подозрительных действиях незамедлительно используйте функцию жалобы (Report).`,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg max-h-[90vh] bg-[#0A0A0A] border border-white/15 rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-white"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/40 flex items-center justify-center text-[#CCFF00]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white tracking-wide">
                    Пользовательское соглашение
                  </h3>
                  <p className="text-[10px] font-mono text-gray-400">
                    SCULPT Terms of Service & Privacy Protocol
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  triggerHaptic('light');
                  onClose();
                }}
                onMouseEnter={playHoverSound}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer hover-glow-green"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 18+ highlight banner */}
            <div className="px-5 py-2.5 bg-[#121200] border-b border-[#CCFF00]/25 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00] shrink-0" />
              <p className="text-[11px] font-mono text-[#e5ff80] leading-snug">
                <strong>Юридическое требование:</strong> Сервис предназначен строго для лиц от 18 лет. Регистрируясь, вы даете юридическое подтверждение своего возраста.
              </p>
            </div>

            {/* Scrollable Sections Accordion */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar bg-[#070707]">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isExpanded = activeSection === sec.id;
                return (
                  <div
                    key={sec.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'bg-[#121212] border-[#CCFF00]/50 shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                        : 'bg-[#0e0e0e] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      onMouseEnter={playHoverSound}
                      className="w-full p-3.5 flex items-start justify-between text-left gap-2 cursor-pointer hover-glow-green"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isExpanded
                              ? 'bg-[#CCFF00] text-black shadow-[0_0_10px_rgba(204,255,0,0.4)]'
                              : 'bg-white/5 text-gray-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white">
                              {sec.title}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-1.5 py-0.5 rounded border border-[#CCFF00]/30">
                              {sec.badge}
                            </span>
                          </div>
                          <p className="text-[11px] font-sans text-gray-400 mt-1 leading-snug">
                            {sec.summary}
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 mt-1 ${
                          isExpanded ? 'rotate-180 text-[#CCFF00]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-3.5 pt-1 text-[11px] font-mono text-gray-300 leading-relaxed border-t border-white/5 bg-black/40 whitespace-pre-line"
                        >
                          {sec.content}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 bg-black flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  triggerHaptic('light');
                  onClose();
                }}
                onMouseEnter={playHoverSound}
                className="py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 text-xs font-mono transition-colors cursor-pointer hover-glow-green"
              >
                Закрыть
              </button>

              {onAcceptAndClose ? (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    triggerHaptic('success');
                    onAcceptAndClose();
                  }}
                  onMouseEnter={playHoverSound}
                  className="py-2.5 px-5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.35)] cursor-pointer hover-glow-green"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Продолжить</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              ) : (
                <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Редакция от 2026 года</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
