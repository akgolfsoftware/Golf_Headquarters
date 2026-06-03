-- supabase-meg/migrations/0001_init.sql
-- Meg-assistenten — fundament. Kjøres i Meg-Supabase (separat fra golf-DB).
-- NB: Kjøres IKKE via Prisma. Lim inn i Meg-Supabase SQL Editor og kjør der.

create extension if not exists "pgcrypto";

-- All logget innhold: én rad per ting Anders logger
create table public.me_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in
              ('sleep','training','mood','nutrition','finance','goal','task','note','person')),
  text        text not null,
  value_num   double precision,
  value_unit  text,
  tags        text[] not null default '{}',
  source      text not null default 'telegram_text' check (source in
              ('telegram_text','telegram_voice','telegram_photo','web','system')),
  raw_ref     text,
  meta_json   jsonb
);
create index me_log_created_at_idx on public.me_log (created_at desc);
create index me_log_kind_idx on public.me_log (kind);

-- Full chat-historikk (komplett minne)
create table public.me_conversation (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  tokens          integer,
  related_log_id  uuid references public.me_log(id) on delete set null
);
create index me_conversation_created_at_idx on public.me_conversation (created_at desc);

-- RLS: deny-all. Kun service-role (server-side) når dataene.
alter table public.me_log enable row level security;
alter table public.me_conversation enable row level security;
-- Ingen policies = ingen tilgang for anon/authenticated. Service-role bypasser RLS.
