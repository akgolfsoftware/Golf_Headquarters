import "server-only";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus, Prisma } from "@/generated/prisma/client";

const rank: Record<PaymentStatus, number> = { PENDING: 0, FAILED: 1, SUCCEEDED: 2, PARTIALLY_REFUNDED: 3, REFUNDED: 4 };
const identityFields = ["stripePaymentIntentId", "stripeSessionId", "stripeInvoiceId", "stripeChargeId"] as const;

/** Stripe's event order is undefined: session, intent, invoice and refund describe the same payment. */
export async function savePayment(data: Prisma.PaymentUncheckedCreateInput): Promise<void> {
  const identities = identityFields.flatMap(key => data[key] ? [{ [key]: data[key] }] : []);
  if (!identities.length) throw new Error("Payment requires a Stripe identity");
  await prisma.$transaction(async tx => {
    // A short transaction serializes this ledger's writes, including initially disjoint event identities.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(742018, 1)::text`;
    const matches = await tx.payment.findMany({ where: { OR: identities }, orderBy: { createdAt: "asc" } });
    if (!matches.length) { await tx.payment.create({ data }); return; }
    // Never silently delete financial history or combine ambiguous legacy rows. The webhook retry queue alerts operations.
    if (matches.length > 1) throw new Error("Flere betalingsrader deler Stripe-identiteter. Krever avstemming.");
    const existing = matches[0];
    for (const key of identityFields) {
      if (existing[key] && data[key] && existing[key] !== data[key]) throw new Error("Betalingen har motstridende Stripe-identiteter.");
    }
    const incomingStatus = data.status ?? "PENDING";
    const status = rank[incomingStatus] >= rank[existing.status] ? incomingStatus : existing.status;
    const refunded = Math.max(existing.amountRefundedOre, data.amountRefundedOre ?? 0);
    const canUpdateAmount = rank[incomingStatus] >= rank[existing.status];
    await tx.payment.update({ where: { id: existing.id }, data: {
      ...Object.fromEntries(identityFields.filter(key => data[key]).map(key => [key, data[key]])),
      stripeCustomerId: data.stripeCustomerId ?? existing.stripeCustomerId,
      amountOre: canUpdateAmount ? data.amountOre : existing.amountOre,
      currency: canUpdateAmount ? data.currency ?? existing.currency : existing.currency,
      status, amountRefundedOre: refunded,
      type: existing.type === "BOOKING" || data.type === "OTHER" ? existing.type : data.type,
      userId: data.userId ?? existing.userId,
      bookingId: data.bookingId ?? existing.bookingId,
      subscriptionId: data.subscriptionId ?? existing.subscriptionId,
      description: data.description ?? existing.description,
      paidAt: existing.paidAt ?? data.paidAt,
      refundedAt: refunded > existing.amountRefundedOre ? data.refundedAt : existing.refundedAt,
      metadata: {
        ...(existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata) ? existing.metadata : {}),
        ...(data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata) ? data.metadata : {}),
      } as Prisma.InputJsonValue,
    } });
  });
}
