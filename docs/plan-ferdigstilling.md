# Samlet plan for å ferdigstille AK Golf HQ

**Dato:** 09.10.2026  
**Kodegrunnlag:** `main` på commit `69b58becd2c806236b16043892180a7608616fd7`  
**Formål:** gjøre AK Golf HQ trygt og nyttig i daglig spillerutvikling for AK-coacher og spillere.

Denne planen er bare et beslutnings- og gjennomføringsgrunnlag. Den endrer ikke kode, database eller produksjonsmiljø.

## Kilder og metode

Planen bygger på:

- produktreglene i `AGENTS.md`, `CLAUDE.md`, `START-HER.md`, `docs/platform/AGENT-BRIEF.md`, `docs/platform/BUSINESS-RULES.md`, `docs/treningsplanlegging.md` og `.claude/rules/beslutninger.md`
- ruteregisteret i `docs/design-system/skjermregister.json` og skjermtypene i `docs/design-system/skjermliste-precision-athletics.md`
- faktisk kode under `src/app`, `src/components` og `src/lib`
- faktiske datamodeller i `prisma/schema.prisma`
- designstatusen for Precision 2.32.0 som Anders oppga i oppdraget. Selve Claude Design-prosjektet er ikke tilgjengelig i repoet.

Kodestatusene betyr:

- **Finnes:** ruten og hovedfunksjonen finnes, og den undersøkte produksjonsveien leser eller skriver ekte data uten en kjent demofallback. Dette er ikke det samme som at skjermen er visuelt godkjent eller prøvd i produksjon.
- **Delvis:** ruten finnes, men minst én nødvendig del mangler, bruker feil økttabell, viser en plassholder eller kan falle tilbake til demodata.
- **Mangler:** den nødvendige funksjonen eller ruten finnes ikke som en brukbar skjerm.

### Viktig begrensning: A/B-koblingen er ukjent

Det eksterne designregisteret med de offisielle 23 A-skjermene og 31 B-skjermene ligger ikke i repoet. Repoets register har 532 sider, men ingen kolonne for A, B eller C. Det opplyser også selv at Team Norway- og WANG-koblingene ikke er Claude Design-fasiten. Den eksakte listen med 54 eksterne skjerm-ID-er, navn og ruter er derfor **ukjent**.

Tabellen i del 5 er en foreløpig, kildebasert arbeidskobling: 23 skjermer/funksjoner som dekker de fem A-kravene, og 31 skjermer som dekker nødvendig lanseringsflyt. Den finner ikke på en ekstern designstatus. Før skjermbyggingen starter, må den offisielle A/B-eksporten legges ved eller føres inn i repoets register, og radene må avstemmes én til én. Dette er milepæl 0.

## 1. Konklusjon

1. AK Golf HQ har mange ruter og ekte datakilder, men er ikke klar for daglig bruk fordi den aktive live-økta ikke lagrer det spilleren gjør.
2. Den kritiske veien er å gjøre `WorkbenchSession` til én sann økt fra plan via gjennomføring til analyse.
3. Deretter må coachmeldinger, vedlegg og varsler nå spilleren, før analyse og SG kan stole på treningsdataene.
4. I den foreløpige A/B-koblingen er alle 23 A-skjermer Delvis eller Mangler; B har mer ferdig kode, men mangler siste design- og brukskontroll.
5. Lansering er forsvarlig først når de åtte kodeleveransene, A/B-skjermene og kontrollene for data, tilgjengelighet og tallformat er bevist sammen uten demodata.

## 2. Definisjon av «lansering»

Lansering betyr at et avgrenset pilotutvalg av AK-coacher og spillere kan bruke hele hovedreisen med ekte, delte data uten manuelle omveier. Følgende skal kunne krysses av:

### Design og skjermgrunnlag

- [ ] De offisielle 23 A- og 31 B-skjermene er eksportert fra skjermprosjektet og koblet én til én til rute og kildefil i repoets skjermregister.
- [ ] Alle A-skjermene er ferdigtegnet med Precision 2.32.0 og har nødvendige tomme, lastende, feil- og frakoblede tilstander.
- [ ] De om lag 19 gjenstående B-skjermene er tegnet og besluttet. Eksakt liste er **ukjent** til A/B-eksporten foreligger.
- [ ] A17 og A19 er kjørt og avvikene er lukket eller uttrykkelig akseptert.
- [ ] Berøringsmål på telefon og skjermleser er kontrollert.
- [ ] Norsk tallformat er kontrollert på tvers av alle A- og B-skjermer: desimalkomma, ekte null som `0`, manglende verdi som `—`, putter i fot og typografisk minustegn.
- [ ] De tre kortene med tomme rammer har faktisk innhold eller en godkjent tomtilstand.
- [ ] Booking, Talent og oppmøte/fravær har besluttet innhold og nødvendige komponenter dersom de inngår i den endelige B-listen.

### De åtte kodeleveransene

