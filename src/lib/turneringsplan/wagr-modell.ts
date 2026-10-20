/**
 * WAGR-modellen for turneringsplanleggeren. Samme regning som
 * ak-golf-pipelines pipelines/turneringsplan/modell.py og planleggersiden der,
 * linje for linje, så tallene i HQ og i pipelines er de samme.
 *
 * Styrke (theta) er slag per runde mot et felles nullpunkt; lavere er bedre.
 * Bare WAGR-data inngår. Kilde: World Amateur Golf Ranking (WAGR), The R&A.
 */

export type Felt = { q: number[]; n: number; r: number };
export type Poengkurve = { plasser: number[]; a: number[]; b: number[] };
export type WagrModell = {
  sigma: number;
  form: number;
  pointsCurve: Poengkurve;
  powerEdges: number[];
  /** "M3" = herrer, Power-intervall 3. */
  fieldProfiles: Record<string, Felt>;
  /** [plass, snitt] synkende snitt, per kjønn. */
  rankingCurves: Record<string, [number, number][]>;
};
export type Kjonn = "M" | "K";
export type Merke = "PRESTASJON" | "UTVIKLING" | "TRENING";
export type Sjanser = { p1: number; p10: number; ep: number };
export type Vurdering = Sjanser & { poeng: number; merke: Merke; anslattFelt: boolean };

export const KILDE_WAGR = "Kilde: World Amateur Golf Ranking (WAGR), The R&A";

function erf(x: number): number {
  const s = Math.sign(x);
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return s * y;
}
const phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
const Z = Array.from({ length: 33 }, (_, i) => -4 + i * 0.25);
const ZV = (() => {
  const w = Z.map((z) => Math.exp((-z * z) / 2));
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / s);
})();

/** Spredning i et turneringssnitt: rundestøy pluss form fra uke til uke. */
export function spredning(m: WagrModell, runder: number): number {
  return Math.sqrt(m.sigma ** 2 / Math.max(runder, 1) + m.form ** 2);
}

/** Sjanse for seier, topp 10 og forventet plass mot et felt (uten tilfeldige trekk). */
export function sjanser(m: WagrModell, theta: number, felt: Felt): Sjanser {
  const s = spredning(m, felt.r);
  const vekt = (felt.n - 1) / felt.q.length;
  let p1 = 0, p10 = 0, ep = 0;
  for (let i = 0; i < Z.length; i++) {
    const x = theta + s * Z[i];
    let mm = 0, v = 0;
    for (const t of felt.q) { const p = phi((x - t) / s); mm += p; v += p * (1 - p); }
    mm *= vekt;
    const sd = Math.sqrt(Math.max(v * vekt, 1e-9));
    ep += ZV[i] * (mm + 1);
    p1 += ZV[i] * phi((0.5 - mm) / sd);
    p10 += ZV[i] * phi((9.5 - mm) / sd);
  }
  return { p1, p10, ep };
}

/** Deterministisk tallstrøm (mulberry32), så samme turnering gir samme tall hver gang. */
export function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function trekkPlass(m: WagrModell, theta: number, felt: Felt, r: () => number): number {
  const s = spredning(m, felt.r);
  const n = felt.n - 1;
  const vekt = n / felt.q.length;
  const x = theta + s * gauss(r);
  let mm = 0, v = 0;
  for (const t of felt.q) { const p = phi((x - t) / s); mm += p; v += p * (1 - p); }
  mm *= vekt; v *= vekt;
  const slaar = v > 0 ? mm + Math.sqrt(v) * gauss(r) : mm;
  return Math.min(Math.max(Math.round(slaar), 0), n) + 1;
}

/** WAGR-poeng for en plassering i en turnering med gitt Power. */
export function poeng(k: Poengkurve, power: number | null, plass: number): number {
  const ks = k.plasser;
  if (!ks.length || !power || power <= 0) return 0;
  const lp = Math.log(Math.max(plass, 1));
  const lk = ks.map(Math.log);
  let i: number, w: number;
  if (lp <= lk[0]) { i = 0; w = 0; }
  else if (lp >= lk[lk.length - 1]) { i = ks.length - 2; w = 1 + (lp - lk[lk.length - 1]) / (lk[lk.length - 1] - lk[lk.length - 2]); }
  else { i = lk.findIndex((x) => x >= lp) - 1; w = (lp - lk[i]) / (lk[i + 1] - lk[i]); }
  const a = k.a[i] + w * (k.a[i + 1] - k.a[i]);
  const b = k.b[i] + w * (k.b[i + 1] - k.b[i]);
  return Math.exp(a + b * Math.log(power));
}

/** Kan vinne (minst 15 % seier), Topp 10 (minst 40 %), ellers Læring. Grensene er et utkast. */
export const merkelapp = (p1: number, p10: number): Merke => (p1 >= 0.15 ? "PRESTASJON" : p10 >= 0.4 ? "UTVIKLING" : "TRENING");

