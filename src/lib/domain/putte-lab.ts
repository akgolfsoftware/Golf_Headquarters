/**
 * Putte-lab (Paper W2, fase2) — ren domenelogikk for /portal/analysere/putting.
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-putte-lab.html.
 *
 * KANON (CANON v3.5 + sg.ts): putt-avstand VISES i FOT. Avstandsbåndene her
 * speiler SG-motorens buckets (Round.sgPutt0_3 … sgPutt40plus, fot-indeksert).
 *
 * ÆRLIGHETSREGLER (samme ånd som shots-til-sg.ts):
 *  - Treff per avstand telles KUN på hull der antall Shot-rader stemmer med
 *    HoleScore.strokes — uten det vet vi ikke at siste slag var hole-out.
 *  - Putter/runde og 3-putt regnes KUN på runder der ALLE hull har putts-tall,
 *    og normaliseres til 18 hull (9-hulls runder skal ikke se «billige» ut).
 *  - Alle funksjoner returnerer tellere (n) så UI-et kan vise grunnlaget og
 *    nekte å tegne under datakravene (30 putter / 3 økter, jf. manifestet).
 */

import { meterTilFot } from "@/lib/min-golf/format";

/* ── Avstandsbånd (fot) — speiler SG-bucketene ─────────────────────────── */

export type PutteBandId =
  | "0_3"
  | "3_5"
  | "5_10"
  | "10_15"
  | "15_25"
  | "25_40"
  | "40plus";

export const PUTTE_BAND: ReadonlyArray<{ id: PutteBandId; label: string; maksFot: number | null }> = [
  { id: "0_3", label: "0–3 fot", maksFot: 3 },
  { id: "3_5", label: "3–5 fot", maksFot: 5 },
  { id: "5_10", label: "5–10 fot", maksFot: 10 },
  { id: "10_15", label: "10–15 fot", maksFot: 15 },
  { id: "15_25", label: "15–25 fot", maksFot: 25 },
  { id: "25_40", label: "25–40 fot", maksFot: 40 },
  { id: "40plus", label: "40 fot +", maksFot: null },
];

export function putteBandForFot(fot: number): PutteBandId {
  for (const b of PUTTE_BAND) {
    if (b.maksFot != null && fot <= b.maksFot) return b.id;
  }
  return "40plus";
}

/* ── KPI-rad: SG putt · putter/runde · 3-putt (normalisert til 18 hull) ─── */

export type PutteKpiRunde = {
  sgPutt: number | null;
  /** putts per hull i registrert rekkefølge — null = hull uten putt-tall. */
  putts: ReadonlyArray<number | null>;
};

export type PutteKpi = {
  /** Snitt SG putt per runde — null når ingen runder har sgPutt. */
  sgPuttSnitt: number | null;
  runderMedSg: number;
  /** Snitt putter per 18 hull — kun runder der alle hull har putt-tall. */
  putterPer18: number | null;
  /** Snitt 3-putter (eller verre) per 18 hull — samme grunnlag. */
  trePuttPer18: number | null;
  runderMedPutter: number;
};

export function beregnPutteKpi(runder: ReadonlyArray<PutteKpiRunde>): PutteKpi {
  let sgSum = 0;
  let sgN = 0;
  let putterSum = 0;
  let trePuttSum = 0;
  let komplettN = 0;

  for (const r of runder) {
    if (r.sgPutt != null) {
      sgSum += r.sgPutt;
      sgN += 1;
    }
    // Kun runder med minst 9 hull der ALLE hull har putt-tall.
    if (r.putts.length >= 9 && r.putts.every((p) => p != null)) {
      const putts = r.putts as ReadonlyArray<number>;
      const sum = putts.reduce((a, b) => a + b, 0);
      const tre = putts.filter((p) => p >= 3).length;
      putterSum += (sum / putts.length) * 18;
      trePuttSum += (tre / putts.length) * 18;
      komplettN += 1;
    }
  }

  return {
    sgPuttSnitt: sgN > 0 ? sgSum / sgN : null,
    runderMedSg: sgN,
    putterPer18: komplettN > 0 ? putterSum / komplettN : null,
    trePuttPer18: komplettN > 0 ? trePuttSum / komplettN : null,
    runderMedPutter: komplettN,
  };
}

/* ── Treff % per avstand — fra Shot-kjeden (kun komplette hull) ─────────── */

export type PutteShot = {
  roundId: string;
  holeNumber: number;
  shotNumber: number;
  shotType: string;
  /** Start-avstand for slaget, i METER (DB-konvensjon) — null = ukjent. */
  distanceToPin: number | null;
  isPenalty: boolean;
};

export type PutteHoleScore = {
  roundId: string;
  holeNumber: number;
  strokes: number;
};

export type TreffBand = { id: PutteBandId; label: string; forsok: number; treff: number };

export type TreffPerAvstand = {
  band: TreffBand[];
  totaltForsok: number;
  komplettHull: number;
};

