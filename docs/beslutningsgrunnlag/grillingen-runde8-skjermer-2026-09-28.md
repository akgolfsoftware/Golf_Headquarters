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
| 0 | Motoren: planforslag, data og coach i løkka | ja | ja, 28.09 | runde 19 (felles struktur) og 23 (oppstart) |
| 1 | PlayerHQ · I dag | ja | ja, 28.09 | — |
| 2 | PlayerHQ · Planlegging | ja | ja, 28.09 | — |
| 3 | PlayerHQ · Stats / Analyse (med toppidrettsmodulene) | ja | ja, 28.09 | — |
| 4 | PlayerHQ · Meg | ja | ja, 28.09 | — |
| 5 | PlayerHQ · Live-økt og registrering | ja | ja, 28.09 | — |
| 6 | AgencyOS · Cockpit | ja | ja, 28.09 | — |
| 7 | AgencyOS · Innboks | ja | ja, 28.09 | — |
| 8 | AgencyOS · Stall og Spiller 360 (AG-08) | ja | ja, 28.09 | — |
| 9 | AgencyOS · Kalender | ja | ja, 28.09 | — |
| 10 | AgencyOS · Workbench | ja | ja, 28.09 | — |
| 11 | AgencyOS · Mer (booking, økonomi, tester, grupper) | ja | ja, 28.09 | — |

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

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
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

## 2. PlayerHQ · Planlegging

### Dette fantes 28.09
- App: `/portal/planlegge` (PlanV2), `planlegge/workbench`, `planlegge/bygger` (AI, skjules
  ved lansering), egen `/portal/kalender`, egen `/portal/fysisk`, egne turneringssider
  (`tren/turneringer`), `utviklingsplan`, `drills`.
- Design: PH-10 Plan: uke, PH-11 Workbench, PH-12 Planbygger, PH-13 Øvelsesbank,
  PH-WB-FYS, PH-WB-TURN. Toppidrett: Kalender med 52 ukers årshjul.

### Anders forteller
- Når spilleren trykker «Opprett årsplan», kommer en veileder som forklarer årsplan,
  periode, måned og økt, så spilleren ikke blir overveldet.
- Fysisk trening og turneringer ligger i **samme hovedkalender**. Ingen egne kalendere; de er
  ekstra punkter i Workbench. Spilleren velger aksen i pyramiderekkefølge (for eksempel FYS)
  og legger økta inn der.
- Spilleren kan endre planen selv. Ved endringer rundt turneringer skal coach få varsel.
- Spør om anbefaling når spilleren trener mye mer enn planlagt.
- Fanenavn: «Plan» og «Stats» fungerer bedre på mobil, iPad og desktop.

### Spørsmål og svar
**8.21 Veileder.** Svar: a — første gang trinn for trinn (år → perioder → måned → uke →
økt), kan hoppes over; etterpå «?» med forklaring på hvert nivå.

**8.22 Mer trening enn planlagt.** Svar: ok til anbefalingen — over 130 % av planlagt tid to
uker på rad gir forslag om lettere uke i innboksen, og varsel til coach hvis spilleren har
coach. Ingenting sperres. ACWR over 1,5 blir tilleggsregel når ACWR er bygget (finnes ikke i
koden i dag).

**8.23 Varsel til coach.** Svar: a — når spilleren legger til, fjerner eller flytter en
turnering, og når spilleren endrer en økt coachen har lagt inn.

**8.24 Fanenavn.** Svar: a — **I dag · Plan · Stats · Meg**. Endrer «PlayerHQ har fire
faner: I dag · Plan · Analyse · Meg» i beslutningene.

**8.25 / 8.26 Hovedkalender og Workbench.** Svar: Plan er **én flate** med «se» og
«rediger». «Rediger» går rett inn i komplett Workbench-modus. Anders: det er viktig at
Workbench og hovedkalender ikke blandes.

**Kalenderkobling (lagt til 28.09).** Anders: spilleren skal kunne se hele kalenderen sin i
appen. Målt i koden: Google-kobling finnes allerede, begge veier (`src/lib/google-calendar*.ts`),
brukes i dag for coachkalender og bookinger. Spilleren har `/portal/meg/innstillinger/integrasjoner`.
Apple finnes ikke.

**8.27 Retning.** Svar: b — begge veier. Kalenderen vises i appen, og øktene havner i
spillerens faktiske Google-kalender.

**8.28 Apple.** Svar: b — bare Google ved lansering, Apple senere.

**8.29 Hva coach ser.** Svar: a — coach ser bare «Opptatt» og klokkeslett, aldri tittel.
Spilleren ser alt i egen kalender.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Fanen heter Plan.** Én flate. Se-modus viser planen i zoom År · Måned · Uke · Dag (uke
  først på mobil). Trykk på en økt for å se eller starte den.
- **«Rediger»** går rett inn i komplett Workbench på samme sted. Der velges akse i
  pyramiderekkefølge (FYS, TEK, SLAG, SPILL, TURN), økter legges inn og dras.
- **Fysisk trening og turneringer** ligger i samme plan som golføktene — ingen egne kalendere.
- **Skole, jobb, reise og bookinger** vises som eget lag; opptatt tid legges inn derfra.
- **Egen kalender, egen fysisk-side og egne turneringssider** forsvinner fra menyen; gamle
  adresser sender videre til Plan.
- **Veileder** første gang spilleren oppretter årsplan, trinn for trinn, kan hoppes over;
  «?» på hvert nivå etterpå.
- **Spilleren kan endre alt selv.** Coach får varsel når en turnering legges til, fjernes
  eller flyttes, og når en økt coachen har lagt inn endres.
- **For mye trening:** over 130 % to uker på rad gir forslag om lettere uke (spiller) og
  varsel (coach). For lite: under 70 % to uker på rad (fra Motoren).
- **Kalenderkobling:** spilleren kobler Google-kalenderen sin. Hele kalenderen vises i Plan,
  og øktene legges ut i Google-kalenderen (begge veier). Coach ser bare opptatt tid og
  klokkeslett, aldri tittel, slik at coach finner ledig tid uten å se privat innhold. Apple
  kommer senere.

**Beslutninger som skal registreres i fase 4:** fanene I dag · Plan · Stats · Meg · Plan er
én flate med se og rediger (Workbench) · ingen egne kalendere for fysisk og turnering ·
varsel til coach ved turneringsendring · 130 %-regelen · Google-kalender begge veier, coach
ser bare opptatt.


## 3. PlayerHQ · Stats

### Dette fantes 28.09
- App: 22 sider (Analyse, DataGolf, TrackMan, tester, mål, SG-hub), mange uten meny inn.
- Design: PH-16 Analyse-hub (SG per runde, fem innganger), PH-18 Runder og statistikk,
  PH-A01–A08 Treningsanalyse, PH-17 TrackMan, PH-14/15 Tester, PH-19 Mål og talent,
  PH-20 Gameplan og banekart.
- Kontroll mot toppidrettsmodulene (MÅLT i `7d7c2994` 28.09; PH-24 og AU-04 ikke lest):
  Ytelsesbilde og Baseline mangler helt. Delvis: Banekart (PH-20 mangler SG per sone),
  Treningsanalyse (mangler treningsmengde mot SG i samme graf), SG (mangler proximity mot PGA
  per avstand, up-and-down per lie, Tiger 5), Ferdighetstest (mangler PEI-poeng og vitne),
  Kategori (mangler interaktiv skala), Mål (mangler kjeden årsmål → øktmål), Øvelse (PH-13
  bare viser). TrackMan nesten dekket i PH-17/PH-A04.
