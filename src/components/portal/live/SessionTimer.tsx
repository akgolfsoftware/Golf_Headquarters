import { Pause, Play } from "lucide-react";
import { T } from "@/lib/v2/tokens";

export type SessionTimerProps = {
  seconds: number;
  paused: boolean;
  onTogglePause: () => void;
  label?: string;
  /** @deprecated always paper cream */
  variant?: "dark" | "light";
};

function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Stor timer for live-økt — Paper cream (fasit live-okt). */
export function SessionTimer({
  seconds,
  paused,
  onTogglePause,
  label = "Økt-tid",
}: SessionTimerProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-[14px] border px-4 py-4"
      style={{ borderColor: T.border, background: T.panel }}
    >
      <div>
        <div
          className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em]"
          style={{ color: T.mut }}
        >
          {label}
        </div>
        <div
          className="mt-2 font-mono text-5xl font-bold leading-none tracking-tight"
          style={{ color: T.handling }}
          aria-live="polite"
          aria-label={`Økt-tid ${fmtMSS(seconds)}`}
        >
          {fmtMSS(seconds)}
        </div>
      </div>
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? "Fortsett økt" : "Pause økt"}
        className="grid h-14 w-14 place-items-center rounded-full border active:scale-95 v2-press"
        style={{ borderColor: T.border, background: T.panel2, color: T.fg }}
      >
        {paused ? (
          <Play className="h-6 w-6 fill-current" strokeWidth={2} aria-hidden />
        ) : (
          <Pause className="h-6 w-6 fill-current" strokeWidth={2} aria-hidden />
        )}
      </button>
    </div>
  );
}
