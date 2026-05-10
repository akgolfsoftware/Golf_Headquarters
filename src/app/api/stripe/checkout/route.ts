import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient, STRIPE_PRICE_ID_PRO } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (!STRIPE_PRICE_ID_PRO) {
    return NextResponse.json({ error: "no-price-id" }, { status: 500 });
  }

  let stripe;
  try {
    stripe = stripeKlient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "stripe-init" },
      { status: 500 }
    );
  }

  // Bygg URLs fra request-host (fungerer både lokalt og i Vercel)
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
    line_items: [{ price: STRIPE_PRICE_ID_PRO, quantity: 1 }],
    success_url: `${origin}/portal/meg/abonnement?ok=1`,
    cancel_url: `${origin}/portal/meg/abonnement?cancelled=1`,
    locale: "nb",
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "no-checkout-url" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
