import { lesTurneringsresultat, type OffentligResultat } from "./turneringsresultat";

/**
 * TN-16 Rangliste: starter, snittplassering og brutto snitt per spiller.
 * Brutto snitt er ekte slag per runde, ikke snitt av turneringstotaler —
 * ellers veier en tre-runders turnering tre ganger så tungt som en én-runders.
 * Plassering i nettoklasser telles ikke (felles resultatleser).
 */

export type TnRanglisteTall = { starter: number; runder: number; snittplassering: number | null; bruttoSnitt: number | null };

export function aggregerRangliste(entries: OffentligResultat[]): TnRanglisteTall {
  let starter = 0;
  let plassSum = 0;
  let plasser = 0;
  let slag = 0;
  let runder = 0;
  for (const entry of entries) {
    if (entry.status === "REGISTERED") continue;
    starter += 1;
    const r = lesTurneringsresultat(entry);
    if (r.plassering !== null) { plassSum += r.plassering; plasser += 1; }
    for (const runde of r.runder) {
      if (runde.brutto === null || runde.fullfort === false) continue;
      slag += runde.brutto;
      runder += 1;
    }
  }
  return { starter, runder, snittplassering: plasser ? plassSum / plasser : null, bruttoSnitt: runder ? slag / runder : null };
}

export type TnRanglisteSortering = "brutto" | "plass" | "starter";

/** Spillere uten tall står alltid nederst, uansett sortering. */
export function sorterRangliste<T extends TnRanglisteTall & { navn: string }>(rader: T[], sortering: TnRanglisteSortering): T[] {
  const verdi = (r: T) => (sortering === "brutto" ? r.bruttoSnitt : sortering === "plass" ? r.snittplassering : r.starter ? -r.starter : null);
  return [...rader].sort((a, b) => {
    const va = verdi(a);
    const vb = verdi(b);
    if (va === null && vb === null) return a.navn.localeCompare(b.navn, "nb");
    if (va === null) return 1;
    if (vb === null) return -1;
    return va - vb || a.navn.localeCompare(b.navn, "nb");
  });
}
