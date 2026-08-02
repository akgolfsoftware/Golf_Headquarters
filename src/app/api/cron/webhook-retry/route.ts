/**
 * Cron-job: reprosesser feilede webhooks.
 *
 * `webhook_failures` har blitt skrevet til siden den ble laget, men ingen har lest fra
 * den — en Stripe-webhook som feilet ble liggende død, og betalingen var «borte» i appen
 * selv om pengene var trukket. Denne jobben er konsumenten.
 *
 * Kjører PENDING stripe-rader på nytt gjennom `handleStripeEvent`. Lykkes den:
 * status RESOLVED. Feiler den for mange ganger: DEAD + varsel, så en menneskelig
 * oppfølging er mulig i stedet for stillhet.
 *
 * Sideeffektene kjøres synkront her (ikke via `after()`), fordi vi vil vite om de
 * faktisk gikk gjennom før vi merker raden som løst.
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import {
  handleStripeEvent,
  markerBehandlet,
  angreBehandlet,
} from "@/lib/stripe/handle-event";
import { sendSlackAlert } from "@/lib/slack-alert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Etter så mange mislykkede forsøk gir vi opp automatikken og varsler et menneske. */
const MAKS_FORSOK = 5;
const MAKS_PER_KJORING = 20;

export async function GET(req: Request): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let stripe: Stripe;
  try {
    stripe = stripeKlient();
  } catch {
    return NextResponse.json({ error: "stripe-init" }, { status: 500 });
  }

  const feilede = await prisma.webhookFailure.findMany({
    where: { webhookSource: "stripe", status: "PENDING" },
    orderBy: { lastAttemptAt: "asc" },
    take: MAKS_PER_KJORING,
  });

  let løst = 0;
  let fortsattFeil = 0;
  let døde = 0;

  for (const rad of feilede) {
    // Er eventet allerede behandlet (f.eks. av en senere Stripe-retry som gikk bra),
    // skal vi ikke kjøre det igjen — bare lukke raden.
    const førsteGang = await markerBehandlet(rad.eventId, "retry");
    if (!førsteGang) {
      await prisma.webhookFailure.update({
        where: { id: rad.id },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });
      løst++;
      continue;
    }

    try {
      const event = rad.payload as unknown as Stripe.Event;
      await handleStripeEvent(event, { stripe, ventPaaSideeffekter: true });
      await prisma.webhookFailure.update({
        where: { id: rad.id },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });
      løst++;
    } catch (err) {
      await angreBehandlet(rad.eventId);
      const forsok = rad.attemptCount + 1;
      const girOpp = forsok >= MAKS_FORSOK;
      await prisma.webhookFailure.update({
        where: { id: rad.id },
        data: {
          status: girOpp ? "DEAD" : "PENDING",
          attemptCount: forsok,
          lastAttemptAt: new Date(),
          errorMessage: err instanceof Error ? err.message : "Unknown error",
        },
      });
      if (girOpp) {
        døde++;
        await sendSlackAlert({
          title: "Stripe-webhook gir opp",
          message:
            `Event ${rad.eventId} har feilet ${forsok} ganger og er markert DEAD. ` +
            `Siste feil: ${err instanceof Error ? err.message : "ukjent"}. ` +
            `Betalingen kan være trukket uten at appen har registrert den.`,
          meta: { eventId: rad.eventId, forsok },
        }).catch(() => undefined);
      } else {
        fortsattFeil++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    behandlet: feilede.length,
    løst,
    fortsattFeil,
    døde,
  });
}
