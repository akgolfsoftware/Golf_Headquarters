"use client";

import { useState } from "react";
import { Pencil, Trash2, Share2, Check } from "lucide-react";

type Props = {
  eier: boolean;
  notatId: string;
};

/**
 * Action-bar for notat-detalj.
 * Rediger vises kun om bruker er eier. Slett krever bekreftelse.
 * Del-handlingen åpner en enkel "kopiert til utklippstavle"-toast-stub.
 */
export function NotatDetailClient({ eier, notatId }: Props) {
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [deltMed, setDeltMed] = useState(false);

  function delMedCoach() {
    // Stub — wires opp mot server action senere.
    setDeltMed(true);
    setTimeout(() => setDeltMed(false), 2500);
  }

  function slett() {
    if (!bekreftSlett) {
      setBekreftSlett(true);
      setTimeout(() => setBekreftSlett(false), 4000);
      return;
    }
    // Stub — wires opp mot server action senere.
    window.alert(`Notat ${notatId} slettet (stub).`);
  }

  return (
    <div className="ml-auto flex flex-wrap items-center gap-2">
      {eier && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Pencil size={12} strokeWidth={1.75} />
          Rediger
        </button>
      )}
      <button
        type="button"
        onClick={delMedCoach}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
          deltMed
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-foreground hover:bg-secondary"
        }`}
      >
        {deltMed ? (
          <>
            <Check size={12} strokeWidth={1.75} />
            Delt
          </>
        ) : (
          <>
            <Share2 size={12} strokeWidth={1.75} />
            Del med coach
          </>
        )}
      </button>
      {eier && (
        <button
          type="button"
          onClick={slett}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
            bekreftSlett
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-border bg-card text-foreground hover:bg-secondary"
          }`}
        >
          <Trash2 size={12} strokeWidth={1.75} />
          {bekreftSlett ? "Bekreft sletting" : "Slett"}
        </button>
      )}
    </div>
  );
}
