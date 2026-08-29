import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import {
  stripeKlient,
  STRIPE_PRICE_ID_PRO,
  STRIPE_PRICE_ID_PRO_AAR,
  STRIPE_PRICE_ID_PERFORMANCE,
  STRIPE_PRICE_ID_PERFORMANCE_PRO,
} from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";
import { PROVEPERIODE_DAGER } from "@/lib/feature-flags";

export const runtime = "nodejs";

type Plan = "pro" | "pro_aar" | "performance" | "performance_pro";

const PLAN_TO_PRICE: Record<Plan, string> = {
  pro: STRIPE_PRICE_ID_PRO,
  pro_aar: STRIPE_PRICE_ID_PRO_AAR,
  performance: STRIPE_PRICE_ID_PERFORMANCE,
  performance_pro: STRIPE_PRICE_ID_PERFORMANCE_PRO,
};

// zod på API-grensen (prosjektregel). startEtterCoaching: vinn-tilbake-broen
// (A2/A4) — PlayerHQ-abonnementet starter som trial frem til coaching-
// periodens slutt, så spilleren aldri dobbeltbetaler.
const bodySchema = z.object({
  plan: z.enum(["pro", "pro_aar", "performance", "performance_pro"]).default("pro"),
  startEtterCoaching: z.boolean().default(false),
});

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


  // Les og valider body. Ugyldige felter → defaults (pro, uten trial-bro).
  const raaBody = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raaBody);
  const { plan, startEtterCoaching } = parsed.success
    ? parsed.data
    : { plan: "pro" as Plan, startEtterCoaching: false };

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
  // pro OG pro_aar er begge PlayerHQ-abonnement. Sto tidligere `plan === "pro"`
  // alene, som la årsabonnementet (2 690 kr) på COACHING-raden — feil kind,
  // feil anker-rad, og en abonnent som ikke ville fått PlayerHQ-tilgang av
  // webhooken. Rettet 2026-08-29. Vinn-tilbake-grenen under har alltid
  // behandlet de to likt, så dette var et sprik internt i samme fil.
  const erPlayerHq = plan === "pro" || plan === "pro_aar";
  const kind = erPlayerHq ? "PLAYERHQ" : "COACHING";
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

  // Vinn-tilbake-broen: nytt PlayerHQ-abonnement starter som trial frem til
  // coaching-periodens slutt. Stripe krever trial_end >= 48 t frem — nærmere
  // enn det (eller passert) starter abonnementet umiddelbart uten trial.
  let trialEnd: number | undefined;
  if (startEtterCoaching && erPlayerHq) {
    const coaching = await prisma.subscription.findUnique({
      where: { userId_kind: { userId: user.id, kind: "COACHING" } },
      select: { currentPeriodEnd: true },
    });
    const slutt = coaching?.currentPeriodEnd?.getTime() ?? 0;
    if (slutt > Date.now() + 48 * 60 * 60 * 1000) {
      trialEnd = Math.floor(slutt / 1000);
    }
  }

  // Prøveuka (Anders 2026-08-29): den bor nå i Stripe, ikke i appen. Den gamle
  // usynlige prøven (registreringsdato + 7 dager, uten kort) er fjernet fra
  // resolveTilgang — se feature-flags.ts. Konsekvensen er at full app krever
  // kort, mens gratisnivået (testbatteri, DataGolf, runde- og statistikkføring)
  // er åpent for alle uten kort og uten utløp.
  //
  // Stripe Checkout krever betalingsmåte ved abonnement med prøveperiode, så
  // kortkravet følger av dette alene. På dag åtte trekkes 299 automatisk med
  // mindre spilleren har sagt opp.
  //
  // Kun ved FØRSTE PlayerHQ-abonnement: har brukeren hatt et før, er prøven
  // brukt opp. Vinn-tilbake-broen (trial_end) vinner hvis begge slår til —
  // Stripe godtar ikke trial_end og trial_period_days samtidig, og en spiller
  // som kommer fra en coaching-pakke skal ha broen, ikke sju dager.
  let proveDager: number | undefined;
  if (erPlayerHq && trialEnd === undefined) {
    const brukt = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        kind: "PLAYERHQ",
        stripeSubscriptionId: { not: null },
      },
      select: { id: true },
    });
    if (!brukt) proveDager = PROVEPERIODE_DAGER;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/portal/meg/abonnement?ok=1&plan=${plan}`,
    cancel_url: `${origin}/portal/meg/abonnement?cancelled=1`,
    locale: "nb",
    metadata: { userId: user.id, plan, ...(startEtterCoaching ? { winback: "1" } : {}) },
    subscription_data: {
      metadata: { userId: user.id, plan },
      ...(trialEnd ? { trial_end: trialEnd } : {}),
      ...(proveDager ? { trial_period_days: proveDager } : {}),
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "no-checkout-url" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
