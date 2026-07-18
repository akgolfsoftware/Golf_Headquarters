-- AlterTable: ServiceType får valgfri coachUserId-FK
ALTER TABLE "service_types"
  ADD COLUMN "coachUserId" TEXT;

-- AddForeignKey
ALTER TABLE "service_types"
  ADD CONSTRAINT "service_types_coachUserId_fkey"
  FOREIGN KEY ("coachUserId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "service_types_coachUserId_idx" ON "service_types"("coachUserId");
