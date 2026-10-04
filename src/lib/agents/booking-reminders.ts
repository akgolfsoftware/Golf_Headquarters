/**
 * Booking reminder-agent.
 *
 * Sender 24-timers påminnelse til alle confirmed bookinger som starter
 * mellom 23 og 25 timer fra nå. Kjøres hver time via Vercel Cron.
 *
 * Sjekker sendeloggen før gjentakelse. Senderen bruker også en stabil
 * leverandørnøkkel for gjentatte forsøk på samme booking og tidspunkt.
 */

import { naivOsloTilTidspunkt, tilNaivVeggklokke } from "@/lib/google-calendar-tid";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { sendBookingReminder } from "@/lib/email/booking-emails";
import { logError } from "@/lib/error-tracking";
import { runAgent } from "./agent-runner";

const AGENT_NAME = "booking-reminders";

type BookingRemindersResultat = {
  candidates: number;
  sent: number;
  skipped: number;
  failed: number;
};

/** Logger kjøringen til AgentRun (maskinrommet) — logikken er uendret. */
export async function runBookingReminders(): Promise<BookingRemindersResultat> {
  let resultat!: BookingRemindersResultat;
  await runAgent(AGENT_NAME, null, async () => {
    resultat = await bookingRemindersKjerne();
    return { output: resultat };
  });
  return resultat;
}

async function bookingRemindersKjerne(): Promise<BookingRemindersResultat> {
  const now = new Date();
  const minStart = new Date(now.getTime() + 23 * 60 * 60_000);
  const maxStart = new Date(now.getTime() + 25 * 60 * 60_000);

  const candidates = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      startAt: { gte: tilNaivVeggklokke(minStart, "utc"), lte: tilNaivVeggklokke(maxStart, "utc") },
    },
    select: { id: true, startAt: true },
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const b of candidates) {
    // Naive lagringsfelt må sammenlignes som faktiske tidspunkt, også ved sommertidsskifte.
    try {
      const start = naivOsloTilTidspunkt(b.startAt, "utc");
      if (start < minStart || start > maxStart) { skipped++; continue; }
    } catch (error) {
      await logError({ context: "agents.bookingReminders.invalidTime", error, meta: { bookingId: b.id }, severity: "warn" });
      failed++;
      continue;
    }
    // Sjekk om vi allerede har sendt påminnelse via audit-log
    const tidligereSendt = await prisma.auditLog.findFirst({
      where: {
        action: "booking.reminder_sent",
        target: `Booking:${b.id}`,
      },
    });

    if (tidligereSendt) {
      skipped++;
      continue;
    }

    try {
      const sendt = await sendBookingReminder(b.id, now, b.startAt);
      if (!sendt) { skipped++; continue; }
      await audit({
        actorId: null,
        action: "booking.reminder_sent",
        target: `Booking:${b.id}`,
      });
      sent++;
    } catch (error) {
      await logError({
        context: "agents.bookingReminders.sending",
        error,
        meta: { bookingId: b.id },
        severity: "warn",
      });
      failed++;
    }
  }

  return { candidates: candidates.length, sent, skipped, failed };
}
