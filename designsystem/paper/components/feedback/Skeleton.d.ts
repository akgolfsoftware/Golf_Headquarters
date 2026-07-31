export interface SkeletonProps {
  /** "block" flate · "text" linjer · "circle" avatar · "number" mono-tall */
  variant?: "block" | "text" | "circle" | "number";
  /** Ignoreres for circle (height styrer diameteren) */
  width?: number | string;
  height?: number | string;
  /** Antall linjer for variant="text". Siste linje er alltid kortere */
  lines?: number;
  radius?: number | string;
  dataOdId?: string;
}
