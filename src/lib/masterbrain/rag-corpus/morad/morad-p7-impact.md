---
chunk_id: morad-003
tags: ["morad", "p7", "impact", "tek"]
topics: ["position", "elbow", "compression"]
relevance: agent-rag
word_count: 113
---

# P7.0 Impact

P7.0 er den viktigste diagnostiske posisjonen for APP-feil og face_to_path på TrackMan.

## Kanoniske metrikker
- **Hip rotation:** 45° OPEN mot target
- **Weight:** 80% venstre fot
- **Distance between elbows:** 8 tommer (narrowest)
- **Left elbow position:** #1 (adducted mot median line)
- **Forward press:** 20°
- **Wrist release:** via centrifugal force, ikke bevisst

## Sjekkpunkter
- Hender så lavt mot bakken som mulig
- Høyre kne 20° fleksjon
- Venstre hæl på bakken

## Kobling til feil
- `incorrect_elbow_position` — left_elbow_position ≠ 1
- `left_elbow_stall` — albu stoppet P5–P6
- `improper_weight_transfer` — weight venstre <70%

## TrackMan
Face_to_path >2° med god club_path → prioriter P7.0 elbow før path-drill.