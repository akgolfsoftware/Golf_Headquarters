# Design-prompt 04 — `/stats/pga/putt-explorer`

> Les `00-master-brief.md`.

**Side:** Putt-statistikk per avstand — egen UI fordi datastruktur er annerledes (per avstand, ikke per spiller)
**Bruker:** Spillere som vil forstå "hvorfor er korte putter så viktige?"
**Hovedoppdrag:** Vise at proffer ikke synker 100% fra 3m heller — putt er hardere enn folk tror.

---

## Datakilder

```typescript
const PUTT_DISTANCES: Array<{
  distanceMeters: number;       // 1, 2, 3, 4, 5, 6, 8, 10, 15, 20
  tourAvgSunkPct: number;       // 99, 94, 82, 64, 51, 42, 29, 23, 15, 10
  top10AvgSunkPct: number;      // 100, 97, 90, 75, 62, 53, 39, 31, 21, 15
  proximityNext: number;        // 0.3, 0.6, 0.8 ... meter til hull etter miss
}> = [ ... ];
```

Også: amatør-tabell (Broadie-data, kan hardkodes):
```
HCP 0:  3m: 60%   5m: 30%   10m: 6%
HCP 10: 3m: 45%   5m: 18%   10m: 3%
HCP 20: 3m: 30%   5m: 10%   10m: 1%
```

---

## Designoppdrag

### 1. Hero — myth-busting tone

- Eyebrow: "PGA TOUR · PUTT EXPLORER"
- Headline: "Selv proffer *bommer* fra 3 meter."
- Sub: "PGA Tour synker 82% fra 3m. Amatører tror tallet er høyere. Lek deg med data og se hvor stor forskjellen egentlig er."
- **Ingen KPI-strip her** — la grafikken være hero

### 2. INTERAKTIV PUTT-AVSTAND — sentral hero

Layout: full-bredde card. Veldig visuelt.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│          PGA TOUR synker [82%] fra [3 meter]           │
│              ↑ big lime tall   ↑ slider-verdi          │
│                                                         │
│   [──────────●────────────────────────]                 │
│   1m                                   20m              │
│                                                         │
│   ──────────────────────────────────────────────────    │
│                                                         │
│   PGA TOUR-SNITT      TOPP-10 PUTTERS                  │
│   82%                  90%                              │
│   ████████░░          █████████░                       │
│                                                         │
│   AMATØR HCP 0        AMATØR HCP 10                    │
│   60%                  45%                              │
│   ██████░░░░          ████░░░░░░                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Visuelle detaljer:**
- "82%" er en BIG lime mono i 80px
- "3 meter" til høyre er i forest 80px
- Slider er en "putt-line" — designet som en grønn green med en hull-flagg ved 20m-enden
- 4 bar-charts med ulike farger:
  - PGA Tour: forest (mest fremtredende)
  - Topp 10 putters: lime
  - HCP 0: muted-foreground
  - HCP 10: muted-foreground/60

**Narrativ tekst under (oppdateres med slider):**
- Fra 1-2m: "Selv proffer bommer her av og til. Konsentrasjon avgjør."
- Fra 3m: "Den klassiske 'birdie putt'-avstanden. Forskjellen mellom amatør og proff er størst her."
- Fra 5m: "PGA Tour synker hver tredje. Du? Statistikk fra Broadie sier hver fjerde."
- Fra 8-10m: "Lag-up-territorium. Proffer prioriterer 3-putt-unngåelse over chans for birdie."
- Fra 15-20m: "Ren chans. Tour-snittet er 15%. Bra første putt = god start på neste hull."

### 3. "Hvor du *taper* strokes" — analyse-seksjon

Etter slideren. Ny editorial-block.

- Eyebrow: "INNSIKT"
- Headline: "Tre puttavstander der amatører taper *mest*"
- 3 kort horisontalt:

| Avstand | Diff (HCP 10 vs Tour) | Implikasjon |
|---|---|---|
| 3m | -37%-poeng | "Lavhengende frukt. 30 putter à 5 min i uka = +1 birdie per runde." |
| 5m | -33%-poeng | "Speed-control. Amatører er 2x mer offensive enn de burde." |
| 1m | -1%-poeng | "Du synker like ofte som proffene. Glem ikke det." |

Hver kort: 
- Lime tall for "diff", 
- font-display headline ("3-meteren"), 
- 2-linjers tekst

### 4. Heatmap — full distribusjon

Visualisering: matrix av puttavstander x ferdighetsnivå.

```
                 1m     2m     3m     5m    10m    15m
PGA Tour         99%    94%    82%    51%   23%    15%
Topp 10         100%    97%    90%    62%   31%    21%
Scratch (HCP 0)  98%    85%    60%    30%    6%     2%
HCP 10           95%    72%    45%    18%    3%     1%
HCP 20           90%    55%    30%    10%    1%     0%
```

Layout som et heatmap:
- Hver celle har bakgrunn fra `bg-accent/40` (høyest %) til `bg-muted/20` (lavest %)
- Tall i mono inni
- Row labels venstre, col labels topp
- Sticky-headers på scroll
- Hover på celle: subtil border + tooltip med "PGA Tour synker 82% fra 3m. Det er ca 1 av 5 som bommer."

### 5. "Putt-myten" — editorial sidebar

Liten textboks plassert som "pull quote" mellom heatmap og mersalg:

> *"Amatører undervurderer 5-meteren og overvurderer 10-meteren. Tour-spillerne vet at 5 meter er gjennombrudd-avstanden — den de jobber hardest med."*
>
> — Mark Broadie, "Every Shot Counts"

Bruk italic + større typografi (Inter Tight italic, 24px) + grein-divider over og under.

### 6. Mersalg — kontekstuell

Forest-bakgrunn. Tema: putt-tracking i PlayerHQ.

- Headline: "Tracker du *putter per hull*?"
- Tekst: "PlayerHQ logger antall putter per hull og regner ut din synket-prosent per avstand. Sammenlign deg med PGA Tour på hver avstand — automatisk."
- CTA: "Prøv PlayerHQ gratis →"

### 7. Footer-nav

Crossref-strip til andre kategorier:
- "Lurer du også på drive distance?" → /stats/pga/drive-distance
- "GIR forutsier scoring — sjekk hvordan du ligger an" → /stats/pga/gir-pct

---

## Mobile-tilpasning

- Slider og 4 bar-charts: stables vertikalt
- Heatmap: horisontal scroll (sticky-headers), eller compact-versjon med 4 kolonner og 3 rader
- Pull-quote: full bredde, top/bottom borders

## Mikrointeraksjoner

- Slider: bar-charts animerer (200ms ease-out) når verdien endres
- Big tall: count opp/ned smooth
- Heatmap-celle hover: scale 1.05 + border-glow

---

## Inspirasjon

1. **fivethirtyeight.com NBA shot charts** — heatmap med fargegradient
2. **golfstat.com/stat-database** — tabular per-avstand data
3. **datagolf.com/putting** — interaktiv per-avstand visualisering

## Output

- Komplett page-sketch (high-fi)
- Interaktiv slider-blokk i alle states (3 ulike posisjoner)
- Heatmap-layout som standalone
- Mobile flow
