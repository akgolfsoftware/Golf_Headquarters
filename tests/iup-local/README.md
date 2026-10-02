# IUP — lagring mot lokal database

Kjør `node scripts/iup-local-run.mjs` med prosjektets Node 24. Dette er 25 integrasjonsprøver i tillegg til `npm run verify`. Bare identiteten fra innlogging er erstattet med en syntetisk bruker; handlingsvakt, validering, Prisma, transaksjoner og databasebegrensninger kjører faktisk.

Prøvene krever en separat lokal database `ak_hq_iup_test_20261002`, rollen `iup_test_20261002` og Docker-containeren `supabase_db_ak-hq-brukere-20261001` med port `127.0.0.1:55622`. Ignorert `.codex/environments/iup/.env.runtime` inneholder bare den nye lokale `DATABASE_URL`. Bruk aldri produksjonsverdier eller en kopi av `.env.local`. Kjøreren kontrollerer URL, portbinding, databasenavn, rolle og identitetsmarkør før prøvene kan skrive.

Testdatabasen har en minimal `public.users` med tekstnøkkel `id` og nullable `deletedAt`/`anonymisertAt`, samt `public._iup_test_identity(name TEXT PRIMARY KEY)` med én rad `ak-hq-iup-test-20261002`. Minimal `groups` (`id`, `name`, `slug`, `program` som prosjektets `PlayerProgram`-enum, `arkivertAt`) og `group_members` (`id`, `groupId`, `userId`, `role`, `joinedAt`, `endedAt`, unik gruppe/spiller) brukes til de faktiske medlemskapskontrollene. De to IUP-tabellene er opprettet fra `scripts/sql/iup-besvarelser.sql` i én transaksjon. Globale API-roller `anon`/`authenticated` må eksistere i den lokale Supabase-instansen. Oppretting og vedlikehold er et eksplisitt lokalt miljøsteg, ikke noe testkjøreren gjør automatisk.

Testene prøver blant annet samtidig lagring, gjenforsøk, gamle revisjoner, ufullstendig levering, feil eier, slettet konto, foreldresamtykke, begge skjemaer, historikk og lister med sideinndeling, gjenopptak av samme periode, aktive/avsluttede medlemskap, arkivert gruppe, kanonisk Team Norway-identitet, synlig inngang, skadet innhold, RLS og kaskadesletting. De skriver bare syntetiske testbrukere. Den avsluttende kaskadeslettingen rulles tilbake. Ingen e-post, betaling, ekstern datakilde eller produksjonsspiller brukes.

Dataeksport og anonymisering har egne prøver i `src/app/portal/meg/innstillinger/export-user-data.test.ts` og `src/lib/gdpr/anonymiser-bruker.behavior.test.ts`. De bruker erstattede databasekall og kontrollerer eierskap og sletting; dette må ikke omtales som full nettleserprøving.

## Spillerreise i nettleser

`node tests/iup-local/spillerreise.browser.mjs` prøver appens virkelige passordinnlogging, serverhandlinger og database. Dette kjøres separat fra enhetsprøvene. Appen må kjøre på `http://127.0.0.1:3073` med eget lokalt Supabase-prosjekt `ak-hq-iup-app-20261002` (API 55821, database 55822). Databasen må ha identitetskommentaren med samme prosjektnavn og fullstendig skjema fra en tom lokal database. Ikke bruk migrasjonshistorikken eller en produksjonskopi.

Privat, ignorert `.codex/environments/iup-app/runtime.json` inneholder den nye lokale konfigurasjonen. `accounts.json` inneholder to bekreftede, syntetiske Auth-kontoer med `id`, `email`, `password`: `iup-app-spiller-a`/`iup-a@example.test` og tilsvarende `b`. Begge har rollen PLAYER, Full-tilgang og aktivt spillermedlemskap i én syntetisk WANG-gruppe. Alle publiserte Docker-porter må være bundet til `127.0.0.1`. Passordinnlogging er aktiv lokalt; automatisk registrering og e-postsending er av. `VEDLIKEHOLD=0` gjelder bare denne lokale appen. Ingen eksisterende miljøfil kopieres eller endres.

Prøven kontrollerer lokal vert/port, databaseidentitet og syntetiske ID-er før den nullstiller **bare disse to brukernes IUP-svar** og medlemskapets sluttdato. Deretter prøves utkast, levering, ny revisjon, historikk, samtidig redigering, tapt lagringskvittering, fremmed eier, avsluttet medlemskap, sesongevalueringens null/ubeskrevet, navigasjonsvarsel og de faktiske inngangene. Skjermbilder lagres utenfor Git under `~/Documents/Claude/akgolf-hq/iup-kode-2026-10-02/nettleser/`, alternativt katalogen i `IUP_BROWSER_EVIDENCE_DIR`. Natt-tema prøves ved å sette den eksisterende designattributten; det er ikke en påstand om en ny temabryter i appen.


## Navngitt trenerdeling

`trenerdeling.test.ts` bruker det samme separate IUP-appmiljøet på 127.0.0.1:55822 og kontrollerer databaseidentiteten `ak-hq-iup-app-20261002`. Den berører bare kontoer/grupper med prefiks `deling-test-`, og avviser å overta en eksisterende kanonisk TN-gruppe fra en annen test. Identitetsinngangene er kontrollerte testinnlogginger; SQL, transaksjoner, kildevalidering og tilgangsavgjørelser er ekte.

Kjør med Node 24: `node scripts/trenerdeling-local-run.mjs <privat-runtime.json> --opprett-testskjema`. Utelat siste flagg etter oppretting. Konfigurasjonen må tilhøre det lokale IUP-miljøet; kopier aldri produksjonsmiljø eller `.env` fra en annen arbeidskopi. Skriptet sjekker lokal Docker-binding og databasemarkør før SQL eller testdata skrives. Bare database-URL gis videre til prøvene; ingen e-post-/betalings-/AI-nøkler brukes.
