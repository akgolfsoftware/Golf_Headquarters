-- Sikrer de tre oppfølgingstabellene som ble opprettet av en eldre,
-- uferdig funksjonsgren. Appen bruker servertilkoblingen via Prisma;
-- ingen av tabellene skal være direkte tilgjengelige gjennom Data API-et.
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
        'REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated',
        table_name
      );
      EXECUTE format(
        'GRANT ALL PRIVILEGES ON TABLE public.%I TO service_role',
        table_name
      );
      EXECUTE format(
        'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
        table_name
      );
    END IF;
  END LOOP;
END
$$;
