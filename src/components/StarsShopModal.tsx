import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Zap,
  Eye,
  Crown,
  Flame,
  Check,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { StarsPackage } from '../types';
import { triggerHaptic, openTelegramStarsCheckout } from '../lib/telegram';

interface StarsShopModalProps {
  isOpen: boolean;
  isPremium: boolean;
  onClose: () => void;
  onPurchaseSuccess: (packageType: 'premium' | 'who_liked' | 'swipes' | 'boost') => void;
}

const VIP_PACKAGE: StarsPackage = {
  id: 'pkg_premium',
  title: 'VIP Статус',
  badge: 'ХИТ',
  stars: 150,
  description:
    'Безлимит свайпов навсегда, открытие всех лайков и оценок, анонимный режим аудита и приоритет в ленте.',
  type: 'premium',
};

const EXTRA_PACKAGES: StarsPackage[] = [
  {
    id: 'pkg_swipes',
    title: '+25 Свайпов',
    stars: 35,
    description: 'Пакет дополнительных свайпов на сегодня без ожидания ночного таймера.',
    type: 'swipes',
  },
  {
    id: 'pkg_boost',
    title: 'Буст 30 минут',
    stars: 45,
    description: 'Показываем твою анкету в 3 раза чаще в топе выдачи твоего города.',
    type: 'boost',
  },
  {
    id: 'pkg_who_liked',
    title: 'Кто лайкнул',
    badge: 'РАЗОВО',
    stars: 50,
    description: 'Мгновенно рассеять блюр и увидеть всех, кто проявил интерес к анкете.',
    type: 'who_liked',
  },
];

export const StarsShopModal: React.FC<StarsShopModalProps> = ({
  isOpen,
  isPremium,
  onClose,
  onPurchaseSuccess,
}) => {
  const [selectedPkg, setSelectedPkg] = useState<StarsPackage>(VIP_PACKAGE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInvoiceConfirm, setShowInvoiceConfirm] = useState(false);

  if (!isOpen) return null;

  const handleStartPurchase = (pkg: StarsPackage) => {
    setSelectedPkg(pkg);
    triggerHaptic('heavy');
    setShowInvoiceConfirm(true);
  };

  const handleConfirmTelegramPayment = () => {
    setIsProcessing(true);
    triggerHaptic('medium');

    openTelegramStarsCheckout(selectedPkg.title, selectedPkg.stars, (success) => {
      setIsProcessing(false);
      setShowInvoiceConfirm(false);
      if (success) {
        triggerHaptic('success');
        onPurchaseSuccess(selectedPkg.type);
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 sm:rounded-[32px] rounded-t-[32px] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between bg-black shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/40 flex items-center justify-center shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                <Star className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                  Telegram Stars Shop
                </h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-mono">
                  Магазин привилегий
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

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
            {/* HERO VIP CARD */}
            <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[#16190a] to-[#0d0d0d] border-2 border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.2)] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-wider mb-2">
                    <Crown className="w-3 h-3" />
                    ГЛАВНАЯ ПОДПИСКА
                  </div>
                  <h4 className="text-xl font-black text-white flex items-center gap-2">
                    VIP Статус
                    {isPremium && (
                      <span className="text-xs font-mono font-bold text-[#CCFF00] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Активен
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Полный доступ ко всем возможностям SCULPT навсегда без ограничений.
                  </p>
                </div>

                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-black border border-[#CCFF00]/40 text-[#CCFF00] font-black text-base shadow-sm shrink-0">
                  <span>150</span>
                  <Star className="w-4 h-4 fill-[#CCFF00] text-[#CCFF00]" />
                </div>
              </div>

              {/* VIP Perks */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-200">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
                  <span>Безлимит свайпов</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
                  <span>Кто меня лайкнул</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
                  <span>Приоритет в топе</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
                  <span>Анонимный аудит</span>
                </div>
              </div>

              {/* VIP Button */}
              <button
                type="button"
                onClick={() => handleStartPurchase(VIP_PACKAGE)}
                disabled={isPremium}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  isPremium
                    ? 'bg-white/10 text-gray-400 cursor-not-allowed border border-white/10'
                    : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-lg shadow-[0_0_20px_rgba(204,255,0,0.35)] active:scale-98'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>{isPremium ? 'VIP уже активирован' : 'Купить VIP — 150 Stars'}</span>
              </button>
            </div>

            {/* SECONDARY: ДОПОЛНИТЕЛЬНО */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Дополнительно
                </span>
                <div className="h-[1px] bg-[#1a1a1a] flex-1" />
              </div>

              <div className="space-y-2.5">
                {EXTRA_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3.5 rounded-2xl border border-white/10 bg-[#111] hover:border-white/20 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00] shrink-0">
                        {pkg.type === 'swipes' && <Zap className="w-5 h-5 text-[#CCFF00]" />}
                        {pkg.type === 'boost' && <Flame className="w-5 h-5 text-[#CCFF00]" />}
                        {pkg.type === 'who_liked' && <Eye className="w-5 h-5 text-[#CCFF00]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{pkg.title}</span>
                          {pkg.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-gray-300 uppercase">
                              {pkg.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                          {pkg.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 ml-2 shrink-0">
                      <div className="text-xs font-mono font-bold text-[#CCFF00] flex items-center gap-0.5">
                        <span>{pkg.stars}</span>
                        <Star className="w-3.5 h-3.5 fill-[#CCFF00] text-[#CCFF00]" />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartPurchase(pkg)}
                        className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-[#CCFF00] text-white hover:text-black font-mono font-black text-xs transition-colors"
                      >
                        Взять
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Telegram Stars Official Protection Note */}
            <div className="p-3 rounded-xl bg-[#111] border border-[#222] flex items-center gap-2 text-gray-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00] shrink-0" />
              <span>
                Безопасная оплата через Telegram Stars API. Звезды списываются с баланса вашего Telegram аккаунта.
              </span>
            </div>
          </div>

          {/* Telegram Stars Invoice Simulation Modal */}
          {showInvoiceConfirm && (
            <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-2xl bg-[#0e0e0e] border border-white/10 p-5 text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/40 flex items-center justify-center">
                  <Star className="w-7 h-7 fill-[#CCFF00] text-[#CCFF00] animate-pulse" />
                </div>

                <div>
                  <h4 className="text-base font-black text-white">Инвойс Telegram Stars</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Подтверждение платежа за <span className="text-white font-bold">{selectedPkg.title}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#111] border border-[#222] text-center">
                  <div className="text-[11px] text-gray-500 uppercase tracking-wider font-mono">
                    Сумма к оплате
                  </div>
                  <div className="text-2xl font-black text-[#CCFF00] flex items-center justify-center gap-1.5 mt-0.5">
                    <span>{selectedPkg.stars} Stars</span>
                    <Star className="w-5 h-5 fill-[#CCFF00] text-[#CCFF00]" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowInvoiceConfirm(false)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl border border-[#333] bg-[#161616] text-gray-300 text-xs font-bold hover:bg-[#202020]"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleConfirmTelegramPayment}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs flex items-center justify-center gap-1 shadow-md"
                  >
                    {isProcessing ? (
                      <span>Проводка...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Подтвердить
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

