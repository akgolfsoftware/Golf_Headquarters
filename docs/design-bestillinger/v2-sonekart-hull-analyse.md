# Claude Design-bestilling — Sone-kart, «Hvor taper du» (Hull-analyse)

> Skrevet 2026-07-19. Gap-regel (`.claude/rules/beslutninger.md` → design-system-regel.md):
> finnes ikke mønsteret i v2-kanon, skal gapet meldes formelt — ikke improviseres. Dette gapet er
> nevnt løst i prosa flere ganger i `docs/MASTER-SKJERMPLAN.md` (rad 154, 676, 837) siden 17. juli,
> men har frem til nå manglet en faktisk bestilling. Denne filen er det.
>
> **Til Anders:** lim denne inn i Claude Design-prosjektet under `ui_kits/v2/` (retning C, fase 6 —
> IKKE v13-kit-et som D1/D4/D6-bestillingene under er skrevet mot). Leveranse: `ui_kits/v2/`-mockup
> + `tokens/v2/` der nytt trengs, i samme format som resten av v2-biblioteket.

## Hvorfor dette IKKE er løst med gjenbruk (undersøkt, ikke antatt)

Skjermen `/portal/analysere/hull` («Sone-kart»-fanen, `SoneFane` i
`src/components/portal/v2/AnalysereHullV2.tsx`) viser i dag SG + treningsdata som en tekst-/
stolpe-komposisjon (`SgKategorier` + `Rad`/`MiniSpark`) — INGEN visuell bane. Før denne bestillingen
ble to eksisterende «top-down banekart»-mønstre i kodebasen vurdert og forkastet:

1. **`HoleAnalysis`** (`src/components/hole-analysis/hole-analysis.tsx`, golfdata/v13). Illustrativt
   foto (`public/images/akademy/hull-ovenfra.jpg`) med prosent-posisjonerte markører per
   avstandsbånd, trykk åpner bunn-sheet med SG/økter/minutter/sparkline. Dette er PRESIS den
   interaksjonen «Sone-kart» skal ha — men komponenten er kun brukt i komponent-galleriet
   (`/intern/komponenter/hull-analyse`) med hardkodede demo-data. Den er ALDRI koblet til ekte
   spillerdata, har ingen v2-motpart, og er golfdata/v13 (overgangs-laget) — å bygge en ny stor
   flate mot v13-kitet er eksplisitt utenfor mandatet nå (`design-system-regel.md`).
2. **`CourseMap`** (`src/components/gameplan/course-map.tsx`, Mapbox GL, bygget for Gameplan/B30
   + slag-wizard D6b). Ekte satellittkart med GeoJSON-banegeometri og ekte GPS (`teeLat/teeLng`,
   `Shot.startX/Y/endX/Y` tolket som WGS84 i `src/lib/gameplan/shot-coords.ts`). Denne dekker IKKE
   behovet: den er bygget for étt hull på én navngitt bane med kartlagt geometri (krever
   `NEXT_PUBLIC_MAPBOX_TOKEN` + at banen har GeoJSON), mens «Sone-kart» skal oppsummere spillerens
   SG PÅ TVERS AV ALLE runder/baner spilleren har spilt (samme datakilde som i dag: siste 8
   `BrukerSgInput`-rader, ikke bundet til én bane). Å vise et ekte satellittkart for en aggregert,
   bane-uavhengig oversikt ville dessuten være misvisende (antyder én spesifikk økt/bane som ikke
   finnes) — i strid med «ærlige tomrom, ingen fabrikkerte tall»-prinsippet.

Konklusjon: ingen av de to dekker behovet 1:1. Sone-kart trenger et NYTT v2-mønster: illustrativt
(ikke geo-bundet), men med v2s visuelle språk og v2s tap/hover-popover-vokabular (se
`HjelpTips`/`VarmeKart`-cellene i `src/components/v2/hjelp.tsx` / `datavis.tsx` — begge har nettopp
fått et tap-sikkert popover-mønster, 2026-07-19, som denne nye komponenten bør gjenbruke).

## Hva skjermen skal vise

Rute: `/portal/analysere/hull`, fane «Sone-kart» (`SoneFane`). PlayerHQ, alltid lyst tema,
mobil-først 390 px (desktop sekundært, samme komposisjon sentrert).

Et illustrativt, ikke-geografisk top-down-diagram av «veien fra tee til hull» — samme idé som
dagens `HoleAnalysis`, men v2-visuelt og koblet til EKTE spillerdata (ikke bane-spesifikk, siden
datagrunnlaget er aggregert på tvers av runder). Soner langs banen, trykkbare:

- Tee-total (OTT)
- Innspill (APP) — kan ev. deles i avstandsbånd hvis en fremtidig domenefunksjon regner SG per
  bånd fra `Shot`-tabellen (se «Åpne spørsmål» under — IKKE forutsett i dagens datagrunnlag)
