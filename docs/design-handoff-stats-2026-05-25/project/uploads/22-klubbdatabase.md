# Design-prompt 22 — `/stats/klubber` + `/stats/klubber/[slug]` — Klubbdatabase

> Les `00-master-brief.md`.

**Sider:** Søkbar database over norske golfklubber (~100-150 klubber basert på spillerdata)
**Datakilde:** Aggregert fra `PublicPlayer.bio` (klubb-info) + `Tournament.location`
**Hovedoppdrag:** Klubbene er stolthet — SEO-magnet for "Bærum GK medlemmer" og "Oslo GK turneringer"

---

## Data tilgjengelig

```typescript
// Aggregert fra alle PublicPlayers med samme klubb
const KLUBB = {
  slug: "baerum-gk",
  navn: "Bærum Golfklubb",
  kortNavn: "Bærum GK",
  region: "Øst",                  // utledes fra location/by

  // Spillere
  totalSpillere: 89,              // i vår database
  spillereProTier: 3,
  spillereCollegeTier: 4,
  spillereJuniorTier: 32,
  spillereAmatorTier: 50,

  // Topp spillere (sortert på sgTotal/snittscore)
  toppSpillere: Array<{ slug, navn, fodselsAr, snittScore, bestesesong }>,

  // Turneringer arrangert her (fra Tournament.location)
  turneringerArrangert: number,    // totalt antall
  kommendeTurneringer: Array<{ slug, navn, dato, tour }>,

  // Beste runder spilt her
  besteRunder: Array<{ score, spiller, dato, turnering }>,

  // Stats
  snittScoreAlleNorskeHer: number, // alle spillere som har spilt en turnering her
};
```

---

## DEL A — `/stats/klubber` (liste)

### 1. Hero
- Eyebrow: "AK GOLF STATS · NORSKE KLUBBER"
- Headline: "Alle norske *golfklubber*."
- Sub: "100+ klubber. Hvem produserer flest talenter? Hvor arrangeres mest?"

### 2. Stats-strøk
```
100+ klubber         12 regioner         287 turneringer arrangert
i databasen          dekket              siden 2016
```

### 3. Søkebar + filter
- Søkeboks: "Søk klubb..."
- Filter-pills: REGION (Øst/Vest/Midt/Nord/Sør)
- Sortering: "Flest spillere" (default), "Mest turneringer", "Beste snitt", "Mest pro-talent"

### 4. Featured — topp-3-klubber

Tre store cards øverst:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ FLEST SPILLERE   │  │ MEST TURNERINGER │  │ MEST PRO-TALENT  │
│                  │  │                  │  │                  │
│ Oslo Golfklubb   │  │ Bærum GK         │  │ Oslo GK          │
│ 112 spillere     │  │ 47 turneringer   │  │ 3 PGA-spillere   │
│                  │  │                  │  │                  │
│ Se klubb →       │  │ Se klubb →       │  │ Se klubb →       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 5. Klubbliste (kort-grid)

3-kolonne grid, hver klubb-card:
```
┌─────────────────────────────────┐
│ BÆRUM GOLFKLUBB                 │
│ Bærum · Øst                     │
│                                 │
│ 89 SPILLERE | 47 TURNERINGER    │
│                                 │
│ Beste 18-hull: 62 (Anders H.)   │
│                                 │
│ Se klubb →                      │
└─────────────────────────────────┘
```

### 6. Mersalg
"Er du medlem av en av disse? Logg runder i PlayerHQ — bli en del av klubbens statistikk."

---

## DEL B — `/stats/klubber/[slug]` (klubb-detalj)

### 1. Hero — klubbens identitet

```
KLUBB · ØST · AKERSHUS

Bærum Golfklubb
                                          1985 · 18 hull
                                          Slope 132 · CR 71.5

89 SPILLERE      47 TURNERINGER      LAVESTE RUNDE
i databasen      arrangert            62
```

- Editorial hero med stor klubbnavn
- 4 KPI-tall

### 2. "Spillerne våre" — sortert tabell

Topp 20 spillere knyttet til klubben, sortert etter snittscore eller WAGR-rank.

```
#  Spiller            Alder    Beste år    Tier
1  Anders Halvorsen   24       68.5        Pro PGA
2  Maria Olsen        21       70.2        College D1
3  Kris Andersen      19       72.1        Amatør
...
```

### 3. Spiller-distribusjon — donut-chart

Donut som viser fordeling:
- Pro: 3
- College: 4
- Junior: 32
- Amatør: 50

### 4. "Turneringer her" — kronologisk

Liste over kommende + nylige turneringer arrangert på klubbens bane:

```
KOMMENDE
26. mai · Srixon Tour 5 (47 spillere)
14. jun · Klubbmesterskap (lokal)

NYLIG
12. mai · Eclectic Tour finale (gjennomført, vinner: Anders H.)
4. mai · OLYO Øst 5 (gjennomført)
```

### 5. "Beste runder spilt her" — leaderboard

```
LAVESTE 18-HULL PÅ BANEN

#1 · 62 · Anders Halvorsen · 14. jun 2024 · Srixon Tour 5
#2 · 63 · Maria Olsen      · 22. aug 2024 · OLYO Øst 8
#3 · 64 · Marius L.        · 5. mai 2025 · Klubbmesterskap
...
```

### 6. Bane-info-stripe

```
LENGDE: 6 234m     SLOPE: 132     CR: 71.5     PAR: 72
```

Lenker til `/stats/baner/[slug]` hvis vi har bane-data.

### 7. "Snittscore på banen" — kontekst

```
NORSKE SPILLERES SNITT PÅ DENNE BANEN: 76.4
PGA TOUR-SNITT GENERELT: 70.5
SCRATCH-SPILLERS FORVENTET: 72-74
```

### 8. Klubb-link
- Hjemmeside (ekstern)
- Adresse
- Maps-lenke

### 9. Mersalg
"Er du medlem av Bærum GK? Logg runder i PlayerHQ — bli ranket blant klubbens spillere."

---

## Mobile-tilpasning
- Featured-cards stables (1 kolonne)
- Klubb-liste: 1 kolonne kort
- Profil: KPI-strip blir 2x2, tabeller får færre kolonner

## Mikrointeraksjoner
- Klubb-card: 4px lift + lime-glow på hover
- Donut: segment fader inn ved hover med tooltip
- Bestes-runder-leaderboard: rad-highlight på hover

## Inspirasjon
- resy.com restaurant-grid
- collegegolfstats.com team-database
- nfl.com team-pages

## Output
- `/stats/klubber` komplett sketch
- `/stats/klubber/[slug]` komplett sketch
- Klubb-card-pattern
- Mobile-flow

## Implementasjon-notater
- Klubber agreggeres run-time fra `PublicPlayer.bio` (regex på "Klubb: X")
- Eller: lag ny `Klubb`-tabell med materialiserte aggregeringer (cron-basert)
- Sitemap auto-genereres
- OpenGraph per klubb
