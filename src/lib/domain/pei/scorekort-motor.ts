/**
 * scorekort-motor.ts — REN beregningslogikk for Team Norway-scorekortene,
 * høstet fra ak-golf-talenthq (shared/protocols/scorecard-compute.js).
 * Ingen React, ingen I/O. Formlene er de faktiske fra Excel-arket, videreført
 * via broadie-sg-tabeller.ts / pei-tabeller.ts / poeng-tabeller.ts.
 *
 * UFRAVIKELIG REGEL (CLAUDE.md / oppgave N3): PEI skal aldri beregnes eller
 * vises i samme rad/kort som Broadie-SG eller DataGolf-tall. Derfor er denne
 * motoren delt i tre familier av celle-beregninger (`beregnPeiCelle`,
 * `beregnSgCelle`, `beregnPoengCelle`) og tre separate rad-byggere
 * (`byggPeiRader`, `byggSgRader`, `byggPoengRader`) — ALDRI én funksjon som
 * returnerer alle tre blandet sammen i samme objekt. `beregnCelle` er kun en
 * dispatcher som ruter én kolonne til nøyaktig én av de tre familiene og
 * returnerer ett enkelt tall, ikke en blanding.
 */
import { sgFraLengde, forventedePutter, gronnePutter, type LieKode } from "./broadie-sg-tabeller";
import { poeng8Ball, poengLengdePutt } from "./poeng-tabeller";
import { hovlandPei } from "./pei-tabeller";
import { avstandTilMal, avvikFraMal, beregnPeiForRad } from "./pei-beregning";
import type { ProtokollKolonne, ProtokollRad, ProtokollTotal, TestProtokoll } from "./protokoll-typer";

