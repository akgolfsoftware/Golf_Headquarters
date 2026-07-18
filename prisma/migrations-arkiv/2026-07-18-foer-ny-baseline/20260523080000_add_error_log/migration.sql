-- L1 Observability — ErrorLog-tabell
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

CREATE INDEX "error_logs_context_createdAt_idx" ON "error_logs"("context", "createdAt");
CREATE INDEX "error_logs_severity_resolved_createdAt_idx" ON "error_logs"("severity", "resolved", "createdAt");
CREATE INDEX "error_logs_userId_createdAt_idx" ON "error_logs"("userId", "createdAt");
