-- Bevar eksisterende forretningslogikk og funksjonsrettigheter.
-- Manglende forventet nøkkel skal avvise kallet, også når SQL-uttrykket blir NULL.
-- Ingen hemmelige verdier materialiseres i migrasjonen.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
DO $hardening$
DECLARE
  signature text;
  definition text;
  old_guard constant text := 'nokkel <> (select verdi from me_secret';
  new_guard constant text := 'nokkel IS DISTINCT FROM (select verdi from me_secret';
BEGIN
  FOREACH signature IN ARRAY ARRAY['public.sak_inn(text,text,text)', 'public.sak_liste(text)', 'public.sak_ferdig(text,text)'] LOOP
    SELECT pg_get_functiondef(to_regprocedure(signature)) INTO definition;
    IF definition IS NULL THEN RAISE EXCEPTION 'Expected function missing: %', signature; END IF;
    IF strpos(definition, old_guard) > 0 THEN
      IF (length(definition) - length(replace(definition, old_guard, ''))) / length(old_guard) <> 1 THEN
        RAISE EXCEPTION 'Unexpected guard count: %', signature;
      END IF;
      EXECUTE replace(definition, old_guard, new_guard);
    ELSIF strpos(definition, new_guard) = 0 THEN
      RAISE EXCEPTION 'Expected key guard not found: %', signature;
    END IF;
    EXECUTE format('ALTER FUNCTION %s SET search_path = pg_catalog, public, pg_temp', signature);
  END LOOP;
END;
$hardening$;

ALTER FUNCTION dashboard.name_key(text) SET search_path = pg_catalog, pg_temp;
ALTER FUNCTION public.beregn_frist(timestamptz) SET search_path = pg_catalog, pg_temp;
-- Vector-operatoren ligger fortsatt i public. CREATE er avvist for anon/authenticated/service_role der.
ALTER FUNCTION public.match_me_memory(public.vector, integer) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION public.match_me_knowledge(public.vector, integer) SET search_path = pg_catalog, public, pg_temp;
