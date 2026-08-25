# LOOP 1 — DONE (25.08.2026)

Domain + persistens + actions for Workbench-kjernen. **Ingen UI.** Bølge 1, loop 1 av 14.

Gren: `docs/natt-plan-2026-08-25`. Ikke merget. Loop 2 er ikke startet.

## Verifikasjon — grønn

| Gate | Resultat |
|---|---|
| `npx tsx --test src/lib/domain/workbench/operations.test.ts` | 18/18 |
| `npx tsx --test src/lib/workbench/wb-map.test.ts` | 5/5 |
| `npm test` (hele suiten) | 1590/1590 |
| `npm run verify` | grønn (prisma validate + generate, tsc, eslint, action-auth, token-gap, critical-imports, build) |

Utgangspunktet var **rødt**: `docs/natt/workbench/domain/operations.ts:70` manglet `origin`
(påkrevd i `types.ts`). Spec-filene under `docs/` er inkludert i `tsconfig`, så hele bygget
stod på den ene linja. Rettet i både spec-kopien og den porterte koden.

## Filer

| Fil | Hva |
|---|---|
| `src/lib/domain/workbench/types.ts` | Domenetyper (portert 1:1) |
| `src/lib/domain/workbench/operations.ts` | Rene operasjoner (`origin` fikset, ubrukte importer fjernet) |
| `src/lib/domain/workbench/operations.test.ts` | node:test, 18 tester |
| `src/lib/domain/workbench/labels.ts` | Norske strenger |
| `src/lib/domain/workbench/schemas.ts` | **Ny** — zod for lagret JSON (AK-formel, status, dato) |
| `src/lib/workbench/wb-map.ts` | **Ny** — Prisma-rad ↔ domenetype, UTC-dato, spiller-synlige statuser |
| `src/lib/workbench/wb-map.test.ts` | **Ny** — 5 tester på mapping og synlighet |
| `src/lib/workbench/wb-actions.ts` | **Ny** — hele økt-kontrakten som server actions |
| `prisma/schema.prisma` | **+2 modeller** — `WorkbenchSession`, `WorkbenchDrill` (additivt, sist i fila) |
| `scripts/add-workbench-sessions-2026-08-25.ts` | DDL — oppretter de to tabellene, idempotent |
| `scripts/smoke-workbench-2026-08-25.ts` | Smoke: create → move → publish → spillerdag |

## Gap-tabell — hva som avviker fra prompten

| Punkt i prompten | Hva som ble gjort | Hvorfor |
|---|---|---|
| «Port til `src/domain/workbench/`» | Lagt i **`src/lib/domain/workbench/`** | CLAUDE.md invariant 5: domenelogikk bor kun i `src/lib/domain/`. `src/domain/` finnes ikke i dette repoet. |
| «Gjenbruk Prisma-tabell hvis den matcher» | **Nye, isolerte tabeller** | `TrainingPlanSession` har ingen publiser-status per økt (publisering er plan-nivå i dag), og `SessionStatusV2` mangler `DRAFT`/`PUBLISHED`. Å utvide et delt enum i prod er ikke additivt. De nye tabellene rører ingen eksisterende rad. |
| Enum-felter i databasen | Lagres som **tekst** (`status`, `pyramid`, `origin`, …) | Slipper å utvide delte enum-typer i prod. Verdiene zod-valideres ved lesing, med nøytral fallback i stedet for krasj. |
| Actions returnerer `WorkbenchSession` | Returnerer **`WbResultat<T>`** (`{ok,data}` / `{ok,error}`) | Følger mønsteret i `session-actions.ts` / `publish-actions.ts`. |
| `loadSources` | Returnerer tom liste | Tillatt i Loop 1. |
| `resolvePlayerApproval` | Returnerer «ikke koblet på ennå» | Utsatt til Loop 3T per prompten. |
| Låste blokker i `loadWeek` | Tom liste | Skole/booking-koblingen hører til Loop 2. |
| VEGG (to redigerbare overlapper sperrer Publiser) | Ikke bygget | Prompten tillater utsettelse til Loop 2. Overlapp gir i dag `warn` via `validateWeek`, aldri blokkering — i tråd med invariant 1. |
| `revalidatePath` etter skriving | Ikke lagt inn | Ingen rute leser tabellene ennå. Kobles på sammen med UI i Loop 2. |

## BLOKKERER — DDL er ikke kjørt

Tabellene `workbench_sessions` og `workbench_drills` finnes **i skjemaet, ikke i databasen**.
`prisma migrate dev` / `db push` / `migrate deploy` er alle ødelagte her (gotchas
§Schema-endringer), så veien er det kirurgiske skriptet. Det krever Anders' ja, og er ikke kjørt.

```bash
npx tsx scripts/add-workbench-sessions-2026-08-25.ts
```

Dette er trygt i den forstand at det kun oppretter to helt nye tabeller — `CREATE TABLE IF NOT
EXISTS`, ingen eksisterende tabell eller kolonne røres, og det kan kjøres flere ganger.

**Ingenting er i fare før det kjøres.** Koden er sovende: ingen rute, komponent eller agent
importerer `wb-actions.ts` ennå, så prod oppfører seg nøyaktig som før.

## Smoke — klar, ikke kjørt

Venter på DDL-en over. Deretter, med to ekte IDer:

```bash
WB_PLAYER_ID=<id> WB_COACH_ID=<id> npx tsx scripts/smoke-workbench-2026-08-25.ts
```

Den oppretter én publisert og én utkast-økt, flytter, publiserer, leser spillerdagen og sletter
begge igjen. Fasit: spillerdagen viser nøyaktig én økt, og utkastet er usynlig.

Selve regelen er allerede testdekket uten database — `operations.test.ts` («DRAFT must never
appear in player day filter») og `wb-map.test.ts` («inneholder aldri DRAFT»).

## Slik oppfører laget seg

- **Utkast er usynlig for spilleren.** `loadPlayerDay` spør kun etter `PUBLISHED`,
  `IN_PROGRESS`, `COMPLETED`. Listen er én konstant (`SPILLER_SYNLIGE_STATUSER`) med egen test,
  ikke et filter som kan gli fra hverandre flere steder.
- **Tilgang sjekkes på økta, ikke på rollen.** Hver action henter raden først og spør så om den
  innloggede er spilleren selv eller en coach med faktisk tilgang. En coach kan ikke nå en annen
  coachs spiller ved å sende inn en fremmed id.
- **Datoer lagres som UTC-midnatt.** Ellers sklir datoen én dag bakover når en action kjøres fra
  en maskin i Oslo (kjent felle i dette repoet). Dekket av egen test.
- **Ingen treningsregler.** Overlapp gir en advarsel, aldri en sperre. Vokabularet er
  merkelapper — invariant 1.

## Hva Loop 2 arver

- Hele skrive-kontrakten ferdig og typet: `createSession`, `moveSession`, `publishSessions`,
  `unpublishSession`, `addDrill`, `reorderDrills`, `removeDrill`, `deleteSession`,
  `startSession`, `completeSession`, `skipSession`.
- Hele lese-kontrakten: `loadWeek` (gir ferdig `WeekViewModel` med 7 dagskolonner og budsjett),
  `loadSession`, `loadSources`, `loadPlayerDay`.
- `ui/state-machine.ts` og `ui/components.md` i `docs/natt/workbench/` er **ikke** portert —
  de hører til uke-UI-et i Loop 2.
- Åpne punkter Loop 2 må ta: DDL kjørt, låste blokker (skole/booking) inn i `loadWeek`,
  VEGG-regelen for Publiser, `revalidatePath`, og innhold i `loadSources`.
