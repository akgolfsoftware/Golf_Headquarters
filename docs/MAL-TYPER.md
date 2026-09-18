# Måltyper i PlayerHQ — ett konsept, alle flater

Ja: **alt spilleren kan måle i appen kan være et mål.**  
Ikke 100 skjermer. Én mål-rad med **binding** til et faktum som allerede finnes.

```
MÅL = type (resultat|prosess)
    + horisont (år|periode|måned|uke)
    + binding (hva «nå» leses fra)
    + start / nå / mål
    + synlig i I dag · Plan · Live · Analyse
```

Bindingen er det som skiller «100 kg benk» fra «vinne Onsøy Open» fra «12 t TEK» fra «innspill 100–150 m».

---

## Bindinger (komplett mot PlayerHQ)

Hver rad = noe du kan sette som mål. Tracker leser **samme sted som funksjonen allerede viser tall**.

### A. Turnering og resultat (Kurven, Runder, Scorekort)

| Binding | Eksempel | Resultat / prosess | «Nå» kommer fra |
|---|---|---|---|
| Bestemt turnering | Vinne Onsøy Open · topp 10 | Resultat (binært / plass) | GolfBox / påmeldt runde. Før start: «ikke spilt» |
| Snittscore | Snitt 76 i år | Resultat | Runder (brutto). Vindu: år/periode |
| Laveste runde | 69 i 2026 | Resultat | Beste komplette runde i horisonten |
| HCP | Under 7 | Resultat | Spillerprofil (estimat merkes ESTIMAT om det er det) |
| Runder per måned | 6 runder i sep | Prosess | Antall registrerte runder |
| Birdies / GIR / FIR | GIR 60 % | Resultat | Scorekort-aggregat. Tom runde = utelatt, ikke 0 |

Vinne turnering **styrer uketypen** (turneringsuke) rundt datoen, den lager ikke øktene selv.

### B. Strokes gained (Analyse)

| Binding | Eksempel | «Nå» |
|---|---|---|
| SG-Total / T2G | SG-T mot +1,0 | Egne runder, kilde merket |
| SG-OTT / APP / ARG / PUTT | APP mot 0,00 | Samme |
| SG i distanse-bøtte | APP 100–125 m | Analyse-bøtte. Uten nok slag: «for lite grunnlag» |

DataGolf er **referanse**, ikke spillerens «nå» for junior.

### C. Volum og tid (Plan, Live, oppsummering)

| Binding | Eksempel | «Nå» |
|---|---|---|
| Treningstimer totalt | 8 t / uke | Sum gjennomført økt-tid (ikke planlagt) |
| Timer per pyramide | 3 t **TEK** / uke | Økter merket TEK |
| Timer / økter per område | 2 t **innspill ~150 m** | Økter/øvelser på `INNSPILL_150` |
| Øktfrekvens | 5 økter / uke | Gjennomførte økter |
| Dose | 40 putter 0–3 ft / uke | Live-registrert, ikke planlagt dose |

**Planlagt** tid og **gjennomført** tid er to trackere. Prosessmål bruker gjennomført, med hopp-over-årsak unntatt.

### D. De 19 områdene (økt / Live)

Samme mønster som korte putter og benk, for alle:

Fullsving (Utslag, Innspill 200/150/100/50) · Nærspill (Chip, Pitch, Lob, Bunker) · Putt-bånd i **fot** · FYS (Styrke, Kondisjon, Bevegelighet) · Banespill (hull).

Eksempler:

- Innspill 100–150 m: prosess = timer/slag på `INNSPILL_100`+`INNSPILL_150`; resultat = nærhet eller SG-APP i bøtta.  
- Bunker: sand-save % (runde) vs bunker-økter (prosess).  
- Banespill: 18 hull / uke som prosess.

### E. Teknisk plan (tek-plan, P-posisjoner)

| Binding | Eksempel | «Nå» |
|---|---|---|
| P-oppgave | P4.0 denne perioden | Teknisk plan: aktiv / ferdig. Ikke et SG-tall |
| TEK-timer | se C | Økt merket TEK |

Teknisk mål er nesten alltid **prosess** (tid, oppgaver). Resultat kommer når TrackMan eller runde viser treff/spredning — egen binding, ikke samme linje.

### F. FYS og tester (som benk)

1RM / testprotokoll / TN-test / fysisk test forfalt. Målt i økt eller testdag. Talent-skjerm og tester er kilden, ikke Analyse-SG.

### G. TrackMan (økt, ikke tour)

Carry, spredning, smash — bare der økten har **målt** kolonne. Mangler tall: ukjent. Aldri fyll fra DataGolf.

### H. Vaner som ikke er golfslag

Utfordring (delt stasjon), ærlig grunnlag, varsler, bag (ferdig fitting) — kan være prosessmål («gjennomfør ærlig grunnlag hver søndag») men får **ikke** SG-graf.

---

## I dag-linjen (alltid synlig)

Algoritme, ikke 100 mål i hero:

1. Ett **resultat** med nærmeste frist eller aktiv turnering.  
2. Ett **prosess** som ukens økter faktisk tjener.  

Resten: Meg → Mål, gruppert År / Denne perioden / Denne uken.

Live: kun mål som **denne økten tjener**. Benk-økt viser ikke putt-tracker.

---

## Workbench

Når du lager blokk, velger du binding(er) økten tjener — fra spillerens aktive mål, filtrert på område.  
Innspill-150-mål dukker på innspill-blokker. Benk kun på STYRKE. «Vinne Onsøy» merker **turneringsuken**, ikke chippøkten onsdag.

---

Kort: konseptet er **mål = binding til et faktum PlayerHQ allerede har**. Pyramide, 19 områder, SG-bøtter, runder, timer, tester, turneringer er sporene. I dag viser to. Live viser det økten tjener. Analyse viser start/nå/mål med kilde.
