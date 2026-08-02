---
chunk_id: sg-trackman-039
source: masterdokument-strokes-gained-trackman.md
source_section: "## 20.1 Lie-forenkling"
tags: [baseline, kategori, kort-spill, sg, trackman]
topics: [sg-baseline, sg-kategorier]
lang: no
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, TrackMan, beregnSg, forventetSg]
updated: 2026-06-14
---

SG-baseline-systemet har bare fire lie-kategorier for slag utenfor green: tee, fairway, rough, sand og recovery. Men «rough» rommer enorm variasjon i virkeligheten: - Tykk US Open- rough vs. tynn fairwayadjasent rough-Bermuda-rough vs. ryegrass-rough (svært ulik tekstur) - Hard-pakket ligge vs. luftig ligge-Oppoverbakke vs. nedoverbakke

Fra Golfshots misforståelses-artikkel: «Et 15-yards pitcheslag fra rough kan være et ganske rett frem oppoverbakke-slag med et luftig ligge, mot et annet 15-yards pitcheslag fra rough som er sunket ned, krever en carry over bunker til en green som løper vekk fra spilleren.» Begge vises med samme SG-baseline, men har svært ulik vanskelighetsgrad. Baselines tildeler dem identisk forventet vanskelighetsgrad.

Side 58 av 66

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

Tilsvarende varierer bunkerkvaliteten enormt — en Tour-preparert bunker med konsistent sand er svært annerledes enn en kommunal bunker med hard undergrunn.

# 20.2 Banen og forholdene (greenfart, helning, vær)



## SG: Putting-baselines bruker bare avstand til hullet for å sette forventninger. De tar ikke

hensyn til: - Greenfart (Stimpmeter-lesning) — et 10-fots oppoverbakke-putt på Stimp-8- green er langt enklere enn det samme puttet på Stimp-14 - Helning — et 20-fots oppoverbakke-putt og et 20-fots nedoverbakke-putt har samme SG-baseline, men svært ulike hold-inn-rater-Green-fasthet og retningsbounce

Dette betyr at SG:Putting overkrediterer spillere på raske, heldte greener (der to-putting genuint er vanskelig) og underkrediterer på sakte, flate greener. Feltkorreksjonene kompenserer delvis for dette — hvis hele feltet sliter på vanskelige greener, justeres alles SG:Putting opp — men individuell helning og fartsvariasjon innen en runde fanges ikke opp.

Fra Golfshot: «Å spille under dårlige værsett eller en spesielt vanskelig bane kan ha negativ effekt på Strokes Gained-data, mens å spille på høyde kan gjøre dine utslagssslag mye bedre enn de faktisk er.»

# 20.3 Utvalgsstørrelse for amatører

Tour-spillere treffer tusenvis av sporede slag per år og genererer statistisk stabile SG-verdier. For amatører: - En typisk amatørrunde inkluderer bare 14 driver, ~12 innspillsslag, ~5–6 **kortspillslag og ~32 putter-Et enkelt katastrofalt slag (OB, chunket wedge, tre-putt) kan** skjevstille en kategories SG dramatisk for hele runden-Fra en YouTube-analyse: «Tour- spillere treffer tusenvis av slag per år med ekstremt lav varians, men amatører — du treffer kanskje én 300-yards driver rett ned midten og den neste i Mrs. Havocs svømmebasseng, og statistikken din måler ikke ferdigheten din. Den måler kaos.» - Broadie selv erkjenner at SG er mest handlingsbar over mange runder (minimum 5–10 anbefalt av Arccos), ikke enkeltsesonger

Dette er spesielt problematisk for ARG-kategorien, der en amatør kanskje bare treffer 4–6 slag rundt greenen per runde — langt for lite for statistisk stabilitet.

# 20.4 SG vs. Field vs. SG vs. Baseline — To forskjellige ting

Et subtilt men viktig skille eksisterer mellom to typer SG-rapportering:

## SG vs. Baseline (slag-nivå): Sammenligner hvert slag med historiske forventede slag fra

den posisjonen. Summer til spillerens totale fordel/ulempe relativt til den universelle Tour- baselines. Dette er hva Broadies underliggende modell beregner.

## SG vs. Field (runde-nivå): Sammenligner en spillers totalscore med gjennomsnittlig

feltresultat for den spesifikke runden på den spesifikke banen. Enklere og krever ikke slag- nivå-data. Hvis en spiller skyter 69 på en dag feltet gjennomsnittet er 71.4, er de +2.4 SG vs. feltet.

Fra Data Golf: «Justert eller 'ekte' strokes-gained er lik en spillers strokes-gained over feltet pluss hvor mange slag bedre (eller verre) det feltet er enn en referansebenchmark.» Denne «ekte SG» justerer for feltets styrke — 2.0 SG vs. et svakt felt er ikke det samme som 2.0 SG vs. et Tour Championship-felt.

Side 59 av 66

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

## 20.5 Tolkningsfeller
