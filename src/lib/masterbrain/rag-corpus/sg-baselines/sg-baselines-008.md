---
chunk_id: sg-baselines-008
source: strokes-gained-authoritative-kb.md
source_section: "## SG:Total = SG:Off-the-Tee + SG:Approach-the-Green + SG:Around-the-Green + (del 3)"
tags: [app, baseline, benchmarking, ott, sg]
topics: [benchmarking, implementasjon]
lang: en
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, diagnostiserSg, forventetSg]
updated: 2026-06-14
---

3.1.2 Regression and Smoothing Techniques The benchmark function J(d, c) requires estimation
across all distance-lie combinations, including those with sparse historical data. For well-sampled regions (fairway 100–200 yards, green 5–30 feet), local polynomial regression (LOESS) with adaptive bandwidth and cross-validated smoothing parameter selection provides optimal fit. For sparsely-sampled
regions (240+ yards in rough, recovery positions), penalized regression splines (P-splines) enforcing
monotonicity in distance, combined with hierarchical Bayesian models borrowing strength across similar
lies, enable stable estimation with explicit uncertainty quantification.

Modern implementations increasingly employ gradient boosting frameworks (XGBoost, LightGBM)
for baseline estimation, with advantages in handling high-dimensional lie-condition interactions. Critical
constraints include: monotonicity (expected strokes must decrease with decreasing distance), implemented via XGBoost monotone\_constraints; feature engineering for lie type × distance interactions
and course difficulty indicators; and regularization tuned via cross-validation to prevent overfitting in
sparse regions. The log-transformation of distance (ln(d)) substantially improves model fit by linearizing
the relationship between distance and expected strokes, with typical R² improvements of 0.15–0.25 over
raw distance specifications.

3.2 Lie-Adjusted SG: Stroke Difficulty Architecture

\\mathrm{R}^{2}

3.1.3 Sparse Data Handling and Uncertainty Quantification For unobserved or extreme combinations—e.g., 280-yard recovery shots from behind trees—physics-based extrapolation using TrackMan
launch data provides fallback estimation. The AK Platform must propagate uncertainty through all
SG calculations, displaying confidence intervals alongside point estimates in coaching interfaces. This
transparency prevents overconfident interpretation of SG values derived from limited or estimated data.

3.2.1 Verified Stroke Difficulty Multipliers (PGA Tour Baseline)

* * *

| Lie Condition | Relative Difficulty | Example(150yd) | Expected Strokes |
| --- | --- | --- | --- |
| Fairway | 1.00(reference) | 150yd fairway | 2.98 |
| Rough | 1.057 | 150yd rough | 3.15 |
| Sand(fairwaybunker) | 1.15-1.25 | 150yd bunker | ~3.42-3.73 |
| Recovery/scramble | Highly variable | Variable | Model-specific |

The rough penalty of 5.7% at 150 yards increases with distance (longer shots from rough face greater
difficulty in controlling both distance and direction) and varies with rough height/density—critical for
Norwegian courses with typically thicker rough than PGA Tour venues.

3.2.2 Norwegian-Specific Lie Adjustments Norwegian courses present distinct lie conditions requiring baseline modification:

| Condition | Adjustment Factor | Rationale |
| --- | --- | --- |
| Thick rough(common) | +10-20% vs.PGA Tour rough | Reduced lie contact,greater distance loss |
| Wet fairways(spring/autumn) | -3-5% roll-out | Carry distance more important |
| Firm links-style turf | +5% roll-out | Landing angle optimization critical |
| Tree roots/rocks(forest courses) | Variable recovery positions | Enhanced recovery shot identification |

3.3 Green-Adjusted SG: Putt Difficulty Modeling

3.3.2 Slope and Green Speed Integration The AK Platform must address whether a 10-foot putt
on a 2% slope equals a 10-foot putt on a flat green in the baseline. Current PGA Tour practice
integrates average green conditions across tournaments, with no explicit slope adjustment in published
SG:Putting. However, ShotLink records green contour data enabling post-hoc analysis.

| Putt Distance | Expected Putts | Make Probability |
| --- | --- | --- |
| 3 feet | 1.04 | ~96% |
| 5 feet | 1.15 | ~85% |
| 10 feet | 1.50 | ~50% |
| 20 feet | 1.87 | ~13% |
| 30 feet | 2.05 | ~5% |
| 40+feet | 2.15-2.20 | ~2% |

* * *
