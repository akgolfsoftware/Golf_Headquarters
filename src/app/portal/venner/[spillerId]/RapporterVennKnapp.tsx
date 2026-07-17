"use client";

/**
 * Rapporter-inngang på venn-profilen (D5, rapporteringsflyt). Venn-profilen er
 * den ENE flaten med brukergenerert innhold en annen bruker faktisk ser (navn +
 * aktivitetsfeed) — derfor bor rapporter-handlingen her, ikke strødd overalt.
 * Oppretter en RAPPORTERT_INNHOLD-sak (status OPEN) i moderering-køen.
 */

import { useState, useTransition } from "react";
import { Flag, Check } from "lucide-react";
import { Knapp } from "@/components/v2";
import { opprettRapport } from "@/lib/moderering/actions";

export function RapporterVennKnapp({ vennUserId }: { vennUserId: string }) {
  const [apen, setApen] = useState(false);
  const [begrunnelse, setBegrunnelse] = useState("");
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);

  function send() {
    setFeil(null);
    startTransition(async () => {
      const res = await opprettRapport("SPILLERPROFIL", vennUserId, begrunnelse);
      if (!res.ok) {
        setFeil(res.error ?? "Kunne ikke sende rapport. Prøv igjen.");
        return;
      }
      setSendt(true);
      setApen(false);
      setBegrunnelse("");
    });
  }

  if (sendt) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2} aria-hidden />
        Rapport sendt — takk. En coach ser på den.
      </div>
    );
  }

  if (!apen) {
    return (
      <button
        type="button"
        onClick={() => setApen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Flag size={14} strokeWidth={1.5} />
        Rapporter
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">Rapporter denne profilen</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Fortell kort hva som er galt. En coach eller administrator vurderer
        rapporten. Vi deler ikke hvem som har rapportert.
      </p>
      <textarea
        value={begrunnelse}
        onChange={(e) => setBegrunnelse(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Hva vil du melde fra om?"
        className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      {feil ? (
        <p className="font-mono mt-2 text-[11px] tracking-[0.06em] text-destructive">{feil}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Knapp onClick={send} disabled={pending || begrunnelse.trim().length === 0}>
          <Flag className="h-4 w-4" />
          {pending ? "Sender…" : "Send rapport"}
        </Knapp>
        <Knapp
          ghost
          disabled={pending}
          onClick={() => {
            setApen(false);
            setBegrunnelse("");
            setFeil(null);
          }}
        >
          Avbryt
        </Knapp>
      </div>
    </div>
  );
}
