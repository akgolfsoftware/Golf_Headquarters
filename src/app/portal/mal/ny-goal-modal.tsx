"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGoal } from "./goals-actions";

const TYPER = [
  { value: "HCP_TARGET", label: "HCP-mål", harTall: true, enhet: "HCP" },
  { value: "ROUNDS_PER_MONTH", label: "Runder per måned", harTall: true, enhet: "runder" },
  { value: "SG_AREA", label: "SG-mål for området", harTall: true, enhet: "SG" },
  { value: "FREE_TEXT", label: "Fritekst-mål", harTall: false, enhet: "" },
];

export function NyGoalModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState("HCP_TARGET");
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lukk() {
    setOpen(false);
    setTitle("");
    setTargetValue("");
    setTargetDate("");
    setError(null);
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Skriv en tittel.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createGoal({
          type,
          title,
          targetValue: targetValue ? Number(targetValue) : null,
          targetDate: targetDate || null,
        });
        lukk();
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  const valgtType = TYPER.find((t) => t.value === type)!;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border"
      >
        + Nytt mål
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        className="m-4 max-w-md w-full rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 sm:m-auto"
      >
        <form onSubmit={lagre} className="p-4 sm:p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Nytt</em> mål
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Sett et konkret mål agentene kan jobbe mot.
          </p>

          <div className="space-y-4">
            <Felt label="Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={input}
              >
                {TYPER.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Felt>
            <Felt label="Tittel">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="f.eks. Single-HCP innen sommer 2027"
                className={input}
              />
            </Felt>
            {valgtType.harTall && (
              <Felt label={`Mål-verdi (${valgtType.enhet})`}>
                <input
                  type="number"
                  step="0.1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className={input}
                />
              </Felt>
            )}
            <Felt label="Frist (valgfritt)">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={input}
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

          <div className="mt-6 flex gap-4">
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
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Lagrer…" : "Opprett mål"}
            </button>
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
