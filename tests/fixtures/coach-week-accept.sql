-- Local synthetic test tables, generated from schema.prisma on 2026-10-23.
-- Loaded only inside the guarded random test schema; never a migration.
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED', 'SKIPPED', 'CANCELLED');

CREATE TYPE "SessionStatusV2" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED');

CREATE TYPE "PyramidArea" AS ENUM ('FYS', 'TEK', 'SLAG', 'SPILL', 'TURN');

CREATE TYPE "LPhase" AS ENUM ('GRUNN', 'SPESIAL', 'TURNERING', 'EVALUERING', 'TESTUKE', 'FERIE', 'TRENINGSSAMLING', 'HELDAGSSAMLING', 'RESTITUSJON');

CREATE TYPE "SkillArea" AS ENUM ('TEE_TOTAL', 'TILNAERMING', 'AROUND_GREEN', 'PUTTING', 'SPILL');

CREATE TYPE "SessionEnvironment" AS ENUM ('RANGE', 'BANE', 'STUDIO', 'HJEM', 'SIMULATOR', 'GYM');

CREATE TYPE "ExerciseSource" AS ENUM ('SYSTEM', 'COACH', 'PLAYER');

CREATE TYPE "ExerciseVisibility" AS ENUM ('PRIVATE', 'COACH_PLAYERS', 'PLATFORM');

CREATE TYPE "DrillPracticeType" AS ENUM ('BLOKK', 'VARIABEL', 'KONKURRANSE', 'SPILL_TEST');

CREATE TYPE "DrillFasilitet" AS ENUM ('RADAR', 'MAT_NET', 'BUNKER', 'KAMERA', 'PUTTING_GREEN_KORT', 'PUTTING_GREEN_LANG', 'SHORT_GAME_AREA', 'DRIVING_RANGE', 'BANE', 'SIMULATOR', 'VEKTSTANG', 'TRAPBAR', 'LOPEBANE', 'MED_BALL');

CREATE TYPE "NgfKategori" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K');

CREATE TYPE "PressureLevel" AS ENUM ('PR1', 'PR2', 'PR3', 'PR4', 'PR5');

CREATE TYPE "LFase" AS ENUM ('L_KROPP', 'L_ARM', 'L_KOLLE', 'L_BALL', 'L_AUTO');

CREATE TYPE "CSNivaa" AS ENUM ('CS50', 'CS60', 'CS70', 'CS80', 'CS90', 'CS100');

CREATE TYPE "MMiljo" AS ENUM ('M0', 'M1', 'M2', 'M3', 'M4', 'M5');

CREATE TYPE "PRPress" AS ENUM ('PR1', 'PR2', 'PR3', 'PR4', 'PR5');

CREATE TYPE "Omraade" AS ENUM ('TEE_TOTAL', 'INNSPILL_200', 'INNSPILL_150', 'INNSPILL_100', 'INNSPILL_50', 'CHIP', 'PITCH', 'LOB', 'BUNKER', 'PUTT_0_3', 'PUTT_3_5', 'PUTT_5_10', 'PUTT_10_25', 'PUTT_25_40', 'PUTT_40_PLUSS', 'STYRKE', 'KONDISJON', 'BEVEGELIGHET', 'BANE');

CREATE TYPE "Motorikk" AS ENUM ('UTEN_BALL', 'LAV_HAST', 'AUTO');

CREATE TYPE "Belastning" AS ENUM ('INNENDORS', 'TRENINGSOMRAADE', 'BANE', 'KONKURRANSE');

CREATE TYPE "Press" AS ENUM ('ALENE', 'OBSERVERT', 'KONKURRANSE', 'TURNERING');

CREATE TYPE "OmradeDimensjon" AS ENUM ('SIKTE', 'STARTRETNING', 'KURVE', 'HOYDE', 'TREFFPUNKT', 'LENGDEKONTROLL', 'SPINN', 'LANDINGSPUNKT', 'UTRULLING', 'KOLLEVALG', 'BOUNCE_BRUK', 'SANDINNGANG', 'LIE_VARIASJON', 'GREENLESING', 'BALLSTART', 'SPILLEFORMAT', 'STRATEGIOPPGAVE');

CREATE TYPE "SandTrinn" AS ENUM ('UTEN_BALL_I_SAND', 'MED_BALL');

