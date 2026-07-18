-- Multi-kalender per Google-tilkobling.
-- Hver coach kan velge flere Google-kalendere med ulik push/pull-retning.

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

CREATE UNIQUE INDEX "google_calendar_subscriptions_connectionId_googleCalendarId_key"
  ON "google_calendar_subscriptions"("connectionId", "googleCalendarId");

CREATE INDEX "google_calendar_subscriptions_connectionId_active_idx"
  ON "google_calendar_subscriptions"("connectionId", "active");

CREATE INDEX "google_calendar_subscriptions_watchChannelId_idx"
  ON "google_calendar_subscriptions"("watchChannelId");

ALTER TABLE "google_calendar_subscriptions"
  ADD CONSTRAINT "google_calendar_subscriptions_connectionId_fkey"
  FOREIGN KEY ("connectionId") REFERENCES "google_calendar_connections"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
