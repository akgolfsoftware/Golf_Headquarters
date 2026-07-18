-- Sprint 3+ — Live-økt summary: lagre fryst statistikk per fullført økt

ALTER TABLE "training_sessions_v2" ADD COLUMN "completedSummary" JSONB;
