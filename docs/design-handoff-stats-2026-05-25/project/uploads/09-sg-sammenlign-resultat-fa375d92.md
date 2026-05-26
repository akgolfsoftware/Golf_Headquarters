# Design-prompt 09 — `/stats/sg-sammenlign/resultat/[id]` resultat-side

> Les `00-master-brief.md`.

**Side:** `akgolf.no/stats/sg-sammenlign/resultat/[id]` — den siden brukeren JOBBET seg gjennom flere steg for å komme til
**Bruker:** Ferskt-signed-up bruker som akkurat la inn sine SG-tall
**Hovedoppdrag:** Wow-effekt + delbart + konvertering. Brukeren skal tenke "dette må jeg vise noen", og deretter "OK, jeg må prøve PlayerHQ".

---

## Datakilder

```typescript
const SAMMENLIGNING = {
  id, userId, createdAt,
  refPlayerName: "Rory McIlroy",
  refTour: "pga",
  refYear: 2026,
  estPgaTourScore: 82.4,
  estHcp: 8.0,
  sgDiffTotal: 4.2,    // ref.sgTotal − bruker.sgTotal
};

const BRUKER_SG = {
  sgOtt, sgApp, sgArg, sgPutt, sgTotal,  // brukerens tall
  snittScore: 78,
  antallRunder: 20,
};

const REF_SG = {       // hentet fra PgaPlayerSeason
  sgOtt, sgApp, sgArg, sgPutt, sgTotal,
  driveDist, country,
};

const SAMMENLIGNING_DIFF = {
  ott: number,         // ref − bruker
  app, arg, putt, total,
  storsteGap: { kategori, diff },
};
```

---

## Designoppdrag

Dette er **THE money page** av hele Stats-produktet. Designet skal være delbart (screenshot-vennlig) og emotionelt — brukeren skal kjenne både "vekstpotensiale" og "dette er gøy".

### Layout-paradigme: "magazine spread"

Tenk forsiden av en sportsavis — én historie, mange små moduler som støtter den.

### 1. Breadcrumb

Diskret: "← SG-sammenligning" venstre topp.

### 2. Hero — to-spillers showdown

```
┌───────────────────────────────────────────────┐
│                                               │
│               EYEBROW: DIN SAMMENLIGNING      │
│                                               │
│                                               │
│           Anders        VS         Rory      │
│           Kristiansen              McIlroy    │
│                                               │
│             SG: −2.1                SG: +2.1  │
│             ●                       ●         │
│                                               │
│                                               │
│              Sesong 2026 · PGA TOUR          │
│                                               │
└───────────────────────────────────────────────┘
```

- Eyebrow: mono caps "DIN SAMMENLIGNING"
- "Du" navn (font-display, 56px) — venstre, eller bruk brukerens fornavn
- Sentrert "VS" (italic, lime, font-display, 24px)
- "Rory McIlroy" 56px høyre
- SG-tall under hvert navn (mono, 32px)
- Subtekst: sesong + tour i mono caps

**Visuell flair:** En liten lime-prikk-grafikk mellom navnene som "vekt-balanse" — viser at brukeren er på venstre side, Rory på høyre, ulik vekt. Subtilt.

### 3. KPI-strip — det viktigste tallet

3 KPI-bokser like under hero:

```
DIN SG TOTAL    |   RORYS SG TOTAL   |   DIFFERANSE
−2.10           |   +2.10            |   −4.20
per runde       |   sesong 2026      |   du må ta inn
```

- BIG MONO tall (40px)
- Eyebrow over hver
- Sub under
- "DIFFERANSE" er den viktigste — gi den lime-bakgrunn for å fremheve

### 4. RADAR-CHART — visuell hovedperson

Sentrert, stor (550x550 desktop, 320x320 mobile). Recharts.

**Detaljer:**
- 4-aksig: OTT, APP, ARG, PUTT
- 2 polygoner overlapping:
  - **Du** — forest (`#005840`), 35% opacity fill, 2px stroke
  - **Rory** — lime (`#D1F843`), 20% opacity fill, 2px stroke STIPLET
- Akse-labels: caps font-display, 14px
- Punkter på hjørner: 6px sirkler
- Hover på et punkt: tooltip med eksakte SG-tall

**Under radar-grafen:**
- Legende: "● Du   ● Rory McIlroy"
- Note (mono caps, 10px): "verdier på radar er normalisert; tooltip viser ekte SG-verdier"

### 5. "Største gap"-fokus — narrativ insight

Den enkelt mest-impactful insight'en plassert ETTER radar:

```
┌───────────────────────────────────────────────┐
│  STØRSTE GAP                                  │
│                                               │
│  Innspill (SG: APP)                           │
│  −3.2 strokes per runde                       │
│                                               │
│  Her er det mest å hente. Innspill er den    │
│  mest forutsigbare SG-kategorien.             │
│                                               │
│  → Få drillforslag for SG: APP i PlayerHQ    │
└───────────────────────────────────────────────┘
```

- Lime/forest aksent-card
- Kategori-navn i font-display + bracket-SG-tag
- BIG MONO tall for gapet (40px)
- 2-linjers tekst med kontekstuell innsikt
- Diskret CTA-link til PlayerHQ

**Kondisjonell tekst** basert på hvilken kategori har størst gap:

