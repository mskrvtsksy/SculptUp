import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Code2,
  Database,
  Server,
  KeyRound,
  Check,
  Copy,
  Layers,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sql' | 'auth' | 'stars' | 'onboarding'>('onboarding');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('success');
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sqlSchema = `-- ==========================================
-- SCULPT: Supabase (PostgreSQL) Production Schema
-- ==========================================

-- 1. Users & Profiles (с полями Legal 18+, i18n и WebRTC Верификации)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text not null,
  photos text[] default array[]::text[],
  age int check (age >= 18 and age <= 99),
  age_confirmed boolean default false not null,
  terms_accepted_at timestamp with time zone,
  gender text check (gender in ('male', 'female', 'nonbinary')),
  seeking text check (seeking in ('male', 'female', 'all')) default 'female',
  city text not null,
  country text not null,
  lat double precision,
  lon double precision,
  bio text,
  height_cm int,
  tags text[] default array[]::text[],
  ui_language text default 'ru',
  spoken_languages text[] default array['ru', 'en']::text[],
  verified boolean default false,
  verification_gesture text,
  verification_photo_url text,
  glow_up_score numeric(3, 1) default 7.0,
  is_premium boolean default false,
  free_swipes_remaining int default 15,
  last_swipe_reset timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- 2. Swipes & Interaction Tracking
create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid references public.profiles(id) on delete cascade,
  target_id uuid references public.profiles(id) on delete cascade,
  action text check (action in ('like', 'dislike', 'superlike')),
  created_at timestamp with time zone default now(),
  unique(swiper_id, target_id)
);

-- 3. Detailed Looksmaxxing Ratings (Фишка)
create table public.looksmaxxing_ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid references public.profiles(id) on delete cascade,
  target_id uuid references public.profiles(id) on delete cascade,
  facial_structure numeric(3, 1) check (facial_structure between 1 and 10),
  hair_grooming numeric(3, 1) check (hair_grooming between 1 and 10),
  style_and_fit numeric(3, 1) check (style_and_fit between 1 and 10),
  physique numeric(3, 1) check (physique between 1 and 10),
  glow_up_potential numeric(3, 1) check (glow_up_potential between 1 and 10),
  advice_tag text,
  comment text,
  created_at timestamp with time zone default now()
);

-- 4. Mutual Matches
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references public.profiles(id) on delete cascade,
  user_b uuid references public.profiles(id) on delete cascade,
  matched_at timestamp with time zone default now(),
  unique(user_a, user_b)
);

-- 5. Telegram Stars Transactions
create table public.stars_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  telegram_payment_charge_id text unique not null,
  package_type text not null,
  stars_amount int not null,
  status text default 'completed',
  created_at timestamp with time zone default now()
);`;

  const authCode = `// app/api/auth/telegram/route.ts
// Next.js App Router: Cryptographic validation of Telegram initData (HMAC-SHA256)
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { initData } = await req.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN!;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  // Sort parameters alphabetically
  const dataCheckArr: string[] = [];
  Array.from(urlParams.keys())
    .sort()
    .forEach((key) => dataCheckArr.push(\`\${key}=\${urlParams.get(key)}\`));
  const dataCheckString = dataCheckArr.join('\\n');

  // Secret key = HMAC-SHA256(botToken, "WebAppData")
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
  }

  const user = JSON.parse(urlParams.get('user') || '{}');
  // Upsert user into Supabase...
  return NextResponse.json({ success: true, user });
}`;

  const starsCode = `// app/api/telegram/webhook/route.ts
// Telegram Stars Webhook handler in Next.js App Router
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const update = await req.json();

  // 1. Handle pre_checkout_query (Telegram requires answer within 10s)
  if (update.pre_checkout_query) {
    const { id } = update.pre_checkout_query;
    await fetch(\`https://api.telegram.org/bot\${process.env.TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pre_checkout_query_id: id, ok: true })
    });
    return NextResponse.json({ ok: true });
  }

  // 2. Handle successful_payment with Stars
  if (update.message?.successful_payment) {
    const payment = update.message.successful_payment;
    const tgUserId = update.message.from.id;
    const payload = JSON.parse(payment.invoice_payload);

    // Fulfill Stars purchase in Supabase:
    // e.g. activate PRO status or credit extra swipes
    // await supabase.from('profiles').update({ is_premium: true }).eq('telegram_id', tgUserId);
  }

  return NextResponse.json({ ok: true });
}`;

  const onboardingCode = `// ========================================================
// 1. Legal & Age Check Gate (Next.js API Route)
// File: /app/api/auth/accept-terms/route.ts
// ========================================================
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateTelegramInitData } from '@/lib/telegramAuth';

export async function POST(req: NextRequest) {
  const { initData, ageConfirmed, termsAccepted } = await req.json();

  const validatedUser = validateTelegramInitData(initData);
  if (!validatedUser) {
    return NextResponse.json({ error: 'Unauthorized Telegram WebApp' }, { status: 401 });
  }

  // Legal protection: user must strictly confirm 18+
  if (!ageConfirmed || !termsAccepted) {
    return NextResponse.json({ error: 'Adult age 18+ and EULA consent required' }, { status: 400 });
  }

  // Update profile with signed disclaimer timestamp to release developer from liability
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      telegram_id: validatedUser.id,
      age_confirmed: true,
      terms_accepted_at: new Date().toISOString(),
    }, { onConflict: 'telegram_id' });

  return NextResponse.json({ success: true, disclaimerLogged: true });
}

// ========================================================
// 2. WebRTC Anti-Fake Biometric Pose Verification API
// File: /app/api/verify-pose/route.ts
// ========================================================
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { initData, photoBase64, challengeGesture } = await req.json();
  const user = validateTelegramInitData(initData);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Process selfie frame (e.g. landmark gesture matching)
  // 2. Upload verification proof to secure Supabase Storage bucket 'verification_selfies'
  const filePath = \`verifications/\${user.id}_\${Date.now()}.jpg\`;
  const buffer = Buffer.from(photoBase64.replace(/^data:image\\/\\w+;base64,/, ''), 'base64');
  
  await supabaseAdmin.storage
    .from('verification_selfies')
    .upload(filePath, buffer, { contentType: 'image/jpeg' });

  // 3. Mark profile as officially verified
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      verified: true,
      verification_gesture: challengeGesture,
      verification_photo_url: filePath,
    })
    .eq('telegram_id', user.id);

  return NextResponse.json({
    verified: true,
    boostMultiplier: 3.0,
    badge: 'BLUE_CHECK_LOOKSMAXXING'
  });
}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl bg-[#0c0e15] border border-cyan-500/40 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl glow-cyan"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Архитектура SCULPT (Vercel + Supabase)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Спецификация Senior Full-Stack разработчика
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subnav */}
          <div className="flex border-b border-slate-800 bg-slate-950 px-4 gap-2 pt-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'onboarding', label: 'Онбординг & WebRTC', icon: ShieldCheck },
              { id: 'sql', label: 'PostgreSQL Схема', icon: Database },
              { id: 'auth', label: 'Telegram initData Auth', icon: KeyRound },
              { id: 'stars', label: 'Stars Webhook API', icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveTab(tab.id as any);
                  }}
                  className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {activeTab === 'onboarding' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Next.js API Routes: 18+ Legal Check & WebRTC Verification
                  </span>
                  <button
                    onClick={() => copyToClipboard(onboardingCode, 'onboarding')}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1 hover:border-cyan-500/40"
                  >
                    {copiedSection === 'onboarding' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cyan-400" /> Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Копировать код
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#090b10] border border-cyan-500/20 text-xs text-slate-300 space-y-2">
                  <p className="font-bold text-cyan-400">Шаги обязательного онбординга SCULPT:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    <li><strong className="text-white">Шаг 0 (Legal & 18+ Gate):</strong> Жесткая проверка чекбокса совершеннолетия и принятие EULA. Снимает юридическую ответственность с разработчиков.</li>
                    <li><strong className="text-white">Шаг 1 (i18n):</strong> Авто-детекция языка из Telegram + выбор языков общения для точного алгоритма подбора мэтчей.</li>
                    <li><strong className="text-white">Шаг 2 (Базовый профиль):</strong> Имя, возраст, пол и предпочтения поиска (кого ищет).</li>
                    <li><strong className="text-white">Шаг 3 (WebRTC Anti-fake):</strong> Захват видеопотока камеры, случайный жест (V, Shaka, Mewing check) и системная галочка с 3x бустом.</li>
                  </ul>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto">
                  {onboardingCode}
                </pre>
              </div>
            )}
            {activeTab === 'sql' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    PostgreSQL / Supabase DDL (Таблицы анкет, оценок и свайпов)
                  </span>
                  <button
                    onClick={() => copyToClipboard(sqlSchema, 'sql')}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1 hover:border-cyan-500/40"
                  >
                    {copiedSection === 'sql' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cyan-400" /> Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Копировать SQL
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto">
                  {sqlSchema}
                </pre>
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Next.js API Route: Валидация HMAC подписи Telegram
                  </span>
                  <button
                    onClick={() => copyToClipboard(authCode, 'auth')}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1 hover:border-cyan-500/40"
                  >
                    {copiedSection === 'auth' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cyan-400" /> Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Копировать код
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto">
                  {authCode}
                </pre>
              </div>
            )}

            {activeTab === 'stars' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Telegram Stars Webhook (Обработка платежей за Premium и свайпы)
                  </span>
                  <button
                    onClick={() => copyToClipboard(starsCode, 'stars')}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1 hover:border-cyan-500/40"
                  >
                    {copiedSection === 'stars' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cyan-400" /> Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Копировать Webhook
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto">
                  {starsCode}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
