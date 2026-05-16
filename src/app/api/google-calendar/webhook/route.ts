/**
 * Google Calendar Push Notifications webhook.
 *
 * Google sender en HTTP POST når noe endres i en kalender vi har satt opp
 * watch på. Vi gjør incremental sync via events.list med updatedMin og matcher
 * tilbake mot Booking via googleEventId. Endringer/sletting reflekteres i
 * Booking-tabellen — det er two-way sync.
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
import { audit } from "@/lib/audit";
import { getCalendarApi, signWebhookToken } from "@/lib/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  // Finn subscription
  const sub = await prisma.googleCalendarSubscription.findFirst({
    where: { watchChannelId: channelId },
    include: { connection: true },
  });
  if (!sub) {
    // Watch er ukjent — Google har trolig en gammel kanal i live. 200 så de slutter å resende.
    return new NextResponse("Subscription not found", { status: 200 });
  }

  // Best-effort incremental sync
  try {
    const calendar = getCalendarApi(sub.connection);
    const updatedMin =
      sub.lastSyncAt?.toISOString() ??
      new Date(Date.now() - 5 * 60_000).toISOString();

    const { data } = await calendar.events.list({
      calendarId: sub.googleCalendarId,
      updatedMin,
      showDeleted: true,
      singleEvents: true,
      maxResults: 100,
    });

    let endretBookinger = 0;
    let kanselerte = 0;

    for (const event of data.items ?? []) {
      if (!event.id) continue;

      const booking = await prisma.booking.findFirst({
        where: { googleEventId: event.id },
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          notes: true,
          userId: true,
        },
      });
      if (!booking) continue;

      if (event.status === "cancelled") {
        // Event slettet i Google → CANCEL booking (idempotent)
        if (booking.status !== "CANCELLED") {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: "CANCELLED",
              notes: `${booking.notes ?? ""}\n[Slettet via Google Calendar ${new Date().toISOString()}]`.trim(),
            },
          });
          await audit({
            actorId: null,
            action: "booking.cancelled.via-google-calendar",
            target: `Booking:${booking.id}`,
            metadata: {
              googleEventId: event.id,
              subscriptionId: sub.id,
            },
          });
          kanselerte++;
        }
      } else if (event.start?.dateTime && event.end?.dateTime) {
        // Event flyttet i Google → oppdater Booking hvis tid har endret seg
        const nyStart = new Date(event.start.dateTime);
        const nyEnd = new Date(event.end.dateTime);
        const tidEndret =
          nyStart.getTime() !== booking.startAt.getTime() ||
          nyEnd.getTime() !== booking.endAt.getTime();
        if (tidEndret) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              startAt: nyStart,
              endAt: nyEnd,
              notes: `${booking.notes ?? ""}\n[Flyttet via Google Calendar ${new Date().toISOString()}: ${booking.startAt.toISOString()} → ${nyStart.toISOString()}]`.trim(),
            },
          });
          await audit({
            actorId: null,
            action: "booking.rescheduled.via-google-calendar",
            target: `Booking:${booking.id}`,
            metadata: {
              googleEventId: event.id,
              subscriptionId: sub.id,
              fraStart: booking.startAt.toISOString(),
              tilStart: nyStart.toISOString(),
            },
          });
          endretBookinger++;
        }
      }
    }

    await prisma.googleCalendarSubscription.update({
      where: { id: sub.id },
      data: { lastSyncAt: new Date(), lastError: null },
    });

    if (endretBookinger > 0 || kanselerte > 0) {
      console.log(
        `[google-calendar/webhook] sub=${sub.id} endret=${endretBookinger} kansellert=${kanselerte}`,
      );
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    const melding = err instanceof Error ? err.message : "unknown";
    console.error(`[google-calendar/webhook] sub=${sub.id} feilet`, melding);
    await prisma.googleCalendarSubscription.update({
      where: { id: sub.id },
      data: { lastError: melding.slice(0, 500) },
    });
    // 200 så Google ikke retrier evig — vi har logget feilen
    return new NextResponse("Error logged", { status: 200 });
  }
}
