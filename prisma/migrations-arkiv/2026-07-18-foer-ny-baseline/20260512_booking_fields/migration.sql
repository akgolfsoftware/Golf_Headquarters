-- Utvid Booking-modellen for customer-booking-flow.

-- Default endring: PENDING istedenfor CONFIRMED for ny bookinger (Stripe-checkout først).
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Pris-snapshot ved booking-tidspunkt (for refusjon, audit).
ALTER TABLE "bookings" ADD COLUMN "priceOre" INTEGER NOT NULL DEFAULT 0;

-- Stripe-tracking.
ALTER TABLE "bookings" ADD COLUMN "stripeCheckoutSessionId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "stripePaymentIntentId" TEXT;

-- Gjeste-felt for booking uten innlogging.
ALTER TABLE "bookings" ADD COLUMN "guestName" TEXT;
ALTER TABLE "bookings" ADD COLUMN "guestEmail" TEXT;
ALTER TABLE "bookings" ADD COLUMN "guestPhone" TEXT;

-- Indeks for raskt oppslag fra Stripe webhook.
CREATE INDEX "bookings_stripeCheckoutSessionId_idx" ON "bookings"("stripeCheckoutSessionId");
