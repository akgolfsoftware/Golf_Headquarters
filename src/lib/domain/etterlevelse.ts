/** Felles etterlevelse: gjennomførte mot planlagte minutter siste fire uker.
 * Beslutning 26.09.2026. Minutter er øktens planlagte varighet, ikke målt
 * aktiv tid. Alle statuser må ha passert planlagt slutt før de teller.
 */
import type { SessionStatus, SessionStatusV2 } from "@/generated/prisma/client";
export type OktStatus = SessionStatus | SessionStatusV2;
export type EtterlevelseOkt = { scheduledAt: Date; durationMin: number; status: OktStatus };
export const ETTERLEVELSE_DAGER = 28;
export const NEVNER_TEKST = "gjennomførte mot planlagte minutter · siste fire uker";
const AVVIK = new Set<string>(["SKIPPED", "ABANDONED", "CANCELLED"]);

export function etterlevelseFra(now: Date): Date {
  return new Date(now.getTime() - ETTERLEVELSE_DAGER * 86_400_000);
}

/** Vinduet følger øktstart, med inklusiv nedre grense og passert sluttid.
 * Ugyldig/ikke-positiv varighet gir ikke et beregningsgrunnlag. */
export function erForfaltEtterlevelseOkt(okt: EtterlevelseOkt, now: Date): boolean {
  const start = okt.scheduledAt.getTime();
  return Number.isFinite(start) && Number.isFinite(okt.durationMin) && okt.durationMin > 0 &&
    start >= etterlevelseFra(now).getTime() && start + okt.durationMin * 60_000 <= now.getTime();
}

export type Etterlevelse = {
  /** Øktantall beholdes for forklaring og avviksrader, ikke som prosent. */
  teller: number; nevner: number; hoppet: number; ulogget: number;
  gjennomfortMinutter: number; planlagtMinutter: number;
  /** Null betyr at det mangler forfalte minutter. */
  pct: number | null;
};

export function etterlevelse(okter: readonly EtterlevelseOkt[], now: Date): Etterlevelse {
  let teller = 0, nevner = 0, hoppet = 0, ulogget = 0;
  let gjennomfortMinutter = 0, planlagtMinutter = 0;
  for (const okt of okter) {
    if (!erForfaltEtterlevelseOkt(okt, now)) continue;
    nevner++;
    planlagtMinutter += okt.durationMin;
    if (okt.status === "COMPLETED") { teller++; gjennomfortMinutter += okt.durationMin; }
    else if (AVVIK.has(okt.status)) hoppet++;
    else ulogget++;
  }
  return { teller, nevner, hoppet, ulogget, gjennomfortMinutter, planlagtMinutter,
    pct: planlagtMinutter > 0 ? Math.round(gjennomfortMinutter / planlagtMinutter * 100) : null };
}

export function etterlevelseTekst(e: Etterlevelse): string | null {
  return e.pct === null ? null : `${e.pct} %`;
}

/** Stallrapporten vektes med minutter, aldri snittet av spillerprosenter. */
export function summerEtterlevelse(resultater: readonly Etterlevelse[]): Etterlevelse {
  const sum = resultater.reduce((total, e) => ({
    teller: total.teller + e.teller,
    nevner: total.nevner + e.nevner,
    hoppet: total.hoppet + e.hoppet,
    ulogget: total.ulogget + e.ulogget,
    gjennomfortMinutter: total.gjennomfortMinutter + e.gjennomfortMinutter,
    planlagtMinutter: total.planlagtMinutter + e.planlagtMinutter,
  }), { teller: 0, nevner: 0, hoppet: 0, ulogget: 0, gjennomfortMinutter: 0, planlagtMinutter: 0 });
  return { ...sum, pct: sum.planlagtMinutter > 0
    ? Math.round(sum.gjennomfortMinutter / sum.planlagtMinutter * 100) : null };
}