- Kode (MÅLT, `src/lib/sg.ts`): SG-kategoriene er de samme som treningsområdene — Tee,
  Innspill 200+/150–200/100–150/50–100/0–50, Chip, Pitch, Lob, Bunker, Putt 0–3/3–5/5–10/
  10–15/15–25/25–40/40+ fot.

### Anders forteller
- Øverst: positiv trend hvis den finnes, deretter kategoriene der man taper mest, synkende.
- SG-oversikt: hvor man ligger an mot neste kategori etter snittscore. Spilleren sammenlignes
  mot neste kategori, ikke PGA Tour.
- Stats består av snittscore, strokes gained, trening og tester.
- Live-føring av alle slag på banen uten banekart i starten: legg inn hull 1, så hvert slag med
  det som trengs for komplett SG (tas videre i område 5).

### Spørsmål og svar
**8.30 Øverst.** Svar: positiv trend først, så SG-kategoriene sortert etter flest tapte slag.
**8.31 Sammenligning.** Svar: neste kategori (Broadie, merket estimat) som standard.
**8.32 Oppdeling.** Svar: fire faner — Snittscore · Strokes Gained · Trening · Tester.
**8.33 Ytelsesbilde.** Svar: b — med alt, også søvn og mat; samtykke godkjennes i onboarding.
**8.34 Nok data.** Svar: a — under 8 runder «for lite grunnlag», tee og innspill fra 12,
nærspill og putting fra 24; men spilleren kan starte fra 4 runder.
**8.35 PGA Tour.** Svar: b — coach ser alltid PGA; spilleren kan slå det på selv.
**8.36 Innhold per fane.** Svar: Snittscore = rundescore og scorekort. Strokes Gained = alle
kategorier (Tee, Innspill 200+ til 50–100, alle nærspill- og puttekategorier). Trening =
treningsmengde mot SG-utvikling, spredning og utvalgte TrackMan-parametere, filter på
pyramide og alle parametere fra treningsplanleggeren. Tester = resultater, progresjon,
snitt, med positiv trend øverst.
**8.37 Positiv trend.** Svar: a — SG-kategorien med størst forbedring siste 10 runder mot de
10 før. Finnes ingen, hoppes den over.
**8.38 Fire runder.** Svar: a — 4–7 runder vises merket «foreløpig»; under 4: «Registrer X
runder til for å se Stats».
**8.39 Banekart.** Svar: a — SG per avstand som liste nå; tegnet hullkart senere.
**8.40 Kategori A–K.** Svar: a — øverst i Snittscore.
**8.41 Filter i Trening.** Svar: a — tidsrom, periode, pyramide, område, sted, motorikk,
press, kølle, samlet bak én «Filter»-knapp; på mobil vises valgte filtre som brikker.
**8.42 Tester.** Svar: a — siste resultat, snitt, progresjon og nivå mot neste kategori
(«—» der normen mangler).
**8.43 Ytelsesbilde, plassering.** Svar: a — på hver runde i Snittscore, samlet radar øverst.
**8.44 Coachens visning.** Svar: a — samme Stats for valgt spiller, PGA alltid på, og
sammenligning med stallen.

**Tillegg.** Vitnegodkjenning av test venter til vennefunksjonen finnes. Tiger 5 vises i
Snittscore (talen: «hvor jeg er Tipper», tolket som «der det passer»). Nærhet til hull per
avstand mot PGA Tour («fra 100 m: PGA snitt X m, du Y m») vises i Strokes Gained når
PGA-sammenligningen er slått på.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Fanen heter Stats**, fire deler: Snittscore · Strokes Gained · Trening · Tester.
- **Øverst i hver del:** positiv trend hvis den finnes (størst forbedring siste 10 runder mot
  de 10 før), deretter kategoriene med flest tapte slag, synkende.
- **Sammenligning:** neste kategori etter snittscore (Broadie, merket estimat). Spilleren kan
  slå på PGA Tour; coach ser alltid begge.
- **Snittscore:** kategori A–K øverst med «X slag til neste kategori» · rundescore og
  scorekort · Tiger 5 per runde og sum for sesongen · Ytelsesbilde på hver runde (fem
  faktorer, energifall per hull, søvn og mat) med samlet radar øverst · samtykke i onboarding.
- **Strokes Gained:** alle kategorier — Tee · Innspill 200+, 150–200, 100–150, 50–100 · alle
  nærspillkategorier (0–50, Chip, Pitch, Lob, Bunker) · alle puttekategorier (0–3 til 40+
  fot). Som liste per avstand; tegnet hullkart senere. Med PGA på: nærhet til hull per
  avstand mot PGA-snittet.
- **Trening:** treningsmengde mot SG-utvikling i samme område · spredning og utvalgte
  TrackMan-parametere · én «Filter»-knapp (tidsrom, periode, pyramide, område, sted,
  motorikk, press, kølle), valgte filtre som brikker på mobil.
- **Tester:** siste resultat, snitt, progresjon, nivå mot neste kategori («—» der normen
  mangler). Vitnegodkjenning venter til vennefunksjonen finnes.
- **Nok data:** under 4 runder «Registrer X runder til» · 4–7 runder «foreløpig» · tee og
  innspill sikre fra 12, nærspill og putting fra 24.
- **Coach i AgencyOS:** samme Stats for valgt spiller, PGA alltid på, sammenligning med stallen.
- **Toppidrettsmodulene:** Ytelsesbilde → Snittscore · SG → Strokes Gained · Treningsanalyse
  og TrackMan → Trening · Ferdighetstest → Tester · Kategori A–K → Snittscore · Banekart →
  senere · Baseline og Onboarding → oppstarten (område 0) · Mål → område 4 · Øvelse →
  Workbench.
- **Videre til område 5:** live-føring av hvert slag hull for hull, uten banekart.

**Beslutninger som skal registreres i fase 4:** fire faner i Stats · sammenligning mot neste
kategori som standard, PGA valgfritt for spiller og alltid for coach · grenser for nok data
(4/8/12/24) · Ytelsesbilde med helsedata bak samtykke i onboarding · banekart og
vitnegodkjenning senere · coach ser samme Stats som spilleren.

## 4. PlayerHQ · Meg

### Dette fantes 28.09
- App: 38 sider under Meg (profil, abonnement, bookinger, dokumenter, helse, utstyr, foreldre,
  hjelp, resultater, 9 innstillingssider). Utenfor Meg: coach-kontakt (11), mål (4), talent
  (4), utfordringer (3), venner (2), ukesdigest.
- Design: PH-24 Meg, PH-25 Abonnement og innstillinger, PH-21 Coach-kontakt, PH-23 Booking,
  PH-26 Utenfor banen.
- Kode (MÅLT): `Goal` har resultat-/prosessmål (`GoalCategory`) og sluttdato, ikke startdato.
  `PlayerFacility` har range-lengde, lengste putt og 14 ja/nei-evner; ikke bunker- eller
  chiplengder. Fasiliteter kan ikke endres etter oppstart (`saveFacilities` 0 kallere).
  Skade/fravær har ingen skriveflyt. Utfordringer kan ikke opprettes (`opprettUtfordring`
  0 kallere). Profilkobling mot AK pipelines finnes (`src/lib/profil-kobling/`): golf-ID eller
  fornavn + etternavn + fødselsår, mellomnavn ignoreres; bare i Meg → Resultater.