- [ ] **1 · Live-økta lagrer.** Reps, faktisk tid, område, sted og relevant avstand lagres per øvelse. Kommentar og video lagres per øvelse og på koblet teknisk oppgave. LiveClock har én hovedtid, og lokale kladder tåler dårlig nett. `PH05LiveAktiv` er i dag bare lokal tilstand, mens en gjenbrukbar offlinekø allerede finnes i `src/components/portal/live/use-live-session.ts` og `src/lib/offline-queue/live-drill-queue.ts`.
- [ ] **2 · Én økttabell.** Plan, live-tavle, gjennomføring, oppsummering, analyse og korrelasjon bruker `WorkbenchSession`. Lesing av `TrainingSessionV2` og `TrainingPlanSession` er bare en kontrollert overgang. Kilder: `.claude/rules/beslutninger.md`, modellene i `prisma/schema.prisma` og de parallelle leserne i `src/lib/portal-live/load-ph04-07.ts`, `src/lib/agencyos/live-tavle-data.ts` og `src/lib/portal-analyse/trenings-historikk.ts`.
- [ ] **3 · Cockpit og melding inn i økta.** Coach ser egne gruppers økter og spillernes delte økter, ikke bare bookinger. Tekst, bilde, video og talemelding vises øverst i live-økta og lagres også i tråden. Skjermen oppdaterer meldinger hvert 15. sekund mens fanen er synlig, straks ved fokus/nett tilbake, og bruker Web Push i bakgrunnen. `MessageAttachment` brukes for vedlegg. Kilder: `src/lib/agencyos/daily-brief-data.tsx`, `src/lib/agencyos/live-tavle-data.ts`, `src/lib/agencyos/live-okt-actions.ts`, `src/lib/push.ts` og modellen `MessageAttachment`.
- [ ] **4 · Treningsanalyse.** Spiller, coach for én spiller og coach for gruppe kan åpne grunnlaget for tid per område × sted, banespill mot golfslag og putting per avstandsbånd. Stats › Trening er koblet til loggede Workbench-økter. I dag står kilden eksplisitt som «ØKTLOGG IKKE KOBLET HIT ENNÅ» i `src/lib/portal-analyse/ph16-stats-data.ts`, og historikken leser `TrainingSessionV2` i `src/lib/portal-analyse/trenings-historikk.ts`.
- [ ] **5 · SG-analyse.** Tap vises med tapsfarge og minustegn og kan åpnes i PlayerHQ og AgencyOS. Panelet sammenligner trening, turnering og treningstid i samme periode og viser forslag. `beregnKorrelasjon` bruker loggede Workbench-økter i tillegg til manuelle `TrainingLog`. Kilder: `src/components/portal/precision/PH16Stats.tsx`, `src/components/admin/precision/AG08Stats.tsx`, `src/lib/training/korrelasjon.ts` og modellen `Round` med `roundType` og `tournamentEntryId`.
- [ ] **6 · Spillerprofil.** AgencyOS, WANG og Team Norway viser profilbilde når `avatarUrl` finnes, ellers initialer, samt nøkkelinfo, trening per dag/uke/måned, turneringer, nåsituasjon og neste turnering innenfor D-04. Kilder: `src/lib/admin-spiller/spiller360-data.ts`, `src/components/team-norway/skjermer/tn-spillerprofil-skjerm.tsx` og `src/app/team-wang/_data/live-sesong.ts`.
- [ ] **7 · Rask score.** Score per hull lagres som en uttrykkelig rundetype uten SG-grunnlag. Den kan aldri bli blandet inn i SG-utregning. Dagens raske flyt lagrer `Round` uten et eget hurtigtypefelt i `src/app/portal/mal/runder/ny/actions.ts`; modellen har allerede `roundType` og `dataQuality` i `prisma/schema.prisma`.
- [ ] **8 · Metric med vurdering.** Endringsfarge styres av eksplisitt vurdering — forbedring, forverring eller nøytral — og aldri av fortegnet alene. Lavere score kan dermed være forbedring. Dagens fortegnslogikk finnes blant annet i `src/components/athletic/golfdata/KpiTile.tsx` og `src/components/athletic/golfdata/DataPreview.tsx`.

### Data, personvern og drift

- [ ] Ingen A- eller B-rute kan vise demodata, standardspillere, standardtall eller en syntetisk økt som om dataene er ekte. Kjente avvik finnes i `src/lib/portal-live/load-ph04-07.ts`, `src/lib/portal-runder/load-ph08-09.ts`, `src/app/portal/meg/innstillinger/page.tsx` og WANG-filene under `src/app/team-wang/_data`.
- [ ] All lagring er idempotent: samme forsøk kan sendes flere ganger uten dubletter.
- [ ] Bilder og video krever gyldig samtykke; for spillere under 16 år kreves foresatt. Tilgang fra WANG og Team Norway følger D-04.
- [ ] Data Golf-tall vises bare til analytikerrollen D-19.
- [ ] Alle tester bruker bare syntetiske testdata. Ingen produksjonsdata kopieres eller endres.
- [ ] Databasemigreringer er separate forslag og kjøres først etter eget skriftlig ja fra Anders for akkurat den migreringen.

### Bevis før pilot og lansering

- [ ] `npm run verify`, `npm test` og relevante integrasjonstester er grønne for hver kode-PR.
- [ ] Hovedreisen er prøvd på mobil 390 px og desktop, i avtalte temaer og med tom, lastende, feil, offline og gjenopprettet tilstand.
- [ ] En test viser at rep, kommentar, video, sted, område, avstand og tid kan leses tilbake fra databasen etter en økt.
- [ ] En test viser at en coachmelding med hvert vedlegg vises i live-økta og i meldingstråden, med riktig tilgang.
- [ ] En test viser at rask score aldri inngår i SG.
- [ ] En akseptmåling viser null horisontal rulling på avtalte bredder.
- [ ] Anders har sett hver lanseringsskjerm ved siden av valgt designversjon og godkjent eller registrert avvik.

## 3. Tre spor med avhengigheter

| Spor | Leveranser | Venter på | Leverer videre til |
|---|---|---|---|
| **Design · Precision** | Lukke A17/A19, berøring, skjermleser, tallformat, tre tomme rammer og eventuelle nye Booking/Talent/oppmøte-komponenter. Precision 2.32.0 og de navngitte A-komponentene regnes som ferdige etter statusen Anders oppga. | Anders' fem innholds- og språkbeslutninger i del 6. Premium-bilder bare dersom de gjøres lanseringskritiske. | Skjermprosjektet får låste komponenter, tekstregler og tilstander. Kodesporet får en stabil kontrakt å bygge mot. |
| **Skjermer · skjermprosjektet** | Ferdigstille A, tegne resten av B, eksportere den offisielle 23/31-listen, koble rute til skjerm-ID og levere mobil/desktop/tilstander. | Designkomponentene og beslutningene om plansteg, Fysisk, ord, putting, Booking, Talent og oppmøte. | Kodesporet kan bygge og kontrollere én skjerm om gangen uten å gjette. Milepæl 0 leverer den manglende A/B-koblingen. |
| **Kode · Codex eller Claude Code** | De åtte leveringene i fast rekkefølge, deretter lukking av B-ruter, integrasjonstester og pilot. | Levering 1 trenger den ferdige ExerciseNotes/LiveClock-kontrakten, som er oppgitt ferdig. Levering 4 og 5 venter på levering 1–2 og beslutningen om putteavstand. Levering 6 venter på 2 og 4. Visuell portering venter på den aktuelle skjermens godkjente design. | Gir ekte data tilbake til skjermene, slik at tom-, feil- og analysetilstander kan kontrolleres. Gir bevis for pilot og lansering. |

