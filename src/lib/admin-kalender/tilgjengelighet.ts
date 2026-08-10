/**
 * Tilgjengelig coachtid per dag — nevneren i beleggsbrøken (PP-2.4 steg 2).
 *
 * Fasiten (`agencyos-kalender.html`) har ikke noe tilgjengelighetsbegrep og
 * bruker hele tidsaksen som nevner: «tilgjengelig = 18 timer minus sperret egen
 * tid». Appen har `CoachAvailability` — coachens faktisk bookbare vindu — som er
 * et sannere tall enn å anta 18-timers arbeidsdag. Finnes det vinduer, brukes de
 * (`grunnlag: "tilgjengelighet"`); finnes de ikke, faller vi tilbake til
 * fasitens tidsakse (`grunnlag: "tidsakse"`) og sier det i UI-et.
 *
 * Server-only (Prisma). Selve regnestykket bor i
 * `src/lib/domain/kalender-belegg.ts` — dette laget henter bare data og gjør
 * intervall-matten som trengs for å summere vinduer.
 *
 * Utvelgelsen speiler `getAvailableSlots` (src/lib/booking/availability.ts):
 * aktive vinduer, ukentlig weekday ELLER én-gangs dato, periode-gyldighet, og
 * «hver Nte uke»-repetisjon ankret til validFrom. Holdes de to i utakt, vil
 * belegget si noe annet enn bookingflaten — derfor står regelen skrevet begge
 * steder, ikke bare her.
 */

import { prisma } from "@/lib/prisma";
import { GRID_END_MIN, GRID_START_MIN } from "@/lib/calendar/notion-grid";
import { ukenummer } from "@/lib/uke-helpers";
import type { Grunnlag } from "@/lib/domain/kalender-belegg";

/** Hele tidsaksen i minutter — fasitens fallback-nevner. */
const TIDSAKSE_MIN = GRID_END_MIN - GRID_START_MIN;

/** "08:00" → 480. Ugyldig verdi gir null (raden hoppes over, aldri gjettet). */
function parseKlokke(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const t = Number(m[1]);
  const min = Number(m[2]);
  if (t > 23 || min > 59) return null;
  return t * 60 + min;
}

/** Summen av en coachs vinduer for én dag, uten å telle overlapp to ganger. */
function slaSammen(vinduer: Array<[number, number]>): number {
  if (vinduer.length === 0) return 0;
  const sortert = [...vinduer].sort((a, b) => a[0] - b[0]);
  let sum = 0;
  let [fra, til] = sortert[0];
  for (let i = 1; i < sortert.length; i++) {
    const [s, e] = sortert[i];
    if (s <= til) {
      til = Math.max(til, e);
    } else {
      sum += til - fra;
      fra = s;
      til = e;
    }
  }
  return sum + (til - fra);
}

export type Tilgjengelighet = {
  /** Tilgjengelige minutter per ukedag for ALLE coacher, index 0 = mandag. */
  basisPerDag: number[];
  /**
   * Samme, brutt ned per coach. Coach-filteret i kalenderen er en klient-side
   * filtrering, så nevneren må kunne velges der uten en ny rundtur: filtrerer du
   * til én coach, skal belegget måles mot DEN coachens vindu, ikke lagets.
   */
  basisPerCoach: Record<string, number[]>;
  grunnlag: Grunnlag;
  /** Antall coacher som faktisk har vinduer denne uka (0 ved fallback). */
  antallCoacher: number;
};

/**
 * Tilgjengelig coachtid for hver dag i uka som starter `ukeStart` (mandag 00:00,
 * Oslo-lokal — kalleren har allerede normalisert).
 *
 * `coachIds = null` betyr «alle coacher» (admin-visning): da summeres kapasiteten
 * på tvers, slik at belegget leses som lagets kapasitet. Er filteret satt til én
 * coach, er nevneren den coachens vindu alene.
 */
