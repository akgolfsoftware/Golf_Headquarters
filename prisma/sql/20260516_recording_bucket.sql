-- Voice-memo-opptak: Supabase Storage bucket + RLS-policies.
--
-- MÅ KJØRES MANUELT av Anders i Supabase Dashboard → SQL Editor.
-- Prisma håndterer ikke Storage-bucket-DDL — derfor egen SQL-fil.
--
-- Forutsetninger:
--   - `coaching-recordings` bucket: privat (public=false).
--   - Path-konvensjon: {uploadedById}/{recordingId}/chunk-{idx}.webm
--                      {uploadedById}/{recordingId}/final.webm
--   - storage.foldername(name)[1] == uploadedById (User.id, cuid)
--     MERK: dette må matche auth.uid()::text. Fordi vi bruker Prisma User.id
--     (cuid) som folder-prefiks må vi koble via users."authId" → users.id.

-- 1) Opprett bucket hvis ikke finnes
insert into storage.buckets (id, name, public)
values ('coaching-recordings', 'coaching-recordings', false)
on conflict (id) do nothing;

-- 2) RLS-policy: coach (User med matchende authId) har full access
--    på objekter i sin egen folder.
-- MERK: Prisma bruker camelCase-kolonnenavn → må wrappes i doble anførselstegn
-- i SQL fordi PostgreSQL ellers normaliserer til lowercase.
drop policy if exists "coach_full_access_recordings" on storage.objects;
create policy "coach_full_access_recordings"
on storage.objects for all
using (
  bucket_id = 'coaching-recordings'
  and exists (
    select 1
    from public.users u
    where u."authId" = auth.uid()::text
      and u.id = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'coaching-recordings'
  and exists (
    select 1
    from public.users u
    where u."authId" = auth.uid()::text
      and u.id = (storage.foldername(name))[1]
  )
);

-- 3) RLS-policy: ADMIN-rolle har full access til alle opptak
drop policy if exists "admin_full_access_recordings" on storage.objects;
create policy "admin_full_access_recordings"
on storage.objects for all
using (
  bucket_id = 'coaching-recordings'
  and exists (
    select 1 from public.users u
    where u."authId" = auth.uid()::text
      and u.role = 'ADMIN'
  )
)
with check (
  bucket_id = 'coaching-recordings'
  and exists (
    select 1 from public.users u
    where u."authId" = auth.uid()::text
      and u.role = 'ADMIN'
  )
);
