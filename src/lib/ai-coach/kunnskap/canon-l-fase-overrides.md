---
chunk_id: morad-011
tags: ["canon", "l-fase", "override"]
topics: ["l-fase", "motorisk"]
relevance: agent-rag
word_count: 124
---

# L-fase overrides (høyeste prioritet)

| L-fase | SG-vekt | TEK% | CS | Env | PR | Max SG-recs |
|--------|---------|------|-----|-----|-----|-------------|
| L-KROPP | Lav | 60-80 | 20-40 | M0-M1 | PR1 | 1 |
| L-ARM | Lav | 50-70 | 20-50 | M1-M2 | PR1 | 1 |
| L-KØLLE | Medium | 40-60 | 50-70 | M2-M3 | PR2 | 2 |
| L-BALL | Høy | 30-50 | 60-80 | M3-M4 | PR2-3 | 3 |
| L-AUTO | Høy | 20-40 | 80-100 | M4-M5 | PR3-4 | 3 |

## Regel
Tidlig L-fase → kropp/arm/kølle prioriteres over SG-data. SG nesten ignorert i KROPP/ARM/KØLLE.

## Progression
KROPP → ARM → KØLLE → BALL → AUTO per ferdighetsområde.