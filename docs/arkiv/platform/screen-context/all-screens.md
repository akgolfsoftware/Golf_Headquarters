# Screen Context — AK Golf HQ (30 viktigste skjermer)

Generert: 11. juni 2026. Kilde: MASTER-SKJERMPLAN + Prisma-schema + route-tre.

Brukes av agenter og utviklere som kontekst FØR arbeid på en skjerm starter.
Design under aktiv utvikling (2026-07-03) — ingen fasit-pekere per skjerm akkurat nå, se `CLAUDE.md`.
Resten av dokumentet (formål, data, flyt) er fortsatt fra 11. juni og kan ha driftet noe fra kodebasen siden.

---

## PlayerHQ — 16 skjermer

---

## Hjem — `/portal`

**Formål:** Spillerens daglige startpunkt — viser dagens fokus, neste økt, turneringsstatus og pyramide-fremgang i én oversikt.

**Bruker:** Innlogget spiller, daglig bruk, første skjerm etter login.

**Data inn:**
- `TrainingPlan` (aktiv plan for userId, inkl. `TrainingPlanSession` today + kommende)
- `Round` (siste runde, sgTotal)
- `TournamentEntry` (neste påmeldte turnering via `Tournament`)
- `User` (name, avatarUrl, hcp, tier)
- `Subscription` (gratis/PRO for tier-pill)
- `Goal` (aktive mål, status)
- `Notification` (uleste varsler, count)

**Data ut:** Ingen direkte skriving — navigasjonssentral. Knappen «Start økt» starter live-sesjon. «Workbench» åpner planlegging.

**Flyt:**
- Kommer fra: login (`/auth/login`), alle undersider via bunn-nav
- Leder til: Workbench (`/portal/planlegge/workbench`), Live aktiv (`/portal/(fullscreen)/live/[sessionId]/active`), Analysere (`/portal/analysere`), Meg (`/portal/meg`), Varsler (`/portal/varsler`)

---

## Planlegge — `/portal/planlegge`

**Formål:** Mobilinngang til planleggingsmodulen — ett trykkpunkt direkte til Workbench der spiller administrerer treningsplan.

**Bruker:** Spiller som vil se eller justere kommende uke, legge til økt, eller sjekke plan-fremgang.

**Data inn:**
- `TrainingPlan` (aktiv plan, periodisering via `PeriodBlock`)
- `TrainingPlanSession` (kommende økter, pyramide-fordeling)
- `SeasonPlan` (årsplan-periode, lPhase)
- `TournamentEntry` (turneringer i perioden)

**Data ut:** Navigerer til Workbench for redigering. Ingen direkte skriving på denne siden.

**Flyt:**
- Kommer fra: Hjem (`/portal`), bunn-nav
- Leder til: Workbench (`/portal/planlegge/workbench`), Årsplan (`/portal/tren/aarsplan`), Drills (`/portal/drills`)

---

## Workbench (spiller) — `/portal/planlegge/workbench`

**Formål:** Spillerens planleggingsverktøy — opprette, redigere og godkjenne treningsplaner, sette mål og be coach om justeringer.

**Bruker:** Spiller som planlegger trening, samarbeider med coach om plan-innhold.

**Data inn:**
- `TrainingPlan` (aktiv + draft-planer for userId)
- `TrainingPlanSession` (alle økter i planen, pyramideArea, scheduledAt, status)
- `SessionDrill` + `ExerciseDefinition` (drills per økt)
- `Goal` (aktive mål koblet til planen)
- `PlanAdjustment` (innsendte justeringsforespørsler, status PENDING/APPROVED)
- `SeasonPlan` + `PeriodBlock` (periodisering)
- `TournamentEntry` (turneringer som planlegges mot)

**Data ut:**
- Oppretter `TrainingPlanSession` via `CreateSessionSheet`
- Oppretter `TrainingPlan` via `CreatePlanSheet`
- Sender `PlanAdjustment` (PENDING) til coach
- Oppdaterer `Goal`

**Flyt:**
- Kommer fra: Planlegge (`/portal/planlegge`), Hjem (`/portal`)
- Leder til: Live aktiv (start økt), Årsplan (`/portal/tren/aarsplan`), Coach-planer (`/portal/coach/plans`)

---

## Gjennomføre — `/portal/gjennomfore`

**Formål:** Spillerens «I dag»-flate med tre faner: dagens treningsprogram, kalender og booking. Startpunkt for å sette i gang en økt.

