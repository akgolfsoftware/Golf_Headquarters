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
  default: "var(--s-fg)",
  lime: "var(--s-primary)",
  muted: "var(--s-muted-fg)",
};

const DOT_BG: Record<string, string> = {
  default: "var(--s-primary)",
  lime: "var(--s-primary)",
  muted: "var(--s-muted-fg)",
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
