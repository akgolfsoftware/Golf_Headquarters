---
chunk_id: sg-trackman-019
source: masterdokument-strokes-gained-trackman.md
source_section: "## Definisjon: Avstanden fra køllehodets geometriske senter til det laveste punktet på (del 2)"
tags: [club-data, kort-spill, trackman]
topics: [trackman-parametere]
lang: no
relevance: [CoachHQ, RAG, TrackMan]
updated: 2026-06-14
---

(Hank Haney / Trackman Combine-data)

USGA-forskningsmerknad: Rekreasjons-golfere (bred prøve) viser gjennomsnittlig driver
Smash Factor på 1.43, med 7-jern på 1.37 og pitching wedge på 1.21. (USGA 2023
Recreational Golfer Study)

10.3 Launch Angle (Startvinkel — vertikal)

Definisjon: Den vertikale vinkelen golfballen letter med relativt til horisonten, målt
umiddelbart etter separasjon fra kølleflaten. (Trackman 40+ Parameters)

Enhet: grader (°)

Betydning: Startvinkel er en primær komponent for banehøyde og carry-avstand. Den
korrelerer sterkt med dynamisk loft (startvinkel er typisk 60–70% av dynamisk loft). For lav
startvinkel produserer en kulebane-bane som faller kort; for høy skaper ballonerende slag
med overskuddsspinn. Optimal startvinkel øker etter hvert som køllehastigheten avtar.

Tour-snitt (oppdatert 2024): - PGA Tour Driver: 10.4° \| 6-jern: 14.0° \| PW: 24.2° - LPGA
Tour Driver: 12.6° \| 6-jern: 16.7° \| PW: 25.7°

| Handicap | Mannlig startvinkel | Kvinnelig startvinkel |
| --- | --- | --- |
| Scratch eller bedre | 11.2° | 12.7° |
| 5 HCP | 11.2° | 12.0° |
| 10 HCP | 11.9° | 12.4° |
| Gjennomsnitt(14.5) | 12.6° | - |
| Bogey | 12.1° | - |
| 15 HCP | - | 13.6° |

Trackman Optimizer Standard-verdier: - Driver (94 mph, 0° AoA): 13.6° optimal
startvinkel - 6-jern (80 mph): 16.9° - PW (72 mph): 26.7°

* * *

10.4 Launch Direction (Startretning — horisontal)

Definisjon: Den horisontale vinkelen golfballen letter med relativt til mål-linjen, målt
umiddelbart etter separasjon fra kølleflaten. Positivt = til høyre for mål; negativt = til venstre
for mål. (Trackman 40+ Parameters)

Enhet: grader (°)

Betydning: Under de nye ballfluktlovene bestemmes startretningen ca. 80–85% av Face
Angle (med en driver) og ca. 15–20% av Club Path. Sporing av startretning bekrefter om
ballen starter på den tiltenkte linjen. Dette er det empiriske beviset på Face Angles
dominante rolle.

10.5 Spin Rate (Spinnfrekvens — bakspinn + sidespinn)

Definisjon: Rotasjonshastigheten til golfballen rundt sin rotasjonsakse, målt umiddelbart
etter separasjon fra kølleflaten. Dette er total spinn — kombinasjonen av bakspinn og
sidespinn-komponenter. (Trackman 40+ Parameters)

Enhet: rpm (omdreininger per minutt)

Betydning: Spinnfrekvens påvirker carry-avstand, banehøyde, stoppekraft og kurvatur
profundly. For mye spinn (ballonerende driver) koster avstand; for lite (knakeball) ofrer
kontroll. Spinnfrekvens er primært en funksjon av Spin Loft, køllehastighet, friksjon ved
impakt og kontaktkvalitet.

Nøkkelrelasjoner: - Mer loft → mer spinnfrekvens - Høyere køllehastighet → mer
spinnfrekvens (alt annet likt) - Høyere Spin Loft → mer spinnfrekvens - Vertikal gear effect →
påvirker driver-spinn dramatisk (tåe høy = mindre spinn; tåe lav = mer spinn) - Slag utenfor
sentrum → øker eller reduserer spinn uforutsigbart

(Trackman PGA Tour Averages PDF)

| Kølle | PGA Tour Spin Rate |
| --- | --- |
| Driver | 2,545 rpm |
| 3-wood | 3,655 rpm |
| 5-wood | 4,350 rpm |
| Hybrid | 4,437 rpm |
| 3-jern | 4,630 rpm |
| 4-jern | 4,836 rpm |
| 5-jern | 5,361 rpm |
| 6-jern | 6,231 rpm |
| 7-jern | 7,097 rpm |
| 8-jern | 7,998 rpm |
| 9-jern | 8,647 rpm |
| PW | 9,304 rpm |

* * *

Amatør Spin Rate (Driver):

| Handicap | Mannlig spinnfrekvens | Kvinnelig spinnfrekvens |
| --- | --- | --- |
| Scratch eller bedre | 2,896 rpm | 2,831 rpm |
| 5 HCP | 2,987 rpm | 3,027 rpm |
| 10 HCP | 3,192 rpm | 3,207 rpm |
| Gjennomsnitt(14.5) | 3,275 rpm | - |
| Bogey | 3,127 rpm | - |
| 15 HCP | - | 3,287 rpm |

(Trackman Spin Rate-blogg)
