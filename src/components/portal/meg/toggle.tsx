"use client";

/**
 * Toggle — fasitens .switch (44×26, primary når på, hvit knott).
 * Kontrollert komponent; lagring håndteres av forelder (server action e.l.).
 */

export function Toggle({ on, onClick, label }: { on: boolean; onClick?: () => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={
        "relative h-[26px] w-11 shrink-0 rounded-full transition-colors " +
        (on ? "bg-primary" : "bg-muted")
      }
    >
      <span
        className={
          "absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform " +
          (on ? "translate-x-[18px]" : "")
        }
      />
    </button>
  );
}
