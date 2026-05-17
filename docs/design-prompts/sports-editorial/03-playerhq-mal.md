# Prompt: PlayerHQ Mål — Sports Editorial × 3 enheter

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
6. Lagre som `_outputs/03-playerhq-mal.html`

---

## PROMPT (kopier alt under denne linjen)

Du er senior visuell designer som spesialiserer seg på Sports Editorial design
— magasin-redaksjon kombinert med performance-data for elite-atleter.

Du har akkurat fått hele design-systemet (over). Følg det strengt:
- Italic Instrument Serif er hovedstemme (bruk OFTE — særlig på mål-navn)
- Typografi-glyfer som ikoner (ikke SVG-tegninger)
- Magazine spread-feel, ikke uniform dashboard-grid
- Forest green sparsomt som signatur, lime maks ÉN flate per skjerm
- Norsk locale (komma desimal, ikke-brytbar mellomrom, +/− fortegn)
- Editorial tone — observerende italic-fragmenter, aldri "Du er X% av målet"

# SKJERM: PlayerHQ Mål (3 enheter)

URL: `/portal/mal`

## Demo-bruker (faktiske data)

**Øyvind Rohjan**
- Alder: 19 år
- HCP: **+3,5** (plus-handikap)
- Snittscore: **71,3** (på par-72 baner)
- Hjemmebane: Gamle Fredrikstad GK (GFGK)
- Status: Senior elite-amateur, WAGR #487, tour-aspirant
- Coach: Anders Kristiansen, AK Golf Academy

Brukerspørsmål når Øyvind åpner Mål:
*"Hvor står jeg vs målene mine? Hva har jeg oppnådd? Hva mangler?"*

Tone: Dette er ikke en checklist-app. Det er **årboken som måler progresjon
mot kalibrerte tour-mål**. Hvert mål er en redaksjonell beslutning — ikke
en KPI-tile. Øyvind ser ikke "78% av målet" — han ser *"+3,5 i dag. Halve
veien til +5,0."* Tonen er kalkulert, ærlig, sportsjournalistisk.

## Realistiske data å bruke

- **I dag:** Søndag 17. mai 2026, kl 08:14 (grunnlovsdag, hvile-tema)
- **Sesongmål 2026** (satt 1. januar 2026, evalueres 31. desember):

### Hoved-mål (sesongen)

| Mål | I dag | Mål | Status |
|---|---|---|---|
| WAGR-rangering | #487 | top-300 | 187 plasser igjen |
| Snittscore (par-72) | 71,3 | 70,5 | −0,8 å hente |
| HCP | +3,5 | +5,0 | −1,5 å hente |
| Runder spilt 2026 | 22 | 60 | 38 igjen (37%) |
| SG total vs PGA-tour | +1,34 | +1,80 | +0,46 å hente |

### Sub-mål (per kategori)

| Sub-mål | I dag | Mål |
|---|---|---|
| SG OTT | +0,42 | +0,50 |
| SG APP | −0,18 | +0,40 (største løft) |
| SG ARG | +0,67 | +0,75 |
| SG PUTT | +0,43 | +0,55 |
| Runder under par (sesong) | 7 | 18 |
| Topp-10 i nasjonale events | 1 | 4 |
| Internasjonale events | 1 | 3 |
| Cuts made (totalt) | 4 av 5 | 8 av 10 |

### Milepæler oppnådd 2026

