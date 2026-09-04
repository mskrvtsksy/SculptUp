import React, { useState } from 'react';
import {
  Sparkles,
  Scan,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Camera,
  Shield,
  Star,
  Check,
  Award,
  Layers,
  Info,
  Maximize2,
  Lightbulb,
} from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';
import { SupportedLanguage } from '../types';
import { t } from '../lib/i18n';

interface AuditViewProps {
  userPhoto?: string;
  onOpenShop: () => void;
  lang?: SupportedLanguage;
  isVerified?: boolean;
  isAvailable?: boolean;
}

type AuditTab = 'result' | 'recommendations' | 'details';
type PresentationAudit = { summary: string; strengths: string[]; improvements: string[]; photoQuality: number };

export const AuditView: React.FC<AuditViewProps> = ({
  userPhoto,
  onOpenShop,
  lang = 'ru',
  isVerified = false,
  isAvailable = false,
}) => {
  const [activeTab, setActiveTab] = useState<AuditTab>('result');
  const [photo, setPhoto] = useState<string>(userPhoto || '');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<PresentationAudit | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Profile Score: 40% Photo, 20% Bio, 20% Verification, 20% Completeness
  const [photoScore, setPhotoScore] = useState<number>(36); // out of 40
  const bioScore = 18; // out of 20
  const verifyScore = isVerified ? 20 : 12; // out of 20
  const completenessScore = 18; // out of 20
  const totalProfileScore = photoScore + bioScore + verifyScore + completenessScore; // 84 or 92 out of 100

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1_000_000) {
      setAuditError('Выберите JPEG, PNG или WebP размером до 1 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhoto(event.target.result);
        setAuditResult(null);
        setAuditError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const runScan = async () => {
    const initData = window.Telegram?.WebApp?.initData;
    if (!photo || !initData) return;
    triggerHaptic('heavy');
    setIsScanning(true);
    setAuditError(null);
    try {
      const response = await fetch('/api/audit/photo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, imageDataUrl: photo, consent: true }),
      });
      const body = await response.json() as { audit?: PresentationAudit; error?: string };
      if (!response.ok || !body.audit) throw new Error(body.error || 'AUDIT_FAILED');
      setAuditResult(body.audit);
      setPhotoScore(Math.round(body.audit.photoQuality * 0.4));
      triggerHaptic('success');
    } catch (error) {
      setAuditError(error instanceof Error && error.message === 'AUDIT_NOT_CONFIGURED'
        ? 'Проверка временно недоступна.'
        : 'Не удалось обработать фото. Попробуйте позже.');
    } finally {
      setIsScanning(false);
    }
  };

  const switchTab = (tab: AuditTab) => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  // Scores about someone's appearance must be based on an actual reviewed
  // service, not generated in the browser. Keep the feature honest until the
  // server-side review pipeline is connected.
  if (isAvailable) {
    return (
      <div className="w-full max-w-md mx-auto px-4 pt-1 pb-24 space-y-4 overflow-y-auto overscroll-contain">
        <div className="py-1 px-0.5"><span className="text-[11px] font-mono font-black text-[#CCFF00] tracking-widest uppercase block">SCULPT / PHOTO FEEDBACK</span><h1 className="text-2xl font-black text-white tracking-tight mt-0.5">Подача профиля</h1></div>
        <section className="rounded-3xl bg-[#0D0D0D] border border-white/10 p-5 space-y-4">
          {photo ? <img src={photo} alt="Выбранное фото для анализа" className="w-full aspect-[4/3] object-cover rounded-2xl border border-white/10" /> : <div className="aspect-[4/3] rounded-2xl bg-[#161616] flex items-center justify-center text-center text-sm text-gray-400 px-8">Выберите фото профиля для оценки качества подачи.</div>}
          <label className="min-h-11 w-full rounded-xl border border-white/15 text-white flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"><Camera className="w-4 h-4 text-[#CCFF00]" />Выбрать фото<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" /></label>
          <button type="button" disabled={!photo || isScanning} onClick={runScan} className="min-h-11 w-full rounded-xl bg-[#CCFF00] text-black font-mono font-black disabled:opacity-40">{isScanning ? 'Проверяем…' : 'Получить рекомендации'}</button>
          <p className="text-[11px] text-gray-500 leading-relaxed">Нажимая кнопку, вы соглашаетесь на разовую обработку выбранного фото для рекомендаций по свету, кадру и стилю. Это не проверка личности и не оценка привлекательности.</p>
          {auditError && <p className="text-sm text-rose-300" role="alert">{auditError}</p>}
        </section>
        {auditResult && <section className="rounded-3xl bg-[#0D0D0D] border border-white/10 p-5 space-y-4"><p className="text-sm text-gray-200">{auditResult.summary}</p><p className="text-xs font-mono text-[#CCFF00]">Качество подачи фото: {auditResult.photoQuality}/100</p><div><h2 className="text-xs font-mono font-black text-white mb-2">Сильные стороны</h2><ul className="space-y-1 text-sm text-gray-300">{auditResult.strengths.map((value) => <li key={value}>• {value}</li>)}</ul></div><div><h2 className="text-xs font-mono font-black text-white mb-2">Что улучшить</h2><ul className="space-y-1 text-sm text-gray-300">{auditResult.improvements.map((value) => <li key={value}>• {value}</li>)}</ul></div></section>}
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="w-full max-w-md mx-auto px-4 pt-1 pb-24 space-y-4 overflow-y-auto overscroll-contain">
        <div className="py-1 px-0.5">
          <span className="text-[11px] font-mono font-black text-[#CCFF00] tracking-widest uppercase block">SCULPT / PROFILE AUDIT</span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">{t(lang, 'auditTitle')}</h1>
        </div>
        <section className="rounded-3xl bg-[#0D0D0D] border border-white/10 p-6 text-center space-y-4" aria-live="polite">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#CCFF00]" />
          </div>
          <h2 className="font-mono font-black text-white">Проверка профиля готовится</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Мы не показываем выдуманные оценки. Этот раздел появится после подключения защищённой серверной проверки и явного согласия на обработку фото.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-1 pb-24 space-y-4 overflow-y-auto overscroll-contain">
      {/* Header */}
      <div className="py-1 px-0.5">
        <span className="text-[11px] font-mono font-black text-[#CCFF00] tracking-widest uppercase block">
          SCULPT / PROFILE AUDIT
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
          {t(lang, 'auditTitle')}
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          {t(lang, 'auditSubtitle')}
        </p>
      </div>

      {/* Photo Frame & Action Bar */}
      <div className="rounded-3xl bg-[#0D0D0D] border border-white/10 p-3.5 shadow-xl space-y-3">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-[#161616]">
          <img
            src={photo}
            alt="Profile Preview"
            className={`w-full h-full object-cover transition-all ${
              isScanning ? 'filter contrast-125 brightness-90 scale-105' : 'filter contrast-105'
            }`}
          />

          {/* Scanning Animation */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center">
              <div className="w-3/4 h-0.5 bg-[#CCFF00] shadow-[0_0_15px_#CCFF00] animate-pulse" />
              <div className="mt-3 px-3 py-1 rounded-full bg-black/80 border border-[#CCFF00]/60 text-[#CCFF00] text-xs font-mono font-bold flex items-center gap-2">
                <Scan className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'ru' ? 'Анализ кадра и света...' : 'Analyzing photo quality...'}</span>
              </div>
            </div>
          )}

          {/* Action Overlay */}
          {!isScanning && (
            <div className="absolute bottom-2 inset-x-2 flex gap-2">
              <label className="flex-1 py-1.5 px-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 hover:border-[#CCFF00] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>{lang === 'ru' ? 'Сменить фото' : 'Change photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={runScan}
                className="py-1.5 px-3.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-mono font-black uppercase flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'Анализ' : 'Analyze'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation: 3 Distinct Non-Cluttered Views */}
        <div className="grid grid-cols-3 gap-1 bg-[#161616] p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => switchTab('result')}
            className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all text-center ${
              activeTab === 'result'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t(lang, 'tabResult')}
          </button>
          <button
            type="button"
            onClick={() => switchTab('recommendations')}
            className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all text-center ${
              activeTab === 'recommendations'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t(lang, 'tabRecommendations')}
          </button>
          <button
            type="button"
            onClick={() => switchTab('details')}
            className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all text-center ${
              activeTab === 'details'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t(lang, 'tabDetails')}
          </button>
        </div>
      </div>

      {/* TAB 1: РЕЗУЛЬТАТ (Profile Score Breakdown) */}
      {activeTab === 'result' && (
        <div className="space-y-3">
          {/* Main Score Card */}
          <div className="rounded-3xl bg-[#0D0D0D] border border-white/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  {t(lang, 'profileScoreLabel')}
                </span>
                <div className="text-4xl font-mono font-black text-white flex items-baseline gap-2 mt-0.5">
                  <span>{totalProfileScore}</span>
                  <span className="text-base text-gray-500 font-normal">/ 100</span>
                  <span className="text-xs font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/15 px-2.5 py-0.5 rounded-md border border-[#CCFF00]/30 ml-2">
                    {t(lang, 'topPercentBadge')}
                  </span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Community Perception Probability */}
            <div className="p-3 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-gray-300 font-mono">
                {t(lang, 'communityScoreLabel')}
              </span>
              <span className="text-xs font-mono font-black text-[#CCFF00]">
                88%
              </span>
            </div>

            <div className="h-[1px] bg-white/5" />

            {/* Transparent 4-Pillar Breakdown */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                {lang === 'ru' ? 'Состав Profile Score' : 'Profile Score Breakdown'}
              </span>

              {/* Photo 40% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">{t(lang, 'metricPhoto')}</span>
                  <span className="text-[#CCFF00] font-bold">{photoScore}/40</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181818] overflow-hidden">
                  <div
                    className="h-full bg-[#CCFF00] rounded-full transition-all duration-700"
                    style={{ width: `${(photoScore / 40) * 100}%` }}
                  />
                </div>
              </div>

              {/* Bio 20% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">{t(lang, 'metricBio')}</span>
                  <span className="text-[#CCFF00] font-bold">{bioScore}/20</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181818] overflow-hidden">
                  <div
                    className="h-full bg-[#CCFF00] rounded-full transition-all duration-700"
                    style={{ width: `${(bioScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Verification 20% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">{t(lang, 'metricVerify')}</span>
                  <span className="text-[#CCFF00] font-bold">{verifyScore}/20</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181818] overflow-hidden">
                  <div
                    className="h-full bg-[#CCFF00] rounded-full transition-all duration-700"
                    style={{ width: `${(verifyScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Completeness 20% */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">{t(lang, 'metricCompleteness')}</span>
                  <span className="text-[#CCFF00] font-bold">{completenessScore}/20</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181818] overflow-hidden">
                  <div
                    className="h-full bg-[#CCFF00] rounded-full transition-all duration-700"
                    style={{ width: `${(completenessScore / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: РЕКОМЕНДАЦИИ (Practical, Actionable Advice) */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          <div className="rounded-3xl bg-[#0D0D0D] border border-white/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#CCFF00]" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                {t(lang, 'tabRecommendations')}
              </h3>
            </div>

            <div className="space-y-3">
              {/* Rec 1 */}
              <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-[#CCFF00] font-mono font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t(lang, 'recFramingTitle')}</span>
                </div>
                <p className="text-xs text-gray-300 pl-6 leading-relaxed">
                  {t(lang, 'recFramingDesc')}
                </p>
              </div>

              {/* Rec 2 */}
              <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{t(lang, 'recLightingTitle')}</span>
                </div>
                <p className="text-xs text-gray-300 pl-6 leading-relaxed">
                  {t(lang, 'recLightingDesc')}
                </p>
              </div>

              {/* Rec 3 */}
              <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-[#CCFF00] font-mono font-bold text-xs">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>{t(lang, 'recFullBodyTitle')}</span>
                </div>
                <p className="text-xs text-gray-300 pl-6 leading-relaxed">
                  {t(lang, 'recFullBodyDesc')}
                </p>
              </div>
            </div>

            {/* VIP Consultation Action */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenShop();
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-[#CCFF00] text-white hover:text-black font-mono font-black text-xs uppercase flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <Star className="w-4 h-4 text-[#CCFF00]" />
              <span>{t(lang, 'vipAuditBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ПОДРОБНОСТИ (Objective Technical Measurements) */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          <div className="rounded-3xl bg-[#0D0D0D] border border-white/10 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#CCFF00]" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                {t(lang, 'tabDetails')}
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { label: t(lang, 'detailsLighting'), value: '92%' },
                { label: t(lang, 'detailsSharpness'), value: '91%' },
                { label: t(lang, 'detailsFraming'), value: '88%' },
                { label: t(lang, 'detailsExpression'), value: '95%' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-mono">{item.label}</span>
                  <span className="text-xs font-mono font-black text-[#CCFF00]">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/5 text-[11px] text-gray-400 font-mono leading-relaxed">
              <Info className="w-4 h-4 text-gray-400 inline mr-1.5 -mt-0.5" />
              {lang === 'ru'
                ? 'Алгоритм оценивает объективные оптические свойства кадра: экспозицию, четкость краев, отсутствие шумов и процент площади лица в видоискателе.'
                : 'The algorithm evaluates objective optical metrics: exposure balance, edge contrast, noise level, and face-to-frame ratio.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
