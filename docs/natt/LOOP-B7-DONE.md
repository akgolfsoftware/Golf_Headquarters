# LOOP-B7 — TrackMan DispersionMap (DONE)

Rad B7 fra `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` §5. Gren `feat/wb-b7-trackman`, fra
`main` (`49fadc01`). Bygger TM-11 (økt-detalj med DispersionMap), TM-08f (slag-ark fra
prikk), PH-01c/PH-01d (TrackMan-teaser på «I dag»), og tom-tilstand for få slag.

## Hva som ble bygget

| Fil | Hva |
|---|---|
| `src/lib/trackman/dispersion-map.ts` | Domenelogikk: `ONE_SIGMA_CONFIDENCE`/`TWO_SIGMA_CONFIDENCE` (1 − e^(−0,5) / 1 − e^(−2) — RIKTIG 2D-konfidens, ikke 68 %/95 %), `MIN_SHOTS_FOR_ELLIPSE = 8`, `computeTrackManDispersionMap()` (bøtte-klassifisering innenfor 1σ/1–2σ/utenfor 2σ via normalisert Mahalanobis-avstand, KPI-tall, caddie-setning). Gjenbruker `computeDispersion`/`trackmanToPoints` fra `src/lib/gameplan/dispersion.ts` — ingen ny kovarians/ellipse-matte |
| `src/lib/trackman/dispersion-map.test.ts` | 16 tester (node:test): konfidensverdier, MIN_SHOTS-grensen, bøtte-klassifisering, KPI-utregning, caddie-setning, tomt/manglende data |
| `src/lib/trackman/teaser.ts` | `getTrackManTeaser(userId)` — henter nyeste TrackMan-økt, kølla med flest gyldige slag, bygger PH-01c-setningen. Returnerer `null` (ikke throw) både når spilleren ikke har data OG når hentingen feiler — «I dag» skal aldri krasje på dette valgfrie kortet |
| `src/components/trackman/DispersionMap.tsx` | TM-11 hero: SVG scatter, 1σ/2σ-ellipse, stiplet mållinje (`TL.viz.target`), bias-pil (toggle, AV som standard), `DispersionBucketBar` (tre bøtter). Prikker er ALLTID `TL.viz.dot` uansett bøtte (per HANDOFF: bøtte-fargene brukes kun i baren, aldri per-prikk) |
| `src/components/trackman/ShotSheet.tsx` | TM-08f: bunn-ark (mobil/iPad) / fast 380px-panel (Mac ≥1101px, `TL_BREKK.macRail`) for ett valgt slag. Eget lite ark-skall (ikke `BunnArk`, som er T.*) |
| `src/components/trackman/TrackManSessionDetail.tsx` | Klient-komponent: CaddieLeak → KPI-stripe → DispersionMap → bøtte-bar → «Se alle slag» → tabell. Rekkefølgen er låst fra HANDOFF og ikke endret |
| `src/app/portal/analysere/trackman/[id]/page.tsx` | Ny kanonisk TM-11-rute. Auth: eier ELLER ADMIN/COACH (samme mønster som den gamle siden). `kreverTilgang: "TALENT"` (se §Avvik) |
| `src/app/portal/trackman/[sessionId]/page.tsx` | Legacy-redirect rettet fra `/portal/mal/trackman/[id]` til `/portal/analysere/trackman/[id]` |
| `src/components/portal/v2/chat/PortalChatHjem.tsx` | Ny `TrackManTeaserKort` (PH-01c) rendret rett under `WorkbenchIDagArtefakt`. Ny prop `trackman: TrackManTeaser \| null` — komponenten kalles ikke i det hele tatt når `null` (PH-01d: skjules helt) |
| `src/app/portal/page.tsx` | Henter `getTrackManTeaser(user.id)` parallelt med de andre kallene, sender som `trackman`-prop |

## Matematikk (verifisert)

`computeTrackManDispersionMap` kaller `computeDispersion(points, { confidence: ONE_SIGMA_CONFIDENCE })`
for 1σ og `{ confidence: TWO_SIGMA_CONFIDENCE }` for 2σ — IKKE default 0,95 (en annen
konvensjon brukt i Gameplan). Bøtte-klassifisering: normalisert avstand `m` fra senter
(invers rotasjon av ellipsens akser), `m ≤ 1` → innenfor 1σ, `1 < m ≤ 2` → 1–2σ, `m > 2` →
utenfor 2σ. Testet at 2σ-ellipsens halvakser er eksakt 2× 1σ sine (samme kovarians, k skalerer
lineært) — se `dispersion-map.test.ts`.

