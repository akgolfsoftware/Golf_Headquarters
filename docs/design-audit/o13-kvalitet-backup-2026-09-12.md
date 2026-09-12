# O13 — feilhåndtering, observabilitet, ytelse og lokal backup 12.09.2026

Gren: `grok/o13-kvalitet-backup-2026-09-12` fra `origin/main` `4581ff79a` (PR #851). Ingen visuell portering. Ingen produksjonsendring.

## Hva som er prøvd

- Feilhåndtering: `sanitizeMessage`/`sanitizeMeta` fjerner e-post, telefon, Postgres-URL, Stripe-nøkkel, webhook-hemmelighet og Bearer-token. Hemmelige feltnavn redigeres uten å røre `bookingId`.
- `logError` og `tryLog` skriver sanitert innhold. Feilet ErrorLog-skriving logger ikke rå db-url.
- Observabilitet: `/api/health` bruker `byggHelseSvar` med bare `status`, `db`, `timestamp`, `uptime`. 200 ved database oppe, 503 ved nede. Ingen miljøverdier i svaret.
- Ytelse: sanitering av 2000 felter under 500 ms; TrackMan-normalisering av 5000 verdier under 250 ms. Dette er lokal CPU-prøve, ikke L5.
- Backup/restore/rollback: `krevIsolertLaunchUrl` godtar kun `127.0.0.1:54379/ak_hq_launch_tests`. Restore-klon kan droppes kun med prefiks `ak_hq_launch_restore_`, aldri kilden. Produksjonstilbakeføring er avvist uten uttrykkelig autorisasjon. Integrasjonstestene leser ikke `.env.local`.

## Isolert testdatabase — blokkering

Docker er nede (`docker info` exit 1). `tests/integration/backup-restore.test.mjs` og `launch-database.test.ts` er ikke kjørt i denne økten. Tidligere lokal prøve 10.09 (196 tabeller, 2,59 s) står i [lansering og gjenoppretting](../drift/lansering-og-gjenoppretting.md); den er ikke gjentatt her.

## Ikke påstått

- L5, L7 eller L8 bestått.
- Produksjonsbackup, produksjonsrestore, Vercel-rollback eller alarm fram til telefon.
- Innlogget reise eller visuell godkjenning.