export function beregnTreffPerAvstand(
  shots: ReadonlyArray<PutteShot>,
  holeScores: ReadonlyArray<PutteHoleScore>,
): TreffPerAvstand {
  const strokesPerHull = new Map<string, number>();
  for (const h of holeScores) strokesPerHull.set(`${h.roundId}#${h.holeNumber}`, h.strokes);

  const perHull = new Map<string, PutteShot[]>();
  for (const s of shots) {
    const key = `${s.roundId}#${s.holeNumber}`;
    const eks = perHull.get(key);
    if (eks) eks.push(s);
    else perHull.set(key, [s]);
  }

  const teller = new Map<PutteBandId, { forsok: number; treff: number }>();
  for (const b of PUTTE_BAND) teller.set(b.id, { forsok: 0, treff: 0 });

  let komplettHull = 0;
  let totaltForsok = 0;

  for (const [key, hullShots] of perHull) {
    const strokes = strokesPerHull.get(key);
    // Ærlighetsregel: uten score, eller når slag-kjeden ikke stemmer med
    // scoren, vet vi ikke at siste slag var hole-out — hopp over hullet.
    if (strokes == null || strokes !== hullShots.length) continue;
    komplettHull += 1;

    // Siste ikke-straffe-slag på et komplett hull er hole-out.
    const spilte = hullShots.filter((s) => !s.isPenalty);
    if (spilte.length === 0) continue;
    const siste = spilte.reduce((a, b) => (b.shotNumber > a.shotNumber ? b : a));

    for (const s of spilte) {
      if (s.shotType !== "PUTT" || s.distanceToPin == null) continue;
      const band = teller.get(putteBandForFot(meterTilFot(s.distanceToPin)));
      if (!band) continue;
      band.forsok += 1;
      totaltForsok += 1;
      if (s.shotNumber === siste.shotNumber) band.treff += 1;
    }
  }

  return {
    band: PUTTE_BAND.map((b) => {
      const t = teller.get(b.id) ?? { forsok: 0, treff: 0 };
      return { id: b.id, label: b.label, forsok: t.forsok, treff: t.treff };
    }),
    totaltForsok,
    komplettHull,
  };
}

/* ── SG putt per avstand — fra Round-bucketene (autoberegnet slag-kjede) ── */

export type SgBandRunde = Partial<Record<`sgPutt${PutteBandId}`, number | null>>;

export type SgPerAvstand = { id: PutteBandId; label: string; snitt: number | null; n: number }[];

export function beregnSgPerAvstand(runder: ReadonlyArray<SgBandRunde>): SgPerAvstand {
  return PUTTE_BAND.map((b) => {
    const felt = `sgPutt${b.id}` as const;
    let sum = 0;
    let n = 0;
    for (const r of runder) {
      const v = r[felt];
      if (v != null) {
        sum += v;
        n += 1;
      }
    }
    return { id: b.id, label: b.label, snitt: n > 0 ? sum / n : null, n };
  });
}

/* ── Distansekontroll — fra speed-testenes per-slag-detaljer ────────────── */

export type SpeedSlag = {
  /** Puttlengde i METER (protokollens target). */
  target?: number;
  verdier: Record<string, number | boolean | null>;
};

export type SpeedOkt = { perSlag: ReadonlyArray<SpeedSlag> };

export type DistansePunkt = {
  avstandFot: number;
  /** Avvik forbi (+) / kort (−) hullet, i fot. */
  avvikFot: number;
  /** Innenfor lab-kravet: |avvik| ≤ 5 % av puttlengden. */
  innenforKrav: boolean;
};

export type Distansekontroll = {
  punkter: DistansePunkt[];
  /** Andel av puttene som endte FORBI hullet (0–1) — null uten punkter. */
  andelLange: number | null;
  /** Snitt |avvik| i fot per puttlengde (fot), sortert stigende. */
  snittPerAvstand: { avstandFot: number; snittAvvikFot: number; n: number }[];
  okterMedData: number;
};

/** Lab-protokollens krav: avvik under 5 % av puttlengden. */
export const DISTANSE_KRAV_ANDEL = 0.05;

export function beregnDistansekontroll(okter: ReadonlyArray<SpeedOkt>): Distansekontroll {
  const punkter: DistansePunkt[] = [];
  const perAvstand = new Map<number, { sum: number; n: number }>();
  let okterMedData = 0;
  let lange = 0;

  for (const okt of okter) {
    let bidro = false;
    for (const slag of okt.perSlag) {
      const distanse = slag.verdier["distanse"];
      if (typeof slag.target !== "number" || typeof distanse !== "number") continue;
      const avstandFot = meterTilFot(slag.target);
      const avvikFot = meterTilFot(distanse);
      punkter.push({
        avstandFot,
        avvikFot,
        innenforKrav: Math.abs(avvikFot) <= avstandFot * DISTANSE_KRAV_ANDEL,
      });
      if (avvikFot > 0) lange += 1;
      const nokkel = Math.round(avstandFot);
      const eks = perAvstand.get(nokkel);
      if (eks) {
        eks.sum += Math.abs(avvikFot);
        eks.n += 1;
      } else {
        perAvstand.set(nokkel, { sum: Math.abs(avvikFot), n: 1 });
      }
      bidro = true;
    }
    if (bidro) okterMedData += 1;
  }

  return {
    punkter,
    andelLange: punkter.length > 0 ? lange / punkter.length : null,
    snittPerAvstand: [...perAvstand.entries()]
      .map(([avstandFot, v]) => ({ avstandFot, snittAvvikFot: v.sum / v.n, n: v.n }))
      .sort((a, b) => a.avstandFot - b.avstandFot),
    okterMedData,
  };
}
