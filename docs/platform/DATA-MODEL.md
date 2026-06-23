# AK Golf HQ — Data Model

## Bruker og identitet

`User` is the central record for every person in the system. The `role` field separates `COACH`, `PLAYER`, `PARENT`, `ADMIN`, and `GUEST`. Authentication is handled by Supabase; `authId` links the Prisma record to `auth.users`.

Critical fields: `role`, `tier` (GRATIS/PRO — ELITE is dead, never show in UI), `hcp` (handicap index), `userStatus` (AKTIV/PERMISJON/SKADET/INAKTIV), `deletedAt` (GDPR soft-delete, permanent purge after 30 days via cron).

`ParentRelation` links a parent `User` to a child `User`. `ParentInvitation` is the token-based invite flow. Players under 16 have `requiresGuardianConsent = true`.

`PlayerEnrollment` is the many-to-many bridge between a player and a `PlayerProgram` (e.g. WANG_TOPPIDRETT, AK_ACADEMY). Each enrollment optionally references a `coachId`.

`TalentTracking` holds numeric scores (fysisk, teknikk, taktikk, mental, motivasjon) for players in talent programmes. One record per player.

## Treningssystem Spor A — Spillerens økt (/portal/live)

`TrainingPlan` belongs to a player (`userId`). It has a `status` lifecycle: DRAFT → PENDING_PLAYER → ACCEPTED → ACTIVE → ARCHIVED. The plan contains many `TrainingPlanSession` records, each with a `scheduledAt`, `pyramidArea` (FYS/TEK/SLAG/SPILL/TURN), and optional `skillArea`.

`SessionDrill` links a `TrainingPlanSession` to an `ExerciseDefinition` with reps/sets and a CS (Club Speed — % of max club speed) target.

`TrainingPlanSessionLog` is written when the player completes a session. It holds `csAchieved`, `rating`, and `coachFeedback`.

`TrainingLog` is a lightweight daily log of minutes spent per `SgCategory` (OTT/APP/ARG/PUTT). Used for training-gap analysis.

AI-generated plans leave a trace in `AiPlanGeneration` with prompt, tokens, cost, and an optional `iterationOf` pointer for revision chains.

## Treningssystem Spor B — Coachens økt (/admin/live + workbench)

`TrainingSessionV2` is the coach-created session. It has `studentId` or `groupId`, a `practiceType` (BLOKK/RANDOM/KONKURRANSE/SPILL_TEST), and `miljo` (environment level M0–M5). Status uses `SessionStatusV2` (PLANNED/IN_PROGRESS/COMPLETED/CANCELLED/SKIPPED).

Each session holds `TrainingDrillV2` records with all coaching parameters: `lFase`, `csNivaa`, `prPress`, and physical training fields (`fysSett`, `fysReps`, `fysVektKg`, etc.). Drill outcomes are logged in `DrillLogV2` with `successRate`.

`SessionDrillInstance` and `SessionSet` track real-time execution during live coaching. `SessionDrillNote` stores coach questions, video links, and self-assessment notes.

`CoachNote` is the coach's private notebook per player — never shown to the player unless `isPrivate = false`.

## Scoring og SG-analyse

`Round` belongs to a player and a `CourseDefinition`. It stores gross `score` plus 14 SG sub-fields: `sgOtt`, `sgApp`, `sgArg`, `sgPutt`, and detailed distance breakdowns (`sgApp200`, `sgPutt0_3`, etc.).

`Shot` stores individual shots within a round: `holeNumber`, `shotNumber`, `lie`, `club`, `distanceToPin`, and `shotType`.

`TrackManSession` aggregates raw launch-monitor data for a player. Each shot is a `TrackManShot` with ball metrics (`ballSpeed`, `smashFactor`, `spinRate`, `carryDistance`) and club metrics (`clubPath`, `faceAngle`, `dynamicLoft`).

`SgBaseline` holds PGA Tour benchmark values per `SgCategory` and distance bucket — the reference table used by `src/lib/domain/sg.ts` to compute strokes gained.

`SgInsight` stores AI-generated coaching insights per player, categorised by `InsightCategory` (e.g. DISTANCE_GAPPING, CONSISTENCY_LEAK). Insights have `severity`, `acknowledgedAt`, and `resolvedAt`.

`BrukerSgInput` lets a player (or coach) enter manual SG snapshots. `BrukerSammenligning` compares that snapshot against a specific PGA Tour player-season from `PgaPlayerSeason`.

`ClubMetricTrend` aggregates weekly TrackMan averages per club (path, face angle, smash factor, sigma).

## Test-system

