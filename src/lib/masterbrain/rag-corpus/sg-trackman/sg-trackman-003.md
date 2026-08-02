---
chunk_id: sg-trackman-003
source: masterdokument-strokes-gained-trackman.md
source_section: "## 2.2 Mark Broadie og opphavet (del 1)"
tags: [app, broadie, pga-tour, putt, sg]
topics: [broadie, pga-snitt]
lang: no
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

Mark Broadie er professor ved Columbia Business School med spesialisering i matematikk og sportsanalyse. Han er den primære arkitekten bak SG-metodikken og er ansvarlig for dens systematiske anvendelse på tvers av alle aspekter av spillet.

Side 3 av 66

* * *

Broadie begynte å samle egne slagdata rundt 2003, det samme året PGA Tour lanserte
ShotLink-systemet. I begynnelsen nektet Tour å dele sine proprietære data. Ifølge Columbia
Business School var gjennombruddet i 2008: «I 2008 ønsket de å forbedre sine
puttingstatistikker. De kom til meg og sa: 'Du har drevet med dette med Strokes Gained —
kan vi tilpasse det til PGA Tour?' Og de gikk med på å dele dataene.»

Broadies bok «Every Shot Counts: Using the Revolutionary Strokes Gained Approach
to Improve Your Golf Performance and Strategy» (Gotham Books, 2014) la frem det
komplette rammeverket for allmennheten. Sentrale funn i boken inkluderer:

• Innspillslag er den største enkeltdifferensiatoren blant proffgolfere — større enn
putting, utslag eller kortspill

• Putting er overvurdert som differensiator — blant de 10 beste PGA Tour-spillerne fra
2004 til 2012 utgjorde putting kun 15% av deres scoringsfordel overfor
gjennomsnittsspilleren

• Langspillet forklarer to tredjedeler av scoringsforskjeller på alle ferdighetsnivåer

De 10 beste spillerne totalt i SG fra 2004 til 2012 var (i rekkefølge): Tiger Woods, Jim Furyk,
Phil Mickelson, Luke Donald, Vijay Singh, Ernie Els, Sergio Garcia, Adam Scott, Steve Stricker
og Zach Johnson — ifølge Andrew Rice Golf.

I august 2022 ble Broadies rankingalgoritme adoptert som grunnlaget for de Official World
Golf Rankings.

2.3 ShotLink-datasystemet

ShotLink er PGA Tours proprietære slagsporing-system, driftet i partnerskap med CDW. Det er
det empiriske fundamentet som alle PGA Tour SG-baselines bygger på.

Per ShotLink-historikksiden er systemet:

• Formelt lansert som «ShotLink» etter en strategisk gjennomgang i 1999

• I drift på PGA Tour, Champions Tour og Korn Ferry Tour — ca. 93 arrangementer per år

• Benytter en kombinasjon av radar, kameraer og laser til å fange banen og landingsstedet
for hvert slag

• Betjent av ca. 300 frivillige per turnering som hjelper til med datainnsamling

• Registrerer slagposisjoner med 1 fots nøyaktighet i fairway og 1 tommers
nøyaktighet på putting-greenen

Viktig begrensning: ShotLink benyttes ikke ved de fire majors-turneringene (Masters, U.S.
Open, The Open Championship, PGA Championship). Data fra disse turneringene er derfor
ekskludert fra offisielle SG-beregninger, ifølge ESPN.

• Hvert golfbane er digitalt kartlagt på forhånd slik at eksakte koordinater kan beregnes

• Data er tilgjengelig over hele verden innen sekunder

* * *

2.4 PGA Tours adopsjon (2011 putting, 2014 full)

| Ar | Milepæl |
| --- | --- |
| 2003 | PGA Tour begynner å samle ShotLink slagdata |
| 2008 | Tour inngår partnerskap med Broadie for å tilpasse SG til puttingstatistikk |
| 2011 | SG: Putting offisielt introdusert som PGA Tour-statistikk |
| 2014 | Full SG-suite (OTT, APP, ARG, T2G, Total) offisielt adoptert |
| 2022 | Broadies rankingalgoritme adoptert for Official World Golf Rankings |

Tours adopsjonsstrategi var elegant: i stedet for å forklare matematikken viste de eksperter
to blinde rangeringer av PGA Tour-puttere — én basert på gammel metode, én basert på SG
— og spurte hvilken som var mest nøyaktig. Uten å vite hvilken som var hvilken, valgte disse
ekspertene SG-rangeringen. Columbia Business School beskriver dette som nøkkelen til
umiddelbar aksept.

3. Strokes Gained: Matematisk grunnlag

3.1 Formelen: SG = Baseline(start) − Baseline(slutt) − 1

For ethvert enkeltslag i golf er Strokes Gained definert som:

SG (slag) = Baseline(start) − Baseline(slutt) − 1
