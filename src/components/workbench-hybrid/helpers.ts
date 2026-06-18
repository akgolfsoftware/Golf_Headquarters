/**
 * Rene hjelpefunksjoner — fasitens utility-metoder (durLabel, omr-array,
 * buildDimensions). Holdt utenfor komponentene så de kan deles og testes.
 */

import type { DimField } from "./taxonomy";
import { dimLabel } from "./taxonomy";
import type { WbSession, PaletteItem } from "./types";

/** Minutter → "1t 30m" / "1t" / "30m" (fasitens durLabel). */
export function durLabel(min: number): string {
  const h = Math.floor(min / 60);
  const mm = min % 60;
  if (h && mm) return `${h}t ${mm}m`;
  if (h) return `${h}t`;
  return `${mm}m`;
}

type Editable = WbSession | PaletteItem;

/** omr som array (fasit omrArr). */
export function omrArr(s: Editable): string[] {
  const v = s.omr;
  if (Array.isArray(v)) return v.length ? v : ["TEE"];
  return v ? [v] : ["TEE"];
}

export function omrLabelOf(s: Editable): string {
  return omrArr(s)
    .map((x) => dimLabel("omr", x))
    .join(", ");
}

/** En dimensjon-rad i inspektøren. */
export type DimRow = {
  field: DimField;
  label: string;
  /** vist verdi (single) */
  value: string;
  single: boolean;
  multi: boolean;
  /** chips for multi (omr) */
  chips: { label: string; value: string }[];
};

function v<T extends Editable>(s: T, f: keyof T, d: string): string {
  const val = s[f];
  return val != null ? String(val) : d;
}

/**
 * Bygg AK-formel-radene for inspektøren — speiler fasitens buildDimensions.
 * FYS har eget sett (FYS-type [+ sone hvis KONDISJON]); øvrige har fullt sett.
 */
export function buildDimensions(s: Editable): DimRow[] {
  const pyr: DimRow = {
    field: "cat",
    label: "Pyramide",
    value: s.cat,
    single: true,
    multi: false,
    chips: [],
  };

  if (s.cat === "FYS") {
    const ft = v(s, "fysType", "STYRKE");
    const dims: DimRow[] = [
      pyr,
      { field: "fysType", label: "FYS-type", value: dimLabel("fysType", ft), single: true, multi: false, chips: [] },
    ];
    if (ft === "KONDISJON") {
      dims.push({
        field: "sone",
        label: "Intensitet",
        value: dimLabel("sone", v(s, "sone", "SONE_3")),
        single: true,
        multi: false,
        chips: [],
      });
    }
    return dims;
  }

  const omrChips = omrArr(s).map((val) => ({ label: dimLabel("omr", val), value: val }));
  return [
    pyr,
    { field: "omr", label: "Område", value: "", single: false, multi: true, chips: omrChips },
    { field: "m", label: "Miljø", value: dimLabel("m", v(s, "m", "M2")), single: true, multi: false, chips: [] },
    { field: "pr", label: "Press", value: dimLabel("pr", v(s, "pr", "PR2")), single: true, multi: false, chips: [] },
    { field: "cs", label: "Hastighet", value: dimLabel("cs", v(s, "cs", "CS80")), single: true, multi: false, chips: [] },
    { field: "lfase", label: "L-fase", value: dimLabel("lfase", v(s, "lfase", "L_BALL")), single: true, multi: false, chips: [] },
    { field: "praksis", label: "Praksis", value: dimLabel("praksis", v(s, "praksis", "BLOKK")), single: true, multi: false, chips: [] },
  ];
}