`TestDefinition` describes a test protocol with a `scoringRule` and optional JSON `protocol`. Tests can be SYSTEM-owned, created by a coach, or `isCustom = true` (player-created). Visibility: PRIVATE / COACH / GROUP / ACADEMY.

`TestSession` tracks a live test in progress: `currentStepIndex`, `scoringData` (JSON), `status` (IN_PROGRESS/COMPLETED/ABORTED).

`TestResult` is the final score record linked to a player and a test definition.

`PgaPlayerSeason` and `PgaPuttDistance` / `PgaApproachDistance` hold benchmark reference data synced from DataGolf, used for the benchmark approval screen at `/admin/tester/benchmarks`.

## Booking

`ServiceType` defines a bookable offering with `priceOre`, `durationMin`, and an optional owning coach.

`Location` is a physical venue. `Facility` is a specific space within a location (e.g. Performance Studio) with a `FacilityType` (STUDIO, RANGE_1F, PUTTING_GREEN, etc.).

`Booking` links a player, coach, service type, location, and optional facility. It stores `startAt`/`endAt`, `status` (PENDING/CONFIRMED/CANCELLED/COMPLETED), Stripe references (`stripeCheckoutSessionId`, `stripePaymentIntentId`), and a `subscriptionId` for credit-based bookings. The unique constraint `booking_no_double_slot` prevents double-booking a coach.

`CoachAvailability` defines recurring weekly slots per coach (`weekday`, `startTime`, `endTime`).

`SessionRequest` is a player's informal request for a session before a formal booking is created. Handled in `/admin/foresporsler`.

## Turneringer

`Tournament` can be seeded from external sources (`sourceOrigin`, `sourceId`, `tour`) or created manually by a coach (`createdByUserId`). Duplicate tournaments can be merged via `mergedIntoId`.

`TournamentEntry` is a player's registration for a tournament, with `entryStatus` (PLANNED/CONFIRMED/WITHDRAWN/COMPLETED/DNF) and optional link to a `SeasonPlan`.

`TournamentPreparation` links a player to a tournament with a prep plan (`totalDays`, `sessionsPlanned`, `sessionsDone`, AI summary).

`SeasonPlan` is a player's annual calendar. It contains `PeriodBlock` records that map time ranges to training phases (`LPhase`: GRUNN/SPESIAL/TURNERING).

## Abonnement og betaling

`Subscription` is one-per-player. `tier` is GRATIS or PRO (ELITE is dead). `stripeSubscriptionId` links to Stripe. `monthlyCredits` / `creditsRemaining` track coaching-session credits granted by coaching packages (Performance = 2 credits/mnd, Performance Pro = 4 credits/mnd). These are package grants, NOT Subscription tier differences — tier is only GRATIS or PRO.

`Payment` is an append-only ledger entry for every transaction: bookings, subscriptions, invoices. Status follows Stripe lifecycle (PENDING/SUCCEEDED/FAILED/REFUNDED).

## Kommunikasjon

`SessionRequest` (see Booking) is the primary player-to-coach communication channel for booking intent.

`Notification` stores in-app alerts per user with `type`, `title`, `body`, `link`, and `readAt`.

`PushSubscription` stores Web Push endpoints per device for real-time notifications.

`CoachingSession` holds AI-assisted chat history between a player and a coach identity (JSON `messages` array).

`CaddieMessage` is the internal AI Caddie conversation log for AgencyOS (/admin), keyed by `conversationId`.

## Prisma 7-konfigurasjon

- `prisma.config.ts` holds connection strings. `schema.prisma` has only `provider = "postgresql"`.
- `datasource.url = env("DIRECT_URL")` for migrations; runtime uses `@prisma/adapter-pg` with `DATABASE_URL` (pgbouncer pooler).
- `prisma.config.ts` must call `dotenv.config({ path: ".env.local" })` explicitly — without this, environment variables are not loaded and the connection will fail.
- New `scripts/*.ts` MUST import `"./_env"` before importing `"@/lib/prisma"` — ESM import order means the adapter-pg connection will fail otherwise.
- RLS pattern: deny-all at the Postgres level; Prisma uses the service-role key and enforces access in application code. Every new table must have `ENABLE RLS` in the same migration.
- Generated client output: `src/generated/prisma`.

## Stack-gotchas

- `next.config.ts` MUST include `turbopack: { root: import.meta.dirname }`. Missing this breaks Tailwind CSS v4 resolve under Turbopack locally.
- Next.js 16: `middleware.ts` is now `proxy.ts` (nodejs runtime only, no edge). Never create `middleware.ts`.
