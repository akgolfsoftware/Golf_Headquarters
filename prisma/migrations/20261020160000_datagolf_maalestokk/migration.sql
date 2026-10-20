-- DataGolf-målestokken til teamnorwayref.vercel.app (Anders 20.10.2026). Siden er åpen og statisk;
-- tallene hentes først etter innlogging, med Supabase-klienten (rpc «datagolf_maalestokk»), og bakes
-- aldri inn i siden. DataGolf-lisensen er personlig (ak-golf-pipelines data/common/source_registry.yaml):
-- bare Anders får svar (beslutninger.md §DATA GOLF ER ANDERS' PRIVATE VERKTØY).
--
-- Den ENE regelen for hvem som får tallene er datagolf_maalestokk_tilgang(). Med kommersiell lisens
-- byttes WHERE-linja der, for eksempel til å bruke wagr_reference_plans_editor() (trenerne).
--
-- Kjøres IKKE via prisma migrate (gotchas §Schema-endringer). Denne fila er en RECORD. Kjøring:
--   npx tsx scripts/add-datagolf-maalestokk-2026-10-20.ts
-- Rent additivt og idempotent: to funksjoner, ingen tabeller eller rader endres.

-- Hvem får DataGolf-tall: i dag bare Anders sin HQ-konto (eneste ADMIN, akgolfgroup@gmail.com).
CREATE OR REPLACE FUNCTION "datagolf_maalestokk_tilgang"() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM "users" u
     WHERE u."authId" = auth.uid()::text
       AND u."deletedAt" IS NULL
       AND u."id" = 'cmacgoers0000andersadmin01'
  )
$$;
REVOKE ALL ON FUNCTION "datagolf_maalestokk_tilgang"() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION "datagolf_maalestokk_tilgang"() TO authenticated;

-- Målestokken: topp 50 i verden og alle norske, innspill etter avstand og (når pipelines har
-- regnet det) nivået per tour. NULL når den som spør ikke har tilgang; anon har ikke EXECUTE (42501).
CREATE OR REPLACE FUNCTION "datagolf_maalestokk"() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_as_of date;
  v_rangert text;
  v_resultat jsonb;
  v_veien jsonb := NULL;
