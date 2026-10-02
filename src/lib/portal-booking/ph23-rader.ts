import type { HubBooking } from "@/lib/portal-booking/hub-data";
import type { PH23Rad } from "@/components/portal/precision/PH23Booking";
import { naivDatoKort, naivKlokke, isoDatoKort, isoKlokke, isoTilNaa, kr } from "@/lib/portal-booking/ph23-format";

const DOEGN = 24 * 3600_000;

/** Rad fra hub-data (ekte tidspunkt i ISO, vist i Oslo-tid). Flytting og avbestilling styres av 24-timersregelen. */
export function hubRad(b: HubBooking): PH23Rad {
  const til = isoTilNaa(b.startIso);
  const aktiv = b.status === "CONFIRMED" || b.status === "PENDING";
  return {
    id: b.id, tjeneste: b.serviceName, dato: isoDatoKort(b.startIso), kl: isoKlokke(b.startIso), varighetMin: b.durationMin,
    sted: b.locationName, coach: b.coachName, status: b.status, betaling: b.fromCredits ? "Klipp" : "Kort",
    kanBytte: aktiv && til > DOEGN, kanAvbestille: aktiv && til > 0, kanRefusjon: til > DOEGN,
    href: `/portal/booking/${b.id}`, byttHref: `/portal/meg/bookinger/reschedule/${b.id}`,
  };
}

type BookingInn = {
  id: string; startAt: Date; status: string; priceOre: number; subscriptionId: string | null;
  serviceType: { name: string; durationMin: number }; location: { name: string };
};

/** Rad fra Prisma-booking (naiv veggklokke, formateres i UTC). */
export function bookingRad(b: BookingInn, coach: string | null = null): PH23Rad {
  const til = b.startAt.getTime() - Date.now();
  const aktiv = b.status === "CONFIRMED" || b.status === "PENDING";
  return {
    id: b.id, tjeneste: b.serviceType.name, dato: naivDatoKort(b.startAt), kl: naivKlokke(b.startAt), varighetMin: b.serviceType.durationMin,
    sted: b.location.name, coach, status: b.status as PH23Rad["status"], betaling: b.subscriptionId ? "Klipp" : kr(b.priceOre),
    kanBytte: aktiv && til > DOEGN, kanAvbestille: aktiv && til > 0, kanRefusjon: til > DOEGN,
    href: `/portal/booking/${b.id}`, byttHref: `/portal/meg/bookinger/reschedule/${b.id}`,
  };
}
