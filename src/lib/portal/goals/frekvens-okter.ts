/**
 * Felles leselag for SESSION_FREQUENCY. Tre øktmodeller holdes adskilt,
 * men et V2-speil av en planøkt telles bare én gang.
 */

export type FrekvensKildeOkt = {
  id: string;
  modell: "v2" | "wb" | "plan";
  fullfort: boolean;
  speilAvPlanId?: string | null;
};

export function unikFullforteFrekvensOkter(okter: FrekvensKildeOkt[]): number {
  const fullforte = okter.filter((o) => o.fullfort);
  const speiletPlan = new Set(
    fullforte
      .filter((o) => o.modell === "v2" && o.speilAvPlanId)
      .map((o) => o.speilAvPlanId as string),
  );
  const sett = new Set<string>();
  for (const o of fullforte) {
    if (o.modell === "plan" && speiletPlan.has(o.id)) continue;
    sett.add(`${o.modell}:${o.id}`);
  }
  return sett.size;
}