**Bruker:** Spiller som skal gjennomføre dagens plan eller booke ny coaching-økt.

**Data inn:**
- `TrainingPlanSession` (dagens planlagte økter, status PLANNED/ACTIVE)
- `Booking` (kommende coaching-bookinger for userId)
- `TrainingPlanSessionLog` (gjennomførte økter i dag)
- `TrainingSessionV2` (aktive live-sesjoner, hostId)

**Data ut:**
- Starter live-sesjon → skriver `TrainingSessionV2` med status IN_PROGRESS
- Knapper til ny booking

**Flyt:**
- Kommer fra: Hjem (`/portal`), bunn-nav
- Leder til: Live aktiv (`/portal/(fullscreen)/live/[sessionId]/active`), Booking-hub (`/portal/booking`), Kalender (`/portal/kalender`), Ny økt (`/portal/ny-okt`)

---

## Live aktiv — `/portal/(fullscreen)/live/[sessionId]/active`

**Formål:** Fullskjerm trenings-cockpit under pågående økt — viser aktiv drill, timer, rep-teller og drill-fremgang.

**Bruker:** Spiller midt i en treningsøkt, typisk på range eller bane.

**Data inn:**
- `TrainingSessionV2` (sessionId, title, miljo, practiceType, status IN_PROGRESS)
- `TrainingDrillV2` (drills i økten, sortOrder, pyramide, durationMinutes)
- `SessionDrillInstance` (instanser per drill, plannedReps/Sets)
- `SessionSet` (loggede sett)
- `ExerciseDefinition` (drill-beskrivelse, videoUrl)

**Data ut:**
- Skriver `SessionSet` per fullført sett
- Skriver `DrillLogV2` (successRate)
- Oppdaterer `TrainingSessionV2.status` → COMPLETED ved avslutning
- Lagrer `completedSummary` JSON på sesjonen

**Flyt:**
- Kommer fra: Live brief (`/portal/(fullscreen)/live/[sessionId]/brief`), Gjennomføre
- Leder til: Live oppsummering (`/portal/(fullscreen)/live/[sessionId]/summary`), Live logger, Live tapper

---

## Live oppsummering — `/portal/(fullscreen)/live/[sessionId]/summary`

**Formål:** Post-sesjon sammendrag etter fullført økt — viser SG-utvikling, drill-score, tid brukt og anbefaling for neste økt.

**Bruker:** Spiller rett etter avsluttet treningsøkt.

**Data inn:**
- `TrainingSessionV2` (completedSummary JSON, startTime, endTime)
- `TrainingDrillV2` + `DrillLogV2` (drill-resultater, successRate per drill)
- `TrainingLog` (loggede SG-minutter for dagen, sgArea)
- `TrainingPlanSession` (planlagt økt som sesjonen tilsvarer, hvis koblet)
- `User` (hcp, avatarUrl for personalisert sammendrag)

**Data ut:**
- Oppdaterer `TrainingPlanSessionLog` (completedAt, rating, csAchieved)
- Lagrer `TrainingLog` for SG-volumkorrelasjon
- Kan sende `PlanAdjustment` (spiller ber coach om justering)

**Flyt:**
- Kommer fra: Live aktiv (`/portal/(fullscreen)/live/[sessionId]/active`)
- Leder til: Hjem (`/portal`), SG-Hub (`/portal/mal/sg-hub`), Analysere (`/portal/analysere`)

---

## Analysere — `/portal/analysere`

**Formål:** Spillerens analysehub med faner for SG, Runder, TrackMan, Tester og Innsikt — «Les tallene»-flaten.

**Bruker:** Spiller som vil forstå form og fremgang over tid.

**Data inn:**
- `Round` (siste 10–20 runder, sgTotal/sgOtt/sgApp/sgArg/sgPutt, playedAt)
- `TrackManSession` (siste sesjoner, shotCount, recordedAt)
- `TestResult` (siste testresultater per pyramideArea)
- `SgInsight` (AI-genererte innsikter, category, severity)
- `TrainingLog` (treningsvolum per sgArea siste 30 dager)

**Data ut:** Ingen direkte skriving — navigerer til detaljsider per kategori.

**Flyt:**
- Kommer fra: Hjem (`/portal`), bunn-nav
- Leder til: SG-Hub (`/portal/mal/sg-hub`), Runder (`/portal/mal/runder`), TrackMan (`/portal/mal/trackman`), Tester (`/portal/tren/tester`), Hull-analyse (`/portal/analysere/hull`)

