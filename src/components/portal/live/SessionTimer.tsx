import { Pause, Play } from "lucide-react";

export type SessionTimerProps = {
  /** Medgått tid i sekunder. */
  seconds: number;
  /** Er timeren pauset? */
  paused: boolean;
  /** Bytt pause/fortsett. */
  onTogglePause: () => void;
  /** Valgfri etikett over tiden. */
  label?: string;
};

function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Stor timer for live-økt.
 *
 * JetBrains Mono for tall, tydelig pause/fortsett-knapp.
 */
export function SessionTimer({
  seconds,
  paused,
  onTogglePause,
  label = "Økt-tid",
}: SessionTimerProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-background/10 bg-background/5 px-4 py-4">
      <div>
        <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-background/55">
          {label}
        </div>
        <div
          className="mt-2 font-mono text-5xl font-bold leading-none tracking-tight text-accent"
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
        className="grid h-14 w-14 place-items-center rounded-full border border-background/20 bg-background/10 text-background active:scale-95"
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
