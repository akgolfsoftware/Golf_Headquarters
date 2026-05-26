/**
 * Stats Eyebrow — mono caps with optional lime/forest dot
 * Server component.
 */

interface EyebrowProps {
  children: React.ReactNode;
  dot?: boolean;
  tone?: "default" | "lime" | "muted";
  className?: string;
}

const TONE_COLOR: Record<string, string> = {
  default: "hsl(var(--primary))",
  lime: "hsl(var(--accent))",
  muted: "hsl(var(--muted-foreground))",
};

const DOT_BG: Record<string, string> = {
  default: "hsl(var(--accent))",
  lime: "hsl(var(--primary))",
  muted: "hsl(var(--accent))",
};

export function StatsEyebrow({
  children,
  dot = true,
  tone = "default",
  className = "",
}: EyebrowProps) {
  return (
    <div
      className={`stats-eyebrow${className ? ` ${className}` : ""}`}
      style={{ color: TONE_COLOR[tone] ?? TONE_COLOR.default }}
    >
      {dot && (
        <span
          className="stats-eyebrow-dot"
          style={{ background: DOT_BG[tone] ?? DOT_BG.default }}
        />
      )}
      <span>{children}</span>
    </div>
  );
}
