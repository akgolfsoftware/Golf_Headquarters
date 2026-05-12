import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import {
  type Tier,
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
  const tier: Tier = status === "ACTIVE" ? "PRO" : "GRATIS";
  const periodEnd = stripeSub.items.data[0]?.current_period_end;

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
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
    update: {
      tier,
      status,
      stripeSubscriptionId: stripeSub.id,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
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
