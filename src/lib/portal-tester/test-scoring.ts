/**
 * Felles scoring-motor for testbatteriet — ÉN kilde til sannhet for hvordan
 * en test-score regnes ut. Brukes både server-side (fasit ved lagring) og
 * client-side (live forhåndsvisning), så de aldri kan vise ulik score.
 *
 * Ren modul: ingen "use server", ingen Prisma, ingen I/O. Kun aritmetikk over
 * innsendte slag-verdier + protokollens `target` per slag.
 *
 * Protokoll finnes i to former (jf. src/lib/portal-tester/protocol.ts):
 *   A) NGF-batteri:   { steps: [{ shots, target?, ... }], scoringMode }
 *   B) Team Norway:   { shots: [{ nr, target?, category? }], scoring }
 * Begge mappes til samme kanoniske ScoringKind nedenfor.
 *
 * PEI = nærhet ÷ lengde (Excel-modellen, bekreftet av Anders 2026-06-14):
 *   - nærspill: spilleren taster `resultatM` (avstand fra hull) direkte.
 *   - fullslag: spilleren taster `carry` + sideavvik; nærhet til hull regnes
 *     ut som √((lengde − carry)² + side²) før deling på lengde.
 *   pei_average = snitt av PEI per slag · pei_total = sum av PEI per slag.
 *
 * FYS scores som rå beste verdi (value_single/value_max/time_seconds) — ingen
 * referanse/benchmark her (låst regel: FYS-formel avventer).
 */

import { z } from "zod";

/* ── Typer ───────────────────────────────────────────────────────────────── */

export type Verdi = number | boolean | null;
export type Forsok = { nr: number; label?: string; verdier: Record<string, Verdi> };

export type ScoringKind =
  | "pei_average"
  | "pei_total"
  | "spread_stddev"
  | "time_seconds"
  | "points_total"
  | "count_ok"
  | "hit_rate"
  | "distance_average"
  | "carry_average"
  | "value_single"
  | "value_max"
  | "sum"
  | "average"
  | "min"
  | "fallback";

export type Retning = "lavere_bedre" | "hoyere_bedre";

export type SlagDetalj = {
  nr: number;
  label?: string;
  target?: number;
  category?: string;
  verdier: Record<string, Verdi>;
  /** Beregnet PEI for dette slaget (kun for pei_*-scoring). */
  pei?: number;
};

export type ScoringDetails = {
  version: 2;
  scoring: ScoringKind;
  unit: string | null;
  retning: Retning;
  perSlag: SlagDetalj[];
  aggregat: Record<string, number>;
};

export type ScoreResultat = { score: number; details: ScoringDetails };

/* ── Mapping fra rå protokoll-vokabular → kanonisk kind ──────────────────── */

const KIND_MAP: Record<string, ScoringKind> = {
  // Variant B (`scoring`)
  pei_average: "pei_average",
  pei_total: "pei_total",
  pei: "pei_average",
  spread_stddev: "spread_stddev",
  time_seconds: "time_seconds",
  points_total: "points_total",
  count_ok: "count_ok",
  distance_average: "distance_average",
  carry_average: "carry_average",
  value_single: "value_single",
  value_max: "value_max",
  // Variant A (`scoringMode`)
  sum: "sum",
  average: "average",
  "hit-rate": "hit_rate",
  distance: "distance_average",
  max: "value_max",
  lowest: "min",
};

const RETNING: Record<ScoringKind, Retning> = {
  pei_average: "lavere_bedre",
  pei_total: "lavere_bedre",
  spread_stddev: "lavere_bedre",
  time_seconds: "lavere_bedre",
  distance_average: "lavere_bedre",
  min: "lavere_bedre",
  points_total: "hoyere_bedre",
  count_ok: "hoyere_bedre",
  hit_rate: "hoyere_bedre",
  carry_average: "hoyere_bedre",
  value_single: "hoyere_bedre",
  value_max: "hoyere_bedre",
  sum: "hoyere_bedre",
  average: "hoyere_bedre",
  fallback: "hoyere_bedre",
};

/** Er lavere score bedre for denne scoring-typen? */
export function lavereErBedre(kind: ScoringKind): boolean {
  return RETNING[kind] === "lavere_bedre";
}

/* ── Minimal protokoll-parse for scoring (target/kategori + kind) ────────── */

type SlagSpec = { nr: number; label?: string; target?: number; category?: string };
type ProtokollSpec = { kind: ScoringKind; unit: string | null; shots: SlagSpec[] };

