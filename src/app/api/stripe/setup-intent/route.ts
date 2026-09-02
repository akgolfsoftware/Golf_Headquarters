import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Oppretter en SetupIntent for innebygd kortoppdatering (Stripe Elements,
 * PORTPLAN A1.7). Samme kunde-oppslag som /api/stripe/portal — kunde-ankeret
 * kan ligge på hvilken som helst av abonnement-radene (A1: én per kind).
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const rl = await rateLimit({ key: `stripe-setup-intent:${user.id}`, max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
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

  const setupIntent = await stripe.setupIntents.create({
    customer: subscription.stripeCustomerId,
    payment_method_types: ["card"],
    usage: "off_session",
  });

  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
