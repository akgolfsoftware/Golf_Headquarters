"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Check, Loader2 } from "lucide-react";
import { sendBriefTilSpiller } from "./actions";

type Props = {
  sessionId: string;
  initialMelding: string;
};

export function BriefSend({ sessionId, initialMelding }: Props) {
  const [melding, setMelding] = useState<string>(initialMelding);
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [isPending, startTransition] = useTransition();

  function håndterSend() {
    const trimmet = melding.trim();
    if (trimmet.length === 0) {
      setFeil("Skriv en kommentar først");
      return;
    }
    setFeil(null);
    setSendt(false);
    startTransition(async () => {
      const res = await sendBriefTilSpiller(sessionId, trimmet);
      if (!res.ok) {
        setFeil(res.error);
      } else {
        setSendt(true);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
        <MessageSquare className="inline h-3.5 w-3.5 mr-1" />
        Coach-kommentar til spilleren
      </h2>
      <textarea
        rows={4}
        value={melding}
        onChange={(e) => {
          setMelding(e.target.value);
          setSendt(false);
        }}
        disabled={isPending}
        placeholder="Skriv en kommentar eller fokuspunkt til spilleren før økten starter..."
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Vises til spiller i brief-skjermen
        </p>
        <div className="flex items-center gap-3">
          {feil && <span className="text-xs text-destructive">{feil}</span>}
          {sendt && !isPending && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check className="h-3.5 w-3.5" />
              Sendt
            </span>
          )}
          <button
            type="button"
            onClick={håndterSend}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Send til spiller
          </button>
        </div>
      </div>
    </div>
  );
}
