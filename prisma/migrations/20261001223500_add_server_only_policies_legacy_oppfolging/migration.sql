-- Disse tabellene er bare tilgjengelige via appens servertilkobling.
-- Den restriktive policyen gjør sperren eksplisitt og fortsetter å gjelde
-- dersom en klientrolle senere får tabellrettigheter ved en feil.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'fireukerssjekker',
    'trener_forslag',
    'elev_samtaler'
  ]
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON public.%I',
        table_name || '_server_only',
        table_name
      );
      EXECUTE format(
        'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
        table_name || '_server_only',
        table_name
      );
    END IF;
  END LOOP;
END
$$;
