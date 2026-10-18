/**
 * Datagrunnlag for tre skjermer i PlayerHQ pakke 13 (Stats, resten): Ett område, Skill map og Hull.
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malene «omrade», «skillmap» og «hull».
 *
 * Rene funksjoner uten database. Alt bygges fra målte data; det som ikke er målt, blir null («—»).
 * Strokes Gained regnes som i Stats (ph16-stats-data.ts): rundenes lagrede områdefelt mot PGA Tour-referansen.
 * Bare brutto. Ingen sammenligning med andre spillere.
 */
import { etterlevelse, erForfaltEtterlevelseOkt, type OktStatus } from "@/lib/domain/etterlevelse";
import { ukenummer } from "@/lib/uke-helpers";
import { MIN_RUNDER_FOR_KONKLUSJON, PGA_REFERANSE, type PH16StatsData, type SgRad } from "./ph16-stats-data";

export type SgGruppe = SgRad["g"];
export type OmradeAkse = "fys" | "tek" | "slag" | "spill" | "turn";

/** Nærspill og putting er «Foreløpig» under så mange runder (vedtak 28.09). */
export const SIKKER_RUNDER: Record<SgGruppe, number> = { tee: 12, innspill: 12, naer: 24, putt: 24 };

export const SG_GRUPPE_INFO: Record<SgGruppe, { navn: string; kode: string; slug: string; skillArea: string; rader: string }> = {
  tee: { navn: "Utslag", kode: "OTT", slug: "sg-tee", skillArea: "TEE_TOTAL", rader: "Per slag" },
  innspill: { navn: "Innspill", kode: "APP", slug: "sg-approach", skillArea: "TILNAERMING", rader: "Per avstand" },
  naer: { navn: "Nærspill", kode: "ARG", slug: "sg-around-green", skillArea: "AROUND_GREEN", rader: "Per slagtype" },
  putt: { navn: "Putting", kode: "PUTT", slug: "sg-putting", skillArea: "PUTTING", rader: "Per lengde" },
};

export const AKSE_INFO: Record<OmradeAkse, { kode: string; navn: string }> = {
  fys: { kode: "FYS", navn: "Fysisk" },
  tek: { kode: "TEK", navn: "Teknisk" },
  slag: { kode: "SLAG", navn: "Golfslag" },
  spill: { kode: "SPILL", navn: "Spill" },
  turn: { kode: "TURN", navn: "Turnering" },
};

/* ───────────── Runder med SG per område ───────────── */

export interface SgRundeInn {
  playedAt: Date;
  benchmarkLevelSnapshot: string | null;
  sgTee: number | null;
  sgApp200: number | null; sgApp150: number | null; sgApp100: number | null; sgApp50: number | null;
  sgChip: number | null; sgPitch: number | null; sgLob: number | null; sgBunker: number | null;
  sgPutt0_3: number | null; sgPutt3_5: number | null; sgPutt5_10: number | null; sgPutt10_15: number | null;
  sgPutt15_25: number | null; sgPutt25_40: number | null; sgPutt40plus: number | null;
}

const GRUPPE_FELT: Record<SgGruppe, (keyof SgRundeInn)[]> = {
  tee: ["sgTee"],
  innspill: ["sgApp200", "sgApp150", "sgApp100", "sgApp50"],
  naer: ["sgChip", "sgPitch", "sgLob", "sgBunker"],
  putt: ["sgPutt0_3", "sgPutt3_5", "sgPutt5_10", "sgPutt10_15", "sgPutt15_25", "sgPutt25_40", "sgPutt40plus"],
};

/** Gruppens SG for én runde: summen av feltene som er målt, null når ingen er målt. */
export function gruppeSg(r: SgRundeInn, g: SgGruppe): number | null {
  const v = GRUPPE_FELT[g].map((f) => r[f]).filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) : null;
}

const pgaRunder = (runder: readonly SgRundeInn[]) => runder.filter((r) => r.benchmarkLevelSnapshot === PGA_REFERANSE);

export type GruppeGrunnlag = { antall: number; fra: Date | null; til: Date | null };

/** Antall runder (mot PGA Tour) med målt SG i gruppen, og første og siste dato. */
export function gruppeGrunnlag(runder: readonly SgRundeInn[], g: SgGruppe): GruppeGrunnlag {
  const med = pgaRunder(runder).filter((r) => gruppeSg(r, g) != null).map((r) => r.playedAt.getTime());
  if (!med.length) return { antall: 0, fra: null, til: null };
  return { antall: med.length, fra: new Date(Math.min(...med)), til: new Date(Math.max(...med)) };
}

const MND = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", month: "short" });
const MND_NOKKEL = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit" });
const KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const LANG_MND = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", month: "long" });

/** «2. jun.–4. okt.» */
export function periodeTekst(fra: Date | null, til: Date | null): string | null {
  return fra && til ? `${KORT.format(fra)}–${KORT.format(til)}` : null;
}

export type MaanedPunkt = { navn: string; langt: string; v: number; n: number };

