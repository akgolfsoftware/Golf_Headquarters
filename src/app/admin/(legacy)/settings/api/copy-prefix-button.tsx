"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyPrefixButton({ prefix }: { prefix: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(prefix);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch (err) {
      console.error("[CopyPrefixButton] kopiering feilet", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
      aria-label="Kopier prefix"
      title={kopiert ? "Kopiert" : "Kopier prefix"}
    >
      {kopiert ? (
        <Check className="h-3 w-3 text-primary" strokeWidth={1.5} />
      ) : (
        <Copy className="h-3 w-3" strokeWidth={1.5} />
      )}
    </button>
  );
}