- Talent (MÅLT): radar = coachens vurdering 1–10 (fysisk, teknikk, taktikk, mental,
  motivasjon) + testnivå per pyramideområde; sammenligning = eget SG-snitt mot én annen
  (anonymisert) spiller.

### Anders forteller
- Meg: profil (navn, personalia, HCP, hjemmeklubb), fasiliteter (flere, med hva som kan og
  ikke kan trenes), bookinger, betalingskort, inviter foreldre, hjelp, alle innstillinger.
- Senere: eksport og utskrift av årsplan.
- Mål heter **Målsetning**. Målsetninger integreres i Workbench og synkroniseres med alt i
  appen (planlegging, stats, resultatmål). Alle har start- og sluttdato og er resultat- eller
  prosessmål.
- Turneringsresultater via AK pipelines: spilleren finner sin profil fra GolfBox i onboarding,
  uten krav om eksakt navn (mellomnavn), og henter resultatene inn.

### Spørsmål og svar
**8.45 Målsetninger.** Svar (via 8.50): i Workbench.
**8.46 Coachen.** Svar: a — meldinger i innboksen bak bjella; «Min coach» under Meg (hvem,
avtale, videoer, tilbakemeldinger).
**8.47 Rekkefølge i Meg.** Svar: a — profil · fasiliteter · bookinger · abonnement og
betalingskort · foreldre · helse og fravær · utstyr · hjelp · innstillinger.
**8.48 Fasiliteter.** Svar: a — dekning av treningsområder per fasilitet, så mange du vil,
kan endres når som helst. Viktig: range-lengde (kan jeg slå driver?), treningsbunker ja/nei
med korteste og lengste slag, lengste chip (for eksempel 30 m ja/nei) osv. for alle typer.
**8.49 Løse sider.** Svar: venner og utfordringer flyttes under Meg. Talent, ukesdigest og
«Utenfor banen»: se 8.54–8.56.
**8.50 Målsetninger i Workbench.** Svar: a — «Målsetninger» i Workbench bytter
midtfeltet (der kalenderen står) til målsetningene. Hver har start, slutt og type, knyttes til
nivå (år, periode, måned, uke, økt), fremdrift hentes automatisk.
**8.51 Hva måles.** Svar: alle funksjoner og parametere i hele plattformen.
**8.52 Fasilitetsskjema.** Svar: a — én fasilitet om gangen, ja/nei med oppfølging ved ja;
appen regner ut dekning av treningsområdene.
**8.53 Turneringsresultater.** Svar: koblingen mot AK pipelines skjer i onboarding (8.57);
resultatene hentes inn i plattformen.
**8.55 Talentradar.** Svar: bare coach, aldri spiller.
**8.56 Sammenligning.** Svar: bare coach kan sammenligne med andre spillere i gruppene.
Spilleren kan alltid sammenligne snittscoren sin mot AK Golf pipelines (tolket: mot
anonymiserte snitt i resultatdatabasen, for eksempel samme alder eller tour — bekreftes).
**8.57 Kobling i onboarding.** Svar: a — eget steg «Finn deg i turneringsresultatene», kan
hoppes over og gjøres senere fra profilen.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Rekkefølge:** profil (navn, personalia, HCP, hjemmeklubb) · fasiliteter · bookinger ·
  abonnement og betalingskort · foreldre (inviter, se tilgang) · helse og fravær (skade,
  sykdom, ferie) · utstyr · hjelp · innstillinger.
- **Fasiliteter:** så mange du vil, kan endres når som helst. Én om gangen med ja/nei og
  oppfølging ved ja (range-lengde og driver, korteste og lengste bunkerslag, lengste chip
  osv.). Viser hvilke av de 19 treningsområdene fasiliteten dekker, og hva som mangler.
- **Min coach:** hvem, avtale, videoer, tilbakemeldinger. Meldinger i innboksen bak bjella.
- **Venner og utfordringer** under Meg.
- **Målsetninger** (nytt navn på mål): i Workbench, bytter ut kalenderen i midtfeltet. Start,
  slutt, resultat- eller prosessmål, knyttet til år/periode/måned/uke/økt, målbar på alle
  parametere i plattformen, fremdrift automatisk fra plan, Stats, tester og runder.
- **Turneringsresultater:** nytt steg i onboarding «Finn deg i turneringsresultatene» (AK
  pipelines, golf-ID eller navn + fødselsår, mellomnavn ignoreres), kan hoppes over og tas fra
  profilen. Resultatene vises i Stats → Snittscore.
- **Sammenligning:** ~~spilleren kan alltid sammenligne snittscoren mot anonymiserte snitt i AK
  Golf pipelines~~ — fjernet for nå (Anders 28.09 etter runde 22). Bare coach sammenligner med
  andre spillere i gruppene.
- **Talentradaren** (coachens vurdering 1–10) ser bare coach, aldri spiller.
- **Senere:** eksport og utskrift av årsplan.
- **Fjernes fra PlayerHQ:** talent «Min plan» og roadmap (dekkes av Plan), ukesdigest (blir
  melding i innboksen), «Utenfor banen».

**Beslutninger som skal registreres i fase 4:** Mål heter Målsetning · målsetninger i
Workbench med start, slutt og type · fasilitetsskjema med mål og dekning · turneringskobling i
onboarding · talentradar bare for coach · sammenligning med andre spillere bare for coach
(bekrefter gjeldende regel), snittscore mot anonymiserte pipelines-snitt for spiller ·
talent-, ukesdigest- og «Utenfor banen»-sidene utgår.

## 5. PlayerHQ · Live-økt og registrering

### Dette fantes 28.09
- App: 14 sider — live brief → aktiv → slagteller → oppsummering, runde live, runde logg,
  gjennomføre, runderegistrering med hull og slag, treningslogg.
- Design (natt): PH-03 Øktark, PH-04 Live brief, PH-05 Live aktiv, PH-06 Slagteller, PH-07
  Øktoppsummering, PH-08 Runde live, PH-15 Test gjennomfør. PH-09 Registrer runde,
  PH-RD-01–09 runderegistrering for SG.
- Kode (MÅLT): `DrillLogV2` har reps uten ball, lav hastighet, automatikk og slått; teknisk
  plan har planlagte reps per læringssteg. Fysisk program med sett, reps, RIR, pulssone og
  logg. `Shot` har hull, par, underlag, avstand til hull, kølle, slagtype, straffeslag, GPS-felt
  (ubrukt); `PuttDetail` har lengde i fot, break, helling, fart. SG krever bare avstand før
  slaget, underlag og straffeslag. Videoopplasting uferdig. Ny runderegistrering starter ikke
  runde-agentene.

### Anders forteller
- Start økt → liste over alle driller i økta før start. Overskrift med hvem, hva, pyramide,
  AK-formel og annen relevant info. Timer for hele økta.
- Ved start: detaljert beskrivelse av første drill kommer automatisk. Er det en teknisk oppgave
  fra den individuelle tekniske planen: bilde, video og tekst fra trener; spilleren kan legge til
  egen video eller bilde.
