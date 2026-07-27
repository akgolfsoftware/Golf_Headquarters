/**
 * Felles fremdriftsberegning for mål (Goal) — én kilde til sannhet.
 *
 * Historikk: /portal/mal regnet HCP-reise (og 0 % for alt annet), mens
 * getGoals på Hjem regnet tidsbasert fremdrift — samme mål kunne vise to
 * ulike prosenter avhengig av skjerm. Denne funksjonen samler begge:
 * målbare typer (HCP, runder/mnd) regnes fra ekte tall når konteksten
 * finnes, ellers falles det tilbake til tid mot frist.
 *
 * SG_AREA har ingen billig fremdriftskilde ennå (krever SG-aggregering
 * per område) — den følger tid-mot-frist inntil videre.
 */

/** Startpunkt for HCP-reisen (høyeste mulige handicap). */
export const HCP_START = 54;

export type MaalFremdriftStatus = "on-track" | "behind" | "achieved";

/** Hva prosenten faktisk er regnet fra — styrer hvordan den bør omtales i UI. */
export type MaalFremdriftKilde = "hcp" | "runder" | "tid" | "ingen";

export type MaalFremdriftInput = {
  /** Goal.type: HCP_TARGET | ROUNDS_PER_MONTH | SG_AREA | FREE_TEXT */
  type: string;
  /** Goal.status: ACTIVE | ACHIEVED | ABANDONED */
  status: string;
  targetValue: number | null;
  targetDate: Date | null;
  createdAt: Date;
};

export type MaalFremdriftKontekst = {
  /** Spillerens nåværende handicap — kreves for HCP_TARGET. */
  hcp?: number | null;
  /** Antall registrerte runder inneværende måned — kreves for ROUNDS_PER_MONTH. */
  runderDenneMnd?: number | null;
  /** «Nå» — injiserbar for tester. Default: new Date(). */
  naa?: Date;
};

export type MaalFremdrift = {
  /** 0–100, alltid klemt. */
  pct: number;
  status: MaalFremdriftStatus;
  kilde: MaalFremdriftKilde;
};

const klem = (pct: number): number => Math.min(100, Math.max(0, Math.round(pct)));

/** ≥50 % av målbar reise = på sporet — samme terskel som gamle /portal/mal. */
const statusAvPct = (pct: number): MaalFremdriftStatus =>
  pct >= 100 ? "achieved" : pct >= 50 ? "on-track" : "behind";

export function beregnMaalFremdrift(
  maal: MaalFremdriftInput,
  ctx: MaalFremdriftKontekst = {},
): MaalFremdrift {
  if (maal.status === "ACHIEVED") return { pct: 100, status: "achieved", kilde: "ingen" };

  // HCP-mål: reise fra 54 → målverdi, målt mot nåværende hcp.
  if (maal.type === "HCP_TARGET" && maal.targetValue !== null && ctx.hcp != null) {
    const range = Math.max(0.1, HCP_START - maal.targetValue);
    const reise = Math.max(0, HCP_START - ctx.hcp);
    const pct = klem((reise / range) * 100);
    return { pct, status: statusAvPct(pct), kilde: "hcp" };
  }

  // Runder per måned: faktisk antall denne måneden mot målverdien.
  if (
    maal.type === "ROUNDS_PER_MONTH" &&
    maal.targetValue !== null &&
    maal.targetValue > 0 &&
    ctx.runderDenneMnd != null
  ) {
    const pct = klem((ctx.runderDenneMnd / maal.targetValue) * 100);
    return { pct, status: statusAvPct(pct), kilde: "runder" };
  }

  // Fallback: tid mot frist. Sier ingenting om prestasjon — derfor alltid
  // «on-track» (aldri «behind» basert på at kalenderen går).
  if (maal.targetDate) {
    const naa = (ctx.naa ?? new Date()).getTime();
    const start = maal.createdAt.getTime();
    const total = maal.targetDate.getTime() - start;
    const pct = total > 0 ? klem(((naa - start) / total) * 100) : 0;
    return { pct, status: "on-track", kilde: "tid" };
  }

  return { pct: 0, status: "on-track", kilde: "ingen" };
}
