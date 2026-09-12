# Isolert lanseringsdatabase prøvd på nytt 12.09.2026

Gren: `grok/docker-launch-tester-2026-09-12` fra `origin/main` `677746ced`. Ingen visuell portering. Ingen produksjonsendring. `.env.local` er ikke lest.

## Hva som er prøvd

Isolert Postgres 17.8 på `127.0.0.1:54379`, database `ak_hq_launch_tests`, 196 tabeller. Syntetiske data. Auth, e-post, kalender og varsling er testfunksjoner.

| Prøve | Resultat |
|---|---|
| `backup-restore.test.mjs` | 1/1. 196 tabeller, booking gjenopprettet, overlapp avvist, 1,06 s. `productionBackupTested: false` |
| `function-security.test.mjs` | 6/6. Helsefunksjoner avvist for klient, nøkkelvakt og coach-identitet |
| `launch-database.test.ts` | 11/11 med UTC i prøvefilen. Samtidig booking, delt økt, credits, Workbench, avvist coach/forelder, TN-fullføring, betalingsrekkefølge |

Første kjøring uten UTC feilet to bookingprøver fordi lokale klokkeslett på maskinen (sommertid) ikke traff de lagrede UTC-tidene. Prøvefilen setter `TZ=UTC`. Dette er ikke en produktfeil.

## Docker som kjørte på maskinen

Docker var oppe, men stacken heter `wang-toppidrett` (port 54321–54324). Den har 122 `public`-tabeller og ingen `public.users`. HQ-skjema er ikke lagt inn der.

## Ikke påstått

- P0-TEST / innlogget Next mot lokal Supabase-innlogging.
- Produksjonskopi, produksjonsrestore, Vercel-rollback eller L7/L8.
- Ekte Stripe, e-post eller kalender.
