-- Lukk RLS-lekkasje: test_assignments var eksponert via PostgREST uten RLS.
-- Deny-all-mønster (RLS på, ingen policy) — Prisma service-role bypasser,
-- anon/authenticated nektes. Matcher de øvrige tabellene i skjemaet.
ALTER TABLE "test_assignments" ENABLE ROW LEVEL SECURITY;
