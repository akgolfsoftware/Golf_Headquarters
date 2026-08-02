---
chunk_id: sg-trackman-033
source: masterdokument-strokes-gained-trackman.md
source_section: "## 17.1 Hvordan range-data oversettes til scoring (del 4)"
tags: [amatør, broadie, handicap, lpga, pga-tour, putt, sg]
topics: [implementasjon, lpga-snitt, pga-snitt, putting]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

| Nivå | SG: OTT | SG: APP | SG: ARG | SG: PUTT | Totalt vs. scratch |
| --- | --- | --- | --- | --- | --- |
| PGA Tour | +1.2 | +1.8 | +0.5 | +0.8 | ~+4.3 |
| LPGA Tour | +0.6 | +0.9 | +0.2 | +0.3 | ~+2.0 |
| Scratch(0) | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| 5-handicap | -1.2 | -2.0 | -0.9 | -0.5 | ~-4.6 |
| 10-handicap | -2.0 | -3.5 | -1.5 | -0.8 | ~-7.8 |
| 15-handicap | -3.0 | -5.0 | -2.5 | -1.2 | ~-11.7 |
| 20-handicap | -4.0 | -6.5 | -3.5 | -1.5 | ~-15.5 |
| 25-handicap | -5.0 | -8.0 | -4.5 | -2.0 | ~-19.5 |
| Gj.sn.dame(≈28hcp) | -6.0 | -9.0 | -5.0 | -2.5 | ~-22.5 |

Broadies to-tredjedels-regel: «Omtrent to tredjedeler av en 10-slag-forskjell kommer fra
slag utenfor 100 yards og omtrent en tredjedel fra innenfor 100 yards — og det er ganske
robust på tvers av disse enormt ulike ferdighetsnivåene» — Broadie via CPG Golf.

Innspillsspillet dominerer: For nesten alle spillere, uavhengig av handicap, er SG:APP den
enkeltkategorien der flest slag tapes relativt til ethvert høyere referansenivå.

18.3 Driver-spesifikasjoner per nivå

Kilde: Trackman 2024 Tour-snitt, Trackman ball speed blog, USGA 2023 Recreational Golfer
Study, Hank Haney/Trackman Combine PDF

* * *

| Nivå | Klubbhastighet(mph) | Ballhastighet(mph) | SmashFactor | Angrepsvink.(°) | Spinnrate(rpm) | Carry(yards) | Totaldistanse(yards) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PGA Tour | 113-116 | 167-171 | 1.48-1.49 | -0.9° | 2545-2686 | 275-282 | 295-305 |
| LPGA Tour | 94-96 | 140-143 | 1.48 | +2.8° | 2506-2611 | 218-223 | 240-256 |
| Scratch(M) | ~110 | 161 | ~1.47-1.49 | -0.9° | 2896 | 252 | ~265-275 |
| 5 HCP(M) | ~101 | 147 | ~1.44-1.46 | -1.1° | 2987 | 223 | ~245-255 |
| 10 HCP(M) | ~95 | 138 | ~1.44-1.45 | -1.2° | 3192 | 205 | ~225-235 |
| 14.5HCP(M) | ~94 | 133 | ~1.43-1.44 | -1.8° | 3275 | 195 | ~210-220 |
| Bogey(~18+HCP,M) | ~92 | 131 | ~1.42-1.43 | -2.1° | 3127 | 184 | ~200-210 |
| Scratch(K) | ~90 | 131 | ~1.45-1.46 | -0.9° | 2831 | 197 | ~210-220 |
| 5 HCP(K) | ~87 | 125 | ~1.44-1.45 | -1.8° | 3027 | 178 | ~195-205 |
| 10 HCP(K) | ~83 | 119 | ~1.43-1.44 | -1.7° | 3207 | 163 | ~183-193 |
| 15 HCP(K) | ~79 | 111 | ~1.40-1.41 | -2.3° | 3287 | 149 | ~170-180 |

18.4 7-jern-spesifikasjoner per nivå

| Kategori | Ca. HCP | Klubbhastighet | Ballhastighet | Startvinkel | Spinnrate | Carry |
| --- | --- | --- | --- | --- | --- | --- |
| Profesjonell | Tour | 113.7mph | 169.0mph | 11.1° | 2259rpm | 262.2yards |
| Kategori1 | 0-5 | 100.5mph | 143.8mph | 11.4° | 3274rpm | 215.1yards |
| Kategori2 | 6-12 | 91.4mph | 130.6mph | 10.7° | 3313rpm | 183.6yards |
| Kategori3 | 13-20 | 85.8mph | 121.9mph | 12.2° | 3202rpm | 163.3yards |
| Kategori4 | 21+ | 89.6mph | 125.6mph | 10.2° | 3839rpm | 163.1yards |

Kilde: Trackman PGA Tour averages PDF, Shot Scope YouTube-analyse, Golf Monthly Shot
Scope-data, USGA 2023 rekreasjonsstudie

* * *
