# R-I fortsettelse — GDPR, tilgangsstyring, kalenderbooking, spillerplan og innboks søskentester 16.09.2026

Gren: `claude/les-masterplan-update-037aae-3qvfcl`, oppå main etter PR #897. Ingen visuell portering, ingen produksjonsdata, ingen migrasjon.

## Bakgrunn

Fortsettelse av R-I-gapet: 44 admin-mutasjonsfiler manglet søskentest per 15.09 (`handlingstilgang-tournament-templates-anlegg-bookinger-2026-09-15.md`). Dette gjenskapte inventaret mekanisk (grep etter `"use server"` under `src/app/admin`, filtrert mot filer med en `.test.ts`-tvilling) — 53 filer totalt, 42 uten søskentest (avviket fra 44 forklares av at rapporten 15.09 ikke listet filene eksplisitt; begge tall stemmer med samme metode på hver sin dato).

## Hva som er gjort

Fem nye testfiler, samme mønster som tidligere R-I-arbeid (`node:test` + `mock.module`), 49 tester totalt:

- **`src/app/admin/gdpr/actions.ts`** (10 tester) — den strengeste filen i denne batchen: `requireAdminActionUser`, ikke `requireCoachActionUser`. Første test av et R-I-mønster der COACH selv skal avvises, ikke bare PLAYER/uinnlogget. Begge handlinger (`utforSletteforesporsel`, `avvisForesporsel`) avviser COACH/PLAYER/uinnlogget uten å kalle `anonymiserBruker` eller skrive `DataExportRequest`-status. Bekreftet at kun `DELETE`-typen kan utføres (`EXPORT` avvist) og at allerede behandlede forespørsler avvises.
- **`src/app/admin/settings/tilgang/actions.ts`** (7 tester) — per-trener capability-override (G6) er ADMIN-only; guarden fanges i try/catch og returnerer `{ok:false}` i stedet for å kaste, så testen sjekker svaret. COACH/PLAYER/uinnlogget får `ok:false` uten skriving. For ADMIN: GRANT utover COACH-defaulten, REVOKE av en default-capability, og at override slettes (ikke settes) når ønsket tilstand matcher rolle-defaulten.
- **`src/app/admin/kalender/booking-actions.ts`** (8 tester) — hurtigbooking fra kalenderluka. Ingen per-coach eierskap på selve actionen (tjenestelisten filtreres, men `bookIKalender` kan booke enhver spiller). `opprettOktPaaTid` (fra legacy `calendar/actions.ts`) mockes som ekstern avhengighet. PLAYER/uinnlogget avvist for begge handlinger; ukjent tjeneste og ugyldig tidspunktformat gir `ok:false` uten å opprette booking.
- **`src/app/admin/spillere/[id]/plan/[planId]/plan-actions.ts`** (9 tester) — ekte per-coach eierskap (`assertCoachTilgangTilSpiller`) oppå rollegrensen, ikke bare COACH/ADMIN. Testen dekker begge lag: COACH uten tilgang til nettopp denne spilleren avvist (selv om hen er COACH), og PLAYER/uinnlogget avvist av rollesjekken alene. `dupliserTekniskPlan` sin redirect ved suksess verifisert eksplisitt (`NEXT_REDIRECT` + riktig mål-URL).
- **`src/app/admin/innboks/actions.ts`** (15 tester) — innboksen er en ruter over fem eksisterende saktyper. Testen dekker rollegrensen (`requirePortalUser`), at hver kilde-gren (`planAction`, `caddieDraft`, `sessionRequest`, `notification`, `appFeedback`) ruter til riktig underliggende handling med riktig valg/grunn, og det ene stedet innboksen selv håndhever en strengere regel enn "COACH/ADMIN": `sak`-kilden (Anders' egen Gmail/SMS-triage) krever ADMIN — en COACH får `ok:false`, ikke tilgang, selv med en gjettet sak-id. Bekreftet at et unntak fra en underliggende handling (f.eks. Caddie-utkast som krever ADMIN) fanges som `ok:false` med klartekstmelding, ikke krasjer.

Ingen produksjonskode i disse fem filene ble endret — alle fem var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Kontroll

- Alle fem testfiler kjørt isolert: 10/10, 7/7, 8/8, 9/9, 15/15 bestått (49/49 totalt)
- Full `npm run verify` (etter `npm ci` — worktreets `node_modules` manglet `esbuild`-binæren ved første forsøk, samme kjente driftsavvik som 15.09): grønt. `npm test`: 2844 tester bestått, 0 feil. `npm run build`: kompilert uten feil
- Ingen endring i produksjonskode — kun nye `*.test.ts`-filer og denne rapporten

### Avvik underveis

Første `npm run verify`-forsøk feilet i `check-critical-imports.mjs` med `BUNDLE FAIL … undefined` på fem filer, samme rotårsak som 15.09: `node_modules/esbuild/bin/esbuild` manglet. `npm ci` gjenopprettet `node_modules` (1011 pakker), deretter grønt verify.

`spillere/[id]/plan/[planId]/plan-actions.test.ts` måtte kjøres fra egen mappe (`cd` til mappen med hakeparenteser) — Node sin `--test`-glob matchet ikke filen når den ble oppgitt som sti fra repo-roten med `[id]`/`[planId]` i stien. `npm test` sitt eget glob-mønster (`src/**/*.test.ts`) plukket filen opp uten problemer i den fulle verify-kjøringen, så dette er kun en feilkilde ved isolert kjøring av akkurat denne filen, ikke i prosjektets faktiske testoppsett.

## Gjenstår

37 admin-mutasjonsfiler mangler fortsatt søskentest (42 minus de 5 dekket her). Ingen av dem er verifisert som et faktisk sikkerhetshull i denne leveransen.

## Ikke påstått

- At de øvrige 37 filene mangler faktisk tilgangskontroll.
- At alle handlingsflater i appen nå har søskentest.
- Innlogget Next-/database-reise for disse fem filene.
- Visuell godkjenning, D0 eller lanseringsklar app.