## Under 8 slag (MIN_SHOTS_FOR_ELLIPSE)

Ingen ellipse, ingen caddie-setning, ingen bøtte-bar. KPI-stripens «1σ» viser «—» med caps
«FRA 8 SLAG». Kartet viser prikker + stiplet mållinje og teksten «For få slag til ellipse.
Median står når n ≥ 5.» — verifisert med ekte 3-slags fixture (se §Verifikasjon).

## Tokens

Alle nye komponenter (`DispersionMap`, `ShotSheet`, `TrackManSessionDetail`, TM-11-siden)
bruker KUN `TL.*` (`src/lib/v2/train-lock.ts`) — ingen `T.*`. `#30D158`/`ok` er ikke brukt noe
sted i denne leveransen (kun `TL.viz.good` i bøtte-baren, som HANDOFF eksplisitt godkjenner
for «68 %-bøtte»-bruk — forskjellig fra den generelle Godta/PUBLISERT-reservasjonen).

## Avvik fra fasiten / beslutninger tatt underveis (meldes til Anders)

1. **PH-01c-kortet bruker `T.*`, ikke `TL.*`.** `PortalChatHjem.tsx` (hele «I dag»-skjermen)
   er IKKE Train-lock-portet ennå — CLAUDE.md sier eksplisitt «Selve skjermporten gjenstår
   (B8 = Player)». Å legge et `TL.*`-styrt kort inn i et ellers `T.*`-basert skjermbilde ville
   brutt regelen «bland aldri T.* og TL.* i samme skjerm» like mye som å la det stå i T. Jeg
   valgte å holde kortet i `T.*` for å matche resten av skjermen det faktisk lever på, fremfor
   å innføre den første TL-forekomsten midt i en T-skjerm. **Dette bør rettes i B8** når hele
   `PortalChatHjem` porter til Train-lock — da flyttes `TrackManTeaserKort` til `TL.*` sammen
   med resten av skjermen.
2. **`kreverTilgang: "TALENT"` på TM-11-siden**, ikke default `FULL`. `/portal/analysere/*` står
   allerede på talent-allowlisten (`src/lib/auth/talent-allowlist.ts` — «stats-lesing» er åpent
   for den gratis TALENT-profilen), og BUSINESS-RULES §317 sier «Analysere + TrackMan + Runder +
   SG er én flate med faner». Siden jeg la TM-11 under `/portal/analysere/trackman/`, håndhever
   `src/lib/__tests__/tilgang/portal-tilgang-kontrakt.test.ts` at nivået MÅ matche allowlisten —
   testen feilet først med default FULL, rettet til TALENT. Dette åpner TrackMan-detalj for
   gratisprofilen. Spør Anders om dette er riktig, eller om TrackMan-detalj bør være en FULL-only
   flate (i så fall må ruten flyttes UT av `/portal/analysere/*`, eller allowlisten strammes inn
   med et unntak for `/trackman/`-underruten).
3. **Ruten flyttet fra `/portal/mal/trackman/[id]` til `/portal/analysere/trackman/[id]`.**
   Den gamle Paper-porten (`src/app/portal/mal/trackman/[id]/page.tsx`) er IKKE slettet eller
   endret — den lever videre som egen, uendret side (nås fortsatt fra `/portal/mal/trackman`-
   listen). Kun `/portal/trackman/[sessionId]` (den generelle legacy-redirecten) peker nå til
   den nye TM-11-siden. To sider viser nå delvis overlappende innhold for samme økt — midlertidig
   tilstand til `/portal/mal/trackman`-listen selv porter til Train-lock og lenker til TM-11.
4. **Oppdaget IKKE et avvik, men en presisering**: «1σ»-KPI-tallet (`oneSigmaRadius`) er valgt
   som geometrisk snitt av halvaksene (`√(semiMajor · semiMinor)`) — en representativ sirkulær
   radius for en ellipse som normalt ikke er sirkulær. HANDOFF-testdataen (6 slag, 21.08) viser
   «1σ 4,2 m» i eksempelteksten, men uten fasitens rådata kunne jeg ikke verifisere tallet
   eksakt — formelen er matematisk begrunnet (se kommentar i `dispersion-map.ts`), men er et
   valg, ikke en avlest fasit-verdi.