---

## SG-Hub — `/portal/mal/sg-hub`

**Formål:** Strokes Gained-oversikt for alle 4 SG-kategorier (OTT/APP/ARG/PUTT) med trend, benchmark-sammenligning og svakhetsindikator.

**Bruker:** Spiller som vil forstå hvilke deler av spillet som koster flest slag.

**Data inn:**
- `Round` (sgOtt, sgApp, sgArg, sgPutt per runde, siste 20 runder)
- `SgBaseline` (PGA Tour Top 40-benchmarks per category + distanceBucket)
- `PgaPlayerSeason` (referansespillere for benchmark-sammenligning)
- `BrukerSgInput` (manuelt inntastede SG-tall)
- `TrainingLog` (korrelasjon trening → SG per område)
- `SgInsight` (AI-anbefalinger, svakeste område)

**Data ut:**
- Navigerer til kategori-detalj (`/portal/mal/sg-hub/[club]`)
- Navigerer til benchmark (`/portal/mal/sg-hub/benchmark`)

**Flyt:**
- Kommer fra: Analysere (`/portal/analysere`), Hjem (SG-widget)
- Leder til: SG-kategori-detalj, Benchmark, Best vs nå, TrackMan, Runder

---

## Runder (liste) — `/portal/mal/runder`

**Formål:** Liste over alle spillerens registrerte runder med score, SG-total og dato — utgangspunkt for å se utvikling over tid.

**Bruker:** Spiller som vil se historikk eller logge ny runde.

**Data inn:**
- `Round` (alle runder for userId, sortert nyeste først: playedAt, score, sgTotal, course via `CourseDefinition`)
- `CourseDefinition` (banenavn, par, slope, rating)
- `User` (hcp for kontekst)

**Data ut:** Navigerer til runde-detalj. Knapp til «Logg ny runde» (`/portal/mal/runder/ny`).

**Flyt:**
- Kommer fra: Analysere (`/portal/analysere`), SG-Hub
- Leder til: Runde-detalj (`/portal/mal/runder/[id]`), Logg ny runde (`/portal/mal/runder/ny`)

---

## Runde-detalj — `/portal/mal/runder/[id]`

**Formål:** Fullstendig gjennomgang av én runde med SG per kategori, hull-for-hull oversikt (der data finnes), og sammenligning mot snitt.

**Bruker:** Spiller etter en runde eller en coach som gjennomgår spillerens runde.

**Data inn:**
- `Round` (score, sgOtt/sgApp/sgArg/sgPutt og alle underkategorier, notes, playedAt)
- `CourseDefinition` (banenavn, par, rating, slope)
- `Shot` (hull-for-hull slag-data hvis registrert: holeNumber, holePar, lie, distanceToPin, shotType)
- `User` (hcp for kontekstuell sammenligning)

**Data ut:** Ingen skriving. Navigerer til slag-for-slag-visning hvis Shot-data finnes.

**Flyt:**
- Kommer fra: Runder (liste) (`/portal/mal/runder`)
- Leder til: Slag-for-slag (`/portal/mal/runder/[id]/shot-by-shot`), Del runde (`/portal/statistikk/runder/[runId]/del`)

---

## TrackMan (liste) — `/portal/mal/trackman`

**Formål:** Liste over alle TrackMan-sesjoner med dato, antall slag og miljø — gir oversikt over range-arbeid og teknisk utvikling.

**Bruker:** Spiller etter range-økt eller coach som vurderer teknisk progresjon.

**Data inn:**
- `TrackManSession` (alle sesjoner for userId: recordedAt, shotCount, environment, source)
- `TrackManShot` (aggregert per sesjon: avg ballSpeed, smashFactor, carryDistance)
- `ClubMetricTrend` (ukentlig trend per kølle: avgClubPath, avgFaceAngle, avgSmash)

**Data ut:** Navigerer til sesjon-detalj. Ingen direkte skriving.

**Flyt:**
- Kommer fra: Analysere (`/portal/analysere`)
- Leder til: TrackMan-sesjon (`/portal/mal/trackman/[id]`)

---

## Tester (oversikt) — `/portal/tren/tester`

**Formål:** Spillerens testoversikt med alle tilgjengelige og gjennomførte tester, NGF-pyramide-katalog og historisk trend per test.

**Bruker:** Spiller som skal gjennomføre en test eller se historisk utvikling mot NGF-normer.

