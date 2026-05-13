import { NextResponse } from "next/server";
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

export const runtime = "nodejs";

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
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const fullSub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(fullSub);
        }
        // Booking-mode (one-time payment via metadata.bookingId)
        const bookingId = session.metadata?.bookingId;
        if (bookingId && session.payment_status === "paid") {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null;
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
              bookingId
            );
          } else {
            // Send bekreftelses-e-post (best-effort, ikke feil hvis Resend nede)
            try {
              const { sendBookingConfirmation } = await import(
                "@/lib/email/booking-emails"
              );
              await sendBookingConfirmation(bookingId);
            } catch (err) {
              console.error(
                "[stripe-webhook] booking-confirmation-email failed",
                err
              );
            }
            // Push til coachens Google Calendar (best-effort)
            try {
              await pushBookingToCalendar(bookingId);
            } catch (err) {
              console.error(
                "[stripe-webhook] calendar-push failed",
                err
              );
            }
          }
        }
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
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        // Logger kun — booking-confirmation skjer via checkout.session.completed.
        console.log(
          "[stripe-webhook] payment_intent.succeeded",
          intent.id,
          intent.amount,
          intent.currency,
        );
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
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
    return NextResponse.json({ error: "handler-failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
