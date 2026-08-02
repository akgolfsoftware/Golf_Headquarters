---
chunk_id: sg-trackman-032
source: masterdokument-strokes-gained-trackman.md
source_section: "## 17.1 Hvordan range-data oversettes til scoring (del 3)"
tags: [amatør, app, baseline, benchmarking, handicap, sg, trackman]
topics: [benchmarking, trackman-parametere]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, TrackMan, beregnSg, diagnostiserSg, forventetSg]
updated: 2026-06-14
---

| Avstand | Gj.sn. avstand fra pin(yards) | Score |
| --- | --- | --- |
| 60 yards | 5.2 | 75 |
| 80 yards | 6.9 | 73 |
| 100 yards | 8.5 | 70 |
| 120 yards | 11.2 | 68 |
| 140 yards | 13.5 | 68 |
| 160 yards | 16.1 | 65 |
| 180 yards | 19.5 | 62 |
| Driver | 228.7 carry,26.8 yards side | 50 |

Trackman Performance Center — tilgjengelig via Trackman Golf Pro — gjør trening til SGbenchmarket konkurranse (Trackman Performance Center): - Presenterer tilfeldige pinposisjoner på simulerte greener - Scorer hvert slag med SG:APP vs. Tour-snitt eller valgt
handicap (0–15) - Viser om carry lander i positiv-SG-«sirkelen» for hvert slag - Sepp Straka
bruker det ukentlig: kjører sin wedge-combine (50–130 yards) og Performance Center (130–
220 yards) hver Tour-uke som kalibreringssbaseline (Trackman om Straka)

18. Komplett benchmark-matrise

Dette er dokumentets sentralreferanse-seksjon — tabellene som danner datafundamentet
for en golfapp. Alle verdier er kompilert fra primærkilder med variasjonsintervaller der data
er tilgjengelig.

18.1 Scoring og fundamentals (score, GIR, FIR, scrambling, 3-putt)
for 8 nivåer

Kilde: Shot Scope SG-rapport, breakxgolf.com (3 788 runder), ejsgolf.com, PGA Tour Stats

* * *

| Nivå | Gj.sn. score | vs. par | GIR% | Fairways% | Scrambling% | 3-putts/runde | Putts/runde |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PGA Tour | 70.0 | -2.0 | 66-67% | 58-60% | 57-60% | ~0.49 | 28-29 |
| LPGA Tour | 71.3 | -0.5 | 71-73% | 70-75% | 50-58% | ~0.70 | 29-30 |
| Scratch(0) | 74.6-75.8 | +0.8 til+2.8 | 56-62% | 50-56% | 47-57% | ~0.8-1.0 | 29.4-31 |
| 5-handicap | 79.0-81.3 | +5 til+7 | 44-46% | 48-51% | 37-41% | ~1.2 | 30.2-32 |
| 10-handicap | 84.6-86.9 | +10 til+13 | 36-37% | 49% | 30-32% | ~2.0 | 31.2-34 |
| 15-handicap | 89.3-92.4 | +15 til+18 | 24-26% | 48% | 21-25% | ~2.5-3.3 | 33.1-35 |
| 20-handicap | 93.7-97.7 | +20 til+24 | 17-22% | 43-46% | 18-22% | ~3.5-4.0 | 33.1-36 |
| 25-handicap | 98.6-103.0 | +25 til+29 | 10-19% | 43-46% | 18-20% | ~5.0+ | 33.8-37 |
| Gj.sn.dame(≈28 hcp) | ~105-110 | +33 til+38 | ~15-20% | ~55-65% | ~15-20% | ~5.0+ | 35-40 |

Viktig GIR-innsikt: GIR-prosenten er den tradisjonelle statistikken som fremdeles holder
seg sterkest som handicap-prediktor. Lou Stagner via golfexpectations.com: «Det er et veldig
sterkt forhold mellom handicap og GIR%. GIR er den ene tradisjonelle statistikken som
fremdeles holder.» En 15-handicapper som treffer en GIR har i snitt 33 fot fra hullet til
birdieputten — allerede en vanskelig posisjon.

Fairways-innsikt: Scratchspillere treffer bare 4% flere fairways enn 20–25-handicappere.
Fairway-presisjon skiller nesten ikke nivåene; avstand og GIR er primærdifferensiatorer. Den
egentlige «presisjons»-fordelen til scratch er at de oppnår 50–56% fairways mens de slår 50–
80 yards lenger.

18.2 Strokes Gained-fordeling per nivå (OTT/APP/ARG/PUTT vs.
scratch)

Alle SG-verdier er i slag pr. runde, med scratch (0 HCP) som baseline = 0.0 i alle
kategorier. Negative verdier = slag tapt til scratch. Positive verdier (for Tour-spillere) = slag
vunnet over scratch.

Kilde: Arccos Sal Syed masterclass-data, Shot Scope benchmarks, Broadies forskning via CPG
Golf

* * *