/** Snitt per måned (Oslo) av gruppens SG, eldste først, høyst `maks` måneder med data. */
export function maanedsSnitt(runder: readonly SgRundeInn[], g: SgGruppe, maks = 6): MaanedPunkt[] {
  const per = new Map<string, { sum: number; n: number; dato: Date }>();
  for (const r of pgaRunder(runder)) {
    const v = gruppeSg(r, g);
    if (v == null) continue;
    const k = MND_NOKKEL.format(r.playedAt);
    const x = per.get(k) ?? { sum: 0, n: 0, dato: r.playedAt };
    per.set(k, { sum: x.sum + v, n: x.n + 1, dato: x.dato });
  }
  return [...per.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maks)
    .map(([, x]) => ({ navn: MND.format(x.dato).replace(".", ""), langt: LANG_MND.format(x.dato), v: Math.round(x.sum / x.n * 100) / 100, n: x.n }));
}

/** Gruppens SG nå: summen av radenes snitt (siste 10 runder, minst 4), som i Stats. */
export function gruppeVerdi(stats: PH16StatsData, g: SgGruppe, mot: "pga" | "b" = "pga"): number | null {
  const rader = stats.sg.find((x) => x.g === g)?.rows ?? [];
  const v = rader.map((r) => (mot === "pga" ? r.pga : r.c)).filter((x): x is number => x != null);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) * 100) / 100 : null;
}

/* ───────────── Ett område: SG-utgaven ───────────── */

export type OmradeSgData = {
  gruppe: SgGruppe;
  verdi: number | null;
  /** Endring fra første til siste måned i grafen. null under to måneder. */
  endring: { v: number; fra: string } | null;
  maaneder: MaanedPunkt[];
  rader: { id: string; navn: string; v: number | null; n: number }[];
  svakestRad: string | null;
  /** Området taper mest av de fire. */
  taperMest: boolean;
  grunnlag: GruppeGrunnlag;
  forelopig: boolean;
  trening: { min: number; okter: number } | null;
  treningPeriode: string;
};

export function byggOmradeSg(inn: {
  stats: PH16StatsData; runder: readonly SgRundeInn[]; gruppe: SgGruppe;
  trening: { min: number; okter: number } | null; treningPeriode: string;
}): OmradeSgData {
  const { stats, gruppe } = inn;
  const verdi = gruppeVerdi(stats, gruppe);
  const maaneder = maanedsSnitt(inn.runder, gruppe);
  const forste = maaneder[0], siste = maaneder[maaneder.length - 1];
  const rader = (stats.sg.find((x) => x.g === gruppe)?.rows ?? []).map((r) => ({
    id: r.id, navn: r.label, v: r.pga, n: r.n,
  }));
  const svak = [...rader].filter((r) => r.v != null && r.v < 0).sort((a, b) => (a.v ?? 0) - (b.v ?? 0))[0];
  const alle = (["tee", "innspill", "naer", "putt"] as const).map((g) => ({ g, v: gruppeVerdi(stats, g) })).filter((x) => x.v != null);
  const svakestGruppe = [...alle].sort((a, b) => (a.v ?? 0) - (b.v ?? 0))[0];
  const grunnlag = gruppeGrunnlag(inn.runder, gruppe);
  return {
    gruppe,
    verdi,
    endring: maaneder.length >= 2 && forste && siste ? { v: Math.round((siste.v - forste.v) * 10) / 10, fra: forste.langt } : null,
    maaneder,
    rader,
    svakestRad: rader.length > 1 ? svak?.id ?? null : null,
    taperMest: verdi != null && verdi < 0 && svakestGruppe?.g === gruppe,
    grunnlag,
    forelopig: verdi != null && grunnlag.antall < SIKKER_RUNDER[gruppe],
    trening: inn.trening,
    treningPeriode: inn.treningPeriode,
  };
}

/* ───────────── Ett område: akse-utgaven ───────────── */

export type AkseOktInn = {
  start: string; min: number; status: OktStatus; akse: OmradeAkse;
  drills: { name: string; durationMinutes: number }[];
};

export type OmradeAkseData = {
  akse: OmradeAkse;
  gjortMin: number;
  planMin: number;
  pct: number | null;
  uker: { navn: string; gjort: number; plan: number }[];
  ovelser: { navn: string; min: number; ganger: number }[];
  periode: string;
};

