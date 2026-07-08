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

// Fundament-komponenter (Bolk 0) — v13 core/ + data/
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { Card, type CardProps } from "./Card";
export { Eyebrow, type EyebrowProps } from "./Eyebrow";
export { DataPreview, nearestIndex, type DataPreviewProps, type DataPreviewRow } from "./DataPreview";
export { Sparkline, type SparklineProps } from "./Sparkline";
export { KpiTile, type KpiTileProps } from "./KpiTile";
export { DataTable, type TableColumn, type DataTableProps } from "./DataTable";
export { RingGauge, type RingGaugeProps, type RingGaugeZone } from "./RingGauge";
export { Progress, type ProgressProps, type ProgressVariant } from "./Progress";
export { AiTipCard, TipMetric, type AiTipCardProps } from "./AiTipCard";
export { Heatmap, type HeatmapProps } from "./Heatmap";

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

// Kalender-familien (portert D1, 2026-07-06)
export { UkeKalender, type UkeKalenderProps, type UkeDag, type UkeSession, type Compliance, type UkeAkse } from "./UkeKalender";
export { TidsGrid, type TidsGridProps, type TidsGridKolonneProps, type TidsGridBlokkProps, type TidsGridFlytt, type TidsGridAkse } from "./TidsGrid";
export { Tidslinje, type TidslinjeProps, type TidslinjeBaneProps, type TidslinjeBarProps, type TidslinjePunktProps, type TidslinjeFlytt, type TidslinjeAkse } from "./Tidslinje";
export { Periodeplan, type PeriodeplanProps, type Phase, type Tournament, type LFase } from "./Periodeplan";
export { DayStrip, type DayStripProps, type DayStripDay } from "./DayStrip";
export { AgendaRow, type AgendaRowProps, type AgendaAkFormel } from "./AgendaRow";
export { VisningsVelger, type VisningsVelgerProps, type KalenderVisning } from "./VisningsVelger";

// Domene-familien (portert D1, 2026-07-06)
export { Tag, CountBadge, type TagProps, type TagVariant, type TagSize, type CountBadgeProps } from "./Tag";
export { OektKort, type OektKortProps, type OektAxis, type OektState } from "./OektKort";
export { AKFormelChip, type AKFormelChipProps } from "./AKFormelChip";
export { LiveStatus, type LiveStatusProps } from "./LiveStatus";
export { LFaseBadge, type LFaseBadgeProps, type LFase as LFaseBadgeFase } from "./LFaseBadge";