- Hver drill har egen timer som stopper når drillen fullføres.
- Reps loggføres per drill: uten ball, lav hastighet, automatikk og slag.
- Fysisk: følg programmet, fyll inn vekt, endre reps og serier (for eksempel 4 × 4 → 3 på de
  siste).
- Runde: spilleren legger inn det som trengs for eksakt SG etter runden.

### Spørsmål og svar
**8.58 Reps.** Svar: a — fire store tellere (Uten ball · Lav hastighet · Automatikk · Slag),
+1/+5, trykk på tallet for å skrive, planlagt antall ved siden av. Anders nevnte et bilde av
omtrentlig visning; det kom ikke med i meldingen.
**8.59 Drill fullført.** Svar: a — «Ferdig» stopper drillens klokke, viser reps mot plan, neste
drill åpnes automatisk; hopp over eller bytt rekkefølge fra lista.
**8.60 Per slag.** Svar: b — påkrevd. Avstand, underlag (lie) og kølle tastes; når slaget er
tastet, går appen automatisk til neste slag. Feil rettes ved å trykke på tallet.
**8.61 Avstand.** Svar: a — spilleren taster; GPS kommer med banekartet senere.
**8.62 Etter økt og runde.** Svar: etter økt vurderer spilleren hvor tungt det var og fokus.
Etter runde: brutto score, SG og Tiger 5 med en gang; runde-agentene skal starte (rettes i
kode som egen oppgave).
**8.63 Putter.** Svar (talen sa «åtte trettiseks», tolket som 8.63): lengde i fot, break
(venstre mot høyre, høyre mot venstre, oppover, nedover), fart (kort eller lang) og hvor man
misser er påkrevd. Matcher `PuttDetail` (`breakRetning`, `slopeAlvorlighet`, `fartUtfall`,
`linjeMiss`).

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
**Treningsøkt (natt, store treffflater)**
- Før start: overskrift (hvem, hva, pyramide, AK-formel, tid) og liste over alle driller.
- Start: klokke for hele økta; første drill åpnes automatisk med detaljert beskrivelse.
- Teknisk oppgave fra individuell teknisk plan: bilde, video og tekst fra coach; spilleren kan
  legge til egen video eller bilde.
- Hver drill: egen klokke · fire tellere (Uten ball · Lav hastighet · Automatikk · Slag) med
  +1/+5 og planlagt antall · «Ferdig» stopper klokka og viser reps mot plan · neste drill åpnes
  automatisk · hopp over eller bytt rekkefølge fra lista.
- Fysisk økt: følger programmet, fyll inn vekt, endre reps og serier.
- Etter økt: tid totalt og per drill mot plan, reps mot plan, hvor tungt og fokus. Coach ser
  økta automatisk.

**Runde**
- Per slag, alt påkrevd: avstand (meter; fot på green), underlag og kølle. Straffeslag ett
  trykk, «I hull» avslutter hullet.
- Putter, påkrevd: lengde i fot, break (V→H, H→V, oppover, nedover), fart (kort/lang) og
  hvor man misser.
- Appen går automatisk til neste slag; trykk på et tall for å rette.
- GPS kommer med banekartet senere.
- Etter runden: brutto score, SG per kategori og Tiger 5 med en gang; runde-agentene starter
  (rettes i kode som egen oppgave).

**Beslutninger som skal registreres i fase 4:** live-økt med økt- og drillklokke og automatisk
neste drill · reps per læringssteg føres live · spilleren kan endre vekt, reps og serier i
fysisk økt · SG-registrering med påkrevd avstand, underlag, kølle og puttdetaljer · GPS og
banekart senere.

## 6. AgencyOS · Cockpit

### Dette fantes 28.09
- Menyen i appen (`skall-ia.ts`): Stall · Workbench · Kø · Jarvis · Meg; Cockpit gjemt under
  Meg → Konsoll. Avviker fra beslutningen (Cockpit, Innboks, Stall, Kalender, Workbench + Mer).
- App: 8 sider under Cockpit (konsoll, AK-stigen, live-tavle, Jarvis, agenter, oppgaver,
  Notion). `/admin/oppgaver` lagrer prosjekter, handlingssenter og rutiner i appen; Notion er
  bare en integrasjon (MÅLT) — i strid med regelen om Notion som eneste kilde for oppgaver.
- Design: AG-01 Hjem, AG-02 Kø, AG-03 Oppfølgingskø. Modul: Stall-matrise.
- Kode uten skjerm (MÅLT): AI-plan fra AgencyOS 0 kallere; ACWR i stallvisningen hardkodet.
- Opptak (MÅLT): `SessionRecording` + `/api/recording/*` — opptak i biter, transkripsjon
  (Deepgram), AI-analyse (teknisk, taktisk, mental, fysisk, hjemmelekse, coachanalyse, neste
  økt), Notion-side og slettefrist. Skjerm: `/admin/recording`.

### Anders forteller
- Komplett oversikt over arbeidsdagen: coachingøkter, beskjeder, videoer og spørsmål fra
  spillere i gruppene som kan besvares enkelt, arbeidsoppgaver og prosjekter, turneringer
  denne uka, snarvei til Workbench, varsel om hvem som ikke følger planen, nøkkelinformasjon.
- «Start live» starter en coachingøkt. Da kommer spillerprofilen, spillerens tekniske plan og
  opptakeren som tar opp alt og lager sammendrag.

### Spørsmål og svar
**8.64 Øverst.** Svar: kalendervisning av dagen med klokkeslett 05:00–22:00, «Start live» på
hver coachingøkt.
**8.65 Meldinger.** Svar: a — «Venter på svar» i Cockpit, kort svar i raden, hele samtalen i
Innboks.
**8.66 Oppgaver.** Svar: a — fra Notion Tasks og Prosjekter; forfalt og frist i dag; huk av i
appen; oppgavelista i appen utgår.
**8.67 Turneringer.** Svar: a — spiller, turnering, sted, dager til start; etterpå brutto
score og plassering; bare spillere i egne grupper.
**8.68 Varsel og nøkkeltall.** Svar: a — under 70 % to uker på rad, laveste først, lenke til
Spiller 360. Nøkkeltall: aktive spillere, økter gjennomført i stallen denne uka, snitt
etterlevelse, forslag som venter. Økonomi utenfor Cockpit.
**8.69 Under live coachingøkt.** Svar: a — spillerkort øverst (navn, kategori, HCP, siste
runde med SG, aktive målsetninger), teknisk plan i midten (aktive P-posisjoner, oppgaver,
bilde og video), opptak og notatfelt nederst. I tillegg: coach legger enkelt inn video og
bilde fra iPhone, og kan legge inn målbilde («malbilde» i talen, tolket som målbilde).
**8.70 Etter økta.** Svar: a — sammendraget kommer som utkast til coach, coach godkjenner, og
det går deretter rett til spilleren.
**8.71 Samtykke.** Svar: a — ja til opptak i onboarding (forelder for juniorer); uten ja er
knappen grå; spilleren ser «Opptak pågår».
**8.72 Navn i sammendraget.** Svar: a — navnet byttes ut før avskriften sendes til AI og settes
inn igjen etterpå. Sjekkes i kode som egen oppgave.

