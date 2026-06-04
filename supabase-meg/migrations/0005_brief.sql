-- supabase-meg/migrations/0005_brief.sql
-- Fase 6: proaktive briefer. Cron-jobber komponerer morgenbrief/kveldsjournal/
-- løftesjekk/crm-nudge, sender via Telegram OG lagrer her (vises i /meg-dashboard).
-- Kjøres i Meg-Supabase SQL Editor.

create table public.me_brief (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('morgenbrief','kveldsjournal','loftesjekk','crm_nudge')),
  content     text not null,
  sent        boolean not null default false
);
create index me_brief_kind_idx on public.me_brief (kind, created_at desc);
create index me_brief_created_idx on public.me_brief (created_at desc);

-- RLS: deny-all. Kun service-role (server-side) når dataene.
alter table public.me_brief enable row level security;
