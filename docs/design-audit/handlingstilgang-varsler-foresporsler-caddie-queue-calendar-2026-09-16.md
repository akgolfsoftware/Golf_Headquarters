# R-I fortsettelse — varsler, forespørsler, Caddie-dashbord, kø og kalender søskentester 16.09.2026

Gren: `claude/r-i-batch3-2026-09-16`, oppå main etter PR #899. Ingen visuell portering, ingen produksjonsdata, ingen migrasjon.

## Bakgrunn

Fortsettelse av R-I-gapet: 37 admin-mutasjonsfiler manglet søskentest per forrige leveranse (`handlingstilgang-gdpr-tilgang-booking-plan-innboks-2026-09-16.md`). Denne batchen dekker en naturlig klynge: `admin/innboks/actions.ts` (dekket 16.09) ruter til `varsler/actions.ts`, `(legacy)/foresporsler/actions.ts` og `agencyos/caddie/dashbord/actions.ts` — disse tre får nå egne søskentester direkte, i tillegg til `queue/actions.ts` og den mest sentrale av alle: `(legacy)/calendar/actions.ts` (inneholder `opprettOktPaaTid`, som `kalender/booking-actions.ts` allerede bruker og som var dekket via mock i forrige leveranse).

## Hva som er gjort

Fem nye testfiler, samme mønster som tidligere R-I-arbeid (`node:test` + `mock.module`), 64 tester totalt:

- **`src/app/admin/varsler/actions.ts`** (15 tester) — to vernlag: rollegrensen (`requirePortalUser`) og ekte per-coach eierskap på `PlanAction` (`harCoachTilgangTilSpiller` + `coachId`-match). En COACH uten tilgang til spilleren, eller der `coachId` peker på en ANNEN coach, avvises — selv om hen er COACH. ADMIN er unntatt eierskapssjekken og kan godta/avvise uavhengig. `markerVarselLest` skoper sin `updateMany` til `userId: user.id`; testen bekrefter at en annen brukers notifikasjon aldri røres (simulert med to brukeres varsler).
- **`src/app/admin/(legacy)/foresporsler/actions.ts`** (11 tester) — filen har sitt eget dokumenterte IDOR-vern (`assertKanBesvare`): COACH kan besvare forespørsler rettet til seg selv eller den åpne køen (`coachId=null`), men avvises på en forespørsel adressert til en annen coach. ADMIN kan besvare alle. Testet eksplisitt med tre forespørsel-varianter (egen, annen coach, åpen).
- **`src/app/admin/agencyos/caddie/dashbord/actions.ts`** (12 tester) — alle tre handlinger krever `Capability.USE_AGENTS` (G6), som er UTENFOR COACH-defaulten. Testen dekker capability-gaten direkte: COACH UTEN granted USE_AGENTS avvises selv om rollen (COACH/ADMIN) er tillatt; COACH MED granted USE_AGENTS og ADMIN (alltid har capabiliteten) slipper gjennom.
- **`src/app/admin/queue/actions.ts`** (7 tester) — to eierskapslag, begge returnerer `ok:false` (ikke unntak): I0-porten (`erCoachetSpiller` — aldri oppfølgingsstatus på selvbetjente spillere) og coach-scoping (`harCoachTilgangTilSpiller`). Rollegrensen (`requirePortalUser`) kaster derimot, siden den ikke er fanget i try/catch her.
- **`src/app/admin/(legacy)/calendar/actions.ts`** (19 tester, den største filen i denne batchen) — fire mutasjoner uten per-coach eierskap (rollegrensen alene er vernet, ulikt `bookinger/actions.ts`). Dekker forretningsreglene i `opprettOktPaaTid` (manglende/ukjente relaterte poster, fasilitet fra annen lokasjon, inaktiv fasilitet, kollisjon rethrows med norsk melding) og status-guardene i `moveSession`/`cancelSession` (ikke funnet / allerede kansellert gir `ok:false`).

Ingen produksjonskode i disse fem filene ble endret — alle fem var allerede korrekt portvoktet. Dette lukker testdekningsgapet, ikke et funnet sikkerhetshull.

## Kontroll

- Alle fem testfiler kjørt isolert: 15/15, 11/11, 12/12, 7/7, 19/19 bestått (64/64 totalt)
- Full `npm run verify`: grønt. `npm test`: 2908 tester bestått, 0 feil. `npm run build`: kompilert uten feil
- Ingen endring i produksjonskode — kun nye `*.test.ts`-filer og denne rapporten

### Avvik underveis

Én `tsc --noEmit`-feil i `varsler/actions.test.ts` (linje 202): `notificationUpdates[0]?.where.userId` leste et felt på en `unknown`-typet variabel. Rettet med en eksplisitt type-cast på lesetidspunktet — ingen produksjonskode berørt.

Testfiler i mapper med hakeparenteser (`(legacy)/foresporsler/`, `(legacy)/calendar/`) må kjøres isolert fra egen mappe (`cd` dit, ikke sti fra repo-roten) — samme kjente Node-glob-begrensning som notert i forrige rapport. `npm test` sitt eget glob-mønster plukker dem opp uten problemer i den fulle verify-kjøringen.

## Gjenstår

32 admin-mutasjonsfiler mangler fortsatt søskentest (37 minus de 5 dekket her). Ingen av dem er verifisert som et faktisk sikkerhetshull i denne leveransen.

## Ikke påstått

- At de øvrige 32 filene mangler faktisk tilgangskontroll.
- At alle handlingsflater i appen nå har søskentest.
- Innlogget Next-/database-reise for disse fem filene.
- Visuell godkjenning, D0 eller lanseringsklar app.
