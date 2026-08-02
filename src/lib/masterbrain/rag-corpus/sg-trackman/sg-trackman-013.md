---
chunk_id: sg-trackman-013
source: masterdokument-strokes-gained-trackman.md
source_section: "### TheGrint, 18Birdies, Golf Pad, SwingU implementerer SG med Tour-baserte baselines,"
tags: [amatør, baseline, handicap, sg, trackman]
topics: [implementasjon, sg-baseline]
lang: no
relevance: [AiPlanGeneration, CoachHQ, PlayerHQ, RAG, SgBaseline, TrackMan, beregnSg, forventetSg]
updated: 2026-06-14
---

med varierende grad av automatisering (manuell input vs. GPS-autosporing). SwingU bruker spesifikt en forenklet inntastingsmodell — golfere taster kun inn utfallet av det første slaget i hvert aspekt — og har validert at dette gir ubetydelig forskjell fra full slag-for-slag- registrering.

### USGA Handicap System vs. Tour-baselines: USGA Handicap System (og WHS-

ekvivalenten) er et score-basert system, ikke et slag-kvalitets-system. Det justerer en spillers bruttoscorer relativt til banens Course Rating og Slope Rating. Nøkkelforskjell: Handicap- **systemet forteller deg forventet score på en bane; SG-baselines forteller deg** **forventede slag fra en spesifikk posisjon.**

# 8\. Trackman: Teknologi og produktoversikt



## 8.1 Selskapet og historikken

Trackman ble grunnlagt i 2003 i Hørsholm, Danmark (nord for Kjøbenhavn) av brødrene Klaus og Morton Jørgensen sammen med radar-ingeniøren Frederik Tuxen. Selskapets grunnleggende spørsmål var enkelt: Kunne vi spore en golfball bedre enn noen noensinne _hadde gjort? (Trackman About Page, Trackman Story YouTube)_

Det som begynte som et golfrettet radarselskap har utvidet seg til baseball, fotball, amerikansk fotball og tennis — og bidro til og med med sporingsteknologi til OL i Tokyo 2021 for hammerkast og kuletstøt. Golf forblir det primære forretningssegmentet.

Trackmans uttalte oppdrag er å «spore hvert golfslag over hele verden.» Deres enheter brukes av PGA Tour- og LPGA Tour-proffgolfere, elitecoacher, utstyrsprodusenter (OEMs), universitets-golfprogrammer og amatørgolfere. Selskapet opererer fra sitt danske hovedkvarter og opprettholder at de i mer enn 20 år har holdt sin ingeniøring og produksjon forankret i Danmark. (Trackman About Page)

## 8.2 Dual-radar Doppler-teknologi

Trackmans radar-teknologi fungerer ved å sende ut radiobølger fra senderen og måle **Doppler-skiftet av disse bølgene idet de reflekteres av den bevegelige golfkølla og** golfballen. Fordi radiobølger er ca. en million ganger lengre enn lysbølger, er de upåvirket av regn, tåke, snø eller ekstreme lysforhold. (Trackman radar-teknologiblogg)

### Trackman 4s dual-radar-arkitektur dedikerer ett radarsystem til kølle og impaktsone

(korträkkvidde, ultra-høy oppløsning) og ett til langtrekks-ballbane-sporing. Systemet opererer med 40 000 prøver per sekund per mottaker, og fanger hver nyanse av kølla- tilnærming, impakt, balloppstart og fullstendig bane til landing.

### OERT (Optically Enhanced Radar Tracking) tilfører høyhastighets-kamera-optikk

synkronisert med radaren, noe som muliggjør direkte måling av face angle, impaktlokasjon (høyde og offsett) og gear effect-modellering uten å kreve noen markeringer på ball eller kølle. (What is a Golf Launch Monitor — Trackman)

Trackman iOs kamera kjører med opptil 4 600 fps, og måler direkte 3D-spinn — viktig i korte innendørs rom der banen er for kort for radaren til å utlede spinn fra bane-kurvatur.

Side 18 av 66

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

# 8.3 Trackman 3e vs 4 vs iO (full sammenligning)



## Trackman 3e (Legacy — enkelt radar)

Trackman 3e er forgjengeren til Trackman 4. Den bruker ett enkelt radarsystem for å spore både kølle og ball. Nøkkelforskjeller fra Trackman 4:

- Ingen OERT (Optically Enhanced Radar Tracking) kamera-system
- Dårligere gear-effect-modellering innendørs, særlig for driver-mishits
- Sliter mer med å fange klubbdata på wedges (lavere ball-hastigheter)
- Krever mer innendørs plass enn Trackman 4 (minst 10 fot ballflukt)
- Ingen impakt-lokasjon (impact height/offset) måling
- Ingen puttmodus
- Ingen simulator-kapasitet — primært en utendørs/range-enhet
- Utendørs er ytelsen sammenlignbar med Trackman 4 for de fleste parametere
  3e opererer fortsatt innenfor Trackmans nøyaktighetstoleranse for balldata, men Trackman 4 er målbart overlegen, spesielt for spinn-nøyaktighet på korte innendørsavstander og kjølle- data-fangst for wedges. (Golf Simulator Forum sammenligning)
