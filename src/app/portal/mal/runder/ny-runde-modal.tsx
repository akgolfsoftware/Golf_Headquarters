"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRound } from "./actions";

type Course = { id: string; name: string; par: number };

export function NyRundeModal({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [playedAt, setPlayedAt] = useState(today);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [score, setScore] = useState("");
  const [sgTotal, setSgTotal] = useState("");
  const [sgOtt, setSgOtt] = useState("");
  const [sgApp, setSgApp] = useState("");
  const [sgArg, setSgArg] = useState("");
  const [sgPutt, setSgPutt] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function reset() {
    setPlayedAt(today);
    setScore("");
    setSgTotal("");
    setSgOtt("");
    setSgApp("");
    setSgArg("");
    setSgPutt("");
    setNotes("");
    setError(null);
  }

  function lukk() {
    setOpen(false);
    reset();
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) {
      setError("Velg bane.");
      return;
    }
    if (!score || isNaN(Number(score))) {
      setError("Skår må være et tall.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createRound({
          courseId,
          playedAt,
          score: Number(score),
          sgTotal: sgTotal ? Number(sgTotal) : undefined,
          sgOtt: sgOtt ? Number(sgOtt) : undefined,
          sgApp: sgApp ? Number(sgApp) : undefined,
          sgArg: sgArg ? Number(sgArg) : undefined,
          sgPutt: sgPutt ? Number(sgPutt) : undefined,
          notes: notes || undefined,
        });
        lukk();
        router.refresh();
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={courses.length === 0}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Ny runde
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-lg w-full"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Registrer</em> ny runde
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Fyll inn det du har — SG-feltene er valgfrie.
          </p>

          <div className="space-y-3">
            <Felt label="Dato">
              <input
                type="date"
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                required
                className={input}
              />
            </Felt>
            <Felt label="Bane">
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className={input}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (par {c.par})
                  </option>
                ))}
              </select>
            </Felt>
            <Felt label="Skår">
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
                className={input}
              />
            </Felt>

            <details className="rounded-md border border-input bg-muted/30 px-4 py-3">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                SG-felter (valgfrie)
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Felt label="SG total">
                  <input
                    type="number"
                    step="0.1"
                    value={sgTotal}
                    onChange={(e) => setSgTotal(e.target.value)}
                    className={input}
                  />
                </Felt>
                <Felt label="OTT">
                  <input
                    type="number"
                    step="0.1"
                    value={sgOtt}
                    onChange={(e) => setSgOtt(e.target.value)}
                    className={input}
                  />
                </Felt>
                <Felt label="APP">
                  <input
                    type="number"
                    step="0.1"
                    value={sgApp}
                    onChange={(e) => setSgApp(e.target.value)}
                    className={input}
                  />
                </Felt>
                <Felt label="ARG">
                  <input
                    type="number"
                    step="0.1"
                    value={sgArg}
                    onChange={(e) => setSgArg(e.target.value)}
                    className={input}
                  />
                </Felt>
                <Felt label="PUTT">
                  <input
                    type="number"
                    step="0.1"
                    value={sgPutt}
                    onChange={(e) => setSgPutt(e.target.value)}
                    className={input}
                  />
                </Felt>
              </div>
            </details>

            <Felt label="Notat (valgfritt)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                rows={3}
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

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={lukk}
              disabled={pending}
              className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Lagrer…" : "Lagre runde"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

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
