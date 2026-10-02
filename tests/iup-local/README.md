# IUP — lagring mot lokal database

Kjør `node scripts/iup-local-run.mjs` med prosjektets Node 24. Dette er 17 integrasjonsprøver i tillegg til `npm run verify`. Bare identiteten fra innlogging er erstattet med en syntetisk bruker; handlingsvakt, validering, Prisma, transaksjoner og databasebegrensninger kjører faktisk.

Prøvene krever en separat lokal database `ak_hq_iup_test_20261002`, rollen `iup_test_20261002` og Docker-containeren `supabase_db_ak-hq-brukere-20261001` med port `127.0.0.1:55622`. Ignorert `.codex/environments/iup/.env.runtime` inneholder bare den nye lokale `DATABASE_URL`. Bruk aldri produksjonsverdier eller en kopi av `.env.local`. Kjøreren kontrollerer URL, portbinding, databasenavn, rolle og identitetsmarkør før prøvene kan skrive.

Testdatabasen har en minimal `public.users` med tekstnøkkel `id` og nullable `deletedAt`/`anonymisertAt`, samt `public._iup_test_identity(name TEXT PRIMARY KEY)` med én rad `ak-hq-iup-test-20261002`. De to IUP-tabellene er opprettet fra `scripts/sql/iup-besvarelser.sql` i én transaksjon. Globale API-roller `anon`/`authenticated` må eksistere i den lokale Supabase-instansen. Oppretting og vedlikehold er et eksplisitt lokalt miljøsteg, ikke noe testkjøreren gjør automatisk.

Testene prøver blant annet samtidig lagring, gjenforsøk, gamle revisjoner, ufullstendig levering, feil eier, slettet konto, foreldresamtykke, begge skjemaer, historikk med sideinndeling, skadet innhold, RLS og kaskadesletting. De skriver bare syntetiske testbrukere. Den avsluttende kaskadeslettingen rulles tilbake. Ingen e-post, betaling, ekstern datakilde eller produksjonsspiller brukes.

Dataeksport og anonymisering har egne prøver i `src/app/portal/meg/innstillinger/export-user-data.test.ts` og `src/lib/gdpr/anonymiser-bruker.behavior.test.ts`. De bruker erstattede databasekall og kontrollerer eierskap og sletting; dette må ikke omtales som full nettleserprøving.
