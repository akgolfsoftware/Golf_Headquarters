# Prompt: CoachHQ Krysstabell — Sports Editorial × 3 enheter

> Lim inn `design.md` (Sports Editorial design system) FØRST som kontekst.
> Deretter denne prompten. Claude Design leverer én HTML-fil med desktop,
> iPad og iPhone stablet vertikalt.

---

## Slik bruker du dette i Claude Design

1. Åpne https://claude.ai/new (Sonnet 4.6 eller Opus, design-mode/artifacts aktivert)
2. Lim inn HELE innholdet av `design.md` (Sports Editorial design system)
3. Trykk Enter to ganger
4. Lim inn prompten under (alt fra og med `---` til slutten)
5. Claude Design leverer komplett HTML
6. Lagre som `_outputs/09-coachhq-krysstabell.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-atleter.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (bruk OFTE)
- Typografi-glyfer som ikoner (ikke SVG-tegninger)
- Magazine spread-feel, ikke uniform dashboard-grid
- Forest green sparsomt som signatur, lime maks ÉN flate per skjerm
- Norsk locale (komma desimal, ikke-brytbar mellomrom, +/− fortegn)
- Editorial tone — observerende italic-fragmenter, aldri "Velkommen tilbake"

# SKJERM: CoachHQ Krysstabell (3 enheter)

URL: `/admin/analyse?view=krysstabell`

## Demo-bruker (faktiske data)

**Anders Kristiansen** — Head Coach, AK Golf Academy.

Dette er ikke spillerens portal. Dette er **redaksjonsrommet** — Anders som
analyserer treningsfordeling for sine elite-utøvere. Han er "redaktøren" som
leter etter hullene i utgaven før den går i trykken.

**Aktiv spiller i analysen:** Øyvind Rohjan (19 år, HCP +3,5, hjemmebane GFGK).

Brukerspørsmål når Anders åpner Krysstabell:
*"Hvilket treningsområde har Øyvind trent som hvilken pyramide-type —
og hvor er hullene?"*

Tone: **Redaksjonell granskning.** Anders som magasin-redaktør med rød penn.
Krysstabellen er artikkelen hans — hver celle en linje han kan markere.
Italic-annotasjoner som om Anders selv noterer i margen: *"Her ligger gapet."*

## Kjerne-innsikten (forstå dette først)

Krysstabellen viser **minutter per kombinasjon av to dimensjoner**.
Standard-visning: **Treningsområde × Pyramide**.

Samme treningsområde kan trenes som tre helt ulike treningssignaturer:
- *Tee Total* som **TEK · L-KROPP · M0** = Teknikk-trening (range, isolert)
- *Tee Total* som **SLAG · L-AUTO · M2** = Golfslag-trening (Trackman-simulator)
- *Tee Total* som **SPILL · L-AUTO · M4** = Driving på bane (live spill)

Tre signaturer. Samme område. Det er kjerne-innsikten Anders leter etter.
Krysstabellen gjør usynlig fordeling synlig.

## Realistiske data (siste 90 dager — Øyvind Rohjan)

**Aktive treningsområder × pyramide (minutter):**

| Område | FYS | TEK | SLAG | SPILL | TURN | TOTAL |
|---|---|---|---|---|---|---|
| TEE TOTAL | 30 | 240 | 360 | 120 | 30 | 780 |
| INN 200m | 0 | 180 | 90 | 60 | 0 | 330 |
| INN 150m | 0 | 120 | 60 | 90 | 0 | 270 |
| INN 100m | 0 | 90 | 45 | 60 | 0 | 195 |
| INN 50m | 0 | 60 | 30 | 45 | 0 | 135 |
| CHIP | 15 | 90 | 30 | 60 | 0 | 195 |
| PITCH | 0 | 60 | 15 | 45 | 0 | 120 |
| LOB | 0 | 30 | 0 | 15 | 0 | 45 |
| BUNKER | 15 | 45 | 15 | 30 | 0 | 105 |
| PUTT 0-3 | 0 | 90 | 0 | 60 | 30 | 180 |
| PUTT 3-5 | 0 | 60 | 0 | 45 | 15 | 120 |
| PUTT 5-10 | 0 | 45 | 0 | 30 | 0 | 75 |
| PUTT 10-15 | 0 | 30 | 0 | 30 | 0 | 60 |
| PUTT 15-25 | 0 | 15 | 0 | 30 | 0 | 45 |
| PUTT 25-40 | 0 | 0 | 0 | 30 | 0 | 30 |
| PUTT 40+ | 0 | 0 | 0 | 15 | 0 | 15 |
| **TOTAL** | **60** | **1155** | **645** | **765** | **75** | **2700** |

Totalt: 2 700 min = 45 timer på 90 dager = ca. 30 min/dag.

**Heatmap-fargesteg (6 trinn):**

| Min | Farge | Tekst |
|---|---|---|
| 0 | var(--ak-muted) #F1EEE5 | var(--ak-muted-fg) — *"ingen data"* |
| 1-30 | #ECF5C2 (lys lime) | ink |
| 31-90 | #B7C97D (olivengrønn, samme som SPILL-pyramide) | ink |
| 91-180 | #5C8C5C (middels forest) | cream |
| 181-300 | #2A7D5A (mørkere forest, samme som SLAG-pyramide) | cream |
| 301+ | #003B2A (forest-deep) | cream |

**3 Caddie-funn (auto-generert innsikt):**

1. *"TEE-trening domineres av SLAG (50%). For elite-amateur kan TEK-fokus
   (nå 33%) løfte konsistens."*
2. *"PUTT 5-10 ft har bare TEK-trening (45 min) siste 90d.
   Kritisk make-distance — vurder mer Spill-press."*
3. *"Ingen TEK på PUTT 25-40 ft. Lag-distansene styres av Spill alene."*

**Periode:** 17. februar 2026 → 17. mai 2026 (90 dager).

**Editorial-fragmenter Anders kan skrive i margen:**
- *"Her ligger gapet."*
- *"Ingen TURN-trening på approach."*
- *"Hvor er pressen?"*
- *"Range, range, range — null bane på lange putts."*
- *"Tre signaturer for samme område. Velg."*

---

## STRUKTUR — 4 spreads kombinert

Bruk **4 spread-arketyper** fra design.md seksjon 12:

1. **Cover** (Arketype A) — editorial åpning med italic-fragment
2. **Workshop** (Arketype F) — toolbar som "redaksjonsstabben"
3. **Atlas** (Arketype H) — heatmap-tabellen, hovedflate
4. **The Quote** (Arketype D) — 3 Caddie-funn som pull-quotes

Sliding panel (åpen state vist) på desktop.
Bottom-sheet på iPhone.

Footer/kolofon nederst.

---

## DESKTOP 1440×900

### Layout

12-col med sidebar TOC permanent venstre (280px).

**Sidebar TOC (CoachHQ-versjon):**
```
AK GOLF HQ · COACH
Utgave 047 · 17.05

