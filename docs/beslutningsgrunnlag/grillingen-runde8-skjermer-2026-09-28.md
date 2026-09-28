# Grillingen runde 8 — skjermene i PlayerHQ og AgencyOS (28.09.2026)

Mål: få fram nøyaktig hva Anders vil ha på hver skjerm, og gjøre det om til bestillinger til
Claude Design «AK Golf Precision Athletics» (`7d7c2994`). Ingen kode i denne runden.
Grunnlag: [skjermkartlegging-2026-09-28.md](skjermkartlegging-2026-09-28.md) og
[kapabilitetskart-spillerutvikling-2026-09-28.md](kapabilitetskart-spillerutvikling-2026-09-28.md).
Tidligere runder: [runde 6](grillingen-runde6-2026-08-30.md),
[runde 7](grillingen-runde7-planlegging-2026-09-15.md).

## Status

| # | Område | Grillet | Bekreftet av Anders | Bestilling sendt |
|---|---|---|---|---|
| 0 | Motoren: planforslag, data og coach i løkka | ja | ja, 28.09 | — |
| 1 | PlayerHQ · I dag | pågår | — | — |
| 2 | PlayerHQ · Planlegging | — | — | — |
| 3 | PlayerHQ · Stats / Analyse (med toppidrettsmodulene) | — | — | — |
| 4 | PlayerHQ · Meg | — | — | — |
| 5 | PlayerHQ · Live-økt og registrering | — | — | — |
| 6 | AgencyOS · Cockpit | — | — | — |
| 7 | AgencyOS · Innboks | — | — | — |
| 8 | AgencyOS · Stall og Spiller 360 (AG-08) | — | — | — |
| 9 | AgencyOS · Kalender | — | — | — |
| 10 | AgencyOS · Workbench | — | — | — |
| 11 | AgencyOS · Mer (booking, økonomi, tester, grupper) | — | — | — |

## 0. Motoren

Lagt til 28.09 etter Anders' spørsmål om hva som skal til for at AI-planforslaget blir
verdensklasse. Grunnlag: [kapabilitetskart-spillerutvikling-2026-09-28.md](kapabilitetskart-spillerutvikling-2026-09-28.md).

### Anders forteller
1. **Inngang:** alder, HCP, snittscore, turneringsnivå, og SG for inneværende år og forrige
   sesong hvis spilleren har det.
2. **Teknikktest (valgfri):** ti slag med 9-jern, 7-jern, driver og sandwedge. PEI ut fra
   carry og sideavvik på TrackMan. Uten TrackMan: TrackMan Range, eller ute på banen med
   avstand fra flagget. Loggføres: Attack Angle, Club Path, Face to Path, Dynamic Loft og
   køllehastighet («klubbspill» i talen, tolket som Club Speed — bekreftes). Gir omtrentlig
   nivå.
3. **Ved lansering: fem standardplaner** basert på spillnivå og alder. AI-anbefalinger kommer
   når AI-modellene er utviklet. Spilleren kan planlegge uten coach ved å velge øvelser og
   sette sammen økter i Workbench.
4. **Planen tar hensyn til:** nivå, alder, tid, fasiliteter, fysiske forutsetninger,
   testresultater, SG, TrackMan-data hvis det finnes, snittscore i turnering, teknisk plan,
   skole, helse. Alle er viktige; **fasiliteter er kjempeviktig**, og spilleren skal kunne
   legge til så mange fasiliteter som hen vil.
5. **Justering:** når det er tapte slag mot neste nivå, flere dårlige turneringer på rad, eller
   når treningen ikke gjennomføres. Ikke etter én turnering med dårlig putting.
6. **Spiller uten coach:** kan ikke kommunisere med Anders, Anders kan ikke endre planen, og
   Anders har ikke innsyn i spillere som ikke er i en coachinggruppe.

### Spørsmål og svar

**8.1 Hvilke fem standardplaner?** Svar: bygget på kategorisystemet (snittscore A–K), ikke
voksenmodellen A/B/C/D. Grupperingen i fem er ikke avklart ennå (8.6).

**8.2 Teknikktest ved oppstart.** Svar: anbefales, men er ikke påkrevd. Bygges på
**Inspill Basic**: ti slag med hver kølle. Spilleren taster inn målavstanden per kølle (for
eksempel sandwedge 100 m), deretter per slag carry og hvor langt unna målet ballen landet.
Testen følger testprotokollen. (I dag: Inspill Basic er 10 slag fra 100–200 m med PEI,
benchmark bare ned til scratch.)

