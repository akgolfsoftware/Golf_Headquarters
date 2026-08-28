"use client";

/**
 * Spiller-vurdering etter live-økt — write-back til completedSummary + plan-notes.
 * Paper-restylet (PP-3): nøytral ink-knapp — skjermens ene clay-CTA er
 * «Lagre til loggen» i SessionSummary.
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
    rpe?: number | null;
  } | null;
};

const EYEBROW = "font-mono text-[10px] font-medium uppercase tracking-[0.09em]";
const FELT_LABEL = "mb-1 block font-mono text-[9.5px] font-medium uppercase tracking-[0.06em]";

function TallKnapp({
  n,
  valgt,
  onClick,
  ariaLabel,
  liten,
}: {
  n: number;
  valgt: boolean;
  onClick: () => void;
  ariaLabel: string;
  liten?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={valgt}
      aria-label={ariaLabel}
      className={`grid place-items-center font-mono font-semibold ${liten ? "h-9 w-9 text-[12px]" : "h-11 w-11 text-[13px]"}`}
      style={{
        borderRadius: 9999,
        border: `1px solid ${valgt ? "var(--tl-text)" : "var(--tl-hair)"}`,
        background: valgt ? "var(--tl-text)" : "var(--tl-elev)",
        color: valgt ? "var(--tl-scene)" : "var(--tl-mute)",
      }}
    >
      {n}
    </button>
  );
}

export function SpillerVurderingForm({ sessionId, eksisterende }: Props) {
  const [kvalitet, setKvalitet] = useState(eksisterende?.kvalitet ?? 0);
  const [rpe, setRpe] = useState(eksisterende?.rpe ?? 0);
  const [nesteFokus, setNesteFokus] = useState(eksisterende?.nesteFokus ?? "");
  const [folelse, setFolelse] = useState(eksisterende?.folelse ?? "");
  const [lagret, setLagret] = useState(Boolean(eksisterende));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (lagret) {
    return (
      <div
        className="p-4"
        style={{ background: "var(--tl-elev)", border: "1px solid var(--tl-hair)", borderRadius: 12 }}
      >
        <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
          din vurdering
        </span>
        <p className="mb-0 mt-2 font-serif text-[13.5px]" style={{ color: "var(--tl-text)" }}>
          Kvalitet: {kvalitet || eksisterende?.kvalitet}/5
          {(rpe || eksisterende?.rpe) ? ` · RPE ${rpe || eksisterende?.rpe}/10` : ""}
          {(folelse || eksisterende?.folelse) ? ` · ${folelse || eksisterende?.folelse}` : ""}
        </p>
        {(nesteFokus || eksisterende?.nesteFokus) ? (
          <p className="mb-0 mt-1 font-serif text-[13px]" style={{ color: "var(--tl-mute)" }}>
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
    if (rpe < 1) {
      setFeil("Velg hvor hard økta var (1–10)");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await lagreSpillerVurdering(sessionId, {
        kvalitet,
        nesteFokus,
        folelse: folelse || undefined,
        rpe,
      });
      if (!res.ok) {
        setFeil(res.error ?? "Kunne ikke lagre");
        return;
      }
      setLagret(true);
    });
  }

  return (
    <div
      className="p-4"
      style={{ background: "var(--tl-elev)", border: "1px solid var(--tl-hair)", borderRadius: 12 }}
    >
      <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
        hvordan var økta?
      </span>
      <p className="mb-3 mt-1 font-serif text-[12.5px]" style={{ color: "var(--tl-mute)" }}>
        Kvalitet og neste fokus går til coachen — informasjon, aldri sperre.
      </p>

      <div className="mb-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <TallKnapp
            key={n}
            n={n}
            valgt={kvalitet === n}
            onClick={() => setKvalitet(n)}
            ariaLabel={`Kvalitet ${n}`}
          />
        ))}
      </div>

      <label className={FELT_LABEL} style={{ color: "var(--tl-mute)" }}>
        Hvor hard var økta? (1 = veldig lett · 10 = maksimal)
      </label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <TallKnapp
            key={n}
            n={n}
            liten
            valgt={rpe === n}
            onClick={() => setRpe(n)}
            ariaLabel={`Anstrengelse ${n} av 10`}
          />
        ))}
      </div>

      <label className={FELT_LABEL} style={{ color: "var(--tl-mute)" }}>
        Følelse (valgfritt)
      </label>
      <input
        value={folelse}
        onChange={(e) => setFolelse(e.target.value)}
        placeholder="F.eks. fokusert, sliten, motivert"
        className="mb-3 w-full px-3 py-2.5 font-serif text-[13px]"
        style={{
          background: "var(--tl-scene)",
          color: "var(--tl-text)",
          border: "1px solid var(--tl-hair)",
          borderRadius: 8,
        }}
        maxLength={200}
      />

      <label className={FELT_LABEL} style={{ color: "var(--tl-mute)" }}>
        Neste fokus
      </label>
      <textarea
        value={nesteFokus}
        onChange={(e) => setNesteFokus(e.target.value)}
        placeholder="Hva bør neste økt prioritere?"
        rows={2}
        className="mb-3 w-full px-3 py-2.5 font-serif text-[13px]"
        style={{
          background: "var(--tl-scene)",
          color: "var(--tl-text)",
          border: "1px solid var(--tl-hair)",
          borderRadius: 8,
        }}
        maxLength={500}
      />

      {feil ? (
        <p className="mb-2 font-serif text-[12px]" style={{ color: "var(--tl-danger)" }} role="alert">
          {feil}
        </p>
      ) : null}

      <button
        type="button"
        disabled={pending || lagret}
        onClick={onSubmit}
        className="w-full border-none font-sans text-[13px] font-medium disabled:opacity-50"
        style={{
          minHeight: 48,
          borderRadius: 12,
          background: "var(--tl-fill)",
          color: "var(--tl-on-fill)",
        }}
      >
        {pending ? "Lagrer…" : "Lagre vurdering"}
      </button>
    </div>
  );
}
