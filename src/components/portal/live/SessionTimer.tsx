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
  /**
   * "dark"  — hvit tekst / bakgrunns-tokens (brukes i dark live-shell).
   * "light" — foreground-tekst / card-bakgrunn (brukes i lys aktiv-økt).
   */
  variant?: "dark" | "light";
};

function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Stor timer for live-økt.
 *
 * Variant "dark": hvit tekst, brukes i forest-mørk shell.
 * Variant "light": foreground-tekst, brukes i lys aktiv-økt.
 */
export function SessionTimer({
  seconds,
  paused,
  onTogglePause,
  label = "Økt-tid",
  variant = "dark",
}: SessionTimerProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-[14px] border px-4 py-4 ${
        isDark
          ? "border-background/10 bg-background/5"
          : "border-border bg-card shadow-sm"
      }`}
    >
      <div>
        <div
          className={`font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] ${
            isDark ? "text-background/55" : "text-muted-foreground"
          }`}
        >
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
        className={`grid h-14 w-14 place-items-center rounded-full border active:scale-95 ${
          isDark
            ? "border-background/20 bg-background/10 text-background"
            : "border-border bg-secondary text-foreground"
        }`}
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
