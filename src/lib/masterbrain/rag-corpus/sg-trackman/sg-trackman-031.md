---
chunk_id: sg-trackman-031
source: masterdokument-strokes-gained-trackman.md
source_section: "## 17.1 Hvordan range-data oversettes til scoring (del 2)"
tags: [amatør, benchmarking, handicap, kort-spill, pga-tour, putt, sg]
topics: [benchmarking, kortspill]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, diagnostiserSg, forventetSg]
updated: 2026-06-14
---

| Lie-type | Gj.sn. Proximity(60-100 yards) |
| --- | --- |
| Fairway | 40 fot |
| Rough | 46 fot |
| Bunker | 56 fot |

Kortspill proximity etter handicap (25–50 yards):

| Handicap | Gj.sn. Proximity(25-50yds) |
| --- | --- |
| Scratch(0) | 17 fot |
| 5 | 23 fot |
| 10 | 24 fot |
| 15 | 27 fot |
| 20 | 30 fot |
| 25 | 33 fot |

* * *

Scrambling (up-and-down%) etter handicap:

Kilde: Shot Scope benchmark-data

| Handicap | Up & Down % |
| --- | --- |
| 0 | 47% |
| 5 | 41% |
| 10 | 31% |
| 15 | 21% |
| 20 | 20% |
| 25 | 18% |
| PGA Tour | 57-60% |

17.6 Putting → SG: PUTT

PGA Tour putting hold-inn-prosent:

Kilde: golf.com PGA Tour putting analysis

| Avstand | PGA Tour Hold-inn % |
| --- | --- |
| 3 fot | 99.4% |
| 4 fot | 91.4% |
| 5 fot | 80.7% |
| 6 fot | 70.2% |
| 7 fot | 60.6% |
| 8 fot | 52.9% |
| 9 fot | 46.4% |
| 10 fot | 41.3% |
| 11-15 fot | 30.1% |
| 15-20 fot | 18.3% |
| 20-25 fot | 12.5% |
| 25+ fot | 5.5% |

Nøkkel 50/50-punktet for PGA Tour er ca. 8 fot. For 90-ere er det nærmere 5 fot —
bryanpategolf.com.

Slagene fra Broadies tabell (med implikerte SG):

* * *

| Puttavstand | Baseline | Hold inne→SG | 2-putt→SG | 3-putt→SG |
| --- | --- | --- | --- | --- |
| 3 fot | 1.05 | +0.05 | -0.95 | -1.95 |
| 5 fot | 1.24 | +0.24 | -0.76 | -1.76 |
| 8 fot | 1.50 | +0.50 | -0.50 | -1.50 |
| 10 fot | 1.61 | +0.61 | -0.39 | -1.39 |
| 20 fot | 1.87 | +0.87 | -0.13 | -1.13 |
| 33 fot | 2.00 | +1.00 | 0.00 | -1.00 |
| 40 fot | 2.06 | +1.06 | +0.06 | -0.94 |

DECADE-innsikt om putting geometri: Fra Scott Fawcett: ditt slagmønster på en 20-fotputt er 3–6× dypere enn det er bredt — det betyr at fartkontroll er den dominerende
feilen, ikke linjen. Å sikte mot å ha den innerste 50% av fartfordelingen ende 18–24 tommer
forbi hullet er matematisk optimalt for å kombinere hold-inn-rate og 3-putt-unngåelse.

17.7 Trackman Combine og Performance Center

Trackman Combine er Trackmans standardiserte 60-slag-test:

Format: - Slå 6 slag mot hvert av: 60, 70, 80, 90, 100, 120, 140, 160, 180 yards, pluss 6
driver - Hvert slag scores 0–100 basert på proximity til mål (carry-basert) - «Perfekt 100»-
sirkel ≈ 1.45% av slagavstand (f.eks. ~1.45 yards ved 100 yards) - Resultater inkluderer:
score per avstand, aggregert score, gj.sn. avstand fra pin, gj.sn. driver-avstand/presisjon,
persentil-rangering vs. jevngrupper

Kilde: FSGA/Trackman-database

Combine Score til Handicap-korrelasjon:

| Combine Score | Estimert Handicap |
| --- | --- |
| >84 | +5 eller bedre |
| 83 | +4 |
| 82 | +3 |
| 81 | +2 |
| 80 | +1 |
| 78-79 | 0 |
| 77 | 1 |
| 76 | 2 |
| 73-75 | 3 |
| ~65-70 | ~10 |
| ~50 | ~18 |

Eksempel PGA Tour Combine-snitt per avstand (Trackman brosjyre):

* * *
