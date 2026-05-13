// Helper for å upserte Payment-rader idempotent fra Stripe-events.
// Bruk fra webhook OG fra reimport-script.

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";
type PaymentType = "BOOKING" | "SUBSCRIPTION" | "INVOICE" | "OTHER";

function customerId(
  c: Stripe.Customer | Stripe.DeletedCustomer | string | null | undefined,
): string | null {
  if (!c) return null;
  if (typeof c === "string") return c;
  return c.id;
}

async function findUserId(opts: {
  metadataUserId?: string | null;
  stripeCustomerId?: string | null;
}): Promise<string | null> {
  if (opts.metadataUserId) {
    const u = await prisma.user.findUnique({
      where: { id: opts.metadataUserId },
      select: { id: true },
    });
    if (u) return u.id;
  }
  if (opts.stripeCustomerId) {
    const sub = await prisma.subscription.findFirst({
      where: { stripeCustomerId: opts.stripeCustomerId },
      select: { userId: true },
    });
    if (sub) return sub.userId;
  }
  return null;
}

async function findSubscriptionId(
  stripeSubscriptionId: string | null,
): Promise<string | null> {
  if (!stripeSubscriptionId) return null;
  const s = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
    select: { id: true },
  });
  return s?.id ?? null;
}

async function findBookingId(opts: {
  metadataBookingId?: string | null;
  paymentIntentId?: string | null;
  sessionId?: string | null;
}): Promise<string | null> {
  if (opts.metadataBookingId) {
    const b = await prisma.booking.findUnique({
      where: { id: opts.metadataBookingId },
      select: { id: true },
    });
    if (b) return b.id;
  }
  if (opts.paymentIntentId) {
    const b = await prisma.booking.findFirst({
      where: { stripePaymentIntentId: opts.paymentIntentId },
      select: { id: true },
    });
    if (b) return b.id;
  }
  if (opts.sessionId) {
    const b = await prisma.booking.findFirst({
      where: { stripeCheckoutSessionId: opts.sessionId },
      select: { id: true },
    });
    if (b) return b.id;
  }
  return null;
}

export async function recordPaymentIntent(intent: Stripe.PaymentIntent) {
  const status: PaymentStatus =
    intent.status === "succeeded"
      ? "SUCCEEDED"
      : intent.status === "canceled" || intent.status === "requires_payment_method"
        ? "FAILED"
        : "PENDING";

  const stripeCustomerId = customerId(intent.customer);
  const userId = await findUserId({
    metadataUserId: intent.metadata?.userId ?? null,
    stripeCustomerId,
  });
  const bookingId = await findBookingId({
    metadataBookingId: intent.metadata?.bookingId ?? null,
    paymentIntentId: intent.id,
  });
  const chargeId =
    !intent.latest_charge
      ? null
      : typeof intent.latest_charge === "string"
        ? intent.latest_charge
        : intent.latest_charge.id;

  const type: PaymentType = bookingId ? "BOOKING" : "OTHER";

  const data: Prisma.PaymentUncheckedCreateInput = {
    stripePaymentIntentId: intent.id,
    stripeChargeId: chargeId,
    stripeCustomerId,
    amountOre: intent.amount,
    currency: intent.currency,
    status,
    type,
    userId,
    bookingId,
    description: intent.description ?? null,
    metadata: intent.metadata as Prisma.InputJsonValue,
    paidAt: status === "SUCCEEDED" ? new Date(intent.created * 1000) : null,
  };

  await prisma.payment.upsert({
    where: { stripePaymentIntentId: intent.id },
    create: data,
    update: {
      status,
      stripeChargeId: chargeId ?? undefined,
      amountOre: intent.amount,
      userId: userId ?? undefined,
      bookingId: bookingId ?? undefined,
      paidAt: status === "SUCCEEDED" ? new Date(intent.created * 1000) : undefined,
    },
  });
}