Avhengighetene kan oppsummeres slik:

`A/B-eksport + Anders-beslutninger → låste skjermkontrakter → live-lagring → én økttabell → cockpit/meldinger → treningsanalyse → SG → profiler → rask score → Metric-kontroll → B-lukking → pilot`

Teknisk arbeid som ikke avhenger av et åpent designvalg kan starte etter godkjent plan, men hver brukerflate stoppes før bygging dersom skjermens konkrete versjon eller tekst fortsatt er ukjent.

## 4. Milepæler i rekkefølge

| Milepæl | Innhold | Spor | Forutsetninger | Bevis på ferdig | Grov størrelse |
|---|---|---|---|---|---|
| **0 · Én felles skjermliste** | Eksporter 23 A + 31 B fra Claude Design med ID, navn, rute, versjon og status. Avstem mot `docs/design-system/skjermregister.json`. | Skjermer | Ingen | 54 av 54 eksterne rader har én dokumentert repo-rute eller «Mangler», og ingen rad er bare antatt. | 1 runde + 1 dokument-PR |
| **1 · Lås lanseringskontrakten** | Ta beslutningene i del 6. Kjør A17/A19, berøring, skjermleser, tallformat og de tre tomme rammene. Avgjør om Booking/Talent/oppmøte trenger nye komponenter før pilot. | Design + skjermer | Milepæl 0 | Signert kontrollark per komponent/skjerm; avvik har eier og frist. | 2–4 designrunder |
| **2 · Live-økta lagrer** | Koble Precision-live til `WorkbenchSession`, logg og lokal kø. Reps, tid, kommentar og video følger øvelsen og eventuell `PositionTask`. Fjern syntetisk fallback og hardkodet tid fra produksjonsveien. | Kode · levering 1 | ExerciseNotes og LiveClock låst; eget ja før eventuell migrering | Integrasjonstest leser alle registreringene tilbake. Offline-test registrerer, lukker/åpner og synkroniserer uten tap eller dublett. | 3–5 små PR-er |
| **3 · Én økttabell** | Flytt live-tavle, oppsummering, analyse og korrelasjon til Workbench-lesere. Lag kontrollert overgang for historiske `TrainingSessionV2`/`TrainingPlanSession` uten datatap. | Kode · levering 2 | Milepæl 2; godkjent datakart; eget ja før migrering/backfill | Samme økt-ID vises i plan, live, tavle og analyse. Tellingsrapport viser likt antall før/etter overgang. | 3–5 PR-er |
| **4 · Cockpit og meldinger** | LiveBoard fra Workbench og D-04. Tekst først, deretter bilde/video/lyd som `MessageAttachment`; 15 sekunders oppdatering i synlig fane og Web Push ellers. Meldingen havner også i tråden. | Kode · levering 3 | Milepæl 3; CoachMessage/VoiceNote/Composer låst; samtykkereglene klare | Ende-til-ende-test for tekst og hvert vedlegg; tilgangstest; klokketest viser at live-tiden fortsetter. | 4–6 PR-er |
| **5 · Treningsanalyse** | Tid per område × sted, banespill mot golfslag og putting per avstand. Samme grunnlag for spiller, én spiller hos coach og gruppe. Hvert tall åpner kilder. | Kode · levering 4 | Milepæl 2–3; puttebånd besluttet | Kontrollerte fixtures summerer likt i rålogger og alle tre visninger. Tom/ufullstendig data vises som `—`, ikke 0. | 3–5 PR-er |
| **6 · SG-analyse** | Klikkbare tapstall i PlayerHQ/AgencyOS, SG-kategoripanel og korrelasjon med logget trening. Respekter `roundType`, turneringstilknytning og D-19. | Kode · levering 5 | Milepæl 5; nok runde- og treningsdata | Test av negativt tegn/farge, åpning av panel, periodeavgrensning, rollefilter og korrelasjon. | 3–5 PR-er |
| **7 · Spillerprofiler** | Bilde/initialer og komplett dashboard i AgencyOS, WANG og Team Norway, med trening dag/uke/måned og D-04. Fjern WANG-demokildene fra produksjonsveien. | Kode · levering 6 + skjermer | Milepæl 3 og 5; profiler i A/B avstemt | Samme syntetiske spiller gir samme treningstall i alle tre flater; deling av/på skjuler eller viser korrekt. | 3–5 PR-er + 2–3 skjermrunder |
| **8 · Rask score** | Egen rundetype for score per hull; aldri SG-grunnlag. QuickScoreEntry kobles til lagring. | Kode · levering 7 | Rundetype og design låst; eventuelt migreringsja | Test oppretter runden, viser brutto score og beviser at alle SG-utregninger hopper over den. | 1–2 PR-er |
| **9 · Metric med vurdering** | Innfør eksplisitt `assessment` og gå gjennom alle endringstall. Lavere score kan være forbedring. | Kode · levering 8 | Metric-kontrakten i Precision 2.32.0 | Komponenttester med samme positive/negative tall og tre ulike vurderinger; visuell stikkprøve av alle treff. | 2–3 PR-er |
| **10 · Lukk B og pilot** | Bygg de gjenstående B-skjermene, fjern alle demofallbacker fra lanseringsruter, gjennomfør tilgjengelighets-/formatkontroll og en avgrenset pilot. | Alle tre spor | Milepæl 0–9 | 54/54 avstemt, 0 kjente demoavvik, grønne kvalitetsporter, godkjente skjermer og pilotprotokoll med lukkede kritiske feil. | Om lag 19 skjermrunder + 4–8 PR-er, justeres etter milepæl 0 |

## 5. Avstand mellom skjerm og kode

### Statusoppsummering for den foreløpige arbeidskoblingen

| Omfang | Finnes | Delvis | Mangler | Sum |
|---|---:|---:|---:|---:|
| A · fem krav | 0 | 21 | 2 | 23 |
| B · nødvendig lanseringsflyt | 25 | 6 | 0 | 31 |
| **Totalt** | **25** | **27** | **2** | **54** |

Tallene gjelder kodegjennomgangen av arbeidskoblingen nedenfor. De er ikke en påstand om at den eksterne A/B-listen er identisk; den identiteten er **ukjent** frem til milepæl 0.

