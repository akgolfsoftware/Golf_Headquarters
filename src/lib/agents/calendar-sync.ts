// calendar-sync: cron hvert 15. minutt. Sørger for at App ↔ Google Calendar
// alltid er i sync — uavhengig av om webhook-melding ble mottatt eller om en
// push feilet ved booking-bekreftelse.
//
// Pull (Google → App): speiler alle aktive pull-kalendere via
//   google-calendar-mirror (syncToken + paginering), og reflekterer
//   kansellering/tidsendring videre til Booking.
// Push (App → Google): finner CONFIRMED bookinger uten googleEventId og
//   pusher dem til push-kalenderne (reparerer missede push-forsøk).
//
// Endret 2026-07-27 (steg 1): pull gikk tidligere på updatedMin-vinduer uten
// paginering og med hardt maxResults-kutt — endringer kunne gå tapt ved mange
// samtidige oppdateringer. Nå er speilingen kilden, og den bruker Googles
// inkrementelle syncToken som garanterer at ingenting hoppes over.

import { prisma } from "@/lib/prisma";
import { pushBooking } from "@/lib/google-calendar-kilder";
import {
  syncSubscriptionEvents,
  type HendelsesEndring,
} from "@/lib/google-calendar-mirror";
import { reflekterTilBookinger } from "@/lib/google-calendar-reflect";
import { runAgent } from "./agent-runner";
import type { AgentResult } from "./agent-runner";

export const AGENT_NAME = "calendar-sync";

export async function runCalendarSync(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // ─── Pull: Google → speil → Booking ─────────────────────────────────────
    // Speiler kalendere som skal VISES. syncPull styrer booking-blokkering
    // (freebusy) og er en separat bryter — se google-calendar-mirror.
    const subs = await prisma.googleCalendarSubscription.findMany({
      where: { visIKalender: true, active: true },
      select: { id: true },
    });

    let speiletLagret = 0;
    let speiletSlettet = 0;
    let pullFailed = 0;
    const alleEndringer: HendelsesEndring[] = [];

    for (const sub of subs) {
      const res = await syncSubscriptionEvents(sub.id);
      if (res.feil) {
        pullFailed++;
        continue;
      }
      speiletLagret += res.lagret;
      speiletSlettet += res.slettet;
      alleEndringer.push(...res.endringer);
    }

    const refleksjon = await reflekterTilBookinger(
      alleEndringer,
      "calendar-sync-cron",
    );

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
        const eventId = await pushBooking(b.id);
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
          speiletLagret,
          speiletSlettet,
          bookingerKansellert: refleksjon.kansellert,
          bookingerFlyttet: refleksjon.flyttet,
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
