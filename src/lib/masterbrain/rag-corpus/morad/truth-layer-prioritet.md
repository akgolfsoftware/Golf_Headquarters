---
chunk_id: morad-014
tags: ["truth", "prioritet", "data"]
topics: ["truth-layer", "signal"]
relevance: agent-rag
word_count: 88
---

# Truth layer — dataprioritet for coaching

## Rangering (høy → lav)
1. **L-fase + readiness** — hard override
2. **Junior-guard** — volum-cap, max økter/uke
3. **Periodisering** — TURN blokkerer tekniske endringer
4. **SG runde-data** (siste 5–30 runder, bruttoscore)
5. **TrackMan** (klubbdata, face_to_path, smash)
6. **Test-trend** (TEST_TREND / TEST_DELTA)
7. **Video-analyse** (P-posisjon, fusion med TM)
8. **Plan-watcher** (pyramide-adherence)

## Konflikt-regel
L-KROPP + APP -1.0 SG → kropp først, max 1 anbefaling, confidence capped 0.65.

## AI anbefaler, sperrer aldri
Guards logger avslag — vis alternativ med lavere volum.