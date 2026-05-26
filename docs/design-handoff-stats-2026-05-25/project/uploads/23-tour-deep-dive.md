# Design-prompt 23 — `/stats/tour/[slug]` — Tour deep-dive

> Les `00-master-brief.md`.

**Side:** Dedikert deep-dive per tour (Srixon, OLYO, NGC, Østlandstour, evt. PGA/Euro/KFT)
**Datakilde:** Tournament filtrert på `tour`-felt + agreggert PublicPlayerEntry
**Hovedoppdrag:** Tour-fans skal finne alt om sin tour på ETT sted. SEO-magnet ("Srixon Tour vinnere historisk").

URL: `/stats/tour/srixon`, `/stats/tour/olyo`, `/stats/tour/garmin-ngc`, `/stats/tour/ostlandstour`

---

## Data tilgjengelig per tour

```typescript
const TOUR = {
  slug: "srixon",
  navn: "Srixon Tour",
  beskrivelse: "Norges fremste junior-tour (klasse J15, J19, G15, G19) siden 2018",
  region: "Norge",
  juniorTour: true,
  startAar: 2018,

  totalTurneringer: 71,        // siden start
  totalDeltakerRader: 6117,
  uniqueSpillere: 698,

  // Sesongspesifikke aggregeringer
  sesonger: Array<{
    year, antallTurneringer, antallDeltakere, snittScore,
    vinnere: Array<{ turnering, vinner, vinnerScore }>,
  }>,

  // All-time leaderboard for touren
  alltimeTopp: Array<{
    spiller, slug, antallTurneringer, antallSeire, snittPlassering, snittScore
  }>,

  // Kommende
  kommendeTurneringer: Array<{ navn, dato, klubb, antallPaameldte }>,

  // Klubber som arrangerer
  klubberArrangerer: Array<{ klubb, antall }>,
};
```

---

## Designoppdrag

### 1. Hero — tour-identitet

```
JUNIOR-TOUR · NORGE · 2018-

Srixon Tour.
                                          71 turneringer
                                          698 unike spillere
                                          siden 2018

[Logo eller illustrasjon]
```

- Stor tour-navn (font-display 80px, italic på "Tour")
- Kontekstuell sub (kategori + dekning + tidsspenn)
- KPI-tall høyre side
- Illustrasjon eller logo (kan starte uten)

### 2. "Om touren" — editorial intro

2-3 paragraphs:
- Hva er touren? (juniortour, hvor mange klasser, regional/nasjonal)
- Hvorfor er den viktig? (talentutvikling, mest spilte junior-tour i Norge)
- Hvor mange spiller? (gjennomsnitt per turnering, geografisk spredning)

### 3. Sesong-velger — sticky

```
SESONG:  [2018]  [2019]  [2020]  [2021]  [2022]  [2023]  [2024]  [2025]  [2026 (aktiv)]
```

Standard: nyeste komplette sesong eller current.

### 4. Sesongoversikt — dashboard

For valgt sesong:

```
SESONG 2025

ANTALL TURNERINGER       ANTALL DELTAKERE      SNITT FELT-STR
11                       948                    86

VINNER-MØNSTER (5 mest hyppige sesongseirere):
1. Anders Halvorsen   3 seire
2. Marius Larsen      2 seire
3. ...
```

### 5. ALLE TURNERINGER I SESONGEN — tabell

```
DATO       TURNERING              KLUBB         DELT.   VINNER          SCORE
15. juni   Srixon Tour 1          Bærum GK      88      Anders H.       −6
29. juni   Srixon Tour 2          Oslo GK       92      Marius L.       −4
...
```

- Klikkbart per rad → turneringsside
- Lime stjerne på majors (definert per tour)

### 6. ALL-TIME LEADERBOARD

```
DOMINERENDE SPILLERE NOENSINNE

#  Spiller            Karriere     Turn.    Seire    Snitt
1  Viktor Hovland     2017-2019    12       4        −2.4
2  Andreas Halvorsen  2018-2020    18       3        +1.2
3  Anders Halvorsen   2023-2026    14       2        −0.8
...
```

### 7. Klubber som arrangerer — fordelt

Horizontal bar-chart eller stacked liste:

```
Bærum GK          ████████ 12 turneringer
Oslo GK           ███████ 11
GFGK              █████ 7
Stavanger GK      ████ 5
...
```

Klikkbart per klubb (til `/stats/klubber/[slug]`).

### 8. Kommende turneringer

```
NESTE 5 TURNERINGER

26. mai · Srixon Tour 5 · Bærum GK · 47 påmeldt
14. jun · Srixon Tour 6 · Oslo GK · 32 påmeldt
...

         [ Se hele kalenderen → ]
```

### 9. "Talent klar for å bli pro" — featured spillere

Curated picks for spillere i touren som er på vei opp:

3-4 spillerkort (initial-glyph, navn, klubb, "watchlist"-grunn).

### 10. Statistikk-faktaboks

```
PUSSIG FAKTA OM SRIXON TOUR

• Yngste vinner: Anders Halvorsen, 15 år, 2019
• Laveste runde: 62 av Maria Olsen, 2024
• Mest spilte bane: Bærum GK (12 turneringer)
• Eneste internasjonale vinner: ingen (kun norske)
```

### 11. Mersalg

> "Spiller du på Srixon Tour? PlayerHQ logger runder automatisk når du melder deg på via vår booking. Spillere som logger, kommer høyere opp på leaderboards."

### 12. Andre tourer (navigasjon)

Footer-strip med 4 andre tourer:
- OLYO Juniortour
- Garmin Norges Cup
- Østlandstour
- PGA Tour (hvis vi vil)

---

## Mobile-tilpasning
- KPI-strip i hero: 2x2 grid
- Sesong-velger: horizontal scroll med snap
- Turneringsliste: kort i stedet for tabell
- Leaderboard: 3 kolonner (drop "Karriere")

## Mikrointeraksjoner
- Sesong-velger: lime underline glir mellom valgte
- Tour-tabeller: row-highlight på hover
- KPI-tall: count-up
- Bar-chart: bars fader inn med stagger

## Inspirasjon
- pgatour.com/season-page
- europeantour.com/season-stats
- DataGolf.com tour deep-dives

## Output
- Tour-page komplett sketch (én tour)
- Variations for 4 tourer (samme template, ulik mengde data)
- Mobile-flow

## Implementasjon-notater
- Dynamisk routing
- Krever ny aggregering på tour-nivå (kan bygges som materialized view eller computed på request med caching)
- ISR med revalidate 3600
- 4-5 tourer × 10 sesonger = ~40-50 unike pages
