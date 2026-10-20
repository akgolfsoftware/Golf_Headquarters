/**
 * Stripe-betalingslenke for en booking coachen har lagt inn med betalingsmåte Stripe.
 *
 * Bookingen er allerede bekreftet (CONFIRMED) og merket STRIPE; den står som «Ikke betalt»
 * til webhooken (`checkout.session.completed`) setter betalings-ID på riktig booking.
 * Bare kort (inkl. Apple Pay). Gjenbruker `startBookingPayment` (payment-start.ts).
 * Lager coachen en ny lenke, utløpes den forrige, så kunden ikke kan betale to ganger.
 */
import "server-only";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { APP_URL } from "@/lib/app-url";
import { logError } from "@/lib/error-tracking";
import { startBookingPayment } from "@/lib/booking/payment-start";

export type BetalingslenkeResultat = { ok: true; url: string } | { ok: false; feil: string };

export async function lagBetalingslenke(bookingId: string): Promise<BetalingslenkeResultat> {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true, status: true, paymentMethod: true, priceOre: true, stripePaymentIntentId: true, stripeCheckoutSessionId: true,
      startAt: true, guestEmail: true,
      user: { select: { email: true } },
      serviceType: { select: { name: true } },
      location: { select: { name: true } },
    },
  });
  if (!b) return { ok: false, feil: "Bookingen finnes ikke." };
  if (b.status !== "CONFIRMED") return { ok: false, feil: "Bare bekreftede bookinger kan betales med lenke." };
  if (b.paymentMethod !== "STRIPE" || b.priceOre <= 0) return { ok: false, feil: "Bookingen er ikke merket for betaling med Stripe." };
  if (b.stripePaymentIntentId) return { ok: false, feil: "Bookingen er allerede betalt." };

  // Utløp forrige lenke slik at den ikke kan betales i tillegg. Feiler det fordi den alt er betalt, stopper vi.
  if (b.stripeCheckoutSessionId) {
    try {
      const forrige = await stripeKlient().checkout.sessions.retrieve(b.stripeCheckoutSessionId);
      if (forrige.payment_status === "paid") return { ok: false, feil: "Betalingen er mottatt. Venter på at Stripe melder den inn." };
      if (forrige.status === "open") await stripeKlient().checkout.sessions.expire(b.stripeCheckoutSessionId);
    } catch (error) {
      await logError({ context: "booking.coach-betalingslenke.forrige", error, meta: { bookingId }, severity: "warn" }).catch(() => undefined);
      return { ok: false, feil: "Kunne ikke kontrollere forrige betalingslenke. Prøv igjen." };
    }
  }

  const epost = b.user?.email ?? b.guestEmail ?? undefined;
  const res = await startBookingPayment(
    b.id,
    {
      mode: "payment",
      // Kort dekker også Apple Pay. Ingen andre betalingsmåter.
      payment_method_types: ["card"],
      ...(epost ? { customer_email: epost } : {}),
      line_items: [
        {
          price_data: {
            currency: "nok",
            product_data: {
              name: b.serviceType.name,
              description: `${b.startAt.toLocaleString("nb-NO", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" })} hos ${b.location.name}`,
            },
            unit_amount: b.priceOre,
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: b.id, kilde: "coach" },
      success_url: `${APP_URL}/booking/kvittering/${b.id}?betalt=1`,
      cancel_url: `${APP_URL}/booking/kvittering/${b.id}?avbrutt=1`,
      // Stripe tillater maks 24 timer.
      expires_at: Math.floor(Date.now() / 1000) + 23 * 3600,
    },
    { coachLenke: { lenkeId: randomUUID() } },
  );
  return res.ok ? { ok: true, url: res.url } : { ok: false, feil: res.error };
}