| Kategori | Tekst |
|---|---|
| OTT (Drive) | "Lengde er den mest synlige, men ikke alltid mest verdifulle. SG: OTT er en bra start." |
| APP (Innspill) | "Innspill er den mest forutsigbare SG-kategorien. Strokene tapt her er strokes du kan vinne tilbake." |
| ARG (Kort spill) | "Kort spill er gjort med trening, ikke talent. Få 30 chip à 10 min hver dag — flotte gevinster." |
| PUTT | "Putting er det mest tekniske. Speed control fra 5-10m er der amatører taper aller mest." |

### 6. "TOUR-EKVIVALENT"-modul — den andre WOW-en

```
┌───────────────────────────────────────────────┐
│  Din norske snittscore                        │
│  78.0                                         │
│                                               │
│  ──────────────                               │
│                                               │
│  ESTIMERT PÅ PGA TOUR-BANE                    │
│  82.4                                         │
│  HCP-estimert: 8.0                            │
│                                               │
│  Beregnet med WHS-formel og standard PGA     │
│  Tour-bane (slope 145, CR 74.5).             │
└───────────────────────────────────────────────┘
```

- Storparten av siden
- BIG numbers i mono
- Subtil grein-divider
- Footnote (mono, 11px) som forklarer beregningen

### 7. "Hva nå?" — actionable next steps

Etter all data, brukeren trenger en pek på hvor de skal gå.

3 valg som horisontale cards:

| Steg | Tittel | Tekst |
|---|---|---|
| 01 | Prøv PlayerHQ | "Få automatisk SG per runde + AI-tips" |
| 02 | Ny sammenligning | "Velg en annen proff og se forskjellen" |
| 03 | Del | "Del en screenshot på X eller med vennene dine" |

### 8. MERSALG-BÅND — kontekstuelt + sterkt

Mest direkte mersalg i hele produktet. Tema: "Du har akkurat sett gapet, vil du lukke det?"

Forest-bakgrunn. Grid med 2-kolonner:

**Venstre (2/3):**
- Eyebrow: "Få faktiske tall"
- Headline: "Vil du følge *utviklingen*?"
- 2-linjers tekst: "PlayerHQ regner ut din egen Strokes Gained automatisk når du logger runder. Du ser om gapet til Rory blir mindre over tid."
- CTA-stack:
  - "Prøv PlayerHQ gratis i 30 dager →" (primær)
  - "↻ Ny sammenligning" (sekundær)

**Høyre (1/3):**
- Card med lime-prikker:
  - "Strokes Gained per runde"
  - "Trend over tid vs proff-benchmark"
  - "AI-coach med kategori-spesifikke tips"
  - "Treningsplaner mot ditt største gap"
- Footer: "300 kr/mnd · Gratis under beta"

### 9. "Del"-modul — viralitet

Subtil, plassert nederst-høyre eller i bunn:

- "Del på X" (Twitter-icon) — auto-tekst: "Jeg ligger 4.2 strokes per runde bak Rory McIlroy. Sjekk din egen SG: akgolf.no/stats/sg-sammenlign"
- "Del på Facebook"
- "Lenke kopiert" (clipboard)

OG: Generer OpenGraph-image dynamisk via `next/og` med:
- Bakgrunn forest
- Bruker-navn + ref-spiller i grid
- "Anders Kristiansen vs Rory McIlroy | SG-diff: -4.20"
- AK Golf-logo

Dette er kritisk for sosial deling.

### 10. Footer — historikk + GDPR

Bunn av siden:

- "Lagret sammenligning #{id} · {dato}"
- Lenke: "Mine sammenligninger (3)" — kobler til en historikk-side hvis vi bygger den
- "Slett denne" (mailto)

---

## Mobile-tilpasning

- Hero: "Du VS Rory" stables — bruker øverst, Rory under, VS sentrert mellom
- KPI-strip: 3 kort blir 1 kolonne stack
- Radar: 320x320, full bredde
- "Største gap"-card: fortsatt prominent, ikke krymp ned
- "Hva nå?": 3 kort blir 3 stablede
- Mersalg: grid stables

## Mikrointeraksjoner

- Radar: polygons animerer in (300ms) når i view — først bruker (forest), så ref (lime stiplet)
- KPI-tall: count-up når i view
- "Største gap"-tall: subtil lime-flash pulse (1 gang) etter count-up er ferdig
- Del-knapper: hover gir tilsvarende plattform-farge på ikon

---

## Inspirasjon

1. **stridemia.com / running comparison** — bruker vs elite, radar-charts
2. **strava.com/segment-result** — "din tid vs alle"-visualisering
3. **theathletic.com/article** — editorial article-feel for resultat
4. **wrapped.spotify.com** — delbar resultat-side med dramatisk progression

## Output

- Komplett page-sketch (high-fi)
- Radar-chart i isolasjon (3 ulike data-scenarier)
- Hero "VS"-layout (variant A og B)
- "Største gap"-card i alle 4 kategori-varianter (OTT/APP/ARG/PUTT)
- OpenGraph-image-sketch
- Mobile-flow

---

## SUPERSTRETCH (optional — vurder)

**"Min sammenligningshistorikk"-side** — `/stats/sg-sammenlign/historikk`. Liste over alle tidligere sammenligninger med små radar-thumbnails. Når bruker har logget flere runder i PlayerHQ kan dette vise utvikling over tid.

Egen design-prompt nødvendig hvis vi bygger den.
