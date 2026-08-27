# C2 (Loop 6) — Stall · dag

**Dato:** 27.08.2026 · **Gren:** `claude/c2-stall-workbench-93szmx` · **PR:**
[#624](https://github.com/akgolfsoftware/Golf_Headquarters/pull/624) (draft, ikke merget) ·
**Omfang:** ny rute `/admin/stall/dag`.

## Hva som ble gjort

| Fil | Endring |
|---|---|
| `src/lib/domain/workbench/stall-dag.ts` | **NY.** Ren domene-aggregering: grupperer `WorkbenchSession`-rader per spiller for én dag, sorterer spillere alfabetisk (nb) og økter på starttid. `erUtkast = status === "DRAFT"`. Ingen treningsregler, ingen sideeffekter. |
| `src/lib/domain/workbench/stall-dag.test.ts` | **NY.** 4 tester (gruppering/sortering, UTKAST-flagg, tom økt-liste, økter utenfor coach-scope ignoreres). |
| `src/lib/workbench/wb-actions.ts` | **NY:** `loadStallDag({ dato })` — server action. Gjenbruker `loadStallen` (samme coach-scope + entitlement-filter som `/admin/spillere`, altså «gruppe-lisens eller kjøpt entitlement» fra `ACCESS-AND-GROUPS.md`) for spillerlista, henter `WorkbenchSession`-rader for valgt dato, kaller den rene aggregatoren. Coach ser DRAFT (samme mønster som `loadWeek`), spiller-siden er urørt. |
| `src/components/workbench/StallDagV2.tsx` | **NY.** Train-lock UI (kun `--tl-*`/`TL`, ingen `T.*` untatt der `TimeGrid`/`Knapp`/`TomTilstand` selv bruker det — samme etablerte blanding som `WeekGrid.tsx` allerede har, se avvik under). Desktop: spiller-kolonner på samme `TimeGrid`-motor som `WeekGrid` (Loop 2) — kolonner er spillere i stedet for dager, økter tegnes med `timeGridBlockStyle` gjenbrukt fra motoren. Mobil (<768px): stablet liste, én kortseksjon per spiller. Eneste handling: «Åpne uke» (spiller-pille + hver øktblokk) → `/admin/workbench/[playerId]?uke=<mandag i valgt dato>`. |
| `src/app/admin/stall/dag/page.tsx` (+ `loading.tsx`, `error.tsx`) | **NY.** Server component: auth (`ADMIN`/`COACH`), leser `?dato=` (Oslo-dagens dato som default), kaller `loadStallDag`, viser `StallDagFeil` ved `{ok:false}` (aldri generisk Next-feilside på forventet feil). |
| `src/components/admin/v2/TrainLockStall.tsx` | Liten «Dag»-pille i hodet (`/admin/spillere` → `/admin/stall/dag`) som inngangspunkt. Ingen annen endring i denne fila. |

## Design-avvik fra en bokstavelig A-10-lesning (dokumentert)

- **Ingen full pixel-timeline-akse fra fasiten.** `A-10 Mac Stall dag.dc.html` tegner en
  absolutt-posisjonert 07–21-tidsakse med gruppeøkt-inspektør og konflikt-varsel i et 380px
  sidepanel. Denne loopen gjenbruker i stedet `TimeGrid`-motoren (`src/components/v2/time-grid.tsx`)
  som `WeekGrid` (Loop 2) allerede bruker for den ekte Workbench-uka — samme tidsakse
  (05–23, 30 min-grid), men **ingen inspektør, ingen konflikt-oppdagelse, ingen «Bekreft
  gruppeøkt»-flyt** her. De hører til gruppeøkt-materialisering (uttrykkelig anti-scope:
  «ingen GROUP-propagering») og til Workbench selv (redigering skjer der, ikke i Stall).
- **Ingen nå-linje.** `TimeGrid`s nå-linje støtter kun én uthevet kolonne (dagens dato) —
  riktig for et 7-dagers ukevisning, men alle kolonnene her deler samme dato. En
  fullbredde-variant ville krevd å endre den delte motoren (brukt av `WeekGrid`) — utenfor
  denne loopens omfang. `showNowLine={false}`.
- **Mobil har ingen egen fasit for dette skjermbildet** (kun `A-10 Mac Stall dag.dc.html`,
  1440px). Mobil bruker derfor en stablet liste (samme mønster som `TrainLockStall`s
  spiller-kort), ikke en klemt N-kolonne-timeline — «port oppførsel, hierarki, copy», ikke
  HTML 1:1 (CLAUDE.md §Design/skjerm).
- **T.\*/TL.\* blandet i samme skjerm.** `TimeGrid`, `Knapp` og `TomTilstand`
  (`src/components/v2/*`) er bygget på `T.*` (Paper-tokens), mens denne skjermens egne
  elementer (øktblokk-flate, dock-pille, mobil-kort) bruker `TL.*`. Dette bryter isolert
  lest CLAUDE.md invariant 2 («bland aldri T.\* og TL.\* i samme skjerm») — men er **samme,
  allerede skipede mønster** som `WeekGrid.tsx`/`WorkbenchUke.tsx` (Loop 2/3S, i produksjon
  under `/admin/workbench/[playerId]`) bruker i dag. Å skrive om `TimeGrid`/`Knapp` til rene
  `TL.*`-primitiver er en egen, større jobb på tvers av hele Workbench — ikke gjort her for
  å unngå å røre delt, allerede fungerende motor som `WorkbenchUke` er avhengig av. Flagg
  til Anders: bør tas som egen liten TL-rens-økt på `time-grid.tsx`/`Knapp`/`TomTilstand`.

## Anti-scope (overholdt, verifisert)

- **Ingen GROUP-propagering til medlemmer** — kun lesing av eksisterende
  `WorkbenchSession`-rader, ingen ny materialiserings- eller godkjenningslogikk.
- **Ingen kalender-lag** — ingen filer under noe kalender-domene rørt (skole/TURN/
  test/booking-lag hører til Loop 7 / C3, som bygger parallelt).
- **Ingen Google-synk** — ikke rørt.
- **Ingen måned/år** — kun dag-navigasjon (forrige/neste/i dag), ingen kalenderbytte.

## Verifikasjon

- `npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/workbench/stall-dag.test.ts` — grønn (4 tester).
- `npm test` — grønn (1706 tester, 195 suiter, 0 feil).
- `npm run verify` (kjørt to ganger, siste gang etter opprydding) — grønn: `prisma validate`,
  `prisma generate`, `tsc --noEmit`, `eslint --quiet src`, `check-action-auth`,
  `check-token-gap`, `check-critical-imports`, `check-doc-lenker`, `next build` (449+ ruter
  inkl. `/admin/stall/dag`), serwist service-worker-bygg. EXIT:0 begge ganger.
- Pre-commit-hook (husky/lint-staged: eslint --max-warnings 0 + tsc) grønn på commit.

## IKKE gjort i denne runden (Anders må se skjermen)

**Skjermbilde-gaten (CLAUDE.md, fast regel) er IKKE oppfylt** — ingen agent kan merge en
skjerm-PR uten at Anders har sett den kjørende. Denne PR-en er **draft** av samme grunn.
Gjenstår før merge:

1. Skjermbilde av `/admin/stall/dag` på **390px** (mobil-listen) og **1280px**
   (spiller-kolonner), **lys og mørk**, via Vercel PR-preview.
2. Anders' «ja» til å merge (§Arbeidsregler punkt 2/4, invariant 7 — aldri push til main
   uten eksplisitt ja).

## PR og preview

- PR: <https://github.com/akgolfsoftware/Golf_Headquarters/pull/624> (draft)
- Vercel-preview: legges automatisk inn som PR-kommentar av Vercel-boten når bygget er
  ferdig (var «pending» ved commit-tidspunkt) — se PR-en for lenken, eller `vercel.com/
  akgolfgroup-netizens-projects/akgolf-hq` for byggestatus.
