import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  setupIntentId: z.string().min(1),
});

/**
 * Etter at klienten har fullført `stripe.confirmSetup()` (Elements, A1.7):
 * henter den ferdige SetupIntent-en og setter kortet som standard
 * betalingsmåte — på kunden (fremtidige fakturaer) OG på alle kundens
 * aktive abonnement (samme effekt som Billing Portal ga tidligere).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const rl = await rateLimit({ key: `stripe-setup-intent-bekreft:${user.id}`, max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  const raaBody = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raaBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "ugyldig-forespoersel" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id, stripeCustomerId: { not: null } },
  });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "no-customer" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = stripeKlient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "stripe-init" },
      { status: 500 },
    );
  }

  const setupIntent = await stripe.setupIntents.retrieve(parsed.data.setupIntentId);

  // Eierskap: SetupIntent MÅ tilhøre denne brukerens Stripe-kunde — ellers
  // kunne en autentisert bruker satt en fremmed kundes kort som standard.
  if (setupIntent.customer !== subscription.stripeCustomerId) {
    return NextResponse.json({ error: "eier-mismatch" }, { status: 403 });
  }
  if (setupIntent.status !== "succeeded" || !setupIntent.payment_method) {
    return NextResponse.json({ error: "setup-ikke-fullfort" }, { status: 400 });
  }

  const paymentMethodId =
    typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent.payment_method.id;

  await stripe.customers.update(subscription.stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  const abonnementer = await stripe.subscriptions.list({
    customer: subscription.stripeCustomerId,
    status: "all",
  });
  await Promise.all(
    abonnementer.data
      .filter((a) => ["active", "trialing", "past_due"].includes(a.status))
      .map((a) => stripe.subscriptions.update(a.id, { default_payment_method: paymentMethodId })),
  );

  return NextResponse.json({ ok: true });
}
