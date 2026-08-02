---
chunk_id: sg-trackman-021a
source: masterdokument-strokes-gained-trackman.md
source_section: "10.8–10.10 Balldata: Total avstand, Side og Apex Height"
tags: ["ball-data", "pga-tour", "trackman"]
topics: ["trackman-parametere"]
lang: no
relevance: ["CoachHQ", "RAG", "TrackMan"]
updated: 2026-06-14
---

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

## 10.11 Landing Angle (Landingsvinkel)

### Definisjon: Vinkelen golfballen lander med relativt til horisonten ved et punkt med samme

høyde som der den ble lansert. (Trackman 40+ Parameters) **Enhet: grader (°)** **Betydning: Landingsvinkelen bestemmer hvor mye ballen sjekker (stopper) vs. ruller ved** landing. Brattere landingsvinkler (kortere jern, høyere baner) produserer mer sjekk og mindre rulling. Flate landingsvinkler (driver, lange jern) produserer mer utrulle. **PGA Tour Landingsvinkler: - Driver: 38° \| 5-jern: 49° \| 7-jern: 50° \| 9-jern: 51° \| PW: 52°**

## 10.12 Hang Time (Flytid)

**Definisjon: Total tid golfballen er i luften fra lansering til landing.** **Enhet: sekunder** **Betydning: Flytid gjenspeiler kombinasjonen av ball-hastighet, startvinkel og spinnfrekvens.**

Høyere ball-hastigheter og optimale startvinkler produserer lengre flytider. Måles direkte av Trackmans radar-ballbane-sporing. **Typiske verdier: - Driver (PGA Tour): ca. 6–7 sekunder-PW (PGA Tour): ca. 4–5 sekunder**

## 10.13 Curve (Kurve)

### Definisjon: Den horisontale sidevegsbevegelsen perpendikulært fra startretningen til carry-

siden. Dette er ren bøyning/kurvatur av ballflukten, isolert fra startretningen. (Trackman 40+ Parameters) **Enhet: yards (positivt = kurver til høyre, negativt = kurver til venstre)** **Betydning: Å skille startretning fra kurvatur er avgjørende for å forstå ballflukt. En ball kan** starte til høyre (åpen flate) og kurve ytterligere til høyre (åpen flate til bane) for en stor push-slice, eller starte til høyre men kurve tilbake til venstre (flate til bane negativ) for en push-draw. Et rett slag har null kurvatur.

# 11\. Trackman: Kortspill- og putteparametere

## 11.1 Chip- og pitchspesifikke parametere

Trackman 4 sporer det komplette settet med kølle og ball-parametere for kortspillslag. Trackman-basert forskning på chip- og pitchslag bruker:

Side 31 av 66

* * *

| Parameter | Enhet | Typisk verdi/rekkevidde | Praktisk betydning |
| --- | --- | --- | --- |
| Club Speed | mph | 10-40 mph for chips/pitches | Avstandskalibrering |
| Ball Speed | mph | Proporsjonal med club speed | Rulleavstand-prediksjon |
| Smash Factor | dimensjonsløst | Lavere enn full sving | Kontaktkvalitet |
| Dynamic Loft | ° | Varierer enormt med teknikk | Banekontroll |
| Attack Angle | ° | Grunt foretrukket for chips | Reduserer fett-kontakt |
| Spin Loft | ° | DL-AoA | Spinnkontroll |
| Launch Angle | ° | <30° for lav løper; høyere for stopper | Lande/rulle-ratio |
| Apex Height | yards/m | Lav for chips, høyere for pitches | Avstandskontroll |
| Landing Angle | ° | Mål:≤37° for lav chip | Rullekontroll |
| Spin Rate | rpm | Mål:<3,750 rpm for chips | Konsistens |
| Carry | yards | Avhengig av club speed | Avstandskalibrering |
