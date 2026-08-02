---
chunk_id: sg-trackman-008
source: masterdokument-strokes-gained-trackman.md
source_section: "## 5.1 Full tabell: avstand × lie (10–600 yards, alle lie-typer) — PGA Tour (del 2)"
tags: [baseline, broadie, pga-tour, putt]
topics: [pga-snitt]
lang: no
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

Nøkkelroughstraffer (utledet fra tabellen ovenfor): - Ved 100 yards: rough koster 0.22
slag mer enn fairway (3.02 − 2.80) - Ved 120 yards: rough koster 0.23 slag mer enn fairway
(3.08 − 2.85) - Ved 160 yards: rough koster 0.25 slag mer enn fairway (3.23 − 2.98) - Ved
200 yards: rough koster 0.23 slag mer enn fairway (3.42 − 3.19) - I 150–300 yards-området
koster recovery-posisjoner ca. 0.6 slag mer enn fairway, og ca. 0.4 slag mer enn rough

Sand vs. rough-nyanse: Fra 15 til 34 yards er sand lavere forventede slag enn rough
(proffene er bedre fra bunker i det området). Utenfor dette området er sand verre.

5.2 Puttingbaseline (2–90 fot) — PGA Tour

Kilde: Broadie (2011), «Putts Gained: Measuring Putting on the PGA TOUR»

| Avstand(fot) | Gj.sn. putter for å hole ut |
| --- | --- |
| 2 | 1.01 |
| 3 | 1.05 |
| 4 | 1.14 |
| 5 | 1.24 |
| 6 | 1.34 |
| 7 | 1.43 |
| 8 | 1.50(50% ett-putt) |
| 9 | 1.56 |
| 10 | 1.61 |
| 15 | 1.78 |
| 20 | 1.87 |
| 30 | 1.98 |
| 33 | 2.00(nøyaktig to putter i snitt) |
| 40 | 2.06(tre-puttsamsynet overstiger 10%) |
| 50 | 2.14 |
| 60 | 2.21 |
| 90 | 2.36 |

Impliserte SG-verdier for putting (PGA Tour vs. Tour-snitt):

* * *

| Puttavstand | Baseline | Holder inne→SG | 2-putt→SG | 3-putt→SG |
| --- | --- | --- | --- | --- |
| 3 fot | 1.05 | +0.05 | -0.95 | -1.95 |
| 5 fot | 1.24 | +0.24 | -0.76 | -1.76 |
| 7 fot 10 tommer | 1.50 | +0.50 | -0.50 | -1.50 |
| 10 fot | 1.61 | +0.61 | -0.39 | -1.39 |
| 15 fot | 1.78 | +0.78 | -0.22 | -1.22 |
| 20 fot | 1.87 | +0.87 | -0.13 | -1.13 |
| 33 fot | 2.00 | +1.00 | 0.00 | -1.00 |
| 40 fot | 2.06 | +1.06 | +0.06 | -0.94 |
| 60 fot | 2.21 | +1.21 | +0.21 | -0.79 |
| 90 fot | 2.36 | +1.36 | +0.36 | -0.64 |

Nøkkelbenchmarks: Tour-proffene snitter 29 putter per runde fra gjennomsnittlig
startavstand på 17 fot. Gapet mellom den beste og dårligste putteren på Tour er nesten 2
putter per runde i SG-termer.

5.3 Sammenliknende baselines — PGA Tour vs. amatør (utvalgte
posisjoner)

Kilde: Pinpoint Golf; Broadie via CPG Golf

| Posisjon | PGA Tour-proff | 15-HCP amatør |
| --- | --- | --- |
| 400 yards, tee | 3.99 slag | 5.32 slag |
| 160 yards, fairway | ~2.98 slag | 3.92 slag |
| 20 yards, bunker | 2.53 slag | 3.05 slag |
| 30 fot, green | 1.98 putter | 2.24 putter |
| 5 fot, green | 1.26 putter | 1.59 putter |

• Tour-proffene holder inn 50% fra 8 fot; amatør 90-spillere holder inn 50% fra kun 5 fot

• Tour-proffene snitter to putter fra 33 fot; 90-spillere snitter to putter fra kun 19 fot

5.4 Hvordan baselines beregnes

2. For hver startposisjon (avstand × lie-kombinasjon): beregn gjennomsnittlig totalt antall
   slag for å fullføre hullet over alle historiske tilfeller

3. Jevn ut den resulterende funksjonen for å eliminere støy fra små utvalgsstørrelser ved
   ekstreme avstander
