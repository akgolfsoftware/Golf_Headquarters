# PlayerHQ — motoren som ALLEREDE finnes i kode

> Spillerportalen er fullt bygd: 144 ruter, ~150 server-actions, 18 portal-motorer + delte motorer.
> Den slanke redesignen plugges på dette — ikke bygges blank. Per område: hva som finnes å koble til.

## Hjem
- **Motor:** `lib/portal-hjem/`, `lib/pyramide.ts` (treningspyramide), `lib/streak.ts`, `lib/sg.ts`.
- **Modeller:** User, TrainingPlanSession (dagens økter), Goal, Tournament/TournamentEntry, Round.

## Planlegge → Workbench (master)
- **Motor:** `lib/portal-workbench/`, `lib/workbench/`, `lib/ai-plan/`, `lib/fys/` (FYS: 25 tester/20 øvelser/12 maler), periodisering.
- **Modeller:** TrainingPlan(+Session/Log), SeasonPlan, PeriodBlock, TechnicalPlan(+Position/Task), FysiskPlan/FysUke/FysOkt, Goal, ExerciseDefinition, SessionDrill, LockedAnchor, RecurringPattern.
- **Actions:** opprettPlan, lagrePlan, leggTilOkt, leggTilUke, opprettPeriodBlock, createGoal, genererPlanForslag, aiSuggestWeek, generateWeekWithCaddie, koblTilArsplan … (hele planmotoren).

## Gjennomføre + Live-økt
- **Motor:** `lib/portal-live/`, `lib/portal-booking/`, `lib/booking/`, `lib/google-calendar.ts`.
- **Modeller:** TrainingSessionV2, SessionParticipant, SessionDrillInstance, SessionSet, DrillLogV2, Booking, ServiceType, Facility, CoachAvailability.
- **Actions:** startSession, pauseLiveSession, resumeLiveSession, completeSession, logRep(s), completeSet, freezeSessionSummary, createAdHocSession, cancelBooking, rescheduleBooking …

## Analysere (SG · Runder · TrackMan · Tester · Innsikt)
- **Motor:** `lib/portal-analyse/`, `lib/portal-sghub/`, `lib/portal-stats/`, `lib/portal-runder/`, `lib/portal-trackman/`, `lib/portal-tester/`, `lib/sg.ts`/`lib/sg-hub/`, `lib/trackman/`, `lib/datagolf/` (PGA-benchmark).
- **Modeller:** Round/Shot/ShotAnnotation, TestDefinition/TestResult/TestSession, TrackManSession/TrackManShot, SgBaseline/SgInsight, ClubMetricTrend, PgaPlayerSeason.
- **Actions:** createRound, logRoundManual, registrerScore, importFromGolfBox, importTrackMan(Csv/Html), logTest, saveShot, addAnnotation, exportRounds … (SG-beregning + import finnes).

## Turneringer + Turnering-detalj (NY skjerm)
- **Motor:** `lib/portal-turnering/`, `lib/turneringer/`, `lib/datagolf/`, `lib/scrapers/` (GolfBox live).
- **Modeller:** Tournament, TournamentEntry, TournamentResult, Bane, TournamentPreparation, LeaderboardSnapshot.
- **Actions:** meldDegPa, meldDegAv, leggTilTurnering, prepareForTournament, logTournamentResult, requestTournamentFocus, withdrawFromTournament.
- → Turnering-detalj trenger bare en skjerm — dataene (tee-tid, felt, resultater, prep) finnes.

## Coach-skuff + AI-Caddie
- **Motor:** `lib/portal-ai/`, `lib/caddie/`, `lib/anthropic.ts`.
- **Modeller:** CaddieMessage, CoachNote, SessionVideo, SessionRequest, Notification.
- **Actions:** askCoach, askCoachQuestion, sendCoachMelding, sendReply, requestSession, shareRound, shareDrillWithCoach, uploadMessageAttachment.

## Meg + undersider
- **Motor:** `lib/portal-meg/`, `lib/portal-abonnement/`, `lib/preferences.ts`, `lib/payments/` + `lib/stripe.ts`.
- **Modeller:** Subscription, PlayerEnrollment, Payment, HealthEntry, EquipmentBag, Document, ParentRelation/Invitation, EquipmentBag.
- **Actions:** oppdaterProfil, oppdaterPreferences, lagreHelseEntry, lagreUtstyrsbag, requestProUpgrade, cancelPro, inviterForelder, requestDataExport, deleteUserAccount, submitFeedback, submitSupportTicket.

## På tvers
- **Auth:** Supabase via `requirePortalUser()`. **AI:** `@anthropic-ai/sdk`. **Betaling:** Stripe. **Push:** web push (`lib/push/`).
- **Tier/abonnement:** `lib/feature-flags.ts` (gratis / 300 kr — ingen ELITE).

---

## Konsekvens for redesignen

PlayerHQ er **ikke ny funksjonalitet** — det er en **slankere overflate på en motor som finnes**. Derfor:

1. **Koble repoet** (`akgolf-hq`) i Claude Design — gjenbruk eksisterende komponenter, modeller og actions.
2. Hver ny/sammenslått skjerm peker til **eksisterende** action/motor over — datalaget bygges ikke på nytt.
3. Det vi faktisk lager nytt er KUN: **Turnering-detalj-skjermen** + å la **økt-rad åpne selve økten**. Resten er re-kobling.
