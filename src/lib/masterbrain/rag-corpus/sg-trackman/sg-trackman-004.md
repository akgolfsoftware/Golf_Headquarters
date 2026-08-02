---
chunk_id: sg-trackman-004
source: masterdokument-strokes-gained-trackman.md
source_section: "## 2.2 Mark Broadie og opphavet (del 2)"
tags: [app, baseline, broadie, formule, kategori, kort-spill, pga-tour, putt, sg]
topics: [broadie, kortspill, pga-snitt, putting, sg-baseline, sg-kategorier]
lang: no
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, beregnSg, forventetSg]
updated: 2026-06-14
---

Der: - Baseline(start) = gjennomsnittlig antall slag en PGA Tour-proff trenger for å hole ut
fra startposisjonen (avstand + lie-type) - Baseline(slutt) = gjennomsnittlig antall slag fra
sluttposisjonen - −1 = trekkes fra for å veie inn det ene slaget som nettopp ble slått

Formelen brukes identisk på alle typer slag — driverutslag, innspill, chips, bunkerskudd og
putter. Verdiene summeres over en runde (eller sesong) og brytes ned i kategorier.

Som uttalt i Broadies 2011-paper: «Strokes Gained representerer reduksjonen i
gjennomsnittlig antall slag for å fullføre hullet fra begynnelsen til slutten av slaget, minus én
for å ta hensyn til det slåtte slaget.»

Baseline — også kalt «strokes to hole out» (slag for å hole ut) eller «forventede slag» — er en
empirisk oppslagstabell avledet fra millioner av historiske ShotLink-slag. De to
nøkkelinputene er:

3.2 Baseline / forventede slag-funksjonen

1. Avstand til hullet (i yards eller fot, avhengig av slag)

2. Lie-type (tee, fairway, rough, sand/bunker, recovery, green)


* * *

Baseline er ikke en enkel formel — det er en jevn empirisk kurve bygget fra faktiske PGA
Tour-slagutfall. Kurven glettes for å eliminere støy fra små utvalgsstørrelser ved ekstreme
avstander.

Kalibrering: Putt-baselines beregnes i tommer-intervaller for maksimal presisjon. Baselines
rekalibreres hvert år med data fra forrige sesong, slik at de holder seg aktuelle med
spillestandarder og utstyrsutvikling.

Feltet-justering: På PGA Tour justeres SG ytterligere for runde-for-runde kurs/værvanskelighetsgrad. Hvis en runde er unormalt lett eller vanskelig, justeres hver spillers SG
med feltgjennomsnittet for den runden. Dette er analogt med justert snittscore (f.eks. Byron
Nelson Award), per Roanoke College SG-implementeringsguiden.

3.3 Regresjonsmodellen (J = 2.38 + 0.0041d)

For utslagsslag fra tee-en passer Broadie en enkel lineær regresjon til dataene:

\ ==2.38+0.00410

Der J = forventede slag og d = avstand i yards. Tilpasningens R² er over 98%.

Tolkning: For hver ekstra 100 yards hullengde legges det til ca. 0.41 slag til en PGA Tourproffs forventede score. En 400-yard par-4 har en forventet score på 2.38 + 0.0041 × 400 =
4.02 slag fra tee-en.

For amatørgolfere som skyter 90 er den analoge formelen:

\\mathsf{J}=2.79+0.00660

Det betyr at for hver ekstra 100 yards legges 0.66 slag til — amatøren sliter mer enn
proffen med å overvinne avstand, per Broadies Columbia-paper.

1964-sammenlikning: Broadies funn matcher forbausende bra en liknende regresjon fra et
britisk turneringstudie fra 1964: J = 2.35 + 0.0044d — en bemerkelsesverdige konsistens
over seks tiår.

3.4 Gjennomarbeidede eksempler (utslag, innspill, chip, putt)

Eksempel 1: Utslagsslag på en par-4 (446 yards)

| Steg | Posisjon | Baseline |
| --- | --- | --- |
| Start | Tee,446 yards | 4.10 slag |
| Drive lander | Fairway,116 yards | 2.825 slag |
| SG=4.10-2.825-1 | =+0.275 | Litt over gjennomsnittsutslag |

* * *

Eksempel 2: Innspillslag (200 yards, fairway)

| Steg | Posisjon | Baseline |
| --- | --- | --- |
| Start | Fairway, 200 yards | 3.19 slag |
| Innspill lander | Green, 8 fot | 1.50 putter |
| SG=3.19-1.50-1 | =+0.69 | Utmerket innspill |

Et gjennomsnittlig innspill fra 200 yards (fairway) som ender på 50 fot gir: 3.16 − 2.16 − 1 =
0.00 — nøyaktig gjennomsnitt. Kilde: Pinpoint Golf

Eksempel 3: Chipslag (rundt greenen)

En chip fra 10 yards i rough der Tour-baseline er ca. 2.43: - Chiper ballen 5 fot fra hullet
(baseline ~1.24 putter): SG = 2.43 − 1.24 − 1 = +0.19 - Chiper ballen 30 fot fra hullet
(baseline ~1.98 putter): SG = 2.43 − 1.98 − 1 = −0.55

Eksempel 4: Putting
