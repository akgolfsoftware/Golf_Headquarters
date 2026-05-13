"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  /** Tekst som skal kopieres. Hvis null brukes window.location.href. */
  text?: string | null;
  label?: string;
  className?: string;
  iconSize?: number;
};

/**
 * Knapp som kopierer tekst til utklippstavlen via `navigator.clipboard`.
 * Bytter etikett til "Kopiert" i 2 sekunder etter klikk.
 */
export function CopyButton({
  text,
  label = "Kopier",
  className,
  iconSize = 16,
}: CopyButtonProps) {
  const [kopiert, setKopiert] = useState(false);

  async function handleClick() {
    try {
      const verdi = text ?? window.location.href;
      await navigator.clipboard.writeText(verdi);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch (err) {
      console.error("[CopyButton] kopiering feilet", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
      }
    >
      {kopiert ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <Copy style={{ width: iconSize, height: iconSize }} />
      )}
      {kopiert ? "Kopiert" : label}
    </button>
  );
}