### Slik vil du ha det (bekreftet av Anders 28.09.2026, «Bereft» tolket som «bekreftet»)
- **Øverst:** tellerrad (meldinger som venter, følger ikke planen, turneringer denne uka,
  forslag som venter), deretter dagens kalender 05:00–22:00 med coaching- og gruppeøkter,
  spiller/gruppe, sted og «Start live».
- **Venter på svar:** meldinger, videoer og spørsmål fra spillere i egne grupper, nyeste først,
  kort svar i raden, hele samtalen i Innboks.
- **Oppgaver:** fra Notion Tasks og Prosjekter; forfalt og frist i dag; huk av i appen.
  Oppgavelista i appen utgår.
- **Turneringer denne uka:** spiller, turnering, sted, dager til start; etterpå brutto score og
  plassering. Bare egne grupper.
- **Følger ikke planen:** under 70 % to uker på rad, laveste først, antall uker, lenke til
  Spiller 360.
- **Nøkkeltall:** aktive spillere, økter gjennomført i stallen denne uka, snitt etterlevelse.
  Ikke økonomi.
- **Hurtigknapp** med snarvei til Workbench (som bestemt).
- **Live coachingøkt:** spillerkort (navn, kategori, HCP, siste runde med SG, aktive
  målsetninger) · teknisk plan (P-posisjoner, oppgaver, bilde, video) · legg inn video, bilde og
  målbilde fra iPhone · opptak og notater, krever samtykke fra onboarding, spilleren ser
  «Opptak pågår» · sammendrag som utkast til coach, godkjent går rett til spilleren,
  hjemmelekse inn i planen med ett trykk · navnet tas ut før tekst sendes til AI.
- **Menyen** rettes til Cockpit · Innboks · Stall · Kalender · Workbench · Mer, med Cockpit som
  startskjerm.

**Beslutninger som skal registreres i fase 4:** Cockpit som startskjerm med dagens kalender
05–22 · oppgaver kun fra Notion, oppgavelista i appen utgår · live coachingøkt med opptak,
teknisk plan og sammendrag coach godkjenner · samtykke til opptak i onboarding ·
anonymisering av navn før AI.

**Kodefunn som må bli egne oppgaver:** opptakeren er ikke koblet til «Start live»; sjekk om
avskrift og analyse sender spillernavn til eksterne tjenester.

## 7. AgencyOS · Innboks

### Dette fantes 28.09
- App (MÅLT): `/admin/kommunikasjon` har samlet innboks, utkast, sendt og maler i faner.
  E-post til post@akgolf.no tas inn (`InnboksEpost`), agent lager svarutkast, Anders sender
  selv. Egne sider: `/admin/ko` (Kø), `/admin/godkjenninger`, `/admin/queue`
  (oppfølgingskø). Jarvis-chatten `/meg` står for seg selv.
- Design: AG-02 Kø, AG-04 Innboks.
- Kode uten skjerm (MÅLT): `createPlanChangeRequest` og `coachBekreftTurneringEntry` 0 kallere.

### Anders forteller
- Én innboks som samler alt: e-post, meldinger, oppfølging, godkjenninger, spørsmål fra
  spillere osv. Der går Anders ikke glipp av noe, og der godkjenner han utkast som Jarvis og AI
  lager. «Dette skal være her jeg jobber.»

### Spørsmål og svar
**8.73 «Anna».** Svar: talefeil for «AI».
**8.74 Oppbygging.** Svar: a — én liste, filterbrikker Alle · Spillere · E-post · Godkjenn ·
Oppfølging · Varsler, det som haster først, deretter nyeste.
**8.75 Utkast.** Svar: a — utkastet åpent i raden med «Send», «Rediger», «Forkast»; ingenting
sendes uten trykk. Gjelder e-post, svar til spillere, sammendrag fra opptak, forslag fra
motoren.
**8.76 E-postkontoer.** Svar: post@akgolf.no og akgolfgroup@gmail.com.
**8.77 Ikke gå glipp av noe.** Svar: a — «Ferdig» tar saken ut av lista; ubesvart spørsmål fra
spiller etter 24 timer markeres som haster; tom innboks = alt håndtert.
**8.78 Jarvis-chatten.** Svar: b — egen side, ikke i Innboks.

### Slik vil du ha det (bekreftet av Anders 28.09.2026, «Alt her er nå bekreftet»)
- **Én innboks for alt**, der Anders jobber: e-post (post@akgolf.no og akgolfgroup@gmail.com),
  meldinger, videoer og spørsmål fra spillere, oppfølging, godkjenninger og forslag fra
  motoren, varsler om planendringer og turneringer, sammendrag fra opptak.
- **Én liste**, det som haster først, deretter nyeste. Filterbrikker: Alle · Spillere ·
  E-post · Godkjenn · Oppfølging · Varsler.
- **Utkast fra Jarvis og AI** åpne i raden med «Send», «Rediger», «Forkast». Ingenting sendes
  uten trykk.
- **Ferdig** tar saken ut av lista. Ubesvart spørsmål fra spiller etter 24 timer markeres som
  haster. Tom innboks = alt håndtert.
- **Slås sammen hit:** Kø, godkjenninger, oppfølgingskøen (kolonnene Risiko · Følg med · Sjekk ·
  Løst blir filter) og kommunikasjon. Gamle adresser sender videre.
- **Jarvis-chatten** er egen side.

**Beslutninger som skal registreres i fase 4:** én innboks for all kommunikasjon og alle
godkjenninger · to e-postkontoer inn · 24-timersgrense for spillerspørsmål · Kø, godkjenninger
og oppfølgingskø slås inn i Innboks · Jarvis-chat egen side.

## 8. AgencyOS · Stall og Spiller 360 (AG-08)

### Dette fantes 28.09
- App: 12 sider (stall, ny spiller, spillerprofil med analyse, plan, tester,
  turneringskobling, rediger; oppfølgingskø, innsikt, runder). Live-tavle
  `/admin/(fullscreen)/agencyos/live` viser pågående økter (IN_PROGRESS), ikke lenket fra stallen.
- Design: AG-07 Stall, AG-08 Spiller 360, AG-09 Spilleranalyse, AG-10 Teknisk plan, AG-22
  Innsikt og talent, AG-A01–A08. Modul: Stall-matrise, Ytelsesbilde, Kategori, Baseline.
- Kode (MÅLT): ACWR i stallvisningen hardkodet. IUP-samtalen fra WANG er gjenbrukbar.
  Melding til spiller under økt finnes ikke.

### Anders forteller
- Stallen: hvem jeg coacher i dag; liveoversikt over hvem som trener nå, med knapp for å sende
  melding under økta; hvem som følger planen og hvem som ikke gjør det; hvor lenge spillerne har
  igjen og utgående treningsplaner som må følges opp. Ba om anbefalinger.

### Spørsmål og svar
**8.79 Øverst i stallen.** Svar: a — tre bånd: I dag · Trener nå · Hele stallen.
**8.80 Melding under økta.** Svar: a — hurtigmelding eller fritekst som varsel, svar med ett
trykk fra live-økta; coach kan følge økta uten å endre.
**8.81 Hvor lenge igjen.** Svar: c — både treningsplan (hvor lenge de har plan) og
coachingavtale (klipp, fornyelse).
**8.82 Rad per spiller.** Svar: a — navn og kategori, etterlevelse 4 uker, SG-trend 30 d,
siste økt, neste turnering, grunn til oppfølging, plan slutter / avtale; de som trenger deg
først; kort på mobil; ACWR «—» til den regnes ut.
**8.83 Spiller 360.** Svar: a — spillerkort og «Dette krever deg nå» øverst; knapper Send
melding · Åpne Workbench · Start live · IUP-samtale; faner Plan · Stats · Teknisk plan · Tester
· Samtaler (IUP, opptak, notater) · Talent (radar, bare coach).

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Stall, tre bånd:** I dag (spillere du coacher i dag, klokkeslett) · Trener nå (økt i gang,
  hvilken økt og hvor langt, «Send melding») · Hele stallen.