/** WAGR: fullt de første 51 ukene, så 1/53 mindre per uke, borte ved 104 uker. */
export const eldning = (uker: number) => (uker <= 51 ? 1 : uker >= 104 ? 0 : (104 - uker) / 53);

export function powerBin(m: WagrModell, p: number): number {
  const k = m.powerEdges;
  for (let i = 0; i < k.length - 1; i++) if (p < k[i + 1]) return i;
  return k.length - 2;
}

/** Eget felt fra WAGRs resultatliste, ellers typisk felt for Power-intervallet. */
export function feltFor(m: WagrModell, ev: { field: Felt | null; power: number | null }, kj: Kjonn): Felt | null {
  if (ev.field) return ev.field;
  if (!ev.power) return null;
  return m.fieldProfiles[kj + powerBin(m, ev.power)] ?? null;
}

export function plassFraSnitt(m: WagrModell, snitt: number, kj: Kjonn): number | null {
  const k = m.rankingCurves[kj] ?? m.rankingCurves.M;
  if (!k?.length) return null;
  if (snitt >= k[0][1]) return 1;
  for (let i = 1; i < k.length; i++) {
    if (snitt >= k[i][1]) {
      const [p0, s0] = k[i - 1], [p1, s1] = k[i];
      return Math.round(p0 + ((p1 - p0) * (s0 - snitt)) / Math.max(s0 - s1, 1e-9));
    }
  }
  return k[k.length - 1][0] + 1;
}

export function kvantil(a: number[], q: number): number {
  const v = [...a].sort((x, y) => x - y);
  const i = q * (v.length - 1);
  const lo = Math.floor(i), hi = Math.min(lo + 1, v.length - 1);
  return v[lo] + (v[hi] - v[lo]) * (i - lo);
}

/** Sjanser, forventede poeng (300 trekk) og merkelapp for én turnering. */
export function vurder(
  m: WagrModell, theta: number, kj: Kjonn,
  ev: { wagrEventId: number; field: Felt | null; power: number | null },
): Vurdering | null {
  const f = feltFor(m, ev, kj);
  if (!f || !ev.power) return null;
  const s = sjanser(m, theta, f);
  const r = rng(ev.wagrEventId);
  let sum = 0;
  for (let i = 0; i < 300; i++) sum += poeng(m.pointsCurve, ev.power, trekkPlass(m, theta, f, r));
  return { ...s, poeng: sum / 300, merke: merkelapp(s.p1, s.p10), anslattFelt: !ev.field };
}

// ---------------------------------------------------------------- datoer (UTC-dager)

export const dag = (s: string) => new Date(`${s}T00:00:00Z`);
export function isoUke(s: string): number {
  const d = dag(s);
  const n = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - n + 3);
  const f = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d.getTime() - f.getTime()) / 864e5 - 3 + ((f.getUTCDay() + 6) % 7)) / 7);
}
/** Uke 1–52 i sesongen (uke 53 og årsskifte-uker legges inn i kanten). */
export function ukeIAar(s: string): number {
  const u = isoUke(s);
  const mnd = dag(s).getUTCMonth();
  return mnd === 0 && u > 50 ? 1 : mnd === 11 && u === 1 ? 52 : Math.min(u, 52);
}
function sondag(s: string): Date {
  const d = dag(s);
  d.setUTCDate(d.getUTCDate() + (7 - (d.getUTCDay() || 7)));
  return d;
}

// ---------------------------------------------------------------- sesongen

export type Tellende = [poeng: number, sondag: string, divisor: number];
export type Sesonganslag = { p10: number; p50: number; p90: number; s10: number; s90: number };

/**
 * WAGR-plass ved utgangen av sesongen: dagens tellende resultater pluss planen, 1 500 sesonger.
 * Forutsetter at resten av rankinglisten står stille og at spilleren holder dagens nivå.
 */
export function simulerSesong(
  m: WagrModell, spiller: { seed: number; theta: number; kj: Kjonn; tellende: Tellende[] },
  plan: { d: string; field: Felt | null; power: number | null }[], sluttDato: string,
): Sesonganslag | null {
  const liste = plan.map((ev) => ({ ev, f: feltFor(m, ev, spiller.kj) }))
    .filter((x): x is { ev: typeof x.ev; f: Felt } => Boolean(x.f && x.ev.power));
  if (!liste.length) return null;
  liste.sort((a, b) => (a.ev.d < b.ev.d ? -1 : 1));
  const slutt = dag(sluttDato).getTime();
  const uker = (d: string) => Math.round((slutt - sondag(d).getTime()) / 6048e5);
  const gml = spiller.tellende.map(([p, d, dv]) => [p, uker(d), dv] as const);
  const r = rng(spiller.seed);
  const plass: number[] = [], sum: number[] = [];
  const minDivisor = spiller.kj === "K" ? 7 : 8;
  for (let i = 0; i < 1500; i++) {
    let P = 0, D = 0, S = 0;
    for (const [p, u, dv] of gml) { const e = eldning(u); P += p * e; D += dv * e; }
    for (const { ev, f } of liste) {
      const pts = poeng(m.pointsCurve, ev.power, trekkPlass(m, spiller.theta, f, r));
      S += pts;
      const e = eldning(uker(ev.d));
      P += pts * e; D += e;
    }
    sum.push(S);
    plass.push(plassFraSnitt(m, (P / Math.max(D, minDivisor)) * 100, spiller.kj) ?? 0);
  }
  return { p10: kvantil(plass, 0.1), p50: kvantil(plass, 0.5), p90: kvantil(plass, 0.9), s10: kvantil(sum, 0.1), s90: kvantil(sum, 0.9) };
}