export async function hentTilgjengelighet(
  ukeStart: Date,
  coachIds: string[] | null,
): Promise<Tilgjengelighet> {
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const vinduer = await prisma.coachAvailability.findMany({
    where: {
      active: true,
      ...(coachIds && coachIds.length > 0 ? { coachId: { in: coachIds } } : {}),
      AND: [
        { OR: [{ validFrom: null }, { validFrom: { lt: ukeSlutt } }] },
        { OR: [{ validTo: null }, { validTo: { gte: ukeStart } }] },
      ],
    },
    select: {
      coachId: true,
      weekday: true,
      date: true,
      startTime: true,
      endTime: true,
      validFrom: true,
      recurrenceInterval: true,
    },
  });

  // Per dag: per coach: liste av [fra, til] klemt til tidsaksen.
  const perDag: Array<Map<string, Array<[number, number]>>> = Array.from(
    { length: 7 },
    () => new Map(),
  );
  const coacherMedVindu = new Set<string>();

  for (let i = 0; i < 7; i++) {
    const dato = new Date(ukeStart);
    dato.setDate(dato.getDate() + i);
    const ukeIdag = ukenummer(dato);

    for (const v of vinduer) {
      // NÅR: ukentlig på denne ukedagen, eller én-gangs på denne datoen.
      const erUkentlig = v.weekday === i;
      const erDenneDatoen =
        v.date != null &&
        v.date.getFullYear() === dato.getFullYear() &&
        v.date.getMonth() === dato.getMonth() &&
        v.date.getDate() === dato.getDate();
      if (!erUkentlig && !erDenneDatoen) continue;

      // Periode-gyldighet på dagsnivå (uke-spørringen er grovere).
      if (v.validFrom && v.validFrom > dato) continue;

      // «Hver Nte uke», ankret til validFrom. Gjelder kun ukentlige vinduer.
      if (erUkentlig && v.recurrenceInterval && v.recurrenceInterval > 1) {
        const ankerUke = ukenummer(v.validFrom ?? new Date(0));
        const n = v.recurrenceInterval;
        if (((((ukeIdag - ankerUke) % n) + n) % n) !== 0) continue;
      }

      const fra = parseKlokke(v.startTime);
      const til = parseKlokke(v.endTime);
      if (fra == null || til == null || til <= fra) continue;

      // Klem til tidsaksen: kapasitet utenfor grid vises ikke, og skal derfor
      // ikke telle i en prosent som leses av det man ser.
      const klemtFra = Math.max(fra, GRID_START_MIN);
      const klemtTil = Math.min(til, GRID_END_MIN);
      if (klemtTil <= klemtFra) continue;

      const liste = perDag[i].get(v.coachId) ?? [];
      liste.push([klemtFra, klemtTil]);
      perDag[i].set(v.coachId, liste);
      coacherMedVindu.add(v.coachId);
    }
  }

  if (coacherMedVindu.size === 0) {
    // Ingen registrert tilgjengelighet — fasitens grunnlag. Nevneren blir hele
    // tidsaksen for ÉN coach; å gange opp med antall coacher ville antatt at
    // alle jobber hele aksen hver dag.
    return {
      basisPerDag: Array.from({ length: 7 }, () => TIDSAKSE_MIN),
      basisPerCoach: {},
      grunnlag: "tidsakse",
      antallCoacher: 0,
    };
  }

  const basisPerCoach: Record<string, number[]> = {};
  for (const coachId of coacherMedVindu) {
    basisPerCoach[coachId] = perDag.map((perCoach) => slaSammen(perCoach.get(coachId) ?? []));
  }

  return {
    basisPerDag: perDag.map((perCoach) =>
      Array.from(perCoach.values()).reduce((sum, v) => sum + slaSammen(v), 0),
    ),
    basisPerCoach,
    grunnlag: "tilgjengelighet",
    antallCoacher: coacherMedVindu.size,
  };
}