BEGIN
  IF NOT "datagolf_maalestokk_tilgang"() THEN
    RETURN NULL;
  END IF;

  SELECT max(as_of) INTO v_as_of FROM dashboard.dg_skill_ratings;
  IF v_as_of IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT CASE WHEN count(dg_rank) > 0 THEN 'dg_rank' ELSE 'sg_total' END INTO v_rangert
    FROM dashboard.dg_skill_ratings WHERE as_of = v_as_of;

  WITH k AS (
    SELECT k.*, p.name, p.country_iso3,
           CASE WHEN v_rangert = 'dg_rank' THEN k.dg_rank::int
                ELSE (row_number() OVER (ORDER BY k.sg_total DESC NULLS LAST, k.dg_id))::int END AS plass
      FROM dashboard.dg_skill_ratings k JOIN dashboard.dg_players p ON p.dg_id = k.dg_id
     WHERE k.as_of = v_as_of
  ),
  topp AS (
    SELECT * FROM k WHERE plass IS NOT NULL ORDER BY plass, dg_id LIMIT 50
  ),
  utvalg AS (
    SELECT k.*, CASE WHEN k.dg_id IN (SELECT dg_id FROM topp) THEN 'topp' ELSE 'norsk' END AS gruppe
      FROM k
     WHERE k.dg_id IN (SELECT dg_id FROM topp) OR k.country_iso3 = 'NOR'
  ),
  spillere AS (
    SELECT jsonb_agg(jsonb_build_object(
             'id', u.dg_id::text,
             'navn', CASE WHEN position(', ' IN u.name) > 0
                          THEN split_part(u.name, ', ', 2) || ' ' || split_part(u.name, ', ', 1)
                          ELSE u.name END,
             'land', u.country_iso3,
             'plass', u.plass,
             'gruppe', u.gruppe,
             'sg_total', round(u.sg_total, 3), 'sg_ott', round(u.sg_ott, 3), 'sg_app', round(u.sg_app, 3),
             'sg_arg', round(u.sg_arg, 3), 'sg_putt', round(u.sg_putt, 3),
             'driving_dist_y', round(u.driving_dist_y, 3), 'driving_acc_pct', round(u.driving_acc_pct, 3))
           ORDER BY u.gruppe = 'norsk', u.plass NULLS LAST, u.sg_total DESC NULLS LAST) AS j
      FROM utvalg u
  ),
  innspill AS (
    SELECT jsonb_object_agg(a.dg_id::text, jsonb_build_array(
             round(a.skill_50_75, 3), round(a.skill_100_125, 3), round(a.skill_150_175, 3), round(a.skill_200_plus, 3))) AS j
      FROM (
        SELECT DISTINCT ON (s.dg_id) s.*
          FROM dashboard.dg_approach_skill s
         WHERE s.as_of = (SELECT max(as_of) FROM dashboard.dg_approach_skill)
           AND s.dg_id IN (SELECT dg_id FROM utvalg)
         ORDER BY s.dg_id, (s.tour_code = 'pga') DESC
      ) a
     WHERE num_nonnulls(a.skill_50_75, a.skill_100_125, a.skill_150_175, a.skill_200_plus) > 0
  ),
  uten AS (
    SELECT jsonb_agg(jsonb_build_object('navn', x.navn, 'runder', x.runder, 'tourer', x.tourer)
                     ORDER BY x.runder DESC, x.navn) AS j
      FROM (
        SELECT CASE WHEN position(', ' IN p.name) > 0
                    THEN split_part(p.name, ', ', 2) || ' ' || split_part(p.name, ', ', 1)
                    ELSE p.name END AS navn,
               (SELECT count(*)::int FROM dashboard.dg_rounds r
                 WHERE r.dg_id = p.dg_id AND split_part(r.event_id, ':', 2) IN ('2025', '2026')) AS runder,
               COALESCE((SELECT jsonb_agg(t.navn ORDER BY t.navn) FROM (
                  SELECT DISTINCT COALESCE(dt.display_name, split_part(r.event_id, ':', 1)) AS navn
                    FROM dashboard.dg_rounds r
                    LEFT JOIN dashboard.dg_tours dt ON dt.tour_code = split_part(r.event_id, ':', 1)
                   WHERE r.dg_id = p.dg_id AND split_part(r.event_id, ':', 2) IN ('2025', '2026')) t),
                 '[]'::jsonb) AS tourer
          FROM dashboard.dg_players p
         WHERE p.country_iso3 = 'NOR'
           AND NOT EXISTS (SELECT 1 FROM k WHERE k.dg_id = p.dg_id)
      ) x
  )
  SELECT jsonb_build_object(
           'asOf', to_char(v_as_of, 'YYYY-MM-DD'),
           'rangertAv', v_rangert,
           'spillere', COALESCE((SELECT j FROM spillere), '[]'::jsonb),
           'uten', COALESCE((SELECT j FROM uten), '[]'::jsonb),
           'innspill', COALESCE((SELECT j FROM innspill), '{}'::jsonb))
    INTO v_resultat;

  -- Nivået per tour lages av en annen jobb (pipelines); finnes ikke tabellen ennå, er veien null.
  IF to_regclass('dashboard.dg_tour_nivaa') IS NOT NULL THEN
    EXECUTE $q$
      SELECT jsonb_agg(jsonb_build_object(
               'tour', COALESCE(dt.display_name, n.tour_code), 'tour_code', n.tour_code,
               'sg_nivaa', round(n.sg_nivaa::numeric, 3), 'n', n.n_spillere)
             ORDER BY n.sg_nivaa)
        FROM dashboard.dg_tour_nivaa n
        LEFT JOIN dashboard.dg_tours dt ON dt.tour_code = n.tour_code
       WHERE n.season = (SELECT max(season) FROM dashboard.dg_tour_nivaa)
    $q$ INTO v_veien;
  END IF;

  RETURN v_resultat || jsonb_build_object('veien', v_veien);
END $$;
REVOKE ALL ON FUNCTION "datagolf_maalestokk"() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION "datagolf_maalestokk"() TO authenticated;