**Data inn:**
- `TestDefinition` (alle tilgjengelige tester: name, pyramidArea, protocol JSON med benchmarks)
- `TestResult` (alle resultater for userId: score, takenAt, details JSON)
- `TestSession` (pågående eller fullførte sesjoner: status, currentStepIndex)
- `User` (hcp for nivå-kontekst)

**Data ut:** Starter ny testsesjon → oppretter `TestSession`. Navigerer til gjennomføring.

**Flyt:**
- Kommer fra: Analysere (`/portal/analysere`), Hjem (test-widget)
- Leder til: Test-detalj (`/portal/tren/tester/[testId]`), Gjennomfør test (`/portal/tren/tester/[testId]/gjennomfor`), Test-katalog (`/portal/tren/tester/katalog`)

---

## Drills (bibliotek) — `/portal/drills`

**Formål:** Drill-bibliotek for spiller — filtrer på pyramide-område, fasilitet og vanskelighetsgrad; finn øvelser å legge til i plan eller gjøre i dag.

**Bruker:** Spiller som planlegger økt eller leter etter nye øvelser.

**Data inn:**
- `ExerciseDefinition` (alle tilgjengelige drills: name, pyramidArea, fasilitetKrav, treningstype, description, source)
- `CoachDrillDirectiv` (coach-pin/block for denne spilleren: type PIN/BLOCK/PRIORITER)
- `User.tilgjengeligeFasiliteter` (spillerens tilgjengelige fasilitet-enum for filtrering)
- `SessionDrill` (hvilke drills er brukt i aktiv plan — markerer «i bruk»)

**Data ut:** Navigerer til drill-detalj. Kan legge drill til Workbench (via sheet).

**Flyt:**
- Kommer fra: Hjem, Planlegge, Workbench
- Leder til: Drill-detalj (`/portal/drills/[id]`), Workbench (legg til drill)

---

## Meg (profil) — `/portal/meg`

**Formål:** Spillerens profil-hub — viser abonnement, HCP, kontaktinfo, koblede kontoer og navigerer til alle innstillinger.

**Bruker:** Spiller som vil endre profil, sjekke abonnement eller administrere konto.

**Data inn:**
- `User` (name, email, avatarUrl, hcp, homeClub, role, tier, userStatus)
- `Subscription` (tier, status, currentPeriodEnd, creditsRemaining)
- `PlayerEnrollment` (aktiv coaching-pakke: program, coachId)
- `EquipmentBag` (driver, irons, putter for utstyr-oversikt)
- `Document` (antall dokumenter)
- `Notification` (uleste varsler, count)

**Data ut:** Ingen direkte skriving — navigasjonssentral til alle Meg-undersider.

**Flyt:**
- Kommer fra: bunn-nav, alle undersider via tilbake
- Leder til: Rediger profil (`/portal/meg/profil`), Abonnement (`/portal/meg/abonnement`), Innstillinger (`/portal/meg/innstillinger`), Helse (`/portal/meg/helse`), Utstyrsbag (`/portal/meg/utstyrsbag`), Dokumenter (`/portal/meg/dokumenter`), Hjelpesenter (`/portal/meg/help`)

---

## Booking-hub — `/portal/booking`

**Formål:** Oversikt over spillerens kommende og tidligere coaching-bookinger, med snarveier til ny booking og coach-profiler.

**Bruker:** Spiller som vil booke, ombooke eller sjekke bookinghistorikk.

**Data inn:**
- `Booking` (alle bookinger for userId: startAt, endAt, status, serviceType via `ServiceType`, facility via `Facility`, coach via `User`)
- `Subscription` (creditsRemaining — viser gjenstående klipp)
- `CoachAvailability` (neste ledige tid per coach)
- `ServiceType` (tilgjengelige tjenester: name, priceOre, durationMin)

**Data ut:** Navigerer til ny booking. Ingen direkte skriving på hubben.

**Flyt:**
- Kommer fra: Gjennomføre (`/portal/gjennomfore`), Hjem, Meg
- Leder til: Ny booking (`/portal/booking/ny`), Booking-detalj (`/portal/booking/[bookingId]`), Coach-profil i booking-kontekst (`/portal/booking/coach/[coachId]`)

---

## Ny booking — `/portal/booking/ny`

**Formål:** Wizard for å booke coaching-økt — velg tjeneste, coach, dato/tid og bekreft. Viser tilgjengelighet i sanntid.

**Bruker:** Spiller som booker ny coaching-time.

