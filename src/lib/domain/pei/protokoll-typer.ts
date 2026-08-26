/**
 * protokoll-typer.ts — typer for scorekort-protokollene, høstet fra
 * ak-golf-talenthq (shared/protocols/protocol-definitions.js).
 */

export type KolonneSlag = "preset" | "input" | "computed";
export type InputType = "number" | "choice";

export type ProtokollKolonne = {
  key: string;
  label: string;
  kind: KolonneSlag;
  unit?: string;
  percent?: boolean;
  decimals?: number;
  input?: InputType;
  options?: readonly string[];
  /** preset-kolonne som likevel kan overstyres av spilleren (f.eks. eget mål). */
  editableFallback?: boolean;
};

/** En rad i protokollen — presets varierer per protokoll (slag, lengde, hull, mål …). */
export type ProtokollRad = {
  slag?: string;
  lengde?: number;
  lie?: "b";
  hull?: number;
  maal?: number | null;
  forsok?: number;
  launch?: string;
  carrySone?: string;
  speedsone?: string;
  gate?: string;
};

export type TotalBeregning = "sum" | "avg" | "spread" | "best" | "single" | "singleLow" | "avg3";

export type ProtokollTotal = {
  label: string;
  column: string;
  compute: TotalBeregning;
  percent?: boolean;
  decimals?: number;
  unit?: string;
  filter?: (rad: ProtokollRad) => boolean;
};

export type ProtokollGruppe = "Golfslag" | "Teknikk" | "PEI" | "Fysisk";

export type TestProtokoll = {
  id: string;
  name: string;
  group: ProtokollGruppe;
  description: string;
  columns: ProtokollKolonne[];
  /** "green" for 8-ball-testene (PGA putts slås opp i den fine green-tabellen). */
  puttsTable?: "green";
  rows: ProtokollRad[];
  rowsByGender?: { gutter: ProtokollRad[]; jenter: ProtokollRad[] };
  hovlandBenchmark?: boolean;
  totals: ProtokollTotal[];
};

/** Verdiene spilleren har fylt ut, indeksert på radnummer → felt → rå streng/valg. */
export type ProtokollVerdier = Record<number, Record<string, string | undefined>>;

/** Kjønnsvariant for protokoller som har rowsByGender. */
export type Kjonn = "gutter" | "jenter";

/** Radene som faktisk skal brukes for en protokoll + evt. kjønnsvariant. */
export function raderFor(protokoll: TestProtokoll, kjonn?: Kjonn): ProtokollRad[] {
  if (protokoll.rowsByGender && kjonn) return protokoll.rowsByGender[kjonn];
  return protokoll.rows;
}
