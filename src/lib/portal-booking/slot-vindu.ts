/**
 * Slot-vindu for v2-booking-flyten (/v2-booking).
 *
 * Bygger et dag-for-dag vindu med EKTE ledige tider for én tjeneste, avledet av
 * availability-engine (src/lib/booking/availability.ts) — samme kilde som den
 * ekte /ny-wizarden. Ingen fabrikkerte tider: er en dag tom, utelates den.
 *
 * Brukes av server-siden (initielt vindu for default-tjenesten) og av
 * server-action-en som re-henter når spilleren bytter tjeneste (varighet
 * påvirker hvilke slots som får plass).
 */

import { getAvailableSlots } from "@/lib/booking/availability";

export type SlotTid = { kl: string; coachId: string; coachNavn: string };
export type SlotDag = { datoIso: string; tider: SlotTid[] };
export type SlotVindu = { tjenesteId: string; dager: SlotDag[] };

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** "HH:MM" fra slot-start (server-lokal tid — availability-engine setter Oslo-timer). */
function tilKl(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Beregn ledige tider for `tjenesteId` de neste `antallDager` dagene fra i dag.
 * Kjøres i uke-bolker (7 dager parallelt) for å holde antall samtidige
 * DB-koblinger nede. Dager uten ledige tider utelates.
 */
export async function beregnSlotVindu(
  tjenesteId: string,
  antallDager = 28,
): Promise<SlotVindu> {
  const iDag = startOfDay(new Date());
  const datoer: Date[] = Array.from({ length: antallDager }, (_, i) => {
    const d = new Date(iDag);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dager: SlotDag[] = [];
  for (let i = 0; i < datoer.length; i += 7) {
    const bolk = datoer.slice(i, i + 7);
    const resultater = await Promise.all(
      bolk.map(async (dato) => {
        const slots = await getAvailableSlots(tjenesteId, dato);
        // Dedup på klokkeslett (flere coacher kan tilby samme tid) — behold første.
        const sett = new Map<string, SlotTid>();
        for (const s of slots) {
          const kl = tilKl(s.start);
          if (!sett.has(kl)) sett.set(kl, { kl, coachId: s.coachId, coachNavn: s.coachName });
        }
        const tider = Array.from(sett.values());
        return tider.length > 0 ? { datoIso: dato.toISOString(), tider } : null;
      }),
    );
    for (const r of resultater) if (r) dager.push(r);
  }

  return { tjenesteId, dager };
}