**Data inn:**
- `ServiceType` (aktive tjenester: name, priceOre, durationMin, slug)
- `CoachAvailability` (ledig tid per coach, weekday/startTime/endTime)
- `Booking` (eksisterende bookinger for å unngå konflikt — uniqueness constraint)
- `Facility` (tilgjengelige fasiliteter per lokasjon)
- `Location` (lokasjoner)
- `Subscription` (creditsRemaining for å sjekke om spiller har kreditt)

**Data ut:**
- Oppretter `Booking` (status PENDING → CONFIRMED etter betaling/kredit-trekk)
- Kan opprette `Payment` hvis betaling kreves

**Flyt:**
- Kommer fra: Booking-hub (`/portal/booking`)
- Leder til: Booking bekreftet (`/portal/booking/bekreftet`), Booking-hub (tilbake ved avbryt)

---

## AgencyOS — 11 skjermer

---

## Cockpit (hjem) — `/admin/agencyos`

**Formål:** Coachens daglige oversiktsdashboard — KPI-kort (spillere, bookinger, forespørsler, åpne oppgaver), fokus-spiller, dagens øktliste og varsler.

**Bruker:** Coach ved start av arbeidsdag. Mørkt tema (`.dark`).

**Data inn:**
- `Booking` (dagens bookinger: coachId + startAt today, status)
- `SessionRequest` (PENDING requests, count)
- `PlanAdjustment` (PENDING justeringer, count)
- `OppgaveCache` (åpne Notion-oppgaver via `NotionConnection`)
- `TrainingPlan` (aktive planer på tvers av spillere)
- `User` (stall: alle spillere med coachRelasjon via `PlayerEnrollment`)
- `Group` (coachens grupper, antall medlemmer)
- `TalentTracking` (spillere i talent-tracking)

**Data ut:** Ingen direkte skriving — navigasjonssentral og oversiktsverktøy.

**Flyt:**
- Kommer fra: login (`/auth/login`), alle AgencyOS-undersider via sidebar
- Leder til: Spillere (`/admin/spillere`), Innboks (`/admin/innboks`), Forespørsler (`/admin/foresporsler`), Kalender (`/admin/kalender`), Bookinger (`/admin/bookinger`), Caddie (`/admin/agencyos/caddie`)

---

## Spillere (alle) — `/admin/spillere`

**Formål:** Coachens fullstendige stall-oversikt med tabellvisning, SG-sparklines, aktivitetsstatus og bulk-handlinger.

**Bruker:** Coach som vil ha oversikt over alle spillere, filtrere på gruppe/program eller eksportere data.

**Data inn:**
- `User` (alle spillere med role=PLAYER koblet til coach via `PlayerEnrollment`)
- `PlayerEnrollment` (program, coachId, enrolledAt)
- `Round` (siste runde per spiller: sgTotal, playedAt — for sparkline)
- `Booking` (siste booking per spiller for aktivitetsstatus)
- `TalentTracking` (niva, for talent-badge)
- `Group` + `GroupMember` (gruppe-tilhørighet)
- `TrainingPlan` (aktiv plan per spiller: status)

**Data ut:**
- Navigerer til spiller-detalj
- Bulk-eksport CSV
- Filtrering lagres ikke i DB

**Flyt:**
- Kommer fra: Cockpit (`/admin/agencyos`), sidebar
- Leder til: Spiller-detalj (`/admin/spillere/[id]`), Ny spiller (`/admin/spillere/ny`), Talent (`/admin/talent`)

---

## Spiller-detalj — `/admin/spillere/[id]`

**Formål:** Coachens fullstendige visning av én spiller — hero med status, SG-pyramide, aktiv plan, siste runder, tester og hurtighandlinger.

**Bruker:** Coach som skal forberede coaching-økt eller følge opp en spiller.

**Data inn:**
- `User` (name, avatarUrl, hcp, homeClub, userStatus, tier, dateOfBirth)
- `PlayerEnrollment` (program, enrolledAt)
- `TrainingPlan` (aktiv plan: name, status, sessions-fremgang)
- `Round` (siste 5 runder: score, sgTotal, playedAt)
- `TestResult` (siste testresultat per pyramideArea)
- `Booking` (kommende bookinger: startAt, serviceType)
- `TalentTracking` (niva, scores per dimensjon hvis talent-spiller)
- `HealthEntry` (siste entries: restingHr, sleepHours for status-indikator)
- `Leave` (aktiv permisjon/skade: reason, startAt, endAt)
- `CoachNote` (coachens private notater om spilleren, siste 3)

