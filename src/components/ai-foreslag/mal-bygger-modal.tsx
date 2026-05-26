"use client";

/**
 * AIMalByggerModal — 3-stegs mål-bygger som genererer SMART-mål basert på
 * spillerens input + SG-data + turneringskalender.
 *
 * Variant A "3-stegs wizard" fra Claude Design-bundle Sg2FEKvykU45c4naIgQx6w
 * (s7-ai-mal.jsx).
 */

import { useEffect, useState } from "react";
import { Check, Sparkles, Pencil } from "lucide-react";
import { AthleticButton } from "@/components/athletic";
import { AIForeslagModalShell } from "./modal-shell";

type Step = 1 | 2 | 3;

type GoalType = "OUTCOME" | "PROCESS";

type GeneratedGoal = {
  type: GoalType;
  title: string;
  kpi: string;
  timeline: string;
  dependency: string;
  defaultPicked: boolean;
};

const GENERATED_GOALS: GeneratedGoal[] = [
  {
    type: "OUTCOME",
    title: "HCP < 0 før sesongstart 2027",
    kpi: "WHS · 12 best 20",
    timeline: "12 mnd",
    dependency: "Krever 4×/uke struktur + 8 turneringer",
    defaultPicked: true,
  },
  {
    type: "PROCESS",
    title: "6 av 8 putts inn fra 2,5m i 3 sammenhengende uker",
    kpi: "TrackMan hit-rate",
    timeline: "8 uker",
    dependency: "Krever 2× putt-økt/uke",
    defaultPicked: true,
  },
  {
    type: "OUTCOME",
    title: "Topp-5 på Olyo Tour Larvik (14.06)",
    kpi: "Score-resultat",
    timeline: "21 dg",
    dependency: "Krever 3× spill-økt + putt-fokus",
    defaultPicked: false,
  },
  {
    type: "PROCESS",
    title: "Y-balanse rett+venstre = ± 4cm",
    kpi: "Fysio-test",
    timeline: "6 uker",
    dependency: "Krever 3× FYS/uke",
    defaultPicked: false,
  },
  {
    type: "PROCESS",
    title: "Pitch 30–50m · CP < 4m",
    kpi: "TrackMan CP",
    timeline: "10 uker",
    dependency: "Krever 2× pitch-økt/uke",
    defaultPicked: true,
  },
];

const TYPE_COLORS: Record<GoalType, string> = {
  OUTCOME: "bg-purple-100 text-purple-800",
  PROCESS: "bg-emerald-100 text-emerald-800",
};

