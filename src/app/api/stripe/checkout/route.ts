import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import {
  stripeKlient,
  STRIPE_PRICE_ID_PRO,
  STRIPE_PRICE_ID_PERFORMANCE,
  STRIPE_PRICE_ID_PERFORMANCE_PRO,
} from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

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
  const rl = await rateLimit({ key: `stripe-checkout:${user.id}`, max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
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

  // Hardkodet app-URL — ikke stol på Origin/Host (åpen redirect-risiko).
  const origin = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no").replace(
    /\/$/,
    "",
  );

  // Hent eller opprett Stripe customer for brukeren. Kunde-ankeret kan ligge
  // på hvilken som helst av radene (A1: én per kind — COACHING | PLAYERHQ).
  const kind = plan === "pro" ? "PLAYERHQ" : "COACHING";
  const eksisterende = await prisma.subscription.findFirst({
    where: { userId: user.id, stripeCustomerId: { not: null } },
    select: { stripeCustomerId: true },
  });

  let customerId = eksisterende?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    // Anker-rad for kunde-id-en på riktig kind. plan forblir null til
    // webhooken fyller den — en anker-rad gir ALDRI tilgang (domain/abonnement).
    await prisma.subscription.upsert({
      where: { userId_kind: { userId: user.id, kind } },
      create: {
        userId: user.id,
        kind,
        tier: user.tier,
        status: "ACTIVE",
        stripeCustomerId: customerId,
      },
      update: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/portal/meg/abonnement?ok=1&plan=${plan}`,
    cancel_url: `${origin}/portal/meg/abonnement?cancelled=1`,
    locale: "nb",
    metadata: { userId: user.id, plan },
    subscription_data: { metadata: { userId: user.id, plan } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "no-checkout-url" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
