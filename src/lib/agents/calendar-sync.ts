// calendar-sync: cron hvert 15. minutt. Sørger for at App ↔ Google Calendar
// alltid er i sync — uavhengig av om webhook-melding ble mottatt eller om en
// push feilet ved booking-bekreftelse.
//
// Pull (Google → App): henter events oppdatert siden sist sync per aktiv
//   pull-subscription og reflekterer kansellering/tidsendring tilbake.
// Push (App → Google): finner CONFIRMED bookinger uten googleEventId og
//   pusher dem til push-kalenderne (reparerer missede push-forsøk).

import { prisma } from "@/lib/prisma";
import { getCalendarApi, pushBookingToCalendar } from "@/lib/google-calendar";
import { audit } from "@/lib/audit";
import { runAgent } from "./agent-runner";
import type { AgentResult } from "./agent-runner";

export const AGENT_NAME = "calendar-sync";

export async function runCalendarSync(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // ─── Pull: Google → App ─────────────────────────────────────────────────
    const subs = await prisma.googleCalendarSubscription.findMany({
      where: { syncPull: true, active: true },
      include: { connection: true },
    });

    let pullSynced = 0;
    let pullFailed = 0;

    for (const sub of subs) {
      try {
        const calendar = getCalendarApi(sub.connection);
        // 2-minutters overlap mot lastSyncAt for å unngå å miste events i kantene.
        const updatedMin = sub.lastSyncAt
          ? new Date(sub.lastSyncAt.getTime() - 2 * 60_000).toISOString()
          : new Date(Date.now() - 20 * 60_000).toISOString();

        const { data } = await calendar.events.list({
          calendarId: sub.googleCalendarId,
          updatedMin,
          showDeleted: true,
          singleEvents: true,
          maxResults: 250,
        });

        const nå = new Date();

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
            },
          });
          if (!booking) continue;

          if (event.status === "cancelled") {
            if (booking.status !== "CANCELLED") {
              await prisma.booking.update({
                where: { id: booking.id },
                data: {
                  status: "CANCELLED",
                  notes: `${booking.notes ?? ""}\n[Kansellert via Google Calendar sync ${nå.toISOString()}]`.trim(),
                },
              });
              await audit({
                actorId: null,
                action: "booking.cancelled.via-google-calendar",
                target: `Booking:${booking.id}`,
                metadata: {
                  googleEventId: event.id,
                  subscriptionId: sub.id,
                  via: "calendar-sync-cron",
                },
              });
              pullSynced++;
            }
          } else if (event.start?.dateTime && event.end?.dateTime) {
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
                  notes: `${booking.notes ?? ""}\n[Flyttet via Google Calendar sync ${nå.toISOString()}: ${booking.startAt.toISOString()} → ${nyStart.toISOString()}]`.trim(),
                },
              });
              await audit({
                actorId: null,
                action: "booking.rescheduled.via-google-calendar",
                target: `Booking:${booking.id}`,
                metadata: {
                  googleEventId: event.id,
                  subscriptionId: sub.id,
                  via: "calendar-sync-cron",
                  fraStart: booking.startAt.toISOString(),
                  tilStart: nyStart.toISOString(),
                },
              });
              pullSynced++;
            }
          }
        }

        await prisma.googleCalendarSubscription.update({
          where: { id: sub.id },
          data: { lastSyncAt: new Date(), lastError: null },
        });
      } catch (err) {
        pullFailed++;
        const melding = (err instanceof Error ? err.message : "unknown").slice(0, 500);
        console.error(`[calendar-sync] pull feilet for sub=${sub.id}`, melding);
        await prisma.googleCalendarSubscription.update({
          where: { id: sub.id },
          data: { lastError: melding },
        });
      }
    }

    // ─── Push: App → Google (repair missede push-forsøk) ────────────────────
    const nå = new Date();
    const bookingsUtenEvent = await prisma.booking.findMany({
      where: {
        googleEventId: null,
        status: "CONFIRMED",
        startAt: { gt: nå },
      },
      select: { id: true },
      take: 50,
    });

    let pushSynced = 0;
    let pushFailed = 0;

    for (const b of bookingsUtenEvent) {
      try {
        const eventId = await pushBookingToCalendar(b.id);
        if (eventId) pushSynced++;
        else pushFailed++;
      } catch (err) {
        pushFailed++;
        console.error(
          `[calendar-sync] push feilet for booking=${b.id}`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    return {
      output: {
        pull: {
          subscriptions: subs.length,
          synced: pullSynced,
          failed: pullFailed,
        },
        push: {
          candidates: bookingsUtenEvent.length,
          synced: pushSynced,
          failed: pushFailed,
        },
      },
    };
  });
}
