"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { sendLiveMelding } from "./actions";

type Props = {
  sessionId: string;
};

export function LiveMelding({ sessionId }: Props) {
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [isPending, startTransition] = useTransition();

  function håndterSend() {
    const trimmet = tekst.trim();
    if (trimmet.length === 0) {
      setFeil("Skriv en melding først");
      return;
    }
    setFeil(null);
    setSendt(false);
    startTransition(async () => {
      const res = await sendLiveMelding(sessionId, trimmet);
      if (!res.ok) {
        setFeil(res.error);
      } else {
        setTekst("");
        setSendt(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={tekst}
          onChange={(e) => {
            setTekst(e.target.value);
            setSendt(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isPending) {
              e.preventDefault();
              håndterSend();
            }
          }}
          disabled={isPending}
          placeholder="Skriv en rask melding..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="button"
          onClick={håndterSend}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Send
        </button>
      </div>
      {feil && <span className="text-xs text-destructive">{feil}</span>}
      {sendt && !isPending && (
        <span className="flex items-center gap-1 text-xs text-success">
          <Check className="h-3.5 w-3.5" />
          Sendt til spiller
        </span>
      )}
    </div>
  );
}
