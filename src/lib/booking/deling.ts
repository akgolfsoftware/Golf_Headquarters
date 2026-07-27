/**
 * Delte økter — flere spillere i samme luke hos samme coach (steg 5, 2026-07-28).
 *
 * Bakgrunn: Anders kjører fast «2-til-1» hver onsdag — tre 90-minutters slots
 * (15:00, 16:30, 18:00) med to spillere i hver. Kollisjonsvernet behandlet all
 * overlapp hos samme coach som dobbeltbooking, så disse øktene var umulige å
 * legge inn i AgencyOS.
 *
 * Regelen som gjelder nå: en tjeneste kan ha maxDeltakere > 1. Da er overlapp
 * lov — men KUN når det er nøyaktig samme tjeneste i nøyaktig samme tidsrom.
 * Alt annet er ekte kollisjon. Det hindrer at en 50-minutters time smyger seg
 * inn i en 90-minutters parøkt.
 *
 * Ren logikk uten Prisma-import, så den kan enhetstestes isolert.
 */

export interface OverlappendeBooking {
  serviceTypeId: string;
  startAt: Date;
  endAt: Date;
}

export type DelingsVurdering =
  | { utfall: "ledig" }
  | { utfall: "kollisjon" }
  | { utfall: "fullt"; antall: number; kapasitet: number };

/**
 * Avgjør om en ny booking kan legges inn gitt hva som allerede overlapper.
 *
 * @param overlappende Bookinger hos samme coach som overlapper i tid
 *                     (avlyste skal være filtrert bort av kalleren).
 * @param kapasitet    maxDeltakere fra tjenesten. 1 = ingen deling.
 */
export function vurderDeling(
  overlappende: OverlappendeBooking[],
  ny: { serviceTypeId: string; startAt: Date; endAt: Date },
  kapasitet: number,
): DelingsVurdering {
  if (overlappende.length === 0) return { utfall: "ledig" };

  // Kapasitet 1 (eller ugyldig verdi): all overlapp er kollisjon — som før.
  const tak = Math.max(1, Math.floor(kapasitet));
  if (tak === 1) return { utfall: "kollisjon" };

  // Delbar tjeneste: alt som overlapper må være NØYAKTIG samme økt —
  // samme tjeneste, samme start, samme slutt. Ellers er det en ekte kollisjon.
  const fremmed = overlappende.some(
    (b) =>
      b.serviceTypeId !== ny.serviceTypeId ||
      b.startAt.getTime() !== ny.startAt.getTime() ||
      b.endAt.getTime() !== ny.endAt.getTime(),
  );
  if (fremmed) return { utfall: "kollisjon" };

  if (overlappende.length >= tak) {
    return { utfall: "fullt", antall: overlappende.length, kapasitet: tak };
  }
  return { utfall: "ledig" };
}
