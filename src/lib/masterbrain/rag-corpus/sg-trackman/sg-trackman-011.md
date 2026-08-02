---
chunk_id: sg-trackman-011
source: masterdokument-strokes-gained-trackman.md
source_section: "## Korrelasjons-curiosum: Korrelasjonen mellom puttings SG og langspillets SG på tvers av (del 1)"
tags: [amatør, broadie, kort-spill, putt, sg]
topics: [amator-data, broadie, putting]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

Tour-golfere er −14% — svakt negativ. Det betyr at de beste ballslagerne tenderer mot å være litt under gjennomsnitt på puting, og vice versa, per Broadies paper.

Side 14 av 66

* * *

For amatørgolfere: Putting utgjør relativt sett mer (ca. 25–35% av scoringsforskjellen) fordi
amatørers tre-puttfrekvens er dramatisk høyere enn proffenes. En 90-golfer tre-putter ca. 2.3
ganger per runde mot en Tour-proffs 0.55 ganger.

6.5 Konkrete tall fra Broadies analyser

Tiger Woods 2003–2010: - Snittet 3.20 slag bedre per runde enn gjennomsnittlig
turnerings felt - Langspill: +2.08 slag/runde (65% av total fordel) - Kortspill: +0.42 slag/
runde (13%) - Putting: +0.70 slag/runde (22%)

Hans puttinggevinst (+0.70) var lavere enn gevinsten hans fra slag mellom 150–250 yards
alene (+1.01), noe som illustrerer at hans dominerende langspillferdighet overskygget til og
med hans sterke putting.

I sitt toppår (2008) vant Tiger 4.14 slag/runde totalt, inkludert 2.56 fra langspillet, per
Broadies paper.

Slugerfordeling PGA Tour-slag per runde:

| Kategori | Gj.sn. slag/runde | % av total |
| --- | --- | --- |
| Langspill(tee+innspill>100 yards) | 32.2 | 45% |
| Kortspill(<100 yards, utenfor green) | 9.8 | 14% |
| Putting | 29.1 | 41% |
| Total | 71.1 | 100% |

To-tredjedels-regelen (Broadie): Fra CPG Golf-intervjuet med Broadie: «Omtrent to
tredjedeler av en 10-slags-forskjell kommer fra slag utenfor 100 yards og omtrent en
tredjedel fra slag innen 100 yards — og det er ganske konsekvent på tvers av disse enormt
ulike ferdighetsnivåene.»

7. Strokes Gained for amatører

7.1 Arccos (600M+ slag, target-handicap baselines)

Arccos bruker småsensorer festet til grepsendene og en smarttelefonapp til automatisk å
spore hvert slag via GPS. Selskapet ble grunnlagt i 2012, og per 2021 hadde medlemmene
registrert over 8 millioner runder, med databasen vokst til over 600 millioner slag fra 13
millioner runder i 162 land, per Golf Expectations.

Arccos-databasen med 300+ millioner slag muliggjør modeller for hvordan enhver handicapgolfer ville slå hvert slag med hver klubbe, noe som effektivt skaper baselines for 5-
handicap, 10-handicap, 15-handicap osv.

* * *

Lou Stagner — en fremtredende golfdataanalytiker — tiltrådte Arccos som sjef for
datavitenskapsteamet i oktober 2021, per Arccos-pressemeldingen. Hans
nøkkelpublikasjoner inkluderer:

• I runder sortert etter Strokes Gained er den gjennomsnittlige forskjellen i fairways truffet
mellom en spillers beste og dårligste runder kun ~0.75 fairways — under 1 slag — noe
som antyder at fairways-truffet er en svak prediktor for rundekvalitet

• 75% av spillerne har en fairways-truffet-forskjell på 1.25 eller færre mellom beste og
dårligste runder

• Den virkelige differensiatoren i dårlige runder er straffeslag og recovery-slag: scratchspillere snitter 0.72 mer straffeslag i dårligste runder, 15-HCP-spillere snitter 1.22 mer

• GIR er den ene tradisjonelle statistikken med sterk verdi: det er en «svært sterk relasjon
mellom handicap og GIR%»

• Kilde: Lou Stagner Golf Newsletter #2

Avstandsfunnet (Stagner): I Arccos-data for spillere som vant eller tapte ≥10 yards med
driver mellom konsekutive sesonger (minimum 25 runder per sesong), per Newsletter #10:

| Gruppe | % som forbedret scoring | Gj.sn. scoringsendring |
| --- | --- | --- |
| Vant ≥10 yards | 81% forbedret | -1.8 slag/runde |
| Tapte ≥10 yards | 65% ble dårligere | +0.79 slag/runde |

Tommelfingerregel fra Stagners data: Å vinne 10 yards drivingavstand tilsvarer ca. 1
slag lavere snittscore.

7.2 Shot Scope (80M+ slag, Phase 3 baselines)

Shot Scope er et GPS-ur + klubbmerke-system som sporer slag automatisk. Per tidlig 2025
har Shot Scope over 80 millioner slag i sin database, per deres SG-metodologiartikkel.
