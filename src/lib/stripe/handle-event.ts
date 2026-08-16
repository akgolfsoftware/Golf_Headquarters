/**
 * Stripe-event-håndtering — én implementasjon, to kallere.
 *
 * 1. `POST /api/stripe/webhook` — normal levering fra Stripe.
 * 2. `GET /api/cron/webhook-retry` — reprosessering av rader i `webhook_failures`.
 *
 * Grunnen til at dette bor utenfor rute-fila: før dette fantes ingen vei tilbake for en
 * webhook som feilet. Feilen ble lagret i `webhook_failures` og lå der død, fordi ingen
 * kunne kjøre handleren på nytt. Nå kan cron-jobben mate den lagrede payloaden inn igjen.
 *
 * Idempotens: `harBehandlet`/`markerBehandlet`/`angreBehandlet` under gir «behandle
 * nøyaktig én gang»-oppførsel. Stripe leverer «minst én gang» og kan replaye samme event
 * fra dashbordet — uten dette ble e-post, kalender-push og coach-varsel sendt på nytt.
 */

import type Stripe from "stripe";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushBooking } from "@/lib/google-calendar-kilder";
import { varsleNyBooking } from "@/lib/booking/varsle-ny-booking";
import type { SubscriptionStatus } from "@/generated/prisma/client";
import {
  recordPaymentIntent,
  recordCheckoutSession,
  recordInvoice,
  recordChargeRefund,
} from "@/lib/payments/record";
import { notify } from "@/lib/notifications";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { creditsForPriceId, tierForPriceId } from "@/lib/stripe";
import {
  mapStripeStatus,
  effektivAbonnementStatus,
} from "./abonnement-status";

export const STRIPE_KILDE = "stripe";

/** Har vi allerede behandlet dette eventet ferdig? */
export async function harBehandlet(eventId: string): Promise<boolean> {
  const rad = await prisma.processedWebhookEvent.findUnique({
    where: { source_eventId: { source: STRIPE_KILDE, eventId } },
    select: { id: true },
  });
  return rad !== null;
}

/**
 * Marker eventet som behandlet. Returnerer false hvis det ALLEREDE var markert —
 * da skal kalleren hoppe over hele behandlingen. Unikhetsindeksen er låsen, så to
 * samtidige leveranser av samme event kan ikke begge slippe gjennom.
 */
export async function markerBehandlet(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  try {
    await prisma.processedWebhookEvent.create({
      data: { source: STRIPE_KILDE, eventId, eventType },
    });
    return true;
  } catch (err) {
    // KUN unique-brudd betyr «allerede behandlet». Alt annet (tabellen mangler,
    // databasen er nede) MÅ kastes videre — svelger vi det, ville hver eneste
    // betaling blitt stille avvist som duplikat og aldri registrert.
    if (erUniqueBrudd(err)) return false;
    throw err;
  }
}

function erUniqueBrudd(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const kode = (err as { code?: unknown }).code;
  return kode === "P2002";
}

/**
 * Fjern kvitteringen igjen. Kalles når behandlingen kastet, slik at en senere
 * reprosessering får lov til å prøve på nytt i stedet for å bli avvist som duplikat.
 */
export async function angreBehandlet(eventId: string): Promise<void> {
  await prisma.processedWebhookEvent
    .deleteMany({ where: { source: STRIPE_KILDE, eventId } })
    .catch(() => undefined);
}

