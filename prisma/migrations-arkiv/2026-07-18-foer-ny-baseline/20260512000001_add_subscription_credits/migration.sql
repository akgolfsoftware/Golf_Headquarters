-- AlterTable: Subscription gets credits fields for Academy abonnement
ALTER TABLE "subscriptions"
  ADD COLUMN "monthlyCredits" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "creditsRemaining" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Booking gets optional FK to Subscription
ALTER TABLE "bookings"
  ADD COLUMN "subscriptionId" TEXT;

-- AddForeignKey
ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_subscriptionId_fkey"
  FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "bookings_subscriptionId_idx" ON "bookings"("subscriptionId");
