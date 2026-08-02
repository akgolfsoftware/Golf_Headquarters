---
chunk_id: sg-baselines-001
source: strokes-gained-authoritative-kb.md
source_section: "(Preamble) (del 1)"
tags: [baseline, pga-tour, sg]
topics: [implementasjon, pga-snitt, sg-baseline]
lang: en
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

Strokes Gained: Authoritative Knowledge Base for AK Golf Platform

1. Core SG Calculation Engine — Exact Values for Implementation

1.1.1 Verified Expected Strokes Values The foundation of Strokes Gained analytics rests upon
precise baseline values representing the expected number of strokes to hole out from any position on the
golf course. These baselines, derived from millions of PGA Tour shots tracked through the ShotLink
system since 2003, constitute the reference standard against which all player performance is measured.
For the AK Golf Platform, seven critical anchor points must be hard-coded into the database schema
with floating-point precision to prevent cumulative rounding errors across 70+ shots per round.

| Position | Distance | Lie | Expected Strokes | Confidence |
| --- | --- | --- | --- | --- |
| Fairway | 150 yards | Fairway | 2.98 | High-multiple source verification |
| Rough | 150 yards | Rough | 3.15 | High-multiple source verification |
| Tee | 300 yards | Tee(par4) | 3.50 | High-standard reference |
| Tee | 450 yards | Tee(par4) | 4.10 | High-worked examples |
| Sand | 30 yards | Bunker | 2.53 | High-standard reference |
| Green | 20 feet | Putting surface | 1.87 | High-multiple verification |
| Green | 5 feet | Putting surface | 1.15 | High-standard reference |
| In hole | 0 | - | 0.00 | Definitional |

The non-linear structure of these baselines demands careful interpolation. The expected strokes function
decreases rapidly at short distances (steep slope from 30 to 100 yards), then flattens progressively toward
longer distances where even elite players cannot reliably hit greens. Log-transformation of distance
substantially improves model fit for this relationship, with R² improvements of 0.15–0.25 over raw
linear specifications in published regression analyses.

(3.15\\mathrm{ ~~-~~}2.98=0.17.

\\mathrm{R}^{2}

* * *

SG = (Expected Strokes at Start Position) − (Expected Strokes at Finish Position) − 1

The subtraction of 1 accounts for the stroke actually taken. Positive values indicate performance superior
to the PGA Tour benchmark; negative values indicate inferior performance. This formula’s additive
property enables exact decomposition: the sum of all shot-level SG values equals the round’s SG:Total,
which further decomposes into the four component categories.

A concrete example illustrates the computation pipeline. On a 446-yard par 4, a player hits a drive to
the fairway at 116 yards from the hole. The tee baseline is 4.10 strokes; the 116-yard fairway baseline
is 2.825 strokes (interpolated). The SG:Off-the-Tee calculation proceeds as: 4.10 − 2.825 − 1 =

+0.275 strokes gained. This drive was 0.275 strokes better than PGA Tour average—a substantial
gain that reflects both adequate distance and favorable resulting position.
from 116 yards to 17 feet (baseline 1.826) yields 2.825 − 1.826 − 1 = −0.001 strokes, essentially
tour-average. Hoisting the 17-foot putt produces 1.826 − 0 − 1 = +0.826 strokes gained. The hole
total of +1.10 strokes (birdie on a 4.10-expected-strokes hole) decomposes as:
0% from approach, 75% from putting—a distribution that highlights how SG precisely attributes
scoring outcomes to specific phases of play.
