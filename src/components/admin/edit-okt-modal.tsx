"use client";

/**
 * EditOktModal — rediger eller opprett en treningsøkt med driller.
 *
 * Basert på `wireframe/design-package/project/05-oktplan-modal.html`.
 * Kontrollert dialog: forelder eier `open`-state og callbacks for lagring,
 * publisering og sletting. Selve databasekallene koples på når
 * /admin/plans-pipen tar dette i bruk — komponenten er bevisst rein UI.
 */

import { useEffect, useId, useMemo, useState } from "react";
import {
  Calendar,
  FileText,
  GripVertical,
  Plus,
  Repeat,
  Save,
  Trash2,
  X,
} from "lucide-react";

export type DrillForm = {
  id: string;
  title: string;
  durationMin: number;
  reps: string;
  pressureOn: boolean;
};

export type OktPlanForm = {
  title: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  totalMin: number;
  durationOverride: boolean;
  recurring: boolean;
  notes: string;
  drills: DrillForm[];
};

type Props = {
  open: boolean;
  initial?: Partial<OktPlanForm>;
  onClose: () => void;
  onSave?: (data: OktPlanForm) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onPublish?: (data: OktPlanForm) => Promise<void> | void;
};

const TOM_DRILL = (): DrillForm => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `d-${Math.random().toString(36).slice(2, 10)}`,
  title: "Ny drill",
  durationMin: 15,
  reps: "3 serier × 10",
  pressureOn: false,
});

const DEFAULT_PLAN: OktPlanForm = {
  title: "Ny økt",
  dateLabel: "i dag",
  startTime: "14:00",
  endTime: "15:30",
  totalMin: 90,
  durationOverride: false,
  recurring: false,
  notes: "",
  drills: [],
};

