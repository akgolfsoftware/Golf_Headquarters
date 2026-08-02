---
chunk_id: sg-trackman-034
source: masterdokument-strokes-gained-trackman.md
source_section: "## 17.1 Hvordan range-data oversettes til scoring (del 5)"
tags: [club-data, lpga, pga-tour]
topics: [lpga-snitt, pga-snitt]
lang: no
relevance: [CoachHQ, RAG, SgBaseline, TrackMan, forventetSg]
updated: 2026-06-14
---

| Nivå | Klubbhastighet | Carry(yards) | Totaldistanse(yards) | GIR% med7-jern | Gj.sn. proximity |
| --- | --- | --- | --- | --- | --- |
| PGA Tour | 90 mph | 172 | ~185 | ~85% | ~20 fot(GIR) |
| LPGA Tour | 76-78 mph | 141-143 | ~155 | ~78% | ~25 fot(GIR) |
| Scratch(M) | ~82-86 mph | 160-165 | ~170-175 | ~50% | ~72 fot(alle) |
| 5 HCP(M) | ~78-82 mph | 150-155 | ~162-168 | ~35% | ~85 fot(alle) |
| 10 HCP(M) | ~74-78 mph | 140-145 | ~148-158 | ~20-30% | ~100 fot(alle) |
| 15 HCP(M) | ~70-74 mph | 132-138 | ~142-154 | ~15-20% | ~130 fot(alle) |
| 20 HCP(M) | ~67-71 mph | 125-130 | ~135-145 | ~10-15% | ~150 fot(alle) |
| 25 HCP(M) | ~63-68 mph | 115-120 | ~125-135 | ~8-12% | ~180 fot(alle) |
| Gj.sn.dame(≈28 hcp) | ~55-65 mph | ~85-100 | ~95-110 | ~8-12% | ~200+ fot(alle) |

Kritisk innsikt fra Shot Scope jernspillanalyse: - Gjennomsnittsspilleren (≈15 HCP):
~20% sjanse for å treffe greenen med 7-jern; 144 fot gjennomsnitts-proximity - Scratchspiller: ~50% GIR med 7-jern; ~72 fot gjennomsnitts-proximity - Topp 10% i Shot Scopedatabasen: 53% GIR; 49 fot proximity; bare 11-yards gap mellom P-Avg og Avg avstand
(konsistens er nøkkelen)

18.5 Carry-matrise alle jern × handicap-nivå (yards)

Merk: Disse tallene er carry-distanser (ikke total). Total avstand er typisk 5–15% høyere
avhengig av baneforhold. Verdiene er gjennomsnitt — individuelle variasjoner på ±10–20
yards er normale.

| Klubb | Scratch(0) | 5 HCP | 10 HCP | 15 HCP | 20 HCP | 25 HCP |
| --- | --- | --- | --- | --- | --- | --- |
| Driver | 250 | 235 | 220 | 205 | 195 | 180 |
| 3-jern/tre-køllen | 225 | 212 | 200 | 188 | 178 | 165 |
| Hybrid | 210 | 198 | 187 | 175 | 165 | 152 |
| 4-jern | 190 | 180 | 170 | 160 | 150 | 138 |
| 5-jern | 180 | 170 | 160 | 151 | 142 | 130 |
| 6-jern | 172 | 162 | 152 | 145 | 136 | 125 |
| 7-jern | 165 | 155 | 145 | 138 | 130 | 120 |
| 8-jern | 155 | 145 | 135 | 128 | 120 | 110 |
| 9-jern | 143 | 133 | 125 | 118 | 110 | 101 |
| PW | 130 | 122 | 115 | 108 | 100 | 92 |
| GW | 115 | 108 | 102 | 96 | 89 | 82 |
| SW | 95 | 90 | 85 | 80 | 74 | 68 |

* * *

18.6 Proximity-matrise (65–200+ yards × nivå)

Gjennomsnittlig proximity til hullet (i fot) fra ulike avstandsintervaller, per ferdighetsnivå.

Kilde: Golf Monthly/Shot Scope proximity-tabell, Arccos Dan Parker video, mikebury.com PGA
Tour proximity