01  Hub
02  Spillere
03  Økter
04  *Analyse*       ← aktiv
05  Drills
06  Plan

ANALYSE
↳ Oversikt
↳ *Krysstabell*    ← aktiv sub
↳ Trender
↳ SG-kobling
↳ Tidsbruk

SPILLERE
↳ *Øyvind Rohjan*  ← aktiv
↳ Markus Røinås
↳ Lukas Berg
↳ [+ 12 til]

Logout
```

**Main content (max 1080px):**

**Spread 1 — Cover (12-col), kompakt høyde:**

- Eyebrow: `KRYSSTABELL · ANALYSE · ØYVIND ROHJAN · 17.05.2026 · 08:14`
- Cover-tittel (Instrument Serif italic, 88px — litt mindre enn dashboard
  fordi dette er analyseverktøy, ikke hovedside):
  ```
  Hvor trenes hva
  *trent som hva?*
  ```
- Lead-paragraf (Geist 17px, max-width 620px):
  *"Hvert treningsområde kan trenes som tre helt ulike signaturer:
  teknikk, golfslag, eller spill. Krysstabellen viser hvor minuttene
  faktisk har gått siste 90 dager."*
- Til høyre: stat-block-trio (horizontal):
  ```
  2 700     16 / 16      5 / 5
  MIN TOTAL  OMRÅDER      PYRAMIDER
  ```

**Spread 2 — Workshop / Toolbar (sticky 8+4):**

Sticky-bar som ligger under cover. Editorial-stil, ikke standard toolbar:

```
REDAKSJONSSTABBEN — SISTE 90 DAGER

