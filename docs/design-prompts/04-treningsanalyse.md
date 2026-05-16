# Claude Design-prompter: TRENINGSANALYSE (6 visninger)

> Lim inn felles designspec fra `00-shared-spec.md` øverst.
> Krysstabellen (4.2) er Anders' nøkkelinnsikt — den må være BEST.

---

## Prompt 4.1 — Analyse-oversikt

```
[LIM INN 00-shared-spec.md]

## Skjerm: Treningsanalyse Oversikt
URL: /admin/analyse?view=oversikt
Bruker: Coach Anders eller spiller Markus (PlayerHQ-variant)

### Layout — tre-panel
CoachHQSidebar + AnalyseSidebar (280px) + Innhold

### AnalyseSidebar
- Spillervelger: "Markus R ▾"
- Periodevelger (chips): Siste 7d · 30d · 90d · Sesong · Egendefinert
- Visningsvelger (lenker, "Oversikt" aktiv):
  - ▸ Oversikt ✓
  - ▸ Krysstabell
  - ▸ Trender
  - ▸ SG-kobling
  - ▸ FYS-progresjon
  - ▸ Plan vs Faktisk
- Eksporter: [PDF] [CSV]

### Hovedinnhold

#### Header
- Eyebrow: "COACHHQ · ANALYSE · MARKUS R · SISTE 30 DAGER"
- Tittel: "Treningen *forteller en historie.*"
- Sub: "47 økter · 38t 12min · 78% snitt suksess · 12 dager trent av 30"

#### KPI-strip (5 kort)
1. Total tid: 38t 12min (+6t vs forrige periode, grønn)
2. Antall økter: 47 (3.1/uke)
3. Snitt CS: 73 (innenfor mål 70-80)
4. Snitt suksess: 78% (+4pp)
5. Streak: 12 dager (rekord 18)

#### Pyramide-fordeling (full bredde-kort)
Donut + tabell side-om-side:

**Donut (240×240px):** 5 segmenter
- FYS 12% (#003B2A)
- TEK 38% (#005840)
- SLAG 27% (#2A7D5A)
- SPILL 18% (#B7C97D)
- TURN 5% (#D1F843)

**Tabell høyre:**
| Pyramide | Tid | % | Økter | Δ vs forrige |
|---|---|---|---|---|
| FYS | 4t 35min | 12% | 8 | +0.5t |
| TEK | 14t 30min | 38% | 16 | +3.0t |
| SLAG | 10t 18min | 27% | 12 | +1.5t |
| SPILL | 6t 53min | 18% | 7 | +1.0t |
| TURN | 1t 55min | 5% | 4 | 0 |

#### Område-fordeling (horisontal stolpegraf)
16 treningsområder, fargekodet etter SG-kategori, sortert etter tid:
- Tee Total — 8t 12min (lyseblå)
- Approach 100-150m — 6t 45min
- Approach 50-100m — 4t 12min
- Putt 3-5ft — 3t 30min
- Chip — 3t 15min
- ... (resten kortere)

#### Miljø-fordeling (stacked bar)
Horizontal bar med 6 segmenter:
- M0: 12% (statisk)
- M1: 18% (slow-mo)
- M2: 35% (simulator)
- M3: 22% (bane-sim)
- M4: 10% (bane)
- M5: 3% (turnering)

#### Praksistype-fordeling (4 fargede kort)
- BLOKK 42% (blå)
- RANDOM 28% (oransje)
- KONKURRANSE 15% (rød)
- SPILL-TEST 15% (lilla)

### Editorial moment
"forteller en historie" italic

Lever én HTML-fil.
```

---

## Prompt 4.2 — Krysstabell (VIKTIGST)