### A · de fem kravene (23 arbeidsrader)

| Skjerm-ID | Rute | Status i koden | Neste steg |
|---|---|---|---|
| A-arbeid-01 · **AG-01 Cockpit** | `/admin/agencyos` | Delvis | Ruten og ekte booking-/oppgavedata finnes, men dagens kalender bygger på `Booking`, ikke den bestemte økttabellen. Bytt til Workbench-økter og LiveBoard etter levering 2–3. Kilder: `src/app/admin/agencyos/page.tsx`, `src/lib/agencyos/daily-brief-data.tsx`. Demo: ingen kjent statisk demo i denne veien. |
| A-arbeid-02 · **AG-07 Stall** | `/admin/spillere` | Delvis | Ekte spillerdata og «Trener nå» fra `WorkbenchSession` finnes. Koble samme status og melding til LiveBoard og håndhev D-04. Kilder: `src/app/admin/spillere/page.tsx`, `src/lib/admin/stall-precision-data.ts`. Demo: nei i undersøkt vei. |
| A-arbeid-03 · **AG-13 LiveBoard/live-økt** | `/admin/agencyos/live`, `/admin/agencyos/live/[sessionId]` | Delvis | Tavlen og detaljen finnes med ekte data, men begge leser `TrainingSessionV2`. Meldingen skrives i `completedSummary.coachMessages[]`, ikke i spillerens tråd. Flytt til Workbench + felles meldingsmodell. Kilder: `src/lib/agencyos/live-tavle-data.ts`, `src/lib/agencyos/live-okt-data.ts`, `src/lib/agencyos/live-okt-actions.ts`. Demo: nei. |
| A-arbeid-04 · **PH-01 I dag** | `/portal` | Delvis | Ekte dashboardlastere finnes. Legg inn CoachMessage fra den aktive økta og samme Workbench-status som LiveBoard. Kilder: `src/app/portal/page.tsx`, `src/app/portal/actions.ts`. Demo: ingen kjent statisk demo i siden. |
| A-arbeid-05 · **PH-04 Live før start** | `/portal/live/[sessionId]/brief` | Delvis | Ruten kan lese ekte Workbench-data, men leser også to gamle økttyper og bruker `DEFAULT_DRILLS`/syntetisk økt når data mangler. Fjern fallback og avvis ukjent ID tydelig. Kilder: sidefilen og `src/lib/portal-live/load-ph04-07.ts`. Demo: ja, som fallback. |
| A-arbeid-06 · **PH-05 Live aktiv** | `/portal/live/[sessionId]/active` | Delvis | Precision-skjermen endrer bare React-tilstand og går til oppsummering uten serverlagring. Den starter på hardkodede 1452 sekunder. Koble den til Workbench, eksisterende offlinekø og LiveClock. Kilder: `src/components/portal/precision/PH05LiveAktiv.tsx`, `src/lib/portal-live/load-ph04-07.ts`. Demo: ja, øvelsesfallback og hardkodet tid. |
| A-arbeid-07 · **PH-07 Etter økt** | `/portal/live/[sessionId]/summary` | Delvis | Oppsummeringen finnes, men kan bygge på de samme syntetiske/parallelle kildene og kan ikke bevise at PH-05 lagret noe. Les bare den fullførte Workbench-økta. Kilder: sidefilen og `src/lib/portal-live/load-ph04-07.ts`. Demo: ja, som fallback. |
| A-arbeid-08 · **PH-TP-01 Teknisk oppgave** | `/portal/tren/teknisk-plan/[planId]` | Delvis | Reps og kommentar kan allerede skrives til `PositionTaskLog`, men spilleren kan ikke legge video på oppgaven i denne skjermen. Koble ExerciseNotes-video og Workbench-økt. Kilder: `src/components/portal/precision/PHTP01TekniskPlan.tsx`, `src/app/portal/tren/teknisk-plan/actions.ts`, modellene `PositionTask` og `PositionTaskLog`. Demo: nei. |
| A-arbeid-09 · **AG-08 Spiller 360** | `/admin/spillere/[id]` | Delvis | Ekte profil- og analysegrunnlag finnes, men profilbildet som lastes brukes ikke som ferdig dashboard, og treningsanalysen bygger ikke fullt på Workbench. Kilder: sidefilen, `src/lib/admin-spiller/spiller360-data.ts`, `src/components/admin/precision/AG08Stats.tsx`. Demo: nei i hovedlasteren. |
| A-arbeid-10 · **AG-09 Stats/runder** | `/admin/analyse`, `/admin/runder` | Delvis | Ekte analyse- og rundedata finnes, men ikke den bestilte klikkbare SG-sammenligningen eller komplette Workbench-treningsgrunnlaget. Kilder: `src/app/admin/analyse/page.tsx`, `src/app/admin/runder/page.tsx`, `src/lib/admin/analyse/lastere.ts`. Demo: nei i hovedveien. |
| A-arbeid-11 · **AG-A02 Spilleranalyse** | `/admin/analyse?fane=spiller`, `/admin/spillere/[id]/analyse` | Delvis | Spillerlisten finnes, mens spillerruten sender videre til Spiller 360. Bygg TrainingAnalysis og SGCategoryPanel som detalj under Spiller 360, ikke en ny sannhet. Kilder: `src/app/admin/analyse/page.tsx`, `src/app/admin/spillere/[id]/analyse/page.tsx`. Demo: nei. |
| A-arbeid-12 · **AG-A03 Gruppeanalyse** | `/admin/analyse?fane=stall` | Delvis | Stallanalyse med ekte data finnes, men ikke bestilt TrainingAnalysis per område × sted med åpent grunnlag for gruppen. Kilder: `src/app/admin/analyse/page.tsx`, `src/lib/admin/analyse/lastere.ts`. Demo: nei. |
| A-arbeid-13 · **PH-16 Stats** | `/portal/analysere` | Delvis | Runde- og TrackMan-data er ekte, men trening er eksplisitt tom med teksten «ØKTLOGG IKKE KOBLET HIT ENNÅ». SG-tap er heller ikke ferdig klikkbart panel. Kilder: `src/lib/portal-analyse/ph16-stats-data.ts`, `src/components/portal/precision/PH16Stats.tsx`. Demo: nei; tomt grunnlag i stedet. |
| A-arbeid-14 · **PH-17 Stats · TrackMan** | `/portal/analysere/trackman`, `/portal/analysere/trackman/[id]` | Delvis | Ekte TrackMan-ruter finnes, men de er ikke samlet med logget treningsmengde i TrainingAnalysis/SGCategoryPanel. Kilder: sidefilene og `src/lib/portal-analyse/ph16-stats-data.ts`. Demo: ingen kjent i hovedveien. |
| A-arbeid-15 · **PH-18 Runder** | `/portal/mal/runder`, `/portal/mal/runder/[id]`, `/portal/analysere/hull` | Delvis | Ekte `Round`, hull og SG finnes, men rundetype, hurtigscore og klikkbar trening-mot-turnering er ikke ferdig som én reise. Kilder: sidefilene, modellen `Round`, `src/lib/runde-logg/kontrakt.ts`. Demo: ingen kjent i hovedveien. |
| A-arbeid-16 · **PH-A02 Treningsbelastning** | `/portal/analysere/trening/belastning` → del av PH-16 | Delvis | Egen rute finnes ikke; funksjonen skal ligge i Stats › Trening. Koble Workbench-tid og eksplisitt vurdering. Kilder: `docs/design-system/skjermliste-precision-athletics.md`, `src/lib/portal-analyse/ph16-stats-data.ts`. Demo: nei; data mangler. |
| A-arbeid-17 · **PH-A03 Øktkvalitet** | `/portal/analysere/trening/okter` → del av PH-16 | Delvis | Egen rute finnes ikke; planlagt mot gjennomført skal leses fra samme Workbench-økt som live lagrer. Kilder: designskjermlisten, `src/components/admin/precision/TreningsvolumVisning.tsx`, `src/lib/portal-analyse/ph16-stats-data.ts`. Demo: nei; kobling mangler. |
| A-arbeid-18 · **PH-A05 Putting per avstand** | `/portal/analysere/trening/naerspill` → del av PH-16 | Mangler | Ingen kode gir trening i putting per avstandsbånd fra loggede økter. Beslutt bånd, lagre avstanden på Workbench-loggen og bygg grunnlagstabellen. Kilder: designskjermlisten, `prisma/schema.prisma`, `src/lib/portal-analyse/ph16-stats-data.ts`. Demo: ikke relevant. |
| A-arbeid-19 · **PH-RD-01 Velg rundenivå** | `/portal/mal/runder/ny` | Delvis | Velgeren og ekte banedata finnes. Fullfør kontrakten mot uttrykkelig rundetype og QuickScoreEntry. Kilder: sidefilen og `src/components/portal/precision/PHRD01VelgNiva.tsx`. Demo: nei i velgeren. |
| A-arbeid-20 · **PH-RD-06 Rask score** | `/portal/mal/runder/ny?flyt=scorekort` | Delvis | Hullscore kan lagres med ekte `Round`/`HoleScore`, men hurtigscore er ikke en egen type som alle SG-lesere uttrykkelig utelater. Kilder: `src/app/portal/mal/runder/ny/page.tsx`, `src/app/portal/mal/runder/ny/actions.ts`, modellen `Round`. Demo: nei i lagringen. |
| A-arbeid-21 · **TN-02 spillerprofil** | `/team-norway/spiller/[spillerId]/oversikt` | Delvis | Ekte profil, tester og turneringer finnes. Profilen bruker initialer selv om `avatarUrl` finnes, og mangler trening per dag/uke/måned. Kilder: sidefilen og `src/components/team-norway/skjermer/tn-spillerprofil-skjerm.tsx`. Demo: nei i profilen. Repoets kobling til ekstern TN-ID er **ukjent** i `docs/design-system/skjermregister.json`. |
| A-arbeid-22 · **WANG B8 Elev-ark/dashboard** | `/team-wang/elev/[id]` | Mangler | Ruten står som dekningshull i repoets skjermregister og finnes ikke under `src/app/team-wang`. WANG-coachflaten blander ekte roster med demokomponenter og hardkodede sesongdata. Bygg dashboardet på ekte, delte data. Kilder: `docs/design-system/skjermregister.json`, `src/app/team-wang/coach/WangCoachKlient.tsx`, `src/app/team-wang/_data/live-sesong.ts`. Demo: ja i dagens WANG-flate. |
| A-arbeid-23 · **AG-16 Grupper** | `/admin/grupper`, `/admin/grupper/[id]` | Delvis | Ekte grupper og medlemmer finnes. Legg TrainingAnalysis for gruppe inn uten rangering og med D-04. Kilder: `src/app/admin/grupper/page.tsx`, `src/app/admin/grupper/[id]/page.tsx`, modellene `Group` og `GroupMember`. Demo: nei i hovedveien. |

