# Design-prompt 13 — `/stats/baner` + `/stats/baner/[slug]` — Banedatabase

> Les `00-master-brief.md`.

**Side:** Søkbar database over norske golfbaner (start: ~50 baner med data)
**Bruker:** Spillere som vurderer å spille en bane · Foreldre som planlegger turneringer · SEO-trafikk ("Bærum GK slope rating")
**Hovedoppdrag:** SEO-magnet og praktisk verktøy. Hver klubbside er en separat landing.

---

## Datakilder

Ny Prisma-modell `Bane` (eller utvid `CourseDefinition`):

```typescript
const BANE = {
  slug: "baerum-gk",
  navn: "Bærum Golfklubb",
  kortNavn: "Bærum GK",
  klubb: "Bærum Golfklubb",       // kan være samme som navn
  region: "Øst",
  kommune: "Bærum",
  fylke: "Akershus",
  hjemmeside: "https://baerumgk.no",

  // Tee-info (vi kan ha flere tee-bokser)
  tees: Array<{
    farge: "Hvit" | "Gul" | "Rød" | "Blå",
    lengdeMeter: 6234,
    slope: 132,
    courseRating: 71.5,
    par: 72,
  }>,

  // Beskrivelse
  bio: "9-hulls links-bane bygget i 1985 ...",
  antallHull: 18,
  oppstartsaar: 1985,

  // Stats fra våre data
  totaltAntallTurneringer: 47,    // antall turneringer arrangert her
  spillereSomHarSpilt: 287,        // antall unike spillere i vår DB
  lavesteRundeRegistrert: { score: 62, spiller: "...", dato: ... },
  snittScoreAlleNorske: 76.4,

  // Geografisk
  latitude, longitude,             // for kart

  // Bilder (kan være null først)
  hovedBilde: string | null,
  galleri: Array<string>,

  // Kommende turneringer her
  kommendeTurneringer: Array<{ navn, dato, tour }>,
};

const ALLE_BANER: Array<Pick<Bane, "slug" | "navn" | "region" | "antallHull" | "totaltAntallTurneringer">>;
```

---

## Designoppdrag

### DEL A — `/stats/baner` (liste/søk)

### 1. Hero — geografi som heading

- Eyebrow: "AK GOLF STATS · BANER"
- Headline: "Alle *norske* golfbaner."
- Sub: "Vanskelighetsgrad, slope, course rating + vår statistikk fra ekte turneringer."

### 2. Statistikk-strøk

```
50+ baner            287 turneringer      1 547 spillere
i databasen          arrangert            har spilt her
```

### 3. Søkebar + filter

- Stor søkeboks: "Søk bane eller klubb..."
- Filter-pills:
  - REGION: [Alle] [Øst] [Vest] [Midt] [Nord] [Sør]
  - LENGDE: [Alle] [Kort (<5500m)] [Standard] [Lang (>6500m)]
  - SLOPE: [Alle] [Easy (<120)] [Standard (120-130)] [Hard (130-140)] [Tough (>140)]

### 4. KART — full-bredde Norge-kart

Interaktivt kart (recharts eller mapbox/leaflet hvis vi vil) med pins per bane.

- Klikk pin → preview-popup med banenavn + slope + "Se bane →"
- Region-zoom-knapper på siden
- Mobile: kollapser til list-view by default, kart som "Vis kart"-button

### 5. Banegrid

Hver bane = card:

```
┌──────────────────────────────────────┐
│  [Bilde av bane / hovedbilde]        │
│                                       │
│  Bærum Golfklubb                     │
│  Bærum · Øst                          │
│                                       │
│  6 234 m · Slope 132 · CR 71.5        │
│  18 hull · Par 72                     │
│                                       │
│  ★ 47 turneringer arrangert          │
└──────────────────────────────────────┘
```

- Hovedbilde øverst (16:9). Hvis ingen, vis SVG-placeholder av banekart.
- Navn (font-display 22px)
- Lokasjon (muted)
- Stats-strip i mono
- Bunn: stats fra vår DB med stjerne-ikon
- Hele kortet er klikkbart

Grid: 3 kolonner desktop, 2 tablet, 1 mobile.

### 6. "Region-explorer"

Hvis bruker velger en region: vis dedikert overview-block med:
- Antall baner i regionen
- Beste-kjente bane (mest turneringer arrangert)
- Region-specifikk fact

### 7. Mersalg

Mindre fremtredende her. Lite footer-banner:

