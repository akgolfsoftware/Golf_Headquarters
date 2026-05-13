import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import {
  stripeKlient,
  STRIPE_PRICE_ID_PRO,
  STRIPE_PRICE_ID_PERFORMANCE,
  STRIPE_PRICE_ID_PERFORMANCE_PRO,
} from "@/lib/stripe";

export const runtime = "nodejs";

type Plan = "pro" | "performance" | "performance_pro";

const PLAN_TO_PRICE: Record<Plan, string> = {
  pro: STRIPE_PRICE_ID_PRO,
  performance: STRIPE_PRICE_ID_PERFORMANCE,
  performance_pro: STRIPE_PRICE_ID_PERFORMANCE_PRO,
};

function isPlan(value: unknown): value is Plan {
  return value === "pro" || value === "performance" || value === "performance_pro";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Les plan-parameter fra body (JSON eller form). Default: pro (PlayerHQ-only).
  let plan: Plan = "pro";
  try {
    const body = (await req.json().catch(() => ({}))) as { plan?: unknown };
    if (isPlan(body.plan)) plan = body.plan;
  } catch {
    // Behold default
  }

  const priceId = PLAN_TO_PRICE[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `no-price-id-for-${plan}` },
      { status: 500 },
    );
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

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  // Hent eller opprett Stripe customer for brukeren
  let subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  let customerId = subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          tier: user.tier,
          status: "ACTIVE",
          stripeCustomerId: customerId,
        },
      });
    } else {
      await prisma.subscription.update({
        where: { userId: user.id },
        data: { stripeCustomerId: customerId },
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/portal/meg/abonnement?ok=1&plan=${plan}`,
    cancel_url: `${origin}/coaching?cancelled=1`,
    locale: "nb",
    metadata: { userId: user.id, plan },
    subscription_data: { metadata: { userId: user.id, plan } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "no-checkout-url" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
