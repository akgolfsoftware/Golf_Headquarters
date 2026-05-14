"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { PyramidArea } from "@/generated/prisma/client";
import { oppdaterOkt, slettOkt, leggTilOkt } from "./actions";

type Mode =
  | { kind: "edit"; sessionId: string }
  | { kind: "create"; planId: string };

type Props = {
  mode: Mode;
  initial?: {
    title: string;
    scheduledAt: Date;
    durationMin: number;
    pyramidArea: PyramidArea;
    rationale?: string | null;
  };
  triggerVariant?: "primary" | "icon-edit" | "icon-delete" | "ghost";
  triggerLabel?: string;
};

const PYR_OPTIONS: { value: PyramidArea; label: string }[] = [
  { value: "FYS", label: "FYS — Fysikk" },
  { value: "TEK", label: "TEK — Teknikk" },
  { value: "SLAG", label: "SLAG — Slag" },
  { value: "SPILL", label: "SPILL — Spill" },
  { value: "TURN", label: "TURN — Turnering" },
];

/**
 * Konverter Date → "YYYY-MM-DDTHH:mm" for datetime-local input (lokal tid).
 */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function EditSessionModal({
  mode,
  initial,
  triggerVariant = "primary",
  triggerLabel,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode.kind === "edit";

  // Skjemafelt
  const [title, setTitle] = useState(initial?.title ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? toLocalInputValue(initial.scheduledAt) : "",
  );
  const [durationMin, setDurationMin] = useState(
    initial?.durationMin?.toString() ?? "60",
  );
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>(
    initial?.pyramidArea ?? "TEK",
  );
  const [rationale, setRationale] = useState(initial?.rationale ?? "");

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      // Focus first field for tastatur-tilgjengelighet
      requestAnimationFrame(() => firstFieldRef.current?.focus());
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function nullstillSkjema() {
    setTitle(initial?.title ?? "");
    setScheduledAt(initial?.scheduledAt ? toLocalInputValue(initial.scheduledAt) : "");
    setDurationMin(initial?.durationMin?.toString() ?? "60");
    setPyramidArea(initial?.pyramidArea ?? "TEK");
    setRationale(initial?.rationale ?? "");
    setError(null);
  }

  function lukk() {
    setOpen(false);
    nullstillSkjema();
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Skriv en tittel.");
      return;
    }
    if (!scheduledAt) {
      setError("Velg dato og tid.");
      return;
    }
    const dur = Number(durationMin);
    if (!Number.isFinite(dur) || dur <= 0) {
      setError("Varighet må være et positivt tall.");
      return;
    }

    setError(null);
    const dataFelles = {
      title: title.trim(),
      scheduledAt: new Date(scheduledAt),
      durationMin: dur,
      pyramidArea,
      rationale: rationale.trim() || undefined,
    };

    startTransition(async () => {
      try {
        if (mode.kind === "edit") {
          await oppdaterOkt(mode.sessionId, dataFelles);
        } else {
          await leggTilOkt({
            planId: mode.planId,
            title: dataFelles.title,
            scheduledAt: dataFelles.scheduledAt.toISOString(),
            durationMin: dataFelles.durationMin,
            pyramidArea: dataFelles.pyramidArea,
            rationale: dataFelles.rationale,
            drills: [],
          });
        }
        lukk();
        router.refresh();
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  function slett() {
    if (mode.kind !== "edit") return;
    if (
      !confirm(
        "Slette økten permanent? Drills og logg slettes også. Dette kan ikke angres.",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await slettOkt(mode.sessionId);
        lukk();
        router.refresh();
      } catch {
        setError("Kunne ikke slette. Prøv igjen.");
      }
    });
  }

  // Modal-tittel
  const opprinneligDato = initial?.scheduledAt
    ? initial.scheduledAt.toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // Trigger
  let trigger: React.ReactNode;
  if (triggerVariant === "primary") {
    trigger = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        {triggerLabel ?? "Legg til økt"}
      </button>
    );
  } else if (triggerVariant === "icon-edit") {
    trigger = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rediger økt"
        className="inline-flex items-center justify-center rounded-md border border-border bg-card p-2 text-foreground transition-colors hover:bg-secondary"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.5} />
      </button>
    );
  } else if (triggerVariant === "icon-delete") {
    trigger = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rediger økt"
        className="inline-flex items-center justify-center rounded-md border border-destructive/40 bg-card p-2 text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      </button>
    );
  } else {
    trigger = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
        {triggerLabel ?? "Rediger"}
      </button>
    );
  }

  return (
    <>
      {trigger}

      <dialog
        ref={dialogRef}
        onClose={lukk}
        aria-modal="true"
        aria-labelledby="edit-session-title"
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40"
      >
        <form onSubmit={lagre} className="p-6">
          <h2
            id="edit-session-title"
            className="font-display text-xl font-semibold leading-tight tracking-tight"
          >
            {isEdit ? (
              <>
                <em className="font-normal text-primary md:italic">Rediger</em>{" "}
                økt
                {opprinneligDato && (
                  <span className="ml-1 text-muted-foreground"> — {opprinneligDato}</span>
                )}
              </>
            ) : (
              <>
                <em className="font-normal text-primary md:italic">Ny</em> økt
              </>
            )}
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            {isEdit
              ? "Endre tittel, tid, varighet eller fokus for økten."
              : "Legg til en ny treningsøkt på planen."}
          </p>

          <div className="space-y-4">
            <Felt label="Tittel">
              <input
                ref={firstFieldRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="f.eks. Drift + lange jern"
                className={input}
                required
              />
            </Felt>

            <Felt label="Dato og tid">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={input}
                required
              />
            </Felt>

            <Felt label="Varighet (minutter)">
              <input
                type="number"
                min="1"
                step="1"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className={input}
                required
              />
            </Felt>

            <Felt label="Pyramide-fokus">
              <select
                value={pyramidArea}
                onChange={(e) => setPyramidArea(e.target.value as PyramidArea)}
                className={input}
              >
                {PYR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Felt>

            <Felt label="Rasjonale (valgfritt)">
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={3}
                placeholder="Hvorfor denne økten? Hva skal spilleren oppnå?"
                className={`${input} resize-none`}
              />
            </Felt>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            {isEdit ? (
              <button
                type="button"
                onClick={slett}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-card px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                Slett økt
              </button>
            ) : (
              <span />
            )}

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={lukk}
                disabled={pending}
                className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium hover:border-border"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {pending
                  ? "Lagrer…"
                  : isEdit
                    ? "Lagre endringer"
                    : "Opprett økt"}
              </button>
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
