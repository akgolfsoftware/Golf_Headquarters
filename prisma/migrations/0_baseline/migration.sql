◇ injected env (0) from .env.local // tip: ⌁ auth for agents [www.vestauth.com]
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COACH', 'PLAYER', 'PARENT', 'GUEST');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('GRATIS', 'PRO');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionStatusV2" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TournamentEntryStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'WITHDRAWN', 'COMPLETED', 'DNF');

-- CreateEnum
CREATE TYPE "PyramidArea" AS ENUM ('FYS', 'TEK', 'SLAG', 'SPILL', 'TURN');

-- CreateEnum
CREATE TYPE "LPhase" AS ENUM ('GRUNN', 'SPESIAL', 'TURNERING', 'TESTUKE', 'FERIE', 'TRENINGSSAMLING', 'HELDAGSSAMLING');

-- CreateEnum
CREATE TYPE "SkillArea" AS ENUM ('TEE_TOTAL', 'TILNAERMING', 'AROUND_GREEN', 'PUTTING', 'SPILL');

-- CreateEnum
CREATE TYPE "SessionEnvironment" AS ENUM ('RANGE', 'BANE', 'STUDIO', 'HJEM', 'SIMULATOR', 'GYM');

-- CreateEnum
CREATE TYPE "ExerciseSource" AS ENUM ('SYSTEM', 'COACH', 'PLAYER');

-- CreateEnum
CREATE TYPE "ExerciseVisibility" AS ENUM ('PRIVATE', 'COACH_PLAYERS');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('AKTIV', 'PERMISJON', 'SKADET', 'INAKTIV');

-- CreateEnum
CREATE TYPE "LeaveReason" AS ENUM ('SKADE', 'SYKDOM', 'REISE', 'JOBB', 'STUDIER', 'ANNET');

-- CreateEnum
CREATE TYPE "DrillPracticeType" AS ENUM ('BLOKK', 'VARIABEL', 'KONKURRANSE', 'SPILL_TEST');

-- CreateEnum
CREATE TYPE "DrillFasilitet" AS ENUM ('RADAR', 'MAT_NET', 'BUNKER', 'KAMERA', 'PUTTING_GREEN_KORT', 'PUTTING_GREEN_LANG', 'SHORT_GAME_AREA', 'DRIVING_RANGE', 'BANE', 'SIMULATOR', 'VEKTSTANG', 'TRAPBAR', 'LOPEBANE', 'MED_BALL');

-- CreateEnum
CREATE TYPE "NgfKategori" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING');

-- CreateEnum
CREATE TYPE "PlayerProgram" AS ENUM ('WANG_TOPPIDRETT', 'WANG_UNG', 'GFGK_MINI', 'GFGK_BREDDE', 'GFGK_JENTER', 'GFGK_ELITE', 'AK_ACADEMY', 'AK_ACADEMY_JUNIOR', 'PLATFORM_ONLY');

-- CreateEnum
CREATE TYPE "PressureLevel" AS ENUM ('PR1', 'PR2', 'PR3', 'PR4', 'PR5');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'PENDING_PLAYER', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LFase" AS ENUM ('L_KROPP', 'L_ARM', 'L_KOLLE', 'L_BALL', 'L_AUTO');

-- CreateEnum
CREATE TYPE "CSNivaa" AS ENUM ('CS50', 'CS60', 'CS70', 'CS80', 'CS90', 'CS100');

-- CreateEnum
CREATE TYPE "MMiljo" AS ENUM ('M0', 'M1', 'M2', 'M3', 'M4', 'M5');

-- CreateEnum
CREATE TYPE "PRPress" AS ENUM ('PR1', 'PR2', 'PR3', 'PR4', 'PR5');

-- CreateEnum
CREATE TYPE "TaskKategori" AS ENUM ('TEKNISK', 'TAKTISK', 'MENTALT', 'SOSIALT');

-- CreateEnum
CREATE TYPE "RepType" AS ENUM ('SVINGER_UTEN_BALL', 'BALLER_SLATT', 'TID', 'SETT_REPS');

-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('BLOKK', 'RANDOM', 'KONKURRANSE', 'SPILL_TEST');

-- CreateEnum
CREATE TYPE "PeriodeType" AS ENUM ('GRUNN', 'SPESIALISERING', 'TURNERING', 'EVALUERING', 'FERIE');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('OUTCOME', 'PROCESS');

-- CreateEnum
CREATE TYPE "SessionNoteType" AS ENUM ('SELF', 'COACH_QUESTION', 'VIDEO');

-- CreateEnum
CREATE TYPE "SessionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlanAdjustmentStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ParentLinkRelation" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "ShotLie" AS ENUM ('TEE', 'FAIRWAY', 'SEMI_ROUGH', 'ROUGH', 'DEEP_ROUGH', 'BUNKER', 'GREEN', 'WATER', 'OOB', 'TREES');

-- CreateEnum
CREATE TYPE "WindDir" AS ENUM ('STILLE', 'MEDVIND', 'MOTVIND', 'VENSTRE', 'HOYRE');

-- CreateEnum
CREATE TYPE "ShotType" AS ENUM ('DRIVE', 'APPROACH', 'CHIP', 'PITCH', 'PUTT', 'BUNKER', 'RECOVERY', 'DROP');

-- CreateEnum
CREATE TYPE "TestVisibility" AS ENUM ('PRIVATE', 'COACH', 'GROUP', 'ACADEMY');

-- CreateEnum
CREATE TYPE "TestSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABORTED');

-- CreateEnum
CREATE TYPE "TestAssignmentStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrackManEnvironment" AS ENUM ('SIMULATOR_INDOOR', 'NET_INDOOR', 'RANGE_OUTDOOR_MAT', 'RANGE_OUTDOOR_GRASS', 'COURSE_PRACTICE', 'COURSE_COMPETITION');

-- CreateEnum
CREATE TYPE "SgCategory" AS ENUM ('OTT', 'APP', 'ARG', 'PUTT');

-- CreateEnum
CREATE TYPE "InsightCategory" AS ENUM ('DISTANCE_GAPPING', 'CONSISTENCY_LEAK', 'TRAINING_GAP', 'D_PLANE_DRIFT', 'STRIKE_QUALITY', 'FATIGUE_PATTERN', 'EQUIPMENT_FIT', 'TEMPO_VARIANCE', 'PROGRESSION_TREND', 'SAME_DISTANCE_OPPORTUNITY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BOOKING', 'SUBSCRIPTION', 'INVOICE', 'OTHER');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('STUDIO', 'RANGE_1F', 'RANGE_2F', 'PUTTING_GREEN', 'SHORT_GAME', 'COURSE_9H', 'COURSE_18H', 'SPECIFIC_HOLES', 'GENERAL');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'MAYBE', 'ATTENDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "TechPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Ukedag" AS ENUM ('MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LOR', 'SON');