export async function recordCheckoutSession(session: Stripe.Checkout.Session) {
  // Brukes for "mode: payment" og "mode: subscription".
  // For subscription med invoice — invoice.paid håndteres separat.
  if (session.mode === "setup") return;

  const stripeCustomerId = customerId(session.customer);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const subscriptionStripeId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const invoiceId =
    typeof session.invoice === "string"
      ? session.invoice
      : session.invoice?.id ?? null;

  const userId = await findUserId({
    metadataUserId: session.metadata?.userId ?? null,
    stripeCustomerId,
  });
  const bookingId = await findBookingId({
    metadataBookingId: session.metadata?.bookingId ?? null,
    paymentIntentId,
    sessionId: session.id,
  });
  const subscriptionId = await findSubscriptionId(subscriptionStripeId);

  const status: PaymentStatus =
    session.payment_status === "paid"
      ? "SUCCEEDED"
      : session.payment_status === "unpaid"
        ? "FAILED"
        : "PENDING";

  const type: PaymentType = subscriptionStripeId
    ? "SUBSCRIPTION"
    : bookingId
      ? "BOOKING"
      : "OTHER";

  const amountOre = session.amount_total ?? 0;

  const data: Prisma.PaymentUncheckedCreateInput = {
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    stripeInvoiceId: invoiceId,
    stripeCustomerId,
    amountOre,
    currency: session.currency ?? "nok",
    status,
    type,
    userId,
    bookingId,
    subscriptionId,
    metadata: (session.metadata ?? {}) as Prisma.InputJsonValue,
    paidAt: status === "SUCCEEDED" ? new Date(session.created * 1000) : null,
  };

  await prisma.payment.upsert({
    where: { stripeSessionId: session.id },
    create: data,
    update: {
      status,
      amountOre,
      stripePaymentIntentId: paymentIntentId ?? undefined,
      stripeInvoiceId: invoiceId ?? undefined,
      userId: userId ?? undefined,
      bookingId: bookingId ?? undefined,
      subscriptionId: subscriptionId ?? undefined,
      paidAt:
        status === "SUCCEEDED" ? new Date(session.created * 1000) : undefined,
    },
  });
}

export async function recordInvoice(invoice: Stripe.Invoice) {
  const stripeCustomerId = customerId(invoice.customer);
  const invoiceAny = invoice as unknown as {
    subscription?: string | { id: string } | null;
    payment_intent?: string | { id: string } | null;
  };
  const subscriptionStripeId =
    typeof invoiceAny.subscription === "string"
      ? invoiceAny.subscription
      : invoiceAny.subscription && "id" in invoiceAny.subscription
        ? invoiceAny.subscription.id
        : null;
  const paymentIntentId =
    typeof invoiceAny.payment_intent === "string"
      ? invoiceAny.payment_intent
      : invoiceAny.payment_intent && "id" in invoiceAny.payment_intent
        ? invoiceAny.payment_intent.id
        : null;

  const subscriptionId = await findSubscriptionId(subscriptionStripeId);
  const userId = await findUserId({
    metadataUserId: invoice.metadata?.userId ?? null,
    stripeCustomerId,
  });

  const status: PaymentStatus =
    invoice.status === "paid"
      ? "SUCCEEDED"
      : invoice.status === "uncollectible" || invoice.status === "void"
        ? "FAILED"
        : "PENDING";

  const data: Prisma.PaymentUncheckedCreateInput = {
    stripeInvoiceId: invoice.id ?? null,
    stripePaymentIntentId: paymentIntentId,
    stripeCustomerId,
    amountOre: invoice.amount_paid || invoice.amount_due || 0,
    currency: invoice.currency,
    status,
    type: "INVOICE",
    userId,
    subscriptionId,
    description: invoice.description ?? null,
    metadata: (invoice.metadata ?? {}) as Prisma.InputJsonValue,
    paidAt:
      status === "SUCCEEDED" && invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
  };

  if (!invoice.id) return;

  await prisma.payment.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: data,
    update: {
      status,
      amountOre: invoice.amount_paid || invoice.amount_due || 0,
      stripePaymentIntentId: paymentIntentId ?? undefined,
      userId: userId ?? undefined,
      subscriptionId: subscriptionId ?? undefined,
      paidAt:
        status === "SUCCEEDED" && invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : undefined,
    },
  });
}

export async function recordChargeRefund(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;
  if (!paymentIntentId) return;

  const totalRefunded = charge.amount_refunded;
  const status: PaymentStatus =
    totalRefunded >= charge.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";

  // Finn eksisterende payment-rad via PI-ID. Hvis ingen finnes, lag en.
  const existing = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        status,
        amountRefundedOre: totalRefunded,
        refundedAt: new Date(),
        stripeChargeId: charge.id,
      },
    });
  } else {
    const stripeCustomerId = customerId(charge.customer);
    const userId = await findUserId({ stripeCustomerId });
    await prisma.payment.create({
      data: {
        stripePaymentIntentId: paymentIntentId,
        stripeChargeId: charge.id,
        stripeCustomerId,
        amountOre: charge.amount,
        amountRefundedOre: totalRefunded,
        currency: charge.currency,
        status,
        type: "OTHER",
        userId,
        refundedAt: new Date(),
        paidAt: new Date(charge.created * 1000),
      },
    });
  }
}
