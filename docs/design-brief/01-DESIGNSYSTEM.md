# AK Golf HQ — Designsystem (behold + utbedre)

> Det kanoniske byggesettet. Alle skjermer på alle flater komponeres fra disse 52 komponentene. **Du skal gjenbruke dem og utbedre dem der dette dokumentet sier «Refinement».** Ikke lag nye komponenter som gjør det samme som en eksisterende.

---

## 1. Tokens (fundament)

### Farger — lyst tema (PlayerHQ, Booking, Marketing)
| Token | HEX | Bruk |
|---|---|---|
| `background` | #FAFAF7 | Sidebakgrunn (varm cream, ALDRI #FFFFFF) |
| `foreground` | #0A1F17 | Primær tekst |
| `card` | #FFFFFF | Kortbakgrunn |
| `primary` | #005840 | CTA, fokusring, headere |
| `primary-foreground` | #D1F843 | Tekst på primary |
| `accent` | #D1F843 | Signatur-lime (highlights, KPI-puls) |
| `accent-foreground` | #005840 | Tekst på accent |
| `secondary` | #F1EEE5 | Sand, chips |
| `muted-foreground` | #5E5C57 | Sekundær tekst |
| `destructive` | #A32D2D · `success` | #1A7D56 · `warning` | #B8852A · `info` | #2563EB |
| `border` | #E5E3DD | 1px borders |

### Farger — mørkt tema (AgencyOS, `.dark`)
`background` #0F2A22 (forest, ALDRI svart) · `card` #163027 · `primary` = lime #D1F843 · lys tekst. Lime blir primær i mørkt — pass på lesbar kontrast (mørk tekst på lime-flate).

### Pyramide-akser (bunn → topp, mode-invariant)
`pyr-fys` #005840 · `pyr-tek` #B8852A · `pyr-slag` #2563EB · `pyr-spill` #D1F843 · `pyr-turn` #A32D2D. Rendres ALLTID bunn→topp (Fysisk → Teknisk → Golfslag → Spill → Turnering).

### Typografi — tre fonter, ingen flere
- **Inter** (`font-sans`) — UI, brødtekst. 14–16px, line-height 1.55, text-wrap pretty.
- **Inter Tight** (`font-display`) — display/hero + editorial italic. Italic på `<em>` i overskrift = alltid `text-primary`.
- **JetBrains Mono** (`font-mono`) — ALLE tall, eyebrows, KPI-labels.

### Spacing, radius, bevegelse
- 8pt-grid: `p-2/4/6/8/10/12/16`. **Unntak:** data-tette flater (AgencyOS-tabeller/timelines) kan bruke 12/14px der tetthet krever det.
- Radius: 8 / 12 / 16 / 20 / 24 / full.
- Bevegelse: 150–250 ms, ease-out inn, ease-in-out på state-endring. Aldri >400 ms utenom hero-reveal.

### Tall & casing (norsk bokmål)
Komma-desimal (`48,3`), mellomrom-tusenskille (`1 240 m`), prosent etter mellomrom (`48 %`), 24t-tid (`14:30`). Overskrifter: setningsstart. Eyebrows/KPI-labels: MONO CAPS. Knapper: setningsstart.

---

## 2. De 52 komponentene (8 grupper) + refinements

> «Refinement» = konkret utbedring du skal gjøre mens du gjenbruker komponenten. Resten beholdes som de er.

### Identitet & status (10)
`AthleticEyebrow` · `SectionHeader` · `AthleticAvatar` · `AthleticGreeting` · `PulseDot` · `PresenceDot` · `StatusPill` · `AthleticBadge` · `GhostNumber` · `Icon`
- **Refinement — StatusPill/AthleticBadge:** ett konsistent sett varianter overalt: `ok` (success) · `warn` (warning) · `urgent` (destructive) · `info` · `neutral` · `lime` (kun aktiv/«nå»). Aldri lime tekst på lime flate (bruk mørk tekst på lime).
- **Refinement — AthleticAvatar:** initialer avledes ALLTID fra fullt navn (ØR), aldri hardkodet. Lime-ring kun når «aktiv i dag».

