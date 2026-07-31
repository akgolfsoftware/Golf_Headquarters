/**
 * Speil endringer fra Google videre til Booking-tabellen.
 *
 * Delt av cron (calendar-sync) og webhook — begge får endringslisten fra
 * google-calendar-mirror og kaller hit. Én implementasjon, én oppførsel.
 *
 * Sikkerhetsregel: kun bookinger appen selv har pushet (googleEventId satt)
 * berøres. En privat avtale i Google skal aldri kunne kansellere en booking.
 */
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import type { HendelsesEndring } from "@/lib/google-calendar-mirror";

export interface RefleksjonsResultat {
  kansellert: number;
  flyttet: number;
}

export async function reflekterTilBookinger(
  endringer: HendelsesEndring[],
  kilde: string,
): Promise<RefleksjonsResultat> {
  const resultat: RefleksjonsResultat = { kansellert: 0, flyttet: 0 };
  if (endringer.length === 0) return resultat;

  // Samme hendelse kan komme flere ganger (speilet i flere kalendere) —
  // siste melding vinner.
  const perEvent = new Map<string, HendelsesEndring>();
  for (const e of endringer) perEvent.set(e.googleEventId, e);

  const nå = new Date();

  for (const endring of perEvent.values()) {
    const booking = await prisma.booking.findFirst({
      where: { googleEventId: endring.googleEventId },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        notes: true,
      },
    });
    if (!booking) continue;

    if (endring.type === "slettet") {
      if (booking.status === "CANCELLED") continue;
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          notes: `${booking.notes ?? ""}\n[Kansellert via Google Calendar ${nå.toISOString()}]`.trim(),
        },
      });
      await audit({
        actorId: null,
        action: "booking.cancelled.via-google-calendar",
        target: `Booking:${booking.id}`,
        metadata: { googleEventId: endring.googleEventId, via: kilde },
      });
      resultat.kansellert++;
      continue;
    }

    // type === "endret": kun tidsendringer speiles tilbake til booking.
    if (!endring.startAt || !endring.endAt) continue;
    const tidEndret =
      endring.startAt.getTime() !== booking.startAt.getTime() ||
      endring.endAt.getTime() !== booking.endAt.getTime();
    if (!tidEndret) continue;

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        startAt: endring.startAt,
        endAt: endring.endAt,
        notes: `${booking.notes ?? ""}\n[Flyttet via Google Calendar ${nå.toISOString()}: ${booking.startAt.toISOString()} → ${endring.startAt.toISOString()}]`.trim(),
      },
    });
    await audit({
      actorId: null,
      action: "booking.rescheduled.via-google-calendar",
      target: `Booking:${booking.id}`,
      metadata: {
        googleEventId: endring.googleEventId,
        via: kilde,
        fraStart: booking.startAt.toISOString(),
        tilStart: endring.startAt.toISOString(),
      },
    });
    resultat.flyttet++;
  }

  return resultat;
}
