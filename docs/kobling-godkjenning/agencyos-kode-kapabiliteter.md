# AgencyOS — motoren som ALLEREDE finnes i kode

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