export function num(x: unknown): number | null {
  if (x === "" || x == null) return null;
  const n = parseFloat(String(x).replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

export function median(tall: number[]): number | null {
  if (!tall.length) return null;
  const s = [...tall].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Formatér et beregnet tall til norsk streng (komma; prosent × 100). */
export function fmt(value: number | null, decimals?: number, percent?: boolean): string | null {
  if (value == null) return null;
  if (percent) return (value * 100).toFixed(decimals ?? 1).replace(".", ",") + " %";
  return value.toFixed(decimals ?? 2).replace(".", ",");
}

type CelleVerdier = Record<string, string | undefined>;

function lieForRad(vals: CelleVerdier, row: ProtokollRad): LieKode {
  return (vals.lieInn as LieKode) || (row.lie as LieKode) || "fw";
}

/** PEI-familien: "pei", "diff", "tilMaal". Aldri Broadie-SG i denne funksjonen. */
export function beregnPeiCelle(col: ProtokollKolonne, row: ProtokollRad, vals: CelleVerdier): number | null {
  const maal = row.maal ?? num(vals.maal);
  if (col.key === "tilMaal") {
    const carry = num(vals.carry);
    if (carry == null || maal == null) return null;
    return avstandTilMal(maal, carry, num(vals.side) ?? 0);
  }
  if (col.key === "diff") {
    const carry = num(vals.carry);
    return carry != null && maal != null ? avvikFraMal(carry, maal) : null;
  }
  if (col.key === "pei") {
    return beregnPeiForRad({
      lengdeInn: num(vals.lengdeInn),
      tilHull: num(vals.tilHull),
      mal: maal,
      carry: num(vals.carry),
      side: num(vals.side),
      resultat: num(vals.resultat),
      radLengde: row.lengde ?? null,
    });
  }
  return null;
}

/** Broadie-SG-familien: "sgFraLengde", "pgaPutts", "sg", "forventet", "res". Aldri PEI i denne funksjonen. */
export function beregnSgCelle(
  protocol: Pick<TestProtokoll, "puttsTable">,
  col: ProtokollKolonne,
  row: ProtokollRad,
  vals: CelleVerdier
): number | null {
  const resultat = num(vals.resultat);
  const maal = row.maal ?? num(vals.maal);

  if (col.key === "sgFraLengde") {
    return row.lengde != null ? sgFraLengde(row.lengde, lieForRad(vals, row)) : null;
  }
  if (col.key === "pgaPutts") {
    if (resultat == null) return null;
    return protocol.puttsTable === "green" ? gronnePutter(resultat) : forventedePutter(resultat);
  }
  if (col.key === "sg") {
    if (maal != null) {
      const carry = num(vals.carry);
      if (carry == null) return null;
      const tilMaal = avstandTilMal(maal, carry, num(vals.side) ?? 0);
      return forventedePutter(tilMaal);
    }
    if (resultat == null || row.lengde == null) return null;
    const fra = sgFraLengde(row.lengde, lieForRad(vals, row));
    const putts = forventedePutter(resultat);
    if (fra == null || putts == null) return null;
    return fra - 1 - putts;
  }
  if (col.key === "forventet") {
    return maal != null ? forventedePutter(maal) : null;
  }
  if (col.key === "res") {
    const n = num(vals.antallSlag);
    if (n == null || maal == null) return null;
    const exp = forventedePutter(maal);
    return exp == null ? null : n - exp;
  }
  return null;
}

/** Poeng-familien: "poeng" (8-ball/gate/lengdeputt). Aldri PEI eller SG i denne funksjonen. */
export function beregnPoengCelle(col: ProtokollKolonne, vals: CelleVerdier): number | null {
  if (col.key !== "poeng") return null;
  if (vals.treff != null) return vals.treff === "✓" ? 1 : 0;
  if (vals.ok != null) return vals.ok === "✓" ? 1 : 0;
  const fot = num(vals.antallFot);
  if (fot != null) return poengLengdePutt(fot);
  const resultat = num(vals.resultat);
  if (resultat != null) return poeng8Ball(resultat);
  return null;
}

const PEI_NOKLER = new Set(["pei", "diff", "tilMaal"]);
const SG_NOKLER = new Set(["sgFraLengde", "pgaPutts", "sg", "forventet", "res"]);

/**
 * Dispatcher: ruter ÉN kolonne til nøyaktig én av de tre familiene og
 * returnerer ett enkelt tall — aldri en blanding av PEI/SG/poeng.
 */
export function beregnCelle(
  protocol: Pick<TestProtokoll, "puttsTable">,
  col: ProtokollKolonne,
  row: ProtokollRad,
  vals: CelleVerdier
): number | null {
  if (PEI_NOKLER.has(col.key)) return beregnPeiCelle(col, row, vals);
  if (SG_NOKLER.has(col.key)) return beregnSgCelle(protocol, col, row, vals);
  if (col.key === "poeng") return beregnPoengCelle(col, vals);
  return null;
}

/** Ett totalfelt over de utfylte radene. */
export function beregnTotal(
  protocol: TestProtokoll,
  total: ProtokollTotal,
  allVals: Record<number, CelleVerdier>,
  rows: ProtokollRad[]
): number | null {
  const valgte = rows.map((row, i) => ({ row, i })).filter(({ row }) => !total.filter || total.filter(row));

  if (total.compute === "spread") {
    const sider = valgte
      .map(({ i }) => num((allVals[i] || {}).side))
      .filter((n): n is number => n != null)
      .map(Math.abs);
    const carries = valgte.map(({ i }) => num((allVals[i] || {}).carry)).filter((n): n is number => n != null);
    if (!sider.length || !carries.length) return null;
    const m = median(carries);
    return m ? sider.reduce((a, b) => a + b, 0) / sider.length / m : null;
  }

  const col = protocol.columns.find(c => c.key === total.column);
  const tall = valgte
    .map(({ row, i }) => {
      if (col && col.kind === "computed") return beregnCelle(protocol, col, row, allVals[i] || {});
      return num((allVals[i] || {})[total.column]);
    })
    .filter((n): n is number => n != null);
  if (!tall.length) return null;

  if (total.compute === "best") return Math.max(...tall);
  if (total.compute === "single" || total.compute === "singleLow") return tall[0];
  if (total.compute === "avg3") {
    const topp3 = [...tall].sort((a, b) => b - a).slice(0, 3);
    return topp3.reduce((a, b) => a + b, 0) / topp3.length;
  }

  const sum = tall.reduce((a, b) => a + b, 0);
  return total.compute === "avg" ? sum / tall.length : sum;
}

/** Input-kolonnene som må fylles ut for at en rad regnes som ferdig. */
export function inputKolonner(protocol: TestProtokoll): ProtokollKolonne[] {
  return protocol.columns.filter(c => c.kind === "input" || (c.kind === "preset" && c.editableFallback));
}

/** Er raden ferdig registrert (alle input-kolonner har verdi)? */
export function erRadKomplett(
  protocol: TestProtokoll,
  radIdx: number,
  vals: Record<number, CelleVerdier>,
  rows: ProtokollRad[]
): boolean {
  const row = rows[radIdx];
  return inputKolonner(protocol).every(c => {
    if (c.kind === "preset" && row && (row as Record<string, unknown>)[c.key] != null) return true;
    const val = (vals[radIdx] || {})[c.key];
    return val != null && val !== "";
  });
}

/** Antall ferdige rader. */
export function antallFullforte(
  protocol: TestProtokoll,
  vals: Record<number, CelleVerdier>,
  rows: ProtokollRad[]
): number {
  let n = 0;
  for (let i = 0; i < rows.length; i += 1) if (erRadKomplett(protocol, i, vals, rows)) n += 1;
  return n;
}

const rund = (n: number | null, d: number): number | null => (n == null ? null : Math.round(n * 10 ** d) / 10 ** d);

export type PeiRadResultat = { shotNr: number; resultM: number | null; pei: number | null; x: number | null; y: number | null };
export type SgRadResultat = { shotNr: number; resultM: number | null; sg: number | null };
export type PoengRadResultat = { shotNr: number; resultM: number | null; points: number | null };

const RESULTAT_NOKLER = ["resultat", "carry", "distanse", "lengdeInn", "antallFot"] as const;

function finnResultat(cols: ProtokollKolonne[], vals: CelleVerdier): number | null {
  const nokkel = RESULTAT_NOKLER.find(k => cols.some(c => c.key === k));
  return nokkel ? num(vals[nokkel]) : null;
}

/** PEI per slag — ALDRI SG eller poeng i returverdien. */
export function byggPeiRader(
  protocol: TestProtokoll,
  rows: ProtokollRad[],
  allVals: Record<number, CelleVerdier>
): PeiRadResultat[] {
  const cols = protocol.columns;
  const peiCol = cols.find(c => c.key === "pei");
  return rows.map((row, i) => {
    const v = allVals[i] || {};
    return {
      shotNr: i + 1,
      resultM: finnResultat(cols, v),
      pei: peiCol ? rund(beregnPeiCelle(peiCol, row, v), 4) : null,
      x: cols.some(c => c.key === "side") ? num(v.side) : null,
      y: cols.some(c => c.key === "carry") ? num(v.carry) : null,
    };
  });
}

/** SG per slag — ALDRI PEI eller poeng i returverdien. */
export function byggSgRader(
  protocol: TestProtokoll,
  rows: ProtokollRad[],
  allVals: Record<number, CelleVerdier>
): SgRadResultat[] {
  const cols = protocol.columns;
  const sgCol = cols.find(c => c.key === "sg");
  return rows.map((row, i) => {
    const v = allVals[i] || {};
    return {
      shotNr: i + 1,
      resultM: finnResultat(cols, v),
      sg: sgCol ? rund(beregnSgCelle(protocol, sgCol, row, v), 4) : null,
    };
  });
}

/** Poeng per slag — ALDRI PEI eller SG i returverdien. */
export function byggPoengRader(
  protocol: TestProtokoll,
  rows: ProtokollRad[],
  allVals: Record<number, CelleVerdier>
): PoengRadResultat[] {
  const cols = protocol.columns;
  const poengCol = cols.find(c => c.key === "poeng");
  const resCol = cols.find(c => c.key === "res");
  return rows.map((row, i) => {
    const v = allVals[i] || {};
    let points: number | null = null;
    if (poengCol) points = beregnPoengCelle(poengCol, v);
    else if (resCol) points = rund(beregnSgCelle(protocol, resCol, row, v), 3);
    else if (cols.some(c => c.key === "antallSlag")) points = num(v.antallSlag);
    return { shotNr: i + 1, resultM: finnResultat(cols, v), points };
  });
}

/** Bygg det fulle totals-arrayet (label + formatert verdi + rått tall). */
export function byggTotaler(
  protocol: TestProtokoll,
  vals: Record<number, CelleVerdier>,
  rows: ProtokollRad[]
): Array<{ label: string; value: string | null; raw: number | null }> {
  return (protocol.totals || []).map(t => {
    const raw = beregnTotal(protocol, t, vals, rows);
    return { label: t.label, value: fmt(raw, t.decimals, t.percent), raw };
  });
}

/** Hovland-referanse-PEI for protokoller som har den (ellers null). Ikke Broadie-SG. */
export function hovlandReferanse(protocol: TestProtokoll, rows: ProtokollRad[]): number | null {
  return protocol.hovlandBenchmark && rows[0] && rows[0].maal != null ? hovlandPei(rows[0].maal) : null;
}

/**
 * Avled BEGINNER/ADVANCED/ELITE fra en tallverdi mot terskler.
 * benchmark: { beginner, advanced, elite, higherIsBetter=true }.
 */
export type NivaBenchmark = { beginner?: number; advanced?: number; elite?: number; higherIsBetter?: boolean };
export function avledNiva(value: number | null, benchmark: NivaBenchmark | null | undefined): "ELITE" | "ADVANCED" | "BEGINNER" | null {
  if (!benchmark || value == null) return null;
  const { beginner, advanced, elite, higherIsBetter = true } = benchmark;
  const ge = (a: number, b: number) => (higherIsBetter ? a >= b : a <= b);
  if (elite != null && ge(value, elite)) return "ELITE";
  if (advanced != null && ge(value, advanced)) return "ADVANCED";
  if (beginner != null) return "BEGINNER";
  return "BEGINNER";
}

/** Inline-validering per celle. Returnerer feilmelding eller null (aldri alert). */
export function validerCelle(col: ProtokollKolonne, raw: string | null | undefined): string | null {
  if (raw == null || raw === "") return null;
  if (col.input === "number") {
    const n = parseFloat(String(raw).replace(",", "."));
    if (Number.isNaN(n)) return "Må være et tall";
    if (n < 0 && col.key !== "side" && col.key !== "diff") return "Kan ikke være negativ";
  }
  return null;
}
