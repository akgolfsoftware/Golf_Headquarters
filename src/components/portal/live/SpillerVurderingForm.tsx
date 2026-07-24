"use client";

/**
 * Spiller-vurdering etter live-økt — write-back til completedSummary + plan-notes.
 */

import { useState, useTransition } from "react";
import { lagreSpillerVurdering } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

type Props = {
  sessionId: string;
  /** Allerede lagret vurdering (vis lesemodus). */
  eksisterende?: {
    kvalitet: number;
    nesteFokus: string;
    folelse?: string | null;
  } | null;
};

export function SpillerVurderingForm({ sessionId, eksisterende }: Props) {
  const [kvalitet, setKvalitet] = useState(eksisterende?.kvalitet ?? 0);
  const [nesteFokus, setNesteFokus] = useState(eksisterende?.nesteFokus ?? "");
  const [folelse, setFolelse] = useState(eksisterende?.folelse ?? "");
  const [lagret, setLagret] = useState(Boolean(eksisterende));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (lagret) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
          Din vurdering
        </div>
        <p className="mt-2 text-sm text-background">
          Kvalitet: {kvalitet || eksisterende?.kvalitet}/5
          {(folelse || eksisterende?.folelse) ? ` · ${folelse || eksisterende?.folelse}` : ""}
        </p>
        {(nesteFokus || eksisterende?.nesteFokus) ? (
          <p className="mt-1 text-[13px] text-background/70">
            Neste fokus: {nesteFokus || eksisterende?.nesteFokus}
          </p>
        ) : null}
      </div>
    );
  }

  function onSubmit() {
    if (kvalitet < 1) {
      setFeil("Velg kvalitet 1–5");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await lagreSpillerVurdering(sessionId, {
        kvalitet,
        nesteFokus,
        folelse: folelse || undefined,
      });
      if (!res.ok) {
        setFeil(res.error ?? "Kunne ikke lagre");
        return;
      }
      setLagret(true);
    });
  }

  return (
    <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-background/60">
        Hvordan var økta?
      </div>
      <p className="mt-1 mb-3 text-[12.5px] text-background/65">
        Kvalitet og neste fokus går til coachen — anbefaling, ikke sperre.
      </p>

      <div className="mb-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setKvalitet(n)}
            className={`grid h-11 w-11 place-items-center rounded-full font-mono text-[13px] font-bold ${
              kvalitet === n ? "bg-accent text-accent-foreground" : "border border-background/15 bg-background/10 text-background/75"
            }`}
            aria-label={`Kvalitet ${n}`}
          >
            {n}
          </button>
        ))}
      </div>

      <label className="mb-1 block font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-background/50">
        Følelse (valgfritt)
      </label>
      <input
        value={folelse}
        onChange={(e) => setFolelse(e.target.value)}
        placeholder="F.eks. fokusert, sliten, motivert"
        className="mb-3 w-full rounded-xl border border-background/15 bg-background/5 px-3 py-2.5 text-[13px] text-background placeholder:text-background/35"
        maxLength={200}
      />

      <label className="mb-1 block font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-background/50">
        Neste fokus
      </label>
      <textarea
        value={nesteFokus}
        onChange={(e) => setNesteFokus(e.target.value)}
        placeholder="Hva bør neste økt prioritere?"
        rows={2}
        className="mb-3 w-full rounded-xl border border-background/15 bg-background/5 px-3 py-2.5 text-[13px] text-background placeholder:text-background/35"
        maxLength={500}
      />

      {feil ? <p className="mb-2 text-[12px] text-destructive">{feil}</p> : null}
      {lagret && !eksisterende ? (
        <p className="mb-2 text-[12px] text-accent">Lagret — takk!</p>
      ) : null}

      <button
        type="button"
        disabled={pending || lagret}
        onClick={onSubmit}
        className="w-full rounded-full bg-accent py-3 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-accent-foreground disabled:opacity-50"
        style={{ minHeight: 48 }}
      >
        {pending ? "Lagrer…" : "Send til coach"}
      </button>
    </div>
  );
}
