# Workbench · fysisk plan og turnering — 27.09.2026

Produksjonsklar wireframe/design i AK Golf Precision Athletics. Samme syntetiske spiller og uke over alle flater: Tobias Lindvik (coachvisning), uke 40 = 28.09–04.10.2026, Srixon Tour 03.10–04.10 på Larvik GK, reise tor 01.10, heldagsprøve tir 29.09.

## AG-WB-FYS · coach
- Tilbake til Workbench (AG-11). Spiller/gruppe (Segmented + Select). Periode: Uke · 6-ukers blokk · Sesong.
- Status: Kladd · Delvis lagret · Publisert · **Endret etter publisering** (varsel med tidspunkt, «Publiser på nytt»).
- Blokker etter hverandre (Styrke · grunn uke 40–45 → Kraft · overgang uke 46–49) med mål, deload, testuke.
- Ukevolum: plan min, plan tonnasje, faktisk min, faktisk tonnasje.
- Ukebrett med 7 dager (desktop dra, mobil Flytt-ark). Konfliktark for turneringsdag, reisedag og skoledag.
- Inspektør: økt, øvelser (område, serier, reps, kg, RIR, hvile, tempo), kondisjon (varighet, sone, mål), stepper for sett/reps/kg, belastning (ACWR, ukevolum), spillerrespons (RPE, dagsform, notat), historikk.
- Planlagt mot gjennomført med tonnasje og «Delvis».
- Handlinger: Legg til blokk · Legg til uke · Legg til økt · Legg til øvelse · Kopier uke · Juster progresjon · Flytt · Lagre delvis · Lagre · Publiser · Trekk tilbake · Angre.

## PH-WB-FYS · spiller
- Tilbake til Plan. Faner Økter · Fysisk · Turnering.
- Ukens økter + blokkoversikt. Dagens økt med stepper for sett, reps, kg. RPE og dagsform etter økta.
- «Du endrer ikke planen» + «Lagres på telefonen».
- Lagre delvis · Fullfør økt.

## AG-WB-TURN · coach
- Tilbake til Workbench. Turneringer i perioden med type og **Flytt** (uke) / dra på desktop.
- Konfliktstripe: tre turneringer på tre uker, skoleprøve dagen før, fysisk testuke for tett.
- Turnering: datoer, bane, tee, **format**, **reisedager**, runder, periode, kilde, status.
- Forberedelse dag for dag med REISE/SKOLE-merker; synlig/skjult per punkt.
- Turneringsdager: runde, dag, tee-tid, startside, rutine.
- Mål og strategi, gameplan-lenke. Etter turnering: brutto og til par per runde, SG eller «—», kilde/dato, plassering, evaluering, Lag tiltak.
- Handlinger: Legg til turnering · Legg inn forberedelse · Flytt · Lagre delvis · Lagre · Publiser · Trekk tilbake · Angre.

## PH-WB-TURN · spiller
- Tilbake til Plan. Faner. Rundeplan (dag, tee, start, rutine). Forberedelse med avkrysning.
- Mål og strategi. Etter turnering: brutto per runde, kilde, egen kommentar, Lagre delvis · Send til Anders.

## Innganger
- **AG-11:** to modulkort (Fysisk plan · Turneringer) med status og «Neste: …».
- **PH-10:** faner Økter · Fysisk · Turnering.
- **PH-01:** «Neste fysiske økt» og «Neste turnering», én handling hver.
- **AG-05:** turneringslag under legenden: turnering (TURN-farge), reise (stiplet), skole (hairline), og konfliktstripe «Styrke B på reisedag» → «Løs i fysisk plan».
- **AG-A04:** tabell for fysisk tonnasje/økter og turneringsrunder/forberedelse i plan mot faktisk.
- **AG-A06:** tiltak med mål «Fysisk plan» eller «Turneringsplan».

## Audit
**Audit 27.09.2026:** PlayerHQ PH-01, PH-10, PH-WB-FYS, PH-WB-TURN × data/tom/laster/feil × lyst/natt × 390/768/1024/1280/1440 = 160 tilfeller, 0 avvik. AgencyOS AG-05, AG-11, AG-A04, AG-A06, AG-WB-FYS, AG-WB-TURN × 4 tilstander × 5 bredder = 120 tilfeller, 0 avvik. Totalt 280, 0 avvik. Sjekket: sidelengs rulling og klipping, høyst én rust, hurtigknapp bare i AgencyOS.

**Ikke automatisk verifisert:** dra over / slipp / ugyldig mål på uke- og turneringslisten, ConflictSheet (reise, skole, turnering, uke med turnering), MoveSheet for turnering, angre-toast, bekreftelse ved publiser/trekk tilbake, sticky ActionBar over toast og tastatur på mobil, offline-kø, stepper-interaksjon, gruppemodus med individuelle kg. Prøvd for hånd i katalogen, ikke regnet som godkjent.
