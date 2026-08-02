---
chunk_id: morad-002
tags: ["morad", "p4", "top", "backswing"]
topics: ["position", "angle", "lag"]
relevance: agent-rag
word_count: 116
---

# P4.0 Top of Backswing

P4.0 er der lag bygges og vinkel bevares. Tap her → casting og angle_loss i nedsving.

## Kanoniske metrikker
- **Shoulder rotation:** 90°
- **Hip rotation:** 45°
- **Right elbow flexion:** 90° (Position #1)
- **Left elbow:** 180° (rett)
- **Wrist radial deviation:** ~90% ved topp

## Sjekkpunkter
- Clubshaft parallell med incline plane
- Right arm vinkel ~90° mot skaft
- Ingen bevisst wrist release før P6

## Kobling til feil
- `angle_loss_backswing` — høyre arm åpner seg P2→P4
- `casting` — lag mistes tidlig etter P4
- `over_the_top` — kompensasjon når skuldre ikke fullfører rotasjon

## TrackMan-kobling
APP 200+ svakhet + lav smash → sjekk P3.5/P4.0 vinkelbevaring før face-justering.