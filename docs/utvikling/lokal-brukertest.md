# Isolert brukertest på Mac

Denne riggen følger Anders' forhåndsgodkjenning for lokal testing 21.09.2026. Den bruker bare syntetiske personer og egen Supabase-identitet `ak-hq-brukere-20261001`. Etter samordning og automatisk opprydding er den gjenopprettet i arbeidskopien `.claude/worktrees/codex-lokal-brukertest`. Videre testing 01.10.2026 ligger på `codex/sju-testkontoer-2026-10-01`, fra main `c86b0408d`. Miljøfilene er fortsatt separate og ignorerte.

## Mål og vern

| Tjeneste | Lokal adresse |
|---|---|
| App | `http://127.0.0.1:3061` |
| Supabase Auth og API | `http://127.0.0.1:55621` |
| PostgreSQL | `127.0.0.1:55622`, database `postgres` |
| Mailpit, lokal e-postoppsamling | `http://127.0.0.1:55624` |

Ingen produksjonsdata eller produksjonshemmeligheter er kopiert. E-post samles lokalt. Storage, betaling, eksterne AI-tjenester og kalenderintegrasjoner er ikke koblet opp. Nettlesertestene avviser andre nettadresser. Dette er ikke bevis for produksjonsintegrasjonene.

`scripts/local-users-run.mjs` leser bare egen ignorert `.codex/environments/brukere/.env.runtime`. Den arver ikke leverandørnøkler fra terminalen. Den kontrollerer prosjektidentitet, begge databaseadresser, Auth, appadresse og Docker-portenes binding til `127.0.0.1` før kjøring. Databasebootstrap og oppretting av testbrukere kontrollerer i tillegg en egen databaseidentitet. Kontrollene avviser andre lokale miljøer og hostede tjenester. Output filtreres linjevis for å skjule lokale nøkler, passord og innloggingskoder. Rå CLI-startoutput er fjernet.

## Bruk den etablerte riggen

Kjør med Node.js 24 fra denne arbeidskopien. Docker og de fem egne Supabase-containerne må kjøre. De eksisterende lokale konfigurasjonsfilene beholdes private; kommandoene er ikke en oppskrift for å opprette en ny stack fra bunnen.

```sh
node scripts/local-users-run.mjs bootstrap
node scripts/local-users-run.mjs seed
node --test tests/local-users/target.test.mjs
node scripts/local-users-run.mjs journeys
node scripts/local-users-run.mjs dev
```

Kjør `node scripts/local-users-run.mjs users` i en egen terminal mens appen kjører. Prøvene krever kontoene og feiler ved manglende oppsett; ingen utelates. De kjører Chromium på desktop 1440 px og mobil 390 px. Traces, videoer og skjermbilder er slått av for å holde innloggingshemmeligheter utenfor testartefakter.

`journeys` prøver appens eksisterende serverhandlinger og lesere mot ekte lokal PostgreSQL. Bare forespørselsidentiteten og Next sin cache erstattes; eksisterende database- og eierskapsspørringer kjører uendret. Dette er ikke bevis for innlogging, samtykkevakten eller nettsiden. Prøvene kontrollerer databaseidentiteten før skriving og rydder bare ID-ene de selv oppretter. Ingen prøve utelates dersom oppsettet mangler.

Arbeidskopien har egne lokale avhengigheter. Turbopack kan ikke bruke en `node_modules`-lenke utenfor arbeidskopiens rot; slik lenke må erstattes med egne avhengigheter før app-/byggkontroll. Bevar hovedmappens avhengigheter og ignorerte runtime-filer.

`dev` og `users` setter `VEDLIKEHOLD=0` bare i den kontrollerte lokale barneprosessen, slik at nettsidens globale vedlikeholdsskilt ikke skjuler appen under prøvene. Innloggings-, rolle-, eierskaps- og samtykkevaktene er beholdt. Produksjonsoppsett og eksisterende miljøfiler endres ikke.

Stopp dev-serveren før `node scripts/local-users-run.mjs verify`, som kjører prosjektets uendrede `npm run verify`. Testene for appens standardadresse krever at den lokale appadressen ikke arves i denne kvalitetskontrollen; database og Auth peker fortsatt bare lokalt. Ikke start en samtidig bygging i samme `.next`-mappe.

Ved bytte eller samordning av kodeversjon: kjør `node scripts/local-users-run.mjs typegen` før kontrollen, slik at Next sine genererte rutetyper stemmer med filene som finnes. Kontrollkommandoene bruker samme faste minnegrense som CI (5 GB) og arver ingen vilkårlige Node-innstillinger fra terminalen.

`test` og `build` kjører henholdsvis `npm test` og `npm run build` separat for feildiagnose. De erstatter ikke en bestått samlet `verify`.

## Kontrollerte scenarioer

| Konto | Formål |
|---|---|
| Testspiller 01 | Full tilgang gjennom aktiv AK-gruppe, egen publisert økt |
| Testspiller 02 | Talentprofil uten gruppetilgang |
| Testspiller 03 | Full tilgang i en annen treners gruppe |
| Testspiller 04 | Mindreårig uten foreldresamtykke |
| Testcoach A/B | Adskilt spilleromfang og trenerens startside |
| Testforesatt | Foreldrerolle, uten godkjent relasjon til et barn |

