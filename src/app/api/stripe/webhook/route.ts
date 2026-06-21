import { NextResponse, after } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  stripeKlient,
  creditsForPriceId,
  tierForPriceId,
} from "@/lib/stripe";
import { pushBookingToCalendar } from "@/lib/google-calendar";
import {
  type SubscriptionStatus,
} from "@/generated/prisma/client";
import {
  recordPaymentIntent,
  recordCheckoutSession,
  recordInvoice,
  recordChargeRefund,
} from "@/lib/payments/record";
import { recordWebhookFailure } from "@/lib/webhook-retry";
import { notify } from "@/lib/notifications";
import { resendKlient, FRA_EPOST } from "@/lib/email";

/**
 * B4 — Varsle coach om ny bekreftet booking.
 * Sender in-app-notification til coachen tilknyttet tjenesten,
 * samt en kortfattet e-post til coaches e-postadresse.
 *
 * Best-effort: feiler stille slik at webhook-responsen ikke blokkeres.
 */
async function notifyCoachOnBooking(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: {
        select: { name: true, coachUserId: true },
      },
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
  const tidStr = `${spillerNavn} · ${booking.serviceType.name} · ${dato}`;

  // Hvem skal varsles:
  // 1. Coachen knyttet til tjenesten (hvis finnes)
  // 2. Alle ADMIN-brukere (backup — Anders er admin)
  const mottakere = new Set<string>();
  if (coachUserId) {
    mottakere.add(coachUserId);
  }
  // Hent alle ADMIN-brukere
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });
  for (const a of admins) {
    mottakere.add(a.id);
  }

  // In-app-varsling til alle mottakere
  for (const userId of mottakere) {
    await notify({
      userId,
      type: "booking",
      title: "Ny booking bekreftet",
      body: tidStr,
      link: "/admin/bookinger",
    });
  }

  // E-post til coach/admin (Anders sitt alias) — best-effort
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
<a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no"}/admin/bookings" style="color:#005840;">Se alle bookinger →</a>
</p>`,
      });
    } catch (err) {
      console.error("[stripe-webhook] coach-email failed", err);
    }
  }
}

export const runtime = "nodejs";
// Gi webhook nok hode-rom mot cold starts + DB-writes.
// Sideeffekter (e-post, Google Calendar push) flyttes ut via after().
export const maxDuration = 60;

function mapStripeStatus(s: string): SubscriptionStatus {
  switch (s) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELLED";
    default:
      return "ACTIVE";
  }
}

async function syncSubscription(stripeSub: Stripe.Subscription) {
  const userId = stripeSub.metadata?.userId;
  if (!userId) {
    console.warn("[stripe-webhook] subscription uten userId-metadata", stripeSub.id);
    return;
  }

  const status = mapStripeStatus(stripeSub.status);
  const priceId = stripeSub.items.data[0]?.price?.id ?? null;
  // Inaktive abonnement skal alltid være GRATIS-tier uavhengig av pris-ID.
  const tier = status === "ACTIVE" ? tierForPriceId(priceId) : "GRATIS";
  const monthlyCredits = status === "ACTIVE" ? creditsForPriceId(priceId) : 0;
  const periodEnd = stripeSub.items.data[0]?.current_period_end;
  const newPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

  // Avgjør om vi skal resette credits-saldoen.
  // Reset hvis:
  //   - abonnement opprettes for første gang, ELLER
  //   - faktureringsperioden har rullet (currentPeriodEnd har endret seg)
  // Eksisterende abonnement med uendret periode beholder gjenværende saldo.
  const existing = await prisma.subscription.findUnique({
    where: { userId },
    select: { currentPeriodEnd: true },
  });

  const periodRolled =
    !existing?.currentPeriodEnd ||
    (newPeriodEnd &&
      existing.currentPeriodEnd.getTime() !== newPeriodEnd.getTime());

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
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
      tier,
      status,
      stripeSubscriptionId: stripeSub.id,
      currentPeriodEnd: newPeriodEnd,
      monthlyCredits,
      // Bare reset saldo hvis periode har rullet. Ellers behold (kunden har
      // kanskje brukt credits midt i perioden).
      ...(periodRolled ? { creditsRemaining: monthlyCredits } : {}),
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { tier },
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET mangler" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "no-signature" }, { status: 400 });
  }

  const body = await req.text();

  let stripe;
  try {
    stripe = stripeKlient();
  } catch {
    return NextResponse.json({ error: "stripe-init" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const melding = err instanceof Error ? err.message : "bad-signature";
    return NextResponse.json({ error: melding }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Booking-mode: rask CONFIRMED-update synkront, alt annet i bakgrunn
        // for å unngå Stripes 10-sek webhook-timeout.
        const bookingId = session.metadata?.bookingId;
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        if (bookingId && session.payment_status === "paid") {
          const result = await prisma.booking.updateMany({
            where: { id: bookingId },
            data: {
              status: "CONFIRMED",
              stripePaymentIntentId: paymentIntentId,
            },
          });
          if (result.count === 0) {
            console.warn(
              "[stripe-webhook] checkout.session.completed: ukjent bookingId",
              bookingId,
            );
          }
        }

        // ALT ANNET i bakgrunnen (etter 200 OK til Stripe):
        //   - recordCheckoutSession (6 DB-queries, opp til 15 sek)
        //   - subscription-sync (Stripe API-kall)
        //   - sendBookingConfirmation (Resend, 1-3 sek)
        //   - pushBookingToCalendar (Google API, 2-5 sek per kalender)
        //   - notifyCoach (in-app + e-post til coach, B4)
        after(async () => {
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

          if (bookingId && session.payment_status === "paid") {
            try {
              const { sendBookingConfirmation } = await import(
                "@/lib/email/booking-emails"
              );
              await sendBookingConfirmation(bookingId);
            } catch (err) {
              console.error(
                "[stripe-webhook] booking-confirmation-email failed",
                err,
              );
            }
            try {
              await pushBookingToCalendar(bookingId);
            } catch (err) {
              console.error("[stripe-webhook] calendar-push failed", err);
            }
            // B4 — Varsle coach (in-app + e-post) om ny bekreftet booking.
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
          const result = await prisma.booking.updateMany({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
          });
          if (result.count === 0) {
            console.warn(
              "[stripe-webhook] checkout.session.expired: ukjent bookingId",
              bookingId
            );
          }
        }
        break;
      }
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await recordPaymentIntent(intent);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.finalized": {
        const invoice = event.data.object as Stripe.Invoice;
        await recordInvoice(invoice);
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
          console.warn(
            "[stripe-webhook] charge.refunded uten payment_intent",
            charge.id,
          );
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
        // Ignorer andre events for nå
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] handler-feil", err);
    // Lagre i retry-kø og returner 200 til Stripe så de ikke retry-er evig.
    // Vi reprosesserer manuelt eller via cron.
    await recordWebhookFailure({
      source: "stripe",
      eventId: event.id,
      payload: event as unknown,
      error: err,
    });
    return NextResponse.json({ received: true, queued: true });
  }

  return NextResponse.json({ received: true });
}