- Nærspill (ARG)
- Putt (PUTT)

Trykk/tap på en sone åpner en liten flytende forklaring ELLER et bunn-sheet (design avgjør hvilket
passer v2s tetthet best) med: SG-verdi (`fmtSg`), trend (`MiniSpark`-mønster), økter + minutter
siste 30 dager. Samme informasjon som `Rad`-listen under dagens `SoneFane` viser i dag — kartet er
en ALTERNATIV visualisering av SAMME data, ikke ny funksjonalitet.

## Datakontrakt (LÅST — dette finnes allerede, ingen ny backend kreves for v1)

```
HullSone = {
  id: "tee" | "app" | "arg" | "putt"
  kode: "OTT" | "APP" | "ARG" | "PUTT"
  label: string           // "Tee total" / "Innspill" / "Nærspill" / "Putt"
  sub: string
  sg: number | null       // siste registrering, Broadie scratch-baseline
  trend: number[]         // eldste → nyeste, kan være tom
  okter: number           // trening siste 30 dager
  minutter: number
}
```

Kilde: `src/app/portal/analysere/hull/page.tsx` (uendret) — `BrukerSgInput` (siste 8, snudd for
trend) + `TrainingPlanSession` per `skillArea`. Kun 4 soner i dag (ikke avstandsbånd).

**Ikke i dagens datagrunnlag** (kun til orientering, ikke en del av v1-bestillingen): `Shot`-
tabellen har `startX/startY/endX/endY` (GPS, `src/lib/gameplan/shot-coords.ts`) og `HoleScore`
(`holeNumber, par, strokes`) — disse KUNNE i teorien gi en mer granulær avstandsbånd-inndeling
(som gamle `HoleAnalysis`-demoen viser), men det krever en ny domenefunksjon i
`src/lib/domain/` som ikke finnes, og er en egen beslutning Anders må ta (se under).

## Interaksjoner

- Trykk/tap på en sone → viser sonens tall (samme popover-prinsipp som `HjelpTips`/`VarmeKart`:
  ekte hover-enhet åpner ved museover, touch åpner/lukker ved trykk, Escape/fokus-tap lukker).
- Ingen sone er noensinne «låst» eller sperret — kun visning, ingen handling som blokkerer.
- Tom-tilstand: ingen SG-registreringer → dagens `TomTilstand`-mønster («Ingen SG-registreringer
  ennå»), ALDRI et tomt/dødt kart.
- «?»-regelen: kartet trenger en `HjelpTips`-nøkkel (forslag: `soneKart`) i
  `src/lib/v2/hjelpetekster.ts` som forklarer hva sonene betyr — legges til når komponenten bygges.

## Referanser (nærmeste eksisterende mønstre å tegne mot)

- **Interaksjon/informasjonsarkitektur:** `HoleAnalysis` (`src/components/hole-analysis/
  hole-analysis.tsx`) — marker → bunn-sheet med SG/økter/minutter/sparkline. Kun som REFERANSE for
  UX-mønsteret, ikke som byggeklosser (golfdata, ikke v2).
- **v2-datavokabular å komponere fra:** `SgKategorier`, `MiniSpark`, `Rad`, `VarmeKart`-cellenes nye
  tap/hover-popover (alle i `src/components/v2/datavis.tsx` / `core.tsx`), `HjelpTips`
  (`src/components/v2/hjelp.tsx`).
- **Hvis Anders ønsker et ekte geografisk kart i stedet for illustrativt** (alternativ retning,
  krever egen beslutning): `CourseMap` (`src/components/gameplan/course-map.tsx`) er det
  eksisterende Mapbox-mønsteret — men da må omfanget snevres til ÉN runde/bane om gangen (ikke
  tvers-av-baner-aggregatet dagens Sone-kart-fane viser), og det krever at banen har kartlagt
  GeoJSON-geometri.

## Åpne spørsmål til Anders (design avgjør IKKE dette — trenger et «ja»)

1. Illustrativt banediagram (som i dag, bane-uavhengig, 4 soner) — eller invester i en ny
   domenefunksjon som regner SG/avstandsbånd fra `Shot`-data for en mer granulær variant senere?
2. Popover (som `HjelpTips`/`VarmeKart`) eller bunn-sheet (som gamle `HoleAnalysis`) for sone-detaljen
   i v2s tetthet?

## Leveransekrav

1. Mobil 390 px komplett; desktop sentrert samme komposisjon.
2. Alle tilstander: normal, tom (0 registreringer), delvis (noen av de 4 sonene mangler `sg`).
3. Kun `tokens/v2/` — ingen rå hex. Norsk bokmål, «nærspill» aldri «kort spill».
4. Tap-sikker interaksjon (ikke `title`-only — se begrunnelsen i «Hvorfor dette ikke er løst»).
5. Anbefalinger, aldri sperrer: sonene er ren visning, ingen handling kan blokkeres av dem.
