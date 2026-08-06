/**
 * Varsel til coach/admin når det kommer en ny booking (2026-07-28).
 *
 * Før: Stripe-veien varslet ADMIN med «Ny booking bekreftet» + tidspunkt.
 * Abonnements-bookinger (credit) varslet bare spilleren — de gikk helt stille
 * forbi coachen. Manuelt opprettede økter varslet ingen.
 *
 * Nå går alle veier gjennom denne, med nok innhold til at meldingen kan leses
 * på telefonen uten å åpne appen: hvem, hva, når, hvor og hvordan betalt.
 */
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { logError } from "@/lib/error-tracking";

/** Hvordan bookingen kom inn — vises i varselet. */
export type BookingKilde =
  | "stripe"
  | "abonnement"
  | "gjest"
  | "manuell"
  | "caddie";

const KILDE_TEKST: Record<BookingKilde, string> = {
  stripe: "Betalt på nett",
  abonnement: "Trukket fra abonnement",
  gjest: "Gjestebooking",
  manuell: "Lagt inn manuelt",
  caddie: "Foreslått av Caddie",
};

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function kroner(ore: number): string {
  if (ore <= 0) return "0 kr";
  const hele = Math.round(ore / 100);
  return `${hele.toLocaleString("nb-NO")} kr`;
}

/**
 * Varsle coachen for tjenesten + alle ADMIN om en ny booking.
 * Best-effort: kaster aldri — en feilet varsling skal aldri velte bookingen.
 */
export async function varsleNyBooking(
  bookingId: string,
  kilde: BookingKilde,
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        startAt: true,
        priceOre: true,
        guestName: true,
        plassNr: true,
        user: { select: { name: true, email: true } },
        serviceType: {
          select: { name: true, coachUserId: true, maxDeltakere: true },
        },
        location: { select: { name: true } },
      },
    });
    if (!booking) return;

    const spiller =
      booking.user?.name ?? booking.guestName ?? booking.user?.email ?? "Gjest";
    const tid = OSLO_TID.format(booking.startAt);
    const delt =
      booking.serviceType.maxDeltakere > 1
        ? ` · plass ${booking.plassNr} av ${booking.serviceType.maxDeltakere}`
        : "";

    const tittel = `Ny booking: ${spiller}`;
    const tekst =
      `${booking.serviceType.name} · ${tid}\n` +
      `${booking.location.name} · ${kroner(booking.priceOre)} · ${KILDE_TEKST[kilde]}${delt}`;

    // Coachen for tjenesten + alle ADMIN. Set fjerner dobbeltvarsling når
    // Anders er begge deler.
    const mottakere = new Set<string>();
    if (booking.serviceType.coachUserId) {
      mottakere.add(booking.serviceType.coachUserId);
    }
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    for (const a of admins) mottakere.add(a.id);

    for (const userId of mottakere) {
      await notify({
        userId,
        type: "booking",
        title: tittel,
        body: tekst,
        link: `/admin/bookinger/${booking.id}`,
      });
    }
  } catch (error) {
    await logError({
      context: "booking.varsleNyBooking",
      error,
      meta: { bookingId, kilde },
      severity: "warn",
    });
  }
}
