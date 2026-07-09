// Barrel for the v2 component library (fase 6, steg 1).
// Re-exports every family file. Navnekollisjon: `Ark`/`ArkProps` finnes i
// BÅDE overlays (generell sheet/drawer) og wb-mobil (mobil workbench-ark).
// Begge beholdes: overlays eier det kanoniske navnet, wb-mobil aliaseres til
// `WbArk`/`WbArkProps` slik at ingen komponent skjules stille.

export * from "./core";
export * from "./compliance-viz";
export * from "./datavis";
export * from "./domene";
export * from "./domene2";
export * from "./kalender";
export * from "./skjema";
export * from "./overlays";
export * from "./struktur";
export * from "./spesialviz";
export * from "./utviklingsplan";
export * from "./fysisk";
export * from "./wb-composer";
export * from "./samtale";

// wb-mobil: eksplisitt re-eksport pga Ark/ArkProps-kollisjon med overlays.
export {
  Ark as WbArk,
  ZoomBrodsmule,
  FlyttTilArk,
  PreviewArk,
  Ring,
  MaalStripe,
  SerieVelger,
  EgentreningVindu,
} from "./wb-mobil";
export type {
  ArkProps as WbArkProps,
  ZoomBrodsmuleProps,
  DagValg,
  FlyttTilArkProps,
  FormelChip,
  PreviewOvelse,
  PreviewArkProps,
  RingProps,
  ProsessMal,
  MaalStripeProps,
  SerieVelgerProps,
  EgentreningVinduProps,
} from "./wb-mobil";

export { Icon } from "./icon";
export type { IconProps } from "./icon";
