-- Fase 2.1: CoachHQ-domene foundation
-- Applied: 2026-05-14 via psql

-- Tournament + TournamentResult
CREATE TABLE "tournaments" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "name"      TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate"   TIMESTAMP(3),
  "courseId"  TEXT,
  "format"    TEXT NOT NULL DEFAULT 'STROKE',
  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tournaments_courseId_fkey" FOREIGN KEY ("courseId")
    REFERENCES "course_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "tournaments_startDate_idx" ON "tournaments"("startDate");

CREATE TABLE "tournament_results" (
  "id"           TEXT NOT NULL PRIMARY KEY,
  "tournamentId" TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "position"     INTEGER,
  "score"        INTEGER,
  "notes"        TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tournament_results_tournamentId_fkey" FOREIGN KEY ("tournamentId")
    REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "tournament_results_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "tournament_results_tournamentId_userId_key" ON "tournament_results"("tournamentId", "userId");
CREATE INDEX "tournament_results_userId_idx" ON "tournament_results"("userId");

-- Group + GroupMember
CREATE TABLE "groups" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "name"      TEXT NOT NULL,
  "level"     TEXT,
  "coachId"   TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "groups_coachId_fkey" FOREIGN KEY ("coachId")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "groups_coachId_idx" ON "groups"("coachId");

CREATE TABLE "group_members" (
  "id"       TEXT NOT NULL PRIMARY KEY,
  "groupId"  TEXT NOT NULL,
  "userId"   TEXT NOT NULL,
  "role"     TEXT NOT NULL DEFAULT 'PLAYER',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId")
    REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");
CREATE INDEX "group_members_userId_idx" ON "group_members"("userId");

-- EmailTemplate
CREATE TABLE "email_templates" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "slug"      TEXT NOT NULL UNIQUE,
  "name"      TEXT NOT NULL,
  "subject"   TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "active"    BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ApiKey
CREATE TABLE "api_keys" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "userId"     TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "hashedKey"  TEXT NOT NULL UNIQUE,
  "prefix"     TEXT NOT NULL,
  "scopes"     JSONB NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  "expiresAt"  TIMESTAMP(3),
  "revokedAt"  TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "api_keys_userId_revokedAt_idx" ON "api_keys"("userId", "revokedAt");

-- AuditLog
CREATE TABLE "audit_logs" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "actorId"   TEXT,
  "action"    TEXT NOT NULL,
  "target"    TEXT,
  "metadata"  JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CoachAvailability
CREATE TABLE "coach_availability" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "coachId"   TEXT NOT NULL,
  "weekday"   INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime"   TEXT NOT NULL,
  "active"    BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coach_availability_coachId_fkey" FOREIGN KEY ("coachId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "coach_availability_coachId_active_idx" ON "coach_availability"("coachId", "active");

-- Facility
CREATE TABLE "facilities" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "locationId" TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "capacity"   INTEGER NOT NULL DEFAULT 1,
  "active"     BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "facilities_locationId_fkey" FOREIGN KEY ("locationId")
    REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "facilities_locationId_active_idx" ON "facilities"("locationId", "active");

-- PlanTemplate
CREATE TABLE "plan_templates" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "weeks"       INTEGER NOT NULL,
  "payload"     JSONB NOT NULL,
  "active"      BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL
);