CREATE TYPE "InnslagType" AS ENUM ('DRILL', 'OVELSE', 'TEST', 'TEKNISK_OPPGAVE');

CREATE TYPE "OktAvbruddAarsak" AS ENUM ('SYK', 'SKADE', 'REISE', 'VAER', 'ANNET');

CREATE TYPE "RepType" AS ENUM ('SVINGER_UTEN_BALL', 'BALLER_SLATT', 'TID', 'SETT_REPS');

CREATE TYPE "PracticeType" AS ENUM ('BLOKK', 'RANDOM', 'KONKURRANSE', 'SPILL_TEST');

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
    "location" TEXT,
    "maalsetning" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "liveSnapshot" JSONB,
    "sourceGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plan_sessions_pkey" PRIMARY KEY ("id")
);

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
    "planRepsUtenBall" INTEGER,
    "planRepsLavFart" INTEGER,
    "planRepsAuto" INTEGER,
    "pPosisjoner" TEXT[],
    "notes" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "positionTaskId" TEXT,

    CONSTRAINT "session_drills_pkey" PRIMARY KEY ("id")
);

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
    "location" TEXT,
    "maalsetning" TEXT,
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
    "avbruddAarsak" "OktAvbruddAarsak",
    "avbruddNotat" TEXT,
    "sourceGroupSessionId" TEXT,
    "sourceGroupId" TEXT,
    "detachedAt" TIMESTAMP(3),
    "vurderingFokus" INTEGER,
    "vurderingGjennomforing" INTEGER,
    "vurderingMestring" INTEGER,
    "totalPauseSek" INTEGER,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "hostId" TEXT,
    "maxParticipants" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_v2_pkey" PRIMARY KEY ("id")
);

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
    "planRepsUtenBall" INTEGER,
    "planRepsLavFart" INTEGER,
    "planRepsAuto" INTEGER,
    "actualDurationSec" INTEGER,
    "exerciseId" TEXT,
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
    "innslagType" "InnslagType" NOT NULL DEFAULT 'DRILL',
    "omraadeKode" "Omraade",
    "motorikk" "Motorikk",
    "belastning" "Belastning",
    "press" "Press",
    "dimensjon" "OmradeDimensjon",
    "sandTrinn" "SandTrinn",
    "erSpontan" BOOLEAN NOT NULL DEFAULT false,
    "hoppetOver" BOOLEAN NOT NULL DEFAULT false,
    "trackManMaales" BOOLEAN NOT NULL DEFAULT false,
    "trackManSessionId" TEXT,
    "trackManShotIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "testDefinitionId" TEXT,
    "pauseSekunder" INTEGER,

    CONSTRAINT "training_drills_v2_pkey" PRIMARY KEY ("id")
);

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
    "higherIsBetter" BOOLEAN,
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
    "defaultRepsUtenBall" INTEGER,
    "defaultRepsLavFart" INTEGER,
    "defaultRepsAuto" INTEGER,
    "source" "ExerciseSource" NOT NULL DEFAULT 'SYSTEM',
    "visibility" "ExerciseVisibility" NOT NULL DEFAULT 'PRIVATE',
    "image_url" TEXT,
    "muscle_groups" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "omraadeKode" "Omraade",
    "motorikk" "Motorikk",
    "belastning" "Belastning",
    "press" "Press",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_definitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "plan_actions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT,
    "planId" TEXT,
    "actionType" TEXT NOT NULL,
    "suggestion" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "agentName" TEXT NOT NULL,
    "provenance" JSONB,
    "sjekkpunkt" TEXT,
    "fangstId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "rejectReason" TEXT,
    "decisionNote" TEXT,
    "originalSuggestion" JSONB,
    "editedBeforeApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_actions_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX week_v2_source_unique ON training_sessions_v2 ("generertFra", "generertFraId");
ALTER TABLE training_plan_sessions ADD FOREIGN KEY ("planId") REFERENCES training_plans(id);
ALTER TABLE session_drills ADD FOREIGN KEY ("sessionId") REFERENCES training_plan_sessions(id) ON DELETE CASCADE;
ALTER TABLE session_drills ADD FOREIGN KEY ("exerciseId") REFERENCES exercise_definitions(id);
ALTER TABLE training_drills_v2 ADD FOREIGN KEY ("sessionId") REFERENCES training_sessions_v2(id) ON DELETE CASCADE;
