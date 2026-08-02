---
chunk_id: sg-baselines-009
source: strokes-gained-authoritative-kb.md
source_section: "## SG:Total = SG:Off-the-Tee + SG:Approach-the-Green + SG:Around-the-Green + (del 4)"
tags: [app, baseline, broadie, ott, putt, sg]
topics: [implementasjon, putting, sg-baseline]
lang: en
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

| Green Characteristic | Effect on Expected Putts | Adjustment Method |
| --- | --- | --- |
| Slope>1.5% | +10-15% vs. flat | Multiply baseline by 1.10-1.15 |
| Fast greens(Stimp>11) | +5-8% for lag putts | Distance-specific adjustment |
| Slow greens(Stimp<8) | -5-8% for lag putts | Distance-specific adjustment |
| Grain influence(bermuda/poa) | Direction-dependent | Regional baseline calibration |

The 10-foot putt on 2% slope should not be treated identically to a flat 10-footer; the effective difficulty
approaches that of a 12–14 foot flat putt depending on slope direction relative to break.

3.4 Course Difficulty Adjustment — Critical for Norwegian Context

3.4.1 Broadie’s Original Mixed-Effects Framework The foundational model simultaneously estimates player skill and course difficulty:

Total strokes for player i, round j = µi (player skill) + ￿j (course-round difficulty) + ￿ij
(error)

This framework enables direct comparison of performance across different courses and conditions, with ￿j
representing the course’s additive effect on expected score.

3.4.2 Practical Implementation for Norwegian Course Variability Norwegian courses range
from 5,200m park courses (slope ~110) to 6,500m+ championship venues (slope ~135+),
creating massive baseline variation that invalidates direct SG comparison without adjustment.

Proposed AK Platform adjustment methodology:

| Course Characteristic | Baseline Modification | Formula |
| --- | --- | --- |
| Slope rating | Multiplicative scaling | Baseline $ \\times $ (Slope/113) $ ^{\\wedge} $ , where0.5-0.7 |
| Course rating | Additive shift | Baseline+ (Course Rating-72)$ \\times $ , where0.3-0.5 |
| Length(meters) | Distance-specific shift | Interpolate between length-appropriate baseline tables |
| Elevation | Air density adjustment | -1.5% expected strokes per 300m elevation |

Example application:

* * *

| Course | Length | Slope | Course Rating | Adjustment Factor | Effective 150yd Fairway Baseline |
| --- | --- | --- | --- | --- | --- |
| Reference(PGA Tour avg) | 6800m | 125 | 74.0 | 1.00 | 2.98 |
| Onsøy(short park) | 5400m | 110 | 68.5 | 0.89 | 2.65 |
| Miklagard(championship) | 6500m | 135 | 75.2 | 1.08 | 3.22 |

Without this adjustment, a player averaging +0.5 SG on Onsøy would appear substantially worse than
the same player averaging +0.5 SG on Miklagard, despite equivalent relative performance. The AK
Platform’s NorwegianSkillBenchmark must implement this normalization to enable valid cross-course
comparison.

3.4.3 Weather and Wind Integration (Question 9) Norway’s wind exposure substantially exceeds
PGA Tour averages, necessitating explicit weather adjustment. Quantified wind effects from PGA
Tour analysis:

| Weather Variable | Effect on Total Strokes | Statistical Significance |
| --- | --- | --- |
| Wind speed(2 SD=8.6mph increase) | +1.15 strokes/round | p<0.001 |
| Wind gusts | Moderate positive | p<0.01 |
| Air density(2 SD=0.01lb/ft3increase) | +0.53 strokes/round | p<0.001 |
| Temperature(higher) | -0.3to-0.5 strokes/round | p<0.001 |

AK Platform wind adjustment proposal:

1. Baseline adjustment: Modify expected strokes based on measured wind speed/direction at shot
   time (TrackMan environmental sensors or weather API integration)

2. Player SG decomposition: Report both raw SG (actual performance) and wind-adjusted SG

3. TrackMan Integration Architecture for AK Golf

4. Player SG decomposition: Report both raw SG (actual performance) and wind-adjusted SG
   (skill estimate)

5. Norwegian-specific calibration: Develop wind multiplier tables based on local conditions

6. Norwegian-specific calibration: Develop wind multiplier tables based on local conditions
   (coastal vs. inland courses)


4.1.1 SG:Off-the-Tee Correlates

* * *
