# Design-prompt 03 — `/stats/pga/[kategori]` detalj-side (template for alle 6)

> Les `00-master-brief.md`. Dette er en template som dekker:
> `drive-distance`, `fairway-pct`, `gir-pct`, `putts-per-round`, `scoring-avg`, `sg-total`.

**Side:** En detalj-side per kategori (6 sider med samme struktur)
**Bruker:** Stat-nerden som vil grave dypt i én kategori
**Hovedoppdrag:** Gjør tallene **personlige** — la brukeren se hvor _han/hun_ står

---

## Data-modell per side

```typescript
const ALLE_SPILLERE: Array<{
  navn: string;
  land: string | null;
  verdi: number;          // f.eks. 298.4 yds, eller 0.74 i fairway-pct, eller -0.23 i sg
}> = [ ... ];

const TOUR_SNITT: number;
const TOUR_MIN: number;
const TOUR_MAX: number;
const ANTALL_SPILLERE: number;
```

Kategori-spesifikke detaljer:

| Kategori | Enhet | Reverse? | Default slider-verdi |
|---|---|---|---|
| Drive Distance | yds | Nei (mer = bedre) | 250 |
| Fairway-treff | % | Nei | 55 |
| GIR | % | Nei | 50 |
| Putter/runde | – | **Ja** (færre = bedre) | 32 |
| Scoring avg | – | **Ja** | 78 |
| SG Total | – | Nei | -2 |

---

## Designoppdrag

### 1. Hero — datakontekst først, prosa etter

- Breadcrumb: "← PGA Tour Stats"
- Eyebrow: ikon + "PGA TOUR · [KATEGORINAVN]" (mono caps lime)
- Headline: editorial spørsmål (italic på det viktige):
  - Drive: "Hvor *langt* slår de?"
  - Fairway: "Hvem treffer *flesteparten* av fairwayene?"
  - GIR: "Hvor mange greens i regulation klarer du *egentlig*?"
  - Putts: "Hvem putter *aller best*?"
  - Scoring: "Hvem scorer *lavest* per runde?"
  - SG Total: "Hvem vinner *mest* strokes mot Tour-snittet?"
- Sub: 2 setninger som setter kategorien i kontekst (1 linje fakta + 1 linje "lurer du på hvor du står?")
- **3 KPI-bokser** på en rad rett under sub:
  - Tour-snitt (BIG MONO TALL)
  - Maks (mindre)
  - Antall spillere (mindre)

### 2. INTERAKTIV BLOKK — sidens hovedmoment

Dette er det viktigste UI-elementet på siden. Bygges som en isolert "card" med subtil shadow.

**Layout (desktop):**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Hvor [verb] slår du?                                  │
│                                                         │
│              ╔═══════════════════╗                      │
│              ║      268 yds      ║   ← big mono input  │
│              ╚═══════════════════╝                      │
│                                                         │
│   [──────────●────────────────────────]                 │
│   220                                  340              │
│                                                         │
│   ┌─────────────────┐  ┌─────────────────┐             │
│   │ P47 PERCENTILE  │  │ NÆRMESTE PROFF  │             │
│   │ Du slår lenger  │  │ Tony Finau      │             │
│   │ enn 47% av      │  │ 270.2 yds       │             │
│   │ PGA-spillere    │  │ (2 yds lenger)  │             │
│   └─────────────────┘  └─────────────────┘             │
│                                                         │
│   FORDELING                                             │
│   ▁▂▃▆██▇▅▃▂▁  ← histogram, din bøtte highlightet      │
│   220                                  340              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Mobile:** Alt stables vertikalt, samme rekkefølge.

**Designdetaljer:**
- Big number-input: 64px font-mono, tabular-nums, sentrert. Kan klikkes for å taste eller bruke slider.
- Slider: native HTML `<input type="range">` styled med `accent-primary`. Min/max-labels under.
- **Percentile-boks**: forest-tone bakgrunn, lime ikon, BIG MONO `P47`
- **Nærmeste proff-boks**: secondary bakgrunn, accent-prikk-ikon, navn i font-display
- **Histogram**: 20 bars (mini-bar-chart), brukerens bøtte highlightet i `bg-primary`, resten `bg-secondary`. Tooltip på hover: "240-245 yds: 23 spillere".
- Animasjon: prikker og tall oppdaterer smooth (200ms transition) når slideren beveger seg

### 3. "Slik vinner du dette gapet" — narrativ analyse

NY seksjon — gjør resultatene actionable, ikke bare deskriptive.

Conditional content basert på brukerens percentile:

