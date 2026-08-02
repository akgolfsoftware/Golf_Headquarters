---
chunk_id: sg-baselines-002
source: strokes-gained-authoritative-kb.md
source_section: "(Preamble) (del 2)"
tags: [amatør, app, baseline, handicap, pga-tour, putt, sg]
topics: [implementasjon, pga-snitt, putting, sg-baseline]
lang: en
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

This drive was 0.275 strokes better than PGA Tour average—a substantial
gain that reflects both adequate distance and favorable resulting position. The subsequent approach
from 116 yards to 17 feet (baseline 1.826) yields 2.825 − 1.826 − 1 = −0.001 strokes, essentially
tour-average. Hoisting the 17-foot putt produces 1.826 − 0 − 1 = +0.826 strokes gained. The hole
total of +1.10 strokes (birdie on a 4.10-expected-strokes hole) decomposes as: 25% from driving,
0% from approach, 75% from putting—a distribution that highlights how SG precisely attributes
scoring outcomes to specific phases of play.

4.10\\mathrm{ ~~-~~}2.825\\mathrm{ ~~-~~}1=

\ .225-1.826-1=-0.001

1.826-0-1=+0.826

1.2 Amateur Baseline Calibration (Critical for Norwegian Context)

1.2.1 Estimated Baselines by Handicap Level Direct comparison against PGA Tour baselines
produces uniformly negative SG values for all amateur players, which—while mathematically correct—
offers limited actionable insight for improvement. The AK Platform must implement handicap-stratified
baselines that enable meaningful self-assessment and targeted training prescriptions. Shot Scope’s 80+
million shot database represents the most promising empirical foundation, with handicap-specific baseline
generation actively in development for six benchmark levels: scratch, 5, 10, 15, 20, and 25 handicap.

Pending full availability of Shot Scope’s amateur baselines, the AK Platform should implement a hierarchical Bayesian framework combining PGA Tour priors with platform-accumulated data. Preliminary
estimates for the critical 150-yard fairway position illustrate the scaling structure:

| Handicap | Estimated Baseline(150yd fairway) | Scaling Factor vs.PGA Tour | Differential(strokes) |
| --- | --- | --- | --- |
| PGA Tour Scratch(0) | 2.98 |  |  |
| ~3.20 | 1.00 |  |  |
| 1.07 | 0.00 |  |  |
| +0.22 |  |  |  |
| 5 | ~3.50 | 1.17 | +0.52 |
| 10 | ~3.85 | 1.29 | +0.87 |
| 15 | ~4.25 | 1.43 | +1.27 |
| 20 | ~4.70 | 1.58 | +1.72 |
| 25 | ~5.20 | 1.74 | +2.22 |

These estimates derive from interpolation between PGA Tour baselines and known amateur scoring
patterns, with non-uniform scaling that reflects the compounding effects of multiple skill deficiencies at
higher handicaps. The rough penalty also expands with handicap: while PGA Tour players face a 0.17-
stroke penalty at 150 yards, 20-handicap players may experience 0.30–0.40 strokes due to inconsistent
contact and limited spin control from difficult lies. The AK Platform must treat these as Bayesian priors
subject to continuous refinement as Norwegian-specific shot data accumulates.

* * *

1.2.2 SG Component Ranges vs. PGA Tour (Per Round) Comprehensive data from aggregated
amateur tracking platforms reveals consistent patterns in how strokes are lost across handicap levels.
These ranges, while presenting substantial within-handicap variation, establish critical reference boundaries for the AK Platform’s category classification system (A–K) and training allocation algorithms.

| Handicap | SG:Off-Tee | SG:Approach | SG:Around-Green | SG:Putting | Total SG |
| --- | --- | --- | --- | --- | --- |
| Scratch(0) | -0.5 to-1.5 | -0.8 to-2.5 | -0.2 to-1.0 | -0.1 to-1.5 | -1.6 to-6.5 |
| 5 | -1.2 to-2.5 | -2.0 to-4.0 | -0.8 to-2.0 | -0.5 to-2.0 | -4.5 to-10.5 |
| 10 | -2.0 to-3.5 | -3.5 to-6.0 | -1.5 to-3.0 | -1.0 to-2.5 | -8.0 to-15.0 |
| 15 | -3.0 to-5.0 | -5.0 to-8.0 | -2.0 to-4.0 | -1.5 to-3.0 | -11.5 to-20.0 |
| 20 | -4.5 to-7.0 | -7.0 to-11.0 | -3.0 to-5.0 | -2.0 to-4.0 | -16.5 to-27.0 |