- **14. mai 2026** — Olyo Cup-kvalifisering bekreftet
- **11.-13. mai 2026** — Tre runder under par på rad (GFGK 69, 70, 70)
- **8. april 2026** — Beste HCP i karrieren (+3,3, deretter +3,5)
- **2. mars 2026** — Første WAGR-event-deltakelse (Spanish Amateur, Mijas)
- **18. januar 2026** — WAGR-debut i top-1000 (#943)

### Sammenligninger

| Sammenligning | Verdi |
|---|---|
| Øyvind vs PGA-tour-baseline | +1,34 (tour-pros snitt 0,0) |
| Øyvind nå vs Øyvind for 12 mnd siden | +1,7 i HCP, +0,8 i SG |
| Øyvind (19 år) vs Hovland på samme alder | Hovland HCP +4,2 ved 19 år — Øyvind +3,5 |
| Øyvind vs norske WAGR top-5-snitt | −124 plasser bak |

### Lenker (til detalj-sider)

- `/portal/runder` — Runder (22 logget 2026)
- `/portal/statistikk` — Statistikk-hub
- `/portal/trackman` — Trackman-data
- `/portal/sg-hub` — Strokes-gained-dypdykk
- `/portal/milepaeler` — Komplett milepæl-historikk
- `/portal/leaderboard` — Akademi-leaderboard

**Editorial tone (eksempler på åpningslinjer):**
- *"Halve sesongen igjen. Halve veien til +5,0."*
- *"Fem mål. Fire i rute. Ett krever løft."*
- *"WAGR #487 — 187 plasser igjen."*
- *"22 runder spilt. 38 igjen."*
- *"APP 150-200 er fortsatt flat."*

---

## STRUKTUR — 5 spreads kombinert

Bruk **5 spread-arketyper** fra design.md seksjon 12:

1. **Cover** (Arketype A) — hero-tittel + lead om "hvor står jeg"
2. **Data Story** (Arketype C) — Hoved-mål som stat-block-rad med pen-and-ink-annotasjoner
3. **Atlas** (Arketype H) — Sub-mål-tabell (SG-kategorier, runder, events)
4. **Field Notes** (Arketype E) — Milepæler oppnådd 2026 som notatbok-spread
5. **The Workshop** (Arketype F) — Sammenligninger (vs PGA, vs i fjor, vs Hovland) som trinn-stil

The Quote bryter inn et sted (Arketype D) — Anders' kommentar om hva som
mangler. Footer/kolofon nederst.

**Anti-AI-varianter:** Bruk vekslende spread-bredder. F.eks.
12 / 8+4 / 12 / 7+5 / 10-centered / 12. Aldri alle 12-col.

---

## DESKTOP 1440×900

### Layout

12-col med sidebar TOC permanent venstre (280px).

**Sidebar TOC:**
```
AK GOLF HQ
Utgave 047 · 17.05

MÅL — SESONGEN 2026

01  Hoved-mål
02  Sub-mål
03  Milepæler
04  Sammenligning
05  Coach-vurdering

PORTALER
↳ Tren
↳ Mål  ●
↳ Coach
↳ Meg

DETALJ-SIDER
↳ Runder (22)
↳ Statistikk
↳ Trackman
↳ SG Hub
↳ Milepæler
↳ Leaderboard
```

**Main content (max 1080px):**

**Spread 1 — Cover (12-col):**
- Eyebrow: `● AK GOLF HQ · UTGAVE 047 · SESONGEN 2026 · 17.05`
- Cover-tittel (Instrument Serif italic, 96-112px):
  ```
  Fem mål.
  *Fire i rute.*
  Ett krever løft.
  ```
- Lead-paragraf (Geist 19px, max-width 580px) med drop cap:
  *"H​alve sesongen igjen. WAGR-stigningen fortsetter, HCP er på sitt
  beste, og fire av fem SG-metrikker er allerede på tour-nivå. Men
  APP 150-200 må løftes før European Amateur — ellers bommer du på
  +1,80-målet."*
- Til høyre (4-col): liten "*Sesong-status*"-kort med dato-stempel:
  ```
  STATUS 17. MAI

  Sesong-uke 20 av 44
  Runder 22 av 60
  Form: stigende
  ```

**Spread 2 — Data Story (12-col):**

**HOVED-MÅL — sesongen 2026** (Display 2, 56px italic)

5 stat-block-rader stablet vertikalt med italic-annotasjon og delta-visualisering.
Hver rad er bygget som **Atlas-tabell-rad + pen-and-ink**:

```
WAGR-RANGERING
#487  →  top-300
[liten progress-bar: 187 plasser å hente]
*Opp 142 plasser siste 6 mnd. Tempoet er nok.*

─

SNITTSCORE (par-72)
71,3  →  70,5
[bar: 0,8 slag å hente]
*Tre under par på rad i mai dro snittet ned 0,4. Trenger ti til.*

─

HCP
+3,5  →  +5,0
[bar: 1,5 slag å hente]
*Beste 12-måneders trekk i karrieren (+1,7). Trender mot +5,0 i Q4.*

─

RUNDER SPILT
22 av 60
[bar: 37% — 38 igjen]
*På schedule. 1,4 runder/uke resten av sesongen er nok.*

─

SG TOTAL vs PGA-TOUR
+1,34  →  +1,80
[bar: 0,46 å hente — knyttet til APP-løft]
*Alt sitter i APP 150-200. Mandag starter drill.*
```

**Visualiseringsdetalj per rad:**
- Stor mono-tall venstre (JBM 48px): "I dag"-verdi
- Pil "→" 24px (Lucide ArrowRight)
- Mål-verdi (JBM 48px, forest)
- Tynn horisontal bar (8px høy, 320px bred) viser fremgang
  - Forest-fyll på oppnådd, muted på resterende
  - Liten italic "X igjen" til høyre
- Italic-annotasjon i marg (max-width 360px)

På SG TOTAL-raden: pen-and-ink-pil ned til neste spread (Atlas) som
peker på "*detaljene under*".

**Spread 3 — The Quote (10-col centered):**

Forest accent-strek venstre, italic 44px:

*"Øyvind — du er statistisk på tour-nivå i fire av fem metrikker.
APP 150-200 er det eneste som skiller deg fra +1,80-målet. Får vi
løftet den én ting før European Amateur, er resten matematikk."*

`— ANDERS KRISTIANSEN, COACH · 16. MAI 2026`

**Spread 4 — Atlas (12-col):**

**SUB-MÅL — per kategori** (Display 2, 48px italic)

Newsprint-bakgrunn #ECE9DF. Editorial-tabell uten gridlines:

```
KATEGORI                   I DAG       MÅL         GAP         STATUS

Strokes Gained
  OTT                      +0,42       +0,50       −0,08       ●●●●○
  APP                      −0,18       +0,40       −0,58       ●○○○○  ← *største løft*
  ARG                      +0,67       +0,75       −0,08       ●●●●●
  PUTT                     +0,43       +0,55       −0,12       ●●●●○

Resultater 2026
  Runder under par         7           18          11 igjen    ●●○○○
  Topp-10 nasjonalt        1           4           3 igjen     ●●○○○
  Internasjonale events    1           3           2 igjen     ●●●○○
  Cuts made                4 av 5      8 av 10     —           ●●●●●
```

- Severity dot (●●●●○) per rad — forest aktive, muted ikke-aktive
- Tall-celler: JBM 16-18px tabular-nums
- Header: Tiny Geist caps tracking 0.1em
- Hover-rad: bg muted 50% alpha
- Pen-and-ink-pil til APP-raden: *"Her er hele +0,46-løftet til +1,80."*

**Spread 5 — Field Notes (8+4):**

Cream Warm #F5EFE2 bakgrunn.

**Venstre 8-col — FELTNOTATER · MILEPÆLER 2026**

```
FELTNOTATER · MILEPÆLER 2026                   PR 17.05

*Fem milepæler hittil. Hver verdt sin egen kveld.*

  14. mai      *Olyo Cup-kvalifisering bekreftet*
               Garmin Norges Cup R3 sikret kvalen.
               ← *første hovedturnering hjemme*

  11.-13. mai  *Tre runder under par på rad*
               GFGK 69, 70, 70 · snitt 69,7
               ↘ *første gang i karrieren*

  8. april     *Beste HCP i karrieren: +3,3*
               Senere justert til +3,5 (14. mai)
               ↘ *opp 1,7 slag siden januar*

  2. mars      *Første WAGR-event-deltakelse*
               Spanish Amateur, Mijas · cut made
               ← *internasjonal debut*

  18. januar   *WAGR-debut i top-1000: #943*
               Nå #487 — opp 456 plasser på 4 mnd.

*Bra kvartal. Ikke perfekt. Bedre enn forventet.*

[Se hele milepæl-historikken →]
```

**Høyre 4-col — Coach-hånd som marginalia:**

```
[AVATAR ANDERS] ANDERS · COACH

*"Olyo-kvalen var det viktigste*
*i mai. Resten er bonus. Hold*
*tempoet — Q3 og Q4 kan bli*
*store hvis APP løftes."*

— 16. MAI
```

**Spread 6 — The Workshop (8+4):**

Cream Cool #EEF0EC bakgrunn.

**WORKSHOP — SAMMENLIGNING** (Display 2 italic)

```
01  *Øyvind nå vs Øyvind for 12 mnd siden*
    HCP +1,8 → +3,5 (+1,7)
    SG total +0,54 → +1,34 (+0,80)
    *Største 12-måneders løft i karrieren.*

02  *Øyvind vs PGA-tour-baseline*
    SG total +1,34 (tour-pros: 0,0)
    *Du er statistisk over tour-snitt.*

03  *Øyvind ved 19 år vs Hovland ved 19 år*
    Øyvind HCP +3,5 · Hovland +4,2 ved samme alder
    *Hovland brøt gjennom ved 20. Du har 12 mnd til samme vindu.*

04  *Øyvind vs norske WAGR top-5-snitt*
    Du #487 · top-5-snitt #363
    *124 plasser bak. Innen rekkevidde 2026.*
```

Høyre 4-col: 3 editorial-cards med lenker:

- Card 1: **Runder** — *"22 spilt. Se hver score, SG og runde-notater."* → `/portal/runder`
- Card 2: **SG Hub** — *"+1,34 total. Bryt ned per kølle og distanse."* → `/portal/sg-hub`
- Card 3: **Trackman** — *"Per-kølle dispersion, ballhastighet, attack-angle."* → `/portal/trackman`

**Spread 7 — Kolofon-lenker:**

Editorial-tabell som indeks for detalj-sider:

```
LES VIDERE                                   UTGAVE 047

↳ Runder 2026                                  22 logget · 4 cuts made
↳ Statistikk-hub                               Full breakdown
↳ Trackman-data                                Per-kølle dispersion
↳ SG Hub                                       Strokes gained dypdykk
↳ Milepæler                                    Komplett historikk
↳ Leaderboard (akademi)                        Topp 10 spillere
```

Hver rad er klikkbar, hover gir forest underline + ChevronRight 16px.

**Kolofon nederst:**
```
AK GOLF HQ · Utgave 047 · Sesong 2026 · Trykket digitalt fra Fredrikstad
Redaktør: Anders Kristiansen · AK Golf Group AS · Sist oppdatert 17.05 08:14
```

---

## IPAD 1024×768 (landscape)

### Layout

Top-tab nav (48px), ingen sidebar. Main padding 32-48px hver side.

```
┌──────────────────────────────────────────────────────────┐
│ AK GOLF HQ · UTGAVE 047 · 17.05 · 08:14         🔍 ⌘  │ ← 56px masthead
├──────────────────────────────────────────────────────────┤
│ [HJEM] [TREN] [MÅL ●] [COACH] [MEG]                     │ ← 48px tabs
├──────────────────────────────────────────────────────────┤
│                                                            │
│ COVER (96px italic-tittel "Fem mål. Fire i rute.")        │
│ Lead body 18px + status-kort høyre                        │
│                                                            │
│ DATA STORY — Hoved-mål                                    │
│ 5 rader stablet med stat + bar + annotasjon              │
│ (mindre stat: 36-40px JBM, kortere bars)                  │
│                                                            │
│ PULL QUOTE (centered, 36px) — Anders                     │
│                                                            │
│ ATLAS — Sub-mål (newsprint, kondensert tabell)           │
│ APP-rad markert med pil                                   │
│                                                            │
│ FIELD NOTES — Milepæler (cream warm)                     │
│ 5 milepæler chronological + coach-hånd høyre             │
│                                                            │
│ WORKSHOP — Sammenligninger (cream cool)                  │
│ 4 trinn + 3 lenke-cards under (ikke høyre)               │
│                                                            │
│ INDEX-LENKER til detalj-sider                            │
│                                                            │
│ KOLOFON                                                   │
└──────────────────────────────────────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 96px (var 112)
- Pull quote: 36px (var 44)
- Stat-tall i hoved-mål-rader: 36-40px (var 48)
- Atlas-tabell: kondensert padding (10px 14px)
- Workshop-cards under workshop-trinn (ikke høyre 4-col)
- Touch-targets min 44px
- ⌘K erstattes med søke-ikon høyre topp
- Kolofon: kompakt en linje

---

## IPHONE 393×852 (iPhone 15)

### Layout

Bottom tab-bar (56px). Single column. Padding 16-20px hver side.

```
┌─────────────────────────┐
│ MÅL · SESONG 2026   🔍 │ ← 44px running head
├─────────────────────────┤
│                          │
│ ● AK GOLF HQ ·          │
│   UTGAVE 047 · 17.05    │
│                          │
│ Fem mål.                 │
│ *Fire i rute.*           │ ← Cover-tittel 56px italic
│ Ett krever løft.         │
│                          │
│ Halve sesongen igjen.    │
│ WAGR-stigningen          │
│ fortsetter, HCP er på    │
│ sitt beste, fire av fem  │
│ SG-metrikker på tour-    │
│ nivå. APP 150-200 må     │
│ løftes før Eur. Amateur. │
│                          │
│ ─────                    │
│                          │
│ HOVED-MÅL                │
│                          │
│ *WAGR-rangering*         │
│  #487  →  top-300        │
│  ████████░░░░░░ 187 igjen│
│  *Opp 142 siste 6 mnd.*  │
│                          │
│ *Snittscore*             │
│  71,3  →  70,5           │
│  ██████░░░░ −0,8 å hente │
│  *Tre under par i mai*   │
│  *dro snittet ned 0,4.*  │
│                          │
│ *HCP*                    │
│  +3,5  →  +5,0           │
│  ██████░░░░ −1,5 igjen   │
│  *Beste karriere-trekk.* │
│                          │
│ *Runder spilt*           │
│  22 av 60                │
│  ██████░░░░ 37%          │
│  *På schedule.*          │
│                          │
│ *SG total vs PGA-tour*   │
│  +1,34  →  +1,80         │
│  ███████░░░ +0,46 igjen  │
│  *Alt sitter i APP.*     │
│                          │
│ ─────                    │
│                          │
│ │                        │
│ │ *"Du er statistisk på* │
│ │ *tour-nivå i fire av*  │
│ │ *fem metrikker. APP*   │
│ │ *150-200 skiller deg*  │
│ │ *fra +1,80-målet."*    │
│ │                        │
│ │ — ANDERS · 16. MAI     │
│                          │
│ ─────                    │
│                          │
│ SUB-MÅL                  │
│                          │
│ STROKES GAINED           │
│ OTT   +0,42 → +0,50 ●●●●○│
│ APP   −0,18 → +0,40 ●○○○○│
│       *største løft ←*   │
│ ARG   +0,67 → +0,75 ●●●●●│
│ PUTT  +0,43 → +0,55 ●●●●○│
│                          │
│ RESULTATER               │
│ Under par     7/18  ●●○○○│
│ Topp-10 nasj. 1/4   ●●○○○│
│ Int. events   1/3   ●●●○○│
│ Cuts made     4/5   ●●●●●│
│                          │
│ ─────                    │
│                          │
│ MILEPÆLER 2026           │
│                          │
│ 14. mai                  │
│ *Olyo Cup-kval bekreftet*│
│ ← første hovedturnering  │
│                          │
│ 11.-13. mai              │
│ *Tre under par på rad*   │
│ GFGK 69, 70, 70          │
│                          │
│ 8. april                 │
│ *Beste HCP: +3,3*        │
│ (nå +3,5)                │
│                          │
│ 2. mars                  │
│ *Første WAGR-event*      │
│ Spanish Amateur · cut    │
│                          │
│ 18. januar               │
│ *WAGR-debut #943*        │
│ Nå #487                  │
│                          │
│ [Se hele historikken →]  │
│                          │
│ ─────                    │
│                          │
│ SAMMENLIGNING            │
│                          │
│ 01 *vs Øyvind for 12 mnd*│
│    HCP +1,8 → +3,5       │
│    *Største løft.*       │
│                          │
│ 02 *vs PGA-tour*         │
│    +1,34 vs 0,0          │
│    *Over tour-snitt.*    │
│                          │
│ 03 *vs Hovland ved 19*   │
│    +3,5 vs +4,2          │
│    *12 mnd til vinduet.* │
│                          │
│ 04 *vs norske WAGR top-5*│
│    #487 vs #363-snitt    │
│    *Innen rekkevidde.*   │
│                          │
│ ─────                    │
│                          │
│ LES VIDERE               │
│ ↳ Runder (22)            │
│ ↳ Statistikk             │
│ ↳ Trackman               │
│ ↳ SG Hub                 │
│ ↳ Milepæler              │
│ ↳ Leaderboard            │
│                          │
│ KOLOFON                  │
│                          │
├─────────────────────────┤
│ [Send melding Anders →] │ ← Sticky CTA over tab-bar
├─────────────────────────┤
│ 🏠 ⏱️ 🎯 💬 ⋯           │ ← Bottom tab-bar 56px (Mål aktivert)
└─────────────────────────┘
```

**Tilpasninger fra desktop:**
- Cover-tittel: 56px (var 96-112)
- Lead body: 17px (var 19)
- Pull quote: 28px (var 44)
- Stat-tall i hoved-mål-rader: 24-28px (var 48) — vertikalt stablet
- Bars: full bredde (361px) i stedet for 320px
- Atlas-tabell: kondensert, kun nødvendige kolonner
- ALLE spreads stables vertikalt — null kolonner
- Marginalia inline (under elementet)
- ⌘K → søke-ikon i header
- Field Notes-bakgrunn beholdes (cream warm) for milepæl-seksjonen
- Workshop-bakgrunn (cream cool) for sammenligning-seksjonen
- Index-lenker som enkel vertikal liste

---

## INTERAKTIVITET (alle 3 enheter)

- **Page-load koreografi** (sekvensiell, 0-2000ms, se design.md seksjon 9)
- **Count-up** på hoved-mål-tall (f.eks. WAGR 0 → 487, 800ms)
- **Progress-bars** fade-fyller fra venstre (800ms ease-out, 100ms delay/rad)
- **Pen-and-ink-pil** på APP-raden i Atlas tegnes inn med stroke-dashoffset (1200ms)
- **Pull-quote** scale-up 0.96 → 1.0 (600ms)
- **Field Notes-milepæler** stagger fade-up (60ms delay/milepæl)
- **Workshop-trinn** stagger fade-up (80ms delay/trinn)
- **Index-lenker:** hover gir forest underline glide fra venstre + ChevronRight slides +4px
- **Severity dots** fade-fyller venstre→høyre (40ms delay/dot)
- **Tap-feedback** på iPhone: lett scale(0.98) på press
- **Pulserende live-prikk** i eyebrow (2s loop)

---

## COMMAND PALETTE ⌘K (desktop + iPad)

På iPhone erstattes med søke-overlay (full screen) som åpner via søke-ikon.

20+ kommandoer i kategorier (skjerm-spesifikke for Mål):

**Navigér til detalj-side**
- Åpne Runder 2026
- Åpne Statistikk-hub
- Åpne Trackman-data
- Åpne SG Hub
- Åpne Milepæler-historikk
- Åpne Akademi-leaderboard

**Vis spesifikt mål**
- WAGR-trend siste 12 mnd
- HCP-trend siste 12 mnd
- Snittscore-utvikling per måned
- Runder spilt per uke 2026
- SG total over tid

**Sammenlign**
- Øyvind vs PGA-tour-snitt
- Øyvind vs Øyvind for 12 mnd siden
- Øyvind vs Hovland på samme alder
- Øyvind vs norske WAGR top-5
- Sammenlign 2025 vs 2026

**Sub-mål dypdykk**
- APP 150-200 status (svakeste)
- Cuts made-historikk
- Topp-10-resultater 2026
- Internasjonale event-prestasjoner

**Sett / juster mål**
- Sett mål for Q3 2026
- Juster WAGR-mål
- Legg til nytt sesongmål
- Reset HCP-mål (med advarsel)

**Eksporter / del**
- Eksporter mål-rapport som PDF
- Del progresjon med Anders
- Send mål-snapshot til foreldre

**Coach**
- Be Anders kommentere mål
- Sett opp mål-review-møte
- Se Anders' notater per mål

**Hjelp**
- Hvordan kalibreres mål?
- Snarveier
- Send tilbakemelding

⌘K åpner med fade + scale-pop. Fuzzy search på tittel + kategori.
↑↓ Enter for å velge, Esc for å lukke.

---

## OUTPUT-FORMAT

Lever **ÉN HTML-fil** med tre viewport-seksjoner stablet vertikalt:

```html
<section class="device device--desktop">
  <header class="device-label">Desktop · 1440 × 900</header>
  <div class="frame" style="width:1440px; height:auto; min-height:900px; overflow:hidden;">
    <!-- Desktop layout - kan være lengre enn 900 grunnet 5 spreads -->
  </div>
</section>

<section class="device device--ipad">
  <header class="device-label">iPad · 1024 × 768</header>
  <div class="frame" style="width:1024px; height:auto; min-height:768px; overflow:hidden;">
    <!-- iPad layout -->
  </div>
</section>

<section class="device device--iphone">
  <header class="device-label">iPhone 15 · 393 × 852</header>
  <div class="frame" style="width:393px; min-height:852px; overflow:hidden;">
    <!-- iPhone layout -->
  </div>
</section>
```

NB: Mål-skjermen er innholdstung (5 spreads + lenke-indeks). La frame-en
være `height:auto` så hele utgaven vises — ikke kutt på 900/768. Browser-
scroll innenfor hver frame er OK om Anders vil se hele.

Hver `device-label` er Tiny (10px Geist caps tracking 0.1em).
Hver `frame` har subtil 1px border + 4px radius for å antyde device-mockup.

Mellom hver seksjon: 96px luft + en hairline-separator med italic label
"*— iPad-utgave —*" og "*— iPhone-utgave —*" centered.

Inkluder:
- Tailwind CDN inline
- Google Fonts CDN (Instrument Serif italic, Geist variable, JetBrains Mono)
- Lucide inline SVG der det trengs (kun UI-utility, ikke shot-icons)
- CSS-variabler øverst (design.md seksjon 29)
- Norsk locale gjennomgående (komma desimal, NBSP-tusenskille, typografisk minustegn)
- All interaktivitet fungerer (count-up, bar-fyll, stroke-dashoffset, stagger)

---

## ETTER LEVERING

Gi kort oppsummering (under 200 ord):

1. **3 designvalg som styrker mål-skjermen** — hva som skiller dette fra
   generisk "X% av målet"-dashboard
2. **Hva du ville løftet i neste iterasjon** — én konkret ting per enhet
3. **Hva du er usikker på** — hvor trenger du Anders' input?
