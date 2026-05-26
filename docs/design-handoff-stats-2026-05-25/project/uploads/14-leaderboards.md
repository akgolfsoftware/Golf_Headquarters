# Design-prompt 14 — `/stats/leaderboards` — Tverrkategori-leaderboards

> Les `00-master-brief.md`.

**Side:** Cross-category leaderboards — alle topp 10s på én side
**Bruker:** Stat-nerden som vil scrolle. Folk som har sett én kategori og vil se alle.
**Hovedoppdrag:** Bli "dvelesiden" — der brukeren bruker 5+ minutter på å scrolle gjennom alle topplistene.

---

## Datakilder

Per liste, topp 10 i en kategori. Aggregerer både PGA Tour-stats og norske spillere:

```typescript
const LEADERBOARDS = {
  // PGA Tour
  pgaDriveDist:   { tour: "pga", year: 2026, kategori: "drive_dist", topp10: [...] },
  pgaSgTotal:     { tour: "pga", year: 2026, kategori: "sg_total", topp10: [...] },
  pgaFairwayPct:  { ... },
  pgaGirPct:      { ... },
  pgaPutts:       { ... },
  pgaScoringAvg:  { ... },

  // Korn Ferry + Euro
  kftSgTotal:     { tour: "kft", ... },
  euroSgTotal:    { tour: "euro", ... },

  // Norske amatører — beregnet fra PublicPlayerEntry
  norskeBesteSnitt2026:  Array<{ spiller, snitt, antall }>,  // beste snittscore i 2026
  norskeBesteSesongDiff: Array<{ spiller, fjor, iaar, diff }>,  // største forbedring
  norskeMestAktive2026:  Array<{ spiller, antallTurneringer }>,
  norskeYngsteTalent2009: Array<{ spiller, score, alder }>,  // 2009-årgangen
  norskeWagrTopp10:      Array<{ spiller, wagrRank }>,

  // Klubber
  klubberMestTurneringer: Array<{ klubb, antall }>,
  klubberMestSpillere:    Array<{ klubb, antall }>,

  // Curiosities
  laveste18HullsRunde:    Array<{ spiller, score, turnering, dato }>,  // hele DB
  flesteTopp10s2026:      Array<{ spiller, antall }>,
};
```

---

## Designoppdrag

**Filosofi:** En "wikipedia"-feel — masse data, men organisert i klare segmenter. Tabular dense. Brukeren skal kunne scrolle og finne tilfeldig interessant tall.

### 1. Hero — søketrigger

- Eyebrow: "AK GOLF STATS · LEADERBOARDS"
- Headline: "Alle topp-10-ene. *Ett sted*."
- Sub: 1 setning

**Inline søk:** "Søk i leaderboards..." input med autocomplete (når du skriver "drive", filtrer til drive-distance-leaderboards).

### 2. Kategori-strøk — sticky topp-bar

Etter hero, en sticky tab-bar:

```
[ PGA TOUR ]  Korn Ferry  Euro  Norske  Klubber  Kuriositeter
```

Smooth scroll til seksjonen + lime accent på aktiv.

### 3. PGA Tour-seksjon — 6 leaderboards i 3x2 grid

```
┌────────────────────┬────────────────────┬────────────────────┐
│ DRIVE DISTANCE     │ FAIRWAY-TREFF      │ GIR                │
│ 1. Rory M.   324y  │ 1. Akshay B.  72%  │ 1. Scottie S.  74% │
│ 2. ...             │ 2. ...             │ 2. ...             │
│ ...                │ ...                │ ...                │
├────────────────────┼────────────────────┼────────────────────┤
│ PUTTER/RUNDE       │ SCORING AVG        │ SG TOTAL           │
│ 1. Denny M.   27.2 │ 1. Scottie S. 68.1 │ 1. Scottie S. +2.5 │
│ ...                │ ...                │ ...                │
└────────────────────┴────────────────────┴────────────────────┘
```

Hver leaderboard-card:
- Mono caps header ("DRIVE DISTANCE")
- Lite sub-tekst (kategoriforklaring + "Sesong 2026")
- 10 rader med:
  - # (mono)
  - Spillernavn (font-sans, klikkbar)
  - Verdi (mono tabular-nums, lime hvis topp-3)
- Footer: "Se hele kategorien →"

### 4. Korn Ferry + Euro

Mindre seksjon, bare SG Total topp-10 for hver (mindre data tilgjengelig).

```
KORN FERRY            EUROPEAN TOUR
1. Player X  +2.4    1. Player Y  +2.1
2. ...               2. ...
```

### 5. Norske leaderboards — egen seksjon

VIKTIGSTE seksjonen for engasjement. Flere kategorier i 2x3 grid:

```
┌────────────────────┬────────────────────┬────────────────────┐
│ BESTE SNITT 2026   │ STØRSTE FORBEDRING │ MEST AKTIVE        │
│ 1. Anders H. 68.5  │ 1. Sofie L. −4.8   │ 1. Marius L. 28T   │
│ ...                │ ...                │ ...                │
├────────────────────┼────────────────────┼────────────────────┤
│ YNGSTE TALENT 09   │ WAGR TOPP 10       │ FLESTE TOPP-10S    │
│ ...                │ ...                │ ...                │
└────────────────────┴────────────────────┴────────────────────┘
```

### 6. Klubber-seksjon

Tabular leaderboard:

```
KLUBBER MED FLEST TURNERINGER ARRANGERT
1. Bærum Golfklubb         47
2. Oslo Golfklubb           42
3. Gamle Fredrikstad GK     38
...

KLUBBER MED FLEST SPILLERE I DATABASEN
1. Oslo Golfklubb          112
2. Bærum Golfklubb          89
...
```

### 7. KURIOSITETER — gøy data

Editorial mer enn analytisk:

```
LAVESTE 18-HULLS RUNDE NOENSINNE
62 — Anders Halvorsen
Srixon Tour 5, Bærum GK · 14. juni 2024
"Hadde 7 birdies og én eagle"
```

3-4 slike fun facts som cards.

### 8. "Se en spesifikk uke"

Tidsbasert filter — la bruker hoppe til "uke 21 2026"-leaderboards. Combobox med uke-velger.

### 9. Mersalg

Diskret bottom-banner:

> "Vil du være på en av disse listene? Spill turneringer, logg i PlayerHQ — vi tracker resten."

---

## Mobile-tilpasning

- Sticky kategori-strip blir horizontal scroll
- 3x2 grids blir 1-kolonne stack
- Hvert leaderboard-card får full bredde
- Kuriositeter får større typografi (de er emotionally engaging)

## Mikrointeraksjoner

- Sticky tab: lime underline animerer mellom tabs på klikk
- Leaderboard-rad: hover gir subtil row-highlight + "→" i høyre kant
- Kuriositeter: card flipper på hover for å vise mer detalj (optional, hvis vi vil)
- Søk-autocomplete: smooth dropdown med lime-prikker

---

## Inspirasjon

1. **basketball-reference.com/leaders** — wikipedia-of-leaderboards
2. **fbref.com/en/comps** — fotball-leaderboards på tvers av kategorier
3. **DataGolf.com** — sport-spesifikk leaderboard-aggregator

## Output

- Komplett page-sketch
- Leaderboard-card-pattern (template) i 3 varianter
- Sticky kategori-strip
- Kuriositets-card i isolasjon
- Mobile-flow
