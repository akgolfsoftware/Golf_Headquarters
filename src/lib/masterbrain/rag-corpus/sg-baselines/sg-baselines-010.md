---
chunk_id: sg-baselines-010
source: strokes-gained-authoritative-kb.md
source_section: "## SG:Total = SG:Off-the-Tee + SG:Approach-the-Green + SG:Around-the-Green + (del 5)"
tags: [app, ball-data, club-data, ott, sg, trackman]
topics: [implementasjon, trackman-parametere]
lang: en
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, TrackMan, beregnSg]
updated: 2026-06-14
---

| TrackMan Parameter | Expected Correlation with SG:Off-Tee | Priority for AI Analysis | Notes |
| --- | --- | --- | --- |
| Carry distance | r 0.65-0.85 | Primary | Directly determines approach position |
| Ball speed | r 0.60-0.80 | Primary | Determines carry and total distance |
| Club speed | r 0.55-0.75 | Secondary | Efficiency-dependent |
| Smash factor | r 0.30-0.50 | Secondary | Strike quality indicator |
| Offline (absolute) | r -0.40 to -0.60 | Primary | Accuracy penalty |
| Launch angle | r 0.20-0.40(conditional) | Tertiary | Optimal range varies by club/speed |
| Spin rate | r 0.10-0.30(conditional) | Tertiary | Optimization target, not direct SG driver |

The carry distance–SG:Off-the-Tee relationship is the strongest and most direct: each additional meter
of carry reduces the subsequent approach shot distance, with SG gain following the baseline function’s
derivative. For Norwegian junior development, carry distance targets should be course-length calibrated: 240m carry is excellent for 5,800m courses but marginal for 6,500m courses where 270m+ may
be necessary for reasonable approach distances on long par 4s.

4.1.2 SG:Approach Correlates

* * *

| TrackMan Parameter | Expected Correlation with SG:Approach | Priority for AI Analysis | Notes |
| --- | --- | --- | --- |
| Carry distance accuracy(proximity proxy) | r0.70-0.90 | Primary | Directly determines SG via finish position |
| Offline(absolute) | r-0.50 to-0.70 | Primary | Lateral dispersion cost |
| Spin rate | r0.30-0.50 | Secondary | Stopping power on greens |
| Landing angle | r0.25-0.45 | Secondary | Hold-green capability |
| Apex height | r0.15-0.30 | Tertiary | Wind susceptibility, landing optimization |
| Curve consistency | r0.10-0.25 | Tertiary | Shot pattern predictability |

4.1.3 SG:Around-the-Green and TrackMan Limitations TrackMan’s radar-based tracking faces
substantial challenges for short game shots (<30 yards):

The carry distance accuracy correlation dominates because SG:Approach is fundamentally determined by
where the ball finishes relative to the hole—the direct output of carry distance precision. The proximity-
SG relationship is non-linear (logarithmic): proximity improvements yield diminishing SG returns
at closer distances due to the flattening putting conversion curve.

| Challenge | Impact on Data Quality | Mitigation Strategy |
| --- | --- | --- |
| Reduced ball flight time | Increased measurement error | Enhanced radar sensitivity settings |
| Low ball speed | Signal-to-noise degradation | Proximity validation via camera |

* * *

Table 20 – continued

| Challenge | Impact on Data Quality | Mitigation Strategy |
| --- | --- | --- |
| Complex trajectories(lob shots) | Model misspecification | Manual trajectory classification |

Gap-filling protocols for AK Platform:

1. Manual input interface: Lie, distance, result (proximity or holed) for chip/pitch shots

2. Video analysis integration: Automated lie classification and result estimation

3. Physics-based estimation: From lie, distance, and result, back-calculate expected SG


4.1.4 SG:Putting and TrackMan Putting Data TrackMan’s putting analysis capabilities include:

| Parameter | Measurement Precision | SG Relevance |
| --- | --- | --- |
| Ball speed | $\\pm0.1$ mph | Critical-determines make probability |
| Launch direction | $\\pm0.5^{\\circ}$ | Critical-start line accuracy |
| Skid distance | $\\pm1$ inch | Secondary-roll quality indicator |
| Roll percentage | $\\pm5%$ | Secondary-distance control |
| Backspin/sidespin | $\\pm50$ rpm | Tertiary-green interaction |
