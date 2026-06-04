-- supabase-meg/migrations/0003_pending_action.sql
-- Fase 3: bekreftelsesflyt. Skrive-handlinger (send/opprett/lagre) utføres ALDRI
-- direkte — de lagres som ventende handling og venter på Telegram-"BEKREFT".
-- Kjøres i Meg-Supabase SQL Editor (IKKE via Prisma).

create table public.me_pending_action (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '1 hour'),
  tool_name   text not null,
  args        jsonb not null default '{}',
  summary     text not null,
  status      text not null default 'pending' check (status in ('pending','done','cancelled','expired'))
);
create index me_pending_action_status_idx on public.me_pending_action (status, created_at desc);

-- RLS: deny-all. Kun service-role (server-side) når dataene.
alter table public.me_pending_action enable row level security;
