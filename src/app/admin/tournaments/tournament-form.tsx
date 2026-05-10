"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTournament, updateTournament, deleteTournament } from "./actions";

type Course = { id: string; name: string };

type Props = {
  initial?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    courseId: string | null;
    format: string;
    notes: string | null;
  };
  courses: Course[];
  triggerLabel: string;
};

const FORMATER = ["STROKE", "MATCH", "STABLEFORD", "OTHER"];

function toInputDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function TournamentForm({ initial, courses, triggerLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [startDate, setStartDate] = useState(toInputDate(initial?.startDate ?? null));
  const [endDate, setEndDate] = useState(toInputDate(initial?.endDate ?? null));
  const [courseId, setCourseId] = useState(initial?.courseId ?? "");
  const [format, setFormat] = useState(initial?.format ?? "STROKE");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate) {
      setError("Navn og startdato er påkrevd.");
      return;
    }
    if (endDate && endDate < startDate) {
      setError("Sluttdato må være etter startdato.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) {
          await updateTournament(initial.id, {
            name,
            startDate,
            endDate: endDate || null,
            courseId: courseId || null,
            format,
            notes: notes || null,
          });
        } else {
          const id = await createTournament({
            name,
            startDate,
            endDate: endDate || null,
            courseId: courseId || null,
            format,
            notes: notes || null,
          });
          router.push(`/admin/tournaments/${id}`);
        }
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm(`Slett turneringen «${initial.name}»?`)) return;
    startTransition(async () => {
      try {
        await deleteTournament(initial.id);
      } catch {
        setError("Kunne ikke slette.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          initial
            ? "text-xs text-primary hover:underline"
            : "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        }
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-xl w-full"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">
              {initial ? "Endre" : "Ny"}
            </em>{" "}
            turnering
          </h2>

          <div className="mt-5 space-y-3">
            <Felt label="Navn">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Klubbmesterskap 2026"
                className={input}
              />
            </Felt>
            <div className="grid grid-cols-2 gap-3">
              <Felt label="Startdato">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={input}
                />
              </Felt>
              <Felt label="Sluttdato (valgfri)">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={input}
                />
              </Felt>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Felt label="Bane">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className={input}
                >
                  <option value="">— Ingen —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Felt>
              <Felt label="Format">
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className={input}
                >
                  {FORMATER.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Felt>
            </div>
            <Felt label="Notater (valgfri)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Intern info, regler, premier…"
                className={input}
              />
            </Felt>
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            {initial && (
              <button
                type="button"
                onClick={slett}
                disabled={pending}
                className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive hover:border-destructive/50 disabled:opacity-60"
              >
                Slett
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="ml-auto rounded-md border border-input bg-card px-4 py-2 text-sm font-medium hover:border-border"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

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
