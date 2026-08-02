-- supabase-meg/migrations/0007_health_uniq_index.sql
-- Gir den unike nøkkelen på me_health et forutsigbart navn:
-- me_health_date_metric_source_uniq.
--
-- Bakgrunn: 0004_health.sql opprettet allerede `unique (metric_date, metric, source)`
-- inline, og Postgres ga den et autogenerert navn. Upserten virker derfor allerede,
-- men navnet er nødvendig for å kunne verifisere og referere til nøkkelen. Vi
-- OMDØPER den eksisterende i stedet for å lage en ny — to identiske unike indekser
-- ville kostet en ekstra skriving per rad uten å gi noe.
--
-- Idempotent: kan kjøres flere ganger. Kjøres mot Meg-Supabase (ffaitjztfnelzwefbdhw).

do $$
declare
  eksisterende text;
begin
  -- Finnes navnet allerede? Da er det ingenting å gjøre.
  if exists (
    select 1 from pg_class
    where relname = 'me_health_date_metric_source_uniq'
      and relkind = 'i'
  ) then
    return;
  end if;

  -- Finn en eksisterende unik indeks på nøyaktig (metric_date, metric, source).
  select i.relname into eksisterende
  from pg_index x
  join pg_class i on i.oid = x.indexrelid
  join pg_class t on t.oid = x.indrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'me_health'
    and x.indisunique
    and (
      select array_agg(a.attname::text order by a.attname)
      from unnest(x.indkey) as k(attnum)
      join pg_attribute a on a.attrelid = t.oid and a.attnum = k.attnum
    ) = array['metric','metric_date','source']
  limit 1;

  if eksisterende is not null then
    execute format(
      'alter index public.%I rename to me_health_date_metric_source_uniq',
      eksisterende
    );
  else
    create unique index me_health_date_metric_source_uniq
      on public.me_health (metric_date, metric, source);
  end if;
end $$;
