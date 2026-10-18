// Visningsmodellen for elevenes delte plan i WANG-trenerflaten (W1, nattkjøring 18.10.2026).
// Uten server-avhengigheter, så klienten kan bruke typene og testen kan bruke reglene.
//
// Treneren ser bare elever med gyldig plansamtykke (TRENINGSPLAN) mot AKKURAT denne
// WANG-gruppa. Under 16 år teller bare forelderens ja, og et trekk stopper delingen
// med en gang. Elever uten deling får «—», aldri et anslag.

import { harGyldigSamtykke, WANG_PLAN_SCOPE, type DelingSamtykkeRad } from "@/lib/deling/samtykke-regler";
import { etterlevelse, summerEtterlevelse, type EtterlevelseOkt } from "@/lib/domain/etterlevelse";

export type WangPlanAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export interface WangPlanOkt extends EtterlevelseOkt {
  akse: WangPlanAkse | null;
  /** Kopi av en økt WANG-gruppa la inn (morgentreningen). */
  fraGruppa: boolean;
}

export interface WangPlanGrunnlag {
  id: string;
  kreverForesatt: boolean;
  fodselsdato: Date | null;
  samtykkeRader: readonly DelingSamtykkeRad[];
  /** Øktene i elevens plan siste fire uker. Leses bare når planen er delt. */
  okter: readonly WangPlanOkt[];
}

export interface WangPlanTid {
  /** Prosent gjennomført mot planlagt, eller null når ingen planlagte minutter er forfalt. */
  pct: number | null;
  gjennomfortMin: number;
  planlagtMin: number;
}

export interface WangPlanElev {
  etterlevelse: WangPlanTid;
  morgen: WangPlanTid;
}

export interface WangPlanData {
  /** Elever som har delt planen med WANG-gruppa. */
  delerIder: string[];
  perElev: Record<string, WangPlanElev>;
  samlet: WangPlanTid;
  morgen: WangPlanTid;
  perAkse: Record<WangPlanAkse, WangPlanTid>;
}

const AKSER: WangPlanAkse[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const TOM_TID: WangPlanTid = { pct: null, gjennomfortMin: 0, planlagtMin: 0 };

export const TOM_PLANDATA: WangPlanData = {
  delerIder: [],
  perElev: {},
  samlet: TOM_TID,
  morgen: TOM_TID,
  perAkse: { FYS: TOM_TID, TEK: TOM_TID, SLAG: TOM_TID, SPILL: TOM_TID, TURN: TOM_TID },
};

/** Grensen for «Følger planen» (beslutninger §KARTLEGGINGSØKT FJERNES, utkast 2). */
export const PLAN_MAAL_PCT = 80;

const tid = (e: ReturnType<typeof etterlevelse>): WangPlanTid => ({
  pct: e.pct,
  gjennomfortMin: e.gjennomfortMinutter,
  planlagtMin: e.planlagtMinutter,
});

/** Gjennomført mot planlagt tid, fire uker, for elevene som har delt planen med `gruppeId`. */
export function byggWangPlanData(elever: readonly WangPlanGrunnlag[], gruppeId: string, now: Date): WangPlanData {
  const delte = elever.filter((e) =>
    harGyldigSamtykke(e.samtykkeRader, {
      scope: WANG_PLAN_SCOPE,
      mottakerGruppeId: gruppeId,
      kreverForesatt: e.kreverForesatt,
      fodselsdato: e.fodselsdato,
    }),
  );

  const perElev: Record<string, WangPlanElev> = {};
  const alle: ReturnType<typeof etterlevelse>[] = [];
  const morgenAlle: ReturnType<typeof etterlevelse>[] = [];
  const perAkseAlle = new Map<WangPlanAkse, ReturnType<typeof etterlevelse>[]>(AKSER.map((a) => [a, []]));

  for (const elev of delte) {
    const total = etterlevelse(elev.okter, now);
    const morgen = etterlevelse(elev.okter.filter((o) => o.fraGruppa), now);
    alle.push(total);
    morgenAlle.push(morgen);
    for (const akse of AKSER) perAkseAlle.get(akse)!.push(etterlevelse(elev.okter.filter((o) => o.akse === akse), now));
    perElev[elev.id] = { etterlevelse: tid(total), morgen: tid(morgen) };
  }

  return {
    delerIder: delte.map((e) => e.id),
    perElev,
    samlet: tid(summerEtterlevelse(alle)),
    morgen: tid(summerEtterlevelse(morgenAlle)),
    perAkse: Object.fromEntries(AKSER.map((a) => [a, tid(summerEtterlevelse(perAkseAlle.get(a)!))])) as Record<
      WangPlanAkse,
      WangPlanTid
    >,
  };
}

/** «85 %» eller «—». */
export function visPct(t: WangPlanTid | undefined): string {
  return t && t.pct !== null ? `${t.pct} %` : "—";
}

/** Trenger deg: under 80 % av planen, eller under 80 % på gruppas økter. Uten tall: ikke vurdert. */
export function trengerDeg(e: WangPlanElev): boolean {
  return (e.etterlevelse.pct !== null && e.etterlevelse.pct < PLAN_MAAL_PCT) ||
    (e.morgen.pct !== null && e.morgen.pct < PLAN_MAAL_PCT);
}
