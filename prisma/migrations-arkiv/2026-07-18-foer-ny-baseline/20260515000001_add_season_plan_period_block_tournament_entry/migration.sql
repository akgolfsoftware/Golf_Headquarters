-- CreateTable
CREATE TABLE "season_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_blocks" (
    "id" TEXT NOT NULL,
    "seasonPlanId" TEXT NOT NULL,
    "lPhase" "LPhase" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "focus" TEXT,
    "weeklyVolMin" INTEGER,
    "weeklyVolMax" INTEGER,
    "notes" TEXT,

    CONSTRAINT "period_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonPlanId" TEXT,
    "tournamentId" TEXT,
    "manualName" TEXT,
    "manualDate" TIMESTAMP(3),
    "manualEndDate" TIMESTAMP(3),
    "category" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "season_plans_userId_year_key" ON "season_plans"("userId", "year");

-- CreateIndex
CREATE INDEX "season_plans_userId_idx" ON "season_plans"("userId");

-- CreateIndex
CREATE INDEX "period_blocks_seasonPlanId_idx" ON "period_blocks"("seasonPlanId");

-- CreateIndex
CREATE INDEX "tournament_entries_userId_idx" ON "tournament_entries"("userId");

-- CreateIndex
CREATE INDEX "tournament_entries_seasonPlanId_idx" ON "tournament_entries"("seasonPlanId");

-- CreateIndex
CREATE INDEX "tournament_entries_tournamentId_idx" ON "tournament_entries"("tournamentId");

-- AddForeignKey
ALTER TABLE "season_plans" ADD CONSTRAINT "season_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_blocks" ADD CONSTRAINT "period_blocks_seasonPlanId_fkey" FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_entries" ADD CONSTRAINT "tournament_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_entries" ADD CONSTRAINT "tournament_entries_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_entries" ADD CONSTRAINT "tournament_entries_seasonPlanId_fkey" FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
