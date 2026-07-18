-- NOTION SYNC v1.1
-- Per-user OAuth-tilkobling til Notion + cache av tasks/prosjekter.

-- CreateEnum
CREATE TYPE "NotionLinkType" AS ENUM ('OPPGAVER', 'PROSJEKTER');

-- CreateEnum
CREATE TYPE "NotionSyncMode" AS ENUM ('AUTO', 'MANUELL', 'PAUSED');

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

-- CreateIndex
CREATE UNIQUE INDEX "notion_connections_userId_key" ON "notion_connections"("userId");

-- AddForeignKey
ALTER TABLE "notion_connections" ADD CONSTRAINT "notion_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- CreateIndex
CREATE UNIQUE INDEX "notion_database_links_connectionId_notionDatabaseId_key" ON "notion_database_links"("connectionId", "notionDatabaseId");

-- AddForeignKey
ALTER TABLE "notion_database_links" ADD CONSTRAINT "notion_database_links_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "notion_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- CreateIndex
CREATE UNIQUE INDEX "oppgave_cache_notionPageId_key" ON "oppgave_cache"("notionPageId");

-- CreateIndex
CREATE INDEX "oppgave_cache_databaseLinkId_idx" ON "oppgave_cache"("databaseLinkId");

-- CreateIndex
CREATE INDEX "oppgave_cache_notionLastEdited_idx" ON "oppgave_cache"("notionLastEdited");

-- AddForeignKey
ALTER TABLE "oppgave_cache" ADD CONSTRAINT "oppgave_cache_databaseLinkId_fkey" FOREIGN KEY ("databaseLinkId") REFERENCES "notion_database_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- CreateIndex
CREATE UNIQUE INDEX "prosjekt_cache_notionPageId_key" ON "prosjekt_cache"("notionPageId");

-- CreateIndex
CREATE INDEX "prosjekt_cache_connectionId_idx" ON "prosjekt_cache"("connectionId");
