/**
 * Live-økt for WorkbenchSession (krav 2, 09.10.2026) — rene hjelpere.
 *
 * Kopierer det analysen trenger fra øvelsens AK-formel inn i loggraden:
 * motorikk, område, sted og avstand. Mangler en verdi, blir den null —
 * aldri en gjetning (parseAkFormel sin reserve-formel brukes derfor ikke).
 */

import { AkFormelLeseSchema } from "@/lib/domain/workbench/schemas";
import { STED_HOVED_LABEL } from "@/lib/domain/workbench/ovelse-detaljer";
import type { Belastning, RepHastighet } from "@/generated/prisma/client";

export type WbOvelseSnapshot = {
  motorikk: string | null;
  omraade: string | null;
  sted: string | null;
  avstand: string | null;
  belastning: Belastning | null;
};

/** Avstand finnes bare for områder som er et avstandsbånd. */
const AVSTAND: Record<string, string> = {
  INNSPILL_200: "200 m og lengre",
  INNSPILL_150: "150–200 m",
  INNSPILL_100: "100–150 m",
  INNSPILL_50: "50–100 m",
  PUTT_0_3: "0–3 fot",
  PUTT_3_5: "3–5 fot",
  PUTT_5_10: "5–10 fot",
  PUTT_10_25: "10–25 fot",
  PUTT_25_40: "25–40 fot",
  PUTT_40_PLUSS: "40+ fot",
};

/** Workbench-formelen staver TRENINGSOMRADE; Prisma-enumen TRENINGSOMRAADE. */
const BELASTNING: Record<string, Belastning> = {
  INNENDORS: "INNENDORS",
  TRENINGSOMRADE: "TRENINGSOMRAADE",
  BANE: "BANE",
  KONKURRANSE: "KONKURRANSE",
};

export function ovelseSnapshot(akFormel: unknown): WbOvelseSnapshot {
  const parsed = AkFormelLeseSchema.safeParse(akFormel);
  if (!parsed.success) return { motorikk: null, omraade: null, sted: null, avstand: null, belastning: null };
  const f = parsed.data;
  const sted = f.detaljer?.sted
    ? [STED_HOVED_LABEL[f.detaljer.sted.hoved], f.detaljer.sted.delvalg].filter(Boolean).join(" · ")
    : null;
  return {
    motorikk: f.motorikk ?? null,
    omraade: f.area,
    sted,
    avstand: AVSTAND[f.area] ?? null,
    belastning: f.belastning ? (BELASTNING[f.belastning] ?? null) : null,
  };
}

/** Motorikk → hastighetssporet i teknisk plan. Ukjent motorikk teller ikke. */
export function hastighetForMotorikk(motorikk: string | null): RepHastighet | null {
  if (motorikk === "UTEN_BALL") return "DRY";
  if (motorikk === "LAV_HAST") return "LAV";
  if (motorikk === "AUTO") return "FULL";
  return null;
}

/** Planlagt mengde for øvelsen, eller null når planen ikke sier det. */
export function planlagtMengde(drill: {
  repAntall: number | null;
  repSett: number | null;
  repReps: number | null;
  akFormel: unknown;
}): number | null {
  if (drill.repAntall != null && drill.repAntall > 0) return drill.repAntall;
  if (drill.repSett != null && drill.repReps != null && drill.repSett * drill.repReps > 0) return drill.repSett * drill.repReps;
  const parsed = AkFormelLeseSchema.safeParse(drill.akFormel);
  const antall = parsed.success ? parsed.data.detaljer?.mengde?.antall : undefined;
  return antall != null && antall > 0 ? antall : null;
}
