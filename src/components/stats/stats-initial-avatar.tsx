/**
 * StatsInitialAvatar — initialer-sirkel med lime bakgrunn
 * Server component.
 */

interface InitialAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_SPECS = {
  sm:  { wh: 40,  fs: 13 },
  md:  { wh: 56,  fs: 17 },
  lg:  { wh: 72,  fs: 22 },
  xl:  { wh: 96,  fs: 32 },
};

export function StatsInitialAvatar({
  name,
  size = "md",
  className = "",
}: InitialAvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const { wh, fs } = SIZE_SPECS[size];

  return (
    <div
      className={`stats-initial-avatar${className ? ` ${className}` : ""}`}
      style={{
        width: wh,
        height: wh,
        minWidth: wh,
        borderRadius: "50%",
        background: "var(--s-accent)",
        color: "var(--s-primary)",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: fs,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