- **Melding under økta:** hurtigmelding eller fritekst som varsel; spilleren svarer med ett
  trykk; coach kan følge repetisjonene uten å endre.
- **Rad per spiller:** navn, kategori, etterlevelse 4 uker, SG-trend 30 d, siste økt, neste
  turnering, grunn til oppfølging, plan slutter om X dager, avtale (klipp igjen, fornyes).
  De som trenger deg først. Kort på mobil, ingen sidelengs rulling. ACWR «—» til den regnes ut.
- **Spiller 360:** spillerkort og «Dette krever deg nå» · Send melding · Åpne Workbench ·
  Start live · IUP-samtale · faner Plan · Stats (samme som spilleren, PGA alltid på,
  sammenligning med stallen) · Teknisk plan · Tester · Samtaler (IUP, opptak, notater) ·
  Talent (radar, bare coach).
- **Toppidrettsmodulene her:** Stall-matrise → Hele stallen · Ytelsesbilde og Kategori A–K →
  Stats-fanen · Baseline → oppstart · talentradar → Talent-fanen.

**Beslutninger som skal registreres i fase 4:** stall i tre bånd med Trener nå · melding under
økt · plan- og avtaleutløp i stallen · Spiller 360 med IUP-samtale for alle spillere.

## 9. AgencyOS · Kalender

### Dette fantes 28.09
- App: `/admin/kalender`, ny og vis hendelse, `availability` (når du kan bookes),
  gjennomføring av økt. Google-kalender koblet begge veier (speiling inn, bookinger ut).
- Design: AG-05 Kalender. Bookinge-poster: EP-02 endret time (beslutning 27.09).

### Anders forteller
- Komplett oversikt over alle bookinger i AK Golf, fordelt på dag, uke, måned og år, og per
  coach.
- Alle faste gruppeøkter og gruppeøkter som tilbys til booking.
- Anbefalinger om hvor gruppeøkter bør settes opp for head coach og assistant coach, for å øke
  inntekten.
- Flytter jeg en økt, får spillere med PlayerHQ («Play Rage Queue» i talen) varsel; uten app
  går det e-post med endringsbekreftelse.

### Spørsmål og svar
**8.84 Gruppeøkter til booking.** Svar: alle gruppetreninger vanlige spillere kan booke
(talen sa «turneringsmodulen», tolket som bookingmodulen).
**8.85 Visning.** Svar: «viser alle coacher» — tolket som a med alle coacher synlige som
standard: dag/uke/måned/år, kolonne per coach i dagvisning, filter på coach, økt viser
initialer, tjeneste og påmeldte mot plasser. Ikke farge per coach (farge betyr akse).
**8.86 Anbefalinger.** Svar: a — forslag i Innboks bygget på fulle økter og ventelister,
spillernes ledige tid, ledig anlegg og pris × plasser; inntekt merket anslag; coach godkjenner,
økta legges ut til booking.
**8.87 Flytting.** Svar: a — varsel automatisk (push i PlayerHQ, ellers e-post EP-02), med
«Varsler X spillere · Angre» i 10 sekunder før det sendes.
**8.88 Tilgang.** Svar: a — head coach ser alt; assistant coach ser egne økter og egne
gruppeøkter.

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Alle bookinger i AK Golf:** dag/uke/måned/år, alle coacher synlige som standard med
  filter på coach, kolonne per coach i dagvisning, økt viser initialer, tjeneste og påmeldte
  mot plasser. Ikke farge per coach.
- **Gruppeøkter:** faste og alle som vanlige spillere kan booke.
- **Forslag til nye gruppeøkter** i Innboks for head coach og assistant coach, bygget på fulle
  økter og ventelister, spillernes ledige tid, ledig anlegg og pris × plasser; inntekt merket
  anslag; coach godkjenner, økta legges ut til booking.
- **Flytte økt:** automatisk varsel (push i PlayerHQ, ellers e-post EP-02) med «Varsler X
  spillere · Angre» i 10 sekunder.
- **Tilgang:** head coach ser alt; assistant coach egne økter og gruppeøkter.
- **Google-kalenderen** koblet begge veier som i dag.

**Beslutninger som skal registreres i fase 4:** samlet bookingkalender for alle coacher ·
inntektsforslag for gruppeøkter via Innboks · automatisk varsel ved flytting med angre ·
tilgang head coach / assistant coach.

## 10. AgencyOS · Workbench

### Dette fantes 28.09
- App: `/admin/plan`, maler, teknisk plan, plan-templates (ny, vis, rediger),
  `workbench/[playerId]`.
- Design: AG-11 Workbench, AG-14 Plan-hub, AG-TP, AG-WB-FYS, AG-WB-TURN, AG-16 Grupper,
  øktbygger og øvelsesredigering.
- Gjeldende beslutning: én motor (spillerens WorkbenchV2) med stall- og gruppevelger; ny uke
  kopierer forrige; ekte dra-og-slipp.
- Kode uten knapp (MÅLT): dupliser uke/økt, fjern økt, lagre periode, coachnotater, bruk mal på
  spiller, søk i tekniske oppgaver, AI-plan for 20 spillere. Ingen kan lage eller endre øvelse;
  16 godkjente, alle putting.

### Anders forteller
- Planlegge årsplan, periodisering, månedsplan, ukeplan og øktplan for individuelle spillere i
  grupper og for gruppetrening i de samme gruppene — for eksempel WANG Toppidrett Fredrikstad
  og alle GFGK-grupper.
- Er spilleren medlem, får hen gruppens økter automatisk i kalenderen sammen med den
  individuelle planen.
- Lik funksjon som spillerens Workbench, pluss enkelt bytte mellom grupper og spillere.
- Fysisk tre ganger i uka: klokkeslett, dra fra sidefeltet, slipp på tidspunkt, sett
  gjentakelse.

### Spørsmål og svar
**8.89 Gruppe og individ.** Svar: gruppeplanen arves av medlemmene (konseptet over).
**8.90 Bytte.** Svar: a — velgere Gruppe og Spiller med søk, Forrige/Neste, husker sist brukte.
**8.91 Sidefeltet.** Svar: øvelsesbank, fysisk treningsprogram, øktmaler, turneringer, ny
teknisk plan, målsetninger osv.
**8.92 Gjentakelse.** Svar: dra pyramideaksen (for eksempel FYS) ut, slipp på tidspunkt, sett
gjentakelse, legg til fysisk treningsprogram.
**8.93 Øvelser.** Svar: «+» for manuell øvelse, eller velg fra banken med filter etter valgt
pyramide. Har man valgt TEK, skal man aldri få en SPILL-øvelse.
**8.94 Pyramiden styrer.** Svar: planleggingen starter i pyramiden, og resten følger riktig
kategorisering derfra. Tolket: valgt pyramide styrer område, felt og øvelsesbank, også for egne
øvelser. **Endrer** «Pyramiden er veiledende og sperrer ikke» (beslutninger §Treningsfag).

