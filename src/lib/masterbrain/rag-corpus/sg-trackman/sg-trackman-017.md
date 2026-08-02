---
chunk_id: sg-trackman-017
source: masterdokument-strokes-gained-trackman.md
source_section: "## spinnfrekvens. Det skiller seg fra statisk/stemplet loft fordi det tar hensyn til hvordan kølla"
tags: [amatør, club-data, lpga, pga-tour, trackman]
topics: [trackman-parametere]
lang: no
relevance: [CoachHQ, PlayerHQ, RAG, SgBaseline, TrackMan, forventetSg]
updated: 2026-06-14
---

faktisk leveres: golferens angrepsvinkel, skaftbøying, køllehodets frigjøring og impaktlokasjon endrer alle den effektive loften som presenteres for ballen.

Side 23 av 66

* * *

Relasjon til Attack Angle: For hvert grad angrepsvinkelen endres (opp eller ned), endres
dynamisk loft tilsvarende. Å slå opp (+attack angle) med driver øker dynamisk loft; å slå ned
reduserer det.

Nøkkelinsikt fra Trackman Master Christoph Bausek: «Dynamic Loft er den viktigste
faktoren for å lanse en ball i lufta. Det er en myte at 'å slå ned på ballen får ballen opp.' Følg
heller med på Dynamic Loft hvis du vil ha ballen opp.» (Trackman Dynamic Loft-blogg)

Tour-snitt:

| Tour | Driver Dynamic Loft | 6-jern Dynamic Loft |
| --- | --- | --- |
| PGA Tour | 12.8° | 20.2° |
| LPGA Tour | 15.5° | 23.6° |

Amatørsnitt (Driver):

| Handicap | Mannlig Dynamic Loft | Kvinnelig Dynamic Loft |
| --- | --- | --- |
| Scratch eller bedre | 13.0° | 14.8° |
| 5 HCP | 13.2° | 14.4° |
| 10 HCP | 14.1° | 15.0° |
| Gjennomsnitt(14.5) | 15.1° | - |
| Bogey | 14.3° | - |
| 15 HCP | - | 16.5° |

Trackman Optimizer-verdier: Driver (94 mph, 0° AoA) = 15.6°; 6-jern (80 mph) = 22.4°;
PW (72 mph) = 36.7°. (Trackman Dynamic Loft-blogg)

0^{\\circ};\\mathsf{A O A})=15.6^{\\circ}

9.7 Spin Loft (Spinnloft)

Definisjon: Vinkelen mellom retningen til køllehodets bevegelse og kølleflatens orientering
ved tidspunktet for maksimal kompresjon. Matematisk: Spin Loft = Dynamic Loft −
Attack Angle. (Trackman 40+ Parameters)

Enhet: grader (°)

Betydning: Spin Loft er sannsynligvis det viktigste enkle tallet for å forstå spinnfrekvensgenerering. Det er et 3D-konsept som fanger hvor mye kølleflaten «scooper» eller «skjærer
over» ballen relativt til køllas bevegelsesretning. Høyere Spin Loft betyr mer spinn.

Eksempel: Et jern med Dynamic Loft på 21° og Attack Angle på -5° produserer Spin Loft på
26°. Å endre angrepsvinkelen til 0° ville redusere Spin Loft til 21° og redusere spinn.

26^{\\circ}

Praktiske implikasjoner: - Driver-avstand: minimering av Spin Loft (lavere dynamic loft +
positiv angrepsvinkel) reduserer spinn for en mer gjennomtrengende flukt - Jern-kontroll: noe
Spin Loft er ønskelig for stoppekraft på greener - Wedge-spill: høy Spin Loft (bratt
angrepsvinkel + høy loft) skaper maksimalt bakspinn

(Trackman Tour Manager explains Spin Loft — YouTube)

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

# 9.8 Swing Plane (Svingplan)



## Definisjon: Den vertikale vinkelen mellom planet skapt av køllehodets geometriske senter-

bevegelse og horisonten. (Trackman 40+ Parameters) **Enhet: grader (°)** **Betydning: Beskriver helningen/branthet på den totale svingbuen. En mer oppreist sving** har en høyere vinkel; en flatere sving har en lavere vinkel. Tour-proffgolfere viser typisk 45– 55° svingplan-vinkler for mid-jern. **Merknad: Dette er en Trackman 4-eksklusiv parameter — ikke gitt av Trackman iO på** samme måte.

# 9.9 Swing Direction (Svingretning)



## Definisjon: Vinkelen mellom basen på planet skapt av køllehodets geometriske senter-

bevegelse og mål-linjen. (Trackman 40+ Parameters) **Enhet: grader (°)** **Betydning: Swing Direction beskriver om den totale sving er venstre-til-høyre (negativt)** eller høyre-til-venstre (positivt) relativt til mål-linjen. Det er beslektet men forskjellig fra Club Path, som måles nøyaktig ved impakt. En golfer kan ha en relativt nøytral Swing Direction men en ut-til-inn Club Path ved impakt på grunn av svingplan-endringer i impaktsonen.

# 9.10 Low Point (Laveste punkt)
