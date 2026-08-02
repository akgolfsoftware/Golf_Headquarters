---
chunk_id: sg-trackman-023
source: masterdokument-strokes-gained-trackman.md
source_section: "### Nøkkelputte-innsikter fra Trackman-forskning: - Face Angle ved impakt er den mest (del 2)"
tags: [club-data, lpga, optimizer, pga-tour, putt, trackman]
topics: [lpga-snitt, optimizer, pga-snitt, putting, trackman-parametere]
lang: no
relevance: [CoachHQ, RAG, SgBaseline, TrackMan, forventetSg]
updated: 2026-06-14
---

12.4 Attack Angle og optimal launch for drivere

Trackman Optimizer demonstrerer overbevisende at angrepsvinkel er en kritisk
optimaliseringsvariabel for driver-avstand:

• Å slå oppover på driver (positiv angrepsvinkel) gjør det mulig å oppnå høyere dynamisk
loft med samme Spin Loft, noe som reduserer spinn mens startvinkel opprettholdes

• For en gitt driverloft-innstilling gir økning av angrepsvinkel fra -5° til 0° til +5° 10–25
yards mer carry avhengig av køllehastigheten

Nøkkelinsikt: LPGA Tour snitter en +2.8° angrepsvinkel med driver mot PGA Tours -0.9°.
Det betyr at kvinnelige Tour-proffgolfere slår opp på driver betydelig mer enn mannlige Tourproffgolfere, oppnår høyere startvinkler og drar nytte av bedre avstandsoptimalisering
relativt til kjølehastighetene.

s\|\\mathring{a}r+5^{\\circ}

+2.8^{\\circ}

0^{\\circ}\\operatorname t i i\|+5^{\\circ}

r-5^{\\circ}

* * *

12.5 Spin Loft og spinn-generering

Spinnfrekvens er primært en funksjon av Spin Loft og køllehastighet:

Spin Rate ≈ f(Spin Loft × Club Speed × Friksjonskoeffisient)

Spesifikt: - Dobling av Spin Loft gir omtrent dobbelt spinnfrekvens (ved samme
køllehastighet) - Høyere køllehastighet øker spinnfrekvensen for samme Spin Loft - Våte eller
myke grep reduserer friksjon → mindre spinn - Høye flatslag på driver reduserer spinn
gjennom negativ gear effect

En spiller kan redusere driver-spinn ved å: 1. Øke angrepsvinkelen (positivt → reduserer
Spin Loft) 2. Redusere dynamisk loft (sterkere driverloft, eller mindre håndleddsflukt) 3. Treffe
høyere på driverflaten (gear effect)

Og kan øke jern-spinn ved å: 1. Brattere angrepsvinkel (mer negativ) 2. Slå ballen rent
(maksimering av friksjon) 3. Bruke mykt-belagte premium golf-baller

(Trackman Spin Loft YouTube)

12.6 Smash Factor-grenser per kølle

Den lovlige COR (Coefficient of Restitution) grensen for drivere under USGA/R&A-regler er
0.830. Dette begrenser den maksimale teoretiske Smash Factor for en driver til ca. 1.50. I
praksis snitter PGA Tour-proffene 1.48–1.49.

For jern og wedges avtar Smash Factor med loft fordi mer av køllas energi går inn i spinn
snarere enn ball-hastighet. Maksimale Smash Factors:

| Kølle | Maks. Smash Factor |
| --- | --- |
| Driver | ~1.50 |
| 3-jern | ~1.46 |
| 5-jern | ~1.41 |
| 7-jern | ~1.33 |
| 9-jern | ~1.28 |
| PW | ~1.23 |

(SGGT — Trackman Numbers Explained)

13. Trackman Optimizer

Trackman Optimizer er en funksjon som sammenligner faktiske slagdata med teoretisk
optimale parametere for maksimal carry eller total avstand. Det er i praksis en interaktiv
kalkulasjon som svarer på: «Gitt din nåværende køllehastighet og angrepsvinkel — hva er de
optimale verdiene for dynamisk loft, startvinkel og spinnfrekvens for å maksimere avstand?»

* * *

Optimizeren er kalibrert basert på aerodynamiske ballfluktsmodeller og empiriske Trackmandata og er et uvurderlig verktøy for fitting og teknisk forbedring.

13.2 Optimal launch + spin per køllehastighet

Generelle trender fra Optimizer: 1. Høyere kjølehastigheiter krever lavere optimal
spinnfrekvens og lavere startvinkler. En 120 mph svinger optimaliserer med ~9.3°
startvinkel og ~2,890 rpm spinn; en 75 mph svinger trenger ~16–19° startvinkel og ~2,700–
3,100 rpm 2. En +5° angrepsvinkel legger til 8–15 yards carry ved hver køllehastighet
sammenlignet med 0° 3. Å slå ned (-5°) er det dårligste utfallet — det krever høyere
dynamisk loft for å oppnå akseptabel startvinkel, noe som driver spinnfrekvensen dramatisk
opp uten å gjenopprette carry-avstand

13.3 Full Optimizer-tabell (75–120 mph × −5°/0°/+5° AoA)

Kilde: Trackman Driver Optimization PDF via Wishon Golf

Driver Carry Optimizer — Lavere kjølehastigheiter (75–95 mph)
