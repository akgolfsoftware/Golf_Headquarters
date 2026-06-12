/**
 * SG ↔ trening scatter — databeregning.
 *
 * For hver treningsuke: antall timer per SG-kategori (X-akse)
 * mot gjennomsnittlig SG-endring over de neste 90 dagene (Y-akse).
 *
 * Krever: TrainingLog-poster (treningslogg) + Round-poster (runder m/ SG-felter).
 */

export type SgCategoryKey = "OTT" | "APP" | "ARG" | "PUTT";

export type TrainingLogInput = {
  date: Date;
  sgArea: SgCategoryKey;
  minutes: number;
};

export type RoundInput = {
  playedAt: Date;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

export type ScatterPoint = {
  weekLabel: string;
  hoursPerWeek: number;
  sgChangeFwd90: number;
  isRecent: boolean;
};

export type RegressionLine = {
  slope: number;
  intercept: number;
  r: number;
  rSquared: number;
  meanX: number;
  ssX: number;
  s: number;
  n: number;
  verdict: "STERK" | "SVAK" | "INGEN";
};

export type CategoryScatterData = {
  category: SgCategoryKey;
  label: string;
  colorHex: string;
  points: ScatterPoint[];
  regression: RegressionLine | null;
};

export type SgScatterPayload = {
  hasData: boolean;
  primaryCategory: SgCategoryKey;
  categories: CategoryScatterData[];
  maxHours: number;
};

const CATEGORY_META: Record<SgCategoryKey, { label: string; colorHex: string }> = {
  APP: { label: "Innspill", colorHex: "#B8852A" },
  PUTT: { label: "Putt", colorHex: "#A32D2D" },
  OTT: { label: "Drive · slag", colorHex: "#2563EB" },
  ARG: { label: "Around-the-green", colorHex: "#005840" },
};

const SG_FIELD: Record<SgCategoryKey, keyof RoundInput> = {
  OTT: "sgOtt",
  APP: "sgApp",
  ARG: "sgArg",
  PUTT: "sgPutt",
};

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weekStartMs(isoKey: string): number {
  const [yearStr, weekStr] = isoKey.split("-W");
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  return jan4.getTime() - (day - 1) * 86400000 + (week - 1) * 7 * 86400000;
}

function sgMean(rounds: RoundInput[], cat: SgCategoryKey): number | null {
  const field = SG_FIELD[cat];
  const vals = rounds.map((r) => r[field] as number | null).filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function computeRegression(xs: number[], ys: number[]): RegressionLine | null {
  const n = xs.length;
  if (n < 4) return null;

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const ssX = xs.reduce((a, x) => a + (x - meanX) ** 2, 0);
  const ssY = ys.reduce((a, y) => a + (y - meanY) ** 2, 0);
  const ssXY = xs.reduce((a, x, i) => a + (x - meanX) * (ys[i] - meanY), 0);

  if (ssX === 0 || ssY === 0) return null;

  const slope = ssXY / ssX;
  const intercept = meanY - slope * meanX;
  const r = ssXY / Math.sqrt(ssX * ssY);
  const rSquared = r * r;

  const sse = xs.reduce((a, x, i) => {
    const res = ys[i] - (slope * x + intercept);
    return a + res * res;
  }, 0);
  const s = Math.sqrt(sse / Math.max(1, n - 2));

  const verdict: "STERK" | "SVAK" | "INGEN" =
    rSquared >= 0.3 ? "STERK" : rSquared >= 0.1 ? "SVAK" : "INGEN";

  return { slope, intercept, r, rSquared, meanX, ssX, s, n, verdict };
}

export function computeScatterData(
  logs: TrainingLogInput[],
  rounds: RoundInput[],
): SgScatterPayload {
  const sortedRounds = [...rounds].sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());

  // Group logs by ISO week + category
  const weekHours = new Map<string, Map<SgCategoryKey, number>>();
  for (const log of logs) {
    const key = isoWeekKey(log.date);
    if (!weekHours.has(key)) weekHours.set(key, new Map());
    const m = weekHours.get(key)!;
    m.set(log.sgArea, (m.get(log.sgArea) ?? 0) + log.minutes / 60);
  }

  const sortedWeeks = Array.from(weekHours.keys()).sort();
  if (sortedWeeks.length < 4 || sortedRounds.length < 3) {
    return { hasData: false, primaryCategory: "APP", categories: [], maxHours: 6 };
  }

  const DAY90 = 90 * 24 * 60 * 60 * 1000;

  const categories: CategoryScatterData[] = (["OTT", "APP", "ARG", "PUTT"] as SgCategoryKey[]).map(
    (cat) => {
      const meta = CATEGORY_META[cat];
      const points: ScatterPoint[] = [];

      for (let wi = 0; wi < sortedWeeks.length; wi++) {
        const week = sortedWeeks[wi];
        const weekMs = weekStartMs(week);
        const weekNum = parseInt(week.split("-W")[1]);

        const hoursPerWeek = weekHours.get(week)?.get(cat) ?? 0;

        // SG before this week (last 30 days before weekMs)
        const preRounds = sortedRounds.filter(
          (r) => r.playedAt.getTime() >= weekMs - 30 * 86400000 && r.playedAt.getTime() < weekMs,
        );
        // SG in next 90 days
        const postRounds = sortedRounds.filter(
          (r) => r.playedAt.getTime() >= weekMs && r.playedAt.getTime() <= weekMs + DAY90,
        );

        const sgPre = sgMean(preRounds, cat);
        const sgPost = sgMean(postRounds, cat);

        if (sgPre === null || sgPost === null) continue;

        const sgChange = sgPost - sgPre;
        const isRecent = wi >= sortedWeeks.length - 4;

        points.push({
          weekLabel: `Uke ${weekNum}`,
          hoursPerWeek,
          sgChangeFwd90: sgChange,
          isRecent,
        });
      }

      if (points.length < 4) {
        return { category: cat, label: meta.label, colorHex: meta.colorHex, points: [], regression: null };
      }

      const xs = points.map((p) => p.hoursPerWeek);
      const ys = points.map((p) => p.sgChangeFwd90);
      const regression = computeRegression(xs, ys);

      return { category: cat, label: meta.label, colorHex: meta.colorHex, points, regression };
    },
  );

  const withData = categories.filter((c) => c.points.length >= 4);
  if (withData.length === 0) {
    return { hasData: false, primaryCategory: "APP", categories, maxHours: 6 };
  }

  const primary = withData.reduce((best, c) =>
    (c.regression?.rSquared ?? 0) > (best.regression?.rSquared ?? 0) ? c : best,
  );

  const allHours = categories.flatMap((c) => c.points.map((p) => p.hoursPerWeek));
  const maxHours = Math.max(6, ...allHours);

  return {
    hasData: true,
    primaryCategory: primary.category,
    categories,
    maxHours: Math.ceil(maxHours + 0.5),
  };
}

// ── Konfidens-bånd-polygon ────────────────────────────────────────────────────

export type ConfBandPoint = { x: number; yLow: number; yHigh: number };

export function computeConfBand(
  reg: RegressionLine,
  xMin: number,
  xMax: number,
  n = 40,
): ConfBandPoint[] {
  const { slope, intercept, meanX, ssX, s } = reg;
  const pts: ConfBandPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const yPred = slope * x + intercept;
    const se = s * Math.sqrt(1 / reg.n + (x - meanX) ** 2 / ssX);
    pts.push({ x, yLow: yPred - 1.96 * se, yHigh: yPred + 1.96 * se });
  }
  return pts;
}
