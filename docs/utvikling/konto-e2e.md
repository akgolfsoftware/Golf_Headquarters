# Kontokjeden ende til ende (lokalt)

`tests/e2e/konto-opprettelse.spec.ts` prøver hele veien fra ny konto til PlayerHQ og forelder, mot en isolert
lokal stack. Bare syntetiske adresser (`@example.test`), og nettleseren stopper alle andre adresser enn
127.0.0.1. Google-innloggingen fullføres ikke; testen sjekker bare at knappen sender til Google.

## Stacken

1. Egen Supabase-mappe utenfor repoet med `supabase init`. I `supabase/config.toml`:
   - egne porter (API 55721, database 55722, Mailpit 55724) og `project_id` som ikke kolliderer med andre stacker
   - `[auth.email] enable_confirmations = true` (bekreftelseslenken skal fanges i Mailpit)
   - `site_url = "http://127.0.0.1:3071"` og `additional_redirect_urls = ["http://127.0.0.1:3071/**"]`
   - `[auth.external.google]` påslått med syntetisk `client_id` (ingen ekte nøkler)
2. `supabase start -x studio,realtime,edge-runtime,vector,imgproxy,supavisor,logflare,storage-api,postgres-meta`
3. Skjemaet i den tomme databasen, generert fra `prisma/schema.prisma` (samme grep som `scripts/local-users-bootstrap.mjs`):
   `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` kjørt med `psql` mot 55722.
4. Appen: `next dev --hostname 127.0.0.1 --port 3071` med bare de lokale verdiene fra `supabase status -o env`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`,
   `DIRECT_URL`, `NEXT_PUBLIC_APP_URL=http://127.0.0.1:3071`, `VEDLIKEHOLD=0`). Ingen `.env`-filer fra appen.
   E-post til forelder går gjennom Resend; uten `RESEND_API_KEY` logges feilen og invitasjonen lagres likevel.

## Kjør

```bash
LOCAL_E2E=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3071 KONTO_E2E_MAILPIT=http://127.0.0.1:55724 KONTO_E2E_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55722/postgres npx playwright test tests/e2e/konto-opprettelse.spec.ts --project=chromium
```
