---
chunk_id: sg-trackman-002
source: masterdokument-strokes-gained-trackman.md
source_section: "### Innhold og pedagogikk: De forklarende avsnittene gir grunnlag for å skrive norskspråklige"
tags: [sg, trackman]
topics: [implementasjon, trackman-parametere]
lang: no
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, TrackMan, beregnSg]
updated: 2026-06-14
---

forklaringer og innsikter i appen.

Side 2 av 66

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

## 1.3 Forholdet mellom Strokes Gained (utfallsmåling) og Trackman (kausalmåling)

De to metodikkene er komplementære, ikke konkurrerende:

### Strokes Gained (SG) er en utfallsmåling (outcome measurement). Den forteller deg hva

_som skjedde: hvor mange slag du vant eller tapte i forhold til en referansespiller, fordelt på_ de fire spilområdene. SG svarer på «Hva kostet det meg?» og «Hvilket aspekt av spillet mitt er det viktigste å forbedre?»

### Trackman-data er en kausalmåling (causal measurement). Den forteller deg hvorfor det

_skjedde: hvilke fysiske parametere (angrepsvinkel, face angle, spinnrate, smash factor) som_ produserte et gitt resultat. Trackman svarer på «Hva forårsaket dette?» og «Hva bør jeg teknisk sett endre?»

Broen mellom de to: Trackman gir deg carry-avstand og dispersjon (sidemål), som oversettes direkte til SG:OTT via Broadies expected-strokes-tabeller. Trackman gir deg proximity (avstand til hull) etter innspill, som oversettes direkte til SG:APP. Slik skaper de to systemene en komplett diagnostisk loop: SG finner problemet, Trackman forklarer årsaken.

# 2\. Strokes Gained: Konsept og historie



## 2.1 Hva er Strokes Gained?

Slag spart (Strokes Gained, SG) er et statistisk rammeverk for å måle kvaliteten på enkeltslag i golf ved å sammenligne resultatet av hvert slag med den statistiske forventningen til en referansespiller (vanligvis PGA Tour-snittet) fra samme posisjon. I motsetning til tradisjonelle golftall som fairway-treff-prosent, greener-i-regulasjon (GIR) og putter per runde — som alle er enkle telletall uten kontekstuell sammenligningsverdi — gir SG en enhetlig valuta for å verdsette alle typer slag på en felles skala.

Det revolusjonerende med SG er at det besvarer spørsmålet: «Var dette et godt slag, gitt hvor ballen lå?» En putt på 2 fot forventes å gå i; å gå i er ingen bragd. En putt på 40 fot forventes ikke å gå i; å gå i er verdt nesten +1.0 SG. SG fanger denne kontekstuelle kvaliteten — noe tradisjonelle putts-per-runde-statistikker aldri kan.

SG er et nullsum-system innad i et felt: totalt over et felt vil den gjennomsnittlige spilleren alltid ha SG = 0,00. Spillere over gjennomsnittet har positiv SG; spillere under gjennomsnittet har negativ SG. For amatørapps brukes ofte en annen referanse (f.eks. 0- handicap eller handicap-matchet baseline), men prinsippet er det samme.
