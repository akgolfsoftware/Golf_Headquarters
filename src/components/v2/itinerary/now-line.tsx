export type NowLineProps = {
  label: string;
  sub?: string;
};

export default function NowLine({ label, sub }: NowLineProps) {
  return (
    <div
      className="grid items-center gap-3"
      style={{ gridTemplateColumns: "80px 28px 1fr" }}
    >
      <div
        className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-right"
        style={{ color: "var(--destructive)" }}
      >
        NÅ · {label}
      </div>

      <div className="grid place-items-center">
        <span className="now-dot" aria-hidden />
      </div>

      <div
        className="relative"
        style={{
          height: 1,
          background:
            "repeating-linear-gradient(to right, var(--destructive) 0 6px, transparent 6px 12px)",
          opacity: 0.7,
        }}
      >
        {sub && (
          <span
            className="absolute inline-block font-mono text-[10px] font-bold uppercase tracking-[0.10em]"
            style={{
              transform: "translateY(-8px)",
              marginLeft: 16,
              color: "var(--destructive)",
              background: "var(--background)",
              padding: "0 8px",
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
