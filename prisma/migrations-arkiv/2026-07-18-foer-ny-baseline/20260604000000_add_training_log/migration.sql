-- Fri trenings-logg: spiller logger treningstid per SG-område (ad-hoc, utenfor plan).
-- Mater korrelasjonsanalyse (volum vs SG neste uke) og training-gap-agenten.

-- CreateTable
CREATE TABLE "training_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sgArea" "SgCategory" NOT NULL,
    "minutes" INTEGER NOT NULL,
    "drillName" TEXT,
    "quality" SMALLINT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_logs_userId_date_idx" ON "training_logs"("userId", "date");

-- CreateIndex
CREATE INDEX "training_logs_userId_sgArea_idx" ON "training_logs"("userId", "sgArea");

-- AddForeignKey
ALTER TABLE "training_logs" ADD CONSTRAINT "training_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS (deny-all): service-role-key (Prisma server-actions) bypasses RLS;
-- anon/authenticated get DENY by default. App reads this table only via Prisma,
-- never via the Supabase client, so deny-all does not affect any app flow.
-- Matches security advisor lint 0013_rls_disabled_in_public.
ALTER TABLE "training_logs" ENABLE ROW LEVEL SECURITY;
