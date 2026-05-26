# Design-prompt 25 — `/stats/regions` + `/stats/regions/[slug]` — Region-explorer

> Les `00-master-brief.md`.

**Sider:** Norge delt opp i golf-regioner (Øst, Vest, Midt, Nord, Sør)
**Datakilde:** Aggregert fra `Tournament.location`, `PublicPlayer.bio` (klubb-> region-mapping)
**Hovedoppdrag:** Regional patriotism + SEO ("golf i Øst-Norge", "Vestlandets beste juniorspillere")

---

## Data tilgjengelig

Region defineres ved klubb-mapping:
- **Øst:** Oslo, Akershus, Buskerud, Vestfold, Telemark, Innlandet
- **Vest:** Vestland, Rogaland
- **Midt:** Trøndelag, Møre og Romsdal
- **Nord:** Nordland, Troms, Finnmark
- **Sør:** Agder

```typescript
const REGION = {
  slug: "ost",
  navn: "Øst-Norge",
  fylker: ["Oslo", "Akershus", "Buskerud", "Vestfold", "Telemark", "Innlandet"],

  // Volum
  totalKlubber: 32,
  totalSpillere: 687,           // norske spillere fra denne regionen
  totalTurneringer: 156,         // arrangert i regionen
  proSpillere: 8,                // pro i regionen
  collegeSpillere: 12,

  // Topp spillere fra regionen
  toppSpillere: Array<{ slug, navn, klubb, snittScore, tier }>,

  // Klubber i regionen
  klubber: Array<{ slug, navn, antallSpillere, antallTurneringer }>,

  // Per tour
  turneringerPerTour: { srixon, olyo, ngc, ostlandstour },

  // Største klubber
  storsteKlubber: Array<{ navn, antallSpillere }>,
};
```

---

## DEL A — `/stats/regions` (oversikt)

### 1. Hero — Norgeskart

Stor Norgeskart-illustrasjon (SVG) med 5 regioner farget. Klikkbar.

- Eyebrow: "AK GOLF STATS · REGIONER"
- Headline: "Norsk golf, *region for region*."
- Sub: "Velg en region for å utforske klubber, spillere og turneringer."

### 2. 5 REGION-cards

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ ØST        │  │ VEST       │  │ MIDT       │  │ NORD       │  │ SØR        │
│            │  │            │  │            │  │            │  │            │
│ 32 klubber │  │ 24 klubber │  │ 14 klubber │  │ 6 klubber  │  │ 12 klubber │
│ 687 spil.  │  │ 412 spil.  │  │ 198 spil.  │  │ 67 spil.   │  │ 134 spil.  │
│            │  │            │  │            │  │            │  │            │
│ Se →       │  │ Se →       │  │ Se →       │  │ Se →       │  │ Se →       │
└────────────┘  └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

Hver card med subtle regional fargekode (samme som kart).

### 3. KPI-strip — Norge total

```
NORSKE GOLFKLUBBER          NORSKE SPILLERE I DATABASEN
88                          1 498

NORSKE PRO-SPILLERE         NORSKE I COLLEGE
12                          22
```

### 4. "Hvem dominerer hvor?" — fakta

3-4 kuratert fakta:
- "Mest pro-spillere kommer fra Øst (8 av 12)"
- "Vest har flest spillere per klubb (17)"
- "Sør har høyest snitt-prestasjon på Srixon Tour"

---

## DEL B — `/stats/regions/[slug]` (region-detalj)

### 1. Hero — regional identitet

```
REGION

Øst-Norge
                                                  Oslo · Akershus
                                                  Buskerud · Innlandet
                                                  Vestfold · Telemark

32 KLUBBER     687 SPILLERE     156 TURNERINGER     8 PRO
```

- Stor region-navn
- Liste over fylker
- 4-tall KPI

### 2. Region-kart — mini

Mindre versjon av Norgeskart, region highlightet, klubber som pins.

### 3. KLUBBER I REGIONEN — sortert tabell

```
KLUBB                  ANTALL    PRO    COLLEGE    TURN.    JUNIOR-RANK
Oslo Golfklubb         112       3      4          42       Topp 3
Bærum Golfklubb        89        1      2          47       Topp 5
GFGK                   73        0      1          38       Topp 10
...
```

Klikkbart per klubb.

### 4. TOPP SPILLERE FRA REGIONEN

```
TOPP 10 FRA ØST-NORGE

#  Spiller            Klubb         Tier      Snitt 2026
1  Viktor Hovland     Oslo GK       Pro PGA   70.2
2  Anders Halvorsen   Bærum GK      Pro       71.8
3  ...
```

### 5. "Spillere på vei opp"

Curated picks fra regionen — 3-4 cards med watch-list-spillere.

### 6. KOMMENDE TURNERINGER

Kalender-stripe med kommende turneringer arrangert i regionen.

### 7. FAKTA-boks

```
ØST-NORGE I TALL

• Eldste klubb: Oslo Golfklubb (1924)
• Største klubb: Oslo GK (112 spillere)
• Mest pro-talent: Oslo GK (3 pro-spillere)
• Mest arrangerte turneringer: Bærum GK
• Beste registrerte runde: 62 (Bærum, 2024)
```

### 8. Mersalg

Region-spesifikk tone:

> "Spiller du i Øst-Norge? PlayerHQ er bygget av AK Golf Academy (Oslo + Bærum). Vi kjenner banene dine."

### 9. Andre regioner

Footer: 4 andre regioner som kort.

---

## Mobile-tilpasning
- 5 region-cards: 2x3 grid (Sør står alene under)
- Region-tabeller: 3 kolonner
- Kart: simpler representation

## Mikrointeraksjoner
- Norgeskart: regioner highlightes på hover, fader til full opacity ved klikk
- Region-cards: subtil lift + farge-glow
- Klubb-rad i tabell: lime row-highlight på hover

## Inspirasjon
- Wikipedia "Sport in [region]"-sider
- nfl.com regional divisions
- norgesgolf.no regional-sider

## Output
- `/stats/regions` med Norgeskart
- `/stats/regions/[slug]` komplett sketch
- Region-card-pattern
- Norgeskart-SVG (kan starte enkelt)
- Mobile-flow

## Implementasjon-notater
- Klubb→region-mapping må kodes (88 klubber × 1 gangs arbeid)
- Eller: legg til `region`-felt i Klubb-tabell når den lages
- ISR med revalidate 3600
