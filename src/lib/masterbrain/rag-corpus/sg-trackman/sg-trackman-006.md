---
chunk_id: sg-trackman-006
source: masterdokument-strokes-gained-trackman.md
source_section: "## Offisiell PGA Tour-definisjon: Måler spillerens prestasjon på innspillslag som ikke inngår i"
tags: [app, broadie, kategori, pga-tour, putt, sg]
topics: [implementasjon, pga-snitt, putting, sg-kategorier]
lang: no
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

SG: Around-the-Green eller SG: Putting. Inkluderer: - Alle slag fra mer enn 100 yards i fairway eller rough-Par-3 tee-slag (siden disse er innspillslignende slag, ikke driverslag) - Alle slag som ikke dekkes av ARG- eller PUTT-kategoriene

Fra GolfWRX: «Strokes Gained: Approach-the-Green: Måler spillerens prestasjon på innspillslag og andre slag som IKKE er inkludert i Strokes Gained: Around-the-Green og Strokes Gained: Putting. Det inkluderer tee-slag på par-3-er.»

Innspill er den største enkeltdifferensiatoren på PGA Tour. Broadies forskning identifiserte slag fra 150 til 225 yards som sonen med høyest korrelasjon til scoringsuksess. I Broadies 2011-paper er korrelasjonen mellom 150–200-yard-underkategorien og total SG 74% — den høyeste for noe enkelt avstandsbånd.

# 4.3 SG: Around-the-Green (ARG)



## Offisiell definisjon: Måler spillerens prestasjon på alle slag innen 30 yards fra kanten av



## greenen, unntatt putting.

- Inkluderer chips, pitches, flops og bunkerskudd fra nær hold
- 30-yard-grensen måles fra kanten av greenen, ikke fra pinnen
- Som GolfWRX slår fast: «Måler spillerens prestasjon på alle slag innenfor 30 yards fra kanten av greenen uten å måle putting»

## Bunker-nyanse fra Broadies data: Fra 15–34 yards fra hullet er sandslag enklere enn

roughslag på PGA Tour, i gjennomsnitt. Utenfor det området (under 15 yards eller over 34 yards) er sand vanskeligere enn rough. Dette undergraver den vanlige påstanden om at «proffene foretrekker bunker fremfor rough».

# 4.4 SG: Putting (PUTT)



## Offisiell definisjon: Alle slag slått på putting-greenen — fra enhver avstand. Måler hvor

mange slag en spiller vinner eller taper sammenlignet med PGA Tour-snittet fra samme avstand.

- Beregner per-putt SG ved å sammenligne hver putts avstand med den historiske gjennomsnittsputten-til-hole-out fra den avstanden
- PGA Tour-baseline rekalibreres hvert år med forrige sesongs ShotLink-data, i tommer- intervaller
- Nøkkelreferanseverdier: PGA Tour-proffene holder inn 50% fra 8 fot; de snitter to **putter fra 33 fot; tre-puttsamsynet overstiger 10% ved 40 fot**
- Den beste putteren på Tour vinner ca. +0.86 putter/runde over snittet (Luke Donald i
  2010); den dårligste taper ca. −1.01 putter/runde (Billy Mayfair i 2010), per Broadies puttingpaper

# 4.5 SG: Tee-to-Green og SG: Total



## SG: Tee-to-Green (T2G):

Side 8 av 66

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

### T2G = OTT + APP + ARG

Alt som skjer frem til ballen treffer putting-greenen. Dette er det aggregerte ikke-putting- målet for ballslagnkvalitet. **SG: Total:** **Total = OTT + APP + ARG + PUTT = T2G + PUTT**

Det komplette sammendraget av en spillers prestasjon relativt til feltet. Fra GolfWRX: «Strokes Gained: Total: Strokes Gained: Off-the-Tee + Strokes Gained: Approach-the-Green + Strokes Gained: Around-the-Green + Strokes Gained: Putting.»

## 4.6 Grenseregler og vanlige misforståelser



### Misforståelse 1: Par-3 tee-slag er OTT. Feil. Par-3 tee-slag kategoriseres som SG: APP —

de er innspillslignende slag, ikke driverslag. Bare par-4- og par-5-tee-slag teller som OTT. **Misforståelse 2: Alle slag innen 100 yards er ARG. Feil. ARG-grensen er 30 yards fra** **kanten av greenen. Et 90-yards bunkerskudd er APP. Et 25-yards pitchslag fra rough er** ARG. Avstandsgrensen refererer til grenskanten, ikke til pinnen. **Misforståelse 3: SG er bare relevant for proffgolfere. Feil. Rammeverket fungerer med** enhver valgt referanse. Arccos og Shot Scope bruker handicap-matchede baselines. Formelen er identisk — det er bare referansebaselinen som endres. **Misforståelse 4: Negativ SG betyr dårlig slag. Delvis feil. Negativ SG betyr bare at** slaget ble slått dårligere enn referansen — noe som er et normalt utfall for amatørgolfere som sammenlignes mot Tour-baselines. Den interne fordelingen (hvilke kategorier taper mest slag) er mer informativ enn absoluttverdiene. **Misforståelse 5: Putting er det mest avgjørende. Forskning viser det motsatte for de** fleste golfer. Langspillet dominerer scoringsforskjeller på alle nivåer (se seksjon 6).
