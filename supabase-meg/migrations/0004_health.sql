-- supabase-meg/migrations/0004_health.sql
-- Fase 3b: samlet helse-inntak. Apple Watch (søvn + alt annet) + Garmin (trening)
-- POSTer hit. source-tag hindrer dobbeltelling. Kjøres i Meg-Supabase SQL Editor.

create table public.me_health (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  metric_date date not null,
  metric      text not null,           -- f.eks. sleep_hours, resting_hr, hrv, steps, vo2max
  value_num   double precision not null,
  unit        text,
  source      text not null check (source in ('apple','garmin')),
  raw_json    jsonb,
  unique (metric_date, metric, source)
);
create index me_health_date_idx on public.me_health (metric_date desc);
create index me_health_metric_idx on public.me_health (metric, metric_date desc);

-- RLS: deny-all. Kun service-role (server-side) når dataene.
alter table public.me_health enable row level security;
