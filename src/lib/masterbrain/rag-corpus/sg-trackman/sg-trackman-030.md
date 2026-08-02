---
chunk_id: sg-trackman-030
source: masterdokument-strokes-gained-trackman.md
source_section: "## 17.1 Hvordan range-data oversettes til scoring (del 1)"
tags: [baseline, broadie, club-data, formule, sg, trackman]
topics: [broadie, trackman-parametere]
lang: no
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, TrackMan, beregnSg, forventetSg]
updated: 2026-06-14
---

Trackman og SG er designet for ulike formål: Trackman for å måle impaktparametere, SG for å måle scoringsbidrag. Broen mellom dem er Broadies expected-strokes-tabeller: gitt carry- avstand og lie-type etter et slag, kan forventet antall slag for å hole ut beregnes, og dermed SG.

### Den konseptuelle broen: - Trackman måler: kjørehastigheten, angrepsvinkel, Face Angle,

Club Path, spinnfrekvens, carry, side-Disse parameterene bestemmer: ballposisjon etter slaget (avstand til hull + lie) - Ballposisjon + expected-strokes-tabell → baseline(slutt) - SG- formelen: baseline(start) − baseline(slutt) − 1 = SG for det slaget

## 17.2 Carry × dispersion → SG: OTT (Stagner: +10 yards ≈ 1 slag)

### Den direkte carry-til-SG-linken:

Fra Lou Stagner Newsletter #10: å vinne 10 yards drivingavstand tilsvarer ca. 1 slag lavere **snittscore for amatørgolfere. Dette er den robuste empiriske observasjonen fra Arccos-** databasen.

Fra Trackmans perspektiv: en økning på 10 yards carry (fra 220 til 230 yards) reduserer det gjenværende hullavstanden tilsvarende. Den lavere baseline fra den kortere innspillavstanden oversettes direkte til positiv SG:OTT.

### Dispersjonens rolle: Trackmans Side-parameter måler offline-avstand (sidespavet). Et

slagmønster med høy gjennomsnittlig Side-verdi øker sannsynligheten for rough, vann, OB og penalty-situasjoner — som alle koster 1.5–2.0 SG øyeblikkelig.

Nøkkelinsikt fra Lou Stagner: «Amatører som treffer mer enn 5% av slag i OB/penalty- situasjoner, er ikke optimale.» Penalty-slag er den primære SG-dreper for høyere handicappere, ikke fairway-presisjon per se.

### Fairway vs. rough-strategi: Scott Fawcett plasserer terskelen for avstandsforbedring enda

høyere: 20 yards er «minst to slag», og praktisk talt enhver golfer som ikke spesifikt har trent for fart har 20 yards tilgjengelig.

## 17.3 Dispersjonsmønster og shot zones (Fawcett)

DECADE-systemets dispersion-ellipse-modell bruker Trackman-data til å beregne det optimale sikte-punktet:

«Et slagmønster er bare: hvis du slår 100 baller på en driving range, ville du ha et fotavtrykk som ligner mer på et haglgeværskudd enn en snipper-rifle som skyter nedover midten. Det riktige kurs-managementet må ta hensyn til... Jeg bruker ca. 85 eller 90%. Vi diskonterer de største outlierene.» — Scott Fawcett, via Elm Wealth

### Trackman-til-DECADE-arbeidsflyt: 1. Trackman-sesjonen gir carry-avstand og Side-snitt

for hvert kjølle 2. Disse definerer en slagmønster-ellipse (dispersjons-ellipse) 3. DECADE bruker ellipsen til å beregne forventet antall slag for hvert mulig mål 4. Optimalt mål = det sikte-punktet som minimerer forventede slag for å hole ut (ikke alltid flagget)

Side 45 av 66

* * *

En typisk 10–12-handicapper trenger 75–90 yards korridor for 95% slag-inneslutning fra
150 yards. En PGA Tour-spiller trenger ca. 30–40 yards.

17.4 Proximity → SG: APP (full PGA Tour-tabell)

PGA Tour proximity-benchmarks etter avstand:

Kilde: mikebury.com analyse av PGA Tour ShotLink-data (2022-2023 sesong)

| Avstandsband | PGA Tour Avg Proximity |
| --- | --- |
| 50-75 yards | 16' 6" |
| 75-100 yards | 17' 10" |
| 100-125 yards | 20' 4" |
| 125-150 yards | 23' 8" |
| 150-175 yards | 28' 9" |
| 175-200 yards | 35' 9" |

GIR% per avstandsbånd (PGA Tour): - 100–125 yards: 75.4% GIR, ~20 fot proximity -
125–150 yards: 69.3% GIR, ~23 fot proximity - 150–175 yards: 64% GIR, ~28 fot proximity -
175–200 yards: ~57% GIR, ~36 fot proximity - 200–225 yards: ~50% GIR, ~43 fot proximity

Oversettelse til SG:APP: Enhver foot med proximity-forbedring ved 150 yards sparer ca.
0.03–0.05 SG:APP per slag (basert på Broadies tabeller). Å kutte proximity fra 60 fot til 40
fot ved 150 yards sparer ~0.4–0.6 slag per GIR-forsøk.

17.5 Kortspill → SG: ARG

Proximity-data: Shot Scope etter lie-type (60–100 yards):

Kilde: Shot Scope approach proximity research