```
[LIM INN 00-shared-spec.md]

## Skjerm: Treningsanalyse Krysstabell
URL: /admin/analyse?view=krysstabell
**Dette er Anders' nøkkelinnsikt — den må være den klareste, mest tilfredsstillende skjermen.**

### Kjerneprinsipp
"Tee Total" som treningsområde kan trenes som:
- TEK · L-KROPP · M0 = Teknikk-trening
- SLAG · L-AUTO · M2 = Golfslag-trening på simulator
- SPILL · L-AUTO · M4 = Driving på bane

Krysstabellen viser MINUTTER per kombinasjon av to dimensjoner.

### Layout
Standard tre-panel.

### Hovedinnhold

#### Header
- Eyebrow: "COACHHQ · ANALYSE · KRYSSTABELL"
- Tittel: "Hvor *trener* hva *trent som hva?*"
- Sub: "Sammenlign treningsområde × pyramide for å forstå treningssignaturen din"

#### Dropdown-rad (top, sticky)
- "Rader (Y-akse):" [Treningsområde ▾]
- "× Kolonner (X-akse):" [Pyramide ▾]

Dimensjoner i dropdowns:
- Pyramide (5: FYS/TEK/SLAG/SPILL/TURN)
- Treningsområde (16: TEE, INN200, INN150, INN100, INN50, CHIP, PITCH, LOB, BUNKER, PUTT0_3, PUTT3_5, PUTT5_10, PUTT10_15, PUTT15_25, PUTT25_40, PUTT40+)
- L-fase (5)
- CS-nivå (6)
- M-miljø (6)
- PR-press (5)
- Praksistype (4)
- Komponentfokus (mange)

#### Preset-knapper
[Område × Pyramide] (default, aktiv) · [Område × M-miljø] · [Pyramide × Praksistype] · [L-fase × Komponentfokus]

#### Heatmap-tabell

```
                FYS    TEK    SLAG   SPILL   TURN   TOTAL
TEE             0      240    360    90      30     720
INN200          0      45     180    0       0      225
INN150          0      60     240    0       30     330
INN100          0      30     180    0       0      210
INN50           0      45     120    0       15     180
CHIP            0      30     90     45      0      165
PITCH           0      45     180    30      0      255
LOB             0      0      45     0       0      45
BUNKER          0      0      90     30      0      120
PUTT 0-3        0      30     45     90      15     180
PUTT 3-5        0      60     30     90      45     225
PUTT 5-10       0      30     60     90      30     210
PUTT 10-15      0      0      30     60      30     120
PUTT 15-25      0      0      0      30      0      30
PUTT 25-40      0      0      0      15      0      15
PUTT 40+        0      0      0      0       0      0
─────────────────────────────────────────────────────────
TOTAL FYS       275
TOTAL trening   0      615    1650   570     195    3305
```

**Heatmap-fargekoding:**
- 0 min: lys grå (var(--secondary))
- 1-30 min: lys grønn
- 31-90 min: middels grønn
- 91-180 min: mørk grønn
- 180+ min: mørkest grønn med hvit tekst

**Hver celle:**
- Bakgrunn: heatmap-farge
- Tekst: minutter (mono, 14px, tabular-nums)
- Hover: tooltip "TEE × SLAG: 360 min · 12 økter · Klikk for å se økter"
- Klikk: åpner sliding panel høyre med liste over økter som matcher

**Total-rad/kolonne:** fet, separator-linje før

#### Innsikts-banner (under tabellen)
3 caddie-funn:
1. "TEE-trening domineres av SLAG (50%) — vurder mer TEK-fokus (now 33%)"
2. "PUTT 0-3 ft er overweight på SPILL (50%) — TEK-konsistens kunne hjelpe"
3. "Ingen TEK på PUTT 5-10 ft — kritisk distanse-felt mangler systematisk trening"

#### Cell-klikk: Sliding panel høyre (open state)

Når Anders klikker på "TEE × SLAG (360 min)":

Panel åpnes fra høyre, 400px bredde:
- Header: "TEE × SLAG · 360 min · 12 økter"
- Liste:
  1. Driver gate-test (45 min · 4. mai)
  2. Driving range konsistens (30 min · 3. mai)
  3. ... (10 mer)
- Hver økt: dato, varighet, suksess-rate, lenke til detalj

### Editorial moment
"*trener*" og "*trent som hva?*" italic — beslutningsbasert, ikke greeting

Lever én HTML-fil. Vis tabellen full, og side-panel som åpen state nederst (for context).
```

---

## Prompt 4.3 — Trender

