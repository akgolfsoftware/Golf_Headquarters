"use client";

/**
 * AIForeslaaDrillModal — modal som foreslår drills basert på spillerens
 * SG-svakheter de siste 90 dagene.
 *
 * Variant A "Modal default spec" fra Claude Design-bundle Sg2FEKvykU45c4naIgQx6w
 * (s5-ai-drill.jsx).
 *
 * Tre tilstander: LOADING / RESULT / ERROR. Result-tilstand viser
 * WeaknessHero + 3 DrillCards med "Hvorfor denne?" + multi-select.
 */

import { useState, useEffect } from "react";
import { Check, Plus, Sparkles } from "lucide-react";
import { AthleticButton } from "@/components/athletic";
import { AIForeslagModalShell } from "./modal-shell";

type DrillState = "LOADING" | "RESULT" | "ERROR";

type DrillSuggestion = {
  title: string;
  category: string;
  categoryColor: string;
  time: string;
  why: string;
  repmal: string;
  trackman: boolean;
};

const SUGGESTIONS: DrillSuggestion[] = [
  {
    title: "Lag-på-lag stigespill 1m → 3m",
    category: "PUTT",
    categoryColor: "bg-[#FDE68A] text-[#7C4A03]",
    time: "12 min",
    why: "Du taper 2,4 slag/runde på putter mellom 1–3m. Stige-format gjør deg trygg på short-side recoveries.",
    repmal: "8 av 10 inn",
    trackman: true,
  },
  {
    title: "Gate-putt med start-linje",
    category: "PUTT",
    categoryColor: "bg-[#FDE68A] text-[#7C4A03]",
    time: "10 min",
    why: "TrackMan-data viser start-vinkel-spredning på 2,1°. Gate-drillen halverer dette på 2 uker.",
    repmal: "6 av 8 gjennom gate",
    trackman: true,
  },
  {
    title: "Speed-kontroll 6m + lag-putt",
    category: "PUTT",
    categoryColor: "bg-[#FDE68A] text-[#7C4A03]",
    time: "14 min",
    why: "Speed-feil > 1m på 38% av langputt. Tre-distanse-drillen kalibrerer rytmen.",
    repmal: "70% innenfor 0,5m",
    trackman: false,
  },
];

export function AIForeslaaDrillModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd?: (titles: string[]) => void;
}) {
  const [state, setState] = useState<DrillState>("LOADING");
  const [picked, setPicked] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    if (!open) return;
    setState("LOADING");
    setPicked(new Set([0]));
    const t = setTimeout(() => setState("RESULT"), 1100);
    return () => clearTimeout(t);
  }, [open]);

  function toggle(i: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleAdd() {
    const titles = SUGGESTIONS.filter((_, i) => picked.has(i)).map((s) => s.title);
    onAdd?.(titles);
    onClose();
  }

  return (
    <AIForeslagModalShell
      open={open}
      onClose={onClose}
      eyebrow="AI · Claude"
      titleLead="AI-foreslå"
      titleItalic="drill"
      footerLeft="Basert på 90 dager · cachet 24t"
      footerRight={
        <>
          <AthleticButton type="button" variant="ghost-light" size="sm" onClick={onClose}>
            Avbryt
          </AthleticButton>
          <AthleticButton
            type="button"
            variant="lime"
            size="sm"
            disabled={picked.size === 0}
            onClick={handleAdd}
          >
            Legg til {picked.size} drill{picked.size === 1 ? "" : "s"}
          </AthleticButton>
        </>
      }
    >
      {state === "LOADING" ? <LoadingShell /> : null}
      {state === "ERROR" ? <ErrorShell onRetry={() => setState("LOADING")} /> : null}
      {state === "RESULT" ? (
        <div className="space-y-4">
          <WeaknessHero />
          {SUGGESTIONS.map((d, i) => (
            <DrillCard
              key={d.title}
              drill={d}
              picked={picked.has(i)}
              onPick={() => toggle(i)}
            />
          ))}
        </div>
      ) : null}
    </AIForeslagModalShell>
  );
}

// ─────────────────────────────────────────────────────────── sub-views ──

function WeaknessHero() {
  return (
    <div className="grid grid-cols-[36px_1fr_auto] items-center gap-4 rounded-2xl border border-accent border-l-[4px] border-l-accent bg-gradient-to-br from-accent/25 to-accent/5 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-accent">
        <Sparkles className="h-4 w-4" />
      </div>
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
          TOP-OF-MIND
        </div>
        <div className="font-display mt-1 text-base font-semibold tracking-tight">
          Du taper mest slag på{" "}
          <em
            className="font-normal not-italic"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              color: "#005840",
            }}
          >
            putt &lt; 2,5m
          </em>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          SG·PUTT
        </div>
        <div className="font-mono text-2xl font-bold text-destructive tabular-nums">
          −2,4
        </div>
        <div className="font-mono text-[9.5px] uppercase tracking-[0.04em] text-muted-foreground">
          siste 90 dg
        </div>
      </div>
    </div>
  );
}

function DrillCard({
  drill,
  picked,
  onPick,
}: {
  drill: DrillSuggestion;
  picked: boolean;
  onPick: () => void;
}) {
  return (
    <article
      className={`flex flex-col gap-2.5 rounded-2xl border bg-card p-4 transition ${
        picked ? "border-primary shadow-[0_0_0_3px_rgba(0,88,64,0.08)]" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className={`font-mono inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${drill.categoryColor}`}
            >
              {drill.category}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              {drill.time}
            </span>
            {drill.trackman ? (
              <span className="font-mono rounded-sm bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-orange-700">
                TM
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-base font-semibold leading-snug tracking-tight">
            {drill.title}
          </h3>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
            REP-MÅL
          </div>
          <div className="font-mono mt-0.5 text-xs font-semibold tabular-nums">
            {drill.repmal}
          </div>
        </div>
      </div>
      <div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Hvorfor denne?
        </div>
        <p
          className="mt-1 text-sm leading-relaxed"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
        >
          {drill.why}
        </p>
      </div>
      <button
        type="button"
        onClick={onPick}
        className={`font-display mt-1 inline-flex h-9 items-center gap-1.5 self-start rounded-full px-4 text-xs font-bold transition ${
          picked
            ? "bg-primary text-accent"
            : "bg-accent text-primary hover:brightness-105"
        }`}
      >
        {picked ? (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Lagt til
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> Legg til i ukens plan
          </>
        )}
      </button>
    </article>
  );
}

function LoadingShell() {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-3 py-2">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-border border-t-primary" />
        <div>
          <div className="font-display text-sm font-semibold">
            Analyserer dine siste 90 dager …
          </div>
          <div className="font-mono mt-1 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
            SG-data · TrackMan · økt-historikk
          </div>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl bg-muted"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

function ErrorShell({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-destructive/25 border-l-[3px] border-l-destructive bg-destructive/10 p-5">
      <div className="font-display text-base font-semibold text-destructive">
        Kunne ikke generere forslag akkurat nå
      </div>
      <p className="text-sm leading-relaxed">
        Vi kommer ikke til Claude-API&apos;en — kanskje du er offline? Prøv igjen,
        eller velg drills manuelt fra biblioteket.
      </p>
      <div className="mt-1 flex gap-2">
        <AthleticButton type="button" variant="lime" size="sm" onClick={onRetry}>
          Prøv igjen
        </AthleticButton>
        <AthleticButton type="button" variant="ghost-light" size="sm">
          Åpne drill-bibliotek
        </AthleticButton>
      </div>
    </div>
  );
}