### B · nødvendig lanseringsflyt (31 arbeidsrader)

| Skjerm-ID | Rute | Status i koden | Neste steg |
|---|---|---|---|
| B-arbeid-01 · **PH-03 Øktark** | `/portal/tren/wb/[sessionId]`, `/portal/gjennomfore/[id]` | Finnes | Ekte Workbench-økt lastes. Behold funksjonen og kontroller den visuelt mot valgt B-skjerm. Kilder: sidefilene og `src/lib/workbench/wb-actions.ts`. Demo: nei. |
| B-arbeid-02 · **PH-06 Fysisk live** | `/portal/live/[sessionId]/tapper` | Delvis | Lagring og offlinekø finnes, men siden bruker samme flerkildelaster og kan falle tilbake til syntetiske data. Flytt til Workbench og avklar miljø/press for Fysisk. Kilder: sidefilen, `src/lib/portal-live/load-ph04-07.ts`, `src/lib/offline-queue/tapper-queue.ts`. Demo: ja, som fallback. |
| B-arbeid-03 · **PH-08 Runde live** | `/portal/runde/live`, `/portal/mal/runder/[id]/slag` | Delvis | Ekte runder kan lagres, men baner og 18 hull kan falle tilbake til hardkodede data ved tom base eller feil. Feil skal vises som feil/tom tilstand. Kilder: sidefilene og `src/lib/portal-runder/load-ph08-09.ts`. Demo: ja, som fallback. |
| B-arbeid-04 · **PH-09 Registrer runde** | `/portal/runde/logg`, `/portal/mal/runder/ny` | Delvis | Ekte rundelagring finnes, men samme bane-/hullfallback kan se ekte ut. Fjern den fra produksjonsveien og behold brutto score. Kilder: sidefilene, `src/components/portal/precision/PH09RegistrerRunde.tsx`, `src/lib/portal-runder/load-ph08-09.ts`. Demo: ja, som fallback. |
| B-arbeid-05 · **PH-10 Plan** | `/portal/planlegge` | Finnes | Ekte kalender-, Workbench- og plandata lastes. Avslutt visuell kontroll og koble alle startlenker til samme økt-ID. Kilder: sidefilen, `src/lib/kalender-lag/player-dag.ts`, `src/lib/portal/plan-data.ts`. Demo: ingen kjent. |
| B-arbeid-06 · **PH-11 Workbench spiller** | `/portal/planlegge/workbench` | Finnes | Ekte Workbench-lasere finnes for år, periode, måned, uke og live. Kontroller mot de åtte planstegene når Anders har besluttet dem. Kilder: sidefilen og `src/lib/workbench/wb-actions.ts`. Demo: ingen kjent i hovedveien. |
| B-arbeid-07 · **PH-12 Velg treningsplan** | `/portal/planlegge/bygger` | Finnes | Ekte planer og anbefaling brukes. Kontroller språk og at alle planer kan velges uten låsing. Kilder: sidefilen, `src/lib/plan-builder/index.ts`, `src/lib/plan-builder/velg-plan.ts`. Demo: nei. |
| B-arbeid-08 · **PH-13 Øvelsesbank** | `/portal/drills`, `/portal/drills/[id]` | Finnes | Ekte `ExerciseDefinition`/øvelsesdata finnes. Avstem den komplette øvelsesflyten etter Anders' beslutning. Kilder: sidefilene og `src/lib/portal-drills/drills-data.ts`. Demo: nei i hovedveien. |
| B-arbeid-09 · **PH-14 Tester** | `/portal/tren/tester`, `/portal/tren/tester/[testId]` | Finnes | Ekte testdefinisjoner, resultater og økter leses. Gjør visuell og rollebasert kontroll. Kilder: sidefilene og `src/lib/portal-tester/tester-data.tsx`. Demo: nei. |
| B-arbeid-10 · **PH-15 Gjennomfør test** | `/portal/tren/tester/[testId]/gjennomfor` | Finnes | Ekte `TestDefinition`, `TestSession` og `TestResult` brukes. Kontroller alle protokoller og offlineutkast. Kilder: sidefilen og `src/lib/portal-tester/tn-draft.ts`. Demo: nei. |
| B-arbeid-11 · **PH-21 Innboks** | `/portal/coach` med underruter | Delvis | Ekte tråd, spørsmål, videoer og planer finnes, men live-coachmeldingen bruker en annen lagring, vedlegg er ikke samlet gjennom `MessageAttachment`, og en standard velkomst legges inn ved tom tråd. Samle dette i levering 3. Kilder: `src/lib/portal-coach/ph21-queries.ts`, `src/lib/agencyos/live-okt-actions.ts`, modellen `MessageAttachment`. Demo/plassholder: ja, standard velkomst. |
| B-arbeid-12 · **PH-23 Booking spiller** | `/portal/booking` med steg | Finnes | Ekte tjenester, tider og bookinger brukes. Kjør akseptkontroll etter Booking-innholdet er besluttet. Kilder: `src/app/portal/booking/page.tsx`, `src/lib/portal-booking/ph23-side-data.ts`. Demo: nei. |
| B-arbeid-13 · **PH-24 Meg** | `/portal/meg` med underruter | Finnes | Ekte profil, bookinger, foreldre, fasiliteter, helse og utstyr lastes. Legg bare inn endringer som følger den godkjente B-skjermen. Kilder: sidefilen og `src/lib/portal/profil-flate-data.ts`. Demo: ingen kjent i hovedveien. |
| B-arbeid-14 · **PH-25 Innstillinger** | `/portal/meg/innstillinger` med underruter | Delvis | Ruten bruker ekte abonnement, men kan vise standardfakturaer, hardkodet Visa-kort, samtykker, varselvalg og 2FA-status. Erstatt alt med ekte data eller `—`/tomtilstand. Kilde: `src/app/portal/meg/innstillinger/page.tsx`. Demo: ja. |
| B-arbeid-15 · **PH-27 Deling** | `/portal/meg/deling` | Finnes | Navngitt deling og tilgangsvakter finnes etter S1–S3. Behold og kjør ende-til-ende-kontroll for D-04 og under 16. Kilder: sidefilen og `src/lib/deling/navngitt.ts`. Demo: nei. |
| B-arbeid-16 · **AG-04 Innboks** | `/admin/kommunikasjon` | Finnes | Ekte lastere og rollefilter finnes. Koble coachens live-melding til samme tråd i levering 3. Kilder: sidefilen og `src/lib/admin/kommunikasjon/lastere.ts`. Demo: nei i hovedveien. |
| B-arbeid-17 · **AG-05 Kalender** | `/admin/kalender` | Finnes | Ekte Workbench- og kalenderlag lastes. Kontroller alle coachroller, flytting og varsling. Kilder: sidefilen, `src/lib/workbench/wb-actions.ts`, `src/app/admin/kalender/lag/data.ts`. Demo: nei. |
| B-arbeid-18 · **AG-06 Booking coach** | `/admin/bookinger/ny`, `/admin/bookinger/[id]`, `/admin/services` | Finnes | Ekte spillere, tjenester, steder og tilgjengelighet brukes. Avstem mot besluttet Booking-komponent. Kilder: sidefilene og modellen `Booking`. Demo: nei. |
| B-arbeid-19 · **AG-10 Teknisk plan** | `/admin/spillere/[id]/plan/[planId]` | Finnes | Ekte teknisk plan og oppgaver brukes. Koble mediet og Workbench-loggen fra levering 1; avstem Fysisk/press-beslutningen der den gjelder. Kilder: sidefilen, `src/lib/teknisk-plan/tp-last.ts`, modellene `TechnicalPlan` og `PositionTask`. Demo: nei. |
| B-arbeid-20 · **AG-11 Workbench coach** | `/admin/workbench/[playerId]`, `/admin/grupper/[id]/workbench` | Finnes | Ekte Workbench-data for spiller og gruppe finnes. Kontroller planstegene og at D-76 foreslår uten å låse. Kilder: sidefilene og `src/lib/workbench/wb-actions.ts`. Demo: ingen kjent i hovedveien. |
| B-arbeid-21 · **AG-12 Øktoppsummering** | `/admin/gjennomfore/okter/[id]` | Delvis | Ekte booking leses, men detaljen finner økta via `Booking.trainingSessionV2Id` og `lastLiveOktData`. Flytt til Workbench-referanse i levering 2. Kilder: sidefilen og `src/lib/agencyos/live-okt-data.ts`. Demo: nei. |
| B-arbeid-22 · **AG-14 Plan og maler** | `/admin/plan`, `/admin/plan-templates/*` | Finnes | Ekte Workbench-økter, maler og øvelser lastes. Kontroller den komplette øvelsesflyten etter Anders' beslutning. Kilder: sidefilene og `src/lib/agencyos/planhub-data.ts`. Demo: nei. |
| B-arbeid-23 · **AG-15 Tester** | `/admin/tester` med underruter | Finnes | Ekte testøkter og testresultater brukes. Kontroller tildeling og tillatelser. Kilder: sidefilen og `src/lib/portal-tester/admin-resultat-data.ts`. Demo: nei. |
| B-arbeid-24 · **AG-23 Oppsett/OrgSettings** | `/admin/oppsett`, `/admin/profile`, `/admin/team/*` | Finnes | Ekte bruker- og teamdata brukes. Portér bare den ferdige OrgSettings-kontrakten og kontroller alle roller. Kilder: sidefilene og `src/lib/admin/oppsett/last-oppsett-data.ts`. Demo: nei. |
| B-arbeid-25 · **AU-01 Logg inn** | `/auth/login`, `/auth/logget-ut`, `/auth/bankid` | Finnes | Innlogging finnes. Kontroller feil, låst bruker, returadresse og mobil. Kilder: sidefilene og `src/components/auth/LoginView.tsx`. Demo: nei i produksjonsruten. |
| B-arbeid-26 · **AU-04 Oppstart** | `/auth/onboarding`, `/auth/onboarding/forelder` | Finnes | Persistente steg og gjenopptak finnes. Kontroller synlig ordlyd og avhengige valg etter Anders' beslutninger. Kilder: sidefilene og `src/lib/auth/onboarding-state.ts`. Demo: nei. |
| B-arbeid-27 · **AU-05 Samtykke via lenke** | `/auth/guardian-consent/[token]`, `/auth/lyd-samtykke/[token]` | Finnes | Ekte invitasjon/samtykke leses. Behold S1–S3 og kjør rolle-/utløpstester. Kilder: sidefilene og modellene `ParentInvitation`/samtykkemodeller i `prisma/schema.prisma`. Demo: nei. |
| B-arbeid-28 · **BK-01 Velg tjeneste** | `/booking` | Finnes | Ekte tjenester og sted lastes, og pausetilstand finnes. Ny Precision-komponent venter på innholdsbeslutningen. Kilder: `src/app/(marketing)/booking/page.tsx`, `src/lib/booking/offentlig-booking.ts`. Demo: nei. |
| B-arbeid-29 · **BK-02 Velg tid og betal** | `/booking/[slug]`, `/booking/[slug]/bekreft` | Finnes | Ekte tjeneste, tilgjengelighet og bookingflyt finnes. Kontroller betaling og feil uten ekte betaling i automatiske tester. Kilder: sidefilene og `src/lib/booking/availability.ts`. Demo: nei. |
| B-arbeid-30 · **BK-03 Kvittering** | `/booking/kvittering/[bookingId]` | Finnes | Ekte booking leses og tilgang begrenses. Kontroller kvittering, kalenderfil og tom/ugyldig ID. Kilde: sidefilen. Demo: nei. |
| B-arbeid-31 · **SY-01 Systemtilstander** | `/offline`, `/vedlikehold`, 404 og 500 | Finnes | Rutene/feilgrensene finnes. Kontroller at de bruker Precision, forklarer neste handling og virker uten nett. Kilder: `src/app/offline/page.tsx`, `src/app/vedlikehold/page.tsx`, systemkomponentene under `src/components/system`. Demo: nei. |

