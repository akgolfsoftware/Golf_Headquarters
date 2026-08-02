---
chunk_id: sg-trackman-009
source: masterdokument-strokes-gained-trackman.md
source_section: "## 5.1 Full tabell: avstand × lie (10–600 yards, alle lie-typer) — PGA Tour (del 3)"
tags: [amatør, baseline, broadie, handicap, kategori, pga-tour, putt, sg]
topics: [broadie, pga-snitt, putting, sg-baseline, sg-kategorier]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

• Tour-proffene tre-putter ca. 0.55 ganger per runde (~2.2 per turnering); 90-spillere
tre-putter ca. 2.3 ganger per runde — omtrent fire ganger så ofte

4. Rekalibreres hvert år med data fra forrige sesong slik at baselines holder seg aktuelle

* * *

5. Bruker kurs-vanskelighet-justeringer per runde (trekker fra feltsnitts-SG per runde per
   kategori)

6. Putt-baselines beregnes i tommer-intervaller for maksimal presisjon, per Broadies
   puttingpaper


5.5 Tour-baseline vs handicap-baseline

Tour-baseline bruker PGA Tour-spillere som referansepunkt. Alle slag sammenlignes med
hva en Tour-proff ville gjort fra samme posisjon. For amatørgolfere produserer dette nesten
alltid negative SG-verdier i alle kategorier — noe som er korrekt som sammenlikning, men
kan skjule relative styrker og svakheter innad i eget spill.

Handicap-matchede baselines (tilgjengelig i Arccos, kommende i Shot Scope Phase 3)
bruker golferens eget handicap-nivå som referanse. En 15-handicapper sammenlignes mot
hva en gjennomsnittlig 15-handicapper ville gjort fra samme posisjon — slik at positive og
negative verdier faktisk betyr noe for spillerens utvikling.

Tre tilnærminger i praksis: 1. Bruk Tour-baseline, men sammenlign mellom kategorier
(hvilken kategori taper mest slag? Det er prioriteten) 2. Bruk scratch-baseline (Broadies
foretrukne tilnærming for coaching, uttrykt som «approach handicap», «putting handicap»,
osv.) 3. Bruk handicap-matchede baselines (Arccos, Shot Scope Phase 3 — sammenlign mot
spillere med tilsvarende ferdigheter)

6. Sentrale innsikter fra Broadies forskning

6.1 Langspillet dominerer (variansfordeling 72/17/11)

Broadies variansdekomponering av total SG på tvers av PGA Tour-golfere (2003–2010):

Korrelasjoner med total SG: Langspill 79%, kortspill 54%, putting 41% — per Broadies 2011-
paper.

| Spillkategori | Bidrag til total SG-varians |
| --- | --- |
| Langspill(>100 yards) | 72% |
| Putting | 17% |
| Kortspill(<100 yards, ikke putt) | 11% |

For app-implementering: Variansfordelingen 72/17/11 er det statistiske grunnlaget for å
prioritere forbedring av langspillet fremfor putting i coaching-algoritmer og personlige
prioriteringsanbefalinger.

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026
