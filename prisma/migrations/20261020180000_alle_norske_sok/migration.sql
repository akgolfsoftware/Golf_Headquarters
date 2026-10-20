-- «Alle norske» på teamnorwayref.vercel.app (Anders 20.10.2026): søk og spillerprofil for norske
-- spillere, åpent uten innlogging. Resultatene er offentlige (NGF, GolfBox-tourene, Olyo osv.).
--
-- LÅSEN: ak-golf-pipelines docs/legal-policy.md §3.2 krever foreldresamtykke før spillere under 16
-- vises offentlig. Anders bestemte at første runde bare tar spillere FØDT 2005 ELLER TIDLIGERE.
-- Spillere uten fødselsår tas ikke med. Regelen står ett sted, i "alle_norske_synlig", og begge
-- funksjonene filtrerer på den uansett hva som sendes inn (også ved direkte id-oppslag).
--
-- Resultatlisten ryddes etter samme regler som den åpne spillerprofilen i HQ
-- (src/lib/stats/profil-resultater.ts, ryddProfilResultater): DataGolf vises aldri, NGF-kopien av en
-- turnering slås inn i tourens egen kopi (tourens score vinner), og nettoklasser fjernes (bare brutto).
-- I tillegg holdes turneringer som er slått sammen med en annen (mergedIntoId) utenfor.
--
-- Kjøres IKKE via prisma migrate (gotchas §Schema-endringer). Denne fila er en RECORD. Kjøring:
--   npx tsx scripts/add-alle-norske-sok-2026-10-20.ts
-- Rent additivt og idempotent: fire funksjoner, ingen tabeller eller rader endres.

-- Den ENE regelen for hvem som kan vises. Når foreldresamtykke er på plass, endres den her.
CREATE OR REPLACE FUNCTION "alle_norske_synlig"(p_land text, p_fodt integer, p_aktiv boolean)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(p_land = 'NO' AND p_fodt BETWEEN 1900 AND 2005 AND p_aktiv, false)
$$;

