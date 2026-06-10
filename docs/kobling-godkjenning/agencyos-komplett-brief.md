# AgencyOS — KOMPLETT BRIEF (last opp denne ene fila)

> ÉN selvstendig fil til Claude Design. Last opp DETTE dokumentet + mappen `agencyos-skjermbilder/`.
> Velg **High fidelity**. Ikke noe mer å lime inn — alt står her.

**FIDELITY: High fidelity.** Designsystemet og strukturen er låst — bygg ferdig utseende, ikke wireframe.

---

## DESIGNSYSTEM — AK Golf HQ — Design System

> Last inn som «Design system» i Claude Design. Alt som bygges skal følge dette.

## Farger — lyst tema (PlayerHQ, Marketing, Forelder)

| Token | HEX | Bruk |
|---|---|---|
| background | #FAFAF7 | Side-bakgrunn |
| foreground | #0A1F17 | Primær tekst |
| card | #FFFFFF | Kort-bakgrunn |
| primary (forest) | #005840 | CTA, hovedhandling |
| primary-foreground | #D1F843 | Tekst på primary (lime) |
| accent (lime) | #D1F843 | Highlights, badges |
| accent-foreground | #005840 | Tekst på accent |
| secondary (sand) | #F1EEE5 | Chips, sekundærflater |
| muted-foreground | #5E5C57 | Sekundærtekst |
| success | #1A7D56 | OK |
| warning | #B8852A | Advarsel |
| destructive | #A32D2D | Feil / slett |
| info | #2563EB | Info |
| border | #E5E3DD | Borders |

## Farger — mørkt tema (AgencyOS, alltid `.dark`)

Speil samme paletten mørkt: dyp forest-bakgrunn, lyse kort-flater, lime som aksent, semantiske farger lysnet
for kontrast. AgencyOS er **alltid mørkt** — ingen tema-toggle.

## Typografi

| Font | Bruk |
|---|---|
| Inter | UI og brødtekst (standard) |
| Inter Tight | Display og hero (editorial italic tillatt på del av headline) |
| JetBrains Mono | KPI-tall, tabulære tall, eyebrows |

Ingen andre fonter. Ingen Instrument Serif.

## Ikoner

Kun **Lucide**. 24px, 1.5px strek, currentColor. **INGEN emoji** noe sted.

## Spacing

8pt-grid (8/16/24/32…). Unntak: data-tette flater i AgencyOS (dashboards, tabeller, timelines, innboks-rader)
kan bruke 12/14px tetthet — følg skjermbildene.

## Komponenter (gjenbruk, ikke gjenoppfinn)

Hero · FeaturedCard · KPI-strip · PyramidProgress (treningspyramide) · Eyebrow · Badge (ok/warn/urgent/lime/
primary/neutral) · Button · ActionList / QueueItem · Avatar · PulseDot · Greeting · DayCal · kalendere
(month-grid, session-scheduler, streak, day-planner, heatmap, year-plan-gantt).

## Stemning

Editorial sport-analytics. Rolig, presis. **PlayerHQ:** mer luft og fokus, mobil-først.
**AgencyOS:** høy datatetthet, desktop-først, mørkt — «Bloomberg for golf-coaching».

## Språk

All UI-tekst på norsk bokmål med æ, ø, å.

---

## OPPDRAG

Bygg **AgencyOS** — coachens kontrolltårn i AK Golf HQ — som én sammenhengende, klikkbar prototype.
Dette er en **slank nybygging**, ikke en kopi av den gamle appen: færrest mulig skjermer, alt overflødig
slått sammen, og **Spiller-Workbench som master for all planlegging**. Følg designsystemet som er lastet inn,
og bruk de opplastede skjermbildene som fasit for utseende/datatetthet.

## HVA AGENCYOS ER

Coachens spørsmål er «hvem trenger MEG i dag?». **Data-tett, desktop-først, alltid MØRKT tema (.dark).**
Navne-kanon: spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** (alltid fulle navn).
All UI-tekst på norsk bokmål med æ, ø, å. Kun Lucide-ikoner. Ingen emoji.

## STRUKTUR (6 seksjoner — venstre sidebar)

**Oversikt (Cockpit) · Stall · Planlegge · Gjennomføre · Innsikt · Admin.**

