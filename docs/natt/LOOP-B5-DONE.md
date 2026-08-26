# LOOP-B5 — Kilder, drag, serie (DONE)

Session B5 fra `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` §5. Gren
`feat/wb-b5-kilder-serie`, worktree `wang-toppidrett-arsplan-d88725`, fra
`origin/main`. Scope: rad A-02c/A-04/A-04b/A-07/A-11/WB-07 — `loadSources` med
ekte innhold, drag fra kilder → uke, serie (gjenta + endre-policy).

Ingen fasit finnes for kilder/drag/serie i `docs/natt/workbench/` (kun den
historiske skissen i `store/actions.ts`, som eksplisitt sier "port fra
wb-actions.ts sitt mønster, aldri fra signaturene her"). Designet under er
derfor egen, minimal implementasjon i tråd med invariant 8 (enkelhet) —
ikke en portering av en tegnet skjerm.

## Additiv DDL — kjørt mot prod (ikke bare skrevet)

`scripts/add-workbench-series-template-2026-08-26.ts` — idempotent
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` på `workbench_sessions`:

- `seriesId text` (nullable) — deler alle forekomster av en "gjenta"-serie
- `seriesIndex integer` (nullable) — 0-basert rekkefølge i serien
- `isTemplate boolean NOT NULL DEFAULT false` — lagret som mal i kildepanelet

Pluss to indekser (`seriesId`, `(playerId, isTemplate)`). Kjørt mot
`DIRECT_URL` (kanonisk `dcnx…`-prosjekt, London) — verifisert med
`information_schema.columns` etter kjøring, alle tre kolonner til stede.
Ingen `migrate dev`/`db push`/`migrate deploy` brukt (gotcha). `.env.local` i
denne worktreen er en fungerende symlink til hovedmappens fil (ikke kopiert
inn av denne økten) — derfor kunne skriptet faktisk kjøres, ikke bare
forberedes.

## Kilder — `loadSources` (ekte innhold)

`src/lib/workbench/wb-actions.ts` + ny `src/lib/workbench/sources-map.ts`.
Tre grupper, alle lest med `kreverTilgangTilSpiller`-gate:

1. **Øvelsesbank** — `ExerciseDefinition` (SYSTEM + COACH/`COACH_PLAYERS` +
   egne). Modellen bruker IKKE det nye TrainingArea-vokabularet (den er
   skrevet mot NGF/DataGolf-kategorier) — mapping bruker derfor et nøytralt
   standard-område per pyramide (`STANDARD_OMRADE` i `sources-map.ts`);
   coach justerer i inspektøren etter å ha dratt drillen inn. Kjent,
   dokumentert forenkling — ikke en feil.
2. **Maler** — `WorkbenchSession` med `isTemplate = true`. Ny mekanisme
   (ikke `PlanTemplate`, som er den gamle modellen bygget på utgått
   `lPhase`-vokabular — bevisst IKKE brukt).
3. **Forrige uke** — `WorkbenchSession` for spilleren i uka før `weekStart`
   (nytt valgfritt param på `loadSources`, bakoverkompatibelt — mangler det,
   faller "forrige uke" tilbake på siste 7 dager før i dag/Oslo).

`SourceItem.id` koder kilden («drill:‹id›», «mal:‹id›», «forrige:‹id›») —
ingen egen kobling-tabell. `createSessionFromSource`/`addDrillFromSource`
slår opp via `parseSourceId`.

## Drag — kilder → uke

Bevisst **native HTML5 drag-and-drop**, ikke dnd-kit (som er en dependency,
men bygget for sortering/kollisjon — her trengs bare fri slipp-posisjon på en
åpen flate). Delt konvensjon i `src/components/workbench/wb-drag.ts`.

- `SourcesPanel.tsx` — kortene er nå `draggable`, gruppert per kilde-type
  (Øvelsesbank/Maler/Tidligere uker) med `UI.sourcesDrills` m.fl. (labels
  fantes allerede, ubrukt siden Loop 2-skallet).
- `src/components/v2/time-grid.tsx` — nytt valgfritt `onDropSlot`-prop på
  den delte `TimeGrid`-motoren (samme snap-logikk som `onEmptyClick`,
  additiv, ingen atferdsendring for andre forbrukere som ikke sender det).
- `WeekGrid.tsx` — sluppet på åpen flate i uka → `onDropSource` (ny økt fra
  kilden på nøyaktig dag/tid). Sluppet direkte på en eksisterende `OktKort`
  → `onDropDrillOnSession` (kun øvelser — mal/forrige-uke kan ikke slippes
  på en økt, kun på åpen flate).

Flytting av EKSISTERENDE økter er fortsatt inspektør-basert (Loop 2s
anti-scope, urørt) — dette er kun nye kilder inn i uka.

## Serie — "gjenta" + endre-policy

`src/lib/domain/workbench/operations.ts` (rene funksjoner, testet):

- `createSessionSeries(cmd, weeks)` — `weeks = 1` er identisk med
  `createSession` (ingen `seriesId`). `weeks > 1` lager N ukentlige
  forekomster, samme dag/klokkeslett hver uke, delt `seriesId`,
  `seriesIndex` 0..N-1.
- `sessionsMatchingPolicy(serie, gjeldendeId, policy)` — rent utvalg:
  `DENNE` (kun denne), `DENNE_OG_FREMOVER` (denne og alle med høyere
  `seriesIndex`), `HELE_SERIEN` (alle). **Dato/tid propagerer aldri** —
  hver forekomst beholder sin egen dag uansett policy.
- `applySeriesPatch(session, patch)` — slår sammen en innholds-patch
  (tittel/pyramide/blokktype/miljø/notater), aldri dato/tid.

Server actions (`wb-actions.ts`): `createSessionSeries`, `updateSeriesSession`
(generisk innholds-patch — klar til bruk, ikke koblet til et UI-felt ennå
utover det som beskrives under), `deleteSessionSeries`, `setSessionTemplate`.

**UI-kobling, bevisst minimal (enkelhet-invarianten):**

- **Opprette**: `CreateSessionModal` har fått et "Gjenta"-valg (1/2/4/6/8/12
  uker). > 1 → `createSessionSeries` i stedet for `createSession`.
- **Endre-policy**: koblet til `Slett` i `SessionInspector` — den mest
  konkrete, virkelige coach-handlingen som trenger policy (avlys denne og
  resten av serien fordi spilleren er skadet, e.l.). Er økten del av en
  serie, vises et policy-valg (Kun denne / Denne og fremover / Hele serien)
  rett over Slett-knappen, og Slett kaller `deleteSessionSeries` med valgt
  policy i stedet for `deleteSession`. `updateSeriesSession` (innholds-patch
  med policy) er bygget og testet i domenet, men har ikke fått et eget
  redigeringsfelt i inspektøren i denne runden — de eneste innholdsfeltene
  som i dag er redigerbare der (dato/start/varighet) propagerer bevisst
  ALDRI per design (hver forekomst eier sin egen tid).

## Mal — "Lagre som mal"

`SessionInspector` har fått en ghost-knapp ("Lagre som mal"/"Fjern som mal")
som kaller `setSessionTemplate`. Lagrede maler dukker opp i kildepanelet
under "Maler" for gjenbruk (drag inn igjen via `createSessionFromSource`).

## Filer

| Fil | Endring |
|---|---|
| `prisma/schema.prisma` | `seriesId`/`seriesIndex`/`isTemplate` + 2 indekser på `WorkbenchSession` |
| `scripts/add-workbench-series-template-2026-08-26.ts` | Ny — kirurgisk DDL, kjørt |
| `src/lib/domain/workbench/types.ts` | `RecurrencePolicy`, `SeriesContentPatch`, `UpdateSeriesSessionCommand`, `DeleteSeriesSessionCommand`, nye felt på `WorkbenchSession` |
| `src/lib/domain/workbench/schemas.ts` | `RecurrencePolicySchema`, `RepeatWeeksSchema`, `SeriesContentPatchSchema`, `UpdateSeriesSessionInputSchema`, `DeleteSeriesSessionInputSchema` |
| `src/lib/domain/workbench/operations.ts` | `createSessionSeries`, `sessionsMatchingPolicy`, `applySeriesPatch` |
| `src/lib/domain/workbench/operations.test.ts` | 8 nye tester (serie-opprettelse, policy-utvalg, patch) |
| `src/lib/domain/workbench/labels.ts` | Serie/mal/kilde-copy (norsk, samlet ett sted) |
| `src/lib/workbench/wb-map.ts` | Mapper `seriesId`/`seriesIndex`/`isTemplate` |
| `src/lib/workbench/sources-map.ts` | Ny — Prisma-rad → `SourceItem`, id-koding/parsing |
| `src/lib/workbench/wb-actions.ts` | `loadSources` (ekte), `createSessionSeries`, `createSessionFromSource`, `addDrillFromSource`, `updateSeriesSession`, `deleteSessionSeries`, `setSessionTemplate`; `createSession` refaktorert til delt `sessionOpprettelseData` |
| `src/components/v2/time-grid.tsx` | Nytt valgfritt `onDropSlot`-prop (additiv) |
| `src/components/workbench/wb-drag.ts` | Ny — delt native-DnD-konvensjon |
| `src/components/workbench/SourcesPanel.tsx` | Ekte innhold, gruppert, `draggable` |
| `src/components/workbench/WeekGrid.tsx` | `onDropSource`/`onDropDrillOnSession` |
| `src/components/workbench/CreateSessionModal.tsx` | "Gjenta"-felt |
| `src/components/workbench/SessionInspector.tsx` | Serie-policy ved sletting + "Lagre som mal" |
| `src/components/workbench/WorkbenchUke.tsx` | Kobler alle nye actions |
| `src/app/admin/workbench/[playerId]/page.tsx` | Sender `weekStart` til `loadSources` |

## Anti-scope (urørt)

`src/components/v2/shell.tsx` (T1-jobb), Google-synk, GROUP-materialisering,
main-merge.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npx tsx --test src/lib/domain/workbench/operations.test.ts` | 25/25 |
| `npm test` | **1619/1619**, 182 suiter, 0 feil |
| `npm run verify` (prisma validate/generate · tsc · eslint · action-auth · token-gap · critical-imports · build) | **grønn**, EXIT 0 |

**Manuell klikk-/dra-test er IKKE utført** — krever innlogging som coach i en
kjørende app; Claude skriver aldri Anders' passord (samme begrunnelse som
tidligere B-rader). Preview-lenken fra PR-en er veien til å se dra-og-slipp
og serie-flyten i praksis.
