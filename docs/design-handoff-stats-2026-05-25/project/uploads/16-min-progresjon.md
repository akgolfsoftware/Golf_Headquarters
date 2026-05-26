# Design-prompt 16 — `/stats/min-progresjon` — autentisert progresjons-dashboard

> Les `00-master-brief.md`.

**Side:** `akgolf.no/stats/min-progresjon` — auth-protected
**Bruker:** Innlogget bruker som har lagt inn SG-data via sg-sammenlign + evt. har logget runder i PlayerHQ
**Hovedoppdrag:** Få brukeren til å returne ofte. Vise "hvordan blir jeg bedre over tid?" — som hooker dem til PlayerHQ.

---

## Datakilder

```typescript
const PROGRESJON = {
  user: { id, name, email },

  // SG-historikk
  sgInputs: Array<BrukerSgInput>,        // alle SG-inputs over tid
  sammenligninger: Array<BrukerSammenligning>,

  // Computed
  forsteRegistrering: Date,
  antallSammenligninger: number,

  // Trend (hvis flere SG-inputs)
  sgTotalTrend: Array<{ dato, value }>,  // tidsserie
  sgPerKategoriTrend: { ott: [...], app: [...], arg: [...], putt: [...] },

  // Mål
  storsteGap: { kategori, diff },        // siste sammenligning
  forbedringSidenStart: number | null,   // SG diff fra første til siste input

  // Linket spiller (hvis bruker er i norsk database)
  publicPlayer: PublicPlayer | null,

  // Hvis publicPlayer eksisterer:
  turneringerSpilt: number,
  besteRunder: Array<{ score, turnering, dato }>,
};
```

---

## Designoppdrag

### 1. Hero — personlig velkomst

```
Velkommen tilbake,
Anders.
```

- Inter Tight italic på navn i lime
- Sub: kontekstualiserende:
  - **Hvis 1 input**: "Du la inn din første SG den {dato}. Logg flere for å se trend."
  - **Hvis 2+ inputs**: "Du har lagt inn SG {N} ganger. Her er trenden din."

### 2. STATUS-STRIP — siste sammenligning

```
SISTE SAMMENLIGNING                                   Anders H., 12. mai 2026

DIN SG TOTAL              VS RORY                     STØRSTE GAP
−2.1                      −4.20                       Innspill (-3.2)

                            [ Ny sammenligning ]
```

Card med subtil border, mono labels, BIG mono tall.

### 3. SG-trend over tid

Hvis brukeren har 2+ inputs: vis recharts linjegraf.

X-akse: dato
Y-akse: SG Total
Hovedlinje: brukerens SG Total over tid (forest)
Skygget area under: viser område

Med annotering:
- "Du forbedret deg 1.2 strokes på 6 måneder"
- "Tour-snitt: 0" (horisontal lime stiplet linje)

Hvis bare 1 input: tom-state med "Logg en sammenligning til om 2-4 uker for å se trend".

### 4. PER-KATEGORI TREND — 4 mini-linjer

Grid 2x2 med små linjer for hver kategori (OTT, APP, ARG, PUTT):

```
┌─────────────┬─────────────┐
│ SG: OTT     │ SG: APP     │
│ ╱─────╲    │ ╲─────╱    │
│ -0.4 → -0.6 │ -1.8 → -1.5 │
├─────────────┼─────────────┤
│ SG: ARG     │ SG: PUTT    │
│ ─────╲    │ ╲────╱    │
│ -0.8 → -0.6 │ -0.4 → -0.3 │
└─────────────┴─────────────┘
```

- Mini linje-graf (recharts) for hver
- Verdi-endring vist
- Pil opp/ned hvis det er forbedring

### 5. ALLE SAMMENLIGNINGER — historikk-tabell

```
DATO          REFERANSE          SG-DIFF      EST. TOUR-SCORE
12. mai       Rory McIlroy       -4.20         82.4
27. apr       Scottie Scheffler  -5.10         83.1
8. apr        Viktor Hovland     -3.80         81.6
```

- Klikkbart per rad → åpner full resultatside `/stats/sg-sammenlign/resultat/[id]`
- Sortable kolonner

### 6. "Hvor mest fokus?" — analysert insight

Editorial summary basert på data:

> *"Du har lagt inn SG 8 ganger siden januar. Største og mest konsistente gap er **innspill** (SG: APP), som har vært -1.5 til -2.1 hver gang. Det er sannsynligvis der mest å hente."*

Med 3 actionable steg under:
1. "Mål 50 svingforspeil-til-pin / uke i 4 uker"
2. "Logg hver innspill med klubb + avstand i PlayerHQ"
3. "Sjekk inn igjen om 6 uker"

### 7. NYHETSBREV-strip — relasjonell

Hvis brukeren ikke har abonnert på nyhetsbrevet, vis subtil opt-in:

> "Få månedlig 'din progresjon'-e-post — vi sender en rapport over hvordan du har utviklet deg."

### 8. PLAYERHQ-MERSALG — sterk kontekstuell

Forest-bakgrunn. Datadrevet konvertering:

```
Du har sammenligning-data, men ikke runde-data.

PlayerHQ logger runder automatisk → kobler dem til SG → 
viser hvordan din INNSPILL utvikler seg over tid på hver bane.

  [ Prøv PlayerHQ gratis i 30 dager ]
```

### 9. "Følg en annen spiller"

Hvis brukeren har en kobling til public player:

> "Du er knyttet til Anders Halvorsen i den norske spillerbasen.
> Se hele profilen din →"

### 10. Settings + GDPR

Footer:
- "Slett mine data" (lenke til settings)
- "Eksporter alle mine SG-inputs" (download JSON)
- "Endre e-postpreferanser"

---

## Mobile-tilpasning

- KPI-strip: 3 kort stables
- SG-trend: full bredde, mindre høyde
- 2x2 mini-linjer blir 4 stablede
- Historikk-tabell: 3 kolonner

## Mikrointeraksjoner

- Trend-linjegraf: linje tegnes inn ved page-load
- Per-kategori mini-linjer: stagger 100ms inn
- "Største gap"-kategori i KPI-strip: lime pulse (1 gang)
- Hover på tabell-rad: subtil row-highlight

---

## Empty-state

Hvis bruker har 0 SG-inputs (ny konto):

```
Du har ikke lagt inn SG-data ennå.

Lag din første sammenligning så ser du fremgangen din her.

  [ Start sammenligning → ]
```

---

## Inspirasjon

1. **strava.com/athlete/profile** — autentisert personlig progresjons-dashboard
2. **whoop.com/journal** — wellness-data over tid med insights
3. **mint.com** — finansiell progresjon med personlige insights

## Output

- Komplett page-sketch
- Trend-linjegraf i isolasjon
- 2x2 per-kategori mini-linjer
- Empty-state pattern
- Mobile-flow
