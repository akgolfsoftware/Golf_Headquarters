/**
 * Cron-job: varsle om webhook-feil som ligger uløst i køen.
 *
 * Når en webhook-handler (Stripe m.fl.) kaster, lagres eventet i
 * `webhook_failures` med status PENDING og det returneres 200 til avsenderen
 * (ellers ville Stripe retry-e i det uendelige og gi doble sideeffekter). Køen
 * var tidligere skriv-only: en betalt booking kunne bli stående ubehandlet uten
 * at noen fikk beskjed. Denne jobben drenerer ikke køen automatisk (reprosess
 * krever menneskelig vurdering), men gjør den synlig: ligger det PENDING-rader,
 * sendes én samlet alarm til Anders for manuell oppfølging i admin.
 *
 * Kjøres via Vercel Cron. Beskyttet med CRON_SECRET (fail-closed).
 */

import { NextResponse } from "next/server";
import { listPendingWebhookFailures } from "@/lib/webhook-retry";
import { sendSlackAlert } from "@/lib/slack-alert";
import { logError } from "@/lib/error-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const pending = await listPendingWebhookFailures(50);

    if (pending.length === 0) {
      return NextResponse.json({ ok: true, pending: 0 });
    }

    // Ingen PII i alarmen — kun kilder, event-ID-er og feilmelding (payload med
    // kundedata forblir i DB bak innlogging).
    await sendSlackAlert({
      title: `${pending.length} uløste webhook-feil i kø`,
      message:
        "Stripe/webhook-handler feilet for disse eventene og de er ikke reprosessert. Manuell oppfølging trengs.",
      meta: {
        count: pending.length,
        oldest: pending[0]?.lastAttemptAt.toISOString(),
        kilder: [...new Set(pending.map((p) => p.webhookSource))].join(", "),
        eventIds: pending.map((p) => p.eventId).join(", "),
      },
    });

    return NextResponse.json({ ok: true, pending: pending.length });
  } catch (error) {
    await logError({
      context: "cron.webhook-failures-alert",
      error,
      severity: "error",
    });
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
