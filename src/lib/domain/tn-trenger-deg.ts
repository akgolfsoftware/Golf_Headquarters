/**
 * «Trenger deg» og gruppas trening på Team Norway-oversikten (utkast 2, 16.10.2026).
 * Ren regel uten database; lesingen skjer i tn-arbeidsflate.ts innenfor delingslåsen.
 *
 * Regelen er AgencyOS-regelen (Cockpit «Følger ikke planen»): under 70 % av planen
 * to uker på rad, regnet som gjennomførte mot planlagte minutter i hver av de to
 * siste hele ukene. Uker uten planlagte minutter teller ikke. Utkast (DRAFT) er
 * ikke plan. Økter er WorkbenchSession, der `dato` er kalenderdagen lagret som
 * UTC-midnatt (@db.Date).
 */
import { UTENFOR_PLAN_TERSKEL } from "@/lib/agencyos/cockpit-tillegg-regler";
import { TN_AKSE_NAVN, type TnAksenavn } from "./tn-aksefordeling";

export { UTENFOR_PLAN_TERSKEL };

const DAG_MS = 86_400_000;

export type TnTreningsokt = { dato: Date; minutter: number; status: string; pyramid: string };
export type TnUkeTall = { planlagtMin: number; gjortMin: number; pct: number | null };
export type TnSpillerTrening = {
  /** Uka før forrige og forrige uke. */
  uker: [TnUkeTall, TnUkeTall];
  /** De to ukene samlet. */
  toUker: TnUkeTall;
  /** Aksen med flest gjennomførte minutter de to ukene. Null uten gjennomført tid. */
  mestAkse: TnAksenavn | null;
  /** Under terskelen begge ukene. */
  underPlan: boolean;
  /** De fire siste hele ukene: gjennomførte minutter per akse og totalt. */
  fireUker: { akseMin: Record<TnAksenavn, number>; planlagtMin: number; gjortMin: number };
};

const osloDeler = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });

/** Mandag i inneværende uke (Oslo), som UTC-midnatt i ms — samme form som WorkbenchSession.date. */
export function tnDenneMandag(naa: Date): number {
  const [aar, maned, dag] = osloDeler.format(naa).split("-").map(Number);
  const idag = Date.UTC(aar!, maned! - 1, dag!);
  const ukedag = (new Date(idag).getUTCDay() + 6) % 7;
  return idag - ukedag * DAG_MS;
}

/** ISO-ukenummer for en UTC-midnatt. */
export function tnUkenummer(ms: number): number {
  const d = new Date(ms);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return Math.ceil(((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / DAG_MS + 1) / 7);
}

function ukeTall(okter: readonly TnTreningsokt[]): TnUkeTall {
  let planlagtMin = 0;
  let gjortMin = 0;
  for (const o of okter) {
    if (o.status === "DRAFT" || !(o.minutter > 0)) continue;
    planlagtMin += o.minutter;
    if (o.status === "COMPLETED") gjortMin += o.minutter;
  }
  return { planlagtMin, gjortMin, pct: planlagtMin > 0 ? Math.round((gjortMin / planlagtMin) * 100) : null };
}

const tomAkser = (): Record<TnAksenavn, number> => ({ FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
const somAkse = (p: string): TnAksenavn | null => TN_AKSE_NAVN.find((a) => a === p) ?? null;

/** Vurderer én spiller. `mandag` er inneværende ukes mandag (tnDenneMandag). */
export function vurderTnTrening(okter: readonly TnTreningsokt[], mandag: number): TnSpillerTrening {
  const i = (o: TnTreningsokt, fra: number, til: number) => o.dato.getTime() >= mandag - fra * DAG_MS && o.dato.getTime() < mandag - til * DAG_MS;
  const ukeFor = okter.filter((o) => i(o, 14, 7));
  const forrige = okter.filter((o) => i(o, 7, 0));
  const fire = okter.filter((o) => i(o, 28, 0));
  const uker: [TnUkeTall, TnUkeTall] = [ukeTall(ukeFor), ukeTall(forrige)];

  const toUkerAkse = tomAkser();
  for (const o of [...ukeFor, ...forrige]) {
    const a = somAkse(o.pyramid);
    if (a && o.status === "COMPLETED" && o.minutter > 0) toUkerAkse[a] += o.minutter;
  }
  const mest = TN_AKSE_NAVN.reduce<TnAksenavn | null>((best, a) => (toUkerAkse[a] > 0 && (best === null || toUkerAkse[a] > toUkerAkse[best]) ? a : best), null);

  const akseMin = tomAkser();
  for (const o of fire) {
    const a = somAkse(o.pyramid);
    if (a && o.status === "COMPLETED" && o.minutter > 0) akseMin[a] += o.minutter;
  }
  const fireTall = ukeTall(fire);

  return {
    uker,
    toUker: ukeTall([...ukeFor, ...forrige]),
    mestAkse: mest,
    underPlan: uker[0].pct !== null && uker[1].pct !== null && uker[0].pct < UTENFOR_PLAN_TERSKEL && uker[1].pct < UTENFOR_PLAN_TERSKEL,
    fireUker: { akseMin, planlagtMin: fireTall.planlagtMin, gjortMin: fireTall.gjortMin },
  };
}

/** Gruppas gjennomførte timer per akse og plan siste fire uker, summert i minutter først. */
export function summerTnGruppetrening(spillere: readonly TnSpillerTrening[]) {
  const akseMin = tomAkser();
  let planlagtMin = 0;
  let gjortMin = 0;
  for (const s of spillere) {
    for (const a of TN_AKSE_NAVN) akseMin[a] += s.fireUker.akseMin[a];
    planlagtMin += s.fireUker.planlagtMin;
    gjortMin += s.fireUker.gjortMin;
  }
  const t = (min: number) => Math.round((min / 60) * 10) / 10;
  return {
    akseTimer: { FYS: t(akseMin.FYS), TEK: t(akseMin.TEK), SLAG: t(akseMin.SLAG), SPILL: t(akseMin.SPILL), TURN: t(akseMin.TURN) },
    planlagtTimer: t(planlagtMin),
    gjortTimer: t(gjortMin),
  };
}