Topbar (fast på ALLE skjermer): **spiller↔gruppe-veksler** (bytt mellom én spiller og en gruppe, med søk +
«nylig sett» + hurtigtaster) og **hurtigsøk (⌘K)**.

## KJERNEPRINSIPP — Spiller-Workbench er master

Klikk på et spillernavn HVOR SOM HELST (Stall, Cockpit-fokus, topbar-veksler, godkjenning) → **rett inn i den
spillerens Workbench**. Ingen profil-mellomside. Workbench er master for ALT: årsplan/periodisering,
treningsplan, fysplan, mål, økt-planlegging, tildele drill/test. «Ny målsetning» lages KUN her.
Plan-maler og Drill-bibliotek er byggeklosser som brukes INN i Workbench.

## SKJERMENE (og hva som slås sammen)

**Oversikt:**
- **Cockpit** — dagens timeline, innboks-teller, stall-KPI, og fokus-spiller-panel: (a) manuelt **pinnet** spiller
  øverst + (b) **3 AI-forslag** (haster=rød / ubesvart=blå / frafall-fare=gul) med kontekst-knapper inn i Workbench.
- **Min uke** — coachens oppgaver + tildelt meg.

**Stall:**
- **Spillere** (tabell, status-prikk, SG-trend) · **Grupper** · **Talent-radar** · **Sammenligning** · **WAGR-import**.
- Spiller-klikk → Workbench (master).

**Planlegge:**
- **Treningsplaner** (oversikt over aktive planer) · **Plan-maler** (bibliotek) · **Drill-bibliotek** (bibliotek).
- INGEN «Ny plan»- eller «Ny økt»-wizard — den handlingen bor i Workbench.

**Gjennomføre (drift):**
- **Kalender** · **Bookinger** (ny-booking som wizard er ok) · **Anlegg** · **Tilgjengelighet** · **Tjenester**.

**Innsikt:**
- **Stall-analyse** · **Lag-snitt** · **Tester** · **Forespørsler** · **Godkjenninger** · **Rapporter**.

**Admin:**
- **Organisasjon** · **Innstillinger** · **Audit-logg** · **Økonomi**.

**Turneringer** (under Planlegge eller egen inngang): oversikt + **Fellesmelding-flyt** (NY):
velg turnering → deltakere (alle påmeldte forhåndshuket, foreldre for juniorer auto-varsles) → skriv med
ferdigblokker (Baneinfo / Tips / Lykke til / Tee-tider / Vær) + AI-knapp → velg kanaler (push/e-post/SMS) →
send → bekreftelse («n/n levert»).

## SLÅ SAMMEN (ikke lag duplikater)

Én av hver: dashboard (ikke board/queue-varianter) · én kalender · én innboks (forespørsler) · én spiller-liste ·
én analyse-flate · én økonomi. Bruk navnet **AgencyOS** overalt — aldri «CoachHQ».

## TRE NYE FLYTER (bygg disse — finnes ikke ferdig i gammel app)

1. **Fokus-spiller: pin + 3 AI-forslag** på Cockpit.
2. **Fellesmelding** fra en turnering (hele send-flyten).
3. **Spiller↔gruppe-veksler** fast i topbar på alle skjermer.

## LEVERANSE

Én klikkbar prototype der navigasjonen faktisk fungerer (hver knapp peker riktig). Mørkt tema gjennomgående.
Mangler du noe, list det under «Åpne spørsmål» — ikke dikt opp funksjonalitet som ikke er beskrevet her.

---

## MOTOREN SOM ALLEREDE FINNES — AgencyOS — motoren som ALLEREDE finnes i kode

> Appen er ikke en tom skisse. 120 datamodeller, ~300 server-actions, ferdige motorer.
> Den slanke redesignen skal **plugges på dette** — ikke bygges blank. Per område: hva som finnes å koble til.

## Cockpit (Oversikt)
- **Data/motor:** `lib/dashboard-data.ts`, `lib/admin-brief.ts`, `lib/admin-hub-data.ts`, `lib/caddie/` (AI), `lib/agents/` (AgentRun).
- **Modeller:** Signal, PlanAction, SessionRequest, Notification, CaddieMessage.
- → Fokus-spiller pin+AI kan bygge på Signal + caddie-motoren som finnes.

