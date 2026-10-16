/**
 * Arvede perioder (PeriodBlock.sourceGroupId) følger gruppas periode når gruppa endres,
 * men bare så lenge spilleren ikke har tilpasset dem. «Egen» finnes ikke som felt i basen:
 * en arvet periode regnes som egen når den ikke lenger er lik gruppas verdier slik de var
 * før endringen. Egne perioder røres aldri (plannivåene, punkt 4).
 */
import { parseAxisMinutes } from "@/lib/workbench/perioder";

export type ArvbarePeriodeFelt = {
  lPhase: string;
  startDate: Date;
  endDate: Date;
  focus: string | null;
  weeklyVolMin: number | null;
  weeklyVolMax: number | null;
  weeklySessionBudget: unknown;
  axisMinutes: unknown;
  axisMinutesLight: unknown;
};

function jsonNokkel(v: unknown): string {
  if (v == null) return "";
  if (typeof v !== "object" || Array.isArray(v)) return JSON.stringify(v);
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o).sort();
  return keys.length === 0 ? "" : JSON.stringify(keys.map((k) => [k, o[k]]));
}

function aksenokkel(v: unknown): string {
  return jsonNokkel(parseAxisMinutes(v));
}

/** Sant når den arvede perioden fortsatt er identisk med gruppas gamle periode. */
export function erUendretArv(arv: ArvbarePeriodeFelt, gruppeFoerEndring: ArvbarePeriodeFelt): boolean {
  return (
    arv.lPhase === gruppeFoerEndring.lPhase &&
    arv.startDate.getTime() === gruppeFoerEndring.startDate.getTime() &&
    arv.endDate.getTime() === gruppeFoerEndring.endDate.getTime() &&
    (arv.focus ?? null) === (gruppeFoerEndring.focus ?? null) &&
    (arv.weeklyVolMin ?? null) === (gruppeFoerEndring.weeklyVolMin ?? null) &&
    (arv.weeklyVolMax ?? null) === (gruppeFoerEndring.weeklyVolMax ?? null) &&
    jsonNokkel(arv.weeklySessionBudget) === jsonNokkel(gruppeFoerEndring.weeklySessionBudget) &&
    aksenokkel(arv.axisMinutes) === aksenokkel(gruppeFoerEndring.axisMinutes) &&
    aksenokkel(arv.axisMinutesLight) === aksenokkel(gruppeFoerEndring.axisMinutesLight)
  );
}
