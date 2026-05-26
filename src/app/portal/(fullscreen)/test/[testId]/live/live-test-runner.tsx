"use client";

/**
 * Live-scoring UI for TestDefinition-protokoller.
 *
 * Hver protokoll har 1+ steg, hver med 1+ slag.
 * Per slag har spilleren et sett input-felter (number, select, checkbox, distance).
 *
 * UX-flyt:
 *   - Header: testnavn + progress (steg X av Y, slag A av B)
 *   - Instruksjon-kort (collapsible på mobile)
 *   - Slag-tabell: ett rad per slag, ett kolonne per inputField
 *   - Nederst: "Lagre steg + neste"-knapp (eller "Fullfør test" på siste steg)
 *   - Avbryt-knapp (X) øverst høyre — bekreft via confirm-dialog
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Package,
  Target,
  X,
} from "lucide-react";
import {
  abortTestSession,
  advanceTestStep,
  completeTestSession,
  recordTestStep,
} from "@/app/portal/tren/tester/session-actions";

type InputField = {
  key: string;
  label: string;
  type: "number" | "select" | "checkbox" | "distance";
  unit?: string;
  options?: string[];
  min?: number;
  max?: number;
  helper?: string;
};

type Step = {
  id: string;
  label: string;
  instruction: string;
  shots: number;
  target?: string;
  inputFields: InputField[];
};

type Protocol = {
  equipment: string[];
  expectedDurationMin: number;
  scoringMode: string;
  primaryMetric: string;
  unit: string;
  steps: Step[];
  baselineNormal?: { junior?: number; amateur?: number; pro?: number };
  pgaBenchmark?: string;
  notes?: string;
};

type ShotData = Record<string, string | number | boolean | null>;

type Props = {
  testId: string;
  testName: string;
  pyramidArea: string;
  sessionId: string;
  currentStepIndex: number;
  protocol: Protocol;
  existingData: Record<string, ShotData[]>;
};

const PYR_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slagteknikk",
  SPILL: "Spillforståelse",
  TURN: "Turneringsmodus",
};

function makeEmptyShot(fields: InputField[]): ShotData {
  const out: ShotData = {};
  for (const f of fields) {
    if (f.type === "checkbox") out[f.key] = false;
    else if (f.type === "select") out[f.key] = f.options?.[0] ?? "";
    else out[f.key] = "";
  }
  return out;
}

export function LiveTestRunner({
  testId,
  testName,
  pyramidArea,
  sessionId,
  currentStepIndex,
  protocol,
  existingData,
}: Props) {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(currentStepIndex);
  const step = protocol.steps[stepIdx];

  const [shots, setShots] = useState<ShotData[]>(() => {
    const existing = existingData[step?.id ?? ""] ?? null;
    if (existing && Array.isArray(existing) && existing.length === step?.shots) {
      return existing;
    }
    return Array.from({ length: step?.shots ?? 0 }, () => makeEmptyShot(step?.inputFields ?? []));
  });

  const [showInfo, setShowInfo] = useState(true);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!step) {
    return <div className="p-8">Ingen steg igjen. Lukker…</div>;
  }

  const isLastStep = stepIdx === protocol.steps.length - 1;
  const totalSteps = protocol.steps.length;
  const totalShots = protocol.steps.reduce((acc, s) => acc + s.shots, 0);
  const completedShots = protocol.steps
    .slice(0, stepIdx)
    .reduce((acc, s) => acc + s.shots, 0);

  function updateShot(idx: number, key: string, value: string | number | boolean) {
    setShots((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  }

  function saveAndAdvance() {
    setError(null);
    startTransition(async () => {
      // 1. Lagre slag-data for dette steget
      const r1 = await recordTestStep({ sessionId, stepId: step.id, shots });
      if (!r1.ok) {
        setError(r1.error);
        return;
      }

      if (isLastStep) {
        // 2a. Fullfør test
        const r2 = await completeTestSession(sessionId, notes);
        if (!r2.ok) {
          setError(r2.error);
          return;
        }
        router.push(`/portal/test/${testId}/summary?session=${sessionId}`);
        router.refresh();
      } else {
        // 2b. Gå til neste steg
        const r2 = await advanceTestStep(sessionId);
        if (!r2.ok) {
          setError(r2.error);
          return;
        }
        const nextIdx = stepIdx + 1;
        setStepIdx(nextIdx);
        const nextStep = protocol.steps[nextIdx];
        setShots(
          Array.from({ length: nextStep.shots }, () => makeEmptyShot(nextStep.inputFields)),
        );
        setShowInfo(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function handleAbort() {
    startTransition(async () => {
      await abortTestSession(sessionId);
      router.push(`/portal/tren/tester/${testId}`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-2 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <span className="rounded-sm bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
              {pyramidArea}
            </span>
            {PYR_LABEL[pyramidArea] ?? pyramidArea} · Live-test
          </div>
          <h1 className="mt-0.5 truncate font-display text-lg font-semibold text-foreground sm:text-xl">
            {testName}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowAbortConfirm(true)}
          aria-label="Avbryt test"
          className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </header>

      {/* Progress-strip */}
      <div className="border-b border-border bg-card/50 px-4 py-2 sm:px-6">
        <div className="flex items-center justify-between gap-4 font-mono text-[11px] tabular-nums text-muted-foreground">
          <span>
            Steg <strong className="text-foreground">{stepIdx + 1}</strong> av {totalSteps}
          </span>
          <span>
            Slag <strong className="text-foreground">{completedShots}</strong> av {totalShots}
          </span>
          <span className="hidden sm:inline">
            Forventet: ~{protocol.expectedDurationMin} min
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.round((stepIdx / totalSteps) * 100)}%` }}
          />
        </div>
      </div>

      {/* Hovedinnhold */}
      <main className="flex-1 px-4 py-6 sm:px-6">
        {/* Steg-tittel + instruksjon */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Steg {stepIdx + 1} · {step.shots} slag
              </div>
              <h2 className="mt-1 font-display text-xl font-semibold leading-tight">
                {step.label}
              </h2>
              {step.target && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1 text-[11px] font-semibold text-primary">
                  <Target className="h-3 w-3" strokeWidth={2} />
                  Mål: {step.target}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowInfo((s) => !s)}
              aria-label={showInfo ? "Skjul info" : "Vis info"}
              className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
            >
              {showInfo ? (
                <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>

          {showInfo && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex gap-2">
                <Info className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-foreground">
                  {step.instruction}
                </p>
              </div>

              {stepIdx === 0 && protocol.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {protocol.equipment.map((e) => (
                    <span
                      key={e}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground"
                    >
                      <Package className="h-3 w-3" strokeWidth={1.5} />
                      {e}
                    </span>
                  ))}
                </div>
              )}

              {stepIdx === 0 && protocol.notes && (
                <div className="ml-7 rounded-lg bg-secondary/60 px-4 py-2 text-xs italic text-muted-foreground">
                  Tips: {protocol.notes}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Slag-input */}
        <section className="mt-5 rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-2 sm:px-6">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Registrer per slag ({step.shots})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {shots.map((shot, idx) => (
              <ShotRow
                key={idx}
                shotNumber={idx + 1}
                shot={shot}
                fields={step.inputFields}
                onChange={(key, val) => updateShot(idx, key, val)}
              />
            ))}
          </div>
        </section>

        {/* Notater (kun på siste steg) */}
        {isLastStep && (
          <section className="mt-5 rounded-2xl border border-border bg-card p-6 sm:p-6">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Notater (valgfritt)
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Følt-form, været, utstyrs-issues — bare hvis det er relevant."
              className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
              {notes.length} / 500
            </span>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </main>

      {/* Footer-knapp */}
      <footer className="sticky bottom-0 z-10 border-t border-border bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
            ~{protocol.expectedDurationMin} min totalt
          </div>
          <button
            type="button"
            onClick={saveAndAdvance}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              "Lagrer…"
            ) : isLastStep ? (
              <>
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                Fullfør test
              </>
            ) : (
              <>
                Lagre + neste steg
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* Avbryt-bekreftelse */}
      {showAbortConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-card p-6 shadow-2xl sm:rounded-2xl">
            <h3 className="font-display text-lg font-semibold">Avbryt test?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Data du har registrert beholdes som UTKAST i 24 timer. Etter det slettes den.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowAbortConfirm(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Fortsett testen
              </button>
              <button
                type="button"
                onClick={handleAbort}
                disabled={pending}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                Avbryt likevel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponenter
// ---------------------------------------------------------------------------

function ShotRow({
  shotNumber,
  shot,
  fields,
  onChange,
}: {
  shotNumber: number;
  shot: ShotData;
  fields: InputField[];
  onChange: (key: string, val: string | number | boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[40px_1fr] items-center gap-2 px-6 py-2 sm:px-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold tabular-nums text-foreground">
        {shotNumber}
      </div>
      <div
        className="flex flex-wrap items-end gap-2"
        style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}
      >
        {fields.map((f) => (
          <FieldInput
            key={f.key}
            field={f}
            value={shot[f.key]}
            onChange={(v) => onChange(f.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: InputField;
  value: string | number | boolean | null;
  onChange: (v: string | number | boolean) => void;
}) {
  if (field.type === "checkbox") {
    const checked = value === true;
    return (
      <label className="flex min-w-[120px] cursor-pointer flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          {field.label}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors ${
            checked ? "bg-primary" : "bg-secondary"
          }`}
        >
          <span
            className={`absolute top-1 h-7 w-7 rounded-full bg-card shadow transition-transform ${
              checked ? "translate-x-8" : "translate-x-1"
            }`}
          />
          <Check
            className={`absolute right-2 h-3.5 w-3.5 ${
              checked ? "text-primary-foreground" : "text-transparent"
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>
        {field.helper && (
          <span className="text-[10px] text-muted-foreground">{field.helper}</span>
        )}
      </label>
    );
  }

  if (field.type === "select") {
    const v = typeof value === "string" ? value : "";
    return (
      <label className="flex min-w-[140px] flex-1 flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          {field.label}
        </span>
        <select
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  // number eller distance
  const v = typeof value === "number" || typeof value === "string" ? value : "";
  return (
    <label className="flex min-w-[120px] flex-1 flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {field.label}
        {field.unit && (
          <span className="ml-1 normal-case text-muted-foreground/70">({field.unit})</span>
        )}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        min={field.min}
        max={field.max}
        value={v}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") onChange("");
          else {
            const n = Number(raw);
            onChange(Number.isFinite(n) ? n : "");
          }
        }}
        className="w-full rounded-md border border-input bg-background px-4 py-2 font-mono text-sm tabular-nums outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
      {field.helper && (
        <span className="text-[10px] text-muted-foreground">{field.helper}</span>
      )}
    </label>
  );
}
