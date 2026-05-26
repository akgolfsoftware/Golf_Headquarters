# Design-prompt 21 — `/stats/pga/spillere` + `/stats/pga/spillere/[dg_id]` — PGA-spillerdatabase

> Les `00-master-brief.md`.

**Sider:** Søkbar database over alle PGA/Euro/KFT-spillere (1 299 stk) + individuell profilside
**Datakilde:** `PgaPlayerSeason` — synket ukentlig fra DataGolf
**Hovedoppdrag:** Den "manglende biten" — vi har DataGolf-data men ingen dedikert spillerprofil-side.

---

## Data tilgjengelig

```typescript
// 1 299 spillere fordelt på 3 tours (PGA: 433, Euro: 433, KFT: 433)
const SPILLER = {
  dgPlayerId: 12345,
  playerName: "Rory McIlroy",
  country: "Northern Ireland",
  tour: "pga",
  year: 2026,
  rounds: 87,
  avgScore: 70.2,
  driveDist: 318.5,
  fairwayPct: 58.4,
  girPct: 71.2,
  puttsPerRound: 28.4,
  scrambling: 65.3,
  sgTotal: 1.92,
  sgOtt: 0.61,
  sgApp: 0.84,
  sgArg: 0.18,
  sgPutt: 0.29,
};
```

---

## DEL A — `/stats/pga/spillere` (liste)

### 1. Hero
- Eyebrow: "PGA TOUR · ALLE SPILLERE"
- Headline: "*1 299* spillere. *3* tourer."
- Sub: "Stats-database over alle aktive spillere på PGA Tour, European Tour og Korn Ferry."

### 2. KPI-strip
```
PGA TOUR    EUROPEAN TOUR    KORN FERRY    SAMLET
433         433              433           1 299
```

### 3. Søkebar + filter
- Søkeboks med autocomplete (navn)
- Filter-pills: TOUR (PGA/Euro/KFT/Alle), LAND (10 mest hyppige)
- Sortering: SG Total (default), Drive Dist, Scoring Avg, Fairway %

### 4. Spillerliste — virtualized tabular
DataGolf-stil dense tabell, paginert (50 per side eller infinite scroll):

```
#   Spiller            Land    Tour   Runder   SG TOTAL    DRIVE   FAIRWAY  GIR    SCORING
1   Scottie Scheffler  USA     PGA    81       +2.45      298.4    62%     71%    68.4
2   Rory McIlroy       NIR     PGA    87       +1.92      318.5    58%     71%    70.2
...
```

- Klikkbar rad → `/stats/pga/spillere/[dg_id]`
- Mono tabular-nums
- Lime highlight på topp-5 i hver stat-kolonne
- Norske spillere får 🇳🇴-glyph (SVG) + bakgrunn `bg-accent/10`

### 5. Mersalg
Diskret bottom-banner: "Vil du sammenligne deg med en av disse? → SG-sammenligning"

---

## DEL B — `/stats/pga/spillere/[dg_id]` (profil)

### 1. Hero — spiller-portrett
```
PGA TOUR · 2026

Rory McIlroy
                                          🇮🇪 Northern Ireland
                                          87 runder spilt

SG TOTAL    SG: OTT    SG: APP    SG: ARG    SG: PUTT
+1.92       +0.61      +0.84      +0.18      +0.29
```

- Stort spiller-navn (font-display, italic på fornavn)
- 5-tall KPI-strip

### 2. RADAR — SG-fordeling vs Tour-snitt
Recharts radar: spiller (forest) vs Tour-snitt (lime stiplet). 4 akser.

### 3. Stats-grid — alle KPI per kategori
2x3 grid med store mono-tall:
- Drive Distance + Tour-snitt-sammenligning
- Fairway-treff %
- GIR %
- Putter per runde
- Scoring Average
- Scrambling %

Hver med:
- BIG mono tall
- Tour-rangering ("#3 av 433")
- Percentile-bar visuelt

### 4. "Hvor de vinner strokes" — bar-chart
Horizontal bar-chart som viser SG-distribusjon. Lime hvor positiv, varm sand hvor negativ.

### 5. Tour-sammenligning
Hvis spilleren har data på flere tourer (PGA + Euro), vis side-by-side tabell.

### 6. Norske spillere — spesial
Hvis dgPlayerId matcher en norsk spiller i `PublicPlayer`-tabellen:
- Vis ekstra section: "Norske turneringsresultater"
- Lenke til `/stats/spillere/[slug]` for full norsk historikk

### 7. "Sammenlign meg med"-CTA
Stor CTA: "Hvordan ligger du an mot Rory? → SG-sammenligning"
Setter `?ref=12345` så onboarding-skjemaet pre-velger denne spilleren.

### 8. Eksterne lenker
Footer: DataGolf-profil, PGA Tour-profil, Wikipedia (hvis tilgjengelig)

---

## Mobile-tilpasning
- Liste: tabular kollapser til "kort"-grid med 3-4 KPI per kort
- Filter: horizontal-scroll-strip
- Profil: KPI-strip blir 2x3 grid, radar fortsetter sentral

## Mikrointeraksjoner
- Liste-rad: subtil row-highlight på hover
- Norske spillere får lime-glow ved hover
- Radar: animeres in fra senter
- Percentile-bars: fill animeres (300ms stagger)

## Inspirasjon
- datagolf.com/player-search + player-profile (direkte ekvivalent)
- basketball-reference.com player profiles
- The Athletic golf player profiles

## Output
- Liste-side komplett sketch
- Profil-side komplett sketch
- Spiller-rad-pattern (med norsk-variant)
- Mobile-flow for begge

---

## Implementasjon-notater
- Dynamisk routing på dgPlayerId
- ISR med revalidate 3600
- OpenGraph-image per spiller via next/og (forest + navn + topp 3 stats)
- Sitemap auto-genereres for alle 1 299 spillere
