/**
 * Golfdata-familien — portet 1:1 fra design-handover v13
 * (public/design-handover/components/golfdata/ + de 4 avhengighetene
 * HeroTall, DeltaIndikator, Skeleton, Icon). CSS: ./golfdata.css
 * (wires via globals.css), tokens: src/styles/golfdata-tokens.css
 * (.golfdata-scope). DS-Skeleton eksporteres KUN herfra — appens
 * generelle Skeleton bor i @/components/ui.
 */

// Avhengigheter
export { HeroTall, type HeroTallProps } from "./HeroTall";
export { DeltaIndikator, type DeltaIndikatorProps } from "./DeltaIndikator";
export { Skeleton, SkeletonRow, type SkeletonProps, type SkeletonRowProps, type SkeletonVariant } from "./Skeleton";
export { Icon, ICON_NAMES, type IconProps } from "./Icon";

// Golfdata-komponentene (14)
export { DiagnoseKort, type DiagnoseKortProps, type DiagnoseBevis, type DiagnoseResept } from "./DiagnoseKort";
export { GappingChart, type GappingChartProps, type Kolle } from "./GappingChart";
export { KategoriKravKort, type KategoriKravKortProps, type Kravrad } from "./KategoriKravKort";
export { LaunchWindowKort, type LaunchWindowKortProps, type LaunchSkudd, type LaunchVindu } from "./LaunchWindowKort";
export { NesteFokusKort, type NesteFokusKortProps } from "./NesteFokusKort";
export { PuttModellKort, type PuttModellKortProps, type PuttBand } from "./PuttModellKort";
export { Scorekort, type ScorekortProps, type Hull, type Scoresammendrag } from "./Scorekort";
export { SgKategoriBar, type SgKategoriBarProps, type SgKategori } from "./SgKategoriBar";
export { SgTotalKort, type SgTotalKortProps } from "./SgTotalKort";
export { SgTrend, type SgTrendProps, type SgPunkt, type SgHendelse } from "./SgTrend";
export { SlagLekkasjeKart, type SlagLekkasjeKartProps, type LekkasjeBaand } from "./SlagLekkasjeKart";
export { SpillerTilstandKort, type SpillerTilstandKortProps } from "./SpillerTilstandKort";
export { StrikeSmashKort, type StrikeSmashKortProps, type StrikeSone } from "./StrikeSmashKort";
export { TigerFiveKort, type TigerFiveKortProps, type TigerFiveMetrikk } from "./TigerFiveKort";
