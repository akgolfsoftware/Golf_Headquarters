# Design-prompt 12 — `/stats/uka` — Ukentlig roundup

> Les `00-master-brief.md`.

**Side:** Ukentlig redaksjonelt sammendrag — "ukens norske golf på 60 sekunder"
**Bruker:** Returbesøkende — folk som vil holde seg oppdatert
**Hovedoppdrag:** Bygge "ukentlig vane" som driver return-traffic og e-postliste. Sammen med nyhetsbrev — denne siden er bevis på at vi finnes hver mandag.

URL-struktur: `/stats/uka` (denne uka) + `/stats/uka/2026-21` (historiske)

---

## Datakilder

```typescript
// Auto-generert hver mandag 06:00 UTC fra forrige uke (man-søn)
const UKE = {
  ukeNummer: 21,
  aar: 2026,
  fra: "2026-05-18",
  til: "2026-05-24",

  // Norske resultater fra uken
  norskeResultater: Array<{
    spiller, turnering, tour, posisjon, totalScore, forbedring
  }>,

  // Topp-prestasjon
  ukensSpiller: {
    navn, slug, klubb,
    grunn: "Vant Srixon Tour 5 med −9 — bedre enn forrige rekord",
    score, turnering,
  },

  // Ukens runde
  ukensRunde: { spiller, score, turnering, dato },

  // Pussig fakta
  ukensFakta: "32 nordmenn spilte på 11 ulike turneringer denne uka",

  // Kommende uke (preview)
  kommendeUke: Array<{
    turnering, datoer, antallNorske, hovedNavn
  }>,
};
```

---

## Designoppdrag

### Layout-paradigme: editorial newsletter

Designe som en TRYKT editorial newsletter på papir. Generøs whitespace, sterk typografi-hierarki, narrative paragraph-flow mellom dataene.

### 1. Hero — datotunge

```
UKE 21 · 2026                    19 — 24. MAI

Norsk golf
denne uken.
```

- Mono eyebrow med uke + datoer
- Headline: "Norsk golf denne uken." — Inter Tight italic, 80px
- Sub: 2-linjers tekst som hooker leseren

### 2. "Bunnlinjen" — KPI-strip

Den ene viktigste fakta i mono format:

```
32 norske            11 turneringer         3 podiumplasseringer
spilte denne uka     på 4 ulike tourer      hvorav 1 seier
```

### 3. UKENS SPILLER — featured

Stor card, mye plass. Editorial-stil:

```
┌────────────────────────────────────────────────┐
│                                                │
│   UKENS SPILLER                                │
│                                                │
│   Anders                                       │
│   Halvorsen                                    │
│                                                │
│   Vant Srixon Tour 5 med −9 — to slag         │
│   foran andreplassen. Hans laveste sluttsum  │
│   noensinne.                                   │
│                                                │
│   [Avatar/Initial]   "Se hele profilen →"     │
│                                                │
└────────────────────────────────────────────────┘
```

- Bakgrunn: lyseforest (`bg-primary/5`)
- Navn i font-display 64px, italic på etternavn
- 2-linjes prosa om hvorfor de er ukens spiller
- Lite spiller-foto eller initial-glyph
- Lenke til full profil

### 4. UKENS RUNDE

Mindre card, neste prioritet:

```
UKENS RUNDE
65 · Bærum GK
av Maria Olsen i Srixon Tour 5

R1 65 — Birdied 6 av siste 9
"Speed control var perfekt på greenene"
                          → Hele scorekortet
```

### 5. RESULTATLISTE — alle norske

Tabell-stil, kompakt:

```
TOUR              SPILLER              TURNERING            POSISJON   SCORE
PGA Tour          Viktor Hovland       Memorial             T-12       275
Korn Ferry        Kris Ventura         Pinnacle Bank        T-34       289
Srixon Tour       Anders H.            ST 5 (Bærum)         1          207  ★
Srixon Tour       Marius L.            ST 5 (Bærum)         T-3        211
OLYO Øst          Sofie N.             OT Øst 7 (GFGK)      2          145
...
```

- Mono labels, tabular nums
- Stjerne på podium-resultater
- Klikkbart per spiller-navn
- Filter-pills på toppen: "Alle / Pro / Amatør / Junior"

### 6. UKENS FAKTA — editorial

Pull-quote-stil mid-side:

> *"32 norske golfspillere spilte på 11 ulike turneringer denne uka. Det er det mest aktive uken siden Eclectic-finalen i juni 2024."*

- Italic Inter Tight, 28px
- Stor anførsels-tegn (kan være lime decorativ)
- Sub-credit: "AK Golf Stats redaksjon"

### 7. KOMMENDE UKE — preview

Liste av kommende turneringer for neste uke:

```
KOMMENDE UKE — 26 mai til 1. juni

MANDAG       TIRSDAG      ONSDAG       TORSDAG      ...
                          OLYO Vest 6  PGA Memorial
                          Bergen GK    
                          12 norske    2 norske
```

Calendar-grid med icons per dag, antall norske spillere markert.

### 8. NYHETSBREV-CTA

Diskret men sentralt:

```
┌────────────────────────────────────────────────┐
│                                                │
│   Få ukens roundup i innboksen.                │
│   Hver mandag morgen, 60 sekunder å lese.      │
│                                                │
│   [ din@email.com         ]  [Meld på →]      │
│                                                │
│   2 547 abonnenter · Avregistrer når som helst│
└────────────────────────────────────────────────┘
```

### 9. ARKIV — tidligere uker

Footer-modul:

- "Forrige uke ←"
- "Hopp til en uke:" + uke-velger (dropdown med søk)
- "Alle ukers roundup →" (link til arkiv-side)

### 10. Mersalg

Subtil mersalg på bunn (mindre fokus på denne siden — content er stjernen):

> "Vil du selv være i roundup-en? Logg runder i PlayerHQ — om resultatet er bra nok, kan du være ukens spiller."

---

## Mobile-tilpasning

- Newsletter-feel er FORTSATT viktig på mobile — store typografi-blokker
- Resultatliste blir simplere: 3 kolonner (Tour, Spiller, Score) med "Vis mer" som åpner detalj
- Kalender for "Kommende uke" blir vertikal liste

## Mikrointeraksjoner

- Headline: subtil glir-inn fra venstre når i view
- Ukens spiller-card: hover gir lime-glow på "Se profil →"-link
- Resultattabell: row hover med subtil highlight
- Nyhetsbrev-input: real-time validation feedback

---

## Inspirasjon

1. **The Athletic / The Morning Briefing** — editorial newsletter web-versjon
2. **The Hustle** — narrative news-design
3. **The Guardian sports roundup** — kompakt resultatliste + editorial-prose
4. **stratechery.com** — pure editorial typography

## Output

- Komplett page-sketch (newsletter-feel)
- Ukens spiller-card i isolasjon
- Editorial pull-quote-pattern
- Calendar-grid for kommende uke
- Mobile-flow

---

## Implementasjon-notater

- Genereres mandag 06:00 UTC via cron-job
- Lagres som markdown + JSON i DB (`UkesRoundup`-modell, ny)
- Sendes som e-post til abonnenter via Resend (samme system som beta-onboarding)
- ISR med revalidate på 24t for /stats/uka, statisk på arkiverte uker