| Percentile | Headline | Tekst |
|---|---|---|
| P0-25 | "Her er det *mest å hente*" | "Du er i nederste kvartil på Tour. Drive distance er en av de mest trenbare statistikkene — speed-trening kan gi 15-20 yds på 12 uker." |
| P25-50 | "Du er *under snittet*" | "Tour-spillere på ditt nivå har 60% færre 3-putter enn deg fordi de er nærmere etter drive. Speed + presisjon må jobbes parallelt." |
| P50-75 | "Du *kvalifiserer* for konferansen" | "Du slår langt nok til å spille D1 college-golf i USA. Neste nivå er konsekvent over 290 yds gjennomsnitt." |
| P75-95 | "Du er i *toppsjiktet*" | "Få amatører slår så langt. Spørsmålet er om du klarer å holde fairway under turneringspress." |
| P95+ | "Tour-nivå *bekreftet*" | "Distansen din er på Tour-spillernes nivå. Spør coachen din om SG-data — det er der gapet sannsynligvis ligger." |

Layout:
- Eyebrow: "DIN ANALYSE"
- Headline med italic på "mest å hente" eller annen kondisjonell tekst
- 3-4 setninger
- "Vil du jobbe med dette? Få en gratis treningsplan i PlayerHQ →" (link til /playerhq)

### 4. Topp-20 leaderboard

Tabular layout med skikkelig data-dichte (DataGolf-stil):

```
#   Spiller                     Land   Verdi          Vs snitt
1   Rory McIlroy                IRL    324.5 yds      +28.0
2   Cameron Champ               USA    322.1 yds      +25.6
...
```

- Mono tall (`tabular-nums`)
- Subtil row-hover highlight
- Klikk navnet → går til `/stats/spillere/[slug]` HVIS spilleren er norsk, ellers ekstern DataGolf-link
- Country som SVG-flagg (ikke emoji, ikke tekst)
- "Vs snitt"-kolonne med fargekode: lime hvis bedre, default hvis dårligere

Footer på leaderboard:
- "Vis topp 50 →" hvis vi vil utvide senere
- "Krav: min 20 runder spilt" som footnote i mono

### 5. Mersalg-bånd — kategori-spesifikk

Ny variant for hver kategori, ikke generisk:

**Drive distance:**
> "Hvordan slår du i sommer? PlayerHQ logger drive distance på hver runde. Se utviklingen over sesongen."

**Fairway-treff:**
> "Treffer du flere fairways enn forrige sesong? PlayerHQ holder regnskap så du slipper."

**GIR:**
> "GIR er den ene statistikken som forutsier nesten alt. Logg den i PlayerHQ — se trenden over tid."

**Putts:**
> "30 putter i runden bør ned til 28. PlayerHQ regner ut SG Putting per runde og viser hvor du faktisk taper."

**Scoring avg:**
> "Snittscoren din viser ikke hvor du taper strokes. PlayerHQ med SG-analyse gjør."

**SG Total:**
> "Verdens beste vinner +3 SG per runde. Du? PlayerHQ måler det automatisk når du logger runder."

Layout: 2-kolonne, samme som hub-mersalg. Forest bakgrunn.

### 6. "Lignende kategorier"-strip

Bunn av siden. Horizontal scroll-strip med 5 av de andre 5 kategoriene (alle unntatt den vi er på). Hvert kort er mini-versjon av kategori-kortene fra hub:
- Ikon + navn
- Tour-snitt
- "Utforsk →"

---

## Mobile-tilpasning

- Interaktiv blokk: stables til 1 kolonne, percentile + nærmeste proff side-by-side blir stacked
- Histogram: 12 bars i stedet for 20 (mindre tett)
- Topp-20: bare 4 kolonner (drop "Vs snitt", flytt til hover/expand)

## Mikrointeraksjoner

- **Slider:** når du drar, ALL tekst på siden oppdaterer i sanntid (percentile, nærmeste proff, histogram, narrativ-tekst)
- Big number: kan klikkes for å åpne numeric keyboard på mobil
- Histogram-bar: tooltip på hover med antall spillere i bøtta
- Topp-20-rad: hover gir liten "→"-indikator i høyre kant
- Når siden lastes: en pulserende lime-prikk på slider-handle indikerer "prøv meg"

---

## Inspirasjon

1. **fivethirtyeight.com/interactives** — slider-driven storytelling, percentile-visualiseringer
2. **datagolf.com/skill-decompositions** — tabular data + interaktiv filtrering
3. **strava.com/segments/[id]** — percentile vs distribusjon, "Hvor du står"-modul

## Output

- Komplett detaljsketch (alt-i-én)
- Spesielt: interaktiv blokk i isolasjon (high-fi, alle states)
- Narrativ-analyse-blokk i alle 5 percentile-varianter
- Mobile-layout med scroll-flow