const FeltSchema = z.looseObject({ key: z.string(), label: z.string().optional(), unit: z.string().optional() });

const VariantBSchema = z.looseObject({
  shots: z.array(z.looseObject({
    nr: z.number(),
    label: z.string().optional(),
    target: z.number().optional(),
    category: z.string().optional(),
  })).min(1),
  inputFields: z.array(FeltSchema).optional(),
  scoring: z.string(),
});

const VariantASchema = z.looseObject({
  unit: z.string().optional(),
  scoringMode: z.string(),
  steps: z.array(z.looseObject({
    label: z.string().optional(),
    shots: z.number().int().min(1),
    target: z.union([z.string(), z.number()]).optional(),
    inputFields: z.array(FeltSchema).optional(),
  })).min(1),
});

function unitFra(inputFields: ReadonlyArray<{ unit?: string }> | undefined): string | null {
  const u = inputFields?.[0]?.unit;
  return u && u !== "ja/nei" ? u : null;
}

/** Tolker rå protokoll-JSON til det motoren trenger. Ukjent → fallback. */
export function parseForScoring(protocol: unknown): ProtokollSpec {
  const b = VariantBSchema.safeParse(protocol);
  if (b.success) {
    const kind = KIND_MAP[b.data.scoring] ?? "fallback";
    return {
      kind,
      unit: unitFra(b.data.inputFields),
      shots: [...b.data.shots]
        .sort((x, y) => x.nr - y.nr)
        .map((s, i) => ({ nr: i + 1, label: s.label, target: s.target, category: s.category })),
    };
  }
  const a = VariantASchema.safeParse(protocol);
  if (a.success) {
    const kind = KIND_MAP[a.data.scoringMode] ?? "fallback";
    const shots: SlagSpec[] = [];
    for (const steg of a.data.steps) {
      const target = typeof steg.target === "number" ? steg.target : undefined;
      for (let i = 0; i < steg.shots; i++) {
        shots.push({ nr: shots.length + 1, label: steg.label, target });
      }
    }
    return { kind, unit: a.data.unit ?? null, shots };
  }
  return { kind: "fallback", unit: null, shots: [] };
}

/* ── Tall-hjelpere ───────────────────────────────────────────────────────── */

function tall(v: Verdi): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  return null;
}

/** Prioritert rekkefølge for å plukke «hovedverdien» i et slag. */
const HOVEDFELT = ["vekt", "lengde", "distanse", "tid", "carry", "poeng", "resultatM"] as const;

function hovedverdi(verdier: Record<string, Verdi>): number | null {
  for (const k of HOVEDFELT) {
    if (k in verdier) {
      const n = tall(verdier[k]);
      if (n !== null) return n;
    }
  }
  for (const v of Object.values(verdier)) {
    const n = tall(v);
    if (n !== null) return n;
  }
  return null;
}

function felt(verdier: Record<string, Verdi>, keys: readonly string[]): number | null {
  for (const k of keys) {
    if (k in verdier) {
      const n = tall(verdier[k]);
      if (n !== null) return n;
    }
  }
  return null;
}

function snitt(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = snitt(xs);
  return Math.sqrt(snitt(xs.map((x) => (x - m) ** 2)));
}
function rund(n: number, d = 2): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

/** PEI for ett slag = nærhet ÷ lengde. Nærhet fra resultatM, ellers carry+side. */
function peiForSlag(verdier: Record<string, Verdi>, target: number | undefined): number | null {
  const resultatM = felt(verdier, ["resultatM"]);
  let naerhet: number | null = resultatM;
  if (naerhet === null) {
    const carry = felt(verdier, ["carry"]);
    if (carry === null || target === undefined) return null;
    const side = felt(verdier, ["carrySide", "retning", "side"]) ?? 0;
    naerhet = Math.sqrt((target - carry) ** 2 + side ** 2);
  }
  if (naerhet === null) return null;
  // Uten gyldig lengde kan vi ikke normalisere → bruk rå nærhet.
  return target && target > 0 ? naerhet / target : naerhet;
}

/* ── Hovedfunksjon ───────────────────────────────────────────────────────── */

/**
 * Regner ut fasit-score for en test fra protokollen + innsendte slag-verdier.
 * `forsok` er per-slag-verdiene i rekkefølge (samme kontrakt som scorekortet
 * sender). Pares mot protokollens slag på indeks.
 */
