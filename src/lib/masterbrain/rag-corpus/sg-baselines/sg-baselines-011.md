---
chunk_id: sg-baselines-011
source: strokes-gained-authoritative-kb.md
source_section: "## SG:Total = SG:Off-the-Tee + SG:Approach-the-Green + SG:Around-the-Green + (del 6)"
tags: [app, baseline, club-data, ott, putt, sg, trackman]
topics: [implementasjon, putting, trackman-parametere]
lang: en
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, TrackMan, beregnSg, forventetSg]
updated: 2026-06-14
---

However, TrackMan putting deployment remains limited in amateur settings due to calibration requirements and space constraints. The AK Platform should prioritize integration with sensor-based systems
(Arccos, Shot Scope) for putting data, using TrackMan putting parameters primarily for elite player development.

4.2 Algorithm Flow: From TrackMan Shot to SG Value

4.2.1 Complete Pipeline Specification Input: TrackMan shot record with: club, carry distance,
offline, launch parameters, resulting lie/position

| Step | Operation | Example |
| --- | --- | --- |
| 1 | Identify start position baseline | 320yd par 4 tee: expected strokes=4.10 |
| 2 | Map TrackMan output to finish position | 268m(293yd) carry,12yd right,fairway $\\rightarrow$ 150yd from hole,fairway |
| 3 | Look up finish position baseline | 150yd fairway:expected strokes=2.98 |
| 4 | Apply SG formula | SG=4.10-2.98-1=+0.12 |
| 5 | Categorize and accumulate | SG:Off-the-Tee+=0.12 |

Alternative scenario with suboptimal outcome:

* * *

| Step | Operation | Example |
| --- | --- | --- |
| 1 | Start position baseline | 320yd par 4 tee:4.10 |
| 2 | Finish position mapping | 268m carry,12yd right,rough $\\rightarrow$ 150yd from hole,rough |
| 3 | Finish position baseline | 150yd rough:3.15 |
| 4 | SG calculation | SG=4.10-3.15-1=-0.05 |
| 5 | Categorization | SG:Off-the-Tee+=-0.05 |

The 0.17-stroke swing between fairway and rough from identical carry distance illustrates the accuracy
premium’s direct SG impact.

4.3 Data Quality and Device Variation

4.3.1 TrackMan Device-Specific Characteristics

| Device | Environment | Ball Tracking | Key Limitations | AK Platform Adjustment |
| --- | --- | --- | --- | --- |
| TrackMan4e | Outdoor(primary) | Full Doppler,3D trajectory | Wind interference,occasional signal loss | Environmental correctionalgorithms |
| TrackManIO | Indoor | Optimized forlimited flight | No wind/weatherintegration,rollestimation required | Indoor-to-outdoor conversionfactors |
| TrackManRange | Practice range | Simplifiedtrajectory model | No hole context,target-only analysis | Manual hole assignment for SGcalculation |
| TrackManon-course | Playingconditions | Variable signalquality | GPS integrationrequired for positionmapping | Position validation againstcourse database |

4.3.2 Missing Data Protocols

| Missing Data Type | Prevalence | Handling Strategy | Confidence Flag |
| --- | --- | --- | --- |
| Putting | 30-50% of shots | Manual entry via mobile UI; Arccos/Shot Scope sync | Low(manual)/Medium(sensor) |
| Chipping/pitching(<30yd) | 20-30% of shots | Lie+distance+result estimation;video analysis | Medium |
| Penalty shots | 2-5% of rounds | Rule-based position assignment;manual verification | High(rule-based) |
| Drives with signal loss | 5-10% of rounds | GPS fallback;interpolation from known positions | Medium |

* * *

5. Training Distribution and Motor Learning Integration

5.1 Evidence-Based Practice Allocation

5.1.1 SG-Optimal Distribution Framework The AK Platform’s training recommendation engine
must balance SG-prioritized allocation against motor learning constraints. The data-driven starting
point:

| Handicap Range | Primary Focus(SG Weight) | Secondary Focus | Tertiary Focus | Minimal Focus |
| --- | --- | --- | --- | --- |
| 20-25 | Approach(35%),Off-Tee(30%) | Around-Green(20%) | Putting(15%) | - |
| 15-20 | Approach(40%),Off-Tee(25%) | Around-Green(20%) | Putting(15%) | - |
| 10-15 | Approach(40%),Off-Tee(30%) | Around-Green(15%) | Putting(15%) | - |
| 5-10 | Approach(35%),Off-Tee(30%) | Putting(20%) | Around-Green(15%) | - |
| 0-5 | Balanced optimization | Individual weakness targeting | Maintenance | - |

5.1.2 Diminishing Returns Analysis
