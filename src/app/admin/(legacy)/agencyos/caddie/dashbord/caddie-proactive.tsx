"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Check, ArrowRight, X } from "lucide-react";
import { kjorCaddieProaktiv, avvisProaktivtForslag } from "./actions";

export type ProaktivtForslag = {
  id: string;
  previewText: string;
  spillerName: string;
  dagerInaktiv: number;
};

/**
 * Proaktive Caddie-forslag (Fase 3). Caddie skanner på timeplan etter inaktive
 * spillere og lager forslag her. «Kjør nå» trigger agenten manuelt; hvert forslag
 * kan åpnes i samtale (Caddie hjelper å skrive meldingen) eller avvises.
 */
export function CaddieProactive({ forslag }: { forslag: ProaktivtForslag[] }) {
  const [pending, startTransition] = useTransition();
  const [statusTekst, setStatusTekst] = useState<string | null>(null);

  function kjorNa() {
    startTransition(async () => {
      setStatusTekst(null);
      const res = await kjorCaddieProaktiv();
      if (res.ok) {
        setStatusTekst(
          `Sjekket nå · ${res.inaktive ?? 0} inaktive funnet · ${res.created ?? 0} nye forslag`,
        );
      } else {
        setStatusTekst(`Kunne ikke kjøre: ${res.reason ?? "ukjent"}`);
      }
    });
  }

  return (
    <section className="mb-6 rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          <h2 className="font-display text-base font-bold tracking-tight text-foreground">
            Proaktive forslag fra Caddie
          </h2>
        </div>
        <button
          type="button"
          onClick={kjorNa}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          )}
          Kjør nå
        </button>
      </div>

      {statusTekst && (
        <p className="mb-3 flex items-center gap-1.5 font-mono text-[11px] text-success">
          <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {statusTekst}
        </p>
      )}

      {forslag.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-6 text-center text-[13px] text-muted-foreground">
          Ingen åpne forslag. Caddie skanner automatisk etter inaktive spillere og
          legger forslag her — trykk «Kjør nå» for å sjekke med en gang.
        </p>
      ) : (
        <ul className="space-y-2">
          {forslag.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 px-4 py-3"
            >
              <span className="text-[13px] leading-snug text-foreground">
                {f.previewText}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/agencyos/caddie?seed=${encodeURIComponent(
                    `Hjelp meg å sende en oppfølgingsmelding til ${f.spillerName} som har vært inaktiv i ${f.dagerInaktiv} dager.`,
                  )}`}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Åpne i samtale
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
                <DismissButton id={f.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DismissButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await avvisProaktivtForslag(id);
        })
      }
      disabled={pending}
      aria-label="Avvis forslag"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <X className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}
