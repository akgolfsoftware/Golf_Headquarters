# Design-prompt 26 — `/stats/verktoy/*` — Stats-verktøy (HCP-kalkulator m.fl.)

> Les `00-master-brief.md`.

**Sider:** En samling SEO-vennlige verktøy under `/stats/verktoy/`
**Datakilde:** Krever ingen DB-data — pure beregning + våre estimator-libs
**Hovedoppdrag:** Klassisk SEO-magnet ("HCP kalkulator", "score til Tour", "WHS slope adjustment")

---

## 5 verktøy som skal designes

| URL | Verktøy | Input | Output |
|---|---|---|---|
| `/stats/verktoy` | Hub-side | — | Liste over 5 verktøy + søkbar |
| `/stats/verktoy/score-til-hcp` | Score → HCP-estimater | Snittscore, slope, CR | Estimert HCP |
| `/stats/verktoy/tour-ekvivalent` | Score → PGA Tour-score | Score, slope, CR | Ekvivalent på Tour-bane |
| `/stats/verktoy/whs-kalkulator` | WHS Handicap | 8+ runder med score | WHS handicap |
| `/stats/verktoy/sg-estimator` | Score → SG-fordeling | Snittscore | Broadie SG-decomposition |
| `/stats/verktoy/avstand` | Yards ↔ meter | Verdi + enhet | Konvertert verdi |

---

## DEL A — `/stats/verktoy` (hub)

### 1. Hero
- Eyebrow: "AK GOLF STATS · VERKTØY"
- Headline: "Beregn det du *lurer på*."
- Sub: "Score-til-HCP, Tour-ekvivalent, WHS, SG-estimator. Alt gratis, alt nøyaktig."

### 2. Søkebar
"Søk etter verktøy..."

### 3. Verktøy-grid (5 cards)
3-kolonne grid, hver card:

```
┌────────────────────────────┐
│ [Calculator-ikon]          │
│                            │
│ Score til HCP              │
│ Hvilken HCP har du basert  │
│ på snittscoren din?        │
│                            │
│ Prøv →                     │
└────────────────────────────┘
```

### 4. Mersalg
"Spar tid — alle disse beregningene gjøres automatisk i PlayerHQ når du logger en runde."

---

## DEL B — `/stats/verktoy/score-til-hcp`

### 1. Hero
- Eyebrow: "VERKTØY · SCORE-TIL-HCP"
- Headline: "Hvilken *HCP* har du?"
- Sub: "Skriv inn snittscoren din, så estimerer vi HCP basert på Broadie-data."

### 2. Skjema — sentralt
```
┌────────────────────────────────────────────┐
│                                            │
│  DIN SNITTSCORE (BRUTTO)                   │
│                                            │
│       [    78    ]                         │
│                                            │
│  Antall runder snittet er basert på:       │
│       [    20    ]                         │
│                                            │
│         [ Beregn HCP → ]                   │
│                                            │
└────────────────────────────────────────────┘
```

### 3. Resultat — etter beregning
```
DIN ESTIMERTE HCP

8.5
                              Det er HCP-nivå "Single-figure"

DETTE TILSVARER:
• Bedre enn 87% av norske amatører
• Ca. samme nivå som AK Golf Academy juniorgruppen
• Tour-ekvivalent: ca. 82.4 på en PGA-bane
                              [ Se Tour-ekvivalent → ]
```

### 4. "Hvordan vi beregner"
Editorial paragraph som forklarer Broadie-tabellen + at det er estimat.

### 5. Relaterte verktøy
Footer-strip med 4 andre verktøy.

### 6. Mersalg
"Vil du følge HCP-utvikling over tid? PlayerHQ logger runder + WHS-justering automatisk."

---

## DEL C — `/stats/verktoy/tour-ekvivalent`

Lignende struktur, men med 4 input-felt:
- Snittscore
- Norsk slope (default 125)
- Norsk CR (default 71.0)
- PGA Tour slope (default 145)
- PGA Tour CR (default 74.5)

Output: BIG mono Tour-score + breakdown av WHS-formel.

---

## DEL D — `/stats/verktoy/whs-kalkulator`

Mer komplekst — bruker legger inn 8-20 runder:

```
DINE RUNDER

#1   [ Score: 75 ]  [ Slope: 128 ]  [ CR: 71.5 ]  [ x ]
#2   [ Score: 73 ]  [ Slope: 132 ]  [ CR: 71.0 ]  [ x ]
...
     [ + Legg til runde ]

         [ Beregn WHS → ]
```

Output: WHS handicap (snitt av 8 beste av siste 20).

---

## DEL E — `/stats/verktoy/sg-estimator`

Bruker eksisterende `estimerSgFordelingFraSnitt`-helper:

Input: snittscore
Output: estimert SG-fordeling vist som radar + tall.

Lenke: "Sammenligne deg med Rory? → /stats/sg-sammenlign"

---

## DEL F — `/stats/verktoy/avstand`

Enkel konverter:
- Input: tall + enhet (yards/meter)
- Output: konvertert verdi
- Bonus: "yards til metres for Norsk amatør på ditt nivå" → bruker Broadie-data

---

## Mobile-tilpasning
- Skjema-felter: stables vertikalt
- Resultat-cards: full-bredde, BIG-tall reduseres
- Verktøy-grid: 1 kolonne

## Mikrointeraksjoner
- Input-felt: tall-keyboard på mobile
- Beregn-knapp: spinner + smooth scroll til resultat
- Resultat-tall: count-up
- "Endre input"-knapp som slipper bruker tilbake til skjema

## Inspirasjon
- whatsmyhandicap.com (UK) — målgruppe matches
- usga.org/handicap (offisiell)
- omnicalculator.com — simple SEO-verktøy

## Output
- Hub-side komplett
- 5 verktøy-pages som tekno-likner (samme template)
- Resultatside-pattern (med count-up + breakdown)
- Mobile-flow

## Implementasjon-notater
- Krever ingen DB
- ISR med revalidate Infinity (statisk)
- SEO-vennlige URLs ("score-til-hcp" matcher folks søketerm)
- Hver verktøy-side får OpenGraph med eksempel-tall
- Strukturert data (Schema.org `WebApplication` eller `Calculator`)
