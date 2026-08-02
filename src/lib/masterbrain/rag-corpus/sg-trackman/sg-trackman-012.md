---
chunk_id: sg-trackman-012
source: masterdokument-strokes-gained-trackman.md
source_section: "## Korrelasjons-curiosum: Korrelasjonen mellom puttings SG og langspillets SG på tvers av (del 2)"
tags: [amatør, baseline, broadie, handicap, ott, pga-tour, putt, sg]
topics: [amator-data, broadie, implementasjon, pga-snitt, putting, sg-baseline]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

Deres SG-implementering: - Phase 1 (nåværende): Bruker PGA Tour-spillere som referanse
— de samme baselines Broadie utviklet - Phase 3 (kommende): Handicap-baserte
referanser — baselines trekkes fra 80+ millioner amatørslag i databasen, som gir forventede
slag for hvert handicap-nivå, ved hvert avstand og lie-type. Dette muliggjør SGsammenligninger mot en 10-HCP eller 20-HCP-baseline i stedet for Tour-spillere

7.3 Lou Stagner og offentlige datasett

• Fra 300-yards hull: En scratch-golfer trenger et 205-yards fairwayutslag for å oppnå
0.00 SG:OTT — alt over gir positive slag

• For 10-HCP på et 325-yards hull: Fairway krever 174 yards for å bryte jevnt, rough
krever 196 yards — en 22-yards straff for å bomme fairway

* * *

• På et 500-yards hull for den samme 10-HCP: breakeven-avstandene for fairway/rough
er nesten identiske (210 vs. 211 yards) — fairwaypresisjon spiller knapt noen rolle
på lange par-5-er

Denne praktiske innsikten er direkte relevant for kurs-management-algoritmer i en golfapp:
på korte og mellomstore hull er sidedispersion (Side-parameter fra Trackman) langt mer
kostbar enn på lange hull.

Kilde: Lou Stagner Newsletter #30

7.4 DECADE Golf (Scott Fawcett)

DECADE Golf er et kurs-management og strategi-system — ikke en post-runde
analysapp — utviklet av Scott Fawcett og bygget direkte på Broadies SG-rammeverk.
Forkortelsen står for Distance, Expectation, Correct Target, Analyze, Discipline, Execute.

Fawcett oppdaget SG da PGA Tour ga ut den fulle SG-katalogen i 2013, og kombinerte den
med slagdispersjondata fra Trackman/launch monitors: «Jeg kjente størrelsen på slagmønstre
fra TrackMan, Quad, uansett launch monitor du vil bruke. Og hvis jeg vet hvor store
slagmønstre er, og jeg vet hvor mange slag det tar å hole ut fra hvor som helst — er strategi
da et løsbart problem.» Per Scott Fawcett på podcast.

DECADEs kjerneinsikt: Fordi golfere har forutsigbare slagdispersjonsmønstre, er det
matematisk optimale målet nesten alltid midten av greenen (eller litt mot fet side, bort fra
hindringer) snarere enn flagget. Systemet beregner forventede slag for hvert mulig mål, og
velger det som minimerer forventede slag for å hole out — under hensyntagen til dispersjon,
ikke bare «best-case»-slaget.

Kobling til Trackman: Trackmans Side-mål og carry-standardavvik definerer slagmønsterellipsen. DECADE bruker disse til å: 1. Bestemme dispersjonsbredden (hvor bred korridor
du trenger for 85–90% av slag) 2. Beregne det optimale sikte-punktet — ikke alltid midten
av fairway, og noen ganger rett mot flagget for innspill 3. Tildele en forventet slagverdi til
hver mulig utfallssone

En typisk mannlig amatør (14–15 HCP) trenger 75–90 yards korridor for 95% slaginneslutning. En PGA Tour-spiller trenger ca. 30–40 yards, bekreftet av Lou Stagner.

DECODE/DECADE gir spillere: et kortfattet optimalt mål (innen ~1–2 yards fra matematisk
perfekt), én slagform å øve på, og en mental prosess for å forhindre impulsive «heltemot»-
beslutninger.

Golfshot bruker SG som kjerne i sin analysefunksjon, beregnet med standardformelen mot
Tour-avledede baselines. Implementeringen dekker alle fire kategorier (fra tee, innspill, rundt
greenen, putting) og tar hensyn til avstand og lie-type. Per Golfshot.

7.5 Andre verktøy (Golfshot, TheGrint)

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026