### Knapper & handling (7)
`AthleticButton` · `QuickAction` · `FilterPillBar` · `ActionList` · `QueueItem` · `QueueList` · `ItineraryList`
- **Refinement — AthleticButton (viktig, løser en kjent inkonsistens):** tre størrelser — sm 36px/13px · md 44px/15px · lg 52px. Standardknapper: **radius-12, setningsstart, Inter** (rolig editorial). **Pill (full radius) reserveres** signatur-CTA, status-chips og filter-chips — ikke vanlige skjema-knapper. Varianter: `primary` (forest, lime tekst) · `accent` (lime, forest tekst) · `secondary` (sand) · `ghost`. Hover: `brightness-105` på lime, `bg-muted` på ghost. Aldri scale/lift. På mobil: min 44px høyde (touch).
- **Refinement — alle handlingslister:** hver rad har tydelig primær handling + «hva skjer videre» (ikke bare visning).

### Tall & KPI (5)
`KpiCard` · `KpiStrip` · `StatTile` · `KpiRing` · `Sparkline`
- **Refinement:** tall alltid JetBrains Mono tabular. Delta vises med fortegn + farge (success/destructive) + retning. Hold KPI-kort like høye i en strip (ikke la delta-wrap strekke ett kort).

### Kort (7)
`AthleticCard` · `FeaturedCard` · `InsightCard` · `TournamentCard` · `WellnessCard` · `PartnerCard` · `HubCard`
- **Refinement:** kort = hvit (lyst) / forest-600 (mørkt), border 1px, radius 16. FeaturedCard = forest-gradient + hvit tekst + mono-eyebrow i lime. Aldri frosted-glass som standardkort.

### Hero (3)
`PhotoHero` · `PageHero` · `DetailHero`
- **Refinement:** PhotoHero = foto + to gradient-lag (topp `from-black/40`, bunn `to-black/55`) for tekstkontrast. Aldri solid-farge-hero. PlayerHQ-hjem beholder profilbilde + tier-pill øverst.

### Data & analyse (10 + token)
`PyramidProgress` · `PyramidRadar` · `SgBar` · `SgTrendLine` · `RoundScorecard` · `HcpTrend` · `DataTable` · `ShotMap` · `ClubMetricGrid` · `TestMatrix` · `AXIS_COLOR`
- **Refinement — SG-visualisering:** positivt SG = over benchmark (grønn), negativt = under (rød). Vis alltid hvilken benchmark (PGA Tour / Team Norway). DataTable: tett, sorterbar, sticky header, nullstate.
- Disse er moaten — bruk dem rikelig i Analyse-flatene.

### Kalender & plan (6)
`DayCal` · `WeekGrid` · `MonthGrid` · `YearPlanGantt` · `PeriodTimeline` · `SessionScheduler`
- **Refinement — Workbench-kjernen:** `YearPlanGantt` (År) + `WeekGrid` (Uke) + `DayCal`/`SessionScheduler` (Økt) er de tre zoom-nivåene i Workbench. Dra-og-slipp flytter ekte tilstand (ikke overlay). Se `03-AGENCYOS` og `02-PLAYERHQ` for Workbench-flyten.

### Tilstander (3)
`EmptyState` · `Skeleton` · `SkeletonRows`
- **Refinement (gjelder HELE produktet):** hver dataflate MÅ bruke disse. Laster = skeleton-puls (aldri spinner). Tomt = EmptyState med én tydelig neste-handling. Dette er ofte det som skiller skisse fra lanseringsklart.

---

## 3. Harde regler (do / don't)

**Gjør:** gjenbruk komponenter · semantiske tokens · Lucide-ikoner (24px, 1.5px stroke, currentColor) · 1px borders · foto-hero med gradient · skeleton ved lasting · norsk tallformat · «du»-tiltale.

**Aldri:** nye fonter · hardkodet hex · emoji i UI · 2px borders (unntak: 2px fokusring) · solid-farge-hero · store flate lime-felt · scale/lift på hover · hype-språk («world-class», «revolutionary», «få din beste runde noensinne!!») · «De»/«spilleren» (bruk «du»).

## 4. Tilstander hver komponent skal ha (refinement-sjekkliste)
default · hover · aktiv/valgt · disabled · **laster (skeleton)** · **tomt (EmptyState)** · feil. Dette er den viktigste enkeltløftet fra «ser bra ut» til «lanseringsklart».

## 5. Tilgjengelighet (baseline)
Kontrast AA på tekst (pass spesielt på lime-flater → mørk tekst) · synlig 2px fokusring (`ring`) · touch-mål ≥44px på mobil · ikoner med aria-label · tastaturnavigerbare lister/menyer · `prefers-reduced-motion` demper animasjon.