-- CreateEnum
CREATE TYPE "PositionTaskStatus" AS ENUM ('PENDING', 'ACTIVE', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TrackStatus" AS ENUM ('PAA_VEI', 'STAGNERER', 'FERDIG', 'INAKTIV', 'AVSLAATT');

-- CreateEnum
CREATE TYPE "RepHastighet" AS ENUM ('DRY', 'LAV', 'FULL');

-- CreateEnum
CREATE TYPE "TmGoalType" AS ENUM ('PRIMARY', 'SECONDARY', 'CAUSAL', 'HIT_RATE');

-- CreateEnum
CREATE TYPE "TmGoalProtocol" AS ENUM ('ROLLING_WINDOW', 'BEST_OF_N', 'STREAK', 'SESSION_GATE');

-- CreateEnum
CREATE TYPE "TmGoalComparison" AS ENUM ('LESS_THAN', 'GREATER_THAN', 'RANGE', 'EQUAL');

-- CreateEnum
CREATE TYPE "ClubTargetStatus" AS ENUM ('OPPNAADD', 'PAA_VEI_KT', 'IKKE_BEGYNT');

-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('NEW_TASK', 'ARCHIVE_TASK', 'RE_PRIORITIZE', 'CHANGE_CUE', 'ADJUST_GOAL', 'ADD_CLUB_TARGET');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EDITED');

-- CreateEnum
CREATE TYPE "NotionLinkType" AS ENUM ('OPPGAVER', 'PROSJEKTER');

-- CreateEnum
CREATE TYPE "NotionSyncMode" AS ENUM ('AUTO', 'MANUELL', 'PAUSED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'MINOR_AVVIK', 'MAJOR_AVVIK', 'SKIP');

-- CreateEnum
CREATE TYPE "DesignKoblingStatus" AS ENUM ('UNMAPPED', 'MAPPED', 'APPROVED', 'MISSING', 'BROKEN');

-- CreateEnum
CREATE TYPE "CoachDirektivType" AS ENUM ('PIN', 'BLOCK', 'PRIORITER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "tier" "Tier" NOT NULL DEFAULT 'GRATIS',
    "lastLoginAt" TIMESTAMP(3),
    "hcp" DOUBLE PRECISION,
    "playingYears" INTEGER,
    "ambition" TEXT,
    "homeClub" TEXT,
    "school" TEXT,
    "schoolYear" TEXT,
    "prevSeasonAvgScore" INTEGER,
    "publicPlayerId" TEXT,
    "preferences" JSONB,
    "tilgjengeligeFasiliteter" "DrillFasilitet"[] DEFAULT ARRAY[]::"DrillFasilitet"[],
    "deletedAt" TIMESTAMP(3),
    "dateOfBirth" TIMESTAMP(3),
    "requiresGuardianConsent" BOOLEAN NOT NULL DEFAULT false,
    "guardianConsentGivenAt" TIMESTAMP(3),
    "guardianConsentByUserId" TEXT,
    "userStatus" "UserStatus" NOT NULL DEFAULT 'AKTIV',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_tracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "niva" TEXT NOT NULL,
    "klubb" TEXT,
    "region" TEXT,
    "inkludertFra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fysisk" INTEGER,
    "teknikk" INTEGER,
    "taktikk" INTEGER,
    "mental" INTEGER,
    "motivasjon" INTEGER,
    "milepaeler" JSONB,
    "notater" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talent_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_ressurser" (
    "id" TEXT NOT NULL,
    "tittel" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "niva" TEXT,
    "fokus" TEXT,
    "beskrivelse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_ressurser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "restingHr" INTEGER,
    "hrv" INTEGER,
    "sleepHours" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "LeaveReason" NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "description" TEXT,
    "isInjury" BOOLEAN NOT NULL DEFAULT false,
    "rehabPlan" JSONB,
    "returnedAt" TIMESTAMP(3),
    "notifiedCoach" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_invitations" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "relation" "ParentLinkRelation" NOT NULL DEFAULT 'GUARDIAN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_relations" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT 'Foresatt',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceOre" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "coachUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "serviceTypeId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "priceOre" INTEGER NOT NULL DEFAULT 0,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "subscriptionId" TEXT,
    "googleEventId" TEXT,
    "facilityId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "coachId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainingSessionV2Id" TEXT,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "coachId" TEXT,
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedSnapshot" JSONB,
    "playerComment" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "aiModel" TEXT,
    "aiGenerationId" TEXT,
    "targetAllocation" JSONB,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_plan_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "contextJson" JSONB NOT NULL,
    "responseJson" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "tokensInput" INTEGER,
    "tokensOutput" INTEGER,
    "costUsd" DOUBLE PRECISION,
    "iterationOf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_plan_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_plan_sessions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT,
    "pyramidArea" "PyramidArea" NOT NULL,
    "skillArea" "SkillArea",
    "environment" "SessionEnvironment",
    "lPhase" "LPhase",
    "pressureLevel" "PressureLevel",
    "lFase" "LFase",
    "miljo" "MMiljo",
    "csNivaa" "CSNivaa",
    "pPosisjoner" TEXT[],
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "liveSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plan_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "pyramidArea" "PyramidArea" NOT NULL,
    "lPhase" "LPhase",
    "defaultRepsSets" TEXT,
    "csMin" INTEGER,
    "csMax" INTEGER,
    "durationMin" INTEGER,
    "createdBy" TEXT,
    "parametersJson" JSONB,
    "skillArea" "SkillArea",
    "minKategori" "NgfKategori",
    "maxKategori" "NgfKategori",
    "minHcp" DOUBLE PRECISION,
    "maxHcp" DOUBLE PRECISION,
    "environment" "SessionEnvironment"[] DEFAULT ARRAY[]::"SessionEnvironment"[],
    "utstyr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "intensitet" INTEGER,
    "lPhases" "LPhase"[] DEFAULT ARRAY[]::"LPhase"[],
    "morad" BOOLEAN NOT NULL DEFAULT false,
    "fasilitetKrav" "DrillFasilitet"[] DEFAULT ARRAY[]::"DrillFasilitet"[],
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coachNotes" TEXT,
    "kilde" TEXT,
    "treningstype" "DrillPracticeType",
    "defaultSets" INTEGER,
    "defaultReps" INTEGER,
    "csTargetByKategori" JSONB,
    "source" "ExerciseSource" NOT NULL DEFAULT 'SYSTEM',
    "visibility" "ExerciseVisibility" NOT NULL DEFAULT 'PRIVATE',
    "image_url" TEXT,
    "muscle_groups" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_drills" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "repsSets" TEXT NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "csTarget" INTEGER,
    "lFase" "LFase",
    "miljo" "MMiljo",
    "csNivaa" "CSNivaa",
    "prPress" "PRPress",
    "pyramidArea" "PyramidArea",
    "skillArea" "SkillArea",
    "repType" "RepType",
    "repAntall" INTEGER,
    "repMinutter" INTEGER,
    "repSett" INTEGER,
    "repReps" INTEGER,
    "pPosisjoner" TEXT[],
    "notes" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "positionTaskId" TEXT,

    CONSTRAINT "session_drills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kategori" "NgfKategori" NOT NULL,
    "lPhase" "LPhase" NOT NULL,
    "varighetUker" INTEGER NOT NULL DEFAULT 4,
    "ukentligOktAntall" INTEGER NOT NULL DEFAULT 5,
    "disciplinFordeling" JSONB NOT NULL,
    "minAlder" INTEGER,
    "maxAlder" INTEGER,
    "byCoachId" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "effectivenessAvg" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_template_sessions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "ukeNr" INTEGER NOT NULL,
    "dagNr" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "varighetMin" INTEGER NOT NULL,
    "pyramidArea" "PyramidArea" NOT NULL,
    "skillArea" "SkillArea",
    "environment" "SessionEnvironment" NOT NULL,
    "drillsJson" JSONB NOT NULL,
    "focus" TEXT,
    "notes" TEXT,

    CONSTRAINT "plan_template_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_effectiveness" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "templateId" TEXT,
    "userId" TEXT NOT NULL,
    "preSnapshot" JSONB NOT NULL,
    "postSnapshot" JSONB NOT NULL,
    "sgTotalDelta" DOUBLE PRECISION,
    "sgOttDelta" DOUBLE PRECISION,
    "sgAppDelta" DOUBLE PRECISION,
    "sgArgDelta" DOUBLE PRECISION,
    "sgPuttDelta" DOUBLE PRECISION,
    "hcpDelta" DOUBLE PRECISION,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "selfRating" DOUBLE PRECISION,
    "coachRating" DOUBLE PRECISION,
    "notes" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_effectiveness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_plan_session_logs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "csAchieved" INTEGER,
    "notes" TEXT,
    "rating" INTEGER,
    "totalReps" INTEGER,
    "drillAggregates" JSONB,
    "abandonReason" TEXT,
    "coachFeedback" TEXT,
    "coachFeedbackAt" TIMESTAMP(3),
    "coachFeedbackById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_plan_session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "par" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION,
    "slope" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baneId" TEXT,

    CONSTRAINT "course_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sgArea" "SgCategory" NOT NULL,
    "minutes" INTEGER NOT NULL,
    "drillName" TEXT,
    "quality" SMALLINT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "sgTotal" DOUBLE PRECISION,
    "sgOtt" DOUBLE PRECISION,
    "sgApp" DOUBLE PRECISION,
    "sgArg" DOUBLE PRECISION,
    "sgPutt" DOUBLE PRECISION,
    "sgTee" DOUBLE PRECISION,
    "sgApp200" DOUBLE PRECISION,
    "sgApp150" DOUBLE PRECISION,
    "sgApp100" DOUBLE PRECISION,
    "sgApp50" DOUBLE PRECISION,
    "sgChip" DOUBLE PRECISION,
    "sgPitch" DOUBLE PRECISION,
    "sgLob" DOUBLE PRECISION,
    "sgBunker" DOUBLE PRECISION,
    "sgPutt0_3" DOUBLE PRECISION,
    "sgPutt3_5" DOUBLE PRECISION,
    "sgPutt5_10" DOUBLE PRECISION,
    "sgPutt10_15" DOUBLE PRECISION,
    "sgPutt15_25" DOUBLE PRECISION,
    "sgPutt25_40" DOUBLE PRECISION,
    "sgPutt40plus" DOUBLE PRECISION,
    "sgSource" TEXT,
    "roundType" TEXT,
    "notes" TEXT,
    "tournamentEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shots" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "holePar" INTEGER NOT NULL,
    "shotNumber" INTEGER NOT NULL,
    "club" TEXT,
    "lie" "ShotLie" NOT NULL,
    "distanceToPin" DOUBLE PRECISION,
    "distanceHit" DOUBLE PRECISION,
    "windDir" "WindDir",
    "shotType" "ShotType" NOT NULL,
    "isPenalty" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startX" DOUBLE PRECISION,
    "startY" DOUBLE PRECISION,
    "endX" DOUBLE PRECISION,
    "endY" DOUBLE PRECISION,
    "targetX" DOUBLE PRECISION,
    "targetY" DOUBLE PRECISION,
    "mentalScore" SMALLINT,

    CONSTRAINT "shots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_ball_logs" (
    "id" TEXT NOT NULL,
    "planSessionId" TEXT NOT NULL,
    "club" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_ball_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hole_scores" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "strokes" INTEGER NOT NULL,
    "putts" INTEGER,
    "fairway" BOOLEAN,
    "gir" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hole_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pyramidArea" "PyramidArea" NOT NULL,
    "scoringRule" TEXT NOT NULL,
    "protocol" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "TestVisibility" NOT NULL DEFAULT 'PRIVATE',
    "isCoachApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "status" "TestSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
    "scoringData" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "abortedAt" TIMESTAMP(3),
    "testResultId" TEXT,

    CONSTRAINT "test_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_assignments" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "note" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "TestAssignmentStatus" NOT NULL DEFAULT 'OPEN',
    "completedResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trackman_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "shotCount" INTEGER NOT NULL DEFAULT 0,
    "rawJson" JSONB,
    "environment" "TrackManEnvironment",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trackman_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_reports" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "payload" JSONB,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_actions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT,
    "planId" TEXT,
    "actionType" TEXT NOT NULL,
    "suggestion" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "agentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" "GoalCategory" NOT NULL DEFAULT 'OUTCOME',
    "title" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT,
    "preferredArea" "PyramidArea",
    "preferredDate" TIMESTAMP(3),
    "preferredTime" TEXT,
    "durationMin" INTEGER,
    "reason" TEXT NOT NULL DEFAULT '',
    "status" "SessionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "approvedSessionId" TEXT,
    "coachResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "session_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "kind" TEXT NOT NULL DEFAULT 'AI',
    "liveSessionId" TEXT,
    "liveSessionKind" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaching_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "Tier" NOT NULL DEFAULT 'GRATIS',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodEnd" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "monthlyCredits" INTEGER NOT NULL DEFAULT 0,
    "creditsRemaining" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "program" "PlayerProgram" NOT NULL,
    "coachId" TEXT,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "stripeInvoiceId" TEXT,
    "stripeSessionId" TEXT,
    "stripeCustomerId" TEXT,
    "amountOre" INTEGER NOT NULL,
    "amountRefundedOre" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'nok',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "type" "PaymentType" NOT NULL,
    "userId" TEXT,
    "bookingId" TEXT,
    "subscriptionId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drill_challenges" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "drillId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drill_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participants" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" DOUBLE PRECISION,
    "rank" INTEGER,
    "notes" TEXT,

    CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_bags" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driver" TEXT,
    "fairwayWoods" TEXT,
    "hybrids" TEXT,
    "irons" TEXT,
    "wedges" TEXT,
    "putter" TEXT,
    "ball" TEXT,
    "bag" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_bags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_videos" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "bookingId" TEXT,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "durationSec" INTEGER,
    "sizeBytes" INTEGER,
    "tag" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_swing_videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "liveSessionId" TEXT,
    "liveSessionKind" TEXT,
    "videoUrl" TEXT NOT NULL,
    "storagePath" TEXT,
    "drillId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "consentVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_swing_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swing_analyses" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "positions" JSONB,
    "trackManShotId" TEXT,
    "summary" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "swing_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_calendar_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleEmail" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "refreshTokenCipher" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "channelId" TEXT,
    "resourceId" TEXT,
    "channelExpiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_calendar_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_calendar_subscriptions" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "googleCalendarId" TEXT NOT NULL,
    "calendarName" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "syncPush" BOOLEAN NOT NULL DEFAULT false,
    "syncPull" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "watchChannelId" TEXT,
    "watchResourceId" TEXT,
    "watchExpiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_calendar_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "courseId" TEXT,
    "format" TEXT NOT NULL DEFAULT 'STROKE',
    "notes" TEXT,
    "sourceOrigin" TEXT,
    "sourceId" TEXT,
    "tour" TEXT,
    "country" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" TEXT,
    "winnerName" TEXT,
    "officialUrl" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "shortName" TEXT,
    "purseUsd" INTEGER,
    "tier" INTEGER,
    "weekStart" TIMESTAMP(3),
    "norskeAntall" INTEGER DEFAULT 0,
    "createdByUserId" TEXT,
    "mergedIntoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "baner" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "kortNavn" TEXT,
    "klubb" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "kommune" TEXT,
    "fylke" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "antallHull" INTEGER NOT NULL DEFAULT 18,
    "oppstartsaar" INTEGER,
    "hjemmeside" TEXT,
    "lengdeMeter" INTEGER,
    "slope" INTEGER,
    "courseRating" DOUBLE PRECISION,
    "par" INTEGER NOT NULL DEFAULT 72,
    "bio" TEXT,
    "hovedBilde" TEXT,
    "totaltAntallTurneringer" INTEGER NOT NULL DEFAULT 0,
    "spillereSomHarSpilt" INTEGER NOT NULL DEFAULT 0,
    "lavesteRundeRegistrert" INTEGER,
    "geojson" JSONB,
    "osmRelationId" TEXT,
    "geometrySource" TEXT,
    "geometryUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_holes" (
    "id" TEXT NOT NULL,
    "baneId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "par" INTEGER,
    "lengthMeter" INTEGER,
    "handicapIndex" INTEGER,
    "teeLat" DOUBLE PRECISION,
    "teeLng" DOUBLE PRECISION,
    "greenLat" DOUBLE PRECISION,
    "greenLng" DOUBLE PRECISION,
    "pinLat" DOUBLE PRECISION,
    "pinLng" DOUBLE PRECISION,
    "geojson" JSONB,
    "osmWayId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_holes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gameplan_hull" (
    "id" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siktLat" DOUBLE PRECISION NOT NULL,
    "siktLng" DOUBLE PRECISION NOT NULL,
    "notat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gameplan_hull_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gameplan_sone" (
    "id" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "senterLat" DOUBLE PRECISION NOT NULL,
    "senterLng" DOUBLE PRECISION NOT NULL,
    "radiusMeter" DOUBLE PRECISION NOT NULL,
    "laast" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gameplan_sone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_players" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'NO',
    "birthYear" INTEGER,
    "tier" TEXT NOT NULL,
    "dataGolfId" INTEGER,
    "ngfId" TEXT,
    "wagrId" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "instagramHandle" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_player_entries" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "position" INTEGER,
    "scoreToPar" INTEGER,
    "totalScore" INTEGER,
    "rounds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_player_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_player_rounds" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "score" INTEGER,
    "toPar" INTEGER,
    "sgOtt" DOUBLE PRECISION,
    "sgApp" DOUBLE PRECISION,
    "sgArg" DOUBLE PRECISION,
    "sgPutt" DOUBLE PRECISION,
    "sgT2g" DOUBLE PRECISION,
    "sgTotal" DOUBLE PRECISION,
    "drivingDist" DOUBLE PRECISION,
    "drivingAcc" DOUBLE PRECISION,
    "gir" DOUBLE PRECISION,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_player_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_snapshots" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_results" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" INTEGER,
    "score" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_blocks" (
    "id" TEXT NOT NULL,
    "seasonPlanId" TEXT NOT NULL,
    "lPhase" "LPhase" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "focus" TEXT,
    "weeklyVolMin" INTEGER,
    "weeklyVolMax" INTEGER,
    "weeklySessionBudget" JSONB,
    "notes" TEXT,

    CONSTRAINT "period_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_period_blocks" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "lPhase" "LPhase" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "focus" TEXT,
    "weeklyVolMin" INTEGER,
    "weeklyVolMax" INTEGER,
    "weeklySessionBudget" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_period_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonPlanId" TEXT,
    "tournamentId" TEXT,
    "manualName" TEXT,
    "manualDate" TIMESTAMP(3),
    "manualEndDate" TIMESTAMP(3),
    "category" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "entryStatus" "TournamentEntryStatus" NOT NULL DEFAULT 'PLANNED',
    "withdrawnAt" TIMESTAMP(3),
    "withdrawnReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "coachId" TEXT,
    "maxParticipants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_schedules" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "recurring" TEXT,
    "maxParticipants" INTEGER,
    "kind" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_periods" (
    "id" TEXT NOT NULL,
    "groupId" TEXT,
    "schoolYear" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "tone" TEXT,
    "note" TEXT,
    "competenceGoalIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_goals" (
    "id" TEXT NOT NULL,
    "classYear" TEXT NOT NULL,
    "curriculumCode" TEXT NOT NULL,
    "goalNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competence_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_schedule_entries" (
    "id" TEXT NOT NULL,
    "classYear" TEXT,
    "schoolYear" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "scopes" JSONB NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "userId" TEXT,
    "meta" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'error',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_availability" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "locationId" TEXT,
    "weekday" INTEGER,
    "date" TIMESTAMP(3),
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "recurrenceInterval" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" "FacilityType" NOT NULL DEFAULT 'GENERAL',
    "isIndoor" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "mapX" DOUBLE PRECISION,
    "mapY" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_recordings" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "bookingId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "playerId" TEXT,
    "audioUrl" TEXT,
    "chunks" JSONB NOT NULL DEFAULT '[]',
    "transcript" TEXT,
    "durationSec" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'RECORDING',
    "aiAnalysis" JSONB,
    "notionPageId" TEXT,
    "notes" TEXT,
    "retentionUntil" TIMESTAMP(3),
    "deepgramId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wagr_snapshots" (
    "id" TEXT NOT NULL,
    "wagrPlayerSlug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "moveDelta" INTEGER,
    "ptsAvg" DOUBLE PRECISION NOT NULL,
    "divisor" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "top10s" INTEGER NOT NULL DEFAULT 0,
    "bestRank" INTEGER,
    "countingEvents" INTEGER NOT NULL DEFAULT 0,
    "ngfCategory" TEXT,
    "userId" TEXT,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "wagr_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions_v2" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studentId" TEXT,
    "groupId" TEXT,
    "coachId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "miljo" "MMiljo" NOT NULL,
    "practiceType" "PracticeType" NOT NULL,
    "status" "SessionStatusV2" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "isCoachCreated" BOOLEAN NOT NULL DEFAULT true,
    "rrule" TEXT,
    "recurringGroupId" TEXT,
    "isException" BOOLEAN NOT NULL DEFAULT false,
    "generertFra" TEXT,
    "generertFraId" TEXT,
    "regelBrudd" JSONB,
    "trengerOppmerksomhet" BOOLEAN NOT NULL DEFAULT false,
    "drillLoggInterval" INTEGER NOT NULL DEFAULT 1,
    "completedSummary" JSONB,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "hostId" TEXT,
    "maxParticipants" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_participants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'INVITED',
    "joinedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "individualNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_notes" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_drills_v2" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "repetitions" INTEGER,
    "drillLoggInterval" INTEGER NOT NULL DEFAULT 1,
    "pyramide" "PyramidArea" NOT NULL,
    "omraade" TEXT,
    "lFase" "LFase",
    "csNivaa" "CSNivaa",
    "miljo" "MMiljo",
    "prPress" "PRPress",
    "repType" "RepType",
    "repAntall" INTEGER,
    "repMinutter" INTEGER,
    "repSett" INTEGER,
    "repReps" INTEGER,
    "pPosisjoner" TEXT[],
    "lifeKode" TEXT,
    "componentFocus" TEXT,
    "slowMotionMode" BOOLEAN NOT NULL DEFAULT false,
    "fysTreningstype" TEXT,
    "fysMuskelgruppe" TEXT,
    "fysOvelse" TEXT,
    "fysSett" INTEGER,
    "fysReps" INTEGER,
    "fysVektKg" DOUBLE PRECISION,
    "fysVektProsent" INTEGER,
    "fysTempo" TEXT,
    "fysPauseSek" INTEGER,
    "fysVarighetMin" INTEGER,
    "fysIntensitetsSone" INTEGER,
    "fysDistanseM" INTEGER,
    "fysAktivitet" TEXT,
    "fysBevegelighetType" TEXT,
    "fysHoldSek" INTEGER,
    "notes" TEXT,
    "positionTaskId" TEXT,

    CONSTRAINT "training_drills_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drill_logs_v2" (
    "id" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "loggedBy" TEXT NOT NULL,
    "successRate" INTEGER NOT NULL,
    "notes" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repsTotal" INTEGER NOT NULL DEFAULT 0,
    "repsWithoutBall" INTEGER NOT NULL DEFAULT 0,
    "repsLowSpeed" INTEGER NOT NULL DEFAULT 0,
    "repsAutomatic" INTEGER NOT NULL DEFAULT 0,
    "repsHit" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "drill_logs_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locked_anchors" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "ukedag" INTEGER NOT NULL,
    "startTid" TEXT NOT NULL,
    "sluttTid" TEXT NOT NULL,
    "startDato" TIMESTAMP(3) NOT NULL,
    "sluttDato" TIMESTAMP(3) NOT NULL,
    "varighetMin" INTEGER NOT NULL,
    "beskrivelse" TEXT,
    "fysMuskelgruppe" TEXT,
    "fysTreningstype" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locked_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_patterns" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "rrule" TEXT NOT NULL,
    "startDato" TIMESTAMP(3) NOT NULL,
    "sluttDato" TIMESTAMP(3),
    "startTid" TEXT NOT NULL,
    "varighetMin" INTEGER NOT NULL,
    "beskrivelse" TEXT,
    "fysMuskelgruppe" TEXT,
    "fysTreningstype" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_volume_recipes" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "period_volume_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_recipe_okter" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "antallPerUke" INTEGER NOT NULL,
    "varighetMin" INTEGER NOT NULL,
    "fysTreningstype" TEXT,
    "fysMuskelgruppeRotasjon" TEXT[],
    "preferertUkedag" INTEGER,
    "preferertTid" TEXT,
    "notat" TEXT,

    CONSTRAINT "period_recipe_okter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditional_rules" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "trainingPlanId" TEXT,
    "navn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parametere" JSONB NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "prioritet" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conditional_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drill_maler" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kategori" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "erFavoritt" BOOLEAN NOT NULL DEFAULT false,
    "erGlobal" BOOLEAN NOT NULL DEFAULT false,
    "bruktAntall" INTEGER NOT NULL DEFAULT 0,
    "sistBrukt" TIMESTAMP(3),
    "omraade" TEXT,
    "lFase" "LFase",
    "csNivaa" "CSNivaa",
    "miljo" "MMiljo",
    "prPress" "PRPress",
    "pPosisjoner" TEXT[],
    "componentFocus" TEXT,
    "fysTreningstype" TEXT,
    "fysMuskelgruppe" TEXT,
    "fysOvelse" TEXT,
    "fysSett" INTEGER,
    "fysReps" INTEGER,
    "fysVektProsent" INTEGER,
    "fysVarighetMin" INTEGER,
    "fysIntensitetsSone" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drill_maler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okt_maler" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kategori" TEXT NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "periodeType" "PeriodeType",
    "kategoriAK" TEXT,
    "erFavoritt" BOOLEAN NOT NULL DEFAULT false,
    "erGlobal" BOOLEAN NOT NULL DEFAULT false,
    "bruktAntall" INTEGER NOT NULL DEFAULT 0,
    "sistBrukt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "practiceType" "PracticeType" NOT NULL,
    "notat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okt_maler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okt_mal_driller" (
    "id" TEXT NOT NULL,
    "malId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "pyramide" "PyramidArea" NOT NULL,
    "navn" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "omraade" TEXT,
    "lFase" "LFase",
    "csNivaa" "CSNivaa",

    CONSTRAINT "okt_mal_driller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs_practiced" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "club" TEXT NOT NULL,
    "shotCount" INTEGER,
    "environment" "TrackManEnvironment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clubs_practiced_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sg_baselines" (
    "id" TEXT NOT NULL,
    "category" "SgCategory" NOT NULL,
    "distanceBucket" TEXT NOT NULL,
    "lie" "ShotLie",
    "expectedStrokes" DOUBLE PRECISION NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sg_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pga_player_seasons" (
    "id" TEXT NOT NULL,
    "dgPlayerId" INTEGER NOT NULL,
    "tour" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "country" TEXT,
    "rounds" INTEGER,
    "avgScore" DOUBLE PRECISION,
    "driveDist" DOUBLE PRECISION,
    "fairwayPct" DOUBLE PRECISION,
    "girPct" DOUBLE PRECISION,
    "puttsPerRound" DOUBLE PRECISION,
    "scrambling" DOUBLE PRECISION,
    "sgTotal" DOUBLE PRECISION,
    "sgOtt" DOUBLE PRECISION,
    "sgApp" DOUBLE PRECISION,
    "sgArg" DOUBLE PRECISION,
    "sgPutt" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'datagolf',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pga_player_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pga_putt_distance" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "tourAvgSunkPct" DOUBLE PRECISION NOT NULL,
    "top10AvgSunkPct" DOUBLE PRECISION,
    "proximityNext" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'broadie-estimate',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pga_putt_distance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pga_approach_distance" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "yardageBucket" TEXT NOT NULL,
    "tourAvgProximityMeters" DOUBLE PRECISION NOT NULL,
    "girPct" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'datagolf-approach-skill',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pga_approach_distance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bruker_sg_inputs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodeFra" TIMESTAMP(3),
    "periodeTil" TIMESTAMP(3),
    "sgOtt" DOUBLE PRECISION,
    "sgApp" DOUBLE PRECISION,
    "sgArg" DOUBLE PRECISION,
    "sgPutt" DOUBLE PRECISION,
    "sgTotal" DOUBLE PRECISION,
    "snittScore" DOUBLE PRECISION,
    "antallRunder" INTEGER,
    "kilde" TEXT NOT NULL DEFAULT 'MANUELL',
    "kommentar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bruker_sg_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bruker_sammenligninger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sgInputId" TEXT NOT NULL,
    "refDgPlayerId" INTEGER NOT NULL,
    "refPlayerName" TEXT NOT NULL,
    "refTour" TEXT NOT NULL DEFAULT 'pga',
    "refYear" INTEGER NOT NULL,
    "estPgaTourScore" DOUBLE PRECISION,
    "estHcp" DOUBLE PRECISION,
    "sgDiffTotal" DOUBLE PRECISION,
    "kommentar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bruker_sammenligninger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sg_insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "InsightCategory" NOT NULL,
    "severity" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "sg_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "best_session_references" (
    "userId" TEXT NOT NULL,
    "trackmanSessionId" TEXT NOT NULL,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinnedBy" TEXT NOT NULL,
    "notes" TEXT,
    "autoSuggested" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "best_session_references_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "shot_annotations" (
    "id" TEXT NOT NULL,
    "trackmanSessionId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "shotNumber" INTEGER NOT NULL,
    "coachId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shot_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_metric_trends" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "club" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "avgClubPath" DOUBLE PRECISION NOT NULL,
    "avgFaceAngle" DOUBLE PRECISION NOT NULL,
    "avgSmash" DOUBLE PRECISION NOT NULL,
    "avgTotal" DOUBLE PRECISION NOT NULL,
    "sigmaBall" DOUBLE PRECISION NOT NULL,
    "shotCount" INTEGER NOT NULL,

    CONSTRAINT "club_metric_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caddie_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "model" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caddie_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caddie_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caddie_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caddie_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "toolCallId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "toolInput" JSONB NOT NULL,
    "previewText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "caddie_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_drill_instances" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "drillId" TEXT,
    "drillName" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "plannedReps" INTEGER,
    "plannedSets" INTEGER,
    "pyramideArea" "PyramidArea" NOT NULL,
    "fase" TEXT,
    "belastning" TEXT,
    "praksisType" TEXT,
    "omrade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_drill_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_sets" (
    "id" TEXT NOT NULL,
    "drillInstanceId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_drill_notes" (
    "id" TEXT NOT NULL,
    "drillInstanceId" TEXT NOT NULL,
    "type" "SessionNoteType" NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "videoThumbnailUrl" TEXT,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "answerContent" TEXT,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_drill_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_adjustments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "focusAreas" "PyramidArea"[],
    "status" "PlanAdjustmentStatus" NOT NULL DEFAULT 'PENDING',
    "coachResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "plan_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_change_requests" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "planId" TEXT,
    "sessionId" TEXT,
    "changeType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "coachId" TEXT,
    "coachNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_preparations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "targetFinish" TEXT,
    "totalDays" INTEGER NOT NULL,
    "sessionsPlanned" INTEGER NOT NULL DEFAULT 0,
    "sessionsDone" INTEGER NOT NULL DEFAULT 0,
    "aiSummary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_preparations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodBlockId" TEXT,
    "navn" TEXT NOT NULL,
    "status" "TechPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "startDato" TIMESTAMP(3) NOT NULL,
    "sluttDato" TIMESTAMP(3),
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "planVariant" TEXT,
    "parentPlanId" TEXT,
    "opprettetAvId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technical_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_prefs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "range" BOOLEAN NOT NULL DEFAULT true,
    "putting" BOOLEAN NOT NULL DEFAULT true,
    "shortgame" BOOLEAN NOT NULL DEFAULT true,
    "trackman" BOOLEAN NOT NULL DEFAULT true,
    "course9" BOOLEAN NOT NULL DEFAULT false,
    "course18" BOOLEAN NOT NULL DEFAULT true,
    "gym" BOOLEAN NOT NULL DEFAULT true,
    "yoga" BOOLEAN NOT NULL DEFAULT false,
    "pool" BOOLEAN NOT NULL DEFAULT false,
    "video" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_prefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "week" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "span" INTEGER NOT NULL DEFAULT 1,
    "axis" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meta" TEXT NOT NULL DEFAULT '',
    "done" BOOLEAN NOT NULL DEFAULT false,
    "isNow" BOOLEAN NOT NULL DEFAULT false,
    "isPeak" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_camps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "partner" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_camps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_plan_positions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "pNummer" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "hovedfokus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "technical_plan_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_tasks" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "tittel" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "bildeUrl" TEXT,
    "videoUrl" TEXT,
    "pyramide" "PyramidArea" NOT NULL,
    "omraade" TEXT NOT NULL,
    "koller" TEXT[],
    "lFase" "LFase",
    "cs" "CSNivaa",
    "miljo" "MMiljo",
    "prPress" "PRPress",
    "slagType" TEXT,
    "kategori" "TaskKategori",
    "repsMaalDry" INTEGER NOT NULL DEFAULT 0,
    "repsMaalLav" INTEGER NOT NULL DEFAULT 0,
    "repsMaalFull" INTEGER NOT NULL DEFAULT 0,
    "repsGjortDry" INTEGER NOT NULL DEFAULT 0,
    "repsGjortLav" INTEGER NOT NULL DEFAULT 0,
    "repsGjortFull" INTEGER NOT NULL DEFAULT 0,
    "status" "PositionTaskStatus" NOT NULL DEFAULT 'PENDING',
    "trackStatus" "TrackStatus" NOT NULL DEFAULT 'PAA_VEI',
    "trackStatusUpdatedAt" TIMESTAMP(3),
    "diagnosticMetrics" JSONB,
    "diagnosticOverride" BOOLEAN NOT NULL DEFAULT false,
    "estimatedCompleteAt" TIMESTAMP(3),
    "lastRepLoggedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "position_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_task_logs" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "sessionV2Id" TEXT,
    "trackmanShotId" TEXT,
    "loggedByUserId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "hastighet" "RepHastighet" NOT NULL,
    "notater" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "position_task_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_task_tm_goals" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "klubb" TEXT NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "baselineFrom" TEXT NOT NULL,
    "baselineDate" TIMESTAMP(3) NOT NULL,
    "baselineN" INTEGER,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "targetType" "TmGoalType" NOT NULL,
    "comparison" "TmGoalComparison" NOT NULL,
    "rangeMax" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "progressPct" INTEGER,
    "inTarget" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3),
    "protocol" "TmGoalProtocol",
    "windowSize" INTEGER,
    "requiredHits" INTEGER,
    "corridorMin" DOUBLE PRECISION,
    "corridorMax" DOUBLE PRECISION,
    "currentHits" INTEGER,
    "currentBatchSize" INTEGER,
    "bestHits" INTEGER,
    "currentStreak" INTEGER,
    "bestStreak" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "position_task_tm_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_plan_club_targets" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "club" TEXT NOT NULL,
    "primaryMetric" TEXT NOT NULL,
    "primaryGoalMin" DOUBLE PRECISION,
    "primaryGoalMax" DOUBLE PRECISION,
    "secondaryGoals" JSONB NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "currentValueAt" TIMESTAMP(3),
    "status" "ClubTargetStatus" NOT NULL DEFAULT 'IKKE_BEGYNT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technical_plan_club_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_plan_audits" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technical_plan_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trackman_shots" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "shotNumber" INTEGER NOT NULL,
    "club" TEXT NOT NULL,
    "ballSpeed" DOUBLE PRECISION,
    "smashFactor" DOUBLE PRECISION,
    "launchAngle" DOUBLE PRECISION,
    "spinRate" DOUBLE PRECISION,
    "spinAxis" DOUBLE PRECISION,
    "carryDistance" DOUBLE PRECISION,
    "totalDistance" DOUBLE PRECISION,
    "apexHeight" DOUBLE PRECISION,
    "landAngle" DOUBLE PRECISION,
    "side" DOUBLE PRECISION,
    "clubSpeed" DOUBLE PRECISION,
    "attackAngle" DOUBLE PRECISION,
    "clubPath" DOUBLE PRECISION,
    "faceAngle" DOUBLE PRECISION,
    "faceToPath" DOUBLE PRECISION,
    "dynamicLoft" DOUBLE PRECISION,
    "strikePatternX" DOUBLE PRECISION,
    "strikePatternY" DOUBLE PRECISION,
    "positionTaskId" TEXT,
    "matchSource" TEXT,
    "matchConfidence" TEXT,
    "hastighet" "RepHastighet",
    "outlier" BOOLEAN NOT NULL DEFAULT false,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trackman_shots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_suggestions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "type" "SuggestionType" NOT NULL,
    "payload" JSONB NOT NULL,
    "evidence" JSONB NOT NULL,
    "reason" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_failures" (
    "id" TEXT NOT NULL,
    "webhookSource" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notion_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessTokenEnc" TEXT NOT NULL,
    "botId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "workspaceName" TEXT NOT NULL,
    "workspaceIcon" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notion_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notion_database_links" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "notionDatabaseId" TEXT NOT NULL,
    "notionDataSourceId" TEXT,
    "navn" TEXT NOT NULL,
    "type" "NotionLinkType" NOT NULL DEFAULT 'OPPGAVER',
    "propTittel" TEXT NOT NULL DEFAULT 'Tittel',
    "propStatus" TEXT,
    "propPrioritet" TEXT,
    "propSynlighet" TEXT,
    "propTildelt" TEXT,
    "propForfaller" TEXT,
    "propLenke" TEXT,
    "propNotater" TEXT,
    "propProsjekt" TEXT,
    "propSelskap" TEXT,
    "syncMode" "NotionSyncMode" NOT NULL DEFAULT 'AUTO',
    "lastSyncAt" TIMESTAMP(3),
    "pagesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notion_database_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oppgave_cache" (
    "id" TEXT NOT NULL,
    "databaseLinkId" TEXT NOT NULL,
    "notionPageId" TEXT NOT NULL,
    "notionUrl" TEXT NOT NULL,
    "tittel" TEXT NOT NULL,
    "status" TEXT,
    "prioritet" TEXT,
    "selskap" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "forfaller" TIMESTAMP(3),
    "notater" TEXT,
    "lenke" TEXT,
    "tildeltNavn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prosjektIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notionLastEdited" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oppgave_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prosjekt_cache" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "notionPageId" TEXT NOT NULL,
    "notionUrl" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "status" TEXT,
    "selskap" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "oppgaverOpen" INTEGER NOT NULL DEFAULT 0,
    "oppgaverDoing" INTEGER NOT NULL DEFAULT 0,
    "oppgaverDone" INTEGER NOT NULL DEFAULT 0,
    "notionLastEdited" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prosjekt_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fysiske_planer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opprettetAvId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "status" "TechPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "startDato" TIMESTAMP(3) NOT NULL,
    "sluttDato" TIMESTAMP(3),
    "notater" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fysiske_planer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fys_uker" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "ukeNr" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "fys_uker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fys_okter" (
    "id" TEXT NOT NULL,
    "ukeId" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "dag" "Ukedag",
    "sortOrder" INTEGER NOT NULL,
    "estimertMinutter" INTEGER,
    "type" TEXT,

    CONSTRAINT "fys_okter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fys_ovelse_rader" (
    "id" TEXT NOT NULL,
    "oktId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "navn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "sett" INTEGER NOT NULL DEFAULT 3,
    "repsMin" INTEGER,
    "repsMax" INTEGER,
    "hvile" INTEGER,
    "belastningPst" INTEGER,
    "rir" INTEGER,
    "muskelgruppe" TEXT,
    "loggSett" INTEGER,
    "loggRepsPerSett" TEXT,
    "loggBelastningKg" DOUBLE PRECISION,
    "loggRir" INTEGER,
    "notat" TEXT,
    "loggSettData" JSONB,
    "intervallSerier" INTEGER,
    "intervallMinutter" INTEGER,
    "pulssone" TEXT,
    "pause" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fys_ovelse_rader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_approvals" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "designPath" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_koblinger" (
    "id" TEXT NOT NULL,
    "designFile" TEXT NOT NULL,
    "designTitle" TEXT NOT NULL,
    "designH1" TEXT,
    "suggestedRoute" TEXT,
    "confirmedRoute" TEXT,
    "status" "DesignKoblingStatus" NOT NULL DEFAULT 'UNMAPPED',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "buttonCount" INTEGER NOT NULL DEFAULT 0,
    "linkCount" INTEGER NOT NULL DEFAULT 0,
    "buttons" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_koblinger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_drill_directiv" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "type" "CoachDirektivType" NOT NULL,
    "kommentar" TEXT,
    "gyldigTil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_drill_directiv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_settings" (
    "id" TEXT NOT NULL,
    "clubName" TEXT,
    "dagligLeder" TEXT,
    "orgNr" TEXT,
    "epost" TEXT,
    "telefon" TEXT,
    "adresse" TEXT,
    "apningstider" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectUserId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "askerUserId" TEXT NOT NULL,
    "coachUserId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "answer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "uploaderUserId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kommando_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kommando_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kommando_chats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kommando_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kommando_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kommando_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kommando_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kommando_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kommando_agent_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "kommando_agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kommando_agent_steps" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "output" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "kommando_agent_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invariant_overrides" (
    "id" TEXT NOT NULL,
    "invariantId" TEXT NOT NULL,
    "sessionId" TEXT,
    "planId" TEXT,
    "begrunnelse" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invariant_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innboks_epost" (
    "id" TEXT NOT NULL,
    "fraEpost" TEXT NOT NULL,
    "fraNavn" TEXT,
    "emne" TEXT NOT NULL,
    "brodtekst" TEXT NOT NULL,
    "mottattAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'NY',
    "utkastSvar" TEXT,
    "utkastGenerertAt" TIMESTAMP(3),
    "sendtAt" TIMESTAMP(3),
    "sendtAv" TEXT,

    CONSTRAINT "innboks_epost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "side" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "brief" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UTKAST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_cases" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "userId" TEXT NOT NULL,
    "reporterId" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "begrunnelse" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_pinned_players" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_pinned_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datagolf_sync_state" (
    "endpoint" TEXT NOT NULL,
    "params_hash" TEXT NOT NULL,
    "params_json" TEXT,
    "s3_key" TEXT,
    "row_count" INTEGER DEFAULT 0,
    "last_status" INTEGER,
    "last_error" TEXT,
    "last_synced_at" TIMESTAMPTZ(6),

    CONSTRAINT "datagolf_sync_state_pkey" PRIMARY KEY ("endpoint","params_hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_authId_key" ON "users"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_publicPlayerId_key" ON "users"("publicPlayerId");

-- CreateIndex
CREATE INDEX "users_role_deletedAt_idx" ON "users"("role", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "talent_tracking_userId_key" ON "talent_tracking"("userId");

-- CreateIndex
CREATE INDEX "talent_tracking_niva_region_idx" ON "talent_tracking"("niva", "region");

-- CreateIndex
CREATE INDEX "talent_tracking_klubb_idx" ON "talent_tracking"("klubb");

-- CreateIndex
CREATE INDEX "talent_ressurser_kategori_niva_idx" ON "talent_ressurser"("kategori", "niva");

-- CreateIndex
CREATE INDEX "talent_ressurser_fokus_idx" ON "talent_ressurser"("fokus");

-- CreateIndex
CREATE INDEX "health_entries_userId_date_idx" ON "health_entries"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "health_entries_userId_date_key" ON "health_entries"("userId", "date");

-- CreateIndex
CREATE INDEX "leaves_userId_startAt_idx" ON "leaves"("userId", "startAt");

-- CreateIndex
CREATE INDEX "leaves_userId_endAt_idx" ON "leaves"("userId", "endAt");

-- CreateIndex
CREATE UNIQUE INDEX "parent_invitations_token_key" ON "parent_invitations"("token");

-- CreateIndex
CREATE INDEX "parent_invitations_playerId_idx" ON "parent_invitations"("playerId");

-- CreateIndex
CREATE INDEX "parent_invitations_email_idx" ON "parent_invitations"("email");

-- CreateIndex
CREATE INDEX "parent_relations_childId_idx" ON "parent_relations"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "parent_relations_parentId_childId_key" ON "parent_relations"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_slug_key" ON "service_types"("slug");

-- CreateIndex
CREATE INDEX "service_types_coachUserId_idx" ON "service_types"("coachUserId");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

-- CreateIndex
CREATE INDEX "bookings_coachId_idx" ON "bookings"("coachId");

-- CreateIndex
CREATE INDEX "bookings_startAt_idx" ON "bookings"("startAt");

-- CreateIndex
CREATE INDEX "bookings_stripeCheckoutSessionId_idx" ON "bookings"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "bookings_subscriptionId_idx" ON "bookings"("subscriptionId");

-- CreateIndex
CREATE INDEX "bookings_facilityId_idx" ON "bookings"("facilityId");

-- CreateIndex
CREATE INDEX "bookings_startAt_status_idx" ON "bookings"("startAt", "status");

-- CreateIndex
CREATE INDEX "calendar_events_coachId_idx" ON "calendar_events"("coachId");

-- CreateIndex
CREATE INDEX "calendar_events_startAt_endAt_idx" ON "calendar_events"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "training_plans_userId_isActive_idx" ON "training_plans"("userId", "isActive");

-- CreateIndex
CREATE INDEX "training_plans_status_idx" ON "training_plans"("status");

-- CreateIndex
CREATE INDEX "training_plans_aiGenerationId_idx" ON "training_plans"("aiGenerationId");

-- CreateIndex
CREATE INDEX "ai_plan_generations_userId_createdAt_idx" ON "ai_plan_generations"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_plan_generations_coachId_createdAt_idx" ON "ai_plan_generations"("coachId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_plan_generations_iterationOf_idx" ON "ai_plan_generations"("iterationOf");

-- CreateIndex
CREATE INDEX "training_plan_sessions_planId_scheduledAt_idx" ON "training_plan_sessions"("planId", "scheduledAt");

-- CreateIndex
CREATE INDEX "exercise_definitions_pyramidArea_idx" ON "exercise_definitions"("pyramidArea");

-- CreateIndex
CREATE INDEX "exercise_definitions_skillArea_idx" ON "exercise_definitions"("skillArea");

-- CreateIndex
CREATE INDEX "exercise_definitions_minKategori_maxKategori_idx" ON "exercise_definitions"("minKategori", "maxKategori");

-- CreateIndex
CREATE INDEX "exercise_definitions_source_createdBy_idx" ON "exercise_definitions"("source", "createdBy");

-- CreateIndex
CREATE INDEX "session_drills_sessionId_idx" ON "session_drills"("sessionId");

-- CreateIndex
CREATE INDEX "session_drills_positionTaskId_idx" ON "session_drills"("positionTaskId");

-- CreateIndex
CREATE INDEX "plan_templates_kategori_lPhase_idx" ON "plan_templates"("kategori", "lPhase");

-- CreateIndex
CREATE UNIQUE INDEX "plan_templates_kategori_lPhase_name_key" ON "plan_templates"("kategori", "lPhase", "name");

-- CreateIndex
CREATE INDEX "plan_template_sessions_templateId_idx" ON "plan_template_sessions"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_template_sessions_templateId_ukeNr_dagNr_key" ON "plan_template_sessions"("templateId", "ukeNr", "dagNr");

-- CreateIndex
CREATE UNIQUE INDEX "plan_effectiveness_planId_key" ON "plan_effectiveness"("planId");

-- CreateIndex
CREATE INDEX "plan_effectiveness_userId_idx" ON "plan_effectiveness"("userId");

-- CreateIndex
CREATE INDEX "plan_effectiveness_templateId_idx" ON "plan_effectiveness"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "training_plan_session_logs_sessionId_key" ON "training_plan_session_logs"("sessionId");

-- CreateIndex
CREATE INDEX "course_definitions_baneId_idx" ON "course_definitions"("baneId");

-- CreateIndex
CREATE INDEX "training_logs_userId_date_idx" ON "training_logs"("userId", "date");

-- CreateIndex
CREATE INDEX "training_logs_userId_sgArea_idx" ON "training_logs"("userId", "sgArea");

-- CreateIndex
CREATE INDEX "rounds_userId_playedAt_idx" ON "rounds"("userId", "playedAt");

-- CreateIndex
CREATE INDEX "rounds_tournamentEntryId_idx" ON "rounds"("tournamentEntryId");

-- CreateIndex
CREATE INDEX "shots_roundId_holeNumber_idx" ON "shots"("roundId", "holeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "shots_roundId_holeNumber_shotNumber_key" ON "shots"("roundId", "holeNumber", "shotNumber");

-- CreateIndex
CREATE INDEX "session_ball_logs_planSessionId_idx" ON "session_ball_logs"("planSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "session_ball_logs_planSessionId_club_key" ON "session_ball_logs"("planSessionId", "club");

-- CreateIndex
CREATE INDEX "hole_scores_roundId_idx" ON "hole_scores"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "hole_scores_roundId_holeNumber_key" ON "hole_scores"("roundId", "holeNumber");

-- CreateIndex
CREATE INDEX "test_definitions_createdById_isCustom_idx" ON "test_definitions"("createdById", "isCustom");

-- CreateIndex
CREATE INDEX "test_definitions_visibility_isCustom_idx" ON "test_definitions"("visibility", "isCustom");

-- CreateIndex
CREATE INDEX "test_results_userId_takenAt_idx" ON "test_results"("userId", "takenAt");

-- CreateIndex
CREATE INDEX "test_sessions_userId_status_idx" ON "test_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "test_sessions_testId_status_idx" ON "test_sessions"("testId", "status");

-- CreateIndex
CREATE INDEX "test_assignments_playerId_status_idx" ON "test_assignments"("playerId", "status");

-- CreateIndex
CREATE INDEX "test_assignments_coachId_status_idx" ON "test_assignments"("coachId", "status");

-- CreateIndex
CREATE INDEX "test_assignments_testId_idx" ON "test_assignments"("testId");

-- CreateIndex
CREATE INDEX "trackman_sessions_userId_recordedAt_idx" ON "trackman_sessions"("userId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_reports_year_month_key" ON "monthly_reports"("year", "month");

-- CreateIndex
CREATE INDEX "signals_userId_kind_computedAt_idx" ON "signals"("userId", "kind", "computedAt");

-- CreateIndex
CREATE INDEX "plan_actions_userId_status_createdAt_idx" ON "plan_actions"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "plan_actions_coachId_status_createdAt_idx" ON "plan_actions"("coachId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "agent_runs_agentName_createdAt_idx" ON "agent_runs"("agentName", "createdAt");

-- CreateIndex
CREATE INDEX "goals_userId_status_idx" ON "goals"("userId", "status");

-- CreateIndex
CREATE INDEX "goals_userId_category_status_idx" ON "goals"("userId", "category", "status");

-- CreateIndex
CREATE INDEX "achievements_userId_earnedAt_idx" ON "achievements"("userId", "earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_userId_kind_key" ON "achievements"("userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_userAId_userBId_key" ON "friendships"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "documents_userId_kind_idx" ON "documents"("userId", "kind");

-- CreateIndex
CREATE INDEX "session_requests_userId_status_idx" ON "session_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "session_requests_coachId_status_idx" ON "session_requests"("coachId", "status");

-- CreateIndex
CREATE INDEX "coaching_sessions_userId_updatedAt_idx" ON "coaching_sessions"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "coaching_sessions_liveSessionId_idx" ON "coaching_sessions"("liveSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "coaching_sessions_userId_liveSessionId_key" ON "coaching_sessions"("userId", "liveSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "player_enrollments_userId_endedAt_idx" ON "player_enrollments"("userId", "endedAt");

-- CreateIndex
CREATE INDEX "player_enrollments_coachId_endedAt_idx" ON "player_enrollments"("coachId", "endedAt");

-- CreateIndex
CREATE INDEX "player_enrollments_program_endedAt_idx" ON "player_enrollments"("program", "endedAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeChargeId_key" ON "payments"("stripeChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeInvoiceId_key" ON "payments"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");

-- CreateIndex
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "payments_type_createdAt_idx" ON "payments"("type", "createdAt");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paidAt_idx" ON "payments"("paidAt");

-- CreateIndex
CREATE INDEX "drill_challenges_ownerId_status_idx" ON "drill_challenges"("ownerId", "status");

-- CreateIndex
CREATE INDEX "drill_challenges_endAt_idx" ON "drill_challenges"("endAt");

-- CreateIndex
CREATE INDEX "challenge_participants_userId_idx" ON "challenge_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participants_challengeId_userId_key" ON "challenge_participants"("challengeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_bags_userId_key" ON "equipment_bags"("userId");

-- CreateIndex
CREATE INDEX "session_videos_playerId_createdAt_idx" ON "session_videos"("playerId", "createdAt");

-- CreateIndex
CREATE INDEX "session_videos_coachId_createdAt_idx" ON "session_videos"("coachId", "createdAt");

-- CreateIndex
CREATE INDEX "player_swing_videos_userId_createdAt_idx" ON "player_swing_videos"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "swing_analyses_videoId_key" ON "swing_analyses"("videoId");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "google_calendar_connections_userId_key" ON "google_calendar_connections"("userId");

-- CreateIndex
CREATE INDEX "google_calendar_subscriptions_connectionId_active_idx" ON "google_calendar_subscriptions"("connectionId", "active");

-- CreateIndex
CREATE INDEX "google_calendar_subscriptions_watchChannelId_idx" ON "google_calendar_subscriptions"("watchChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "google_calendar_subscriptions_connectionId_googleCalendarId_key" ON "google_calendar_subscriptions"("connectionId", "googleCalendarId");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_slug_key" ON "tournaments"("slug");

-- CreateIndex
CREATE INDEX "tournaments_startDate_idx" ON "tournaments"("startDate");

-- CreateIndex
CREATE INDEX "tournaments_sourceOrigin_sourceId_idx" ON "tournaments"("sourceOrigin", "sourceId");

-- CreateIndex
CREATE INDEX "tournaments_tour_status_startDate_idx" ON "tournaments"("tour", "status", "startDate");

-- CreateIndex
CREATE INDEX "tournaments_weekStart_status_idx" ON "tournaments"("weekStart", "status");

-- CreateIndex
CREATE INDEX "tournaments_createdByUserId_idx" ON "tournaments"("createdByUserId");

-- CreateIndex
CREATE INDEX "tournaments_mergedIntoId_idx" ON "tournaments"("mergedIntoId");

-- CreateIndex
CREATE UNIQUE INDEX "baner_slug_key" ON "baner"("slug");

-- CreateIndex
CREATE INDEX "baner_region_idx" ON "baner"("region");

-- CreateIndex
CREATE INDEX "baner_slug_idx" ON "baner"("slug");

-- CreateIndex
CREATE INDEX "course_holes_baneId_idx" ON "course_holes"("baneId");

-- CreateIndex
CREATE UNIQUE INDEX "course_holes_baneId_holeNumber_key" ON "course_holes"("baneId", "holeNumber");

-- CreateIndex
CREATE INDEX "gameplan_hull_userId_idx" ON "gameplan_hull"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "gameplan_hull_holeId_userId_key" ON "gameplan_hull"("holeId", "userId");

-- CreateIndex
CREATE INDEX "gameplan_sone_holeId_userId_idx" ON "gameplan_sone"("holeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "public_players_slug_key" ON "public_players"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "public_players_dataGolfId_key" ON "public_players"("dataGolfId");

-- CreateIndex
CREATE UNIQUE INDEX "public_players_wagrId_key" ON "public_players"("wagrId");

-- CreateIndex
CREATE INDEX "public_players_country_tier_isActive_idx" ON "public_players"("country", "tier", "isActive");

-- CreateIndex
CREATE INDEX "public_player_entries_tournamentId_position_idx" ON "public_player_entries"("tournamentId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "public_player_entries_playerId_tournamentId_key" ON "public_player_entries"("playerId", "tournamentId");

-- CreateIndex
CREATE INDEX "public_player_rounds_entryId_idx" ON "public_player_rounds"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "public_player_rounds_entryId_roundNumber_key" ON "public_player_rounds"("entryId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_snapshots_tournamentId_key" ON "leaderboard_snapshots"("tournamentId");

-- CreateIndex
CREATE INDEX "tournament_results_userId_idx" ON "tournament_results"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_results_tournamentId_userId_key" ON "tournament_results"("tournamentId", "userId");

-- CreateIndex
CREATE INDEX "season_plans_userId_idx" ON "season_plans"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "season_plans_userId_year_key" ON "season_plans"("userId", "year");

-- CreateIndex
CREATE INDEX "period_blocks_seasonPlanId_idx" ON "period_blocks"("seasonPlanId");

-- CreateIndex
CREATE INDEX "group_period_blocks_groupId_startDate_idx" ON "group_period_blocks"("groupId", "startDate");

-- CreateIndex
CREATE INDEX "tournament_entries_userId_idx" ON "tournament_entries"("userId");

-- CreateIndex
CREATE INDEX "tournament_entries_seasonPlanId_idx" ON "tournament_entries"("seasonPlanId");

-- CreateIndex
CREATE INDEX "tournament_entries_tournamentId_idx" ON "tournament_entries"("tournamentId");

-- CreateIndex
CREATE INDEX "groups_coachId_idx" ON "groups"("coachId");

-- CreateIndex
CREATE INDEX "group_schedules_groupId_startAt_idx" ON "group_schedules"("groupId", "startAt");

-- CreateIndex
CREATE INDEX "training_periods_groupId_startDate_idx" ON "training_periods"("groupId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "competence_goals_classYear_curriculumCode_goalNumber_key" ON "competence_goals"("classYear", "curriculumCode", "goalNumber");

-- CreateIndex
CREATE INDEX "school_schedule_entries_classYear_schoolYear_date_idx" ON "school_schedule_entries"("classYear", "schoolYear", "date");

-- CreateIndex
CREATE INDEX "group_members_userId_idx" ON "group_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_slug_key" ON "email_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hashedKey_key" ON "api_keys"("hashedKey");

-- CreateIndex
CREATE INDEX "api_keys_userId_revokedAt_idx" ON "api_keys"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "error_logs_context_createdAt_idx" ON "error_logs"("context", "createdAt");

-- CreateIndex
CREATE INDEX "error_logs_severity_resolved_createdAt_idx" ON "error_logs"("severity", "resolved", "createdAt");

-- CreateIndex
CREATE INDEX "error_logs_userId_createdAt_idx" ON "error_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "coach_availability_coachId_active_idx" ON "coach_availability"("coachId", "active");

-- CreateIndex
CREATE INDEX "coach_availability_locationId_idx" ON "coach_availability"("locationId");

-- CreateIndex
CREATE INDEX "facilities_locationId_active_idx" ON "facilities"("locationId", "active");

-- CreateIndex
CREATE INDEX "session_recordings_uploadedById_createdAt_idx" ON "session_recordings"("uploadedById", "createdAt");

-- CreateIndex
CREATE INDEX "session_recordings_bookingId_idx" ON "session_recordings"("bookingId");

-- CreateIndex
CREATE INDEX "session_recordings_playerId_createdAt_idx" ON "session_recordings"("playerId", "createdAt");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_source_status_idx" ON "leads"("source", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wagr_snapshots_wagrPlayerSlug_key" ON "wagr_snapshots"("wagrPlayerSlug");

-- CreateIndex
CREATE UNIQUE INDEX "wagr_snapshots_userId_key" ON "wagr_snapshots"("userId");

-- CreateIndex
CREATE INDEX "wagr_snapshots_country_rank_idx" ON "wagr_snapshots"("country", "rank");

-- CreateIndex
CREATE INDEX "wagr_snapshots_ngfCategory_idx" ON "wagr_snapshots"("ngfCategory");

-- CreateIndex
CREATE INDEX "wagr_snapshots_userId_idx" ON "wagr_snapshots"("userId");

-- CreateIndex
CREATE INDEX "training_sessions_v2_studentId_startTime_idx" ON "training_sessions_v2"("studentId", "startTime");

-- CreateIndex
CREATE INDEX "training_sessions_v2_coachId_startTime_idx" ON "training_sessions_v2"("coachId", "startTime");

-- CreateIndex
CREATE INDEX "training_sessions_v2_hostId_idx" ON "training_sessions_v2"("hostId");

-- CreateIndex
CREATE INDEX "session_participants_userId_status_idx" ON "session_participants"("userId", "status");

-- CreateIndex
CREATE INDEX "session_participants_sessionId_idx" ON "session_participants"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_sessionId_userId_key" ON "session_participants"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "coach_notes_coachId_playerId_createdAt_idx" ON "coach_notes"("coachId", "playerId", "createdAt");

-- CreateIndex
CREATE INDEX "coach_notes_playerId_idx" ON "coach_notes"("playerId");

-- CreateIndex
CREATE INDEX "training_drills_v2_sessionId_idx" ON "training_drills_v2"("sessionId");

-- CreateIndex
CREATE INDEX "training_drills_v2_positionTaskId_idx" ON "training_drills_v2"("positionTaskId");

-- CreateIndex
CREATE INDEX "drill_logs_v2_drillId_idx" ON "drill_logs_v2"("drillId");

-- CreateIndex
CREATE INDEX "locked_anchors_studentId_idx" ON "locked_anchors"("studentId");

-- CreateIndex
CREATE INDEX "recurring_patterns_studentId_idx" ON "recurring_patterns"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "period_volume_recipes_trainingPlanId_key" ON "period_volume_recipes"("trainingPlanId");

-- CreateIndex
CREATE INDEX "period_recipe_okter_recipeId_idx" ON "period_recipe_okter"("recipeId");

-- CreateIndex
CREATE INDEX "conditional_rules_studentId_idx" ON "conditional_rules"("studentId");

-- CreateIndex
CREATE INDEX "conditional_rules_trainingPlanId_idx" ON "conditional_rules"("trainingPlanId");

-- CreateIndex
CREATE INDEX "drill_maler_coachId_idx" ON "drill_maler"("coachId");

-- CreateIndex
CREATE INDEX "drill_maler_pyramide_idx" ON "drill_maler"("pyramide");

-- CreateIndex
CREATE INDEX "okt_maler_coachId_idx" ON "okt_maler"("coachId");

-- CreateIndex
CREATE INDEX "okt_maler_pyramide_idx" ON "okt_maler"("pyramide");

-- CreateIndex
CREATE INDEX "okt_mal_driller_malId_idx" ON "okt_mal_driller"("malId");

-- CreateIndex
CREATE INDEX "clubs_practiced_sessionId_idx" ON "clubs_practiced"("sessionId");

-- CreateIndex
CREATE INDEX "clubs_practiced_club_createdAt_idx" ON "clubs_practiced"("club", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sg_baselines_category_distanceBucket_lie_key" ON "sg_baselines"("category", "distanceBucket", "lie");

-- CreateIndex
CREATE INDEX "pga_player_seasons_tour_year_driveDist_idx" ON "pga_player_seasons"("tour", "year", "driveDist");

-- CreateIndex
CREATE INDEX "pga_player_seasons_tour_year_sgTotal_idx" ON "pga_player_seasons"("tour", "year", "sgTotal");

-- CreateIndex
CREATE INDEX "pga_player_seasons_tour_year_fairwayPct_idx" ON "pga_player_seasons"("tour", "year", "fairwayPct");

-- CreateIndex
CREATE INDEX "pga_player_seasons_tour_year_girPct_idx" ON "pga_player_seasons"("tour", "year", "girPct");

-- CreateIndex
CREATE INDEX "pga_player_seasons_tour_year_puttsPerRound_idx" ON "pga_player_seasons"("tour", "year", "puttsPerRound");

-- CreateIndex
CREATE INDEX "pga_player_seasons_tour_year_avgScore_idx" ON "pga_player_seasons"("tour", "year", "avgScore");

-- CreateIndex
CREATE UNIQUE INDEX "pga_player_seasons_dgPlayerId_tour_year_key" ON "pga_player_seasons"("dgPlayerId", "tour", "year");

-- CreateIndex
CREATE UNIQUE INDEX "pga_putt_distance_year_distanceMeters_key" ON "pga_putt_distance"("year", "distanceMeters");

-- CreateIndex
CREATE UNIQUE INDEX "pga_approach_distance_year_yardageBucket_key" ON "pga_approach_distance"("year", "yardageBucket");

-- CreateIndex
CREATE INDEX "bruker_sg_inputs_userId_dato_idx" ON "bruker_sg_inputs"("userId", "dato");

-- CreateIndex
CREATE INDEX "bruker_sammenligninger_userId_createdAt_idx" ON "bruker_sammenligninger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "sg_insights_userId_category_createdAt_idx" ON "sg_insights"("userId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "shot_annotations_trackmanSessionId_clubId_idx" ON "shot_annotations"("trackmanSessionId", "clubId");

-- CreateIndex
CREATE UNIQUE INDEX "club_metric_trends_userId_club_weekStart_key" ON "club_metric_trends"("userId", "club", "weekStart");

-- CreateIndex
CREATE INDEX "caddie_messages_userId_conversationId_createdAt_idx" ON "caddie_messages"("userId", "conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "caddie_messages_conversationId_createdAt_idx" ON "caddie_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "caddie_conversations_userId_updatedAt_idx" ON "caddie_conversations"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "caddie_drafts_userId_status_createdAt_idx" ON "caddie_drafts"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "caddie_drafts_conversationId_idx" ON "caddie_drafts"("conversationId");

-- CreateIndex
CREATE INDEX "session_drill_instances_sessionId_orderIndex_idx" ON "session_drill_instances"("sessionId", "orderIndex");

-- CreateIndex
CREATE INDEX "session_sets_drillInstanceId_setNumber_idx" ON "session_sets"("drillInstanceId", "setNumber");

-- CreateIndex
CREATE INDEX "session_drill_notes_drillInstanceId_type_idx" ON "session_drill_notes"("drillInstanceId", "type");

-- CreateIndex
CREATE INDEX "plan_adjustments_userId_status_idx" ON "plan_adjustments"("userId", "status");

-- CreateIndex
CREATE INDEX "plan_change_requests_playerId_status_idx" ON "plan_change_requests"("playerId", "status");

-- CreateIndex
CREATE INDEX "plan_change_requests_coachId_status_idx" ON "plan_change_requests"("coachId", "status");

-- CreateIndex
CREATE INDEX "tournament_preparations_userId_status_idx" ON "tournament_preparations"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_preparations_userId_tournamentId_key" ON "tournament_preparations"("userId", "tournamentId");

-- CreateIndex
CREATE INDEX "technical_plans_userId_status_idx" ON "technical_plans"("userId", "status");

-- CreateIndex
CREATE INDEX "technical_plans_periodBlockId_idx" ON "technical_plans"("periodBlockId");

-- CreateIndex
CREATE INDEX "technical_plans_parentPlanId_idx" ON "technical_plans"("parentPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_prefs_userId_key" ON "facility_prefs"("userId");

-- CreateIndex
CREATE INDEX "plan_sessions_userId_week_idx" ON "plan_sessions"("userId", "week");

-- CreateIndex
CREATE INDEX "plan_sessions_planId_idx" ON "plan_sessions"("planId");

-- CreateIndex
CREATE INDEX "training_camps_userId_startDate_idx" ON "training_camps"("userId", "startDate");

-- CreateIndex
CREATE INDEX "technical_plan_positions_planId_sortOrder_idx" ON "technical_plan_positions"("planId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "technical_plan_positions_planId_pNummer_key" ON "technical_plan_positions"("planId", "pNummer");

-- CreateIndex
CREATE INDEX "position_tasks_positionId_sortOrder_idx" ON "position_tasks"("positionId", "sortOrder");

-- CreateIndex
CREATE INDEX "position_tasks_status_trackStatus_idx" ON "position_tasks"("status", "trackStatus");

-- CreateIndex
CREATE UNIQUE INDEX "position_task_logs_trackmanShotId_key" ON "position_task_logs"("trackmanShotId");

-- CreateIndex
CREATE INDEX "position_task_logs_taskId_loggedAt_idx" ON "position_task_logs"("taskId", "loggedAt");

-- CreateIndex
CREATE INDEX "position_task_logs_sessionV2Id_idx" ON "position_task_logs"("sessionV2Id");

-- CreateIndex
CREATE INDEX "position_task_tm_goals_taskId_targetType_idx" ON "position_task_tm_goals"("taskId", "targetType");

-- CreateIndex
CREATE INDEX "technical_plan_club_targets_planId_status_idx" ON "technical_plan_club_targets"("planId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "technical_plan_club_targets_planId_club_key" ON "technical_plan_club_targets"("planId", "club");

-- CreateIndex
CREATE INDEX "technical_plan_audits_planId_createdAt_idx" ON "technical_plan_audits"("planId", "createdAt");

-- CreateIndex
CREATE INDEX "trackman_shots_sessionId_club_idx" ON "trackman_shots"("sessionId", "club");

-- CreateIndex
CREATE INDEX "trackman_shots_positionTaskId_recordedAt_idx" ON "trackman_shots"("positionTaskId", "recordedAt");

-- CreateIndex
CREATE INDEX "trackman_shots_positionTaskId_hastighet_idx" ON "trackman_shots"("positionTaskId", "hastighet");

-- CreateIndex
CREATE INDEX "plan_suggestions_planId_status_idx" ON "plan_suggestions"("planId", "status");

-- CreateIndex
CREATE INDEX "plan_suggestions_type_status_idx" ON "plan_suggestions"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_failures_eventId_key" ON "webhook_failures"("eventId");

-- CreateIndex
CREATE INDEX "webhook_failures_status_lastAttemptAt_idx" ON "webhook_failures"("status", "lastAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "notion_connections_userId_key" ON "notion_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notion_database_links_connectionId_notionDatabaseId_key" ON "notion_database_links"("connectionId", "notionDatabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "oppgave_cache_notionPageId_key" ON "oppgave_cache"("notionPageId");

-- CreateIndex
CREATE INDEX "oppgave_cache_databaseLinkId_idx" ON "oppgave_cache"("databaseLinkId");

-- CreateIndex
CREATE INDEX "oppgave_cache_notionLastEdited_idx" ON "oppgave_cache"("notionLastEdited");

-- CreateIndex
CREATE UNIQUE INDEX "prosjekt_cache_notionPageId_key" ON "prosjekt_cache"("notionPageId");

-- CreateIndex
CREATE INDEX "prosjekt_cache_connectionId_idx" ON "prosjekt_cache"("connectionId");

-- CreateIndex
CREATE INDEX "fysiske_planer_userId_status_idx" ON "fysiske_planer"("userId", "status");

-- CreateIndex
CREATE INDEX "fys_uker_planId_sortOrder_idx" ON "fys_uker"("planId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "fys_uker_planId_ukeNr_key" ON "fys_uker"("planId", "ukeNr");

-- CreateIndex
CREATE INDEX "fys_okter_ukeId_sortOrder_idx" ON "fys_okter"("ukeId", "sortOrder");

-- CreateIndex
CREATE INDEX "fys_ovelse_rader_oktId_sortOrder_idx" ON "fys_ovelse_rader"("oktId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "page_approvals_route_key" ON "page_approvals"("route");

-- CreateIndex
CREATE INDEX "page_approvals_status_idx" ON "page_approvals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "design_koblinger_designFile_key" ON "design_koblinger"("designFile");

-- CreateIndex
CREATE INDEX "design_koblinger_status_idx" ON "design_koblinger"("status");

-- CreateIndex
CREATE INDEX "design_koblinger_confirmedRoute_idx" ON "design_koblinger"("confirmedRoute");

-- CreateIndex
CREATE INDEX "coach_drill_directiv_userId_idx" ON "coach_drill_directiv"("userId");

-- CreateIndex
CREATE INDEX "coach_drill_directiv_coachId_idx" ON "coach_drill_directiv"("coachId");

-- CreateIndex
CREATE INDEX "coach_drill_directiv_drillId_idx" ON "coach_drill_directiv"("drillId");

-- CreateIndex
CREATE UNIQUE INDEX "coach_drill_directiv_coachId_userId_drillId_type_key" ON "coach_drill_directiv"("coachId", "userId", "drillId", "type");

-- CreateIndex
CREATE INDEX "data_export_requests_userId_status_idx" ON "data_export_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "questions_coachUserId_status_idx" ON "questions"("coachUserId", "status");

-- CreateIndex
CREATE INDEX "questions_askerUserId_idx" ON "questions"("askerUserId");

-- CreateIndex
CREATE INDEX "message_attachments_sessionId_idx" ON "message_attachments"("sessionId");

-- CreateIndex
CREATE INDEX "kommando_tasks_userId_status_createdAt_idx" ON "kommando_tasks"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "kommando_chats_userId_updatedAt_idx" ON "kommando_chats"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "kommando_messages_userId_conversationId_createdAt_idx" ON "kommando_messages"("userId", "conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "kommando_projects_userId_status_createdAt_idx" ON "kommando_projects"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "kommando_agent_runs_userId_createdAt_idx" ON "kommando_agent_runs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "kommando_agent_steps_runId_orderIndex_idx" ON "kommando_agent_steps"("runId", "orderIndex");

-- CreateIndex
CREATE INDEX "invariant_overrides_sessionId_idx" ON "invariant_overrides"("sessionId");

-- CreateIndex
CREATE INDEX "invariant_overrides_planId_idx" ON "invariant_overrides"("planId");

-- CreateIndex
CREATE INDEX "innboks_epost_status_mottattAt_idx" ON "innboks_epost"("status", "mottattAt");

-- CreateIndex
CREATE INDEX "app_feedback_status_createdAt_idx" ON "app_feedback"("status", "createdAt");

-- CreateIndex
CREATE INDEX "marketing_posts_scheduledAt_idx" ON "marketing_posts"("scheduledAt");

-- CreateIndex
CREATE INDEX "moderation_cases_status_type_idx" ON "moderation_cases"("status", "type");

-- CreateIndex
CREATE INDEX "moderation_cases_userId_idx" ON "moderation_cases"("userId");

-- CreateIndex
CREATE INDEX "coach_pinned_players_coachId_idx" ON "coach_pinned_players"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "coach_pinned_players_coachId_playerId_key" ON "coach_pinned_players"("coachId", "playerId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_publicPlayerId_fkey" FOREIGN KEY ("publicPlayerId") REFERENCES "public_players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_tracking" ADD CONSTRAINT "talent_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_entries" ADD CONSTRAINT "health_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_invitations" ADD CONSTRAINT "parent_invitations_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_invitations" ADD CONSTRAINT "parent_invitations_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_relations" ADD CONSTRAINT "parent_relations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_relations" ADD CONSTRAINT "parent_relations_childId_fkey" FOREIGN KEY ("childId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_types" ADD CONSTRAINT "service_types_coachUserId_fkey" FOREIGN KEY ("coachUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_aiGenerationId_fkey" FOREIGN KEY ("aiGenerationId") REFERENCES "ai_plan_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_plan_generations" ADD CONSTRAINT "ai_plan_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_plan_generations" ADD CONSTRAINT "ai_plan_generations_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_plan_generations" ADD CONSTRAINT "ai_plan_generations_iterationOf_fkey" FOREIGN KEY ("iterationOf") REFERENCES "ai_plan_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_sessions" ADD CONSTRAINT "training_plan_sessions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_definitions" ADD CONSTRAINT "exercise_definitions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_drills" ADD CONSTRAINT "session_drills_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_plan_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_drills" ADD CONSTRAINT "session_drills_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_drills" ADD CONSTRAINT "session_drills_positionTaskId_fkey" FOREIGN KEY ("positionTaskId") REFERENCES "position_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_templates" ADD CONSTRAINT "plan_templates_byCoachId_fkey" FOREIGN KEY ("byCoachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_templates" ADD CONSTRAINT "plan_templates_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_template_sessions" ADD CONSTRAINT "plan_template_sessions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "plan_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_effectiveness" ADD CONSTRAINT "plan_effectiveness_planId_fkey" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_effectiveness" ADD CONSTRAINT "plan_effectiveness_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "plan_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_effectiveness" ADD CONSTRAINT "plan_effectiveness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_session_logs" ADD CONSTRAINT "training_plan_session_logs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_plan_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_definitions" ADD CONSTRAINT "course_definitions_baneId_fkey" FOREIGN KEY ("baneId") REFERENCES "baner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shots" ADD CONSTRAINT "shots_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_definitions" ADD CONSTRAINT "test_definitions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "test_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "test_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_testId_fkey" FOREIGN KEY ("testId") REFERENCES "test_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trackman_sessions" ADD CONSTRAINT "trackman_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_actions" ADD CONSTRAINT "plan_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_actions" ADD CONSTRAINT "plan_actions_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_actions" ADD CONSTRAINT "plan_actions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_enrollments" ADD CONSTRAINT "player_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_enrollments" ADD CONSTRAINT "player_enrollments_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drill_challenges" ADD CONSTRAINT "drill_challenges_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "drill_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_bags" ADD CONSTRAINT "equipment_bags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_videos" ADD CONSTRAINT "session_videos_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_videos" ADD CONSTRAINT "session_videos_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_swing_videos" ADD CONSTRAINT "player_swing_videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swing_analyses" ADD CONSTRAINT "swing_analyses_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "player_swing_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_calendar_connections" ADD CONSTRAINT "google_calendar_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_calendar_subscriptions" ADD CONSTRAINT "google_calendar_subscriptions_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "google_calendar_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_holes" ADD CONSTRAINT "course_holes_baneId_fkey" FOREIGN KEY ("baneId") REFERENCES "baner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gameplan_hull" ADD CONSTRAINT "gameplan_hull_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "course_holes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gameplan_hull" ADD CONSTRAINT "gameplan_hull_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gameplan_sone" ADD CONSTRAINT "gameplan_sone_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "course_holes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gameplan_sone" ADD CONSTRAINT "gameplan_sone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_player_entries" ADD CONSTRAINT "public_player_entries_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_player_entries" ADD CONSTRAINT "public_player_entries_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_player_rounds" ADD CONSTRAINT "public_player_rounds_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public_player_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_plans" ADD CONSTRAINT "season_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_blocks" ADD CONSTRAINT "period_blocks_seasonPlanId_fkey" FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_entries" ADD CONSTRAINT "tournament_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_entries" ADD CONSTRAINT "tournament_entries_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_entries" ADD CONSTRAINT "tournament_entries_seasonPlanId_fkey" FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_schedules" ADD CONSTRAINT "group_schedules_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_availability" ADD CONSTRAINT "coach_availability_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_availability" ADD CONSTRAINT "coach_availability_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wagr_snapshots" ADD CONSTRAINT "wagr_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions_v2" ADD CONSTRAINT "training_sessions_v2_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_notes" ADD CONSTRAINT "coach_notes_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_notes" ADD CONSTRAINT "coach_notes_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_drills_v2" ADD CONSTRAINT "training_drills_v2_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_drills_v2" ADD CONSTRAINT "training_drills_v2_positionTaskId_fkey" FOREIGN KEY ("positionTaskId") REFERENCES "position_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drill_logs_v2" ADD CONSTRAINT "drill_logs_v2_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "training_drills_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_recipe_okter" ADD CONSTRAINT "period_recipe_okter_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "period_volume_recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okt_mal_driller" ADD CONSTRAINT "okt_mal_driller_malId_fkey" FOREIGN KEY ("malId") REFERENCES "okt_maler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs_practiced" ADD CONSTRAINT "clubs_practiced_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_plan_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bruker_sg_inputs" ADD CONSTRAINT "bruker_sg_inputs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bruker_sammenligninger" ADD CONSTRAINT "bruker_sammenligninger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bruker_sammenligninger" ADD CONSTRAINT "bruker_sammenligninger_sgInputId_fkey" FOREIGN KEY ("sgInputId") REFERENCES "bruker_sg_inputs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sg_insights" ADD CONSTRAINT "sg_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "best_session_references" ADD CONSTRAINT "best_session_references_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caddie_messages" ADD CONSTRAINT "caddie_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_drill_instances" ADD CONSTRAINT "session_drill_instances_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_sets" ADD CONSTRAINT "session_sets_drillInstanceId_fkey" FOREIGN KEY ("drillInstanceId") REFERENCES "session_drill_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_drill_notes" ADD CONSTRAINT "session_drill_notes_drillInstanceId_fkey" FOREIGN KEY ("drillInstanceId") REFERENCES "session_drill_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_adjustments" ADD CONSTRAINT "plan_adjustments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_adjustments" ADD CONSTRAINT "plan_adjustments_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_change_requests" ADD CONSTRAINT "plan_change_requests_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_change_requests" ADD CONSTRAINT "plan_change_requests_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_preparations" ADD CONSTRAINT "tournament_preparations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_preparations" ADD CONSTRAINT "tournament_preparations_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_plans" ADD CONSTRAINT "technical_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_plans" ADD CONSTRAINT "technical_plans_opprettetAvId_fkey" FOREIGN KEY ("opprettetAvId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_plans" ADD CONSTRAINT "technical_plans_parentPlanId_fkey" FOREIGN KEY ("parentPlanId") REFERENCES "technical_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_prefs" ADD CONSTRAINT "facility_prefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sessions" ADD CONSTRAINT "plan_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sessions" ADD CONSTRAINT "plan_sessions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "technical_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_camps" ADD CONSTRAINT "training_camps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_plan_positions" ADD CONSTRAINT "technical_plan_positions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "technical_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_tasks" ADD CONSTRAINT "position_tasks_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "technical_plan_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_task_logs" ADD CONSTRAINT "position_task_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "position_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_task_logs" ADD CONSTRAINT "position_task_logs_trackmanShotId_fkey" FOREIGN KEY ("trackmanShotId") REFERENCES "trackman_shots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_task_tm_goals" ADD CONSTRAINT "position_task_tm_goals_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "position_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_plan_club_targets" ADD CONSTRAINT "technical_plan_club_targets_planId_fkey" FOREIGN KEY ("planId") REFERENCES "technical_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_plan_audits" ADD CONSTRAINT "technical_plan_audits_planId_fkey" FOREIGN KEY ("planId") REFERENCES "technical_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_plan_audits" ADD CONSTRAINT "technical_plan_audits_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trackman_shots" ADD CONSTRAINT "trackman_shots_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "trackman_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trackman_shots" ADD CONSTRAINT "trackman_shots_positionTaskId_fkey" FOREIGN KEY ("positionTaskId") REFERENCES "position_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_suggestions" ADD CONSTRAINT "plan_suggestions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "technical_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_suggestions" ADD CONSTRAINT "plan_suggestions_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notion_connections" ADD CONSTRAINT "notion_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notion_database_links" ADD CONSTRAINT "notion_database_links_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "notion_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oppgave_cache" ADD CONSTRAINT "oppgave_cache_databaseLinkId_fkey" FOREIGN KEY ("databaseLinkId") REFERENCES "notion_database_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fysiske_planer" ADD CONSTRAINT "fysiske_planer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fysiske_planer" ADD CONSTRAINT "fysiske_planer_opprettetAvId_fkey" FOREIGN KEY ("opprettetAvId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fys_uker" ADD CONSTRAINT "fys_uker_planId_fkey" FOREIGN KEY ("planId") REFERENCES "fysiske_planer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fys_okter" ADD CONSTRAINT "fys_okter_ukeId_fkey" FOREIGN KEY ("ukeId") REFERENCES "fys_uker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fys_ovelse_rader" ADD CONSTRAINT "fys_ovelse_rader_oktId_fkey" FOREIGN KEY ("oktId") REFERENCES "fys_okter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fys_ovelse_rader" ADD CONSTRAINT "fys_ovelse_rader_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_drill_directiv" ADD CONSTRAINT "coach_drill_directiv_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_drill_directiv" ADD CONSTRAINT "coach_drill_directiv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_drill_directiv" ADD CONSTRAINT "coach_drill_directiv_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "exercise_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

