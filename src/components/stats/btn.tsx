/**
 * Stats Btn — primary / secondary / ghost / outline / on-light-outline variants
 * Server component — no client state needed.
 */

import { StatsIcon, type StatsIconName } from "./icon";

type BtnVariant = "primary" | "secondary" | "ghost" | "outline" | "on-light-outline";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps {
  variant?: BtnVariant;
  children: React.ReactNode;
  icon?: StatsIconName | null;
  iconAfter?: boolean;
  size?: BtnSize;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function StatsBtn({
  variant = "primary",
  children,
  icon = "ArrowRight",
  iconAfter = true,
  size = "md",
  onClick,
  className = "",
}: BtnProps) {
  const cls = `stats-btn stats-btn-${variant} stats-btn-${size}${className ? ` ${className}` : ""}`;

  return (
    <button className={cls} onClick={onClick}>
      {!iconAfter && icon && <StatsIcon name={icon} size={16} />}
      <span>{children}</span>
      {iconAfter && icon && (
        <StatsIcon name={icon} size={16} className="stats-btn-icon" />
      )}
    </button>
  );
}