[ Øyvind Rohjan ▾ ]   01  *Spiller*
                      02  *Dimensjon*
[ Område × Pyramide ▾ ]   03  *Periode*
                          04  *Eksport*
[ 17.02 → 17.05 ▾ ]

Preset:  [ × Pyramide ]  [ × Miljø ]  [ × L-fase ]  [ × Komponent ]

                                         [ Eksporter rådata → ]
```

Specs:
- Sticky position med subtil hairline-bunn
- Filter-chips i pill-form (4 presets som "*Hvor henter du tallene fra*"-valg)
- Spiller-velger: dropdown med portrait-avatar 24px + navn
- Dimensjon-velger: dropdown med italic-label "*Område × Pyramide*"
- Periode-velger: JBM dato → dato med kalender-ikon
- Eksport: secondary pull-tab høyre

**Spread 3 — Atlas / Heatmap (12-col):**

Hovedflaten. Tabell uten ramme rundt, kun hairline-rader.

```
TRENINGSOMRÅDE × PYRAMIDE       MINUTTER · SISTE 90 DAGER

                FYS    TEK    SLAG   SPILL   TURN    →TOTAL

Tee Total       30     240    360    120     30      780
                                ↑*Her ligger gapet.*
Inn 200m         0     180     90     60      0      330
Inn 150m         0     120     60     90      0      270
Inn 100m         0      90     45     60      0      195
Inn 50m          0      60     30     45      0      135
─────
Chip            15      90     30     60      0      195
Pitch            0      60     15     45      0      120
Lob              0      30      0     15      0       45
Bunker          15      45     15     30      0      105
─────
Putt 0-3 ft      0      90      0     60     30      180
Putt 3-5 ft      0      60      0     45     15      120
Putt 5-10 ft     0      45      0     30      0       75
                       *Kritisk make-distance.*↗
Putt 10-15 ft    0      30      0     30      0       60
Putt 15-25 ft    0      15      0     30      0       45
Putt 25-40 ft    0       0      0     30      0       30
Putt 40+ ft      0       0      0     15      0       15
═════
↓TOTAL          60    1155    645    765     75    2 700
```

Specs:
- Rad-label venstre: Geist 14px, italic Instrument Serif på underseksjonsbrudd
  (Inn-gruppe, kortspill-gruppe, putt-gruppe får hairline-divider mellom)
- Kolonne-header: Pyramide-tags som badges (pyramide-fargen)
- Celler: 64px × 40px, JetBrains Mono 16px tabular-nums, sentrert
- Fargesteg per spec over (6 trinn cream → forest-deep)
- Nullceller: muted bakgrunn, muted-fg "0" (eller ren tom — vurder begge,
  vis nullceller med dempet "0" for å vise at det ER null, ikke missing)
- Total-rad nederst: ink-stroke 1px over, JBM bold-feel (500), tabular-nums
- Total-kolonne høyre: samme prinsipp
- Hover på celle: scale(1.02), tooltip med "X min · Y drills · siste: Z. mai"
- Klikk på celle: åpner sliding panel høyre (se Spread 4)
- 2 marginalia-pilannotasjoner: SVG-piler med italic-tekst som peker på
  spesifikke celler (Tee × SLAG, Putt 5-10 × TEK)

**Sliding panel (åpen state vist høyre, 400px bred):**

```
[×]

TEE TOTAL × SLAG
360 MIN · SISTE 90 D

*Drilling på Trackman-simulator. Auto-press,*
*M2-miljø, L-AUTO-fase.*

DETALJER

08.05  •  45 min  •  GFGK Sim  •  L-AUTO M2
05.05  •  60 min  •  GFGK Sim  •  L-AUTO M2
01.05  •  30 min  •  Hjemme Sim •  L-AUTO M1
28.04  •  45 min  •  GFGK Sim  •  L-AUTO M2
24.04  •  60 min  •  GFGK Sim  •  L-AUTO M2
20.04  •  45 min  •  GFGK Sim  •  L-AUTO M3
16.04  •  30 min  •  Hjemme Sim •  L-AUTO M1
...

Fra 10 økter siden 17.02.