## AgencyOS stall-preview (TM-10) — IKKE gjort

Oppgavebrevet markerte dette som lavest prioritet («kun hvis tid/scope tillater»). Ikke bygget.
`TM-10 Tom og agency-preview.dc.html` sin agency-del (72px kart i stall-rad, kilde-tag) er
fortsatt bare tegnet i designsystem/train-lock — ingen kode i `src/app/admin/**`.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npx tsc --noEmit` | grønn |
| `npx eslint --quiet` (berørte filer) | grønn |
| `npx tsx --test src/lib/trackman/dispersion-map.test.ts` | 16/16 |
| `npm run verify` (prisma validate/generate · tsc · eslint · action-auth · token-gap · critical-imports · build) | **grønn**, alle 449+ ruter bygget inkl. `/portal/analysere/trackman/[id]` |
| `npm test` | **1628/1628**, 185 suiter, 0 feil |

Full output lokalt: `/tmp/verify3.log`, `/tmp/verify4.log`, `/tmp/test2.log` (ikke committet).

**Manuell klikk-test er UTFØRT** (ikke bare typesjekket) — mot `akgolf-hq-dev`-preview,
innlogget som `screentest@akgolf.test` (passord fra `.env.local`, ikke skrevet av agenten inn
noe sted permanent), med en engangs-fixture (`scripts`-mønster, kun screentest-brukeren,
opprettet og SLETTET i samme økt — ingen spor igjen i databasen):

- **Golden path (≥8 slag, 10 slag på 7-jern):** CaddieLeak-setning «Klyngen ligger 3,4 m
  høyre. Sikt 3 m venstre, samme sving.» · KPI-stripe (Carry/Offline/1σ/Smash) · 1σ/2σ-toggle ·
  DispersionMap med ellipse + prikker + stiplet mållinje · bøtte-bar (40 % / 40 % / 20 %) ·
  «Se alle slag» · tabell · klikk på tabellrad åpner `ShotSheet` som bunn-ark på mobil
  («Slag 5 av 10», Avvik fra senter/Carry/Side/Smash/Launch) med valgt prikk markert hvit ring
  i kartet — screenshot-verifisert på 375×812 (mobil, mørkt tema, `/portal`-default).
- **Tom/få-slag-tilstand (3 slag):** ingen CaddieLeak, 1σ-KPI viser «—» med caps «FRA 8 SLAG»,
  sigma-toggle disabled, ingen bøtte-bar, kart viser prikker + mållinje uten ellipse, tekst
  «For få slag til ellipse. Median står når n ≥ 5.» — screenshot-verifisert.
- **PH-01c på «I dag»:** kortet «SISTE TRACKMAN · 7I · 21.8.» + caddie-setning + «Se
  spredning ›» rendres rett under Workbench-kortet når spilleren har TrackMan-data —
  screenshot-verifisert på `/portal`.
- **Ikke verifisert manuelt:** lys tema (appen brukte mørk default på `/portal`-ruter og jeg
  fant ingen rask temabryter på TM-11-sidens header i denne økten — tokenene er derimot
  theme-aware by construction, samme `TL.*`-mekanisme som resten av Train-lock), og
  Mac/iPad-brekkpunktet for `ShotSheet` (kun kodesjekket at `useErMac`/`TL_BREKK.macRail`
  bytter til side-panel-varianten — ikke faktisk screenshot på et bredt vindu i denne økten).
  PH-01c sitt klikk-gjennom til TM-11 ble ikke skjermbilde-bekreftet (koden er lest og riktig;
  selve navigasjonen timet ut på et verktøy-glipp i denne økten, ikke en app-feil — samme
  `href` er direkte verifisert å fungere ved direkte navigering til TM-11).

## Neste

- B8 (Train-lock design-pass Player) porter `PortalChatHjem` — flytt `TrackManTeaserKort` til
  `TL.*` da (§Avvik 1).
- Spør Anders om TALENT- vs. FULL-tilgang for TrackMan-detalj (§Avvik 2).
- `/portal/mal/trackman`-listen bør etter hvert lenke til TM-11 i stedet for sin egen
  `[id]`-side, og til slutt erstatte den — ikke gjort her (§Avvik 3).
- AgencyOS stall-preview (TM-10) — egen, mindre jobb.