// ---------------------------------------------------------------- nivå og forslag

export type Stadium = { id: string; navn: string; fra: number; til: number; mal: Record<Merke, number> };
/** Utkast: blandingen av nivåer per stadium (pipelines-siden 19.10.2026). Treneren kan overstyre. */
export const STADIER: Stadium[] = [
  { id: "S1", navn: "Nasjonalt nivå", fra: 0, til: 45, mal: { PRESTASJON: 0.5, UTVIKLING: 0.35, TRENING: 0.15 } },
  { id: "S2", navn: "Nordisk nivå", fra: 45, til: 120, mal: { PRESTASJON: 0.4, UTVIKLING: 0.4, TRENING: 0.2 } },
  { id: "S3", navn: "Internasjonalt juniornivå", fra: 120, til: 300, mal: { PRESTASJON: 0.3, UTVIKLING: 0.45, TRENING: 0.25 } },
  { id: "S4", navn: "Europeisk toppnivå", fra: 300, til: 600, mal: { PRESTASJON: 0.25, UTVIKLING: 0.45, TRENING: 0.3 } },
  { id: "S5", navn: "Verdenstoppen amatør", fra: 600, til: 1e9, mal: { PRESTASJON: 0.2, UTVIKLING: 0.5, TRENING: 0.3 } },
];
const STIGE = [20, 30, 45, 65, 90, 125, 175, 250, 350, 500, 700, 1000];

/** Høyeste Power der spilleren har minst 50 % sjanse for topp 10 i et typisk felt. */
export function stadiumFor(m: WagrModell, theta: number, kj: Kjonn): Stadium {
  let best: number | null = null;
  for (const p of STIGE) {
    const f = m.fieldProfiles[kj + powerBin(m, p)];
    if (f && sjanser(m, theta, f).p10 >= 0.5) best = p;
  }
  if (best == null) return STADIER[0];
  return STADIER.find((s) => best! >= s.fra && best! < s.til) ?? STADIER[4];
}

export type PlanTier = "A" | "B" | "C";
/** Forslag til prioritet: store felt (Power 600+) A, små norske (under 60) C, ellers B. */
export const tierFra = (ev: { power: number | null; country: string | null }): PlanTier =>
  (ev.power ?? 0) >= 600 ? "A" : ev.country === "Norway" && (ev.power ?? 0) < 60 ? "C" : "B";

/**
 * Forslag til plan med 14 turneringer: flest forventede WAGR-poeng, blandingen fra stadiet,
 * én turnering per uke og høyst tre uker på rad. Store proffturneringer (Power 800+) er ikke med.
 */
export function lagForslag<T extends { id: string; d: string; power: number | null; country: string | null; eventType: string | null }>(
  kandidater: { ev: T; v: Vurdering }[], stadium: Stadium, antall = 14,
): { ev: T; tier: PlanTier }[] {
  const kand = kandidater.filter((k) => !(k.ev.eventType === "Med proffer" && (k.ev.power ?? 0) >= 800))
    .sort((a, b) => b.v.poeng - a.v.poeng);
  const valgt: { ev: T; tier: PlanTier }[] = [];
  const uker = new Set<number>();
  const ok = (ev: T) => {
    const u = ukeIAar(ev.d);
    if (uker.has(u)) return false;
    let rekke = 1;
    for (let d = 1; uker.has(u - d); d++) rekke++;
    for (let d = 1; uker.has(u + d); d++) rekke++;
    return rekke <= 3;
  };
  const ta = (k: { ev: T; v: Vurdering }) => { valgt.push({ ev: k.ev, tier: tierFra(k.ev) }); uker.add(ukeIAar(k.ev.d)); };
  for (const merke of ["PRESTASJON", "UTVIKLING", "TRENING"] as const) {
    const mal = Math.round(antall * stadium.mal[merke]);
    let n = 0;
    for (const k of kand) {
      if (n >= mal) break;
      if (k.v.merke !== merke || valgt.some((x) => x.ev.id === k.ev.id) || !ok(k.ev)) continue;
      ta(k); n++;
    }
  }
  for (const k of kand) {
    if (valgt.length >= antall) break;
    if (!valgt.some((x) => x.ev.id === k.ev.id) && ok(k.ev)) ta(k);
  }
  return valgt;
}
