import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { logError } from "@/lib/error-tracking";

type Result = { ok: true; url: string } | { ok: false; error: string; releaseHold: boolean };
const RETRY = "Betalingssiden kunne ikke åpnes. Ingen bestilling er bekreftet. Prøv igjen.";
const UNCERTAIN = "Betalingen kunne ikke avklares. Se etter en bekreftelse eller kontakt oss før du bestiller på nytt.";

/** Keep the slot reserved on an ambiguous network failure; never cancel a potentially payable session. */
export async function startBookingPayment(bookingId: string, params: Stripe.Checkout.SessionCreateParams): Promise<Result> {
  let session: Stripe.Checkout.Session | undefined;
  let stripe: Stripe | undefined;
  let creationAttempted = false;
  try {
    stripe = stripeKlient();
    creationAttempted = true;
    session = await stripe.checkout.sessions.create(params, { idempotencyKey: `booking-checkout:${bookingId}`, maxNetworkRetries: 2 });
    const linked = await prisma.booking.updateMany({
      where: { id: bookingId, status: "PENDING", OR: [{ stripeCheckoutSessionId: null }, { stripeCheckoutSessionId: session.id }] },
      data: { stripeCheckoutSessionId: session.id },
    });
    if (linked.count !== 1 || !session.url) throw new Error("Checkout could not be linked or opened");
    return { ok: true, url: session.url };
  } catch (error) {
    await logError({ context: "booking.payment-start", error }).catch(() => undefined);
    const type = error && typeof error === "object" && "type" in error ? error.type : undefined;
    let safeToCancel = !creationAttempted || ["StripeInvalidRequestError", "StripeAuthenticationError", "StripePermissionError"].includes(String(type));
    if (session && stripe) {
      // Stripe can refuse expiry if payment already completed. Keep that booking reserved for reconciliation.
      try { safeToCancel = (await stripe.checkout.sessions.expire(session.id)).status === "expired"; }
      catch { safeToCancel = false; }
    }
    if (safeToCancel) {
      try {
        const cancelled = await prisma.booking.updateMany({
          where: { id: bookingId, status: "PENDING", ...(session ? { OR: [{ stripeCheckoutSessionId: null }, { stripeCheckoutSessionId: session.id }] } : { stripeCheckoutSessionId: null }) },
          data: { status: "CANCELLED" },
        });
        if (cancelled.count === 1) return { ok: false, error: RETRY, releaseHold: true };
      } catch { /* Preserve uncertain state for the existing stuck-booking alert. */ }
    }
    return { ok: false, error: UNCERTAIN, releaseHold: false };
  }
}