export async function syncSubscription(stripeSub: Stripe.Subscription) {
  const userId = stripeSub.metadata?.userId;
  if (!userId) {
    console.warn("[stripe-webhook] subscription uten userId-metadata", stripeSub.id);
    return;
  }

  const stripeStatus = mapStripeStatus(stripeSub.status);
  // Avbestilt-men-betalt: Stripe rapporterer «active» + cancel_at_period_end
  // frem til periodeslutt. Appen skal vise CANCELLED (fornyes ikke, kan ikke
  // avbestilles på nytt) — ellers overskriver denne webhooken CANCELLED-en
  // cancelPro() nettopp satte. Tier/credits beholdes ut den betalte perioden;
  // customer.subscription.deleted («canceled») nedgraderer til GRATIS.
  const status: SubscriptionStatus = effektivAbonnementStatus(
    stripeStatus,
    stripeSub.cancel_at_period_end,
  );
  const priceId = stripeSub.items.data[0]?.price?.id ?? null;
  // Inaktive abonnement skal alltid være GRATIS-tier uavhengig av pris-ID.
  const tier = stripeStatus === "ACTIVE" ? tierForPriceId(priceId) : "GRATIS";
  const monthlyCredits = stripeStatus === "ACTIVE" ? creditsForPriceId(priceId) : 0;
  // Kind utledes fra PRISEN, aldri fra monthlyCredits-feltet — et kansellert
  // Performance-abonnement har credits 0 men er fortsatt COACHING-raden (A1).
  const kind = creditsForPriceId(priceId) > 0 ? "COACHING" : "PLAYERHQ";
  const plan =
    creditsForPriceId(priceId) >= 4
      ? "PERFORMANCE_PRO"
      : creditsForPriceId(priceId) > 0
        ? "PERFORMANCE"
        : "PLAYERHQ_MND";
  const interval = stripeSub.items.data[0]?.price?.recurring?.interval ?? "month";
  const periodEnd = stripeSub.items.data[0]?.current_period_end;
  const newPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

  // Reset credits-saldo kun ved førstegangs-opprettelse eller når
  // faktureringsperioden har rullet — ellers beholder kunden gjenværende saldo.
  const existing = await prisma.subscription.findUnique({
    where: { userId_kind: { userId, kind } },
    select: { currentPeriodEnd: true },
  });

  const periodRolled =
    !existing?.currentPeriodEnd ||
    (newPeriodEnd && existing.currentPeriodEnd.getTime() !== newPeriodEnd.getTime());

  await prisma.subscription.upsert({
    where: { userId_kind: { userId, kind } },
    create: {
      userId,
      kind,
      plan,
      interval,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      stripePriceId: priceId,
      tier,
      status,
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId:
        typeof stripeSub.customer === "string"
          ? stripeSub.customer
          : stripeSub.customer.id,
      currentPeriodEnd: newPeriodEnd,
      monthlyCredits,
      creditsRemaining: monthlyCredits,
    },
    update: {
      plan,
      interval,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      stripePriceId: priceId,
      tier,
      status,
      stripeSubscriptionId: stripeSub.id,
      currentPeriodEnd: newPeriodEnd,
      monthlyCredits,
      ...(periodRolled ? { creditsRemaining: monthlyCredits } : {}),
    },
  });

  // user.tier rekalkuleres fra ALLE radene — ellers ville f.eks. sletting av
  // coaching-abonnementet nedgradere en bruker som fortsatt betaler for
  // PlayerHQ (A1). PRO hvis minst én rad står som betalt.
  const alleRader = await prisma.subscription.findMany({
    where: { userId },
    select: { tier: true },
  });
  const effektivTier = alleRader.some((s) => s.tier !== "GRATIS") ? "PRO" : "GRATIS";
  await prisma.user.update({ where: { id: userId }, data: { tier: effektivTier } });
}

/**
 * B4 — Varsle coach om ny bekreftet booking.
 * Best-effort: feiler stille slik at webhook-responsen ikke blokkeres.
 */
async function notifyCoachOnBooking(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: { select: { name: true, coachUserId: true } },
      user: { select: { name: true } },
      location: { select: { name: true } },
    },
  });
  if (!booking) return;

  const coachUserId = booking.serviceType.coachUserId;
  const spillerNavn = booking.user?.name ?? booking.guestName ?? "Gjest";

  const dato = booking.startAt.toLocaleString("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Oslo",
  });

  const mottakere = new Set<string>();
  if (coachUserId) mottakere.add(coachUserId);
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });
  for (const a of admins) mottakere.add(a.id);

  await varsleNyBooking(booking.id, "stripe");

  if (booking.userId && !mottakere.has(booking.userId)) {
    await notify({
      userId: booking.userId,
      type: "booking",
      title: "Booking bekreftet",
      body: `${booking.serviceType.name} · ${dato}`,
      link: "/portal/meg/bookinger",
    });
  }

  const adminEmails = admins.map((a) => a.email).filter(Boolean) as string[];
  if (adminEmails.length > 0) {
    try {
      const resend = resendKlient();
      await resend.emails.send({
        from: FRA_EPOST,
        to: adminEmails,
        subject: `Ny booking: ${spillerNavn} — ${booking.serviceType.name}`,
        html: `<p style="font-family:system-ui,sans-serif;max-width:520px;margin:24px auto;color:#0A1F17;line-height:1.6;">
<strong>Ny booking bekreftet via AK Golf</strong><br/><br/>
Spiller: <strong>${spillerNavn}</strong><br/>
Tjeneste: ${booking.serviceType.name}<br/>
Tid: ${dato}<br/>
Sted: ${booking.location.name}<br/>
<br/>
<a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no"}/admin/bookings" style="color:#B85C3D;">Se alle bookinger →</a>
</p>`,
      });
    } catch (err) {
      console.error("[stripe-webhook] coach-email failed", err);
    }
  }
}