[ Se alle 10 økter → ]
[ Foreslå plan-justering ]
```

Specs:
- Slide fra høyre med transform translateX (300ms ease-out)
- Cream-bakgrunn med shadow-3 venstre
- Padding 32px
- Pyramide-tag (SLAG) som badge øverst
- Stat-tall "360 MIN" som Stat Large (72px JBM)
- Italic-paragraf forklarer hva kombinasjonen betyr
- Liste av økter: JBM dato + min + sted + L-fase/M-nivå-tags
- 2 pull-tabs nederst (primary + secondary)

**Spread 4 — Caddie-funn / 3 Pull Quotes (8+4 stack):**

```
INNSIKTER — KURATERT AV AK CADDIE

│
│   *TEE-trening domineres av SLAG (50%).*
│   *For elite-amateur kan TEK-fokus*
│   *(nå 33%) løfte konsistens.*
│
│   — AK CADDIE · BASERT PÅ 47 ØKTER

│
│   *PUTT 5-10 ft har bare TEK-trening (45 min)*
│   *siste 90 dager. Kritisk make-distance —*
│   *vurder mer Spill-press.*
│
│   — AK CADDIE · 14 PUTT-ØKTER ANALYSERT

│
│   *Ingen TEK på PUTT 25-40 ft.*
│   *Lag-distansene styres av Spill alene.*
│
│   — AK CADDIE · LAG-RATE 18%

[ Generer plan-justering →  ]   [ Drøft med Anders ]
```

Specs:
- 3 pull-quotes stablet vertikalt med 48px luft mellom
- Forest accent-strek venstre på hver
- Pull Quote 28-32px italic Instrument Serif (litt mindre enn standard 44px
  fordi vi har 3 stk på rad)
- Attribusjon: "— AK CADDIE · [meta-data]"
- 2 pull-tabs nederst (lime + secondary) — lime fordi dette er
  "AI-anbefaling-handling" og krever oppmerksomhet (eneste lime-flate)

**Kolofon nederst:**
```
AK GOLF HQ · COACH · Krysstabell · Utgave 047 · 17.05.2026
Redaktør: Anders Kristiansen · Datakilde: 47 økter loggført 17.02 → 17.05
```

---

## IPAD 1024×768 (landscape)

### Layout

Top-tab nav (48px). Heatmap-kolonner krymper, sliding panel blir overlay.

```
┌────────────────────────────────────────────────────────────┐
│ AK GOLF HQ · COACH · 17.05 · 08:14              🔍       │ ← 56px masthead
├────────────────────────────────────────────────────────────┤
│ [HUB][SPILLERE][ØKTER][*ANALYSE*][DRILLS][PLAN]            │ ← 48px tabs
├────────────────────────────────────────────────────────────┤
│                                                              │
│ COVER kompakt (72px italic-tittel)                          │
│ "Hvor trenes hva *trent som hva?*"                          │
│ + stat-trio inline (2 700 min · 16/16 · 5/5)                │
│                                                              │
│ TOOLBAR (sticky)                                             │
│ [Øyvind ▾] [Område×Pyramide ▾] [17.02→17.05 ▾]  [Eksport→] │
│ Preset: [×Pyr] [×Miljø] [×L-fase] [×Komponent]              │
│                                                              │
│ HEATMAP (kondensert — 48px celler i stedet for 64)         │
│ Rad-label krympes til 13px Geist                           │
│ Total-rad og kolonne beholdes                              │
│                                                              │
│ Klikk på celle → modal-overlay (ikke side-panel)            │
│                                                              │
│ ─────                                                        │
│                                                              │
│ 3 CADDIE-FUNN som pull-quotes, 24px italic                  │
│ Stack vertikalt (ikke side-by-side)                         │
│                                                              │
│ [ Generer plan-justering → ]                                 │
│                                                              │
│ KOLOFON                                                      │
└────────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 72px (var 88)
- Heatmap-celler: 48px × 36px (var 64×40)
- Rad-label: 13px (var 14)
- Pyramide-tags i kolonne-header: 28px høyde (var 32)
- Sliding panel → modal-overlay (centered, 640px bred)
- Pull-quotes: 24px (var 28-32)
- Touch-targets min 44px
- ⌘K erstattes med søke-ikon
- Marginalia inline (under heatmap som footnote-style) i stedet for piler
  som peker på celler — for trangt med piler på 48px-celler

---

## IPHONE 393×852 (iPhone 15)

### Layout