```
[LIM INN 00-shared-spec.md]

## Skjerm: Treningsanalyse Trender
URL: /admin/analyse?view=trender

### Layout — tre-panel

### Hovedinnhold

#### Header
- Tittel: "Trender *over tid.*"
- Sub: "Markus R · siste 90 dager · ukentlig aggregat"

#### Kontrollrad
- "Dimensjon: [Pyramide-fordeling ▾]"
  (alternativer: Total tid · Pyramide · Område · CS · Suksess-rate · Antall økter)
- "Aggregering: [Ukentlig ▾] / Månedlig"
- "Sammenlign med:" [☐ Forrige periode] [☑ Samme periode i fjor]

#### Hovedgraf — Stacked area (full bredde, 400px høyde)
X-akse: Uke 7-18 (12 uker)
Y-akse: Minutter trent

5 stablete area-segmenter (pyramide-farger):
- TURN bunn (lyseblå-grønn, 5-10%)
- SPILL (B7C97D, 15-25%)
- SLAG (2A7D5A, 20-30%)
- TEK (005840, 30-40%)
- FYS topp (003B2A, 10-15%)

Trend-linje overlay: total minutter (mørk gråt, stiplet, JetBrains Mono labels)

Sammenligning fra fjoråret: ulik-tykk stiplet linje (samme farger)

#### Insight-cards (3 stk under)

**1. Volum-trend**
- "+12% siste 30 dager"
- Mini-sparkline opp

**2. Pyramide-skifte**
- "TEK ned 5pp · SLAG opp 4pp"
- "Justert mot turnerings-prep ✓"

**3. CS-trend**
- "Snitt CS opp 73 → 78"
- "Kommer nær P-fase 80%"

#### Anomali-detection
Banner: "⚠ Uke 14: 0 økter (skade). Trend-data hopper over uke 14 for sammenligning."

### Editorial moment
"*over tid*" italic

Lever én HTML-fil. SVG-basert graf med realistisk uke-til-uke variasjon.
```

---

## Prompt 4.4 — SG-kobling

```
[LIM INN 00-shared-spec.md]

## Skjerm: Treningsanalyse SG-kobling
URL: /admin/analyse?view=sg

### Layout — tre-panel

### Hovedinnhold

#### Header
- Tittel: "Henger *trening* og *resultat* sammen?"
- Sub: "Korrelasjon mellom tid trent og SG-utvikling per kategori"

#### 4 SG-kort (2×2 grid)

**1. SG OTT (Off The Tee)**
- Stort tall: **+0.32** (lime, opp-pil)
- Sub: "siste 30 dager"
- Mini-graf 120×60px: SG-trend over tid
- Tekst: "Trent 8.2t (TEE-område) · 22 økter"
- Korrelasjon-streck: "**+12 min/uke trening → +0.4 SG**" (lime)

**2. SG APP (Approach)**
- Stort tall: **-0.12** (rød)
- Sub: "siste 30 dager"
- Mini-graf: SG-trend ned
- Tekst: "Trent 11.8t (Approach-områder) · 28 økter"
- Korrelasjon: "Lite kobling synlig — vurder mer Random-praksis"

**3. SG ARG (Around the Green)**
- Stort tall: **+0.18** (lime)
- Tekst: "Trent 6.3t · 14 økter"
- Korrelasjon: "+18 min Chip-trening → +0.3 SG"

**4. SG PUTT**
- Stort tall: **+0.05** (gul, flat)
- Tekst: "Trent 4.2t · 11 økter"
- Korrelasjon: "Liten endring — TEK-fokus på PUTT 5-10 ft anbefales"

#### Sammenlignings-tabell (full bredde)

Tabell:
| SG-kategori | Min trent | Antall økter | SG-delta | Korrelasjon |
|---|---|---|---|---|
| OTT | 8.2 t | 22 | +0.32 | Sterk + |
| APP | 11.8 t | 28 | -0.12 | Svak/ingen |
| ARG | 6.3 t | 14 | +0.18 | Moderat + |
| PUTT | 4.2 t | 11 | +0.05 | Svak |
| **Total** | 30.5 t | 75 | +0.43 | — |

#### Caddie-anbefaling
Lyst kort:
> "Approach (APP) bruker 39% av tiden men leverer -0.12 SG. Anbefal: Skift 30% av M0/M1-praksis til M3 (bane-simulering) for bedre transfer."

### Tom-state
Hvis ingen SG-data finnes:
> "Importer en runde med SG-data (CSV eller GolfBox) for å se kobling."

### Editorial moment
"*trening*" og "*resultat*" italic

Lever én HTML-fil.
```

---

## Prompt 4.5 — FYS-progresjon

```
[LIM INN 00-shared-spec.md]

## Skjerm: Treningsanalyse FYS-progresjon
URL: /admin/analyse?view=fys

### Layout — tre-panel

### Hovedinnhold

#### Header
- Tittel: "Fysisk *utvikling.*"
- Sub: "Vekt, reps, soner og muskelbalanse — siste 90 dager"

#### KPI-strip
- Total FYS-tid: 12.5 t
- Antall økter: 24
- Snitt-volum/økt: 31 min
- PR-er denne perioden: 4 (markert ★)

#### Topp 10 mest brukte øvelser (liste med mini-graf hver)

```
1. ★ Knebøy
   ════════════════════════════════════
   90kg → 110kg (+22%)        [linjegraf ↗]
   28 sett · 4 økter · sist 7 dager
   PR: 110kg × 8 (3. mai)