**Data ut:**
- Navigerer til Workbench, Plan-detalj, Fremgang, Tester, Tildel test
- Kan opprette `CoachNote` (hurtignotat)

**Flyt:**
- Kommer fra: Spillere-liste (`/admin/spillere`)
- Leder til: Coach-Workbench (`/admin/spillere/[id]/workbench`), Fremgang (`/admin/spillere/[id]/fremgang`), Plan-detalj (`/admin/spillere/[id]/plan/[planId]`), Tester (`/admin/spillere/[id]/tester`), Rediger (`/admin/spillere/[id]/rediger`)

---

## Coach-Workbench — `/admin/spillere/[id]/workbench`

**Formål:** Coachens planleggingsverktøy for én spiller — lage og redigere treningsplan, godkjenne spillers justeringsforespørsler, sette mål og planlegge perioder.

**Bruker:** Coach som bygger eller justerer treningsplan for en spiller.

**Data inn:**
- `TrainingPlan` (spillerens planer: name, status, startDate, endDate)
- `TrainingPlanSession` (alle planlagte økter: pyramidArea, scheduledAt, durationMin, drills)
- `SessionDrill` + `ExerciseDefinition` (drills per økt)
- `PlanAdjustment` (PENDING forespørsler fra spiller — coach godkjenner/avslår her)
- `SeasonPlan` + `PeriodBlock` (periodisering for spilleren)
- `TournamentEntry` (turneringer i perioden for å planlegge rundt)
- `Goal` (spillerens aktive mål)
- `PlanTemplate` (maler tilgjengelig for coaches)

**Data ut:**
- Oppretter/oppdaterer `TrainingPlan`
- Oppretter/redigerer `TrainingPlanSession`
- Godkjenner/avslår `PlanAdjustment` (status APPROVED/DECLINED)
- Endrer `PlanStatus` (DRAFT → PENDING_PLAYER → ACTIVE)
- Skriver `TechnicalPlanAudit` ved vesentlige endringer

**Flyt:**
- Kommer fra: Spiller-detalj (`/admin/spillere/[id]`)
- Leder til: Spiller-detalj (tilbake), Plan-detalj (`/admin/spillere/[id]/plan/[planId]`), Drills (`/admin/drills`)

---

## Innboks — `/admin/innboks`

**Formål:** Coachens meldingssenter for alle innkommende spillermeldinger, bookingvarsler og systemmeldinger — sortert etter haster.

**Bruker:** Coach som behandler kommunikasjon fra spillere og systemvarsler.

**Data inn:**
- `SessionRequest` (PENDING forespørsler: userId → spiller, preferredDate, reason)
- `PlanAdjustment` (PENDING justeringer fra spillere)
- `Notification` (systemvarsler til coach: type, title, body, readAt)
- `CoachNote` (svar på spørsmål fra spillere)
- `Booking` (nye bookinger som krever bekreftelse: status PENDING)

**Data ut:**
- Markerer `Notification` som lest (readAt = now())
- Navigerer til forespørsel-handling → `SessionRequest` oppdateres

**Flyt:**
- Kommer fra: Cockpit (innboks-widget), sidebar
- Leder til: Forespørsler (`/admin/foresporsler`), Godkjenninger (`/admin/godkjenninger`), Spiller-detalj (fra meldingskort)

---

## Forespørsler — `/admin/foresporsler`

**Formål:** Liste over alle spilleres økt-forespørsler (SessionRequest) med status, preferert tid og årsak — coach godkjenner eller avslår.

**Bruker:** Coach som behandler innkommende bookingønsker fra spillere.

**Data inn:**
- `SessionRequest` (alle requests for coachId: status PENDING/APPROVED/DECLINED, userId → `User`, preferredArea, preferredDate, durationMin, reason)
- `User` (spiller-info: name, avatarUrl, hcp)
- `CoachAvailability` (coachens tilgjengelighet for å foreslå tid)

**Data ut:**
- Oppdaterer `SessionRequest.status` → APPROVED/DECLINED
- Setter `SessionRequest.coachResponse` og `respondedAt`
- Ved godkjenning: oppretter `Booking`

**Flyt:**
- Kommer fra: Innboks (`/admin/innboks`), Cockpit
- Leder til: Spiller-detalj (for kontekst), Bookinger (`/admin/bookinger`)

---

## Godkjenninger — `/admin/godkjenninger`

