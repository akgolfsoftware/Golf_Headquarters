---
chunk_id: morad-013
tags: ["sg", "morad", "mapping"]
topics: ["sg", "fault", "diagnose"]
relevance: agent-rag
word_count: 89
---

# SG → MORAD fault mapping

## OTT
over_the_top, casting, insufficient_shoulder_turn, flat_shoulder_plane, early_extension

## APP (per bånd)
| Bånd | Typiske faults |
|------|----------------|
| 200+ | angle_loss_backswing |
| 150-200 | improper_weight_transfer |
| 100-150 | incorrect_elbow_position |
| 50-100 | left_elbow_stall |
| <50 | left_elbow_stall, casting |

## ARG
poor_spine_alignment, casting (chip/pitch)

## PUTT
Ingen MORAD-mapping — bruk putting-drills (gate, distance, aimpoint)

## Algoritme
1. Finn verste SG-bånd
2. Bekreft med TrackMan (face_to_path, club_path, smash)
3. Map til fault + P-posisjon
4. Velg drill fra fault-drill-mapping