### Slik vil du ha det (bekreftet av Anders 28.09.2026)
- **Samme Workbench som spilleren**, pluss velgere for Gruppe og Spiller med søk,
  Forrige/Neste og minne om sist brukte.
- **Alle nivåer:** årsplan, periodisering, måned, uke og økt — for enkeltspillere og for grupper
  (WANG Toppidrett Fredrikstad, alle GFGK-grupper).
- **Gruppeplanen er grunnmuren:** medlemmer får gruppeøktene automatisk i sin PlayerHQ-kalender
  sammen med den individuelle planen. Tilpasning per spiller merkes «Egen»; endring i
  gruppeplanen slår gjennom til alle som ikke har egen versjon.
- **Sidefelt:** øvelsesbank, fysisk treningsprogram, øktmaler, turneringer, ny teknisk plan,
  målsetninger.
- **Dra og slipp:** pyramideakse ut, slipp på klokkeslett, «Gjenta» (hver uke, annenhver,
  valgte dager, til dato eller ut perioden), legg til fysisk program; senere endring «bare
  denne» eller «alle framover».
- **Øvelser:** pyramiden velges først og styrer kategoriseringen videre; banken filtreres
  etter den; «+» lager egen øvelse innenfor samme kategorisering.

**Beslutninger som skal registreres i fase 4:** gruppeplan arves av medlemmene med
«Egen»-overstyring · gjentakelse ved slipp · pyramiden styrer kategorisering og øvelsesbank
(endrer §Treningsfag) · coach kan lage øvelser.

## 11. AgencyOS · Mer

### Dette fantes 28.09
- App (29 sider): booking (ny, detalj, tjenester), økonomi (`agencyos/okonomi`, Tripletex
  lesetilgang), tester (oversikt, normer, tildel, TrackMan), grupper (oversikt, per gruppe med
  årsplan, skoledata, timeplan, Workbench), oppsett (profil, ekstern, inviter, GDPR,
  revisjonslogg, feillogg), øvrig (turneringer, markedsføring, opptak, videoer, hjelp).
- Design: AG-06, AG-15, AG-16, AG-17, AG-18, AG-20, AG-21, AG-23, AG-24.
- Kode uten skjerm (MÅLT): leads lages daglig uten skjerm; `coachBekreftTurneringEntry` 0
  kallere; Stripe-kundeportal 0 kallere.

### Anders forteller
- Snarvei til ny booking, for eksempel når han skal ta en test med en spiller.
- Slå sammen så mange funksjoner som mulig (tolket: færrest mulig egne sider).
- Grupper: søke opp spillere med PlayerHQ i alle tilgjengelige grupper, hake av hvilke grupper
  de skal være med i, tildele tester, TrackMan-økter osv.
- Økonomioversikt: «Står jeg bare til booking av grupper» — uklart, spørres om.
- Turneringspåmeldinger trenger ikke bekreftes; coach vil bare ha turneringsoversikten per
  spiller.

### Spørsmål og svar
**8.95 Struktur.** Svar: a — Booking · Grupper · Tester · Økonomi · Oppsett; turneringer til
Workbench og Plan, videoer og opptak til Spiller 360 → Samtaler, oppgaver til Notion,
markedsføring til Oppsett.
**8.96 Ny booking.** Svar: a — i hurtigknappen og øverst i Mer; spiller → tjeneste → tid →
bekreft; test-tjeneste tildeler testen automatisk.
**8.97 Grupper.** Svar: søk opp spillere med PlayerHQ, hak av gruppene de skal være med i,
tildel tester og TrackMan-økter fra gruppen.
**8.98 Leads.** Svar: a — i Innboks under Oppfølging, med utkast fra Jarvis.
**8.99 Turneringspåmeldinger.** Svar: ingen bekreftelse. Coach ser turneringsoversikten per
spiller.
**8.100 Økonomi.** Svar: coach legger inn budsjett, laster opp Tripletex-eksport hver
måned, og appen leser betalingsinformasjon fra Stripe.
**8.101 Resten.** Svar: ja til 8.95, 8.96 og 8.98.

### Slik vil du ha det (bekreftet av Anders 28.09.2026, svar «Ja, kjøre neste fase»)
- **Mer, fem punkter:** Booking · Grupper · Tester · Økonomi · Oppsett.
- **Booking:** «Ny booking» øverst og i hurtigknappen; spiller → tjeneste → tid → bekreft;
  test-tjeneste tildeler testen automatisk; tjenester og priser.
- **Grupper:** søk opp spillere med PlayerHQ, hak av gruppene; tildel tester og TrackMan-økter
  til gruppa; medlemmer, timeplan, skoledata. Gruppeplanen ligger i Workbench.
- **Tester:** tildel, normer, TrackMan-økter.
- **Økonomi:** budsjett legges inn, Tripletex-eksport lastes opp hver måned, Stripe leses for
  betalinger. Tall fra kilden, aldri anslått.
- **Oppsett:** profil, team og invitasjoner, GDPR, logger, markedsføring, hjelp.
- **Flyttes ut:** turneringer → Workbench og Plan · videoer og opptak → Spiller 360 → Samtaler ·
  oppgaver → Notion.
- **Leads** i Innboks under Oppfølging med utkast fra Jarvis.
- **Turneringspåmeldinger** bekreftes ikke; turneringsoversikt per spiller i Spiller 360.

**Beslutninger som skal registreres i fase 4:** Mer med fem punkter · økonomi fra budsjett,
Tripletex-eksport og Stripe · leads i Innboks · ingen bekreftelse av turneringspåmelding.

## Fase 3

Mulighetskartet: [mulighetskart-playerhq-agencyos-2026-09-28.md](mulighetskart-playerhq-agencyos-2026-09-28.md).

## Fase 4 — bestillinger til Precision Athletics

Bestillingene ligger i `~/ak-brain/claude-code/prompter/precision-runde19-bestilling.txt` til
`precision-runde30-bestilling.txt`: 19 felles struktur · 20 I dag · 21 Plan · 22 Stats · 23 Meg og
oppstart · 24 Live-økt og runde · 25 Cockpit · 26 Innboks · 27 Stall og Spiller 360 ·
28 Kalender · 29 Workbench · 30 Mer.

