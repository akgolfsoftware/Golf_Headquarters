-- Sprint 3 — Session og turneringspåmelding-status

-- CreateEnum: SessionStatusV2 (adskilt fra eldre SessionStatus)
CREATE TYPE "SessionStatusV2" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED');

-- CreateEnum: TournamentEntryStatus
CREATE TYPE "TournamentEntryStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'WITHDRAWN', 'COMPLETED', 'DNF');

-- AlterTable: TrainingSessionV2 - legg til status
ALTER TABLE "training_sessions_v2" ADD COLUMN "status" "SessionStatusV2" NOT NULL DEFAULT 'PLANNED';

-- AlterTable: TournamentEntry - legg til entryStatus, withdrawnAt, withdrawnReason
ALTER TABLE "tournament_entries" ADD COLUMN "entryStatus" "TournamentEntryStatus" NOT NULL DEFAULT 'PLANNED';
ALTER TABLE "tournament_entries" ADD COLUMN "withdrawnAt" TIMESTAMP(3);
ALTER TABLE "tournament_entries" ADD COLUMN "withdrawnReason" TEXT;
