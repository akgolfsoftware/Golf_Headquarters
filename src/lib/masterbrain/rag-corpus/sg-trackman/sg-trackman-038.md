---
chunk_id: sg-trackman-038
source: masterdokument-strokes-gained-trackman.md
source_section: "## Practical mapping-algoritme:"
tags: [amatør, baseline, formule, handicap, kategori, putt, sg]
topics: [beregning, implementasjon, putting, sg-baseline, sg-kategorier]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

1. Mottatt input: start\_yards, start\_lie, slutt\_yards, slutt\_lie
2. Baseline-oppslag: Slå opp begge verdier fra tabell (seksjon 5.1/5.2), bruk lineær interpolasjon mellom tabellverdiene
3. SG-beregning: SG = Baseline(start) − Baseline(slutt) − 1
4. Kategoritildeling: - OTT: Tee-slag på par-4 og par-5 - APP: Alle slag >100 yards fra hull som ikke er ARG/PUTT; alle par-3 tee-slag-ARG: Slag innen 30 yards fra greenkanten, ikke på green-PUTT: Alle slag på green
5. Feltkorreksjon (valgfri, for turneringsbruk): Trekk fra feltgjennomsnittet per kategori per runde

## Handicap-baseline vs. Tour-baseline: - Bruk Tour-baseline for absolutt SG (mest vanlig) -

For relativ analyse mot jevnaldrende: Arccos-modellen med «målhandicap» som referanse (Arccos SG Analytics) - Shot Scope Phase 3 vil tilby handicapbaserte baselines fra 80M+ amatørslag (Shot Scope SG-metodikk)

# 19.3 Visualisering: hvilke grafer fungerer

Basert på datakompleksiteten er følgende visualiseringsformater dokumentert effektive for golf-apps:

**Primærvisualiseringer:**

## Spindeldiagram (radar chart): Viser alle fire SG-kategorier i ett bilde. Spilleren kan

umiddelbart se om de er rund eller spiss-profil. Arccos bruker dette som primær SG- visualisering.

## Søylediagram (bar chart) — SG per kategori vs. baseline: Viser SG:OTT, SG:APP,

SG:ARG, SG:PUTT som søyler med en nullinje. Rød = negativ, grønn = positiv (unngå fargeblindhetsproblemer: bruk også etiketter).

## Scatter-plot — proximity vs. avstand: X-akse = avstand fra hull, Y-akse = proximity etter

slag. Overlay med Tour-snittet som referanselinje. Svært effektivt for å identifisere «avstandsgapet» (f.eks. 150-yard-problemet).

## Trend-linje (lineær/glattet) — SG over tid: Viser SG:APP (eller totalt) over siste 20–50

runder. Den viktigste grafen for å detektere faktisk forbedring vs. variasjon.

## Varmekart (heatmap) — slag-plott på banekart: GPS-basert plott av alle slag på en

bane. Fargekode etter SG-verdi (grønn = + SG, rød = − SG). Gir umiddelbar geografisk innsikt.

## Sekundærvisualiseringer: - Putteinnprosent-kurve per avstand vs. jevngruppebenchmark

- Carry-søyle per klubb vs. handicapnormen (fra seksjon 18.5) - Scrambling-rate per lie-type (søylediagram)

# 19.4 Personlige baselines og kalibrering

For avansert app-funksjonalitet kan personlige baselines beregnes fra brukerens eget historiske data:

Side 57 av 66

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

### Metode 1 — Rullende gjennomsnitt: Beregn en 20-runders rullende median per kategori.

Sammenlign inneværende runde mot personlig median.

### Metode 2 — Trackman Combine-basert kalibrering: Kjør en Combine-test (60 slag) og

bruk Combine Score til å estimere handicap og kalibrere app-baseline. PGA Tour snitt ~81.7; 18-HCP snitt ~46.7 (Trackman Combine brosjyre).

### Metode 3 — Handicap-indeks som proxy: Bruk handicap-indeks til å velge riktig

baseline-datasett (fra seksjon 18) som utgangspunkt. Juster med faktisk data etter 10+ runder.

### Metode 4 — Arccos/Shot Scope-integrasjon: Koble til eksisterende tracking-database

direkte via API for øyeblikkelig personlig baseline uten ny datainnsamling.

## 19.5 Måling av forbedring over tid

Effektiv forbedringssporinq krever forståelse for statistisk støy:

### Minimumsperspektiv for meningsfull analyse: - SG:Putting krever minst 5–10 runder

for en stabil trend (høy variasjon) - SG:APP og SG:OTT stabiliseres raskere (~5 runder) pga. flere slag per runde-SG:ARG er den mest ustabile kategorien (4–6 slag per runde — for lite for rask konvergens)

### Regresjon mot gjennomsnittet: Enkeltrundesverdier er nesten alltid støy. En +4.0

SG:Putting i én runde gir forventning om tilbakevending til personlig gjennomsnitt neste runde. Apper bør tydelig kommunisere dette — f.eks. ved å vise konfidensintervall eller minimum «nødvendige runder» for statistisk robusthet.

### Seasonale trender: Fordi nordmenn spiller sesongbasert, er sammenligninger mot forrige

sesongens snitt mer meningsfullt enn uke-til-uke-variasjon. En sesongbasert «before/after»- sammenligning etter instruksjonsblokk er det ideelle forbedringssignalet.

### Hva som virkelig endres ved forbedring: - Forbedring i carry (Trackman) → bør gi

proporsjonal SG:OTT-forbedring-Forbedring i proximity (Trackman, range) → bør gi SG:APP- forbedring-Forbedring i scrambling → SG:ARG-forbedring-Reduksjon i 3-putt-rate → SG:PUTT-forbedring

# 20\. Kritikk og begrensninger
