# TrackMan, dispersion og teststatistikk — domenereferanse

Destillert fra AK Golf HQ sin statistikk-kjerne og AK-metodikken (CANON). Dette er fasiten for enheter, retning og visualiseringsmønstre. Avvik herfra er designfeil.

## 1. TrackMan-parametersettet plattformen bruker

| Parameter | Enhet | Kommentar |
|---|---|---|
| Club Speed | km/t (mph sekundært) | |
| Ball Speed | km/t | |
| Smash Factor | ratio | Ball/Club speed, mål ~1.48–1.50 driver |
| Launch Angle | grader | |
| Launch Direction | grader, V/H | Negativ = venstre |
| Spin Rate | rpm | |
| Spin Axis | grader, V/H | Driver kurvatur |
| Attack Angle | grader | |
| Club Path | grader, V/H | |
| Face Angle | grader, V/H | |
| Face to Path | grader | D-plane-kjernen |
| Dynamic Loft | grader | |
| Carry | meter | Primær lengdemåling |
| Total | meter | |
| **Side / Side Total** | **meter, V/H** | **Lateral avvik fra mållinje — dispersion-grunnlaget** |
| Apex / Height | meter | |
| Landing Angle | grader | |
| Strike pattern | toe–heel / low–high | Treffpunkt på blad |

**Ufravikelig UI-regel:** alle laterale verdier vises med meter OG retning: "8 m V" / "12 m H". Fortegn alene (-8/+12) er ikke nok i visning — retningsbokstav eller pil kreves. Norsk konvensjon: V = venstre, H = høyre.

## 2. Dispersion-matematikk for visning

En slaggruppe (test, økt, kølle) beskrives av to uavhengige akser:

- **Bias** (systematisk feil): gjennomsnittlig Side. "Snitt: 4 m V" = spilleren treffer systematisk venstre. Vises alltid separat fra spredning — bias korrigeres med sikte/teknikk, spredning med treningsvolum.
- **Spredning** (tilfeldig variasjon): standardavvik av Side (bredde) og av Carry (dybde). Vises som "±9 m" eller som ellipse.
- **Dispersion-ellipse:** sentrert på (snitt carry, snitt side), halvakser = 1σ carry / 1σ side. 80 %-ellipse (≈1.28σ) er standard for strategivisning — den DECADE bruker for sikteberegning.
- **Korridor-treff%:** andel slag innenfor definert bredde (f.eks. fairway 30 m, green-bredde per avstandsbånd). Mer intuitivt for spillere enn σ.
- **Avstandsbånd:** plattformen grupperer i TEE, INN200–INN50, og putting PUTT0_3–PUTT40P. Dispersion vises per bånd og per kølle.

## 3. Kobling til AK-metodikken

- **Testprotokoller (kategorier A–K, 20 protokoller):** hver test med utslag/innspill produserer Side- og Carry-serier → hver testvisning skal ha dispersion-analyse, ikke bare snittall. ScoringRule og pyramidArea styrer hvilken pyramide-søyle (FYS/TEK/SLAG/SPILL/TURN) resultatet teller mot.
- **DECADE / Presisjonsstrategi:** ellipsen ER strategiverktøyet. Sikte = plasser ellipsen så minst mulig havner i straff. Visning: ellipse-overlay på mål/korridor med buffer.
- **Tiger Five:** stabilitetsmål — dispersion-trend over tid er ledende indikator.
- **Strokes Gained:** plattformen har SG-motor (OTT/APP/ARG mot Broadie-baselines, putting mot Team Norway IUP). Dispersion forklarer HVORFOR SG er som den er — koble visningene.
- **Kontekst-tags:** hver måleserie bærer M-miljø (M0–M5) og PR-press (PR1–PR5). Sammenligning på tvers av M/PR uten merking er ugyldig — UI skal alltid vise kontekst-badge.

## 4. Visualiseringsmønstre (i prioritert rekkefølge)

1. **Top-down slagplott:** mållinje vertikalt, hvert slag som punkt (x = side i meter, y = carry), ellipse-overlay, korridor som skravert felt. Akse merket i meter med V/H. Dette er hovedvisningen.
2. **Bias/spredning-splitt:** to tall side ved side — "Snitt 4 m V" og "Spredning ±9 m" — med trendpil mot forrige test.
3. **Per-kølle small multiples:** samme plott i miniatyr per kølle/bånd, sortert etter spredning.
4. **Trend over tid:** spredning (σ side) per testdato som linje, med M/PR-badge per punkt.
5. **Strike-heatmap:** toe–heel / low–high dot-grid på kølleblad-silhuett.

## 5. Vanlige designfeil å avvise

- Tall uten enhet eller retning.
- Bias og spredning slått sammen til ett "avvik"-tall.
- Sammenligning av tester med ulik M/PR uten merking.
- Ellipse uten korridor/mål-kontekst (ser fin ut, sier ingenting).
- Snitt-carry uten spredning (skjuler hele historien).
