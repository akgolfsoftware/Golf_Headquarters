import "server-only";
import { prisma } from "@/lib/prisma";
import { tilbakeforGavekort } from "@/lib/booking/gavekort";

/**
 * Fører gavekortbeløpet for en avlyst booking tilbake til kortet (egen transaksjon). For
 * steder der avlysningen ikke allerede ligger i en transaksjon. Trygt å kalle flere ganger.
 * Feil logges, aldri kastes: avlysningen er alt gjort, og en hånd kan føre tilbake etterpå.
 */
export async function tilbakeforGavekortForBooking(bookingId: string): Promise<number> {
  try {
    return await prisma.$transaction((tx) => tilbakeforGavekort(tx, bookingId));
  } catch (error) {
    const { logError } = await import("@/lib/error-tracking");
    await logError({ context: "gavekort.tilbakefor", error, meta: { bookingId } }).catch(() => undefined);
    return 0;
  }
}
