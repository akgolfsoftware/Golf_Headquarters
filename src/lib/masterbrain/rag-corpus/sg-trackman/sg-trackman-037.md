---
chunk_id: sg-trackman-037
source: masterdokument-strokes-gained-trackman.md
source_section: "## 17.1 Hvordan range-data oversettes til scoring (del 8)"
tags: [amatør, baseline, formule, handicap, kategori, sg]
topics: [implementasjon]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

| Handicap | Gj.sn. proximity(25-50 yards) |
| --- | --- |
| Scratch(0) | 17 fot |
| 5 | 23 fot |
| 10 | 24 fot |
| 15 | 27 fot |
| 20 | 30 fot |
| 25 | 33 fot |

19.1 Datapunkter en scoring/forbedring-app bør samle

For å beregne meningsfull SG-analyse trenger appen minimum følgende datapunkter per
slag:

Obligatoriske input: 1. Startposisjon: Avstand til hull (yards/meter), lie-type (tee /
fairway / rough / bunker / recovery / green) 2. Sluttposisjon: Avstand til hull etter slag, lietype 3. Slagtelling: Hvilket slag-nummer på hullet

19.2 Mapping fra brukerinput til SG-estimater

Grunnleggende SG-beregning (all-skill baseline):

Minste datasett for statistisk stabilitet (etter Arccos-anbefalinger): - Minimum 5–10
runder for å trekke tendenser - 50+ slag per kategori for statistisk robusthet - En runde på
~18 hull gir typisk: 14 drives, ~12 innspillsslag, ~5 kortspillslag, ~32 putter

Trackman/launch monitor-data (om tilgjengelig): 7. Ball Speed, Carry, Spin Rate,
Launch Angle, Attack Angle 8. Side (offline avstand), Smash Factor

SG(slag) = Baseline(start\_dist, start\_lie) − Baseline(slutt\_dist, slutt\_lie) − 1

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

For å implementere dette trenger appen en lookup-tabell basert på seksjon 5.1 og 5.2, eventuelt interpolert for mellomliggende avstandsverdier.
