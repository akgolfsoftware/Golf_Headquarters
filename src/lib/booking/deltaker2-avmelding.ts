/**
 * Deltaker 2 melder seg av en duo-time fra e-postlenken. Fjerner bare deltaker 2
 * fra bookingen. Rører aldri status, betaling, Stripe eller klipp: den som
 * betalte beholder timen, og ingen refusjon utløses her.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { lesDeltaker2Lenke } from "@/lib/booking/deltaker2-lenke";

export type Deltaker2Oppslag =
  | { ok: true; booking: { id: string; startAt: Date; endAt: Date; tjeneste: string; sted: string; partnerNavn: string | null } }
  | { ok: false; grunn: "ugyldig" | "allerede" };

export async function hentDeltaker2Booking(token: string, naa: Date = new Date()): Promise<Deltaker2Oppslag> {
  const lenke = lesDeltaker2Lenke(token, naa);
  if (!lenke) return { ok: false, grunn: "ugyldig" };
  const b = await prisma.booking.findUnique({
    where: { id: lenke.bookingId },
    select: { id: true, startAt: true, endAt: true, status: true, partnerEmail: true, partnerName: true, serviceType: { select: { name: true } }, location: { select: { name: true } } },
  });
  if (!b || b.startAt.getTime() !== lenke.startAt.getTime()) return { ok: false, grunn: "ugyldig" };
  if (!b.partnerEmail) return { ok: false, grunn: "allerede" };
  return { ok: true, booking: { id: b.id, startAt: b.startAt, endAt: b.endAt, tjeneste: b.serviceType.name, sted: b.location.name, partnerNavn: b.partnerName } };
}

export async function deltaker2MeldAv(token: string, naa: Date = new Date()): Promise<{ ok: boolean; melding: string }> {
  const lenke = lesDeltaker2Lenke(token, naa);
  if (!lenke) return { ok: false, melding: "Lenken er ugyldig eller utløpt." };
  // Skriver bare partner-feltene, og bare mens tiden er den lenken ble laget for.
  const res = await prisma.booking.updateMany({
    where: { id: lenke.bookingId, startAt: lenke.startAt, status: { not: "CANCELLED" }, partnerEmail: { not: null } },
    data: { partnerName: null, partnerEmail: null },
  });
  if (res.count === 0) return { ok: false, melding: "Du er allerede meldt av, eller timen finnes ikke lenger." };
  await audit({ actorId: null, action: "booking.deltaker2.meldt-av", target: `Booking:${lenke.bookingId}`, metadata: {} }).catch(() => undefined);
  return { ok: true, melding: "Du er meldt av. Timen består for den som booket." };
}
