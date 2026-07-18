-- Konsolidering: kanonisk spiller-identitet + runde/SG-hjem i public (DataGolf-integrasjon steg 2-3)
-- Rent additivt: nullbare kolonner + ny tabell. Påvirker ikke eksisterende rader eller de fire produktene.

-- AlterTable: koble bruker til turneringsidentitet
ALTER TABLE "users" ADD COLUMN "publicPlayerId" TEXT;

-- AlterTable: WAGR-ID på kanonisk spiller
ALTER TABLE "public_players" ADD COLUMN "wagrId" TEXT;

-- CreateTable: runde-for-runde + strokes gained
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

-- CreateIndex
CREATE UNIQUE INDEX "users_publicPlayerId_key" ON "users"("publicPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "public_players_wagrId_key" ON "public_players"("wagrId");

-- CreateIndex
CREATE UNIQUE INDEX "public_player_rounds_entryId_roundNumber_key" ON "public_player_rounds"("entryId", "roundNumber");

-- CreateIndex
CREATE INDEX "public_player_rounds_entryId_idx" ON "public_player_rounds"("entryId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_publicPlayerId_fkey" FOREIGN KEY ("publicPlayerId") REFERENCES "public_players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_player_rounds" ADD CONSTRAINT "public_player_rounds_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public_player_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS (konsistent med prosjektets konvensjon; Prisma går via service role)
ALTER TABLE "public_player_rounds" ENABLE ROW LEVEL SECURITY;
