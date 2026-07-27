/**
 * Google Calendar Push Notifications webhook.
 *
 * Google sender en HTTP POST når noe endres i en kalender vi har watch på.
 * Vi speiler kalenderen (google-calendar-mirror, inkrementelt via syncToken)
 * og reflekterer endringene videre til Booking. Det gir to ting på én gang:
 * kalenderen i AgencyOS blir oppdatert umiddelbart, og bookinger følger
 * flytting/sletting gjort i Google.
 *
 * Endret 2026-07-27 (steg 1): tidligere gjorde ruten sitt eget events.list med
 * updatedMin og maxResults=100 uten paginering — endringer kunne gå tapt, og
 * ingenting ble lagret lokalt. Nå er speilingen kilden.
 *
 * Sikkerhet:
 *   - X-Goog-Channel-Token verifiseres mot HMAC(channelId, secret)
 *   - X-Goog-Channel-Id matches mot watchChannelId i DB
 *
 * Headers vi får fra Google:
 *   - X-Goog-Channel-Id
 *   - X-Goog-Channel-Token
 *   - X-Goog-Resource-Id
 *   - X-Goog-Resource-State: sync | exists | not_exists
 *   - X-Goog-Message-Number
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signWebhookToken } from "@/lib/google-calendar";
import { syncSubscriptionEvents } from "@/lib/google-calendar-mirror";
import { reflekterTilBookinger } from "@/lib/google-calendar-reflect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Google retrier hvis vi ikke svarer innen ~30s. Speiling + DB-writes kan ta
// tid ved store calendar-deltaer. 60s er trygg buffer.
export const maxDuration = 60;

export async function POST(request: Request) {
  const channelId = request.headers.get("x-goog-channel-id");
  const token = request.headers.get("x-goog-channel-token");
  const resourceState = request.headers.get("x-goog-resource-state");

  if (!channelId || !token) {
    return new NextResponse("Missing headers", { status: 400 });
  }

  // Verifiser HMAC-signatur
  let expectedToken: string;
  try {
    expectedToken = signWebhookToken(channelId);
  } catch {
    return new NextResponse("Secret missing", { status: 500 });
  }
  if (token !== expectedToken) {
    return new NextResponse("Invalid token", { status: 401 });
  }

  // Initial sync-pinging — Google bekrefter at watch er aktiv
  if (resourceState === "sync") {
    return new NextResponse("OK", { status: 200 });
  }

  const sub = await prisma.googleCalendarSubscription.findFirst({
    where: { watchChannelId: channelId },
    select: { id: true },
  });
  if (!sub) {
    // Watch er ukjent — Google har trolig en gammel kanal i live. 200 så de slutter å resende.
    return new NextResponse("Subscription not found", { status: 200 });
  }

  // Speil + reflekter. syncSubscriptionEvents håndterer egne feil (skriver
  // lastError, nullstiller utgått token) og kaster ikke videre.
  const resultat = await syncSubscriptionEvents(sub.id);
  if (resultat.feil) {
    console.error(
      `[google-calendar/webhook] sub=${sub.id} speiling feilet: ${resultat.feil}`,
    );
    // 200 så Google ikke retrier evig — feilen er logget og cron rydder opp.
    return new NextResponse("Error logged", { status: 200 });
  }

  const refleksjon = await reflekterTilBookinger(
    resultat.endringer,
    "google-calendar-webhook",
  );

  if (
    resultat.lagret > 0 ||
    resultat.slettet > 0 ||
    refleksjon.kansellert > 0 ||
    refleksjon.flyttet > 0
  ) {
    console.info(
      `[google-calendar/webhook] sub=${sub.id} speilet=${resultat.lagret} fjernet=${resultat.slettet} bookingKansellert=${refleksjon.kansellert} bookingFlyttet=${refleksjon.flyttet}`,
    );
  }

  return new NextResponse("OK", { status: 200 });
}
