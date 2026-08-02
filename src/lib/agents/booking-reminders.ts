/**
 * Booking reminder-agent.
 *
 * Sender 24-timers påminnelse til alle confirmed bookinger som starter
 * mellom 23 og 25 timer fra nå. Kjøres hver time via Vercel Cron.
 *
 * Idempotent via metadata-felt på audit-log — sjekker om vi allerede
 * har sendt påminnelse for denne bookingen.
 */

import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { sendBookingReminder } from "@/lib/email/booking-emails";
import { logError } from "@/lib/error-tracking";

export async function runBookingReminders() {
  const now = new Date();
  const minStart = new Date(now.getTime() + 23 * 60 * 60_000);
  const maxStart = new Date(now.getTime() + 25 * 60 * 60_000);

  const candidates = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      startAt: { gte: minStart, lte: maxStart },
    },
    select: { id: true },
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const b of candidates) {
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
      await sendBookingReminder(b.id);
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