/** Gjennomført mot planlagt for én akse siste fire uker, samme regel som etterlevelse (§KARTLEGGINGSØKT FJERNES). */
export function byggOmradeAkse(okter: readonly AkseOktInn[], akse: OmradeAkse, naa: Date, periode: string): OmradeAkseData {
  const mine = okter.filter((o) => o.akse === akse).map((o) => ({ ...o, scheduledAt: new Date(o.start), durationMin: o.min }));
  const e = etterlevelse(mine, naa);
  // Fire uker à sju dager bakover fra nå, eldste først. Navnet er ISO-uka til siste dag i bolken.
  const DAG = 86_400_000;
  const uker = [3, 2, 1, 0].map((i) => {
    const slutt = naa.getTime() - i * 7 * DAG, start = slutt - 7 * DAG;
    let gjort = 0, plan = 0;
    for (const o of mine) {
      const t = o.scheduledAt.getTime();
      if (t < start || t >= slutt || !erForfaltEtterlevelseOkt(o, naa)) continue;
      plan += o.min;
      if (o.status === "COMPLETED") gjort += o.min;
    }
    return { navn: `Uke ${ukenummer(new Date(slutt - 1))}`, gjort, plan };
  });
  const perOvelse = new Map<string, { min: number; ganger: number }>();
  for (const o of mine) {
    if (o.status !== "COMPLETED" || !erForfaltEtterlevelseOkt(o, naa)) continue;
    for (const d of o.drills) {
      const x = perOvelse.get(d.name) ?? { min: 0, ganger: 0 };
      perOvelse.set(d.name, { min: x.min + Math.max(0, d.durationMinutes), ganger: x.ganger + 1 });
    }
  }
  const ovelser = [...perOvelse].map(([navn, x]) => ({ navn, ...x })).sort((a, b) => b.min - a.min || b.ganger - a.ganger).slice(0, 4);
  return { akse, gjortMin: e.gjennomfortMinutter, planMin: e.planlagtMinutter, pct: e.pct, uker, ovelser, periode };
}

/* ───────────── Hull ───────────── */

export type HullRadInn = { holeNumber: number; par: number; strokes: number; roundId: string; courseName: string; playedAt: Date };

export type HullVarme = {
  bane: string;
  runder: number;
  periode: string | null;
  hull: { nr: number; par: number | null; snitt: number }[];
  dyrest: number[];
};

/** Varmekartet regnes per bane og krever minst så mange runder på banen. */
export const MIN_RUNDER_PAA_BANEN = 3;

/** Banen med flest runder (lik: den sist spilte). null under MIN_RUNDER_PAA_BANEN runder på den. */
export function byggHullVarme(rader: readonly HullRadInn[]): HullVarme | null {
  const perBane = new Map<string, { runder: Set<string>; sist: number }>();
  for (const r of rader) {
    const x = perBane.get(r.courseName) ?? { runder: new Set<string>(), sist: 0 };
    x.runder.add(r.roundId);
    x.sist = Math.max(x.sist, r.playedAt.getTime());
    perBane.set(r.courseName, x);
  }
  const best = [...perBane].sort(([, a], [, b]) => b.runder.size - a.runder.size || b.sist - a.sist)[0];
  if (!best || best[1].runder.size < MIN_RUNDER_PAA_BANEN) return null;
  const mine = rader.filter((r) => r.courseName === best[0]);
  const perHull = new Map<number, { sum: number; n: number; par: number | null }>();
  for (const r of mine) {
    const x = perHull.get(r.holeNumber) ?? { sum: 0, n: 0, par: r.par };
    perHull.set(r.holeNumber, { sum: x.sum + (r.strokes - r.par), n: x.n + 1, par: x.par === r.par ? x.par : null });
  }
  const hull = [...perHull].sort(([a], [b]) => a - b).map(([nr, x]) => ({ nr, par: x.par, snitt: Math.round(x.sum / x.n * 10) / 10 }));
  const dyrest = [...hull].filter((h) => h.snitt >= 0.5).sort((a, b) => b.snitt - a.snitt).slice(0, 2).map((h) => h.nr).sort((a, b) => a - b);
  const tider = mine.map((r) => r.playedAt.getTime());
  return { bane: best[0], runder: best[1].runder.size, periode: periodeTekst(new Date(Math.min(...tider)), new Date(Math.max(...tider))), hull, dyrest };
}

export type SisteRunde = { bane: string; dato: string; brutto: number; motPar: number; hull: { nr: number; par: number; slag: number }[] };

export type HullData = {
  kategori: string | null;
  soner: { g: SgGruppe; v: number | null; forelopig: boolean }[];
  svakest: SgGruppe | null;
  sgGrunnlag: { antall: number; periode: string | null };
  trening: Record<SgGruppe, { min: number; okter: number }> | null;
  treningPeriode: string;
  varme: HullVarme | null;
  /** Antall runder med hullscore i alt (for tomteksten under varmekartet). */
  runderMedHull: number;
  siste: SisteRunde | null;
};

export function byggHullSoner(stats: PH16StatsData, runder: readonly SgRundeInn[]) {
  const soner = (["tee", "innspill", "naer", "putt"] as const).map((g) => {
    const v = gruppeVerdi(stats, g);
    return { g, v, forelopig: v != null && gruppeGrunnlag(runder, g).antall < SIKKER_RUNDER[g] };
  });
  const svak = [...soner].filter((s) => s.v != null && s.v < 0).sort((a, b) => (a.v ?? 0) - (b.v ?? 0))[0];
  const alle = pgaRunder(runder).filter((r) => (["tee", "innspill", "naer", "putt"] as const).some((g) => gruppeSg(r, g) != null));
  const tider = alle.map((r) => r.playedAt.getTime());
  return {
    soner,
    svakest: svak?.g ?? null,
    sgGrunnlag: { antall: alle.length, periode: tider.length ? periodeTekst(new Date(Math.min(...tider)), new Date(Math.max(...tider))) : null },
  };
}

export { MIN_RUNDER_FOR_KONKLUSJON };
