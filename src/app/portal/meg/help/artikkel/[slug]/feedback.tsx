"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";

export function ArtikkelFeedback() {
  const [takket, setTakket] = useState(false);

  if (takket) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
        <Check className="h-3.5 w-3.5" strokeWidth={2} />
        Takk for tilbakemeldingen!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setTakket(true)}
        className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
      >
        <ThumbsUp className="h-3.5 w-3.5" strokeWidth={2} />
        Ja, fikk svar <span className="font-mono text-[11px] text-primary/70">143</span>
      </button>
      <button
        type="button"
        onClick={() => setTakket(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40"
      >
        <ThumbsDown className="h-3.5 w-3.5" strokeWidth={2} />
        Nei, savner noe <span className="font-mono text-[11px]">8</span>
      </button>
    </div>
  );
}