export function AIMalByggerModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (goals: GeneratedGoal[]) => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [input, setInput] = useState(
    "Vil ned i scratch før neste sesong og spille topp-10 på minst én Olyo Tour-event i sommer.",
  );
  const [timeline, setTimeline] = useState("12 mnd");
  const [types, setTypes] = useState<Set<string>>(
    new Set(["HCP", "Score", "Turnering", "Skill", "Mental"]),
  );

  useEffect(() => {
    if (!open) return;
    // Reset på open: prop-drevet state-reset.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStep(1);
    setPicked(
      new Set(GENERATED_GOALS.flatMap((g, i) => (g.defaultPicked ? [i] : []))),
    );
  }, [open]);

  useEffect(() => {
    if (step !== 2) return;
    const t = setTimeout(() => setStep(3), 1400);
    return () => clearTimeout(t);
  }, [step]);

  function togglePicked(i: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function toggleType(t: string) {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  function handleSave() {
    onSave?.(GENERATED_GOALS.filter((_, i) => picked.has(i)));
    onClose();
  }

  return (
    <AIForeslagModalShell
      open={open}
      onClose={onClose}
      eyebrow="AI · Claude"
      titleLead="AI mål-"
      titleItalic="bygger"
      width={640}
      footerLeft={
        step === 3
          ? `${picked.size} av ${GENERATED_GOALS.length} valgt`
          : "AI bruker SG-data, kalender og dine notater"
      }
      footerRight={
        <>
          {step > 1 ? (
            <AthleticButton
              type="button"
              variant="ghost-light"
              size="sm"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            >
              Tilbake
            </AthleticButton>
          ) : (
            <AthleticButton type="button" variant="ghost-light" size="sm" onClick={onClose}>
              Avbryt
            </AthleticButton>
          )}
          {step === 1 ? (
            <AthleticButton
              type="button"
              variant="lime"
              size="sm"
              onClick={() => setStep(2)}
              disabled={!input.trim() || types.size === 0}
            >
              Generer mål →
            </AthleticButton>
          ) : null}
          {step === 3 ? (
            <AthleticButton
              type="button"
              variant="lime"
              size="sm"
              disabled={picked.size === 0}
              onClick={handleSave}
            >
              Lagre {picked.size} mål
            </AthleticButton>
          ) : null}
        </>
      }
    >
      <Stepper step={step} />

      {step === 1 ? (
        <div className="mt-5 space-y-6">
          <Field label="Hva vil du oppnå?">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-card p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="F.eks. «Bli scratch innen sommeren» eller «Topp-10 på Olyo Tour i juni»"
            />
          </Field>

          <Field label="Hva slags mål?">
            <div className="flex flex-wrap gap-1.5">
              {["HCP", "Score", "Turnering", "Skill", "Mental"].map((t) => {
                const active = types.has(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={`font-mono rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] transition ${
                      active
                        ? "border-primary bg-primary text-accent"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Tidsramme">
            <div className="inline-flex rounded-full border border-border bg-card p-1">
              {["3 mnd", "6 mnd", "12 mnd"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTimeline(opt)}
                  className={`font-mono rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition ${
                    timeline === opt
                      ? "bg-primary text-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex items-start gap-2 rounded-xl border border-accent/50 bg-accent/10 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="text-sm leading-relaxed">
              <strong>AI vil bruke:</strong> dine SG-tall siste 90 dg, planlagte
              turneringer på Olyo Tour, treningsfrekvens og dine notater fra coach.
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-5 flex flex-col items-center gap-4 px-4 py-6">
          <div className="h-14 w-14 animate-spin rounded-full border-[4px] border-border border-t-primary" />
          <div className="font-display text-lg font-semibold tracking-tight">
            Bygger 5 SMART-mål fra ditt input …
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            SG-data · turneringskalender · ditt input
          </div>
          <div className="mt-4 grid w-full gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-5 space-y-2">
          <div className="flex items-start gap-2 rounded-xl border border-accent/50 bg-accent/10 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="text-sm leading-relaxed">
              <strong>5 mål basert på {timeline} input.</strong> Velg de du vil committe
              til — du kan endre dem etterpå.
            </div>
          </div>

          {GENERATED_GOALS.map((g, i) => (
            <GoalRow
              key={g.title}
              goal={g}
              picked={picked.has(i)}
              onToggle={() => togglePicked(i)}
            />
          ))}
        </div>
      ) : null}
    </AIForeslagModalShell>
  );
}

function Stepper({ step }: { step: Step }) {
  const items = [
    { n: 1 as const, label: "Input" },
    { n: 2 as const, label: "AI genererer" },
    { n: 3 as const, label: "Velg & lagre" },
  ];
  return (
    <div className="-mt-1 flex items-center gap-1.5">
      {items.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex items-center gap-1.5">
            <div
              className={`font-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                active
                  ? "bg-primary text-accent"
                  : done
                    ? "bg-accent/40 text-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                  done
                    ? "bg-primary text-accent"
                    : active
                      ? "bg-accent text-foreground"
                      : "bg-border text-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> : s.n}
              </span>
              {s.label}
            </div>
            {i < items.length - 1 ? <span className="h-px w-3 bg-border" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function GoalRow({
  goal: g,
  picked,
  onToggle,
}: {
  goal: GeneratedGoal;
  picked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
        picked
          ? "border-primary bg-primary/[0.04]"
          : "border-border bg-card hover:bg-muted/40"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
          picked ? "border-primary bg-primary text-accent" : "border-input bg-card"
        }`}
      >
        {picked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      <div className="flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={`font-mono rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${TYPE_COLORS[g.type]}`}
          >
            {g.type}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
            {g.timeline} · {g.kpi}
          </span>
        </div>
        <div className="font-display text-sm font-semibold leading-snug">{g.title}</div>
        <div className="font-mono mt-1.5 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
          ↪ {g.dependency}
        </div>
      </div>
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
        <Pencil className="h-3 w-3" />
      </span>
    </button>
  );
}