**Formål:** Samlet godkjenningskø for plan-justeringer, benchmark-oppdateringer og andre ting som krever coachens aktive godkjenning.

**Bruker:** Coach som behandler spillers justeringsforespørsler og systemforslag.

**Data inn:**
- `PlanAdjustment` (PENDING justeringer: userId → spiller, weekStart, description, focusAreas)
- `User` (spiller-info per justering)
- `TrainingPlan` (planen justeringen gjelder)
- Benchmark-sync-godkjenninger (lagret som AgentRun med status PENDING_APPROVAL)

**Data ut:**
- Oppdaterer `PlanAdjustment.status` → APPROVED/DECLINED med `coachResponse` og `respondedAt`
- Godkjenner/avviser benchmark-oppdateringer

**Flyt:**
- Kommer fra: Innboks (`/admin/innboks`), Cockpit
- Leder til: Spiller-detalj, Plan-detalj

---

## Kalender — `/admin/kalender`

**Formål:** Coachens ukentlige/månedlige kalendervisning med alle bookinger, gruppeøkter og egne blokkerte tider.

**Bruker:** Coach som planlegger uka og sjekker kapasitet.

**Data inn:**
- `Booking` (alle bokinger for coachId i perioden: startAt, endAt, userId → spiller, serviceType, facility)
- `CoachAvailability` (ledige blokker per ukedag for å vise ledig kapasitet)
- `TrainingSessionV2` (gruppeøkter: groupId, startTime, endTime, title)
- `GroupSchedule` (planlagte gruppe-møter)
- `TournamentEntry` (turneringer spillere er påmeldt — visuell referanse)

**Data ut:**
- Navigerer til booking-detalj
- Knapp til ny booking

**Flyt:**
- Kommer fra: sidebar, Cockpit
- Leder til: Bookinger (`/admin/bookinger`), Ny booking (`/admin/bookinger/ny`), Spiller-detalj

---

## Bookinger — `/admin/bookinger`

**Formål:** Komplett liste over alle coachens bookinger med filtermuligheter på status, spiller og dato — godkjenn/avvis ventende bookinger.

**Bruker:** Coach som administrerer bookinger og bekrefter/avviser forespørsler.

**Data inn:**
- `Booking` (alle bookinger for coachId: userId → `User`, serviceType via `ServiceType`, startAt, endAt, status, facilityId → `Facility`, priceOre)
- `User` (spiller: name, avatarUrl, hcp)
- `ServiceType` (name, durationMin)
- `Facility` (name)

**Data ut:**
- Oppdaterer `Booking.status` → CONFIRMED/CANCELLED
- Kan opprette `Booking` (ny booking på vegne av spiller)

**Flyt:**
- Kommer fra: Kalender, Cockpit, Forespørsler
- Leder til: Ny booking (`/admin/bookinger/ny`), Spiller-detalj

---

## Tester (alle spillere) — `/admin/tester`

**Formål:** Coach-oversikt over alle NGF-tester med benchmark-matrise (nivåstige PGA topp 40 → Scratch), og mulighet til å tildele tester til spillere.

**Bruker:** Coach som vil se testresultater på tvers av stallen, sammenligne mot normer og tildele nye tester.

**Data inn:**
- `TestDefinition` (alle 36 NGF-tester: name, pyramidArea, protocol JSON med benchmarks-array)
- `TestResult` (resultater per spiller: score, takenAt, userId)
- `User` (stall-spillere for filter)
- `AgentRun` (benchmark-sync status for DataGolf-fasiter)

**Data ut:**
- Navigerer til test-detalj og tildel-test
- Kan godkjenne benchmark-oppdateringer (se Godkjenninger)

**Flyt:**
- Kommer fra: sidebar, Cockpit (tester-widget)
- Leder til: Test-detalj (`/admin/tester/[id]`), Tildel test (`/admin/tester/tildel/[spillerId]`), Benchmarks (`/admin/tester/benchmarks`)

---

## Plans (planlegging) — `/admin/plans`

**Formål:** Oversikt over alle aktive treningsplaner på tvers av spillere — kanban per status (DRAFT/PENDING/ACTIVE/ARCHIVED) med snarvei til Plan-bygger.

**Bruker:** Coach som har oversikt over planstatus for hele stallen og vil opprette ny plan.

**Data inn:**
- `TrainingPlan` (alle planer tilknyttet coachens spillere: name, status, userId → `User`, startDate, endDate)
- `User` (spiller: name, avatarUrl for hvert plan-kort)
- `TrainingPlanSession` (antall planlagte/gjennomførte økter per plan for fremgang-bar)
- `PlanTemplate` (tilgjengelige maler for ny plan)

