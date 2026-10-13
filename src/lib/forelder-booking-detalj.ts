import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnHvisTilhoerer } from "@/lib/forelder";
import { datoTekst, klokkeTekst } from "@/lib/email/booking-bekreftelse";

/** Ingen rå betalings-/Stripe-identifikatorer eller barnets notater til klienten. */
export async function hentForelderBookingDetalj(bookingId: string) {
  const viewer = await requirePortalUser({ allow: ["PARENT"] });
  if (!z.string().min(1).max(100).safeParse(bookingId).success) return null;
  const owner = await prisma.booking.findUnique({ where: { id: bookingId }, select: { userId: true } });
  if (!owner?.userId) return null;
  const barn = await hentBarnHvisTilhoerer(viewer.id, owner.userId);
  if (!barn) return null;
  const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId: barn.id }, select: {
    id: true, status: true, startAt: true, endAt: true, priceOre: true, subscriptionId: true,
    serviceType: { select: { name: true } }, location: { select: { name: true, address: true } },
    coach: { select: { name: true, email: true } }, payments: { select: { status: true }, orderBy: { createdAt: "desc" } },
  } });
  if (!booking) return null;
  const status = booking.status === "CONFIRMED" ? "Bekreftet" : booking.status === "CANCELLED" ? "Avbestilt" : booking.status === "COMPLETED" ? "Gjennomført" : "Venter på bekreftelse";
  const sisteAvklarteBetaling = booking.payments.find((p) => p.status === "SUCCEEDED" || p.status === "REFUNDED");
  const betaling = booking.subscriptionId ? "Abonnementsbooking" : sisteAvklarteBetaling?.status === "REFUNDED" ? "Refusjon registrert"
    : sisteAvklarteBetaling?.status === "SUCCEEDED" ? "Betaling bekreftet" : "Ingen betalingsbekreftelse registrert";
  return { id: booking.id, childId: barn.id, barnNavn: barn.name, tjeneste: booking.serviceType.name, status, betaling,
    dato: datoTekst(booking.startAt), tid: `${klokkeTekst(booking.startAt)}–${klokkeTekst(booking.endAt)}`,
    sted: booking.location.name, adresse: booking.location.address, coach: booking.coach?.name ?? null,
    pris: new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: booking.priceOre % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(booking.priceOre / 100),
    kontaktHref: booking.coach?.email ? `mailto:${booking.coach.email}?subject=${encodeURIComponent(`Booking ${booking.id}`)}` : "/kontakt" };
}