Bottom tab-bar (56px). Heatmapet er den vanskeligste delen — løses som
**vertikal celle-liste** sortert etter minutter, med toggle mellom
"Liste" og "Heatmap (scroll)".

```
┌───────────────────────────┐
│ KRYSSTABELL · ØYVIND  🔍 │ ← 44px running head
├───────────────────────────┤
│                            │
│ ANALYSE · 17.05 · 08:14   │
│                            │
│ Hvor trenes hva            │
│ *trent som hva?*           │ ← 44px italic
│                            │
│ Siste 90 dager.            │
│ 16 områder × 5 pyramider.  │
│ 2 700 min totalt.          │
│                            │
│ ─────                      │
│                            │
│ TOOLBAR (kollapsbar)       │
│ [ Øyvind Rohjan ▾ ]        │
│ [ Område × Pyramide ▾ ]    │
│ [ 17.02 → 17.05 ▾ ]        │
│                            │
│ Preset (horizontal scroll):│
│ [×Pyr][×Miljø][×L-fase]... │
│                            │
│ ─────                      │
│                            │
│ VISNING                    │
│ [ Liste ] [ Heatmap → ]    │ ← Segmented toggle
│                            │
│ ─────                      │
│                            │
│ TOPP-KOMBINASJONER         │
│ Sortert: mest → minst min  │
│                            │
│ ┌─────────────────────┐    │
│ │ TEE TOTAL × SLAG    │    │ ← Editorial card
│ │                     │    │
│ │ 360                 │    │
│ │ MIN                 │    │
│ │                     │    │
│ │ *Trackman-sim, auto*│    │
│ │ *M2. 10 økter.*     │    │
│ │                     │    │
│ │ [Heatmap-fargestrek]│    │ ← Visuell "celle-farge"
│ └─────────────────────┘    │
│                            │
│ ┌─────────────────────┐    │
│ │ TEE TOTAL × TEK     │    │
│ │ 240 min · 8 økter   │    │
│ │ [farge-strek]       │    │
│ └─────────────────────┘    │
│                            │
│ ┌─────────────────────┐    │
│ │ INN 200m × TEK      │    │
│ │ 180 min · 6 økter   │    │
│ │ [farge-strek]       │    │
│ └─────────────────────┘    │
│                            │
│ [...flere kombinasjoner]   │
│                            │
│ HULL-LISTE (0-minutter)    │
│ *Kombinasjoner som ikke*   │
│ *har sett trening:*        │
│                            │
│ • TEK × INN 50m FYS        │
│ • LOB × FYS                │
│ • PUTT × FYS (alle distan.)│
│ • TURN × CHIP/PITCH/LOB    │
│                            │
│ ─────                      │
│                            │
│ AK CADDIE — 3 FUNN         │
│                            │
│ │ *TEE-trening domineres*  │
│ │ *av SLAG (50%). For*     │
│ │ *elite-amateur kan TEK-* │
│ │ *fokus løfte konsistens.*│
│ │ — AK CADDIE              │
│                            │
│ │ *PUTT 5-10 ft har bare*  │
│ │ *TEK-trening siste 90d.* │
│ │ *Vurder mer Spill-press.*│
│ │ — AK CADDIE              │
│                            │
│ │ *Ingen TEK på PUTT*      │
│ │ *25-40 ft. Lag styres*   │
│ │ *av Spill alene.*        │
│ │ — AK CADDIE              │
│                            │
│ ─────                      │
│                            │
│ KOLOFON                    │
│                            │
├───────────────────────────┤
│ [ Generer plan-justering →]│ ← Sticky CTA over tab-bar
├───────────────────────────┤
│ [Hub][Spil][An.][Plan][⋯] │ ← Bottom tab-bar 56px
└───────────────────────────┘
```

**Alternativ visning (når toggle = "Heatmap →"):**

```
┌───────────────────────────┐
│ ← Tilbake til liste        │
│                            │
│ HEATMAP — DRA SIDEVEIS →  │
│                            │
│ Tips: 16 rader. Pyramide-  │
│ kolonner krever horisontal │
│ scroll.                    │
│                            │
│  ┌──────────────────────► │ ← Horizontal scroll-container
│  │ Områ.  FYS TEK SLAG... │
│  │ Tee    30  240 360 ... │
│  │ I200    0  180  90 ... │
│  │ I150    0  120  60 ... │
│  │ ...                    │
│  ▼                         │
│                            │
│ (Pyramide-kolonner: 56px,  │
│  rad-label: 80px sticky    │
│  venstre)                  │
└───────────────────────────┘
```

