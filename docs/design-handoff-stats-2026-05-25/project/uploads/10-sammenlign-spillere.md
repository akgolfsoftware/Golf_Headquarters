# Design-prompt 10 — `/stats/sammenlign-spillere`

> Les `00-master-brief.md`.

**Side:** Sammenlign to norske spillere side-by-side (DataGolf-stil)
**Bruker:** Foreldre som vil sammenligne barnet med en jevnaldrende · Coacher som ser hvor en spiller ligger an mot peers · Spillere selv som vil måle seg
**Hovedoppdrag:** Bli "det norske miljøets sammenligningsverktøy". Spillere skal dele lenken på lagskjernen.

---

## Datakilder

```typescript
// Søke-pool (alle norske spillere)
const SPILLERE_ALL: Array<{
  slug, navn, fodselsAr, klubb, tier, antallTurneringer
}>;

// Når 2 valgt, hent:
const SPILLER_DATA: {
  navn, fodselsAr, klubb, tier, bio,
  totaltRunder, totaltTurneringer,
  perAar: { 2024: { snitt: 72.5, beste: 65, antall: 28 }, ... },
  perTour: { srixon: 12, olyo: 8, ngc: 4, ostlandstour: 6 },
  besteResultater: Array<{ turnering, dato, posisjon, totalScore }>,  // topp 5
};
```

URL-mønster: `/stats/sammenlign-spillere?a={slug-a}&b={slug-b}` (delbart)

---

## Designoppdrag

### 1. Hero — søkeland for to spillere

Diskret hero, søk er hovedpersonen.

- Eyebrow: "AK GOLF STATS · SAMMENLIGN"
- Headline: "Sammenlign *to* norske spillere"
- Sub: 1 setning

**Søke-modus (når ikke begge spillere er valgt):**

Stort 2-kolonne layout:

```
┌──────────────────┐    VS    ┌──────────────────┐
│  SPILLER A       │          │  SPILLER B       │
│  [søk her]       │          │  [søk her]       │
│                  │          │                  │
│  Eller velg:     │          │  Eller velg:     │
│  • Viktor Hovland│          │  • Andreas H.    │
│  • Kris Reitan   │          │  • Mats Ege      │
└──────────────────┘          └──────────────────┘

       [Sammenlign →] (deaktivert til begge er valgt)
```

VS-glyph i midten: italic lime Inter Tight, 48px. Subtil pulsering før begge er valgt.

### 2. RESULTAT-LAYOUT (når begge er valgt)

**Sticky topp-bar:**

```
[A] Viktor Hovland          VS          Andreas Halvorsen [B]
    29 år · OGK · PRO                     30 år · OGK · PRO
              [bytt A]                              [bytt B]
```

To kompakte spillerkort med initial-glyph, navn, alder, klubb, tier. "Bytt"-link åpner søke-overlay.

### 3. KPI-strip-batch — head-to-head

Først, det viktigste tallet:

```
TOTALT RUNDER     SNITT 2024        BESTE EVER     TURNERINGER
A: 287            A: 70.5            A: 63          A: 142
B: 198            B: 71.8            B: 65          B: 87
```

Hver KPI: 4-rad sett med "A:" / "B:" mono labels, BIG mono tall, lime highlight på vinneren.

### 4. Snittscore over tid — linjegraf

Recharts: 2 linjer (A forest solid, B lime stiplet) over år 2018-2026. Y-akse er snittscore (invertert hvis det føles bedre — lavere = bedre). Hover-tooltip viser begge på samme år.

Inkluder en hjelp-tekst over grafen: "Sesongsnitt — lavere er bedre". 

### 5. Per-tour fordeling — dual bar-chart

Horisontalt bar-chart for hver tour med 2 bars side ved side (A forest, B lime):

```
SRIXON TOUR       A ████████████ 12
                  B ██████ 6

OLYO TOUR         A ████ 4
                  B ██████████ 10
...
```

Viser hvor "tyngdepunktet" til hver spiller er.

### 6. Beste resultater — topp 5 hver

To kolonner. Hver kolonne har:
- Subheader (spillerens navn)
- Topp 5 turneringer (kronologisk eller posisjon-sortert)
- Hver rad: dato · turnering · posisjon · totalscore

### 7. "Vinner per kategori"-summary

Editorial summary-card etter alle datavisualiseringer:

> *"Anders har **bedre snittscore** (70.5 vs 71.8) over flere runder. Andreas har **lavere best-ever-score** (63 vs 65). Anders dominerer Srixon, Andreas på OLYO. Aldersforskjell: 1 år."*

Genereres server-side med enkel mal som plukker ut "vinner" per metrikk.

### 8. Del-modul + OpenGraph

- "Del denne sammenligningen" — kopier-lenke-knapp
- OpenGraph-image generert dynamisk: 2 spillerkort + "VS" + sammenligning-tall (eks: "Anders 70.5 · Andreas 71.8")
- "Twitter / Facebook / Instagram Stories"

### 9. Mersalg

Forest-bakgrunn. Tema: "Sammenlign deg med andre du kjenner."

- Headline: "Vil du *også* være sammenlignbar?"
- Tekst: "Logg dine egne runder i PlayerHQ — så kommer du automatisk inn i databasen og kan sammenlignes med andre norske spillere."
- CTA: "Prøv PlayerHQ gratis"

### 10. "Andre populære sammenligninger"

Footer-modul med 6 kuratert sammenlignings-suggestions (klikkbare linker):
- "Viktor Hovland vs Kris Ventura"
- "Mats Ege vs Herman Sekne"
- ...

---

## Mobile-tilpasning

- Søkeskjerm: 2 kolonner stables vertikalt med "VS" mellom
- Sticky topp-bar: spillere stables, "VS" sentrert mellom
- KPI-strip: bytte fra 4-i-rad til 2x2 grid
- Linje-graf: lavere høyde, fortsatt 2 linjer

## Mikrointeraksjoner

- Søke-input får lime-glow på focus
- Når en spiller er valgt: kortet får scale 1.02 pulsanimasjon
- Når begge er valgt: "Sammenlign"-knapp får primary-fill + pil animerer
- Linje-graf: linjer tegnes inn fra venstre over 600ms ved første render

---

## Inspirasjon

1. **datagolf.com/player-comparisons** — direkte ekvivalent for proff-spillere
2. **basketball-reference.com/play-index/psl_finder** — head-to-head player comparison
3. **fbref.com** — fotball-sammenligningsverktøy med dual bar charts

## Output

- Komplett page-sketch (begge tilstander: før/etter spillervalg)
- Søke-overlay i isolasjon
- KPI-strip head-to-head-pattern
- OpenGraph-bilde-mockup
- Mobile-flow
