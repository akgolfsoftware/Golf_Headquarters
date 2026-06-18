# Design-kø — PlayerHQ

> **Kilde:** 61-DEKNINGSMATRISE.md — kun TRENGER-DESIGN-ruter (ikke NY-HYBRID, ikke RE-SKIN, ikke UTSATT).
> **Produkt:** PlayerHQ (`/portal`) — lyst tema, mobil-først (430px), cream-grunn, lime som accent.
> **Demo-navn:** spiller = Øyvind Rohjan (HCP 4,2, GRATIS/PRO), coach = Anders Kristiansen.
> **Regler for alle prompts:** bygg fra tokens.css/kit, lime låst (#D1F843), ingen døde knapper, alle tilstander (innhold/tomt/laster/feil), still spørsmål.

---

## Sammendrag

- **Totalt:** 13 batcher, 104 skjermer
- **P1 (lanseringskritisk, før 1. juli):** 9 batcher, 68 skjermer
- **V2 (etter lansering):** 4 batcher, 36 skjermer

---

## Batch-liste

| # | Tittel | Prior. | Skjermer | Nøkkelkomp. |
|---|---|---|---|---|
| B0 | Økt-gjennomføring (tren-flyt) | P1 | 5 | PlanBuilderShell, LiveRepPulse, GoalProgress, ChallengeCard, BadgeShelf |
| B1 | Ny økt + kalender | P1 | 6 | PlanBuilderShell, KanbanBoard, YearPlanGantt, MonthGrid, WeekGrid |
| B1b | Test-gjennomføring + tester-katalog + turneringer | P1 | 8 | TestMatrix, LiveRepPulse, GoalProgress, PersonalBest, GalleryView, EventTimeline |
| B2 | Mål-hub + bygger + fremgang | P1 | 5 | GoalProgress, BadgeShelf, LevelLadder, DataTable Pro, PersonalBest |
| B3 | Teknisk plan + FYS-plan | P1 | 4 | KanbanBoard, GoalProgress, TestMatrix, DataTable Pro |
| B4 | Analysere-undersider + statistikk-dybde | P1 | 10 | SgBreakdown, SgBar, TrendBand, PercentileGauge, CompareH2H, HoleStrip, DispersionMap, ShareCard |
| B4b | SG-hub rest + TrackMan-detalj + statistikk-hub + baner | P1 | 9 | ClubMetricGrid, DispersionMap, TrendBand, GappingChart, DataTable Pro, GalleryView |
| B5 | Coach-seksjonen | P1 | 11 | InboxList, MessageThread, GalleryView, KanbanBoard, PeriodTimeline, InsightCard Pro |
| B5b | Meg-innstillinger rest + coach/ai | P1 | 4 | SettingsList, InsightCard Pro |
| B6 | Booking-detaljer | V2 | 5 | DetailHero, ItineraryRow, GalleryView, SessionScheduler |
| B7 | Meg-undersider: abonnement + bookinger + helse | V2 | 10 | PhotoHero, HubCard, DataTable Pro, ItineraryRow, WellnessCard |
| B8 | Meg-undersider: innstillinger + sikkerhet + hjelp | V2 | 14 | SettingsList, DataTable Pro, DetailHero |
| B9 | Utfordringer + AI-assistenter + øvrige | V2 | 7 | ChallengeCard, GalleryView, GoalProgress, InsightCard Pro, DispersionMap |

---

## Claude Design-prompter

### B0 — Økt-gjennomføring / tren-flyt (P1 — lanseringskritisk)

```
Du er Claude Design. Du skal designe 5 skjermer for økt-gjennomføring i PlayerHQ, AK Golf HQ.
Disse skjermene er P1 — lanseringskritiske.

**Produkt:** PlayerHQ — lyst tema (cream #FAFAF7), mobil-først (430px bredde), lime #D1F843 som eneste signal-accent.
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, abonnement PRO. Coach = Anders Kristiansen.

---

**SKJERMER (5 stk):**

1. `/portal/tren/[sessionId]` — Aktiv treningsøkt (økt-hub)
   - Viser: økt-tittel og dato, liste over drills i planen (ChallengeCard per drill), fremdrift (GoalProgress — X av Y drills gjort), «Start drill»-knapp (lime CTA), «Avslutt økt»-knapp (destructive, bak bekreftelse)
   - Primær-flyt: se økt → trykk «Start drill» → gjennomfør → neste (≤2 trykk per steg)
   - Tilstander: ikke startet (alle drills grå), pågår (aktiv drill lyser lime), fullført (alle grønne → feiring)

2. `/portal/tren/[sessionId]/planlagt` — Planlagt økt (forhåndsvisning FØR start)
   - Viser: økt-tittel, coach-notat (InsightCard), drill-liste (lesemodus, ikke interaktiv), varighet-estimat, «Start økt»-knapp (lime CTA), «Utsett»-knapp
   - Primær-flyt: les planen → trykk «Start økt» (≤2 trykk)
   - Tilstander: planlagt (grå), «i dag»-fremhevet (lime eyebrow), passert frist (warn-badge)

3. `/portal/tren/feiring/[planId]` — Feiring etter fullført plan/periode
   - Viser: stor gratulasjon («Periode fullført!» / «Plan fullført!»), BadgeShelf (opptjente badges), GoalProgress (plan-fremgang oppdatert til 100 %), PersonalBest hvis rekord slått, «Se neste periode»-knapp + «Tilbake til hjem»-knapp
   - Primær-flyt: opplev feiring → klikk «Se neste periode» (1 trykk)
   - Stil: rolig premium-feiring — lime-glimt, ingen konfetti, ikke barnslig

4. `/portal/(fullscreen)/test/[testId]/live` — Test pågår (fullskjerm)
   - Viser: test-navn øverst, aktiv testøvelse (stor, tydelig), rep-teller (LiveRepPulse — stor mono-skrift), «Logg resultat»-knapp (lime CTA), «Pause»-knapp, framdrifts-indikator (testøvelse X av Y)
   - Primær-flyt: start testøvelse → logg resultat → neste øvelse (≤2 trykk per steg)
   - Tilstander: aktiv (lime-puls), pausert (nedtonet), avsluttet (→ redirect til summary)
   - NB: FYS-resultater er alltid plassholder — ikke hardkod referanseverdier

5. `/portal/(fullscreen)/test/[testId]/summary` — Testsammendrag (fullskjerm)
   - Viser: test-navn, alle resultater (TestMatrix med plassholder-tall per testøvelse), delta vs forrige test (TrendBand mini), PersonalBest hvis rekord, «Del med coach»-knapp, «Tilbake»-knapp
   - Primær-flyt: se resultater → del med coach (≤2 trykk)
   - Tilstander: med data (plassholder), uten sammenligning (første gang)
   - NB: FYS-resultatformelen er ikke låst — vis alltid plassholder, aldri hardkodede referanseverdier

---

**KIT-KOMPONENTER:**
- ChallengeCard (drill-kort i økt-listen)
- GoalProgress (økt-fremgang, plan-fremgang)
- LiveRepPulse (rep-teller i live-test)
- InsightCard (coach-notat i planlagt økt)
- PersonalBest (feiring ved rekord)
- BadgeShelf (opptjente badges i feiring)
- TestMatrix (testresultater i summary)
- TrendBand (delta vs forrige test)
- Button, EmptyState, Badge

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål som mulig — ikke anta.
2. Ikke overstyr Workbench — feiring-siden er «etter», ikke Workbench selv.
3. Ingen døde knapper — hver knapp har destinasjon, alle kjernehandlinger ≤2 trykk.
4. FYS-resultater er alltid plassholder — aldri hardkod referanseverdier.
5. Alle tilstander: innhold · tomt · laster · feil.

Design oppå komponentene i kit-et. Norsk bokmål. Ingen emoji.

**SPØRSMÅL CLAUDE DESIGN BØR STILLE:**
- Feiring-siden: vises den kun etter siste periode, eller også etter én enkelt planlagt økt?
- Testsammendrag: skal dette alltid være fullskjerm, eller kan det vises som modal/sheet etter testen?
- Live-test: skal timingen vises (stoppeklokke), eller er det kun rep/resultater som logges?
```

---

### B1 — Ny økt + kalender (P1)

```
Du er Claude Design. Du skal designe 6 skjermer for PlayerHQ i AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema (cream #FAFAF7), mobil-først (430px bredde), lime #D1F843 som eneste signal-accent.
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, abonnement PRO.

---

**SKJERMER (6 stk):**

1. `/portal/ny-okt` — «Bygg din økt» (kun PRO)
   - Viser: mal-bibliotek (grid), bygg-flate med drag/slipp av drill-blokker, økt-sammendrag (varighet, fokus, antall drills)
   - Primær-flyt: velg mal eller start blank → legg til drills fra bibliotek → lagre økt (≤2 trykk)
   - Tilstander: tom (ingen drills lagt til ennå), bygger (drills i listen), ferdig (lagre-knapp aktiv)

2. `/portal/onskeligokt` — «Be om økt fra coach»
   - Viser: tekstfelt for ønske, velg fokusområde (chips), velg foretrukket tidspunkt, send-knapp
   - Primær-flyt: fyll inn ønske → send til coach (≤2 trykk)
   - Tilstander: tom (ingenting fylt inn), utfylt (klar til send)

3. `/portal/onskeligokt/bekreftet` — Bekreftelsesside etter sendt forespørsel
   - Viser: bekreftelse-kort («Forespørselen er sendt til Anders Kristiansen»), estimert responstid, «Tilbake»-knapp
   - Primær-flyt: leses → tilbake til Gjennomføre

4. `/portal/kalender` — Årskalender (spiller)
   - Viser: 12-måneders Gantt/rutenett med fargekodede trenings-perioder, turneringer og tester markert
   - Primær-flyt: se oversikt → klikk måned for uke-zoom (≤2 trykk)
   - Tilstander: fylt (perioder/hendelser), tomt (ny bruker, ingen plan)

5. `/portal/tren/kalender` — Ukekalender (trening)
   - Viser: 7-dagers uke med planlagte og gjennomførte økter per dag (HeatmapCalendar + WeekGrid), streak-teller
   - Primær-flyt: se uka → klikk økt for detalj (≤2 trykk)
   - Tilstander: med aktivitet (farget), uten aktivitet (grå/tom)

6. `/portal/(fullscreen)/tren` — Fullskjerm-workbench (trenings-flate)
   - Viser: aktiv økt i fullskjerm (drill-liste, rep-teller, «Neste drill»-knapp, avslutt-knapp)
   - Primær-flyt: start drill → logg rep → neste drill (≤2 trykk per steg)
   - Tilstander: aktiv økt, pausert, avsluttet

---

**KIT-KOMPONENTER SOM BRUKES:**
- PlanBuilderShell (NY — bygge-flate for økt)
- KanbanBoard (drill-blokker i bygg-flaten)
- YearPlanGantt (årskalender, 12 måneder)
- MonthGrid (måneds-visning)
- WeekGrid + HeatmapCalendar (ukekalender)
- StreakTracker (streak-teller i ukekalender)
- GoalProgress (steg-indikator)
- ActionList, Button, EmptyState

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål som mulig — ikke anta.
2. Ikke overstyr Workbench (PlanBuilderShell er visuelt skinn, ikke funksjonell Workbench).
3. Ingen døde knapper — hver knapp har destinasjon, alle kjernehandlinger ≤2 trykk.
4. Rike, data-drevne komponenter — mono-tall, lime som «du leverte».
5. Alle tilstander: innhold · tomt · laster · feil.

Design oppå komponentene i kit-et. Norsk bokmål. Ingen emoji.

**SPØRSMÅL CLAUDE DESIGN BØR STILLE:**
- Skal `/portal/kalender` og `/portal/tren/kalender` ha felles shell eller ulike layout?
- Skal «By om økt»-flyten gå gjennom booking-systemet eller er det en enkel meldingsforespørsel?
- Hvilke fokusområder skal chipsen i Ønsket økt vise (Putting/Driver/Jern/Kort spill/Mental)?
```

---

### B1b — Test-gjennomføring + tester-katalog + turneringer (P1)

```
Du er Claude Design. Du skal designe 8 skjermer for testing og turneringer i PlayerHQ, AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema (cream #FAFAF7), mobil-først (430px), lime #D1F843 som eneste accent.
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, PRO. Coach = Anders Kristiansen.

---

**SKJERMER (8 stk):**

**A — Tester-katalog og ny test:**

1. `/portal/tren/tester/katalog` — Testkatalog (alle tilgjengelige tester)
   - Viser: GalleryView med tilgjengelige FYS- og ferdighetstester (navn, kategori-chip, estimert varighet, «Du har tatt denne X ganger»-badge), filter-chips per kategori (FYS / Putting / Driver / Jern osv.), «Ny egendefinert test»-knapp
   - Primær-flyt: se katalog → filtrer → klikk test → start (≤2 trykk)
   - Tilstander: med tester, laster (skeleton), tom

2. `/portal/tren/tester/ny` — Opprett ny test fra katalog (wizard steg 1–2)
   - Viser: steg 1: velg test fra katalog (forhåndsutfylt ved klikk fra katalog), steg 2: velg dato/tid + noter mål, «Start test nå»-knapp / «Planlegg»-knapp
   - Primær-flyt: bekrefter test-valg → start (≤2 trykk)
   - Tilstander: utfylt (klar til start), ufylt (blokkert «Start»-knapp)

3. `/portal/tren/tester/ny/egen` — Opprett egendefinert test (wizard)
   - Viser: 3-stegs wizard: 1: navn + kategori, 2: legg til testøvelser (søk + legg til), 3: sett mål per øvelse. «Lagre og start»-knapp
   - Primær-flyt: fyll navn → legg til øvelser → start (≤3 trykk)
   - Tilstander: hvert steg fylt/ufylt, kan lagre som mal

**B — Turneringer (spiller):**

4. `/portal/tren/turneringer/[id]` — Turneringsdetalj (spillervisning)
   - Viser: turneringens navn, dato, bane, format (medalje/stableford), deltakere fra samme coaching-gruppe, coach-notat (InsightCard — «Fokus for denne turneringen»), ditt mål (GoalProgress), resultater etter turneringen (DataTable, brutto score — aldri netto, aldri klasser som ender på «N»)
   - Primær-flyt: se detaljer → se resultater (lesemodus, 1 trykk)
   - Tilstander: kommende (ingen resultater), pågår (live-status-badge), ferdig (resultater synlig)

5. `/portal/tren/turneringer/ny` — Meld på / registrer turnering
   - Viser: søk etter turnering (navn/dato/bane), velg format, bekreft påmelding, valgfri «Notat til coach»-melding
   - Primær-flyt: søk → velg → meld på (≤3 trykk)
   - Tilstander: søker, valgt (klar til påmelding), bekreftet (redirect til detalj)

**C — SG-hub-undersider (spillervisning av coach-data):**

6. `/portal/mal/sg-hub/coach/[spillerId]` — Coach-komparativ SG-hub (se din coach sine all-time data)
   - NB: Øyvind Rohjan kan sammenligne seg mot coachens historiske SG-data for inspirasjon/kontekst.
   - Viser: CompareH2H (Øyvind vs Anders Kristiansen per SG-kategori), TrendBand (begge spillere over tid), InsightCard («Hva du jobber mot»)
   - Primær-flyt: velg SG-kategori → se sammenligning (≤2 trykk)

7. `/portal/mal/sg-hub/coach/[spillerId]/[club]` — Coach-data per kølle
   - Viser: CoachCompareGrid (spillerens vs coachens distanse/SG per kølle), GappingChart (begge)
   - Primær-flyt: velg kølle (chips) → se data (1 trykk)

8. `/portal/mal/sg-hub/coach/[spillerId]/equipment` — Coach-equipment-sammenligning
   - Viser: GappingChart (spillers bag vs coachens bag), InsightCard («Anbefalinger fra coach basert på gap-analyse»)
   - Primær-flyt: se gap → les innsikt (lesemodus)

---

**KIT-KOMPONENTER:**
- GalleryView (testkatalog, turneringslist)
- GoalProgress (steg-wizard, turnerings-mål)
- TestMatrix (testøvelser i ny/egen-wizard)
- PersonalBest (rekord ved testgjennomføring)
- DataTable Pro (turneringsresultater — brutto alltid)
- EventTimeline (turneringskalender)
- CompareH2H (coach-sammenligning)
- GappingChart, ClubMetricGrid
- InsightCard Pro, Button, EmptyState, Badge

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper.
4. FYS-resultater: alltid plassholder, aldri hardkodede referanseverdier.
5. Turneringsresultater: alltid BRUTTO score — aldri netto, aldri klasser som ender på «N».

Design oppå kit-komponentene. Norsk bokmål.

**SPØRSMÅL:**
- Coach-SG-hub (rute 6–8): er dette en faktisk funksjon, eller er coach-ruten mer en «rol model»-visning? Trenger avklaring på om Øyvind faktisk ser Anders' SG-tall, eller om det er anonymiserte «pro-referanser».
- Turneringer: kan spilleren melde seg på hvilken som helst turnering, eller kun turneringer coach har lagt inn?
- Egendefinert test: kan testen lagres som mal og deles med andre spillere?
```

---

### B2 — Mål-hub + bygger + fremgang (P1)

```
Du er Claude Design. Du skal designe 5 skjermer for PlayerHQ i AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema (cream #FAFAF7), mobil-først (430px), lime #D1F843 som eneste accent.
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, PRO.

---

**SKJERMER (5 stk):**

1. `/portal/mal` — Mål-hub (oversikt)
   - Viser: aktive mål (liste med GoalProgress per mål), siste milepæl oppnådd, «Nytt mål»-knapp
   - Primær-flyt: se mål-oversikt → klikk mål for detalj (≤2 trykk)
   - Tilstander: med mål, uten mål (tom → oppfordring til å sette første mål)

2. `/portal/mal/bygger` — Mål-bygger (wizard)
   - Viser: 3-stegs wizard (1: velg måltype, 2: sett konkret tall/dato, 3: knytt til plan/drills)
   - Primær-flyt: velg type → fyll inn → lagre mål (≤3 trykk, GoalProgress som steg-indikator)
   - Tilstander: hvert steg fylt/ufylt, lagre-knapp aktiv når alle felt er OK

3. `/portal/mal/goal/[id]` — Mål-detalj
   - Viser: mål-tittel, GoalProgress (animert), milepæl-tidslinje, tilknyttede drills, «Rediger»-knapp
   - Primær-flyt: se fremgang → klikk milepæl for detalj (≤2 trykk)
   - Tilstander: på sporet (grønt), bak (gult/oransje), oppnådd (lime-puls + PersonalBest)

4. `/portal/mal/milepaeler` — Milepæl-oversikt
   - Viser: BadgeShelf (oppnådde milepæler), neste milepæl (fremhevet med lime), historikk-liste
   - Primær-flyt: se hva som er oppnådd → se hva som er neste (lesemodus, 1 trykk)
   - Tilstander: med milepæler, uten (ny bruker)

5. `/portal/mal/leaderboard` — Rangering vs. kohort
   - Viser: DataTable Pro med spillere rangert på mål-oppnåelse, din rad fremhevet, «Sammenlign»-knapp
   - Primær-flyt: se din plassering → klikk spiller for sammenligning (≤2 trykk)
   - Tilstander: med data, laster (skeleton), tom

---

**KIT-KOMPONENTER:**
- HubCard (mål-oversikt)
- GoalProgress (animert fremgang)
- JourneyMap (milepæl-reise)
- BadgeShelf (oppnådd milepæler)
- LevelLadder (A–K nivå-stige, viser «du er her»)
- DataTable Pro (leaderboard)
- PersonalBest (ved oppnådd mål)
- GapToNext (hva som trengs for neste nivå)
- Button, EmptyState, ActionList

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål som mulig — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper — alle ≤2 trykk.
4. Data-drevne, gamifiserte komponenter — elite-følelse, aldri barnslig.
5. Alle tilstander: innhold · tomt · laster · feil.

Design oppå komponentene i kit-et. Norsk bokmål.

**SPØRSMÅL:**
- Mål-typer i bygger: HCP-reduksjon, snittscore, SG-kategori, putte-gjennomsnitt — er det listen?
- LevelLadder (A–K) — vises på mål-hub eller kun mål-detalj?
- Er leaderboard kun for spillere i samme coaching-gruppe (Øyvind ser bare sitt team)?
```

---

### B3 — Teknisk plan + FYS-plan (P1)

```
Du er Claude Design. Du skal designe 4 skjermer for PlayerHQ i AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent.
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, PRO.

---

**SKJERMER (4 stk):**

1. `/portal/tren/teknisk-plan` — Teknisk plan (hub)
   - Viser: liste over tekniske planer (f.eks. «Forbedre driver-sving», «Fikse putting-setup»), status per plan (aktiv/fullført/pause), GoalProgress per plan
   - Primær-flyt: se planer → klikk plan for detalj (≤2 trykk)
   - Tilstander: med planer, uten planer (»Coach har ikke laget teknisk plan ennå»)

2. `/portal/tren/teknisk-plan/[planId]` — Teknisk plan-detalj
   - Viser: plan-tittel, coach-notat/hensikt, KanbanBoard (oppgaver per status: Å gjøre / I gang / Gjort), InsightCard Pro (AI-sammendrag av fremgang), ChallengeCard (aktiv drill)
   - Primær-flyt: se plan → klikk oppgave → utfør drill (≤2 trykk)
   - Tilstander: aktiv (oppgaver i gang), ingen oppgaver (coach har ikke lagt til ennå), fullført (alle grønne)

3. `/portal/tren/fys-plan` — FYS-plan (hub)
   - Viser: FYS-score (plassholder-tall — formelen er IKKE låst), aktive FYS-planer, MasteryRing per område (styrke/mobilitet/utholdenhet/spenst), «Ny test»-knapp
   - NB: FYS-tall er alltid plassholder — aldri hardkod referanseverdier.
   - Primær-flyt: se FYS-status → klikk plan for detalj (≤2 trykk)
   - Tilstander: med plan, uten plan

4. `/portal/tren/fys-plan/[planId]` — FYS-plan-detalj
   - Viser: plan-navn, TestMatrix (oversikt over FYS-tester med plassholder-resultater), GoalProgress per test-kategori, øvelse-liste med DataTable Pro
   - Primær-flyt: se test-resultater → klikk test for historikk (≤2 trykk)
   - Tilstander: med testdata, uten testdata («Ingen tester gjennomført ennå»)

---

**KIT-KOMPONENTER:**
- KanbanBoard (oppgaver per status)
- GoalProgress (plan-fremgang)
- InsightCard Pro (AI-innsikt)
- ChallengeCard (aktiv drill)
- TestMatrix (FYS-testresultater — plassholder)
- MasteryRing (FYS-score per område)
- DataTable Pro (øvelse-liste)
- EmptyState, Button, ActionList

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench — teknisk plan er spiller-visningen av det coach setter opp.
3. Ingen døde knapper.
4. Data-drevne, elite-gamification.
5. Alle tilstander.

FYS-tall er alltid plassholder. Design oppå kit-komponentene. Norsk bokmål.

**SPØRSMÅL:**
- Er teknisk plan alltid coach-laget, eller kan spilleren opprette egne?
- FYS-plan: er dette knyttet til Testing-modulen (tester-katalog), eller er det et separat treningsprogram?
- Kan spillere se hverandres FYS-resultater, eller er det privat?
```

---

### B4 — Analysere-undersider + statistikk-dybde (P1)

```
Du er Claude Design. Du skal designe 10 skjermer for PlayerHQ i AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent. Disse skjermene er data-tette — Bloomberg-tetthet på detalj-sider er OK (12–14px, p-3).
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, PRO. Data fra ekte runder og TrackMan.

---

**SKJERMER (10 stk):**

**A — Statistikk-dybde:**

1. `/portal/statistikk/[metric]` — Metrikk-detalj (f.eks. «SG: Putting»)
   - Viser: DetailHero (metrikk-navn + nåverdi), TrendBand (utvikling vs benchmark), SgBar (fordelingsbar), PercentileGauge (rangering vs kohort), siste 10 runder DataTable Pro
   - Primær-flyt: se trend → sammenlign mot benchmark (1 trykk)
   - Tilstander: med data, uten data

2. `/portal/statistikk/sammenlign` — Sammenlign mot kohort/spiller
   - Viser: CompareH2H (Øyvind vs valgt motstander), SkillRadarLive (radar-overlay), SgBar per kategori
   - Primær-flyt: velg motstander → se sammenligning (≤2 trykk)
   - Tilstander: med motstander valgt, ingen valgt (tom start)

3. `/portal/statistikk/runder/[runId]/del` — Del runde
   - Viser: ShareCard (runde-sammendrag, HCP, bruttoscore, SG-topp), del-knapper (kopier lenke, last ned bilde)
   - Primær-flyt: generer → del (≤2 trykk)

**B — SG-Hub undersider (9 ruter — design 5 her, resten i eget batch om nødvendig):**

4. `/portal/mal/sg-hub/[club]` — SG per kølle
   - Viser: ClubMetricGrid (alle kølledistanser for valgt kølle), DispersionMap (slag-spredning), TrendBand (SG-trend for køllen), GappingChart (gap til naboer)
   - Primær-flyt: se kølle-data → byt kølle (chips, ≤1 trykk)

5. `/portal/mal/sg-hub/benchmark` — Benchmark-sammenligning
   - Viser: CompareH2H (Øyvind vs Team Norway/PGA TOUR benchmark per SG-kategori), GapToNext
   - Primær-flyt: se gap → velg kategori for drill-down (≤2 trykk)

6. `/portal/mal/sg-hub/best-vs-now` — Beste form vs nå
   - Viser: TrendBand (nå vs PB-periode), SgBreakdown (delta per kategori), PersonalBest (fremhevet)
   - Primær-flyt: leses (lesemodus)

7. `/portal/mal/sg-hub/equipment` — Utstyr-analyse
   - Viser: GappingChart (hele bag-gapping), ClubMetricGrid, «Hullene i bag»-indikator
   - Primær-flyt: se gap → klikk kølle for detalj (≤2 trykk)

8. `/portal/mal/sg-hub/strategy` — Strategi-analyse
   - Viser: HoleStrip (slag-mønster per hull), InsightCard Pro (strategi-innsikt fra AI), DataTable Pro (bane-oversikt)
   - Primær-flyt: se hull → klikk hull for detalj (≤2 trykk)

9. `/portal/mal/sg-hub/conditions` — Bane/vær-kondisjon
   - Viser: DataTable Pro (runder gruppert etter vind/regn/temperatur), TrendBand (SG per kondisjon)
   - Primær-flyt: filtrer kondisjon → se SG-effekt (≤2 trykk)

10. `/portal/mal/runder/[id]/shot-by-shot` — Slag-for-slag (runde-detalj)
    - Viser: HoleStrip (alle hull med fargekoding), DispersionMap (slag-plasser på kart), SgBar per hull, DataTable Pro (hvert slag med data)
    - Primær-flyt: velg hull → se slag-data (≤2 trykk)

---

**KIT-KOMPONENTER:**
- DetailHero, TrendBand, SgBar, SgBreakdown, PercentileGauge
- CompareH2H, SkillRadarLive
- ShareCard (NY komponent)
- ClubMetricGrid, DispersionMap, GappingChart
- HoleStrip
- InsightCard Pro, DataTable Pro
- GoalProgress, GapToNext, PersonalBest
- Button, EmptyState, Badge

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper.
4. Rike, data-drevne komponenter — dette er «moaten» (golf-data som ingen annen app viser).
5. Alle tilstander.

Data-tette flater: Bloomberg-tetthet OK. Mono-tall alltid. Design oppå kit-komponentene. Norsk bokmål.

**SPØRSMÅL:**
- ShareCard: skal delt lenke gå til en offentlig statistikk-side eller kun generere et bilde?
- SG-hub/[club]: «valgt kølle» — velges via URL-param eller chips på siden?
- Conditions-skjermen: hvilke kondisjon-kategorier finnes (vind sterk/svak/ingen, regn, temperatur-intervall)?
- SG-hub/coach/[spillerId]-sidene (2 stk) — er disse identiske med spillerens egne coach-versjoner? Disse er ikke med i denne batchen; bekreft om de skal tas i B5.
```

---

### B4b — SG-hub rest + TrackMan-detalj + statistikk-hub + baner (P1)

```
Du er Claude Design. Du skal designe 9 skjermer for analyse-dybde i PlayerHQ, AK Golf HQ.
Disse er data-tette flater — Bloomberg-tetthet er OK (12–14px, p-3).

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent.
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, PRO. Data fra ekte runder og TrackMan.

---

**SKJERMER (9 stk):**

**A — SG-hub rest (3 undersider ikke dekket i B4):**

1. `/portal/mal/sg-hub/yardage` — Yardage-analyse
   - Viser: ClubMetricGrid (alle køller med carry/total-distanse, SG-effekt per distansesone), GappingChart (faktiske vs ideelle gap), «Hull i bag»-indikator (rød badge der gap er for stor)
   - Primær-flyt: se distanser → klikk en distansesone for drill-down (≤2 trykk)
   - Tilstander: med TrackMan-data, uten data («Logg TrackMan-økt for å se distanser»)

2. `/portal/mal/sg-hub/coach/[spillerId]` — Coach-komparativ SG (se mot coach)
   - Viser: CompareH2H (Øyvind vs Anders Kristiansen SG per kategori), InsightCard Pro («Hva du jobber mot»), TrendBand (begge over tid)
   - Primær-flyt: velg SG-kategori → se sammenligning (≤2 trykk)

3. `/portal/mal/sg-hub/coach/[spillerId]/equipment` — Coach-equipment-gap
   - Viser: GappingChart (spillers bag vs coachens bag), InsightCard Pro («Anbefalinger fra coach»)
   - Primær-flyt: se gap → les innsikt (lesemodus)

**B — TrackMan-detalj:**

4. `/portal/mal/trackman/[id]` — TrackMan-økt-detalj
   - Viser: økt-tittel + dato, DispersionMap (slag-spredning for den aktuelle økt), DataTable Pro (alle slag med ballhastighet/carry/avvik), TrendBand (vs forrige økt), «Del med coach»-knapp
   - Primær-flyt: se økt-data → velg slag for detalj (≤2 trykk)
   - Tilstander: med data, laster (skeleton-tabell), tom

**C — Statistikk-hub:**

5. `/portal/mal/statistikk` — Statistikk-hub (oversikt)
   - Viser: KpiStrip (nøkkelstatistikk: snittscor, SG-total, putts per runde, GIR %), HubCard-grid som snarveier til underkategorier (SG-hub / TrackMan / Runder / Tester / Baner), TrendBand (HCP-trend, siste 6 måneder)
   - Primær-flyt: se oversikt → klikk underkategori-kort (≤2 trykk)
   - Tilstander: med data, ny bruker (tom), laster

**D — Baner:**

6. `/portal/mal/baner` — Bane-bibliotek (oversikt)
   - Viser: GalleryView (baner Øyvind har spilt, med antall runder, snittresultat, siste runde-dato), søkefelt, «Ny runde på denne banen»-knapp
   - Primær-flyt: se baner → klikk bane for detalj (≤2 trykk)
   - Tilstander: med data (runder), ny bruker (tom — «Du har ikke spilt noen runder ennå»)

7. `/portal/mal/baner/[id]` — Bane-detalj
   - Viser: bane-navn, adresse, antall runder spilt, snittresultat (brutto), HoleStrip (alle 18 hull — fargekoding basert på snitt-score vs par), DataTable Pro (siste 5 runder på denne banen), InsightCard Pro («Dine styrker og svakheter på denne banen»)
   - Primær-flyt: se bane-data → klikk hull for slag-detalj (≤2 trykk)
   - Tilstander: med runder, uten runder («Spill din første runde på denne banen»)
   - NB: Alltid brutto score — aldri netto, aldri netto-klasser

**E — SG-hub coach-kølle (fra B1b som naturlig henger her):**

8. `/portal/mal/sg-hub/coach/[spillerId]/[club]` — Coach-data per kølle
   - Viser: CoachCompareGrid (spillerens vs coachens distanse/SG for valgt kølle), GappingChart (begge), chip-velger (byt kølle)
   - Primær-flyt: velg kølle via chips → se data (1 trykk)

**F — Statistikk-metrikk (fra B4 overflow):**

9. `/portal/mal/runder/[id]/shot-by-shot` er allerede i B4. Denne batchen legger til:
   `/portal/mal/statistikk` (statistikk-hub) er dekket i punkt 5 over.
   Legg i stedet til: `/portal/statistikk/runder/[runId]/del` — Del runde (ShareCard)
   - Viser: ShareCard (runde-sammendrag: brutto score, HCP, SG-topp 3), del-knapper (kopier lenke, last ned bilde)
   - Primær-flyt: generer → del (≤2 trykk)
   NB: Brutto score alltid i delt kort.

---

**KIT-KOMPONENTER:**
- ClubMetricGrid, GappingChart (yardage + equipment)
- CompareH2H (coach-sammenligning)
- DispersionMap, DataTable Pro (TrackMan-detalj)
- TrendBand (HCP + økt-utvikling)
- KpiStrip, HubCard (statistikk-hub)
- GalleryView (bane-liste)
- HoleStrip (bane-detalj per hull)
- InsightCard Pro (AI-innsikt på bane/coach)
- ShareCard (del runde)
- Button, EmptyState, Badge

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper.
4. Data-tette flater: Bloomberg-tetthet OK. Mono-tall alltid.
5. Alle tilstander. Turneringsresultater og banescorer: alltid BRUTTO.

Design oppå kit-komponentene. Norsk bokmål.

**SPØRSMÅL:**
- Coach-komparativ SG: kan Øyvind faktisk se Anders Kristiansens SG-tall, eller er det anonymiserte «pro-referanser»? Viktig for databeskyttelse.
- Bane-bibliotek: vises kun baner Øyvind HAR spilt, eller kan man søke i alle tilgjengelige baner?
- TrackMan-detalj: er en «økt» ett enkelt clubclub-sett, eller en hel session med mange køller?
```

---

### B5 — Coach-seksjonen (P1)

```
Du er Claude Design. Du skal designe 11 skjermer for PlayerHQ-coach-modulen i AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent.
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, PRO. Coach = Anders Kristiansen.
**Viktig:** Disse er spillerens visning av coach-materialet — ikke coach-siden (AgencyOS).

---

**SKJERMER (11 stk):**

**A — Meldinger og kommunikasjon:**

1. `/portal/coach/melding/ny` — Ny melding til coach
   - Viser: tekstfelt, vedlegg-knapp, send-knapp, mottaker (Anders Kristiansen, forhåndsvalgt)
   - Primær-flyt: skriv → send (≤2 trykk)
   - Tilstander: tom, utfylt, sendt (bekreftelse)

2. `/portal/coach/melding/[id]/vedlegg` — Vedlegg-visning i melding
   - Viser: fillisteoversikt (bilder/video/PDF), preview av valgt vedlegg, «Last ned»-knapp
   - Primær-flyt: se vedlegg → last ned (≤2 trykk)

3. `/portal/coach/sporsmal/[id]` — Q&A med coach
   - Viser: spørsmål-tekst (fra Øyvind), coach-svar (fra Anders Kristiansen), oppfølgingsfelt
   - Primær-flyt: les svar → still oppfølgingsspørsmål (≤2 trykk)

**B — Coach-planer (spiller-visning):**

4. `/portal/coach/plans` — Mine planer fra coach
   - Viser: KanbanBoard (planer per status: Aktiv/Fullført/Pause), GoalProgress per plan, «Be om plan»-knapp
   - Primær-flyt: se planer → klikk plan (≤2 trykk)
   - Tilstander: med planer, uten planer («Coach har ikke laget plan ennå»)

5. `/portal/coach/plans/[planId]` — Plan-detalj (spiller-visning)
   - Viser: plan-tittel, coach-notat, PeriodTimeline (perioder), drill-liste (tilknyttede), GoalProgress
   - Primær-flyt: se plan → klikk drill for å utføre (≤2 trykk)

6. `/portal/coach/plans/[planId]/ny-okt` — Ny økt fra plan
   - Viser: plan-kontekst øverst, økt-bygger (forhåndsutfylt fra plan), bekreft-knapp
   - Primær-flyt: se forhåndsutfylt økt → bekreft start (≤2 trykk)

7. `/portal/coach/plans/perioder` — Perioder-oversikt
   - Viser: PeriodTimeline (alle perioder i årsplan), aktiv periode fremhevet, periode-detalj-panel
   - Primær-flyt: se perioder → klikk periode (≤2 trykk)

**C — Coach-innhold:**

8. `/portal/coach/ovelser` — Øvelser fra coach
   - Viser: GalleryView (coach-kuraterte drills), filter-chips (kategori), søkefelt
   - Primær-flyt: filtrer → klikk øvelse (≤2 trykk)

9. `/portal/coach/ovelser/ny` — Be om ny øvelse
   - Viser: tekstfelt («Hva slags øvelse trenger du?»), kategori-chips, send-knapp
   - Primær-flyt: beskriv → send (≤2 trykk)

10. `/portal/coach/ovelser/[id]/rediger` — Rediger øvelse-notat
    - Viser: øvelse-detalj (navn, video-thumbnail, instruksjon), «Mine notater»-felt (editerbart)
    - Primær-flyt: les øvelse → legg til notat → lagre (≤3 trykk)

11. `/portal/coach/videoer` — Videoer fra coach
    - Viser: GalleryView (video-kort med thumbnail, tittel, dato), spill av-player ved klikk
    - Primær-flyt: se videoer → spill av (≤2 trykk)
    - Tilstander: med videoer, uten («Coach har ikke delt videoer ennå»)

*NB: `/portal/coach/[coachId]` (coach-profil) og `/portal/coach/notes` (notater) tas i neste batch. `/portal/coach/ai` er V2.*

---

**KIT-KOMPONENTER:**
- InboxList (NY — meldings-liste)
- MessageThread (NY — tråd-visning)
- GalleryView (øvelser, videoer)
- KanbanBoard (planer per status)
- PeriodTimeline (perioder i årsplan)
- GoalProgress (plan-fremgang)
- DataTable Pro (drill-liste)
- ChallengeCard (aktiv drill)
- Avatar, Button, EmptyState

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench — spillerens plan-visning er lesemodus, Workbench er coach-siden.
3. Ingen døde knapper.
4. Elite-gamification — progress-rings, streak, «neste steg» alltid synlig.
5. Alle tilstander.

Design oppå kit-komponentene. Norsk bokmål.

**SPØRSMÅL:**
- Kan GRATIS-brukere se coach-seksjonen? Eller er hele `/portal/coach/*` kun PRO?
- Er videoer streamet direkte i appen eller lenker de til ekstern plattform (YouTube/Vimeo)?
- «Be om ny øvelse» — går dette via melding-systemet eller er det en separat forespørsel-type?
- Kan spilleren redigere coach-øvelsen, eller kun legge til egne notater?
```

---

### B5b — Meg-innstillinger rest + coach/ai (P1)

```
Du er Claude Design. Du skal designe 4 skjermer for resterende innstillinger og AI-coach i PlayerHQ, AK Golf HQ.
Disse er P1 — lanseringskritiske.

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent.
**Demo:** spiller = Øyvind Rohjan.

---

**SKJERMER (4 stk):**

1. `/portal/meg/innstillinger/sikkerhet` — Sikkerhetsinnstillinger (spiller)
   - Viser: SettingsList (passord — «Endre passord»-knapp, 2FA-status med «Aktiver»-knapp, aktive innloggingsenheter — liste med navn/sist brukt/logg-ut-knapp)
   - Primær-flyt: se status → klikk «Aktiver 2FA» (≤2 trykk)
   - Tilstander: 2FA av, 2FA på (annen SettingsList-visning)

2. `/portal/meg/innstillinger/eksport` — Eksporter mine data
   - Viser: SettingsList (tilgjengelige data-eksporter: «Mine runder (CSV)», «Mine treningslogger (JSON)», «Hele profil (ZIP)»), eksport-knapp per type, status-badge («Klar til nedlasting» / «Genererer…»)
   - Primær-flyt: velg format → klikk «Eksporter» (≤2 trykk)
   - Tilstander: klar (knapper aktive), genererer (spinner + badge), ferdig (nedlastingslenke)

3. `/portal/coach/ai` — AI-coach (V2-markert intern flate)
   - NB: Dette er en V2/fremtidig funksjon — design som et tydelig «beta»- eller «kommer snart»-panel.
   - Viser: InsightCard Pro (hva AI-coach gjør: analyserer din data, foreslår øvelser, gir ukentlig rapport), «Aktiver AI-coach»-knapp (lime CTA), «Hva er AI-coach?»-lenke, FAQ-ekspanders
   - Primær-flyt: les om funksjonen → klikk «Aktiver» (≤2 trykk)
   - Stil: ikke «grå» — vis som en premium funksjon som er nær lansering

4. `/portal/agent-pipeline` — Agent-pipeline (INTERN / debug)
   - NB: Denne er INTERN / debug — ikke en produkt-skjerm. Design som en intern admin-flate.
   - Viser: liste over pågående AI-agent-kjøringer for innlogget bruker (agent-navn, status, output, tidsstempel). Enkelt, funksjonelt — ikke forsøk å gjøre den vakker.
   - Primær-flyt: se liste → klikk en kjøring for output-logg (≤2 trykk)
   - Tilstander: pågår (spinner), fullført (grønn badge), feil (rød badge)

---

**KIT-KOMPONENTER:**
- SettingsList (sikkerhet + eksport)
- InsightCard Pro (AI-coach beskrivelse)
- DataTable Pro (agent-pipeline, innloggingsenheter)
- Badge (status), Button, EmptyState

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper.
4. Agent-pipeline er intern/debug — ikke produkt-finish.
5. Alle tilstander.

Design oppå kit-komponentene. Norsk bokmål.

**SPØRSMÅL:**
- AI-coach (/portal/coach/ai): er dette helt V2 (ikke i lansering), eller skal det lanseres med appen?
- Agent-pipeline: trengs dette designet i det hele tatt, eller er det tilstrekkelig med en enkel side uten Claude Design-fasit?
- Eksport-data: er ZIP-eksport faktisk bygd, eller er det også V2?
```

---

### B6 — Booking-detaljer (V2)

```
Du er Claude Design. Du skal designe 5 skjermer for booking-modulen i PlayerHQ, AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent.
**Demo:** spiller = Øyvind Rohjan, PRO. Coach = Anders Kristiansen. Anlegg = AK Golf Performance Studio.

---

**SKJERMER (5 stk):**

1. `/portal/booking/ny/bekreft` — Bekreft booking (siste steg i booking-wizard)
   - Viser: oppsummering (økt-type, dato/tid, coach, anlegg, pris), betalings-info (eksisterende kort eller nytt), «Bekreft»-knapp
   - Primær-flyt: se oppsummering → bekreft (≤2 trykk)
   - Tilstander: klar til bekreft, bekreftelse pågår (spinner), bekreftet (redirect til bekreftet-side)

2. `/portal/booking/[bookingId]` — Booking-detalj
   - Viser: DetailHero (økt-type, dato/tid, status-badge), ItineraryRow (coach + anlegg + varighet), KpiCard (plasser igjen / din status), avbestill-knapp (hvis innenfor frist)
   - Primær-flyt: se detaljer → avbestill eller «Legg i kalender» (≤2 trykk)
   - Tilstander: kommende, gjennomført, avlyst, avbestilt

3. `/portal/booking/coach/[coachId]` — Coach-side i booking
   - Viser: coach-profil (foto, bio, spesialiteter), ledige tider (SessionScheduler), «Book denne coachen»-knapp
   - Primær-flyt: se profil → velg tid → book (≤2 trykk)

4. `/portal/booking/anlegg/[anleggId]` — Anlegg-side i booking
   - Viser: anlegg-info (foto, fasiliteter, adresse), ledige tider (SessionScheduler), «Book her»-knapp
   - Primær-flyt: se anlegg → velg tid → book (≤2 trykk)

5. `/portal/booking/bekreftet` — Booking bekreftet
   - Viser: bekreftelse-kort (økt-navn, dato/tid, coach), kalender-lenke, «Se alle bookinger»-knapp
   - Primær-flyt: leses → tilbake til oversikt (1 trykk)

---

**KIT-KOMPONENTER:**
- DetailHero
- ItineraryRow
- SessionScheduler (ledig-tider-velger)
- KpiCard
- GalleryView (anlegg-bilder)
- AthleticCard, FeaturedCard
- Button, Badge, EmptyState

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper — betalings-steg skal ha tydelig «tilbake»-vei.
4. Alle tilstander.
5. Alltid norsk bokmål, Lucide-ikoner.

Design oppå kit-komponentene.

**SPØRSMÅL:**
- Betalingsflyt: Stripe inline-kort eller redirect til betalingsside?
- Kan GRATIS-brukere booke, eller er det PRO-only?
- Avbestillingsfrist — vises den på booking-detalj (f.eks. «Avbestill innen 24 timer»)?
```

---

### B7 — Meg-undersider: abonnement + bookinger + helse (V2)

```
Du er Claude Design. Du skal designe 10 skjermer for Meg-seksjonen i PlayerHQ, AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent.
**Demo:** spiller = Øyvind Rohjan. Abonnement: GRATIS eller PRO (300 kr/mnd). Aldri «ELITE».

---

**SKJERMER (10 stk):**

**A — Abonnement:**

1. `/portal/meg/abonnement/oppgrader` — Oppgrader til PRO
   - Viser: fordeler-liste (PRO vs GRATIS), pris (300 kr/mnd), «Start PRO»-knapp, FAQ
   - Primær-flyt: se fordeler → velg PRO → betal (≤3 trykk)

2. `/portal/meg/abonnement/oppgrader/flyt` — Betalings-wizard (PRO-oppgradering)
   - Viser: kort-felt (Stripe), oppsummering, bekreft-knapp
   - Primær-flyt: fyll inn kort → bekreft (≤2 trykk)

3. `/portal/meg/abonnement/avbestill` — Avbestill PRO
   - Viser: bekreftelsesside («Er du sikker?»), hva du mister (liste), «Behold PRO»-knapp + «Avbestill»-knapp
   - Primær-flyt: les → bekreft avbestilling (≤2 trykk, avbestilling er sekundær-handling)

4. `/portal/meg/abonnement/kort/ny` — Legg til betalingskort
   - Viser: Stripe-kortfelt, «Lagre kort»-knapp
   - Primær-flyt: fyll inn → lagre (≤2 trykk)

5. `/portal/meg/abonnement/faktura/[id]` — Faktura-detalj
   - Viser: faktura-info (dato, beløp, status), linjeposter, «Last ned PDF»-knapp
   - Primær-flyt: se faktura → last ned (≤2 trykk)

**B — Bookinger:**

6. `/portal/meg/bookinger` — Mine bookinger (oversikt)
   - Viser: kommende bookinger (ItineraryRow), historikk (DataTable Pro), «Book ny»-knapp
   - Primær-flyt: se bookinger → klikk booking for detalj (≤2 trykk)
   - Tilstander: med bookinger, uten

7. `/portal/meg/bookinger/reschedule/[bookingId]` — Ombook
   - Viser: nåværende tid, ny-tid-velger (SessionScheduler), «Bekreft endring»-knapp
   - Primær-flyt: velg ny tid → bekreft (≤2 trykk)

**C — Helse:**

8. `/portal/meg/helse/symptom/ny` — Rapporter symptom
   - Viser: kroppsdel-velger (ikon-kart), alvorlighetsgrad (1–5 skala), tekstfelt, «Rapporter»-knapp
   - Primær-flyt: velg kroppsdel → noter symptom → send (≤3 trykk)
   - Tilstander: utfylt, sendt (bekreftelse)

9. `/portal/meg/feedback` — Send tilbakemelding på appen
   - Viser: kategori-chips (Bug/Forslag/Ros), tekstfelt, e-post (forhåndsutfylt), «Send»-knapp
   - Primær-flyt: velg kategori → skriv → send (≤3 trykk)

10. `/portal/spiller/[spillerId]` — Spiller-profil (coach-funksjon i spiller-appen)
    - NB: avklar — denne ruten er i spiller-appen men viser trolig en annen spillers stats til coach eller sammenligning.
    - Viser (forslag): PhotoHero (spillerprofil), KpiStrip (nøkkel-KPI), SkillRadarLive (radar), «Sammenlign med meg»-knapp
    - Primær-flyt: se spiller-stats → sammenlign (≤2 trykk)

---

**KIT-KOMPONENTER:**
- PhotoHero, HubCard
- ItineraryRow, DataTable Pro
- SessionScheduler (ombook)
- WellnessCard (helse-oversikt)
- KpiCard, KpiStrip
- SkillRadarLive (spiller-sammenligning)
- Button, EmptyState, Badge

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper — avbestill-flyt skal ha tydelig «angre»-vei.
4. Alle tilstander.
5. Norsk bokmål. Abonnement: kun GRATIS og PRO (300 kr/mnd) — aldri «ELITE».

Design oppå kit-komponentene.

**SPØRSMÅL:**
- Faktura-PDF: genereres den i appen (server-side) eller er det en Stripe-hosted lenke?
- Helse-symptom: er dette synlig for coach i AgencyOS? Hvis ja, med hvilken granularitet?
- `/portal/spiller/[spillerId]` — er dette kun for spillere i samme gruppe, eller alle brukere?
- Rapporter-siden for bookinger: finnes det et «Avbestill»-valg her, eller er det kun på booking-detalj?
```

---

### B8 — Meg-undersider: innstillinger + sikkerhet + hjelp (V2)

```
Du er Claude Design. Du skal designe 14 skjermer for innstillinger, sikkerhet og hjelp i PlayerHQ, AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent.
**Demo:** spiller = Øyvind Rohjan.
**Stil:** Innstillinger er enkle, ryddig SettingsList-mønster — ikke overlastet. Hjelp-sidene er editorial.

---

**SKJERMER (14 stk):**

**A — Innstillinger-undersider:**

1. `/portal/meg/innstillinger/varsler` — Varsel-innstillinger
   - Viser: SettingsList (toggle per varsel-type: treningspåminnelse, coach-melding, ukesammendrag, kampanjer)
   - Primær-flyt: se varsler → toggle (1 trykk per innstilling)

2. `/portal/meg/innstillinger/personvern` — Personvern + eksport
   - Viser: SettingsList (hvem ser min profil / mine data-rettigheter), «Last ned mine data»-knapp, «Slett konto»-lenke
   - Primær-flyt: les rettigheter → endre synlighet (≤2 trykk)

3. `/portal/meg/innstillinger/sprak` — Språk og format
   - Viser: RadioGroup (Norsk bokmål / Nynorsk / English), tallformat (komma/punktum), datoformal — «Lagre»-knapp
   - Primær-flyt: velg → lagre (≤2 trykk)

4. `/portal/meg/innstillinger/anlegg` — Foretrukket anlegg
   - Viser: liste over tilknyttede anlegg (GalleryView), «Legg til anlegg»-knapp, sett favoritt
   - Primær-flyt: se anlegg → sett favoritt (≤2 trykk)

5. `/portal/meg/innstillinger/integrasjoner` — Integrasjoner
   - Viser: SettingsList (Garmin Connect / Apple Health / GolfBox status + koble til/fra-knapp per integrasjon)
   - Primær-flyt: se integrasjoner → koble til (≤2 trykk)

6. `/portal/meg/innstillinger/okter` — Økt-innstillinger
   - Viser: SettingsList (standard økt-varighet, foretrukket økt-tid, auto-start live-økt)
   - Primær-flyt: endre innstilling → lagre (≤2 trykk)

**B — Sikkerhet:**

7. `/portal/meg/sikkerhet` — Sikkerhet (hub)
   - Viser: SettingsList (passord-status, 2FA-status, aktive enheter, siste innloggings-aktivitet)
   - Primær-flyt: se status → klikk for å endre (≤2 trykk)

8. `/portal/meg/sikkerhet/2fa` — Sett opp 2FA
   - Viser: steg-for-steg (1: velg metode SMS/Authenticator-app, 2: skann QR / skriv kode, 3: bekreft)
   - Primær-flyt: velg metode → bekreft kode → aktivert (≤3 trykk)
   - Tilstander: ikke satt opp, satt opp (viser backup-koder)

**C — Hjelp-senter:**

9. `/portal/meg/help/artikkel/[slug]` — Hjelp-artikkel
   - Viser: DetailHero (artikkel-tittel), artikkeltekst (editorial layout), «Var dette nyttig?»-knapp, «Kontakt oss»-lenke
   - Primær-flyt: les → gi tilbakemelding (1 trykk)

10. `/portal/meg/help/kategori/[slug]` — Hjelp-kategori (artikkel-liste)
    - Viser: kategori-tittel, GalleryView/liste over artikler i kategorien
    - Primær-flyt: velg kategori → klikk artikkel (≤2 trykk)

11. `/portal/meg/help/kontakt` — Kontakt support
    - Viser: kontakt-form (emne-dropdown, tekstfelt, e-post forhåndsutfylt), «Send»-knapp, evt. chat-lenke
    - Primær-flyt: fyll inn → send (≤2 trykk)

**D — Coach og foreldre:**

12. `/portal/coach/notes` — Notater fra coach (oversikt)
    - Viser: AthleticCard-liste (notat-kort med dato, tittel, snippet), søkefelt
    - Primær-flyt: se notater → klikk for detalj (≤2 trykk)

13. `/portal/coach/notes/[noteId]` — Notat-detalj
    - Viser: DetailHero (notat-tittel + dato + coach), notat-innhold (editorial), «Svar»-knapp
    - Primær-flyt: les → svar til coach (≤2 trykk)

14. `/portal/coach/[coachId]` — Coach-profil
    - Viser: PhotoHero (coach-bilde + navn «Anders Kristiansen», tittel, bio), spesialiteter (chips), «Send melding»-knapp, «Book økt»-knapp
    - Primær-flyt: se profil → book økt (≤2 trykk)

---

**KIT-KOMPONENTER:**
- SettingsList (NY — innstillings-rad med toggle/verdi/lenke)
- DataTable Pro (innloggings-historikk, sikkerhet)
- DetailHero (hjelp-artikkel, notat)
- GalleryView (hjelp-kategorier, anlegg)
- PhotoHero (coach-profil)
- AthleticCard (notat-liste)
- Button, EmptyState, Badge, ActionList

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper — innstillinger-nav skal ha «tilbake» alltid tilgjengelig.
4. Alle tilstander (spesielt viktig for 2FA: ikke satt opp vs. satt opp).
5. Norsk bokmål.

Design oppå kit-komponentene.

**SPØRSMÅL:**
- «Slett konto»-lenke: skal den lede til en bekreftelses-modal eller en separat side?
- Integrasjoner: er GolfBox-sync allerede live, eller er det fremtidig? Skal vi vise «Kommer snart»?
- Backup-koder for 2FA: vises de kun én gang ved oppsett, og kan de regenereres på sikkerhet-huben?
- Hjelp-senter: er det et CMS bak (Notion/Sanity), eller statisk innhold?
```

---

### B9 — Utfordringer + AI-assistenter + øvrige (V2)

```
Du er Claude Design. Du skal designe 7 skjermer for gamification, AI og øvrige PlayerHQ-flater, AK Golf HQ.

**Produkt:** PlayerHQ — lyst tema, mobil-først (430px), lime #D1F843 som accent.
**Demo:** spiller = Øyvind Rohjan, HCP 4,2, PRO.

---

**SKJERMER (7 stk):**

**A — Utfordringer (Challenges):**

1. `/portal/utfordringer` — Utfordringer (oversikt)
   - Viser: aktive utfordringer (ChallengeCard-rutenett), fullførte/låste, «Ny utfordring»-knapp (kun PRO)
   - Primær-flyt: se aktive → klikk utfordring → start (≤2 trykk)
   - Tilstander: med utfordringer, uten (ny bruker), alle fullført (badge-feiring)

2. `/portal/utfordringer/[id]` — Utfordring-detalj
   - Viser: ChallengeCard (stor versjon), mål (target), ditt beste (PersonalBest), GoalProgress, «Start utfordring»-knapp, historikk (siste 5 forsøk)
   - Primær-flyt: se utfordring → start (≤2 trykk)
   - Tilstander: ikke startet, i gang, bestått (lime-puls), mislyktes (prøv igjen)

3. `/portal/utfordringer/ny` — Opprett utfordring (kun PRO)
   - Viser: wizard (1: velg drill/øvelse, 2: sett mål/target, 3: velg varighet/antall forsøk)
   - Primær-flyt: bygg utfordring → lagre (≤3 trykk)

**B — AI-assistenter:**

4. `/portal/ai/mal-bygger` — AI-mål-bygger
   - Viser: chat-lignende UI (InsightCard Pro som AI-svar), forslag til mål basert på data, «Legg til mål»-knapp per forslag
   - Primær-flyt: se AI-forslag → legg til mål (≤2 trykk)
   - Tilstander: laster (AI beregner), forslag klart, uten data (AI kan ikke lage forslag ennå)

5. `/portal/ai/foresla-drill` — AI-foreslår drill
   - Viser: InsightCard Pro («Basert på dine data foreslår jeg disse drillene»), ChallengeCard-liste (3 forslag), «Legg til økt»-knapp
   - Primær-flyt: se forslag → legg til drill i økt (≤2 trykk)

6. `/portal/ai/foresla-turnering` — AI-foreslår turnering
   - Viser: InsightCard Pro (begrunnelse), TournamentCard-liste (forslag), «Se turnering»-knapp per kort
   - Primær-flyt: se forslag → klikk turnering for info (≤2 trykk)

**C — Øvrige:**

7. `/portal/reach` — Rekkevidde-analyse (slag-rekkevidde)
   - Viser: DispersionMap (slag-spredning per kølle), GappingChart (bag-rekkevidde), ClubMetricGrid (distanser)
   - Primær-flyt: velg kølle → se rekkevidde-data (≤2 trykk)
   - Tilstander: med TrackMan-data, uten data («Koble til TrackMan for rekkevidde-analyse»)

---

**KIT-KOMPONENTER:**
- ChallengeCard
- GalleryView (utfordring-oversikt)
- GoalProgress, BadgeShelf (gamification)
- PersonalBest (rekord ved bestått)
- InsightCard Pro (AI-svar)
- TournamentCard (turnerings-forslag)
- DispersionMap, GappingChart, ClubMetricGrid (reach-analyse)
- Button, EmptyState, Badge

---

**DE 5 REGLENE:**
1. Still meg så mange spørsmål — ikke anta.
2. Ikke overstyr Workbench.
3. Ingen døde knapper — AI-forslag har alltid en «handle nå»-knapp.
4. Elite-gamification — ChallengeCard er «moaten», driv stolthet ved mestring.
5. Alle tilstander — spesielt AI-tilstander (laster / uten data / forslag klart).

Design oppå kit-komponentene. Norsk bokmål.

**SPØRSMÅL:**
- Utfordringer: kan spillere dele utfordringer med andre, eller er det privat?
- AI-assistenter: er disse kun PRO, eller tilgjengelig for GRATIS-brukere med begrenset antall?
- `/portal/reach` — er dette en selvstendig side i bunn-navigasjonen, eller nådd fra Analysere?
- `/portal/agent-pipeline` (ikke i denne batchen) — er dette en intern debug-side eller produkt-side?
```