**8.3 Når planen justeres.** Svar:
- SG-gapet til neste nivå. Krever riktig SG-grunnlag for vanlige golfere, ikke bare PGA Tour.
- Tre dårlige turneringsrunder på rad. «Dårlig» defineres mot snittscore, for eksempel tre
  slag over snittet.

**8.4 Hvem godkjenner.** Svar:
- Spilleren står alltid fritt til å endre planen sin, med eller uten coach.
- AI kan gi anbefalinger; spilleren godkjenner dem alltid selv.
- Coach kan gi anbefalinger til gruppen og kan endre planen. Spilleren må ikke godkjenne
  coachens endring, men kan reversere den.

**8.5 AI-planbyggeren.** Svar: skjules ved lansering. Spilleren velger mellom fem
standardplaner.

**8.6 De fem standardplanene.** Svar: planene får navn etter spillertype, ikke etter
kategorigruppe. Eksempler: «Weekend Warrior» (to runder i uka pluss én treningsdag),
«Junior-aspirant» (en som ønsker å bli god), «Practice like the pros». **Alder skal aldri
avgjøre om man kan legge en plan eller hvor mye man trener — det er individuelt.**

**8.7 Dårlig turneringsrunde.** Svar: tre slag over snittet av de siste ti tellende rundene.

**8.8 SG for vanlige golfere.** Svar: a — Broadies tabeller per handicap, merket som estimat.
Senere kalibreres de mot egne data.

**8.9 Teknikktesten.** Svar: målavstanden er den avstanden spilleren selv slår sandwedge,
7-jern (tolket fra talen, bekreftes) og driver. Det viktige er spredningen: avstanden mellom
ballen lengst til høyre og lengst til venstre, og hvor mye Club Path, Face Angle og de andre
TrackMan-parameterne varierer fra slag til slag.

**8.10 Trening som ikke gjennomføres.** Svar: under 70 % gjennomført tid mot plan to uker på
rad gir forslag til omlegging.

**8.11 Navn på planene.** Svar: godkjent — Weekend Warrior · Klubbspilleren ·
Junior-aspirant · Konkurransespilleren · Practice like the pros. Innholdet tilpasses A–K.

**8.12 Køller i teknikktesten.** Svar: sandwedge, 7-jern og driver. Talen sa «femten» —
Bekreftet: 10 slag per kølle.

**8.13 Testresultatet.** Svar: a — testen viser spredning og variasjon i TrackMan-tallene og
merker største svakhet. Den setter ikke nivå; nivået kommer fra snittscoren.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)

- **Oppstart:** alder, HCP, snittscore, turneringsnivå og SG i år og forrige sesong hvis det
  finnes. Så mange fasiliteter spilleren vil, og de kan endres senere. Teknikktesten
  anbefales, men er ikke påkrevd.
- **Teknikktesten:** bygger på Inspill Basic. Sandwedge, 7-jern og driver på spillerens egen
  avstand. Per slag: carry og avstand fra mål. Med TrackMan: spredning og variasjon i Club
  Path, Face Angle, Face to Path, Attack Angle, Dynamic Loft og Club Speed. Uten TrackMan:
  TrackMan Range eller banen. Resultatet viser største svakhet; det setter ikke nivå.
- **Første plan:** én av fem standardplaner — Weekend Warrior, Klubbspilleren,
  Junior-aspirant, Konkurransespilleren, Practice like the pros — med innhold tilpasset
  kategori A–K. Alder begrenser aldri plan eller mengde.
- **Ved lansering:** ingen AI-planbygger. Spilleren kan alltid bygge økter selv i Workbench.
  AI-anbefalinger kommer når modellene er utviklet.
- **Planen tar hensyn til:** nivå, alder, tid, fasiliteter (kjempeviktig), fysiske
  forutsetninger, tester, SG, TrackMan, snittscore i turnering, teknisk plan, skole, helse.
- **Forslag til justering kommer når:**
  - SG viser gap til neste nivå, målt mot Broadies tabeller per HCP (merket estimat, senere
    kalibrert mot egne data)
  - tre turneringsrunder på rad er minst tre slag over snittet av de siste ti tellende
  - gjennomført tid er under 70 % av plan to uker på rad
  - aldri etter én runde eller én turnering
- **Hvem bestemmer:** spilleren kan alltid endre egen plan. AI-forslag godkjenner spilleren
  selv. Coach kan endre planen og gi anbefalinger til gruppen; spilleren trenger ikke godkjenne
  coachens endring, men kan angre den.
- **Spiller uten coach:** Anders ser ikke planen, kan ikke endre den, og spilleren kan ikke
  skrive til Anders.

