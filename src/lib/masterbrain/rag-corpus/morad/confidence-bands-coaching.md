---
chunk_id: morad-015
tags: ["confidence", "coaching", "ui"]
topics: ["confidence", "retningssignal"]
relevance: agent-rag
word_count: 126
---

# Confidence bands — hvordan tolke og kommunisere

| Band | Verdi | UI-label | Handling |
|------|-------|----------|----------|
| Høy | ≥0.80 | Anbefaling | Full drill-prescription |
| Medium | 0.70–0.79 | Anbefaling | Standard volum |
| Retning | 0.50–0.69 | Retningssignal | Lavt volum, bekreft med test/video |
| Lav | <0.50 | Observasjon | Ikke endre plan — monitor |

## Faktorer som senker confidence
- Kun 1 datakilde (kun SG eller kun TrackMan)
- Video uten matchet TrackMan-slag
- <5 runder i SG-sample
- L-fase tidlig (KROPP/ARM)

## Invariant inv_7
Under 0.70 skal UI eksplisitt vise «retningssignal» — aldri som definitiv diagnose.

## Eksempel tekst
«Face åpen ved P7 er sannsynlig (0.62) — vi tester med 15 knock-down baller før planendring.»