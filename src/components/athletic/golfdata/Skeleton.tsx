/**
 * AK Golf HQ — Skeleton / SkeletonRow
 * Shimmer placeholder shown while content loads.
 * variant: text (14px bar) · title (20px bar) · circle · card.
 * SkeletonRow: stacked lines with title + N body lines, variable width.
 */

export type SkeletonVariant = "text" | "title" | "circle" | "card";

export type SkeletonProps = {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
};

export function Skeleton({ variant = "text", width = "100%", height, style, className = "" }: SkeletonProps) {
  const baseH = ({ text: 14, title: 20 } as Partial<Record<SkeletonVariant, number>>)[variant];
  return (
    <div
      className={`ak-sk ak-sk--${variant} ${className}`}
      style={{ width, height: height || baseH, ...style }}
      aria-hidden="true"
    />
  );
}

export type SkeletonRowProps = {
  lines?: number;
  style?: React.CSSProperties;
};

export function SkeletonRow({ lines = 2, style }: SkeletonRowProps) {
  const widths = ["60%", "100%", "85%", "70%", "90%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      <Skeleton variant="title" width="55%" />
      {Array.from({ length: lines - 1 }, (_, i) => (
        <Skeleton key={i} width={widths[(i + 1) % widths.length]} />
      ))}
    </div>
  );
}
