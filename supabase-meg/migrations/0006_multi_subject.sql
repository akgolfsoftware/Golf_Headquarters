-- supabase-meg/migrations/0006_multi_subject.sql
-- Fler-coach-fundament: hver rad knyttes til én person (subject = Telegram chat-id).
-- Sikrer at Markus (coach) aldri ser Anders' (admin) data, og omvendt.
-- Kjøres i Meg-Supabase SQL Editor (IKKE via Prisma).

alter table public.me_log            add column if not exists subject text;
alter table public.me_conversation   add column if not exists subject text;
alter table public.me_pending_action add column if not exists subject text;
alter table public.me_brief          add column if not exists subject text;

-- Backfill: alt eksisterende innhold tilhører Anders (admin).
update public.me_log            set subject = '8701859629' where subject is null;
update public.me_conversation   set subject = '8701859629' where subject is null;
update public.me_pending_action set subject = '8701859629' where subject is null;
update public.me_brief          set subject = '8701859629' where subject is null;

create index if not exists me_log_subject_idx
  on public.me_log (subject, created_at desc);
create index if not exists me_conversation_subject_idx
  on public.me_conversation (subject, created_at desc);
create index if not exists me_pending_action_subject_idx
  on public.me_pending_action (subject, status, created_at desc);
create index if not exists me_brief_subject_idx
  on public.me_brief (subject, created_at desc);
