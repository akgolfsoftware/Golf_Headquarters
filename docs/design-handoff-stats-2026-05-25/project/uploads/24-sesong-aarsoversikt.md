# Design-prompt 24 — `/stats/2026` (eller `/stats/sesong/[aar]`) — Sesongoversikt

> Les `00-master-brief.md`.

**Side:** "Sesongen 2026 i tall" — komplett oppsummering av et helt år
**Datakilde:** Alt fra Tournament + PublicPlayerEntry + PgaPlayerSeason for året
**Hovedoppdrag:** SEO-magnet og årlig "highlights"-side. "Året 2026 i norsk golf" — utgangspunkt for delbart innhold.

URL: `/stats/2026` (current year), `/stats/sesong/2025` (historic), eller `/stats/2025` direkte

---

## Data tilgjengelig

```typescript
const SESONG = {
  aar: 2026,
  status: "pågående",            // "pågående" | "ferdig"
  startDato: "2026-04-01",       // første turnering
  sluttDato: "2026-09-30",       // siste forventede

  // Volum
  totalTurneringer: 187,
  totalDeltakerRader: 4 234,
  totalUniqueSpillere: 1 287,

  // Per tour
  perTour: {
    srixon: { turneringer, deltakere, snittScore },
    olyo: { ... },
    ngc: { ... },
    ostlandstour: { ... },
  },

  // Norske milepæler
  norskeMilepaeler: Array<{
    type: "vinst" | "rekord" | "topp10" | "pro-debut",
    spiller, beskrivelse, dato,
  }>,

  // Største historier (curated)
  hovedhistorier: Array<{
    overskrift, beskrivelse, dato, lenke
  }>,

  // Rekorder satt i sesongen
  rekorder: {
    laveste18Hull: { score, spiller, turnering, dato },
    flesteSeire: { spiller, antall },
    yngstevinner: { spiller, alder, turnering },
  },

  // Vinner-liste
  alleVinnere: Array<{ turnering, vinner, slug, dato }>,
};
```

---

## Designoppdrag

**Filosofi:** Magazine-spread feel. Stor typografi, eksitering uten å være cheesy. Som forsiden av "Golf Norge årsrapport 2026".

### 1. Hero — sesongbrand

```
DEN NORSKE GOLF-SESONGEN

2026
                                                  Sesongen så langt
                                                  
187 turneringer    1 287 spillere    4 234 resultater
```

- Stor "2026" som hero-element (font-display, 200px italic lime)
- Eyebrow tekst over
- KPI-tall under

### 2. Mini-NAV — sticky for lange sider

Sticky inhold-tabell:
```
01 Året i tall   ·   02 Norske milepæler   ·   03 Beste runder   ·   04 Alle vinnere
```

Smooth scroll til seksjon, lime underline-indikator.

### 3. SEKSJON 01 — Året i tall

Stor KPI-grid (4-6 store tall):

```
TURNERINGER ARRANGERT         NORSKE I AKSJON
187                           1 287

NYE PRO-DEBUTERER             SCRATCH OG BEDRE
2                             47 spillere

BESTE 18-HULL SETT            HØY-OG-LAVE TURNERINGER
62 (Anders H.)                Largest field: 142 (Garmin)
```

Hver KPI: stor mono, kontekstuell sub.

### 4. SEKSJON 02 — Norske milepæler

Tidslinje av viktige hendelser kronologisk:

```
   ●  14 APR    Viktor Hovland T-5 i Masters
   ●  3 MAI     Anders Halvorsen vinner Srixon Tour 5
   ●  22 MAI    Maria Olsen → Stanford-commit
   ●  28 MAI    63 av Marius L. (Bærum) — sesongens beste
   ●  ...
```

Mono dato + editorial beskrivelse. Klikkbart for detalj.

### 5. SEKSJON 03 — Hovedhistorier

Editorial card-grid, 6 store cards:

```
SESONGENS STØRSTE HISTORIE

Anders Halvorsen vinner 3 av 5 Srixon-turneringer
"Mest dominante sesong av en 18-åring siden Hovland i 2017"
                                           Les hele historien →
```

Lenker til `/stats/blogg/[slug]` hvis artikkel finnes.

### 6. SEKSJON 04 — Rekorder

3-kolonne grid:

```
LAVESTE RUNDE          FLESTE SEIRE           YNGSTE VINNER
62                     3                       16 år
Anders Halvorsen       Anders Halvorsen        Marius Larsen
Bærum GK · 4. mai      Srixon Tour 1, 3, 5     Srixon 4 · 17. mai
```

### 7. SEKSJON 05 — Alle vinnere

Tabular liste over alle turneringsvinnere i sesongen:

```
TUR         DATO        TURNERING                     VINNER             SCORE
PGA         14. apr     Masters                       Scottie Scheffler  −12
Srixon      18. apr     Tour 1 (Bærum)                Anders H.          −6
OLYO        25. apr     Tour 1 Øst                    Sofie N.           −2
...
```

Filtrerbart per tour.

### 8. PER-TOUR oppsummering

Mini-cards for hver tour:

```
SRIXON TOUR 2026
11 turneringer · 948 deltaker-rader · Snittscore 76.4
Dominerer: Anders Halvorsen (3 seire)
                                        Se full sesong →
```

### 9. Mersalg

> "Logg dine egne runder i 2026 — så er du med i neste års sesongoversikt."

### 10. Andre sesonger

Footer:
- "Sesongen 2025 ←"
- "Sesongen 2024"
- "Alle sesonger 2016-2026 →"

---

## Mobile-tilpasning
- "2026"-hero blir smaller (100px) men beholder visuell tyngde
- KPI-grid: 2 kolonner
- Tidslinje: vertikal mer komprimert
- Tabeller: 4 kolonner

## Mikrointeraksjoner
- "2026"-tall: subtil pulserings-animasjon ved page-load
- Tidslinje: hver event fader inn med stagger ved scroll
- KPI-tall: count-up animasjon
- Sticky-nav: lime underline glir smooth mellom seksjoner

## Inspirasjon
- "The Athletic — Year in Review"-sider
- ESPN Year in Sport
- spotify.com/wrapped på desktop
- New York Times sport-årsrapport

## Output
- Komplett page-sketch
- Tidslinje-pattern
- Hovedhistorie-card-pattern
- Mobile-flow

## Implementasjon-notater
- ISR med revalidate på 86400 (24t) — sesongen oppdateres daglig
- Auto-generert: server-side aggregering av alle år-spesifikke metrikker
- Genereres for hvert år tilbake til 2016
- OpenGraph-image per sesong (stort årstall + 3 highlights)
