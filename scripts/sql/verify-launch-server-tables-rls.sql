-- Read-only verification: no user rows are returned or changed.
BEGIN READ ONLY;
DO $verification$
DECLARE
  client_role text;
  table_name text;
  visible_rows bigint;
BEGIN
  FOREACH client_role IN ARRAY ARRAY['anon','authenticated'] LOOP
    EXECUTE format('SET LOCAL ROLE %I', client_role);
    FOREACH table_name IN ARRAY ARRAY['datagolf_tak','datagolf_tak_band','position_task_maal','tn_posts','tn_post_vedlegg','tn_post_lesekvitteringer','kondisjon_segmenter','daily_active_users','drift_rutiner'] LOOP
      IF NOT row_security_active(format('public.%I', table_name)::regclass) THEN
        RAISE EXCEPTION 'RLS inactive for role % on table %', client_role, table_name;
      END IF;
      EXECUTE format('SELECT count(*) FROM public.%I', table_name) INTO visible_rows;
      IF visible_rows <> 0 THEN
        RAISE EXCEPTION 'Unexpected visible rows for role % on table %', client_role, table_name;
      END IF;
    END LOOP;
    RESET ROLE;
  END LOOP;
  SET LOCAL ROLE postgres;
  FOREACH table_name IN ARRAY ARRAY['datagolf_tak','datagolf_tak_band','position_task_maal','tn_posts','tn_post_vedlegg','tn_post_lesekvitteringer','kondisjon_segmenter','daily_active_users','drift_rutiner'] LOOP
    IF row_security_active(format('public.%I', table_name)::regclass) THEN
      RAISE EXCEPTION 'Server role unexpectedly restricted on table %', table_name;
    END IF;
    IF NOT (has_table_privilege(current_user, format('public.%I', table_name), 'SELECT')
      AND has_table_privilege(current_user, format('public.%I', table_name), 'INSERT')
      AND has_table_privilege(current_user, format('public.%I', table_name), 'UPDATE')
      AND has_table_privilege(current_user, format('public.%I', table_name), 'DELETE')) THEN
      RAISE EXCEPTION 'Server role lost table access on %', table_name;
    END IF;
    EXECUTE format('SELECT 1 FROM public.%I LIMIT 0', table_name);
  END LOOP;
  RESET ROLE;
END
$verification$;
COMMIT;
SELECT 'passed' AS status, 9 AS tables_verified, 18 AS client_reads_denied, 9 AS server_access_checks;
