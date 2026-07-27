/**
 * Felles fremdriftsberegning for mål (Goal) — én kilde til sannhet.
 *
 * Historikk: /portal/mal regnet HCP-reise (og 0 % for alt annet), mens
 * getGoals på Hjem regnet tidsbasert fremdrift — samme mål kunne vise to
 * ulike prosenter avhengig av skjerm. Denne funksjonen samler begge:
 * målbare typer (HCP, runder/mnd, SG-område) regnes fra ekte tall når
 * konteksten finnes, ellers falles det tilbake til tid mot frist.
 *
 * SG_AREA krever at målet vet HVILKET område det gjelder. Det ligger ikke
 * i `type` — det lagres i `Goal.payload` som `sgOmrade` sammen med
 * `sgStart` (spillerens SG i området da målet ble satt). Uten område kan
 * fremdriften ikke regnes ærlig, og målet faller tilbake på tid mot frist
 * med `trengerOmrade: true` så UI kan be spilleren velge område.
 */

/** Startpunkt for HCP-reisen (høyeste mulige handicap). */
export const HCP_START = 54;

/** SG-områdene slik de lagres på målet (speiler Round.sgOtt/App/Arg/Putt). */
export const SG_OMRADER = ["OTT", "APP", "ARG", "PUTT"] as const;
export type SgOmrade = (typeof SG_OMRADER)[number];

/** Norsk fasit-navn (AK-formelen): Tee Total · Innspill · Nærspill · Putting. */
export const SG_OMRADE_NAVN: Record<SgOmrade, string> = {
  OTT: "Tee Total",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

export function erSgOmrade(v: unknown): v is SgOmrade {
  return typeof v === "string" && (SG_OMRADER as readonly string[]).includes(v);
}

export type MaalFremdriftStatus = "on-track" | "behind" | "achieved";

/** Hva prosenten faktisk er regnet fra — styrer hvordan den bør omtales i UI. */
export type MaalFremdriftKilde = "hcp" | "runder" | "sg" | "tid" | "ingen";

export type MaalFremdriftInput = {
  /** Goal.type: HCP_TARGET | ROUNDS_PER_MONTH | SG_AREA | FREE_TEXT */
  type: string;
  /** Goal.status: ACTIVE | ACHIEVED | ABANDONED */
  status: string;
  targetValue: number | null;
  targetDate: Date | null;
  createdAt: Date;
  /** Goal.payload — leses for sgOmrade/sgStart. Ukjent form tolereres. */
  payload?: unknown;
};

export type MaalFremdriftKontekst = {
  /** Spillerens nåværende handicap — kreves for HCP_TARGET. */
  hcp?: number | null;
  /** Antall registrerte runder inneværende måned — kreves for ROUNDS_PER_MONTH. */
  runderDenneMnd?: number | null;
  /** Snitt-SG per område siste runder — kreves for SG_AREA. */
  sgSnitt?: Partial<Record<SgOmrade, number | null>> | null;
  /** «Nå» — injiserbar for tester. Default: new Date(). */
  naa?: Date;
};

export type MaalFremdrift = {
  /** 0–100, alltid klemt. */
  pct: number;
  status: MaalFremdriftStatus;
  kilde: MaalFremdriftKilde;
  /** SG-målet mangler område — UI bør be spilleren velge det. */
  trengerOmrade?: true;
  /** Området målet gjelder, når det er kjent. */
  sgOmrade?: SgOmrade;
};

const klem = (pct: number): number => Math.min(100, Math.max(0, Math.round(pct)));

/** ≥50 % av målbar reise = på sporet — samme terskel som gamle /portal/mal. */
const statusAvPct = (pct: number): MaalFremdriftStatus =>
  pct >= 100 ? "achieved" : pct >= 50 ? "on-track" : "behind";

/** Leser sgOmrade/sgStart ut av Goal.payload uten å stole på formen. */
export function lesSgMaal(payload: unknown): { omrade: SgOmrade; start: number | null } | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const p = payload as Record<string, unknown>;
  if (!erSgOmrade(p.sgOmrade)) return null;
  const start = typeof p.sgStart === "number" && Number.isFinite(p.sgStart) ? p.sgStart : null;
  return { omrade: p.sgOmrade, start };
}

function tidFremdrift(maal: MaalFremdriftInput, naaDato: Date | undefined): number | null {
  if (!maal.targetDate) return null;
  const naa = (naaDato ?? new Date()).getTime();
  const start = maal.createdAt.getTime();
  const total = maal.targetDate.getTime() - start;
  return total > 0 ? klem(((naa - start) / total) * 100) : 0;
}

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

  // SG-område: reise fra spillerens SG da målet ble satt → målverdien.
  // SG har ingen naturlig nullpunkt (et mål kan gå fra −1,5 til −0,5), så
  // baselinen MÅ komme fra målet selv — den snapshotes når området velges.
  if (maal.type === "SG_AREA") {
    const sgMaal = lesSgMaal(maal.payload);
    if (sgMaal === null) {
      // Ærlig: vi vet ikke hvilket område målet gjelder. Ingen fabrikkert
      // prosent — tid mot frist, og et flagg så UI kan be om området.
      const tid = tidFremdrift(maal, ctx.naa);
      return tid === null
        ? { pct: 0, status: "on-track", kilde: "ingen", trengerOmrade: true }
        : { pct: tid, status: "on-track", kilde: "tid", trengerOmrade: true };
    }

    const naaVerdi = ctx.sgSnitt?.[sgMaal.omrade];
    if (
      maal.targetValue !== null &&
      sgMaal.start !== null &&
      naaVerdi != null &&
      maal.targetValue !== sgMaal.start
    ) {
      const pct = klem(((naaVerdi - sgMaal.start) / (maal.targetValue - sgMaal.start)) * 100);
      return { pct, status: statusAvPct(pct), kilde: "sg", sgOmrade: sgMaal.omrade };
    }

    // Området er kjent, men baseline eller dagens SG mangler (f.eks. ingen
    // runder ennå) — tid mot frist, uten å påstå prestasjon.
    const tid = tidFremdrift(maal, ctx.naa);
    return tid === null
      ? { pct: 0, status: "on-track", kilde: "ingen", sgOmrade: sgMaal.omrade }
      : { pct: tid, status: "on-track", kilde: "tid", sgOmrade: sgMaal.omrade };
  }

  // Fallback: tid mot frist. Sier ingenting om prestasjon — derfor alltid
  // «on-track» (aldri «behind» basert på at kalenderen går).
  const tid = tidFremdrift(maal, ctx.naa);
  if (tid !== null) return { pct: tid, status: "on-track", kilde: "tid" };

  return { pct: 0, status: "on-track", kilde: "ingen" };
}
