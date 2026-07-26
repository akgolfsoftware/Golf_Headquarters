import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
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
      { status: 500 }
    );
  }

  const origin = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no").replace(
    /\/$/,
    "",
  );

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/portal/meg/abonnement`,
    locale: "nb",
  });

  return NextResponse.json({ url: session.url });
}