Dette er kunstige scenarioer, ikke en tildeling av roller eller alder til Anders' navngitte piloter. Passord lages tilfeldig og lagres bare i ignorert `.env.users`. Ikke skriv ut filen, ta den med i dokumentasjon eller del den.

## Begrensninger ved gjenoppretting

Supabase CLI 2.109.1 ble brukt. CLI-en publiserer som standard porter på alle nettverksgrensesnitt selv med et lokalt Docker-nettverk. De tre egne containerne er derfor rekonfigurert med eksplisitt loopback-binding. `local-users-run.mjs` avviser kjøring dersom denne bindingen endres. Ikke bruk `supabase start` ukontrollert til å rekonstruere miljøet; en ny oppbygging trenger samme portkontroll før app eller oppretting av brukere startes. Andre Docker-stackers data og porter skal bevares.

Skjemaet ble generert fra `prisma/schema.prisma` med en egen ignorert Prisma-konfigurasjon og opprettet bare i tom lokal database. Ved samordning med hovedgrenen 01.10.2026 ble gjennomgåtte additive skjemaendringer lagt til i den samme lokale databasen, etter kontroll av adresse, portbinding og databaseidentitet. Migrasjonshistorikken ble ikke kjørt. Vector-utvidelsen er aktivert. Alle 216 offentlige tabeller har lokal RLS uten tillatende policyer; dette etterligner ikke hostede tilgangsregler. Appens serverkode og egne eierskapsvakter er fortsatt sikkerhetsgrensen som nettleserprøvene undersøker. `bootstrap` endrer ikke et eksisterende skjema; senere skjemaavvik må undersøkes separat før lokale brukerprøver.

Den lokale standardmalen sender innloggingslenke uten seks-sifret kode. Kodetesten får derfor en ekte engangskode fra lokal Auth-administrator og prøver selve kodeverifiseringen i appen. Den beviser ikke at produksjonsmalen leverer koden. Google og ekte SMS, foresatts godkjenning/tilbaketrekking, sletting og eksport er fortsatt uprøvd i denne riggen.

Se [kontrollrapporten](../design-audit/brukere-funksjonskontroll-2026-10-01.md) for resultater og avgrensning.

Senere samme dag ble riggen utvidet med trener → spiller → Live → oppsummering og faktiske lagringsprøver. Se [koblingskontrollen](../design-audit/design-lagring-kontroll-2026-10-01.md) og [overleveringsgrunnlaget](../planer/design-lagring-brukerreiser-2026-10-01.md).


## Sju kontoer for de tidligere utelatte E2E-prøvene

De 64 kontobetingede kjøringene var 32 prøvevarianter i to nettlesermotorer, ikke 64 kontoer. `seed` gjenbruker fire spillere, to trenere og én foresatt. P01 er hovedspiller med publisert økt, syntetiske TrackMan-slag, coachingpakke med fire timer og medlemskap i WANG og Team Norway. COACH_A har trenerrolle i de to gruppene. P02 mangler coach-relasjon, P03 tilhører COACH_B, P04 mangler foreldresamtykke og PARENT mangler godkjent barn-relasjon.

`seed` tilbakestiller P01 sin syntetiske saldo til fire og dagens faste økt til publisert. Ikke kjør seed samtidig med en skrivende brukerreise. Den lager også syntetisk tjeneste, teststed og ledige coachingvinduer. Ingen kortbetaling eller ekte e-post sendes.

Etter `seed` og mens `dev` kjører:

```sh
node scripts/local-users-run.mjs e2e
node scripts/local-users-run.mjs users
```

`e2e` kobler P01 og COACH_A til prøvenes vanlige innlogging og P02 til testen av en spiller uten coach-relasjon. Kontoene finnes bare i den ignorerte miljøfilen. Manifestet `tests/local-users/e2e-cases.json` velger de opprinnelige 32 variantene, samt rettet Workbench-, tjenestevalg- og full credit-booking-prøve: 35 varianter, 70 kjøringer i Chromium og WebKit. Manglende kontoer eller en utelatt prøve gjør lokal kontroll rød. Produksjonens offentlige kontroll kan fortsatt utelate prøvene uten testkontoer.

Den lokale kjøreren avviser appens vanlige `.env`-filer og leverandørinnstillinger i testkonfigurasjonen. `BOOKING_PUBLIC` åpnes bare i den kontrollerte lokale prosessen. Nettleseren stopper eksterne nettadresser. De to bevisst blokkerte Vercel-analyseskriptene regnes ikke som appfeil i denne lokale kontrollen; andre konsollfeil kontrolleres fortsatt. Ingen tilgangsvakter slås av.

Den fullstendige credit-prøven bruker appens innlogging og knapper, leser faktisk lagret booking og saldo fra den lokale databasen og avbestiller. Stripe-kortbetaling er en separat integrasjonsprøve og inngår ikke i disse 70.