2. Markløft
   ════════════════════════════════════
   100kg → 110kg (+10%)       [linjegraf ↗]
   15 sett · 3 økter

3. ★ Benchpress
   ════════════════════════════════════
   60kg → 70kg (+17%)         [linjegraf ↗]
   24 sett · 4 økter
   PR: 70kg × 6 (5. mai)

4. Pull-ups
   ════════════════════════════════════
   8 reps → 12 reps           [linjegraf ↗]
   ...
```

Vis 10 stk med ulik fremgang.

#### Muskelgruppe-balanse (donut)
Donut 280×280px:
- Underkropp 42%
- Overkropp 28%
- Core 18%
- Bevegelighet 12%

Advarsel-banner under: "⚠ Bevegelighet under 15% — vurder å øke dynamisk mobilitet"

#### Intensitets-fordeling (kondisjon, stack-bar)
Hvis kondisjon-trening finnes:
- Sone 1 (lett): 35%
- Sone 2 (rolig): 28%
- Sone 3 (moderat): 20%
- Sone 4 (hard): 12%
- Sone 5 (max): 5%

Caddie-funn: "Polarisert fordeling: 63% sone 1-2 + 17% sone 4-5. Sone 3 under 25% — godt mønster for golfutholdenhet."

#### Bevegelighet-typer
Mini-tabell:
| Type | Tid | Antall økter |
|---|---|---|
| Statisk | 2.5 t | 8 |
| Dynamisk | 3.0 t | 12 |
| PNF | 0.5 t | 2 |
| Aktiv mobilitet | 1.5 t | 5 |

### Editorial moment
"*utvikling*" italic

Lever én HTML-fil.
```

---

## Prompt 4.6 — Plan vs Faktisk

```
[LIM INN 00-shared-spec.md]

## Skjerm: Treningsanalyse Plan vs Faktisk
URL: /admin/analyse?view=plan-faktisk

### Layout — tre-panel

### Hovedinnhold

#### Header
- Tittel: "Plan vs *virkelighet.*"
- Sub: "Hvor godt følger Markus planen sin?"

#### KPI-strip
- Adherence total: **87%** (lime)
- Hopp-over økter: 4 (rødt)
- Faktisk volum: 32.4t / 36.8t plan
- Manglende: 4.4t (12%)

#### Adherence per pyramide (bar-chart)

```
FYS    ████████████████░░░░  82%  4t 30min / 5t 30min  ▼ -1t
TEK    ████████████████████░ 95%  14t 12min / 15t      ▲ -0.5t (+13min faktisk)
SLAG   █████████████████████ 100% 10t / 10t            ✓
SPILL  ████████████████░░░░░ 78%  6t 30min / 8t 18min  ▼ -1.8t
TURN   █████████████████░░░░ 85%  1t 42min / 2t        ▼ -18min
```

**Fargelogikk:**
- ≥90%: lime/grønn
- 70-89%: gul
- <70%: rød

#### Detaljtabell (alle planlagte vs faktiske økter, full bredde)

Tabell:
| Dato | Pyramide | Plan | Faktisk | Status | Notat |
|---|---|---|---|---|---|
| 4. mai 09:00 | TEK | 90 min | 95 min | ✓ Fullført +5 | Gikk over |
| 5. mai 17:00 | FYS | 60 min | 0 min | ✕ Skippet | Reise |
| 6. mai 14:00 | SLAG | 75 min | 75 min | ✓ Fullført | — |
| 6. mai 17:00 | FYS | 60 min | 60 min | ✓ | — |
| 7. mai 09:00 | TEK | 90 min | 80 min | ⊘ Avbrutt -10 | Ankel-tegn |
| 8. mai 09:00 | SPILL | 240 min | 0 min | ✕ Flyttet | Vær |
| ... | ... | ... | ... | ... | ... |

20 rader synlig, scroll for resten.

#### Mest skippede områder (insight-kort)

**Topp 3 hopp-over-grunner:**
1. Reise/jobb: 2 økter
2. Vær: 1 økt (SPILL)
3. Skade-flagg: 1 økt (Joachim-related)

**Mest skippede pyramider:**
1. SPILL (3 økter, vær-relatert)
2. FYS (1 økt)
3. TURN (0)

**Mest skippede tider:**
- Morgen (06-09): 25% skip-rate (høyere enn snitt)
- Kveld (17-20): 8% skip-rate (lavere)

Caddie-anbefaling:
> "Morgenøkter har 25% skip-rate. Vurder å flytte FYS-styrke til ettermiddag for høyere compliance."

### Editorial moment
"*virkelighet*" italic

Lever én HTML-fil.
```
