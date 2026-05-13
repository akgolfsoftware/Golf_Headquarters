-- Booking får valgfri Google Calendar event-ID
ALTER TABLE "bookings"
  ADD COLUMN "googleEventId" TEXT;

CREATE INDEX "bookings_googleEventId_idx" ON "bookings"("googleEventId");

-- GoogleCalendarConnection per coach
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

CREATE UNIQUE INDEX "google_calendar_connections_userId_key" ON "google_calendar_connections"("userId");

ALTER TABLE "google_calendar_connections"
  ADD CONSTRAINT "google_calendar_connections_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
