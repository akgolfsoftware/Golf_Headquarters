import { Minus } from "lucide-react";

export type RepCounterProps = {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  /** Fremhev som hovedteller. */
  primary?: boolean;
  /** Skjul minus-knapp (true = kun +). */
  hideDecrement?: boolean;
  /** Skjul +knapper (bruks for kun-visning). */
  readOnly?: boolean;
};

const INCREMENTS = [1, 5, 10, 25] as const;

/**
 * Rep-teller med store +1/+5/+10/+25-knapper.
 *
 * Touch-mål ≥ 56 px, tydelig tall med JetBrains Mono.
 */
export function RepCounter({
  label,
  value,
  onChange,
  primary = false,
  hideDecrement = false,
  readOnly = false,
}: RepCounterProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        primary
          ? "border-accent/30 bg-accent/10"
          : "border-background/10 bg-background/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] ${
            primary ? "text-accent" : "text-background/55"
          }`}
        >
          {label}
        </span>
        {!readOnly && !hideDecrement && (
          <button
            type="button"
            onClick={() => onChange?.(Math.max(0, value - 1))}
            aria-label={`Trekk fra 1 ${label}`}
            className="grid h-10 w-10 place-items-center rounded-full border border-background/10 text-background/60 active:bg-background/10"
          >
            <Minus className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        )}
      </div>

      <div
        className={`my-2 text-center font-mono text-5xl font-bold leading-none tracking-tight ${
          primary ? "text-accent" : "text-background"
        }`}
        aria-live="polite"
      >
        {value}
      </div>

      {!readOnly && (
        <div className="grid grid-cols-4 gap-2">
          {INCREMENTS.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => onChange?.(value + inc)}
              aria-label={`Legg til ${inc} ${label}`}
              className="flex h-14 items-center justify-center rounded-xl border border-background/15 bg-background/10 font-mono text-lg font-bold text-background active:scale-95 active:bg-background/15"
            >
              +{inc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