## 6. Beslutninger Anders må ta

| Beslutning | Hva den blokkerer | Senest når |
|---|---|---|
| **Offisiell A/B-eksport**: ID, navn, rute og status for 23 + 31 skjermer | Eksakt skjermdekning, riktige statusantall og rekkefølge på de om lag 19 B-skjermene | Før første skjerm-PR; milepæl 0 |
| **De åtte trinnene for å planlegge en komplett øvelse** | PH-11, PH-13, AG-11, AG-14 og skjemaet for ExerciseNotes/lagring | Før visuell ferdigstilling av disse B-skjermene og før levering 1 låser alle felter |
| **Om Fysisk skal ha treningsmiljø og press** | Datakontrakten for fysisk live, planlegging og analyse | Før eventuell migrering i levering 1 og før PH-06 godkjennes |
| **Ordene fra 2.29.0** | Synlig tekst, hjelpetekst, skjermlesernavn og endelig visuell kontroll | Før en A- eller B-skjerm med de berørte ordene godkjennes |
| **Avstandsbånd for putting**: blant annet 10–25 mot 15–25 fot | Lagringsfelt, aggregering, TrainingAnalysis, SGCategoryPanel og tester | Før datakontrakten i levering 1 låses; absolutt før levering 4 |
| **Innhold i Booking** | Nye designkomponenter og endelig BK-01–03/PH-23/AG-06 | Før milepæl 1 avsluttes |
| **Innhold i Talent** | Eventuelle A/B-skjermer, AG-22 og hvem som ser hva | Før milepæl 1 avsluttes; Data Golf forblir bare analytiker uansett |
| **Innhold i oppmøte/fravær** | Gruppeøkter, WANG, analyse og eventuell status i profil | Før levering 4s aggregering og før aktuell B-skjerm bygges |
| **Premium-bilder ved lansering eller senere** | Bare bildeproduksjon og kort som bruker disse; ikke datagrunnmuren | Før siste visuelle godkjenning. Anbefaling: etter pilot dersom kortene fungerer uten dem |