export function scoreTest(protocol: unknown, forsok: Forsok[]): ScoreResultat {
  const spec = parseForScoring(protocol);
  const { kind } = spec;

  const perSlag: SlagDetalj[] = forsok.map((f, i) => {
    const s = spec.shots[i];
    const d: SlagDetalj = { nr: f.nr ?? i + 1, verdier: f.verdier };
    if (f.label ?? s?.label) d.label = f.label ?? s?.label;
    if (s?.target !== undefined) d.target = s.target;
    if (s?.category !== undefined) d.category = s.category;
    return d;
  });

  let score = 0;
  const aggregat: Record<string, number> = {};

  switch (kind) {
    case "pei_average":
    case "pei_total": {
      const peis: number[] = [];
      perSlag.forEach((d) => {
        const pei = peiForSlag(d.verdier, d.target);
        if (pei !== null) {
          d.pei = rund(pei, 4);
          peis.push(pei);
        }
      });
      score = kind === "pei_total" ? peis.reduce((a, b) => a + b, 0) : snitt(peis);
      aggregat.antallSlag = peis.length;
      break;
    }
    case "spread_stddev": {
      const carries = perSlag.map((d) => felt(d.verdier, ["carry"])).filter((n): n is number => n !== null);
      score = stddev(carries);
      aggregat.snittCarry = rund(snitt(carries));
      aggregat.antallSlag = carries.length;
      break;
    }
    case "carry_average": {
      const carries = perSlag.map((d) => felt(d.verdier, ["carry"])).filter((n): n is number => n !== null);
      score = snitt(carries);
      aggregat.antallSlag = carries.length;
      break;
    }
    case "distance_average": {
      const xs = perSlag.map((d) => felt(d.verdier, ["distanse"])).filter((n): n is number => n !== null);
      score = snitt(xs);
      aggregat.antallSlag = xs.length;
      break;
    }
    case "points_total":
    case "sum": {
      const xs = perSlag.map((d) => felt(d.verdier, ["poeng"]) ?? hovedverdi(d.verdier)).filter((n): n is number => n !== null);
      score = xs.reduce((a, b) => a + b, 0);
      break;
    }
    case "count_ok": {
      score = perSlag.filter((d) => tall(d.verdier["ok"] ?? d.verdier["sunket"]) === 1).length;
      aggregat.antallForsok = perSlag.length;
      break;
    }
    case "hit_rate": {
      const treff = perSlag.filter((d) => tall(d.verdier["ok"] ?? d.verdier["sunket"]) === 1).length;
      const forventet = spec.shots.length || perSlag.length || 1;
      score = (treff / forventet) * 100;
      aggregat.treff = treff;
      aggregat.forventet = forventet;
      break;
    }
    case "value_max": {
      const xs = perSlag.map((d) => hovedverdi(d.verdier)).filter((n): n is number => n !== null);
      score = xs.length ? Math.max(...xs) : 0;
      break;
    }
    case "min": {
      const xs = perSlag.map((d) => hovedverdi(d.verdier)).filter((n): n is number => n !== null);
      score = xs.length ? Math.min(...xs) : 0;
      break;
    }
    case "average": {
      const xs = perSlag.map((d) => hovedverdi(d.verdier)).filter((n): n is number => n !== null);
      score = snitt(xs);
      break;
    }
    case "time_seconds":
    case "value_single":
    case "fallback":
    default: {
      // Enkeltverdi: første slags hovedverdi.
      score = hovedverdi(perSlag[0]?.verdier ?? {}) ?? 0;
      break;
    }
  }

  const details: ScoringDetails = {
    version: 2,
    scoring: kind,
    unit: spec.unit,
    retning: RETNING[kind],
    perSlag,
    aggregat,
  };
  return { score: rund(score), details };
}

/* ── Zod-skjema for lesing av lagret details (analyse, steg 6) ───────────── */

export const ScoringDetailsSchema = z.object({
  version: z.literal(2),
  scoring: z.string(),
  unit: z.string().nullable(),
  retning: z.enum(["lavere_bedre", "hoyere_bedre"]),
  perSlag: z.array(z.object({
    nr: z.number(),
    label: z.string().optional(),
    target: z.number().optional(),
    category: z.string().optional(),
    verdier: z.record(z.string(), z.union([z.number(), z.boolean(), z.null()])),
    pei: z.number().optional(),
  })),
  aggregat: z.record(z.string(), z.number()),
});
