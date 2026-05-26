"use client";

/**
 * EditPeriodeModal — rediger eller opprett en treningsperiode.
 *
 * Basert på `wireframe/design-package/project/06-periode-modal.html`.
 * Periode = ramme (typisk 4–8 uker) som samler tema, mål og fokusfordeling
 * over treningsøktene under. Komponenten er rein UI; backend kommer når
 * /admin/plans-pipen tar dette i bruk.
 */

import { useEffect, useId, useState } from "react";
import { Save, Target, Trash2, X } from "lucide-react";

export type FokusKey = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type PeriodeForm = {
  title: string;
  startDate: string;
  endDate: string;
  goal: string;
  notes: string;
  fokus: Record<FokusKey, number>;
};

type Props = {
  open: boolean;
  initial?: Partial<PeriodeForm>;
  onClose: () => void;
  onSave?: (data: PeriodeForm) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

const FOKUS_LABELS: Record<FokusKey, { label: string; sub: string }> = {
  FYS: { label: "FYS", sub: "fysisk fundament" },
  TEK: { label: "TEK", sub: "teknikk · golfsving" },
  SLAG: { label: "SLAG", sub: "slagprogresjon" },
  SPILL: { label: "SPILL", sub: "banespill · scoring" },
  TURN: { label: "TURN", sub: "turnering · konkurranse" },
};

const DEFAULT_PERIODE: PeriodeForm = {
  title: "Ny periode",
  startDate: "2026-01-01",
  endDate: "2026-01-29",
  goal: "",
  notes: "",
  fokus: { FYS: 20, TEK: 30, SLAG: 20, SPILL: 20, TURN: 10 },
};

export function EditPeriodeModal({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const titleId = useId();
  const [form, setForm] = useState<PeriodeForm>(() => ({
    ...DEFAULT_PERIODE,
    ...initial,
    fokus: { ...DEFAULT_PERIODE.fokus, ...(initial?.fokus ?? {}) },
  }));
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);

  // Forelder forventes å remounte komponenten via `key` når `initial` byttes —
  // anbefalt React-måte å resette state på, unngår setState-in-effect.

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sumFokus = (Object.keys(form.fokus) as FokusKey[]).reduce(
    (a, k) => a + form.fokus[k],
    0,
  );

  const update = (patch: Partial<PeriodeForm>) =>
    setForm((p) => ({ ...p, ...patch }));

  const updateFokus = (k: FokusKey, v: number) =>
    setForm((p) => ({
      ...p,
      fokus: { ...p.fokus, [k]: Math.max(0, Math.min(100, v)) },
    }));

  const handle = (key: "save" | "delete") => async () => {
    setBusy(key);
    try {
      if (key === "delete") await onDelete?.();
      else await onSave?.(form);
      onClose();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="flex h-full max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl sm:max-h-[760px] sm:max-w-[720px] sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Rediger periode
            </div>
            <input
              id={titleId}
              type="text"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              className="mt-1 w-full bg-transparent font-display text-[20px] font-semibold tracking-tight text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
                className="w-full rounded-md border border-border bg-card px-4 py-2 font-mono text-[12.5px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
              />
            </Field>
            <Field label="Slutt">
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => update({ endDate: e.target.value })}
                className="w-full rounded-md border border-border bg-card px-4 py-2 font-mono text-[12.5px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
              />
            </Field>
          </section>

          <Field label="Hovedmål">
            <textarea
              rows={2}
              value={form.goal}
              onChange={(e) => update({ goal: e.target.value })}
              className="w-full resize-y rounded-md border border-border bg-card px-4 py-2 text-[13px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
              placeholder="Hva skal spilleren oppnå i denne perioden?"
            />
          </Field>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Fokusfordeling
              </div>
              <div
                className={`font-mono text-[12px] tabular-nums ${
                  sumFokus === 100
                    ? "text-muted-foreground"
                    : "text-destructive"
                }`}
              >
                Sum {sumFokus}%
                {sumFokus !== 100 && " · bør være 100"}
              </div>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(FOKUS_LABELS) as FokusKey[]).map((k) => (
                <div
                  key={k}
                  className="grid grid-cols-[60px_1fr_56px] items-center gap-2"
                >
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-[12px] font-semibold text-foreground">
                      {FOKUS_LABELS[k].label}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={form.fokus[k]}
                    onChange={(e) => updateFokus(k, Number(e.target.value))}
                    className="w-full accent-primary"
                    aria-label={FOKUS_LABELS[k].sub}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.fokus[k]}
                    onChange={(e) => updateFokus(k, Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-card px-2 py-1 text-right font-mono text-[12px] tabular-nums outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              ))}
            </div>
          </section>

          <Field label="Notater">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              className="w-full resize-y rounded-md border border-border bg-card px-4 py-2 text-[13px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
              placeholder="Tilleggsnotater til perioden …"
            />
          </Field>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={handle("delete")}
            disabled={!onDelete || busy !== null}
            className="inline-flex items-center gap-2 rounded-md border border-destructive/40 px-4 py-2 text-[12.5px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Slett periode
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy !== null}
              className="rounded-md px-4 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handle("save")}
              disabled={!onSave || busy !== null}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {busy === "save" ? "Lagrer…" : "Lagre periode"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