Ingen av beslutningene gir i seg selv godkjenning til en databasemigrering. Hvert konkret skjemaendringsforslag skal beskrives og godkjennes separat.

## 7. De fem største risikoene

| Risiko | Konsekvens | Tiltak |
|---|---|---|
| **1 · Skjermfasiten og repoet har ikke samme register** | Feil skjerm bygges, en B-skjerm glemmes, eller statusrapporten blir misvisende. | Gjør milepæl 0 før all skjermportering. Én ekstern skjerm-ID skal ha én repo-rute, versjon og eier. |
| **2 · Parallelle økttabeller skaper datatap og doble sannheter** | Spilleren kan gjennomføre en økt som cockpit eller analyse ikke finner. | Gjør `WorkbenchSession` kanonisk ende til ende. Bruk lesesammenligning, idempotent backfill og tellingsrapport før gamle lesere slås av. Ingen sletting i disse PR-ene. |
| **3 · Dårlig nett og store mediefiler** | Reps, kommentarer eller video forsvinner, eller spilleren får en falsk «lagret»-bekreftelse. | Gjenbruk den brukeravgrensede IndexedDB-køen, bruk idempotensnøkkel, direkte privat opplasting for media, synlig lokal/synket status og retry ved fokus/nett tilbake. |
| **4 · Demodata ser ut som ekte spillerdata** | Coach tar beslutninger på feil grunnlag og tilliten faller. | Fjern alle produksjonsfallbacker; vis tom eller feil tilstand. Behold en automatisk test som forbyr demokomponenter/litteraler på lanseringsruter, og utvid den til WANG og de kjente fallbackfilene. Kilde for dagens kontroll: `src/lib/__tests__/ingen-demovisning-i-ruter.test.ts`. |
| **5 · Medier og analyse vises til feil mottaker** | Brudd på samtykke, D-04 eller D-19, særlig for mindreårige. | Autoriser hver lesing på serveren, ikke bare menyen. Test spiller, foresatt, egen coach, annen coach, WANG, Team Norway og analytiker. Logg ikke filinnhold eller persondata. |

