/**
 * Spillerens trening per akse (FYS · TEK · SLAG · SPILL · TURN) siste fire uker,
 * til pyramiden i Team Norway-IUP-en. Ren summering; lesingen skjer i
 * tn-arbeidsflate.ts innenfor delingslåsen (medTnSpillerData).
 */
export const TN_AKSE_NAVN = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type TnAksenavn = (typeof TN_AKSE_NAVN)[number];

export type TnAkseokt = { pyramid: string; durationMinutes: number; status: string };
export type TnAksefordeling = { gjennomfort: Record<TnAksenavn, number>; planlagtTimer: number; gjennomfortTimer: number };

const IKKE_PLANLAGT = new Set(["CANCELLED", "DRAFT"]);
const timer = (min: number) => Math.round((min / 60) * 10) / 10;

/** Gjennomført = COMPLETED. Planlagt = alt unntatt avlyst og utkast. Ukjente akser telles ikke. */
export function summerAksefordeling(okter: readonly TnAkseokt[]): TnAksefordeling {
  const min: Record<TnAksenavn, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  let planlagt = 0;
  let gjort = 0;
  for (const o of okter) {
    const akse = TN_AKSE_NAVN.find((a) => a === o.pyramid);
    if (!akse) continue;
    if (!IKKE_PLANLAGT.has(o.status)) planlagt += o.durationMinutes;
    if (o.status === "COMPLETED") {
      min[akse] += o.durationMinutes;
      gjort += o.durationMinutes;
    }
  }
  return {
    gjennomfort: { FYS: timer(min.FYS), TEK: timer(min.TEK), SLAG: timer(min.SLAG), SPILL: timer(min.SPILL), TURN: timer(min.TURN) },
    planlagtTimer: timer(planlagt),
    gjennomfortTimer: timer(gjort),
  };
}