export function EditOktModal({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
  onPublish,
}: Props) {
  const titleId = useId();
  const [plan, setPlan] = useState<OktPlanForm>(() => ({
    ...DEFAULT_PLAN,
    ...initial,
    drills: initial?.drills?.length ? initial.drills : [TOM_DRILL()],
  }));
  const [busy, setBusy] = useState<"save" | "publish" | "delete" | null>(null);

  // Forelder forventes å remounte komponenten via `key` når `initial` byttes
  // (det er den anbefalte React-måten å resette state på, og unngår
  // setState-in-effect-anti-patternet).

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const autoSum = useMemo(
    () => plan.drills.reduce((a, d) => a + d.durationMin, 0),
    [plan.drills],
  );

  if (!open) return null;

  const update = (patch: Partial<OktPlanForm>) =>
    setPlan((p) => ({ ...p, ...patch }));

  const updateDrill = (id: string, patch: Partial<DrillForm>) =>
    setPlan((p) => ({
      ...p,
      drills: p.drills.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));

  const removeDrill = (id: string) =>
    setPlan((p) => ({ ...p, drills: p.drills.filter((d) => d.id !== id) }));

  const addDrill = () =>
    setPlan((p) => ({ ...p, drills: [...p.drills, TOM_DRILL()] }));

  const handle =
    (key: "save" | "publish" | "delete", fn?: (d: OktPlanForm) => unknown) =>
    async () => {
      if (!fn && key !== "delete") return;
      setBusy(key);
      try {
        if (key === "delete") await onDelete?.();
        else await fn?.(plan);
        onClose();
      } finally {
        setBusy(null);
      }
    };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="flex h-full max-h-[920px] w-full max-w-[920px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Rediger økt
            </div>
            <input
              id={titleId}
              type="text"
              value={plan.title}
              onChange={(e) => update({ title: e.target.value })}
              className="mt-1 w-full bg-transparent font-display text-[20px] font-semibold tracking-tight text-foreground outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Dato">
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  className="w-full bg-transparent font-mono text-[12.5px] outline-none"
                  value={plan.dateLabel}
                  onChange={(e) => update({ dateLabel: e.target.value })}
                />
              </div>
            </Field>
            <Field label="Tid">
              <div className="flex items-center gap-2">
                <input
                  className="w-[80px] rounded-md border border-border bg-card px-3 py-2 font-mono text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
                  value={plan.startTime}
                  onChange={(e) => update({ startTime: e.target.value })}
                />
                <span className="text-muted-foreground">–</span>
                <input
                  className="w-[80px] rounded-md border border-border bg-card px-3 py-2 font-mono text-[12.5px] outline-none focus:ring-2 focus:ring-ring/30"
                  value={plan.endTime}
                  onChange={(e) => update({ endTime: e.target.value })}
                />
                <input
                  readOnly={!plan.durationOverride}
                  className={`flex-1 rounded-md border border-border px-3 py-2 font-mono text-[12.5px] outline-none ${
                    plan.durationOverride
                      ? "bg-card"
                      : "bg-secondary text-muted-foreground"
                  }`}
                  value={
                    plan.durationOverride
                      ? `${plan.totalMin} min`
                      : `${autoSum} min · auto-sum fra driller`
                  }
                  onChange={(e) =>
                    update({
                      totalMin:
                        Number(e.target.value.replace(/\D/g, "")) || 0,
                    })
                  }
                />
                <Toggle
                  on={plan.durationOverride}
                  onChange={(v) => update({ durationOverride: v })}
                  label="override"
                />
              </div>
            </Field>
          </section>

          <div className="mt-4 flex items-center gap-3">
            <Toggle
              on={plan.recurring}
              onChange={(v) => update({ recurring: v })}
              label="Gjentakende økt"
            />
            {plan.recurring && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                <Repeat className="h-3.5 w-3.5" /> hver uke
              </span>
            )}
          </div>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Driller · {plan.drills.length}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Hent fra mal
                </button>
                <button
                  type="button"
                  onClick={addDrill}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Legg til drill
                </button>
              </div>
            </div>

            <ul className="space-y-3">
              {plan.drills.map((d, i) => (
                <li
                  key={d.id}
                  className="grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-md border border-border bg-card p-3"
                >
                  <div className="grid h-6 w-6 place-items-center rounded-sm text-muted-foreground">
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                    <input
                      className="rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-ring/30"
                      value={d.title}
                      onChange={(e) =>
                        updateDrill(d.id, { title: e.target.value })
                      }
                      placeholder={`Drill ${i + 1}`}
                    />
                    <Stepper
                      value={d.durationMin}
                      onChange={(v) =>
                        updateDrill(d.id, { durationMin: Math.max(0, v) })
                      }
                      suffix="min"
                    />
                    <input
                      className="w-[140px] rounded-md border border-border bg-card px-3 py-2 text-center font-mono text-[12px] outline-none focus:ring-2 focus:ring-ring/30"
                      value={d.reps}
                      onChange={(e) =>
                        updateDrill(d.id, { reps: e.target.value })
                      }
                    />
                    <Toggle
                      on={d.pressureOn}
                      onChange={(v) => updateDrill(d.id, { pressureOn: v })}
                      label={d.pressureOn ? "press på" : "av · full hastighet"}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDrill(d.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Fjern drill"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <Field label="Notater til spiller">
              <textarea
                value={plan.notes}
                onChange={(e) => update({ notes: e.target.value })}
                rows={3}
                className="w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-[13px] leading-relaxed outline-none focus:ring-2 focus:ring-ring/30"
                placeholder="Hva er fokuset i denne økten?"
              />
            </Field>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={handle("delete")}
            disabled={!onDelete || busy !== null}
            className="inline-flex items-center gap-2 rounded-md border border-destructive/40 px-3 py-2 text-[12.5px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Slett økt
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy !== null}
              className="rounded-md px-3 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handle("save", onSave)}
              disabled={!onSave || busy !== null}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {busy === "save" ? "Lagrer…" : "Lagre som utkast"}
            </button>
            <button
              type="button"
              onClick={handle("publish", onPublish)}
              disabled={!onPublish || busy !== null}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "publish" ? "Publiserer…" : "Publiser til spiller"}
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

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
        on
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground"
      }`}
      aria-pressed={on}
    >
      <span
        className={`block h-3 w-5 rounded-full border ${
          on
            ? "border-primary-foreground/40 bg-primary-foreground/20"
            : "border-border bg-card"
        }`}
      >
        <span
          className={`block h-2.5 w-2.5 translate-y-[1px] rounded-full bg-current transition-transform ${
            on ? "translate-x-[10px]" : "translate-x-[1px]"
          }`}
        />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

function Stepper({
  value,
  onChange,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-1 py-1">
      <button
        type="button"
        onClick={() => onChange(value - 5)}
        className="grid h-6 w-6 place-items-center rounded-sm text-muted-foreground hover:bg-secondary"
        aria-label="Reduser"
      >
        −
      </button>
      <span className="min-w-[64px] text-center font-mono text-[12px] tabular-nums">
        {value} {suffix}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 5)}
        className="grid h-6 w-6 place-items-center rounded-sm text-muted-foreground hover:bg-secondary"
        aria-label="Øk"
      >
        +
      </button>
    </div>
  );
}