> "Spiller du på en av disse banene? Logg runden i PlayerHQ — vi regner ut SG og holder regnskap."

---

### DEL B — `/stats/baner/[slug]` (bane-detalj)

### 1. Hero — banens identitet

Bilde/placeholder dominerer øverst:

```
┌─────────────────────────────────────────────┐
│  [Stort hovedbilde av banen — 32:9 ratio]  │
│                                              │
│                                              │
└─────────────────────────────────────────────┘

Bærum Golfklubb
Bærum, Akershus · 1985 · 18 hull

[Tee-velger: Hvit / Gul / Rød / Blå]

LENGDE       SLOPE      CR        PAR
6 234 m      132        71.5      72
```

### 2. "Om banen" — editorial

Inter Tight body-text:

> "Bærum Golfklubb er en av Norges mest historiske ... Bygget i 1985 av arkitekt X. Banen er kjent for sine elevasjoner og raske greener."

- 2-3 paragraphs
- Subtil grein-divider over og under

### 3. Vår statistikk

```
TURNERINGER ARRANGERT HER     287 NORSKE HAR SPILT     LAVESTE RUNDE
47                            i vår database            62 — Anders H., 2024
```

### 4. "Hvem dominerer her?" — leaderboard

Topp 10 spillere som har spilt MEST eller HATT BEST snittscore her.

```
#    Spiller            Antall runder    Snitt    Beste
1    Anders Halvorsen   18              68.4      62 (2024)
2    Maria Olsen         14              70.2      66 (2025)
...
```

### 5. Score-distribusjon — histogram

Recharts histogram av alle scores spilt på banen:

```
SCORE-FORDELING
█ <70:     3
██ 70-75:  18
████████ 75-80: 47
██████ 80-85: 31
██ 85+: 14
```

"Snitt for alle norske: 76.4 · Tour-snitt: 68"

### 6. KOMMENDE TURNERINGER — liste

```
26. MAI       Srixon Tour 5
              Junior · 47 spillere meldt på · [Se påmeldte →]
14. JUNI      Klubbmesterskap Senior
              Lokal · Påmelding stengt
...
```

### 7. KART + lokasjon

- Stort embedded Google Maps eller statisk Mapbox-bilde
- Adresse + hjemmeside-lenke
- Avstand fra Oslo S (eller annen referanse)

### 8. Tee-sammenligning

Hvis banen har flere tees, vis comparison-tabell:

```
TEE     LENGDE    SLOPE    CR      PAR
Hvit    6 234m    132      71.5    72
Gul     5 856m    128      69.5    72
Rød     5 234m    121      67.0    72
```

### 9. "Lignende baner"

Footer-strip med 4-6 baner i samme region eller med lignende vanskelighetsgrad.

### 10. Mersalg — banespill

Kontekstuelt:

> "Skal du spille Bærum GK? Logg runden i PlayerHQ — vi vet hva du burde forvente basert på din SG."

---

## Mobile-tilpasning

**For `/stats/baner`:**
- Kart kollapser, vises som "Vis kart"-knapp
- Grid blir 1 kolonne
- Filter-pills horizontal scroll

**For `/stats/baner/[slug]`:**
- Hero-bilde: 16:9 i stedet for 32:9
- KPI-tall stables (2x2 grid)
- Score-histogram smaller
- Kart full-bredde

## Mikrointeraksjoner

- Kart-pin: hover viser preview-popup med smooth fade-in
- Bane-card: hover gir 4px lift + lime border-glow
- Score-histogram: bars animerer in (300ms stagger) ved scroll
- Tee-velger: bytte tee oppdaterer KPI-tall med smooth count

---

## Inspirasjon

1. **resy.com** — restaurant-database med kort-grid + filter + kart
2. **golfclubatlas.com** — bane-deep-dives med arkitekturhistorikk
3. **swingbyswing.com/courses** — kommersiell US bane-database

## Output

- `/stats/baner` komplett sketch
- `/stats/baner/[slug]` komplett sketch
- Bane-card-pattern i 3 varianter (med bilde / placeholder / hover)
- Hero med hovedbilde
- Tee-velger interaksjon
- Mobile-flow for begge sider

---

## Implementasjon-notater

- Bane-data må mates manuelt eller via NGF-import (vi har dem ikke ennå)
- 50 baner = manuell innfylling à 5-10 min hver = 1 dags arbeid
- Eller: scrape golf.no eller ngf.no for grunnleggende data
- Hovedbilde kan være Google Street View-snapshot i mangel av bedre bilder
