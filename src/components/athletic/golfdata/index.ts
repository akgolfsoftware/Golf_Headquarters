/**
 * Golfdata-familien — overgangslag fra design-handover v13. Trimmet
 * 2026-08-03 (forenkling bølge 1): kun komponentene som faktisk
 * importeres fra skjermer gjenstår + deres interne avhengigheter
 * (Icon, DataPreview, Skeleton). CSS: ./golfdata.css (wires via
 * globals.css), tokens: src/styles/golfdata-tokens.css (.golfdata-scope).
 * DS-Skeleton eksporteres KUN herfra — appens generelle Skeleton bor
 * i @/components/ui. Slettede komponenter kan hentes fra git-historikken.
 */

// Interne avhengigheter
export { Skeleton, SkeletonRow, type SkeletonProps, type SkeletonRowProps, type SkeletonVariant } from "./Skeleton";
export { Icon, ICON_NAMES, type IconProps } from "./Icon";
export { DataPreview, nearestIndex, type DataPreviewProps, type DataPreviewRow } from "./DataPreview";

// Fundament
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { Card, type CardProps } from "./Card";
export { Eyebrow, type EyebrowProps } from "./Eyebrow";
export { Sparkline, type SparklineProps } from "./Sparkline";
export { KpiTile, type KpiTileProps } from "./KpiTile";

// Kalender
export { TidsGrid, type TidsGridProps, type TidsGridKolonneProps, type TidsGridBlokkProps, type TidsGridFlytt, type TidsGridAkse } from "./TidsGrid";
export { MaanedKalender, type MaanedKalenderProps, type MaanedDag, type MaanedOkt, type MaanedAkse, type MaanedFlytt } from "./MaanedKalender";

// Domene
export { Tag, CountBadge, type TagProps, type TagVariant, type TagSize, type CountBadgeProps } from "./Tag";
export { Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps, type AvatarSize } from "./Avatar";
export { StatusDot, type StatusDotProps, type StatusTone } from "./StatusDot";
export { AkseFordelingsBar, type AkseFordelingsBarProps, type AkseFordeling } from "./AkseFordelingsBar";
