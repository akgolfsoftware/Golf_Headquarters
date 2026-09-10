-- Herding av eksisterende funksjoner. Ingen rader leses, endres eller slettes.
-- Kjent klient training_dashboard bruker service_role; den tilgangen bevares.
-- Kjør atomisk etter kontroll av funksjonsinventaret. Migrasjonstjenesten eier transaksjonen.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

REVOKE EXECUTE ON FUNCTION public.helse_flytt_okt(p_mal_id text, p_fra date, p_til date, p_begrunnelse text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_flytt_okt(p_mal_id text, p_fra date, p_til date, p_begrunnelse text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_hent_doegn() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_hent_doegn() TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_hent_faktisk_historikk(p_mal_id text, p_maks integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_hent_faktisk_historikk(p_mal_id text, p_maks integer) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_hent_matlogg_dag(p_dato date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_hent_matlogg_dag(p_dato date) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_hent_matlogg_periode(p_fra date, p_til date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_hent_matlogg_periode(p_fra date, p_til date) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_hent_okt_logg(p_fra date, p_til date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_hent_okt_logg(p_fra date, p_til date) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_lagre_faktisk_sett(p_dato date, p_mal_id text, p_ovelser jsonb, p_notat text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_lagre_faktisk_sett(p_dato date, p_mal_id text, p_ovelser jsonb, p_notat text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_lagre_matlogg(p_raa_tekst text, p_maaltid text, p_varer jsonb, p_kcal numeric, p_protein_g numeric, p_karbo_g numeric, p_fett_g numeric, p_vaeske_ml numeric, p_koffein_mg numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_lagre_matlogg(p_raa_tekst text, p_maaltid text, p_varer jsonb, p_kcal numeric, p_protein_g numeric, p_karbo_g numeric, p_fett_g numeric, p_vaeske_ml numeric, p_koffein_mg numeric) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_mat_dag(p_dato date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_mat_dag(p_dato date) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_mat_lagre(p_raa_tekst text, p_varer jsonb, p_kcal numeric, p_protein numeric, p_karbo numeric, p_fett numeric, p_vaeske numeric, p_koffein numeric, p_maaltid text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_mat_lagre(p_raa_tekst text, p_varer jsonb, p_kcal numeric, p_protein numeric, p_karbo numeric, p_fett numeric, p_vaeske numeric, p_koffein numeric, p_maaltid text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_mat_liste(p_fra date, p_til date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_mat_liste(p_fra date, p_til date) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_mat_sok(p_tekst text, p_antall integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_mat_sok(p_tekst text, p_antall integer) TO service_role;
REVOKE EXECUTE ON FUNCTION public.helse_sok_matvare(soek text, maks integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.helse_sok_matvare(soek text, maks integer) TO service_role;

-- Bind coach-argumentet til innlogget identitet. RLS-policyene kan fortsatt kalle funksjonen.
CREATE OR REPLACE FUNCTION public."workbench_coach_has_player_access"(
  p_coach_id text,
  p_player_id text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_coach_id
      AND u."authId" = auth.uid()::text
      AND u.role IN ('COACH', 'ADMIN')
      AND u."deletedAt" IS NULL
  ) AND (EXISTS (
    SELECT 1
    FROM public."player_enrollments" pe
    WHERE pe."userId" = p_player_id
      AND pe."endedAt" IS NULL
      AND pe."program" != 'PLATFORM_ONLY'
      AND pe."coachId" = p_coach_id
  )
  OR EXISTS (
    SELECT 1
    FROM public."group_members" gm
    JOIN public."groups" g ON g."id" = gm."groupId"
    WHERE gm."userId" = p_player_id
      AND gm."role" = 'PLAYER'
      AND gm."endedAt" IS NULL
      AND g."coachId" = p_coach_id
  )
  OR EXISTS (
    SELECT 1
    FROM public."group_members" gm
    JOIN public."group_members" gm2 ON gm2."groupId" = gm."groupId"
    WHERE gm."userId" = p_player_id
      AND gm."role" = 'PLAYER'
      AND gm."endedAt" IS NULL
      AND gm2."userId" = p_coach_id
      AND gm2."role" IN ('COACH', 'ASSISTANT')
      AND gm2."endedAt" IS NULL
  ));
$$;
REVOKE EXECUTE ON FUNCTION public.workbench_coach_has_player_access(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.workbench_coach_has_player_access(text, text) TO authenticated, service_role;
