"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function DelKnapp({ tittel }: { tittel: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function del() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: tittel, url });
        return;
      } catch {
        // Bruker avbrøt deling, eller share feilet — fall tilbake til clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 2000);
    } catch {
      // Clipboard utilgjengelig (f.eks. usikker kontekst) — ingen handling.
    }
  }

  return (
    <button
      type="button"
      onClick={del}
      className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline underline-offset-2 hover:opacity-80"
    >
      {kopiert ? (
        <>
          <Check className="h-3 w-3" strokeWidth={2} />
          Lenke kopiert
        </>
      ) : (
        <>
          <Share2 className="h-3 w-3" strokeWidth={2} />
          Del
        </>
      )}
    </button>
  );
}
