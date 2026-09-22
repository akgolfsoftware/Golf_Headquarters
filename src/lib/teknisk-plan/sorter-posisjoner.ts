/**
 * Rekkefølge på P-posisjoner i planvisningen.
 *
 * Mellomposisjoner (P4.1 …) vises alltid samlet under sin hoved-P, uansett om
 * avansert modus er av. Gruppene sorteres hovedfokus først, deretter hoved-P-ens
 * sortOrder (coachens prioritet). Innen gruppen: P4.0, P4.1, … P4.9.
 * Navnet leses alltid fra fasitlista, ikke fra det som ble lagret da raden ble laget.
 */

import { hovedP, pNavn, sammenlignPNummer } from "@/components/teknisk-plan/constants";

type Pos = { pNummer: string; sortOrder: number; hovedfokus: boolean };

export function sorterPosisjoner<T extends Pos>(positions: readonly T[]): T[] {
  const grupper = new Map<string, T[]>();
  for (const p of positions) {
    const k = hovedP(p.pNummer);
    const g = grupper.get(k);
    if (g) g.push(p);
    else grupper.set(k, [p]);
  }
  const nokkel = (g: T[]) => {
    const hoved = g.find((p) => p.pNummer === hovedP(p.pNummer));
    return {
      hovedfokus: g.some((p) => p.hovedfokus),
      sortOrder: hoved ? hoved.sortOrder : Math.min(...g.map((p) => p.sortOrder)),
    };
  };
  return [...grupper.values()]
    .sort((a, b) => {
      const ka = nokkel(a);
      const kb = nokkel(b);
      if (ka.hovedfokus !== kb.hovedfokus) return ka.hovedfokus ? -1 : 1;
      return ka.sortOrder - kb.sortOrder;
    })
    .flatMap((g) => g.sort((a, b) => sammenlignPNummer(a.pNummer, b.pNummer)));
}

/** Visningsnavn fra fasit — lagret `navn` kan være utdatert (rettet 22.09.2026). */
export function medFasitNavn<T extends { pNummer: string }>(p: T): T & { navn: string } {
  return { ...p, navn: pNavn(p.pNummer) };
}
