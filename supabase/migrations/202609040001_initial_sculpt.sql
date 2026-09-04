-- SCULPT phase 1: account-owned data. Apply in Supabase SQL Editor or CLI.
-- All client access is denied; Vercel API routes validate Telegram initData first.
create table if not exists public.profiles (
  id uuid not null default gen_random_uuid() unique,
  telegram_id bigint primary key,
  display_name text not null check (char_length(display_name) between 1 and 60),
  age smallint not null check (age between 18 and 99),
  gender text not null check (gender in ('male', 'female', 'nonbinary')),
  interested_in text not null check (interested_in in ('male', 'female', 'all')),
  bio text not null default '' check (char_length(bio) <= 500),
  city text not null check (char_length(city) between 1 and 100),
  country text not null check (char_length(country) between 1 and 100),
  country_id text,
  city_id text,
  latitude double precision,
  longitude double precision,
  search_radius_km smallint not null default 50 check (search_radius_km between 5 and 150),
  ui_language text not null default 'ru' check (ui_language in ('ru', 'en', 'es', 'de', 'fr')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  storage_path text not null unique,
  position smallint not null check (position between 0 and 5),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  unique (telegram_id, position)
);

create table if not exists public.swipes (
  actor_telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  target_telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  decision text not null check (decision in ('like', 'pass')),
  created_at timestamptz not null default now(),
  primary key (actor_telegram_id, target_telegram_id),
  check (actor_telegram_id <> target_telegram_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_low bigint not null references public.profiles(telegram_id) on delete cascade,
  user_high bigint not null references public.profiles(telegram_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_low, user_high),
  check (user_low < user_high)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.blocks (
  actor_telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  target_telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (actor_telegram_id, target_telegram_id),
  check (actor_telegram_id <> target_telegram_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  target_telegram_id bigint not null references public.profiles(telegram_id) on delete cascade,
  reason text not null check (reason in ('fake', 'spam', 'harassment', 'underage', 'other')),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now(),
  check (reporter_telegram_id <> target_telegram_id)
);

alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

revoke all on public.profiles, public.profile_photos, public.swipes, public.matches, public.messages, public.blocks, public.reports from anon, authenticated;

create index if not exists profiles_discovery_idx on public.profiles (country_id, gender, age) where onboarding_completed_at is not null;
create index if not exists messages_match_created_idx on public.messages (match_id, created_at desc);

-- Hide Telegram IDs from discovery clients. Only Vercel's service-role route
-- calls this function after validating the caller's Telegram initData.
create or replace function public.discovery_profiles(p_actor bigint, p_limit integer default 25)
returns table (
  id uuid, display_name text, age smallint, gender text, bio text, city text,
  country text, latitude double precision, longitude double precision, verification_status text
)
language sql stable security definer set search_path = public, pg_temp as $$
  select p.id, p.display_name, p.age, p.gender, p.bio, p.city, p.country, p.latitude, p.longitude, p.verification_status
  from public.profiles p
  where p.telegram_id <> p_actor
    and p.onboarding_completed_at is not null
    and not exists (select 1 from public.swipes s where s.actor_telegram_id = p_actor and s.target_telegram_id = p.telegram_id)
    and not exists (select 1 from public.blocks b where (b.actor_telegram_id = p_actor and b.target_telegram_id = p.telegram_id) or (b.actor_telegram_id = p.telegram_id and b.target_telegram_id = p_actor))
  order by p.updated_at desc
  limit greatest(1, least(p_limit, 50));
$$;
revoke all on function public.discovery_profiles(bigint, integer) from public;
grant execute on function public.discovery_profiles(bigint, integer) to service_role;