**Data ut:**
- Navigerer til Plan-bygger (`/admin/plans/new`)
- Navigerer til plan-detalj (`/admin/plans/[planId]`)
- Endrer `TrainingPlan.status` (arkiver/aktiver)

**Flyt:**
- Kommer fra: sidebar, Spiller-detalj, Cockpit
- Leder til: Plan-bygger (`/admin/plans/new`), Plan-detalj (`/admin/plans/[planId]`), Plan-maler (`/admin/plan-templates`), Coach-Workbench

---

## Auth + Marketing — 3 skjermer

---

## Login — `/auth/login`

**Formål:** Innloggingsskjerm for alle brukertyper (spiller, coach, forelder, admin) med e-post/passord og BankID-alternativ.

**Bruker:** Alle brukere som skal logge inn i AK Golf HQ.

**Data inn:**
- Ingen Prisma-data leses direkte på skjermen
- Supabase auth håndterer innlogging server-side
- `User` oppslagsnøkkel: authId fra Supabase JWT etter vellykket login

**Data ut:**
- Kaller Supabase `signInWithPassword` → setter session-cookie
- Redirect basert på `User.role`: PLAYER → `/portal`, COACH/ADMIN → `/admin/agencyos`, PARENT → `/forelder`

**Flyt:**
- Kommer fra: landing page, logget-ut-side (`/auth/logget-ut`), direkte URL
- Leder til: Hjem (`/portal`) for spillere, Cockpit (`/admin/agencyos`) for coaches, BankID (`/auth/bankid`), Registrer (`/auth/signup`), Glemt passord (`/auth/forgot-password`)

---

## Onboarding — `/auth/onboarding`

**Formål:** 7-stegs oppstartsflyt for nye spillere — samler navn, HCP, hjemmeklubb, ambisjon, tilgjengelige fasiliteter og samtykke før de får tilgang til PlayerHQ.

**Bruker:** Nyregistrert spiller, første gang etter signup.

**Data inn:**
- `User` (eksisterende data: email, name fra signup — pre-fyller steg 1)
- `Location` + `Facility` (tilgjengelige anlegg for fasilitet-valg i steg 5)
- `ServiceType` (coaching-pakker for å vise hva som er tilgjengelig)

**Data ut:**
- Oppdaterer `User` (hcp, homeClub, playingYears, ambition, tilgjengeligeFasiliteter, requiresGuardianConsent)
- Oppretter `FacilityPrefs` (prefererte fasiliteter)
- Oppretter `Subscription` (TRIALING status, 1 mnd prøveperiode)
- Hvis mindreårig (dateOfBirth < 16 år): setter `requiresGuardianConsent = true` → redirect til `/auth/samtykke-venter`

**Flyt:**
- Kommer fra: Signup (`/auth/signup`) etter e-postbekreftelse
- Leder til: Hjem (`/portal`) ved fullføring, Samtykke-venter (`/auth/samtykke-venter`) for mindreårige

---

## Marketing-forside — `/(marketing)`

**Formål:** Offentlig landingsside for akgolf.no — presenterer AK Golf Academy, coaching-pakker, PlayerHQ-appen og tar imot leads via CTA-knapper.

**Bruker:** Potensielle spillere og foreldre som vurderer AK Golf, samt eksisterende brukere som lander på nettsiden.

**Data inn:**
- `ServiceType` (aktive coaching-tjenester: name, priceOre, description — for pris-seksjon)
- `User` (coacher med role=COACH: name, avatarUrl — for coach-presentasjon)
- `Lead` (ikke lest hit — kun skrevet ved leadgenerering)
- Statisk innhold (tekst, bilder) — ingen DB-avhengighet for grunnlayout

**Data ut:**
- Oppretter `Lead` ved innsending av kontaktskjema (email, name, source)
- CTA-knapper leder til signup/booking

**Flyt:**
- Kommer fra: Google/sosiale medier, direkte URL
- Leder til: Registrer (`/auth/signup`), Booking (`/(marketing)/booking`), Coaching (`/(marketing)/coaching`), Priser (`/(marketing)/priser`), Coacher (`/(marketing)/coacher`), PlayerHQ-salgsside (`/(marketing)/playerhq`)

---

*Sist generert: 11. juni 2026. Oppdater ved endringer i Prisma-schema, rute-tre eller screen-plan.*