**Tilpasninger fra desktop — iPhone-spesifikt:**
- Cover-tittel: 44px (var 88)
- **Hovedvisning: vertikal liste sortert etter minutter** (16 × 5 = 80
  kombinasjoner, vi viser topp 12 + "hull-liste" som tekstoppsummering)
- Editorial card per kombinasjon med:
  - Område + Pyramide-tag som tittel (i èn linje, italic-mono)
  - Stort tall (min) som Stat Hero 56px
  - Antall økter + italic-kontekst
  - Heatmap-fargestripe i bunn (4px høy) som visuell celle-indikator
- "Hull-liste" som plain-tekst-seksjon — viktig for Anders som leter etter
  gap, men ikke for plasskrevende cards på alle 0-cellene
- **Toggle til full heatmap:** segmented control. Klikk → ny visning med
  **horizontal scroll-container** der rad-label er sticky venstre (80px)
  og pyramide-kolonner scroller (56px hver). 16 rader × 5 kolonner kan
  scrolles, men brukeren ser tydelig hvor de er via sticky label.
- Sliding panel → bottom-sheet (slide opp 80% høyde, drag-handle øverst)
- Pull-quotes: 18-20px italic (var 28-32)
- Marginalia: skip piler, inline italic-tekst i stedet
- Bottom tab-bar: 4 hoved (Hub, Spillere, Analyse, Plan) + mer-knapp
- Sticky primær-CTA "Generer plan-justering →" over tab-bar

**Hvorfor liste-først på iPhone:**

Anders' kjerne-spørsmål er *"hvor er hullene?"* — det betyr å finne
EKSTREMENE (mye trening på ett, lite på et annet). Sortert liste viser
ekstremene umiddelbart. Heatmap er bedre til *"hvordan ligger fordelingen
total?"* — som er mindre kritisk på mobil. Vi gir begge, men prioriterer
liste som standard.

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Count-up** på "2 700 MIN"-stat (0 → 2 700, 800ms)
- **Heatmap-celler fade-in** stagger (per rad, 50ms delay/rad, 400ms hver)
- **Annotation-piler** tegnes inn med stroke-dashoffset (1200ms)
- **Pull-quotes** scale-up 0.96 → 1.0 (600ms)
- **Hover på celle** (desktop/iPad): scale(1.02) + tooltip
  ```
  TEE TOTAL × SLAG
  360 min · 10 økter
  Siste: 8. mai
  ```
- **Klikk på celle** (desktop): sliding panel høyre
- **Klikk på celle** (iPad): modal-overlay
- **Tap på card** (iPhone): bottom-sheet glir opp
- **Toggle Liste/Heatmap** på iPhone: crossfade 300ms
- **Hover på rad/kolonne-label**: highlight hele raden/kolonnen
  (subtil bg-muted overlay)
- **Preset-chip click**: heatmap re-rendrer med ny dimensjon-kombinasjon
  (200ms fade out → re-render → fade in)
- **Pulserende live-prikk** i eyebrow (2s loop)

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen).

**20+ kommandoer i kategorier — spesifikke for analyse-skjermen:**

**Bytt dimensjon**
- Område × Pyramide *(aktiv)*
- Område × Miljø (M0-M4)
- Område × L-fase (L-KROPP/L-AUTO/L-PRESS)
- Område × Komponent (fysisk/teknisk/taktisk/mental)
- Pyramide × L-fase
- Komponent × Pyramide

**Spillere**
- Bytt til Markus Røinås Pedersen
- Bytt til Lukas Berg
- Vis hele akademiet (aggregert)
- Sammenlign Øyvind med akademi-snitt
- Sammenlign Øyvind med Hovland (samme alder, ekstern referanse)

**Periode**
- Siste 7 dager
- Siste 30 dager
- Siste 90 dager *(aktiv)*
- Siden sesongstart (1. mars)
- Siden European Amateur ble bekreftet (15. mars)
- Egendefinert periode...

