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
| 1 | PlayerHQ · I dag | ja | ja, 28.09 | — |
| 2 | PlayerHQ · Planlegging | ja | ja, 28.09 | — |
| 3 | PlayerHQ · Stats / Analyse (med toppidrettsmodulene) | ja | ja, 28.09 | — |
| 4 | PlayerHQ · Meg | ja | ja, 28.09 | — |
| 5 | PlayerHQ · Live-økt og registrering | pågår | — | — |
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
  osv.). Viser hvilke av de 17 treningsområdene fasiliteten dekker, og hva som mangler.
- **Min coach:** hvem, avtale, videoer, tilbakemeldinger. Meldinger i innboksen bak bjella.
- **Venner og utfordringer** under Meg.
- **Målsetninger** (nytt navn på mål): i Workbench, bytter ut kalenderen i midtfeltet. Start,
  slutt, resultat- eller prosessmål, knyttet til år/periode/måned/uke/økt, målbar på alle
  parametere i plattformen, fremdrift automatisk fra plan, Stats, tester og runder.
- **Turneringsresultater:** nytt steg i onboarding «Finn deg i turneringsresultatene» (AK
  pipelines, golf-ID eller navn + fødselsår, mellomnavn ignoreres), kan hoppes over og tas fra
  profilen. Resultatene vises i Stats → Snittscore.
- **Sammenligning:** spilleren kan alltid sammenligne snittscoren mot anonymiserte snitt i AK
  Golf pipelines. Bare coach sammenligner med andre spillere i gruppene.
- **Talentradaren** (coachens vurdering 1–10) ser bare coach, aldri spiller.
- **Senere:** eksport og utskrift av årsplan.
- **Fjernes fra PlayerHQ:** talent «Min plan» og roadmap (dekkes av Plan), ukesdigest (blir
  melding i innboksen), «Utenfor banen».

**Beslutninger som skal registreres i fase 4:** Mål heter Målsetning · målsetninger i
Workbench med start, slutt og type · fasilitetsskjema med mål og dekning · turneringskobling i
onboarding · talentradar bare for coach · sammenligning med andre spillere bare for coach
(bekrefter gjeldende regel), snittscore mot anonymiserte pipelines-snitt for spiller ·
talent-, ukesdigest- og «Utenfor banen»-sidene utgår.