## 8. Det som bevisst venter til etter lansering

Følgende holdes utenfor første lansering med mindre Anders uttrykkelig flytter det inn:

- alle 79 C-skjermer fra det eksterne skjermregisteret
- premium AI-bilder per pyramideakse og øvelseskategori; kortene må fungere med nøytral, godkjent reservevisning
- full sanntidsinfrastruktur som WebSocket/Supabase Realtime. Første versjon bruker 15 sekunders oppdatering i synlig live-økt, oppdatering ved fokus/nett tilbake og Web Push
- avansert baneguide, Apple-kalender og annet som skjermlisten allerede merker som senere
- opprydding eller sletting av gamle skjermer, filer og tabeller. Først skal bruken måles, historiske data kontrolleres og egen sletteplan godkjennes
- vitnegodkjenning av tester og andre funksjoner som skjermlisten uttrykkelig har lagt senere
- forbedringer i beholdte AgencyOS-flater som ikke trengs for de fem kravene eller en ubrutt lanseringsreise

Dette kan ikke automatisk skyves etter lansering:

- A17/A19, berøring, skjermleser og norsk tallformat
- de tre tomme rammene dersom de ligger i A eller B
- Booking, Talent eller oppmøte/fravær dersom milepæl 0 viser at de ligger i B
- personvern, samtykke, D-04, D-19, offline-lagring eller fjerning av demodata

## Forslag til nye felt og migreringer — ikke godkjent for gjennomføring

De eksisterende modellene kan ikke alene knytte hele gjennomføringen til `WorkbenchSession`: `WorkbenchDrill` har planfelter, men ingen gjennomføringslogger; `SessionDrillNote` er bundet til `SessionDrillInstance`/`TrainingSessionV2`; `PositionTaskLog` har bare `sessionV2Id`; og `PlayerSwingVideo` har en løs `liveSessionKind`/`liveSessionId`-kobling. Kilde: `prisma/schema.prisma`.

Følgende skal utredes som additive forslag, i egne PR-er og med eget skriftlig migreringsja:

1. En kanonisk Workbench-gjennomføringslogg per øvelse med idempotensnøkkel, reps, faktisk tid, område, sted, avstand, tidspunkt og hvem som logget.
2. Et Workbench-notat per øvelse med type tekst/video, tidspunkt og sikker mediereferanse. Alternativet er å generalisere `SessionDrillNote`; valget må dokumentere hvordan historiske rader beholdes.
3. En Workbench-referanse på `PositionTaskLog`, og en teknisk-oppgavekobling på video/notat, slik at samme handling kan leses både fra økta og oppgaven uten dobbeltelling.
4. En uttrykkelig Workbench-kobling for coachmeldinger og vedlegg, samtidig som meldingen lagres i eksisterende samtaletråd og `MessageAttachment`.
5. En uttrykkelig hurtigscoreverdi i `Round.roundType` eller et like tydelig felt som alle SG-spørringer kan filtrere på.

Før et forslag sendes til godkjenning skal PR-en vise felter, indekser, tilgang, tilbakefylling, reversering og bevis på at eksisterende data ikke går tapt. Ingen gammel tabell slettes som del av lanseringsløpet.

## Ukjent ved denne gjennomgangen

- Den offisielle én-til-én-listen over de 23 A- og 31 B-skjermene, inkludert hvilke rundt 19 B-skjermer som gjenstår.
- Resultatet av A17 og A19, fordi de ikke er kjørt.
- Faktisk kvalitet på berøring, skjermleser og norsk tallformat i hele Precision 2.32.0, fordi dette ikke er testet.
- Hvilke tre kort som har tomme rammer, og om de tilhører A, B eller C.
- Endelig innhold i Booking, Talent og oppmøte/fravær.
- De åtte planleggingstrinnene, Fysisk-regelen, ordene fra 2.29.0 og endelige puttebånd.
- Om premium-bildene skal være et lanseringskrav og når de foreligger.
- Den faktiske datatilstanden, historiske radmengden og eventuelle avvik i produksjonsdatabasen; produksjon ble ikke lest eller rørt.
- Faktisk oppførsel og visuell likhet i deployet app for de 54 arbeidsradene; denne fasen er en statisk kode- og dokumentgjennomgang, ikke en kjørt app-test.
