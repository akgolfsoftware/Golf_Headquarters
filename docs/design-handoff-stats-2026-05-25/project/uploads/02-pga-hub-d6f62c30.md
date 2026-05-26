# Design-prompt 02 — `/stats/pga` PGA Tour-hub

> Les `00-master-brief.md` for brand/tokens/tone.

**Side:** `akgolf.no/stats/pga` — hub for hele PGA Tour-stats-playground
**Bruker:** Stat-nerden. Folk som scroller DataGolf på telefonen. Foreldre som vil vite "hvor godt er Viktor Hovland egentlig?"
**Hovedoppdrag:** Vise at vi har data for ALT, og gjøre brukeren nysgjerrig nok til å klikke videre.

---

## Datakilder (alt live fra DB)

```typescript
// Per kategori (6 stk):
{
  navn: "Drive Distance",
  tourSnitt: 296.5,         // gjennomsnittlig drive på Tour
  topp3: [                  // topp 3 spillere med tall
    { name, country, value: 320.4 },
    ...
  ],
}

// Globalt:
totalSpillere: 433          // antall PGA-spillere med data
sisteSyncDato: Date
sesong: 2026
```

6 kategorier per nå:
1. **Drive Distance** (yds)
2. **Fairway-treff** (%)
3. **Greens in Regulation** (%)
4. **Putter per runde** (lavere bedre)
5. **Scoring Average** (lavere bedre)
6. **Strokes Gained Total** (+/− formatert)

Pluss en 7. lenke: **Putt Explorer** (separat side, `/stats/pga/putt-explorer`).

---

## Designoppdrag

### 1. Hero — kortere enn hub-landing, mer fokusert

- Liten breadcrumb: "← AK Golf Stats"
- Mono eyebrow: "PGA TOUR · STATISTIKK"
- Headline: "Hva er *snittet* egentlig?" (én linje, italic på "snittet")
- Sub: 1 setning + live stat ("433 spillere · sesong 2026 · oppdatert mandager")
- **Ingen CTA i hero** — la siden være om å utforske, ikke konvertere

### 2. KPI-strip — Tour-snitt som hero-statistikk

Direkte under hero, 4 store KPI-tall med Inter Tight + JetBrains Mono. Eksempel:

```
LENGDE                 PRESISJON              GREEN              PUTTER
296 yds                63%                    71%                28.5
Snitt drive            Fairway-treff          GIR                Per runde
```

Hver KPI:
- Mono caps eyebrow (10px, letter-spacing 0.18em)
- Mono tall i 36px tabular-nums
- 1-linje sub i muted

Strip har bare borders mellom KPI, ingen card-bakgrunn. Hele strippen er en horisontal divider mellom hero og kategori-grid.

### 3. 7 kategori-kort — bento, ikke uniformt

Layout:

```
┌─────────────────────┬─────────────────────┐
│ DRIVE DISTANCE      │ FAIRWAY-TREFF       │
│ (stor — featured)   │ (medium)            │
│ Mini bar-chart      │                     │
├──────────┬──────────┴──────────┬──────────┤
│ GIR      │ PUTTER PER RUNDE    │ SCORING  │
│ (small)  │ (medium)            │ (small)  │
├──────────┴──────────────────────┴──────────┤
│ SG TOTAL                                   │
│ (full-bredde) — mini-leaderboard           │
├────────────────────────────────────────────┤
│ PUTT EXPLORER (egen seksjon)               │
│ Heatmap-preview                            │
└────────────────────────────────────────────┘
```

Hvert kategori-kort:

**Topp:**
- Lucide-ikon i lime/forest pille (8x8)
- Tittel (font-display 20px)
- 1-linje undertittel

**Midten (data):**
- Tour-snitt som BIG mono-tall (60px+ for featured kort, 40px for medium, 28px for small)
- Enhet under (yds, %, etc)
- Mini-sparkline ELLER topp-3-liste:
  - **Featured**: 5-bar mini-chart (ikke akse, bare 5 bars med ulik høyde)
  - **Medium**: Topp-3-liste, hver med liten avatar/initial
  - **Small**: Bare snittall + "se mer →"

**Bunn:**
- Hover-state: hele kortet flyttes 2px opp + border får lime-glow
- "Utforsk →" pil i bunn

### 4. Spesialbehandling for "SG Total"-kortet

Full-bredde card. Inneholder:
- Topp-10 leaderboard på SG Total
- Lite chip ved siden av navn: "+2.34" i lime hvis positiv, default hvis negativ
- Sortering: høyest først (PGA Tour)
- Country-flagg (SVG) ved siden av navn

Brukeren skal kunne klikke et navn for å åpne `/stats/spillere/[slug]` (norsk spillerbase, men selv om spilleren er amerikansk — bare hopp dit hvis vi har profil; ellers gå til DataGolf-profil).

### 5. "Putt Explorer"-teaser — egen seksjon

Mellom kategori-grid og mersalg. Helt egen card, ekstra fremtredende:

- Bakgrunn: subtil grønt-gradient (forest fade to background)
- 2-kolonne layout
- **Venstre:** Eyebrow "INTERAKTIVT" + headline "Hva senker snittet fra *3 meter*?" + 2-linjers tekst + CTA "Lek deg med putt-data →"
- **Høyre:** Forhåndsvisning av heatmap eller distribusjons-bar — 4-5 fargede vertikale bars som representerer ulike avstander

### 6. Mersalg-bånd — tilpasset PGA-konteksten

Etter putt-teaser. Forest-bakgrunn. Konteksttilpasset CTA:

- Eyebrow: "Din egen statistikk"
- Headline: "Lurer du på hvordan *du* ligger an?"
- 2-linjers tekst som bygger på PGA-temaet: "PlayerHQ regner ut din egen Strokes Gained ... følg utviklingen mot Tour-snittet over tid"
- Sammenligning: liten visualisering av "Du vs Tour" (4 prikker, 2 sett, ulike farger)
- CTA + fordeler-liste som i hub-landing

### 7. Footer-nudge

Liten link nederst: "Vil du legge inn dine egne SG-tall? Prøv sammenligningsverktøyet →" (lenke til `/stats/sg-sammenlign`)

---

## Mobile-tilpasning

- KPI-strip blir 2x2 grid (ikke 4 i én rad)
- Bento-grid linearizeres til 1 kolonne, men "featured" (Drive Distance) får ekstra padding så det leses som heading-card
- Putt Explorer-teaser stables: høyre-grafikk over tekst

## Mikrointeraksjoner

- KPI-tall: count-up når i view (0 → faktisk over 800ms)
- Bento-kort: scale 1.01 + border-glow på hover
- Mini-sparkline i drive-distance: subtil "draw"-animasjon når kortet kommer inn i view
- Featured tall: jitter-effekt etter count-up er ferdig (én gang)

---

## Inspirasjon

1. **datagolf.com** — KPI-tett, mono-tall, bento-grid med ulike størrelser
2. **The Athletic NBA stats hub** — kategorisering med big numbers + topp 3
3. **stripe.com/pricing** — bento med ulike størrelser, vekt på primær box

## Output

- Bento-grid sketch (varianter A/B for grid-størrelser)
- KPI-strip i isolasjon (font-størrelser + spacing)
- 1 featured kategori-kort i isolasjon (med all interaktivitet)
- Putt Explorer-teaser i isolasjon
