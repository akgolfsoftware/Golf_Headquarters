---
chunk_id: sg-baselines-014
source: strokes-gained-authoritative-kb.md
source_section: "## SG:Total = SG:Off-the-Tee + SG:Approach-the-Green + SG:Around-the-Green + (del 9)"
tags: [app, ott, pga-tour, putt, sg]
topics: [implementasjon, putting]
lang: en
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

| SG Component | Rounds for r>0.7(Estimated) | Platform Display Threshold | Confidence Interpretation |
| --- | --- | --- | --- |
| SG:Putting | 20-40 rounds | 15 rounds minimum | High variance; monthly aggregation recommended |
| SG:Approach | 15-25 rounds | 10 rounds minimum | Moderate variance; weekly trends informative |
| SG:Off-Tee | 10-20 rounds | 8 rounds minimum | Lower variance; relatively stable |
| SG:Around-Green | 12-20 rounds | 10 rounds minimum | Moderate variance; small sample sensitivity |

* * *

These estimates derive from PGA Tour stability analyses extrapolated to amateur contexts with higher inherent variance. The AK Platform’s CoachingForecast feature should apply Bayesian shrinkage: a player with SG:Putting +1.0 over 5 rounds might be displayed as “estimated true talent: +0.3 to +0.5” (60–70% regression toward long-term mean), while the same +1.0 over 30 rounds would shrink only 20–30%.
