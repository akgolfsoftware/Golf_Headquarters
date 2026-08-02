---
chunk_id: sg-trackman-020
source: masterdokument-strokes-gained-trackman.md
source_section: "## Definisjon: Avstanden fra køllehodets geometriske senter til det laveste punktet på (del 3)"
tags: [club-data, trackman]
topics: [trackman-parametere]
lang: no
relevance: [CoachHQ, RAG, TrackMan]
updated: 2026-06-14
---

10.6 Spin Axis (Spinnakse)

Definisjon: Vinkelen relativt til horisonten for den imaginære linjen golfballen roterer rundt,
målt umiddelbart etter separasjon fra kølleflaten. En tiltet spinnakse forårsaker kurvatur.
(Trackman 40+ Parameters)

Enhet: grader (°)

Betydning: Spinnaksen er det som gjør at ballen kurver. En perfekt vertikal spinnakse (0°)
med rent bakspinn produserer et rett slag. Når spinnaksen tipper til høyre (positivt), dytter
Magnus-effekten ballen til høyre (fade/slice). Når den tipper til venstre (negativt), kurver
ballen til venstre (draw/hook).

Nøkkelrelasjon: En 5° Face-to-Path-forskjell produserer ca. 20° spinnaksetilting med en
driver — dette er 4:1-forholdet. En 20° tilting forårsaker svært betydelig kurvatur.

For hver 5° spinnaksetilting kurver ballen ca. 3.5 yards sideveis per 100 yards carry.
(Ball flight laws YouTube explainer)

10.7 Carry

Definisjon: Den rette linjeavstanden mellom der golfballen ble lansert fra og der den
krysser et punkt med samme høyde som der den ble lansert fra. (Trackman 40+ Parameters)

Betydning: Carry er det primære målet for luftavstand. Det skiller seg fra total avstand ved
å ekskludere rulling. For bane-management på faste fairways er det avgjørende å kjenne
carry vs. total for beslutninger om å rydde hindringer eller lande på skråninger.

Amatør Carry-avstand (Driver):

* * *

| Handicap | Mannlig carry | Kvinnelig carry |
| --- | --- | --- |
| Scratch eller bedre | 252 yards | 197 yards |
| 5 HCP | 223 yards | 178 yards |
| 10 HCP | 205 yards | 163 yards |
| Gjennomsnitt(14.5) | 195 yards | — |
| Bogey | 184 yards | — |
| 15 HCP | — | 149 yards |

(Hank Haney / Trackman-data)

10.8 Total Distance (Total avstand)

Definisjon: Den rette linjeavstanden mellom der golfballen ble lansert fra og dens
beregnede hvileposisjon (etter carry + rulling). (Trackman 40+ Parameters)

Enhet: yards eller meter

Total-avstand inkluderer carry + rulling beregnet fra landing-vinkel, hastighet ved landing, og
bakkeforhold (modellert). Det er total-avstand som er det vanligste målet i drivingavstandstatistikk.

10.9 Side / Side Total (Sideawaik / Total sideawaik)

• Side: Perpendikulær avstand mellom mål-linjen og der banen krysser et punkt med
samme høyde som lansering. Måler carry-avstandens laterale feil.

• Side Total: Perpendikulær avstand mellom mål-linjen og ballens beregnede
hvileposisjon. Total offline avstand.

Enhet: yards eller meter (positivt = til høyre for mål, negativt = til venstre for mål)

Praktisk bruk: Side-parameteren fra Trackman er det primære inndata til DECADE-systems
dispersjons-ellipseberegning. Et høyt Side-snitt indikerer bred dispersjon, som igjen betyr at
en spiller trenger en bredere korridor og bør sikte mer mot senter av greener.

10.10 Apex Height (Banetopp-høyde)

Definisjon: Maksimalhøyden eller toppen av banen, målt relativt til høyden der golfballen
ble lansert. (Trackman 40+ Parameters)

Typiske PGA Tour Apex-høyder: - Driver: 31–32 yards (ca. 93 fot) - 5-jern: 31 yards - PW:
29 yards

Enhet: yards eller meter

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026
