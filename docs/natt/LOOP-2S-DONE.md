# LOOP 2S — DONE (25.08.2026)

Drill-editor i `SessionInspector`: legg til, reorder (opp/ned), fjern.
Gren `claude/sessioninspector-drill-ui-125d70`. Ikke merget.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npm run verify` (prisma validate/generate · tsc · eslint · action-auth · token-gap · critical-imports · build) | grønn (build kjørt i to deler pga. 2-min shell-timeout — samme kommando, samme resultat) |
| `npm test` | 1595/1595 |
| `npx tsx --test src/lib/domain/workbench/operations.test.ts` | 18/18 (ingen domeneendring i denne loopen — testet for å bekrefte ingenting brakk) |

**Manuell klikk-test er IKKE utført.** Samme grunn som Loop 2: krever innlogging
som coach i en kjørende app, og Claude skriver aldri passord i et skjermbilde
(skjermbilde-gaten). Forsøkte å logge inn som `coachtest@akgolf.test` for å
klikke gjennom legg til → liste → reorder → fjern — blokkert av harnessets
egen klassifiserer på selve passord-utfyllingen, ikke bare av regelen i
CLAUDE.md. Flyten er derfor typesjekket og bygget, ikke klikket.

## Hva ble gjort

Ingen domeneendring — `addDrill`/`reorderDrills`/`removeDrill` i
`wb-actions.ts` og de rene operasjonene i `operations.ts` fantes allerede fra
Loop 1/2 og er urørt.

| Fil | Hva |
|---|---|
| `src/components/workbench/SessionInspector.tsx` | Drill-listen fikk reorder (opp/ned-knapper, ingen dnd-lib) + fjern per rad, «Legg til drill»-inline-skjema (navn, pyramide, område, tid), komplett/MANGLER-rad-visning |
| `src/components/workbench/WorkbenchUke.tsx` | Kobler de tre nye SessionInspector-eventene til `addDrill`/`reorderDrills`/`removeDrill` via samme `kjor()`-mønster som resten av filen |
| `src/lib/domain/workbench/labels.ts` | Nye norske strenger: `AREA_LABEL` (alle 18 treningsområder) + drill-skjema-labels (`drillTitle`, `drillPyramid`, `drillArea`, `drillDuration`, `moveDrillUp/Down`, `removeDrillLabel`, `incompleteDrill`) |

## Beslutninger

- **Ingen ny drag-lib** for reorder — to ikon-knapper (opp/ned) per rad, som
  kaller `reorderDrills` med en ombyttet id-rekkefølge. Matcher anti-scope
  («ingen ny dnd-lib»).
- **Område-select er gruppert med `<optgroup>`** (Full sving / Nærspill /
  Putt / Fysisk / Bane) i stedet for filtrert per valgt pyramide — enklere
  kode, og domenet håndhever ingen kobling pyramide→område (vokabular, ikke
  regel, jf. invariant 1).
- **«Tid» er `Drill.durationMinutes`** — domenet har ikke noe eget
  reps-felt (`RepType` finnes i `types.ts` men er ikke koblet til `Drill`),
  så «tid/reps» i oppdraget ble tid alene. Å legge til reps ville vært en
  domeneutvidelse utenfor denne loopens mandat.
- **«Lagre disabled til minimum»**: tittel (trimmet, ikke tom) og
  varighet > 0. Pyramide/område har alltid en gyldig default (arver øktens
  pyramide + første område), så de blokkerer aldri lagring — kravet var
  minimum, ikke tvungen aktivt valg.
- **Komplett/MANGLER er en ren visningssjekk** (`drillErKomplett`): tittel,
  varighet > 0 og `akFormel.label` til stede. Siden alle drills som går
  gjennom denne UI-en allerede er validert av `DrillInputSchema` (zod) i
  `wb-actions.ts`, er MANGLER-tilstanden i praksis en beskyttelse mot
  fremtidige kilder (Loop 2T: dra inn fra øvelsesbank) som ennå ikke går
  via samme validering — ikke noe som kan inntreffe i dagens flyt.

## Neste

Loop 2T (kilder, drag, serie). Ikke startet.
