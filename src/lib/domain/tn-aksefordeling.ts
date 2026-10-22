/**
 * Spillerens trening per akse (FYS · TEK · SLAG · SPILL · TURN) siste fire uker,
 * til pyramiden i Team Norway-IUP-en. Ren summering; lesingen skjer i
 * tn-arbeidsflate.ts innenfor delingslåsen (medTnSpillerData).
 *
 * «Gjennomført mot plan» er regnet som i PlayerHQ (`etterlevelse.ts`, beslutninger.md
 * §KARTLEGGINGSØKT FJERNES punkt 4): minutter, siste 28 dager, og bare økter som har passert
 * planlagt slutt. Fremtidige økter teller verken som plan eller som gjennomført.
 */
import { osloInstant } from "@/lib/jarvis/dagen";
import { SPILLER_SYNLIGE_STATUSER } from "@/lib/workbench/wb-map";
import { erForfaltEtterlevelseOkt, type EtterlevelseOkt } from "./etterlevelse";

export const TN_AKSE_NAVN = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type TnAksenavn = (typeof TN_AKSE_NAVN)[number];

/** `dato` er kalenderdagen (UTC-midnatt, @db.Date); `startMinutt` er minutter etter midnatt, Oslo-tid. */
export type TnAkseokt = { pyramid: string; durationMinutes: number; status: string; dato: Date; startMinutt: number };
export type TnAksefordeling = { gjennomfort: Record<TnAksenavn, number>; planlagtTimer: number; gjennomfortTimer: number };

/**
 * Øktene treneren får se i treningstall: samme utvalg som spilleren selv ser i Plan
 * (ingen utkast, ingen avlyste, ingen skjulte eller ventende forslag).
 */
export const TN_SYNLIG_OKT_WHERE = {
  status: { in: [...SPILLER_SYNLIGE_STATUSER] },
  hiddenByPlayer: false,
  needsPlayerApproval: false,
  OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }],
};

const timer = (min: number) => Math.round((min / 60) * 10) / 10;

/** Øktens startøyeblikk (Oslo), som PlayerHQ regner det for Workbench-økter. */
export function tnOktStart(o: { dato: Date; startMinutt: number }): Date {
  return osloInstant(o.dato.getUTCFullYear(), o.dato.getUTCMonth() + 1, o.dato.getUTCDate(), Math.floor(o.startMinutt / 60), o.startMinutt % 60);
}

/** Øktens form i PlayerHQs etterlevelsesregel. Statusstrengen leses bare mot COMPLETED og avviksstatusene. */
export function tnEtterlevelseOkt(o: { dato: Date; startMinutt: number; minutter: number; status: string }): EtterlevelseOkt {
  return { scheduledAt: tnOktStart(o), durationMin: o.minutter, status: o.status as EtterlevelseOkt["status"] };
}

/** Gjennomført = COMPLETED. Planlagt = alle økter som har passert slutt siste 28 dager. Ukjente akser telles ikke. */
export function summerAksefordeling(okter: readonly TnAkseokt[], naa: Date): TnAksefordeling {
  const min: Record<TnAksenavn, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  let planlagt = 0;
  let gjort = 0;
  for (const o of okter) {
    const akse = TN_AKSE_NAVN.find((a) => a === o.pyramid);
    if (!akse) continue;
    if (!erForfaltEtterlevelseOkt(tnEtterlevelseOkt({ ...o, minutter: o.durationMinutes }), naa)) continue;
    planlagt += o.durationMinutes;
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