## Stall (spillere)
- **Motor:** `lib/admin-spiller/`, `lib/sg.ts` + `lib/sg-hub/`, `lib/pyramide.ts`, `lib/datagolf/`, talent.
- **Modeller:** User, Group/GroupMember/GroupSchedule, TalentTracking, WagrSnapshot, BrukerSammenligning, SgBaseline.
- → SG-trend, pyramide, talent-radar, WAGR og sammenligning har ekte beregning allerede.

## Workbench (master) + Planlegge
- **Motor:** `lib/workbench/`, `lib/admin-workbench/`, `lib/portal-workbench/`, `lib/ai-plan/`, `lib/fys/` (FYS-program: 25 tester/20 øvelser/12 maler), periodisering.
- **Modeller:** TrainingPlan(+Session/Log), PlanTemplate(+Session), SeasonPlan, PeriodBlock, PeriodVolumeRecipe, ConditionalRule, TechnicalPlan(+Position/Task), FysiskPlan/FysUke/FysOkt/FysOvelseRad, ExerciseDefinition, DrillMal/OktMal, Goal, LockedAnchor, RecurringPattern.
- **Actions:** createPlan, assignPlanToPlayers, createTemplate, dupliserPlan, createDrill, addTemplateSession … (alt planleggingsmaskineriet finnes).
- → Workbench-master kan bruke HELE denne planmotoren — den trenger bare én samlet flate.

## Gjennomføre (drift)
- **Motor:** `lib/booking/`, `lib/admin-kalender/`, `lib/google-calendar.ts`, `lib/leave/`.
- **Modeller:** Booking, ServiceType, Location, Facility, FacilityPrefs, CoachAvailability, TrainingSessionV2, SessionParticipant, TrainingDrillV2, DrillLogV2.
- **Actions:** createFacilityBooking, createSessionFromCalendar, addSlot, cancelSession …

## Innsikt
- **Motor:** `lib/sg.ts`/`lib/sg-hub/`, `lib/trackman/`, `lib/stats/`, `lib/analytics.ts`, `lib/coaching-analysis.ts`.
- **Modeller:** TestDefinition/TestResult/TestSession, Round/Shot/ShotAnnotation, TrackManSession/TrackManShot, SgInsight, ClubMetricTrend, PlanEffectiveness, PgaPlayerSeason (PGA-benchmark).
- → Tester, runder, SG, TrackMan og lag-snitt har ekte data + beregning.

## Turneringer
- **Motor:** `lib/turneringer/`, `lib/datagolf/`, `lib/scrapers/` (GolfBox live-scoring), `lib/stats/`.
- **Modeller:** Tournament, TournamentEntry, TournamentResult, Bane, PublicPlayer/Entry, LeaderboardSnapshot, TournamentPreparation, SeasonPlan-kobling.
- → Live leaderboard + resultater finnes. Fellesmelding bygger på Notification + e-post.

## Admin
- **Motor:** `lib/payments/` + `lib/stripe.ts`, `lib/audit.ts`, `lib/email/` (Resend), `lib/notion/`, `lib/security/`.
- **Modeller:** Subscription, Payment, PlayerEnrollment, ApiKey, AuditLog, ErrorLog, EmailTemplate, Lead, WebhookFailure, NotionConnection.

## Fellesmelding (ny flyt) — motor finnes
- **Notification** (push) + `lib/email/` (Resend e-post) + `lib/push/` (web push) + EmailTemplate (ferdigblokker) + CaddieMessage (AI «stram inn»).
- → Hele utsendings-motoren finnes; flyten trenger bare wiring (Send-action).

## På tvers
- **Auth:** Supabase via `requirePortalUser({allow:["ADMIN","COACH"]})`.
- **AI:** `@anthropic-ai/sdk` (caddie, plan-generering, transkripsjon).
- **Betaling:** Stripe. **E-post:** Resend. **Kalender:** Google Calendar. **Push:** web push.

---

## Konsekvens for redesignen

Den slanke AgencyOS-en er **ikke en nybygging av funksjonalitet** — det er en **ny, ryddigere skjerm-overflate
på toppen av en motor som allerede finnes**. Derfor:

1. **Koble repoet** (`akgolf-hq`) i Claude Design / ved porting, så de ekte komponentene, modellene og actionene gjenbrukes.
2. Hver ny/sammenslått skjerm peker til **eksisterende** action/motor over — vi bygger ikke datalaget på nytt.
3. Det vi faktisk lager nytt er KUN: pin+AI-panel, fellesmelding-wiring, global veksler — resten er re-kobling.
