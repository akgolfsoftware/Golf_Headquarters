import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

type IconProps = Omit<LucideProps, "size"> & {
  icon: LucideIcon;
  size?: IconSize | number;
};

/**
 * Icon-wrapper for Lucide-ikoner med size-presets.
 *
 * Bruk:
 * <Icon icon={Dumbbell} size="md" />
 * <Icon icon={Calendar} size="lg" className="text-primary" />
 */
export function Icon({
  icon: IconComponent,
  size = "md",
  className,
  ...rest
}: IconProps) {
  const sizeValue = typeof size === "number" ? size : sizeMap[size];

  return (
    <IconComponent
      size={sizeValue}
      strokeWidth={1.75}
      className={cn("shrink-0", className)}
      aria-hidden
      {...rest}
    />
  );
}
