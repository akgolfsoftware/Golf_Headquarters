# R-I fortsettelse — turneringer, planmaler, anlegg og bookinger søskentester 15.09.2026

Gren: `claude/les-masterplan-update-037aae`, oppå main etter PR #895. Ingen visuell portering, ingen produksjonsdata, ingen migrasjon.

## Bakgrunn

Fortsettelse av R-I-gapet: 48 admin-mutasjonsfiler manglet søskentest per 14.09 (`handlingstilgang-plans-grupper-2026-09-14.md`). De fire største uten test var `tournaments/actions.ts` (12 handlinger), `(legacy)/plan-templates/actions.ts` (10), `(legacy)/anlegg/location-actions.ts` (6) og `(legacy)/bookinger/actions.ts` (5) — til sammen 33 handlinger.

## Hva som er gjort

Fire nye testfiler, samme mønster som tidligere R-I-arbeid (`node:test` + `mock.module`), 52 tester totalt:

- **`src/app/admin/tournaments/actions.ts`** (17 tester) — turneringer er en delt admin-ressurs uten per-coach eierskap (ingen `coachId`-felt på `Tournament`). Vernet er rollegrensen alene: alle 12 handlinger (create/update/delete tournament, add/deleteResult, meldPaSpillere, fjernPamelding, oppdaterPrioritet, mergeTurneringer, unmergeTurnering, exportTournamentsReport, sendFellesmelding) avviser PLAYER og uinnlogget uten å skrive, og slipper COACH gjennom. `exportTournamentsReport` bruker en egen manuell rollesjekk (ikke `requireCoachActionUser`) — testet separat med samme forventning.
- **`src/app/admin/(legacy)/plan-templates/actions.ts`** (14 tester) — planmaler er delt biblioteksinnhold, samme rollemønster som turneringer. Alle 10 handlinger (update/create/duplicate/archive/unarchiveTemplate, add/update/deleteTemplateSession, setWeekDuration, copyTemplateWeek) avviser PLAYER/uinnlogget uten skriving.
- **`src/app/admin/(legacy)/anlegg/location-actions.ts`** (9 tester) — anlegg er klubbfelles innstillinger, samme rollemønster. Alle 6 handlinger (create/updateLocation, setLocationActive, create/updateFacility, setFacilityActive) avviser PLAYER/uinnlogget uten skriving.
- **`src/app/admin/(legacy)/bookinger/actions.ts`** (12 tester) — den mest følsomme av de fire: her finnes faktisk per-coach eierskap (`coachBookingScope`: COACH kun `coachId`/`serviceType.coachUserId` egne, ADMIN alt). Testen bygger to coacher med hver sine bookinger og verifiserer at coach A aldri kan bekrefte, avvise eller fullføre coach B sine bookinger — verken enkeltvis eller i de tre bulk-handlingene (`bekreftAllePending`, `avvisAllePending`, `markerAlleConfirmedSomCompleted`). Bekreftet i tillegg at `kanBekrefteUtenStripeLeak`-sperren står: en ubetalt booking (ingen Stripe-PI, intet abonnement, pris > 0) kan ikke manuelt bekreftes, verken enkeltvis eller i bulk. ADMIN bekreftet å kunne røre begge coachers bookinger.

Ingen produksjonskode i disse fire filene ble endret — alle fire var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Dokumentdrift rettet i samme leveranse

`docs/MASTERPLAN-GJENSTAAENDE.md` siterte fortsatt R-E Caddie-tilgang/TrackMan CSV og R-C privat lokal lagring/TrackMan HTML som "ikke pushet, ikke PR, ikke flettet" — de var faktisk flettet 14.09 via PR #887 og #888. Rettet til korrekt PR-referanse.

## Kontroll

- Alle fire testfiler kjørt isolert: 17/17, 14/14, 9/9, 12/12 bestått (52/52 totalt)
- Full `npm run verify` (etter `npm ci` — worktreets `node_modules` manglet ved første forsøk, se under): grønt. `npm test`: 2795 tester bestått, 0 feil, 260 suiter. `npm run build`: kompilert uten feil
- Ingen endring i produksjonskode — kun nye `*.test.ts`-filer og dokumentrettelse

### Avvik underveis

Første `npm run verify`-forsøk feilet i `check-critical-imports.mjs` med `BUNDLE FAIL … undefined` på fem filer. Rotårsak: worktreets `node_modules` fantes ikke lengre (`spawnSync ENOENT` på `node_modules/esbuild/bin/esbuild`) — ikke en reell import-feil i noen av de fem filene, og ikke forårsaket av testene i denne leveransen. `npm ci` gjenopprettet `node_modules` (1011 pakker), og verify var deretter grønt. Ukjent hvorfor `node_modules` forsvant midt i økten — mulig samtidig opprydding fra en annen økt i samme arbeidsmappe.

## Gjenstår

44 admin-mutasjonsfiler mangler fortsatt søskentest (48 minus de 4 dekket her). Ingen av dem er verifisert som et faktisk sikkerhetshull i denne leveransen. Notion-oppgaven for KODE-A-sluttsynkronisering ble ikke oppdatert — Notion-MCP var ikke tilkoblet i denne økten.

## Ikke påstått

- At de øvrige 44 filene mangler faktisk tilgangskontroll.
- At alle handlingsflater i appen nå har søskentest.
- Innlogget Next-/database-reise for disse fire filene.
- Visuell godkjenning, D0 eller lanseringsklar app.
