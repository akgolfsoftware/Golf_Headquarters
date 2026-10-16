import { generateSgBaselineSeed, SG_BASELINE_VERSION } from "./sg-baseline-seed";
import type { SgBaselinePoint, SgCategory, SgLie } from "./sg";

export type ExistingExpectedRow = {
  id: string;
  baselineVersion: string | null;
  baselineKind: string;
  lieType: string | null;
  distanceMeters: number | null;
  expectedStrokesToHole: number | null;
  sourceReference: string | null;
  quality: string | null;
  isSupported: boolean | null;
};

export type ImportedSgPoint = SgBaselinePoint & {
  sourceRow: string;
  sourceQuality: "published" | "interpolated";
};

/** Kontroller at gammel expected-to-hole-tabell er nøyaktig den godkjente kildeversjonen. */
export function validateExistingExpectedRows(rows: ReadonlyArray<ExistingExpectedRow>): void {
  const expected = generateSgBaselineSeed();
  if (rows.length !== expected.length) {
    throw new Error(`SG-kilden er ufullstendig: ${rows.length}/${expected.length} punkter`);
  }
  const byKey = new Map(expected.map((row) => [`${row.lieType}:${row.distanceMeters}`, row]));
  const seen = new Set<string>();
  for (const row of rows) {
    const key = `${row.lieType}:${row.distanceMeters}`;
    const source = byKey.get(key);
    if (!source || seen.has(key) || row.baselineKind !== "expected_to_hole" ||
        row.baselineVersion !== SG_BASELINE_VERSION ||
        row.expectedStrokesToHole !== source.expectedStrokes ||
        row.sourceReference !== source.sourceReference || row.quality !== source.quality ||
        row.isSupported !== source.isSupported || !row.id) {
      throw new Error(`SG-kilden avviker ved ${key}; opprett ny kildeversjon`);
    }
    seen.add(key);
  }
}

/** Faser er rapporteringskategorier; samme forventede slag kan brukes i begge ved 30 m. */
function positions(lieType: string, distanceM: number): Array<{ phase: SgCategory; lie: SgLie; teePar: number }> {
  if (lieType === "Tee") return [
    { phase: "APP", lie: "TEE", teePar: 3 },
    { phase: "OTT", lie: "TEE", teePar: 4 },
    { phase: "OTT", lie: "TEE", teePar: 5 },
    { phase: "OTT", lie: "TEE", teePar: 6 },
  ];
  if (lieType === "Green") return [{ phase: "PUTT", lie: "GREEN", teePar: 0 }];
  const lie: SgLie | null = lieType === "Fairway" ? "FAIRWAY"
    : lieType === "Rough" ? "ROUGH" : lieType === "Sand" ? "BUNKER" : null;
  if (!lie) return []; // Recovery er ikke det samme som TREES; ingen kilde for øvrige lies.
  return [
    ...(distanceM <= 30 ? [{ phase: "ARG" as const, lie, teePar: 0 }] : []),
    ...(distanceM >= 30 ? [{ phase: "APP" as const, lie, teePar: 0 }] : []),
  ];
}

/** Beholder bare kildepunkter med dokumentert dekning; ingen oppdiktede lies eller avstander. */
export function mapExistingBaselines(rows: ReadonlyArray<ExistingExpectedRow>): ImportedSgPoint[] {
  validateExistingExpectedRows(rows);
  return rows.flatMap((row) => {
    if (row.distanceMeters == null || row.distanceMeters <= 0 ||
        row.expectedStrokesToHole == null || row.isSupported !== true ||
        (row.quality !== "published" && row.quality !== "interpolated")) return [];
    return positions(row.lieType!, row.distanceMeters).map((position) => ({
      ...position,
      distanceM: row.distanceMeters!,
      expectedStrokes: row.expectedStrokesToHole!,
      sourceRow: row.id,
      sourceQuality: row.quality as "published" | "interpolated",
    }));
  });
}