export type HandleOptions = {
  /** Stripe-klient — brukes til å hente fullt subscription-objekt. */
  stripe: Stripe;
  /**
   * Kjør sideeffektene med en gang i stedet for via `after()`.
   * Webhook-ruten vil svare Stripe raskt (after), cron-reprosesseringen vil vente.
   */
  ventPaaSideeffekter?: boolean;
};

/**
 * Behandle ett Stripe-event. Kaster ved feil — kalleren avgjør hva som skjer da.
 */
export async function handleStripeEvent(
  event: Stripe.Event,
  { stripe, ventPaaSideeffekter = false }: HandleOptions,
): Promise<void> {
  const kjørSenere = (fn: () => Promise<void>) =>
    ventPaaSideeffekter ? fn() : Promise.resolve(void after(fn));

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      // Bare denne oppdateringen skjer synkront — resten etter 200 OK til Stripe.
      let bookingBleBekreftet = false;
      if (bookingId && session.payment_status === "paid") {
        const result = await prisma.booking.updateMany({
          where: {
            id: bookingId,
            status: "PENDING",
            OR: [
              { stripeCheckoutSessionId: null },
              { stripeCheckoutSessionId: session.id },
            ],
          },
          data: {
            status: "CONFIRMED",
            stripePaymentIntentId: paymentIntentId,
            stripeCheckoutSessionId: session.id,
          },
        });
        bookingBleBekreftet = result.count > 0;
        if (!bookingBleBekreftet) {
          console.warn(
            "[stripe-webhook] checkout.session.completed: ukjent/ikke-PENDING bookingId",
            bookingId,
          );
        }
      }

      await kjørSenere(async () => {
        try {
          await recordCheckoutSession(session);
        } catch (err) {
          console.error("[stripe-webhook] recordCheckoutSession failed", err);
        }

        if (session.subscription) {
          try {
            const subId =
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription.id;
            const fullSub = await stripe.subscriptions.retrieve(subId);
            await syncSubscription(fullSub);
          } catch (err) {
            console.error("[stripe-webhook] subscription-sync failed", err);
          }
        }

        // VIKTIG: disse henger på `bookingBleBekreftet`, ikke bare på at eventet kom.
        // Traff ikke oppdateringen en rad, var bookingen allerede bekreftet — da er
        // e-post, kalender-push og coach-varsel allerede sendt, og skal ikke sendes igjen.
        if (bookingId && bookingBleBekreftet) {
          try {
            const { sendBookingConfirmation } = await import(
              "@/lib/email/booking-emails"
            );
            await sendBookingConfirmation(bookingId);
          } catch (err) {
            console.error("[stripe-webhook] booking-confirmation-email failed", err);
          }
          try {
            await pushBooking(bookingId);
          } catch (err) {
            console.error("[stripe-webhook] calendar-push failed", err);
          }
          try {
            await notifyCoachOnBooking(bookingId);
          } catch (err) {
            console.error("[stripe-webhook] coach-notify failed", err);
          }
        }
      });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        // Aldri overskriv CONFIRMED/COMPLETED ved race med completed-event.
        const result = await prisma.booking.updateMany({
          where: {
            id: bookingId,
            status: "PENDING",
            OR: [
              { stripeCheckoutSessionId: null },
              { stripeCheckoutSessionId: session.id },
            ],
          },
          data: { status: "CANCELLED" },
        });
        if (result.count === 0) {
          console.warn(
            "[stripe-webhook] checkout.session.expired: ukjent/ikke-PENDING bookingId",
            bookingId,
          );
        }
      }
      break;
    }

    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      await recordPaymentIntent(event.data.object as Stripe.PaymentIntent);
      break;
    }

    case "invoice.paid":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
    case "invoice.finalized": {
      await recordInvoice(event.data.object as Stripe.Invoice);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await recordChargeRefund(charge);
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id ?? null;
      if (!paymentIntentId) {
        console.warn("[stripe-webhook] charge.refunded uten payment_intent", charge.id);
        break;
      }
      const result = await prisma.booking.updateMany({
        where: {
          stripePaymentIntentId: paymentIntentId,
          status: { not: "CANCELLED" },
        },
        data: { status: "CANCELLED" },
      });
      if (result.count === 0) {
        console.warn(
          "[stripe-webhook] charge.refunded: ingen aktiv booking matchet",
          paymentIntentId,
        );
      }
      break;
    }

    default:
      // Ignorer andre events for nå.
      break;
  }
}