-- Bare brutto. Speiler erNettoKlasse i HQ (og is_netto_class i ak-golf-pipelines):
-- «Herrer Netto», «G19N», «G15 (N)», «D-N», «H_N». «A-klassen» ender på n, men er brutto.
CREATE OR REPLACE FUNCTION "alle_norske_er_netto"(p_klasse text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(
    trim(p_klasse) ~* 'netto'
    OR trim(p_klasse) ~ '(-N|_N|\(N\)|\(n\))$'
    OR trim(p_klasse) ~ '[0-9][Nn]$',
  false)
$$;

-- Søkenøkkel: små bokstaver, å = aa, ø = oe, æ = ae, så «Risvåg» og «Risvaag» treffer hverandre.
CREATE OR REPLACE FUNCTION "alle_norske_nokkel"(p_tekst text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT replace(replace(replace(translate(lower(coalesce(p_tekst, '')), 'éèëäöüáà', 'eeeaouaa'),
    'å', 'aa'), 'ø', 'oe'), 'æ', 'ae')
$$;

-- Søk: navn (alle ordene må finnes, i hvilken som helst rekkefølge), klubb, fødselsår og tour
-- (kilden, f.eks. OLYO, SRIXON, NORGESCUP). Maks 50 treff, sortert på navn. Uten noe å søke på: tom liste.
CREATE OR REPLACE FUNCTION "alle_norske_sok"(
  p_navn text DEFAULT NULL, p_klubb text DEFAULT NULL, p_fodt integer DEFAULT NULL, p_tour text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp
-- Den generelle planen slår opp spillerens resultater via indeksen; en plan laget for de konkrete
-- verdiene leser hele resultattabellen og bruker over ett sekund (målt 20.10.2026).
SET plan_cache_mode = force_generic_plan AS $$
DECLARE
  v_ord text[];
  v_klubb text := nullif(trim(coalesce(p_klubb, '')), '');
  v_tour text := nullif(upper(trim(coalesce(p_tour, ''))), '');
  v_tour_spillere text[];
BEGIN
  SELECT coalesce(array_agg(o), '{}') INTO v_ord
    FROM unnest(regexp_split_to_array(trim("alle_norske_nokkel"(p_navn)), '[\s,]+')) o
   WHERE length(o) > 0;
  IF cardinality(v_ord) = 0 AND v_klubb IS NULL AND p_fodt IS NULL AND v_tour IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  -- Kan ikke brukes til å hente DataGolf-lista.
  IF v_tour = 'DATAGOLF' THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Tourens spillere hentes via turneringene (indeks på turnering), ikke spiller for spiller.
  IF v_tour IS NOT NULL THEN
    SELECT coalesce(array_agg(DISTINCT e."playerId"), '{}') INTO v_tour_spillere
      FROM "tournaments" t JOIN "public_player_entries" e ON e."tournamentId" = t."id"
     WHERE t."sourceOrigin" = v_tour AND t."mergedIntoId" IS NULL;
  END IF;

  -- Først de 50 første spillerne (etter navn) som har minst ett resultat som kan vises og passer
  -- filtrene, deretter tallene for bare dem. Klubb betyr at spilleren har spilt for klubben.
  RETURN coalesce((
    WITH gyldig AS NOT MATERIALIZED (
      SELECT e."playerId", e."clubName", t."sourceOrigin", t."startDate"
        FROM "public_player_entries" e
        JOIN "tournaments" t ON t."id" = e."tournamentId"
       WHERE t."mergedIntoId" IS NULL
         AND t."sourceOrigin" IS DISTINCT FROM 'DATAGOLF'
         AND NOT "alle_norske_er_netto"(e."klasseNavn")
    ),
    utvalg AS (
      SELECT p."id", p."name", p."birthYear"
        FROM "public_players" p
       WHERE "alle_norske_synlig"(p."country", p."birthYear", p."isActive")
         AND (p_fodt IS NULL OR p."birthYear" = p_fodt)
         AND (v_tour IS NULL OR p."id" = ANY(v_tour_spillere))
         AND NOT EXISTS (
           SELECT 1 FROM unnest(v_ord) o WHERE strpos("alle_norske_nokkel"(p."name"), o) = 0)
         AND EXISTS (
           SELECT 1 FROM gyldig g
            WHERE g."playerId" = p."id"
              AND (v_tour IS NULL OR g."sourceOrigin" = v_tour)
              AND (v_klubb IS NULL OR strpos("alle_norske_nokkel"(g."clubName"), "alle_norske_nokkel"(v_klubb)) > 0))
       ORDER BY p."name", p."id"
       LIMIT 50
    ),
    per AS (
      SELECT u."id", u."name", u."birthYear",
             (array_agg(g."clubName" ORDER BY g."startDate" DESC) FILTER (WHERE g."clubName" IS NOT NULL))[1] AS klubb,
             extract(year FROM min(g."startDate"))::int AS fra,
             extract(year FROM max(g."startDate"))::int AS til,
             array_agg(DISTINCT g."sourceOrigin") AS tourer
        FROM utvalg u JOIN gyldig g ON g."playerId" = u."id"
       GROUP BY 1, 2, 3
    )
    SELECT jsonb_agg(jsonb_build_object(
             'id', x."id", 'navn', x."name", 'fodt', x."birthYear", 'klubb', x.klubb,
             'fra', x.fra, 'til', x.til, 'tourer', to_jsonb(x.tourer))
           ORDER BY x."name", x."id")
      FROM per x
  ), '[]'::jsonb);
END
$$;

-- Én spillers profil: navn, fødselsår, klubb og alle resultater (ryddet, nyeste først).
-- NULL når spilleren ikke finnes eller ikke kan vises (låsen).
CREATE OR REPLACE FUNCTION "alle_norske_profil"(p_id text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_spiller record;
  v_rader jsonb;
  v_e record;
  v_ngf record;
  v_brukt text[] := '{}';
  v_total integer;
  v_plass jsonb;
BEGIN
  SELECT p."id", p."name", p."birthYear" INTO v_spiller
    FROM "public_players" p
   WHERE p."id" = p_id AND "alle_norske_synlig"(p."country", p."birthYear", p."isActive");
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(jsonb_agg(r ORDER BY r.start DESC, r.id), '[]'::jsonb) INTO v_rader FROM (
    SELECT e."id" AS id, t."sourceOrigin" AS kilde, to_char(t."startDate", 'YYYY-MM-DD') AS dato,
           t."startDate" AS start, e."status" AS status, e."position" AS plass, e."scoreToPar" AS "tilPar",
           e."totalScore" AS total, e."klasseNavn" AS klasse,
           -- Rundescorer i begge formatene: NGF [{n, score}] og GolfBox v2 {roundScores: [..]}.
           CASE jsonb_typeof(e."rounds")
             WHEN 'array' THEN (
               SELECT coalesce(jsonb_agg(x->'score' ORDER BY (x->>'n')::numeric), '[]'::jsonb)
                 FROM jsonb_array_elements(e."rounds") x
                WHERE jsonb_typeof(x->'n') = 'number' AND jsonb_typeof(x->'score') = 'number')
             WHEN 'object' THEN (
               SELECT coalesce(jsonb_agg(s ORDER BY i), '[]'::jsonb)
                 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(e."rounds"->'roundScores') = 'array'
                                                THEN e."rounds"->'roundScores' ELSE '[]'::jsonb END)
                      WITH ORDINALITY AS a(s, i)
                WHERE jsonb_typeof(s) = 'number')
             ELSE '[]'::jsonb
           END AS runder,
           e."clubName" AS klubb, e."feltN" AS felt, t."name" AS turnering, t."shortName" AS kort,
           t."tour" AS tour, t."location" AS sted
      FROM "public_player_entries" e
      JOIN "tournaments" t ON t."id" = e."tournamentId"
     WHERE e."playerId" = v_spiller."id"
       AND t."mergedIntoId" IS NULL
       AND t."sourceOrigin" IS DISTINCT FROM 'DATAGOLF'
  ) r;

  -- NGF-kopien av samme turnering (samme dag) slås inn i tourens kopi. Tourens score vinner;
  -- NGF sin plassering brukes bare når touren mangler den og totalene stemmer.
  FOR v_e IN
    SELECT (i - 1)::int AS i, x FROM jsonb_array_elements(v_rader) WITH ORDINALITY AS a(x, i)
     WHERE x->>'kilde' IS DISTINCT FROM 'NGF' ORDER BY i
  LOOP
    v_total := coalesce((v_e.x->>'total')::int,
      (SELECT sum(s::int) FROM jsonb_array_elements_text(v_e.x->'runder') s)::int);
    SELECT n.x AS x INTO v_ngf
      FROM jsonb_array_elements(v_rader) WITH ORDINALITY AS n(x, j)
     WHERE n.x->>'kilde' = 'NGF' AND n.x->>'dato' = v_e.x->>'dato' AND NOT (n.x->>'id' = ANY(v_brukt))
     ORDER BY ((n.x->>'total')::int IS NOT DISTINCT FROM v_total) DESC, n.j
     LIMIT 1;
    CONTINUE WHEN NOT FOUND;
    v_brukt := v_brukt || (v_ngf.x->>'id');
    v_plass := CASE WHEN jsonb_typeof(v_e.x->'plass') = 'number' THEN v_e.x->'plass'
                    WHEN v_total IS NULL OR v_total = (v_ngf.x->>'total')::int THEN v_ngf.x->'plass'
                    ELSE 'null'::jsonb END;
    v_rader := jsonb_set(v_rader, ARRAY[v_e.i::text], v_e.x || jsonb_build_object(
      'total', coalesce(to_jsonb(v_total), v_ngf.x->'total'),
      'plass', v_plass,
      'runder', CASE WHEN jsonb_array_length(v_e.x->'runder') > 0 THEN v_e.x->'runder' ELSE v_ngf.x->'runder' END));
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_spiller."id", 'navn', v_spiller."name", 'fodt', v_spiller."birthYear",
    'klubb', (SELECT x->>'klubb' FROM jsonb_array_elements(v_rader) WITH ORDINALITY AS a(x, i)
               WHERE x->>'klubb' IS NOT NULL AND NOT (x->>'id' = ANY(v_brukt)) ORDER BY i LIMIT 1),
    'resultater', (
      SELECT coalesce(jsonb_agg((x - 'start' - 'klubb') || jsonb_build_object('total', CASE WHEN jsonb_typeof(x->'total') = 'number' THEN x->'total'
               ELSE coalesce((SELECT to_jsonb(sum(s::int)::int) FROM jsonb_array_elements_text(x->'runder') s), 'null'::jsonb) END)
             ORDER BY i), '[]'::jsonb)
        FROM jsonb_array_elements(v_rader) WITH ORDINALITY AS a(x, i)
       WHERE NOT (x->>'id' = ANY(v_brukt)) AND NOT "alle_norske_er_netto"(x->>'klasse')));
END
$$;

-- Hjelpefunksjonene er rene regler uten data; søk og profil er det eneste anon kan kalle.
REVOKE ALL ON FUNCTION "alle_norske_synlig"(text, integer, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION "alle_norske_er_netto"(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION "alle_norske_nokkel"(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION "alle_norske_sok"(text, text, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION "alle_norske_profil"(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "alle_norske_sok"(text, text, integer, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION "alle_norske_profil"(text) TO anon, authenticated;
