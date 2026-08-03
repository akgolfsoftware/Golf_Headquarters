/**
 * Stripe webhook.
 *
 * Ruta gjør fire ting og ingenting mer: verifiser signatur → hopp over hvis eventet
 * allerede er behandlet → kjør handleren → lagre feil i retry-køen.
 * Selve event-logikken bor i `src/lib/stripe/handle-event.ts`, delt med
 * `/api/cron/webhook-retry` som reprosesserer feilede events.
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripeKlient } from "@/lib/stripe";
import {
  handleStripeEvent,
  markerBehandlet,
  angreBehandlet,
} from "@/lib/stripe/handle-event";
import { recordWebhookFailure } from "@/lib/webhook-retry";

export const runtime = "nodejs";
// Gi webhook nok hode-rom mot cold starts + DB-writes.
// Sideeffekter (e-post, Google Calendar push) flyttes ut via after().
export const maxDuration = 60;

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET mangler" },
      { status: 500 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "no-signature" }, { status: 400 });
  }

  const body = await req.text();

  let stripe;
  try {
    stripe = stripeKlient();
  } catch {
    return NextResponse.json({ error: "stripe-init" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const melding = err instanceof Error ? err.message : "bad-signature";
    return NextResponse.json({ error: melding }, { status: 400 });
  }

  try {
    // Dedup FØR behandling. Stripe garanterer «minst én gang» og kan replaye samme
    // event fra dashbordet — uten dette ble e-post og kalender-push sendt på nytt.
    // Kaster dedup-sjekken (databasen nede o.l.), havner eventet i retry-køen under
    // i stedet for å bli stille forkastet.
    const førsteGang = await markerBehandlet(event.id, event.type);
    if (!førsteGang) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await handleStripeEvent(event, { stripe });
  } catch (err) {
    console.error("[stripe-webhook] handler-feil", err);
    // Slipp kvitteringen slik at reprosessering får prøve på nytt.
    await angreBehandlet(event.id);
    // Lagre i retry-kø og returner 200 til Stripe så de ikke retry-er evig.
    // /api/cron/webhook-retry plukker den opp.
    await recordWebhookFailure({
      source: "stripe",
      eventId: event.id,
      payload: event as unknown,
      error: err,
    });
    return NextResponse.json({ received: true, queued: true });
  }

  return NextResponse.json({ received: true });
}
