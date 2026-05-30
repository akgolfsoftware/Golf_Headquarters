export type GhostNumberProps = {
  /** Number or string shown as large decorative background text */
  value: string | number;
  /** Optional className overrides */
  className?: string;
};

export default function GhostNumber({ value, className = "" }: GhostNumberProps) {
  return (
    <span
      aria-hidden
      className={[
        "font-display italic font-bold leading-none pointer-events-none select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        fontSize: 96,
        color: "color-mix(in oklab, hsl(var(--foreground)) 5%, transparent)",
      }}
    >
      {value}
    </span>
  );
}