**Beslutninger som skal registreres i fase 4:** AI-planbyggeren skjules ved lansering · fem
standardplaner etter spillertype · alder begrenser aldri plan eller mengde · tre
justeringsregler · hvem som godkjenner · teknikktesten ved oppstart.

**Kodefunn som må bli egne oppgaver (ikke i denne runden):** ukeforslaget sender ekte navn
til Anthropic (`week-suggest.ts:194`); hardkodede fasilitetsflagg (`context.ts:579-581`);
signalnavn som ikke matcher (`plan-builder/index.ts:191`, `SG_AREA`); ny runderegistrering
starter ikke runde-agentene.

## 1. PlayerHQ · I dag

### Dette finnes i dag
- **App:** én skjerm, `/portal` (`IDagSelected` + `IDagCaddie`).
- **Design:** PH-01 I dag og PH-02 Gjør nå. I Kildemateriale: «Mål og dagens økt».
- **I koden uten skjerm:** `getTodaysSession` (0 kallere), `cs-progression` (skadevarsel på
  køllehastighet), `pyramid-weighting` (fordeling mot ønsket).

### Anders forteller
- Spilleren skal se dagens treningsøkter, og kunne starte en økt med ett trykk rett etter at
  appen er åpnet.
- Varsel fra coach eller fra appen kommer først som pop-up. Spilleren velger å lese eller
  ignorere.
- Forslag fra motoren vises både som varsel og i en innboks.

### Dette fantes 28.09
- Design PH-01: hilsen, «Registrer runde», bjelle, øktkort med «Start økt»/«Se øktark»,
  dagsform 1–5, agenda, neste fysiske økt, neste turnering, Caddie-forslag med «Send til
  coach» (bryter 8.4), treningstid for uka per akse.
- App `/portal`: tilsvarende, pluss Caddie-felt, TrackMan- og testkort. Ingen pop-up og ingen
  samlet innboks: varsler og coachmeldinger ligger hver for seg.

### Spørsmål og svar
**8.14 Flere økter samme dag.** Svar: den neste økten på tidslinjen vises alltid. Alle økter
har like store kort, og det skal være lett å se hvor i pyramiden økta hører hjemme (FYS, TEK,
SLAG, SPILL, TURN).

**8.15 Pop-up.** Svar: bare melding fra coach og endring i dagens treningsplan. Alt annet
går rett til innboksen og vises med rødt varseltall.

**8.16 Innboks.** Svar ikke gitt eksplisitt; tolket som én innboks bak bjella (bekreftes i
sammendraget).

**8.17 Innhold på I dag.** Svar: dagsform · agenda · neste fysiske økt · neste turnering med
nedtelling i dager · fordeling av treningstiden på uka · en spillifisert visning av hvor mange
økter som er fullført etter planen. En flyttbar hurtigknapp med snarveier: spør Caddie,
opprett ny økt, registrer runde og andre snarveier.

**8.18 Ingen økt i dag.** Svar: «Bygg økter i Workbench» eller «Registrer runde». Har
spilleren ingen treningsplan: «Velg treningsplan».

**8.19 Fullførte økter.** Svar: anbefalt — «5 av 6 økter fullført denne uka» og rekke med uker
på rad over 70 %. I tillegg milepæler: 10, 50 og 100 fullførte økter etter planen.

**8.20 Hurtigknapp i PlayerHQ.** Svar: ja, også på spillerflaten. Snarveier: Spør Caddie ·
Ny økt · Registrer runde · Start økt. Endrer beslutningen 22.09 («ikke avklart om den gjelder
PlayerHQ»).

### Slik vil du ha det (venter på bekreftelse)
- **Pop-up ved åpning:** bare melding fra coach eller endring i dagens plan. «Les» eller
  «Ignorer». Alt annet går til innboksen.
- **Øverst:** dagens økter som like store kort i tidsrekkefølge, neste først. Hvert kort har
  aksefarget stripe (FYS, TEK, SLAG, SPILL, TURN) og «Start» med ett trykk.
- **Under:** dagsform · agenda · neste fysiske økt · neste turnering med nedtelling i dager ·
  treningstid for uka per akse · fullførte økter mot plan (uke, rekke over 70 %, milepæler 10,
  50, 100).
- **Bjella øverst:** rødt tall; åpner én felles innboks med forslag fra motoren (godta eller
  avvis), meldinger fra coach og varsler.
- **Hurtigknapp:** flyttbar, med Spør Caddie · Ny økt · Registrer runde · Start økt.
- **Ingen økt i dag:** «Bygg økter i Workbench» og «Registrer runde». Uten treningsplan:
  «Velg treningsplan».
- **Fjernes:** «Send til coach» på AI-forslag — spilleren godkjenner selv.
