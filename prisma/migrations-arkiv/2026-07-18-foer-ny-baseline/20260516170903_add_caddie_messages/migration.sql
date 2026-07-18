-- Caddie chat-meldinger
-- Applied: 2026-05-16

CREATE TABLE "caddie_messages" (
  "id"             TEXT NOT NULL PRIMARY KEY,
  "userId"         TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "role"           TEXT NOT NULL,
  "content"        TEXT NOT NULL,
  "toolCalls"      JSONB,
  "toolResults"    JSONB,
  "inputTokens"    INTEGER,
  "outputTokens"   INTEGER,
  "model"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "caddie_messages_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "caddie_messages_userId_createdAt_idx" ON "caddie_messages"("userId", "createdAt");
CREATE INDEX "caddie_messages_conversationId_idx" ON "caddie_messages"("conversationId");
