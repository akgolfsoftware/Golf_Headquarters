/**
 * Slagvalg fra tee per hull, regnet fra spillerens egne registrerte slag (PH-20).
 * Ren funksjon uten database. Bunker og vann finnes ikke i banedata, så de
 * inngår ikke i anbefalingen; den bygger bare på lengde (tee til hvilested), spredning og hullets lengde.
 */
import { haversine, projectToAimFrame } from "./dispersion";
import type { LatLng } from "./shot-coords";

export type TeeSlag = { klubb: string | null; landing: LatLng };

export type KlubbValg = {
  klubb: string;
  n: number;
  /** Snitt lengde i meter: avstand tee til der ballen ble liggende (total, ikke carry). Feltnavnet er historisk. */
  carry: number;
  /** To standardavvik sideveis, meter. Null under 3 slag. */
  sideSpredning: number | null;
  /** To standardavvik i lengderetning, meter. Null under 3 slag. */
  lengdeSpredning: number | null;
  /** Snitt sideavvik fra siktelinjen (+ høyre), meter. */
  sideSnitt: number;
  /** Meter igjen til green etter snitt carry (0 om ballen er på green eller forbi). */
  igjen: number;
};

/** Minst så mange slag før spredning og anbefaling regnes. */
export const MIN_SLAG = 3;

const std = (v: number[]) => {
  const m = v.reduce((s, x) => s + x, 0) / v.length;
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length);
};
const snitt = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;

export function klubbValg(slag: readonly TeeSlag[], tee: LatLng, green: LatLng, lengde: number): KlubbValg[] {
  const perKlubb = new Map<string, LatLng[]>();
  for (const s of slag) {
    const k = s.klubb?.trim();
    if (!k) continue;
    perKlubb.set(k, [...(perKlubb.get(k) ?? []), s.landing]);
  }
  return [...perKlubb.entries()]
    .map(([klubb, punkter]) => {
      const carry = snitt(punkter.map((p) => haversine(tee, p)));
      const ramme = punkter.map((p) => projectToAimFrame(p, tee, green));
      const nok = punkter.length >= MIN_SLAG;
      return {
        klubb,
        n: punkter.length,
        carry,
        sideSpredning: nok ? 2 * std(ramme.map((r) => r.lateral)) : null,
        lengdeSpredning: nok ? 2 * std(ramme.map((r) => r.distance)) : null,
        sideSnitt: snitt(ramme.map((r) => r.lateral)),
        igjen: Math.max(0, lengde - carry),
      };
    })
    .sort((a, b) => b.carry - a.carry);
}

/**
 * Anbefalt kølle: par 3 nærmest hullets lengde, par 4 og 5 den som gir best
 * innspill (ca. 120 m igjen på par 4, 230 m på par 5), skjevt mot smal spredning.
 * Bare køller med minst MIN_SLAG slag er med. Ingen kandidat gir null.
 */
export function anbefalt(valg: readonly KlubbValg[], par: number | null, lengde: number): string | null {
  const kandidater = valg.filter((v) => v.n >= MIN_SLAG);
  if (!kandidater.length) return null;
  const maal = par === 5 ? 230 : 120;
  const poeng = (v: KlubbValg) => {
    const avvik = par === 3 ? Math.abs(lengde - v.carry) : Math.abs(v.igjen - maal) / 4;
    return avvik + (v.sideSpredning ?? 0);
  };
  return kandidater.reduce((a, b) => (poeng(b) < poeng(a) ? b : a)).klubb;
}