| Runde | Sendt | Designets melding (rapportert, ikke målt av Claude Code) |
|---|---|---|
| 19 | 28.09 | Ny meny i begge skall, felles hurtigknapp og bjelle, ny oversikt. Audit 3 080 tilfeller, 0 avvik. Sju uavklarte punkter til Anders i `oversikt.html`. |
| 20 | 28.09 | PH-01 tegnet på nytt, PH-02 slått sammen med PH-01. Audit 80 tilfeller, 0 avvik. Nytt spørsmål til Anders: teller «Neste turnering» bare konkurranser (treningsturneringer søndag regnes som økt)? |
| 21 | 28.09 | PH-10 Plan i fire zoomnivåer (År · Måned · Uke · Dag, mobil åpner i Uke), «Rediger» åpner Workbench (PH-11), fysisk og turneringer er lag i Plan. Audit 160 tilfeller, 0 avvik. Uavklart: registrering av sett for fysisk må inn i PH-04 (egen skjerm borte) · kontrast på sandtonene for Ferie og Restitusjon · lettere uke «14,5 → 11,5 t» er ikke merket ESTIMAT og utregningen må bekreftes. |
| 22 | 28.09 | Stats med fire deler (Snittscore · Strokes Gained · Trening · Tester), PH-A-sidene slått inn. Audit 480 tilfeller, 0 avvik (rundearkets SG per kategori lagt inn etter audit, ikke kjørt). Uavklart: SG per kategori i rundearket er en fast fordeling av totalen · SG mot PGA i rundelista er utregnet, ikke ekte PGA-tall · normene for Kategori C og PGA-snittet for nærhet er oppdiktet · Tiger 5-ordlyden («Bogey fra innenfor 130 m», «Bom på enkel opp-og-ned») er designets forslag · hvilke anonymiserte grupper spilleren kan sammenligne med. **Anders 28.09:** Tiger 5-ordlyden er riktig; sammenligning mot anonymiserte snitt fjernes for nå (rettes foran runde 23). |
| 31 | 28.09 | Ekstra runde fra grillingen runde 9: deling med WANG og Team Norway, fireukerssjekk, IUP i Spiller 360 (`precision-runde31-bestilling.txt`). Ny PH-27 Meg › Deling, PH-27-U16, FO-05, AG-08-IUP, fireukerssjekk i I dag. Audit 340 + 80 tilfeller, 0 avvik etter retting av rust på Deling. Uavklart: utviklingssjekkens spørsmål var diktet av designet (TN-arkets ordlyd lagt inn som `kildemateriale/utviklingssjekk-tn-2025.md`, rettes i runde 23) · landslagsnivå og Kategori C-normer er oppdiktet · delingslenken gjelder 7 dager (designets antakelse, venter på Anders). |
| 23 | 28.09 | Meg (PH-24) i tolv seksjoner, fasilitetsskjema, oppstart AU-04. Rettet: sammenligning mot anonymiserte snitt fjernet, oppdiktede tall merket ESTIMAT, fireukerssjekken bruker TN-arkets ordlyd (Junior, 41 spørsmål). Audit målte bare første steg i AU-04 (rettes i runde 24). Uavklart: fasilitetsspørsmålene og koblingen til treningsområdene er designets forslag · 41 spørsmål hver fjerde uke (avklart 28.09: alle 41, bare for WANG- og Team Norway-spillere) · «Konkurransespilleren» som anbefaling for C–E er designets antakelse · delingslenkens varighet. |
| 24 | 28.09 | Live-økt (PH-04/05 med fire tellere, PH-06 fysisk økt med kilo, reps og serier, PH-07 etter økt), live runde og putt (PH-RD-03/04/08). AU-04 delt i sju sider. Audit 140 (oppstart) + 280 (live) tilfeller, 0 avvik. Avklart 28.09: «Hvor bommet du?» Venstre · Høyre · På linja holder · skalaene hvor tungt og fokus (avklart 28.09: fysisk «Hvor tungt» 1–10; golføkt belastning 1–10 og fokus 1–10, rettes i runde 26). |
| 25 | 28.09 | Cockpit (AG-01), Live coachingøkt (AG-13), øktark etter live (AG-12), varianter uten fireukerssjekk for vanlig AK-spiller (PH-01-AK, AG-08-IUP-AK). Audit 220 tilfeller, 0 avvik. Uavklart: AG-12 tolket som øktarket etter live-økta (Anders usikker 28.09, står åpent) · «Følger ikke planen»: to uker holder, med lenke til hele planen (Anders 28.09). |
| 26 | 28.09 | Innboks (AG-04, AG-04-OPP) med filter og Oppfølging; AG-02 og AG-03 utgår. Skalaene etter økt rettet (PH-07, PH-07-FYS). Audit 200 tilfeller, 0 avvik. Avvik fra beslutning: Risiko-saker ble merket «Haster» (rettes i runde 27). Uavklart: hvordan «Svar» skrives på en sak uten utkast. |
| 27 | 28.09 | Stall (AG-07) i tre bånd og Spiller 360 (AG-08) med fanene Plan · Stats · Teknisk plan · Tester, IUP og Samtaler · Talent; AG-09 og AG-22 utgår. Rettet: nivå Ung etter fødselsår (PH-01-UNG), «Følger ikke planen» åpner AG-08-PLAN, bare ubesvart over 24 t er «Haster». Avbrutt underveis, gjenopptatt. Audit 300 tilfeller, 0 avvik. Egen måling: AG-07 i 390/768/1280 × fire tilstander og AG-08 i 390, ingen sidelengs rulling. Kvalitetskontroll: to «← Stall» og navnet to ganger i AG-08, hurtigknappen dekker en lenke på 390, SG-tallet i parentes og kurvene i Stall mangler forklaring, bjelletallet er rust. Uavklart fra designet: stall-matrisen er tolket fra Toppidrett-modulene · stiplet Kategori C-linje på talentradaren · hurtigmeldingene og svarknappene (OK, Spørsmål, Ikke nå) er designets forslag. |
| 28 | 28.09 | Kalender (AG-05) i dag · uke · måned · år, kolonne per coach, forslag til gruppeøkt (B1) i kalender og Innboks, flytting med «Varsler X spillere · Angre», Google begge veier, treningssamling, variant for assistant coach (AG-05-ASS). Rettingene a–k og kvalitetsfunnene fra runde 27 lagt inn; ny PH-15-TN med TN-poengskala. Audit 480 tilfeller, 0 avvik. Egen måling: AG-05 i 390 og 1680, ingen sidelengs rulling. Kvalitetskontroll: Nærspill Gate og VISA Express tegnet med 10 slag og knapper 0–5 (arket har 9 slag og fritt tall), «SE» i forslagsbanneret er kuttet på 390, KA- og EM-kolonnene er tomme, «Synket» og nålinjen viser ulik tid. Uavklart for Anders: designet tolker «høyst én rust, ingen unntak» slik at en slettedialog ikke kan ha rust når bjella er rust. |
| 29 | 28.09 | Workbench: felles for spiller (PH-11) og coach (AG-11) med velger for spiller og gruppe, nivåene År · Periode · Måned · Uke · Økt, gruppeplan som grunnmur med «Egen», gjentakelse ved slipp, sidefelt, målsetninger (PH-19 åpner Workbench), treningssamling, B4 merket «Skjult ved lansering». Varianter AG-11-GRUPPE, -AR, -OKT, -MAL, -FYS og PH-11-MAL. Kvalitetsfunnene fra runde 28 rettet (9 slag og fritt tall i Gate-testene, «Se forslag», økter i alle coachkolonner, samme klokkeslett). Audit 360 tilfeller, 0 avvik. Egen måling: AG-11 i 390 og 1680, ingen sidelengs rulling. Kvalitetskontroll: AK-formel v2 i Workbench er feil (egne 19 områder, «Full fart», «Simulator», tre press-nivåer) — rettet mot `src/lib/domain/ak-formel-v2.ts` i runde 30; på 390 står Forrige/Neste splittet, fem knapperader før kalenderen, og søndag mangler i dagraden. |
| 30 | 28.09 | Mer (AG-06, AG-15, AG-16, AG-20, AG-23, AG-24; AG-17, AG-18 utgår), med kvalitetsfunnene fra runde 29 øverst. — (kjører) |
