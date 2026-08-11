export type SessionTimerProps = {
  seconds: number;
  paused: boolean;
  onTogglePause: () => void;
  /** Undertekst, f.eks. «startet 15:00 · planlagt 1 t 30 min». */
  meta?: string;
  label?: string;
  /** @deprecated always paper cream */
  variant?: "dark" | "light";
};

function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Øktklokka — Paper-fasit playerhq-live-okt.html .klokke.
 * mm:ss i mono, meta-linje, Pause inline. Pause er informasjon, ikke sperre.
 */
export function SessionTimer({
  seconds,
  paused,
  onTogglePause,
  meta,
  label = "Økt-tid",
}: SessionTimerProps) {
  return (
    <div
      className="flex min-w-0 items-center gap-3 px-4 py-3"
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: 12,
      }}
    >
      <span
        className="font-mono text-[40px] font-medium leading-none [font-variant-numeric:tabular-nums]"
        style={{ color: paused ? "var(--p-muted)" : "var(--p-fg)" }}
        aria-live="polite"
        aria-label={`${label} ${fmtMSS(seconds)}${paused ? " — pauset" : ""}`}
      >
        {fmtMSS(seconds)}
      </span>
      {meta && (
        <span className="min-w-0 font-mono text-[10.5px]" style={{ color: "var(--p-muted)" }}>
          {meta}
        </span>
      )}
      <span className="flex-1" />
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? "Fortsett økt" : "Pause økt"}
        className="flex-none px-3 font-sans text-[13px] font-medium active:translate-y-px"
        style={{
          minHeight: 44,
          borderRadius: 12,
          border: "1px solid var(--p-border)",
          background: "transparent",
          color: "var(--p-fg)",
        }}
      >
        {paused ? "Fortsett" : "Pause"}
      </button>
    </div>
  );
}