**Analyse**
- Vis kun ikke-nullceller
- Vis kun >60-min-celler
- Markér hull-kombinasjoner
- Vis fordeling som prosent (ikke minutter)
- Vis utvikling vs forrige periode (delta)
- Sammenlign med Anders' anbefalt fordeling

**Eksport**
- Eksporter rådata som CSV
- Eksporter heatmap som PDF
- Send rapport til Øyvind
- Lag plan-justering-utkast

**Plan**
- Foreslå plan-justering basert på funn
- Sett opp APP 150-200-prep-økt
- Lag PUTT 5-10 ft Spill-pressblokk
- Be Caddie generere balansert plan

**Hjelp**
- Hva betyr L-fase?
- Hva er Mac O'Grady-pyramiden?
- Snarveier

⌘K åpner med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke.

---

## EDITORIAL-ANNOTASJONER (kritisk for tonen)

Krysstabell er Anders' "artikkel" — han er redaktør med rød penn.

**Minst 3 marginalia-annotasjoner i HTML-en:**

1. **På Tee × SLAG-cellen (360 min)** — SVG-pil med italic:
   *"Her ligger gapet."*

2. **På Putt 5-10 ft × TEK-cellen (45 min)** — SVG-pil med italic:
   *"Kritisk make-distance. Hvor er pressen?"*

3. **På Putt 25-40 ft-raden** — italic-marginalia i venstre marg:
   *"Lag-distansene har null teknikk-trening. Bevisst valg?"*

På iPad vises disse som footnote-style **under** heatmapet.
På iPhone vises disse inline i editorial-cards eller "Hull-liste".

**Dato-stempel** øverst høyre på heatmap-spread:
`17.05.2026 · 08:14 · AK GOLF HQ · COACH`

**Coach-hånd** (Anders som har notert):
Liten italic-tekst i margen ved siden av Caddie-funn:
*"Vi tar plan-justering i mandagens 1-til-1."*
*— ANDERS · 17.05*

---

## OUTPUT-FORMAT

Lever **ÉN HTML-fil** med tre viewport-seksjoner stablet vertikalt:

```html
<section class="device device--desktop">
  <header class="device-label">Desktop · 1440 × 900</header>
  <div class="frame" style="width:1440px; height:900px; overflow:hidden;">
    <!-- Desktop layout med sliding panel åpen -->
  </div>
</section>

<section class="device device--ipad">
  <header class="device-label">iPad · 1024 × 768</header>
  <div class="frame" style="width:1024px; height:768px; overflow:hidden;">
    <!-- iPad layout med kondensert heatmap -->
  </div>
</section>

<section class="device device--iphone">
  <header class="device-label">iPhone 15 · 393 × 852 — Liste-visning</header>
  <div class="frame" style="width:393px; min-height:852px; overflow:hidden;">
    <!-- iPhone liste-visning (default) -->
  </div>
</section>

<section class="device device--iphone-alt">
  <header class="device-label">iPhone 15 · 393 × 852 — Heatmap-visning (alt)</header>
  <div class="frame" style="width:393px; min-height:852px; overflow:hidden;">
    <!-- iPhone heatmap horizontal scroll -->
  </div>
</section>
```

Hver `device-label` er Tiny (10px Geist caps tracking 0.1em).
Hver `frame` har subtil 1px border + 4px radius for å antyde device-mockup.

Mellom hver seksjon: 96px luft + en hairline-separator med italic label
"*— iPad-utgave —*" / "*— iPhone-utgave (liste) —*" /
"*— iPhone-utgave (heatmap) —*" centered.

Inkluder:
- Tailwind CDN inline
- Google Fonts CDN (Instrument Serif italic, Geist variable, JetBrains Mono)
- Lucide inline SVG der det trengs (kun UI-utility, ikke shot-icons)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående (komma desimal, NBSP-tusenskille)
- All interaktivitet fungerer
- Heatmap-cellene MÅ ha de 6 fargestegene riktig implementert
- Sliding panel på desktop MÅ vises åpen (state shown), ikke bare antydet

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som skiller dette fra et standard Excel-pivottabell** —
   hva som gjør krysstabellen editorial og ikke generic data-tool
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
3. **Hva du er usikker på** — hvor trenger du Anders' input? Spesielt:
   er liste-først-iPhone-løsningen riktig, eller bør standardvisningen
   være horizontal scrollende heatmap?
