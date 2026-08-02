---
chunk_id: morad-013
tags: ["sg", "morad", "mapping"]
topics: ["sg", "fault", "diagnose"]
relevance: agent-rag
word_count: 155
---

# SG → MORAD fault mapping

**Dette er hypoteser, ikke diagnoser.** Et SG-tall alene identifiserer ikke en
svingfeil. Før noen anbefaling gis må hypotesen bekreftes med:

- videoanalyse av svingen
- kontroll av hvor spilleren faktisk sikter
- gjennomgang av taktiske køllevalg

Rekkefølgen under er ikke en rangering. Kandidatene i et område er likestilte
inntil bekreftelse foreligger. Beslutning: Anders Kristiansen, 31. juli 2026.

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
Ingen MORAD-mapping. MORAD er et posisjonssystem for fullsving og dekker ikke
putting. Tom liste er derfor korrekt, ikke en mangel — men putting mangler
fortsatt sin egen kunnskapskilde. Se `MANIFEST.md` → Kjente hull.

## Algoritme
1. Finn verste SG-bånd
2. Bekreft med TrackMan (face_to_path, club_path, smash)
3. Bekreft med video, sikte og køllevalg — uten dette er funnet et retningssignal
4. Map til kandidat-fault + P-posisjon, formulert som hypotese
5. Drill-banken er tom — beskriv hva som bør trenes, ikke hvilken drill
