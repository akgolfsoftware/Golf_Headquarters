---
chunk_id: sg-baselines-003
source: strokes-gained-authoritative-kb.md
source_section: "(Preamble) (del 3)"
tags: [amatør, app, handicap, putt, sg]
topics: [implementasjon]
lang: en
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

Several patterns emerge with direct platform implications. First, Approach-the-Green consistently
represents the largest single source of strokes lost at all handicap levels above scratch, with the
gap widening dramatically at higher handicaps. A 20-handicap player loses 2–3× more strokes in
approach play than a 5-handicap player, emphasizing this category’s primacy in improvement planning.
Second, the variability within each handicap band (range widths of 1.0–4.0 strokes per component) reflects
genuine heterogeneity in skill profiles—some 10-handicap players drive like 5-handicaps but putt like 15-
handicaps. The AK Platform must accommodate this variation through individualized analysis rather
than generic handicap-based prescriptions. Third, Putting deficits remain relatively modest even
at the 20-handicap level, supporting Broadie’s finding that putting is not the primary differentiator
between amateur skill levels.

1.2.3 Inter-Handicap SG Differentials for Training Prioritization For practical coaching decisions, the differential between adjacent handicap levels matters more than comparison to PGA Tour
benchmarks. These values directly drive the AK Platform’s training allocation algorithms and SPES
periodization.

| Comparison | SG:Off-Tee | SG:Approach | SG:Around-Green | SG:Putting | Total |
| --- | --- | --- | --- | --- | --- |
| 20→15HCP | ~1.5-2.0 | ~2.0-3.0 | ~1.0-1.5 | ~0.5-1.0 | ~5.0-7.5 |
| 15→10HCP | ~1.0-1.5 | ~1.5-2.5 | ~0.5-1.0 | ~0.5 | ~3.5-5.5 |
| 10→5HCP | ~0.8-1.0 | ~1.5-2.0 | ~0.7-1.0 | ~0.5 | ~3.5-4.5 |
| 5→0HCP | ~0.7-1.0 | ~1.2-2.0 | ~0.6-1.0 | ~0.4-1.0 | ~2.9-5.0 |

The 15 → 10 handicap transition, which represents a critical competitive threshold in Norwegian
golf (enabling qualification for national championships and college recruitment consideration), requires
disproportionate approach play improvement. The Approach category contributes 40–45% of the
total stroke reduction in this transition, with Off-the-Tee contributing 25–30%, Around-Green 15–
20%, and Putting 10–15%. This distribution validates the platform’s default SPES-period emphasis on
iron play and wedge distance gapping for players in this zone, while maintaining flexibility for individual

The 15 → 10 handicap transition, which represents a critical competitive threshold in Norwegian
golf (enabling qualification for national championships and college recruitment consideration), requires
disproportionate approach play improvement. The Approach category contributes 40–45% of the
total stroke reduction in this transition, with Off-the-Tee contributing 25–30%, Around-Green 15–
This distribution validates the platform’s default SPES-period emphasis on
iron play and wedge distance gapping for players in this zone, while maintaining flexibility for individual

iron play and wedge distance gapping for players in this zone, while maintaining flexibility for individual
variation detected through TrackMan and on-course data.

* * *
