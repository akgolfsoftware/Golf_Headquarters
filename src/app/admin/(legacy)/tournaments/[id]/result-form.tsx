"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addResult, deleteResult } from "../actions";

type Player = { id: string; name: string };

type Props = {
  tournamentId: string;
  players: Player[];
  initial?: {
    id: string;
    userId: string;
    position: number | null;
    score: number | null;
    notes: string | null;
  };
  triggerLabel: string;
};

export function ResultForm({ tournamentId, players, initial, triggerLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState(initial?.userId ?? "");
  const [position, setPosition] = useState<string>(
    initial?.position != null ? String(initial.position) : ""
  );
  const [score, setScore] = useState<string>(
    initial?.score != null ? String(initial.score) : ""
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setError("Velg en spiller.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await addResult(tournamentId, {
          userId,
          position: position ? Number(position) : null,
          score: score ? Number(score) : null,
          notes: notes || null,
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm("Slett dette resultatet?")) return;
    startTransition(async () => {
      try {
        await deleteResult(tournamentId, initial.id);
        setOpen(false);
        router.refresh();
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
            : "rounded-md border border-input bg-card px-4 py-1.5 text-xs font-medium hover:border-border"
        }
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-md w-full"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">
              {initial ? "Endre" : "Nytt"}
            </em>{" "}
            resultat
          </h2>

          <div className="mt-6 space-y-4">
            <Felt label="Spiller">
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={!!initial}
                className={`${input} ${initial ? "bg-muted cursor-not-allowed" : ""}`}
              >
                <option value="">— Velg —</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Felt>
            <div className="grid grid-cols-2 gap-4">
              <Felt label="Plassering">
                <input
                  type="number"
                  min={1}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="1"
                  className={input}
                />
              </Felt>
              <Felt label="Score">
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="72"
                  className={input}
                />
              </Felt>
            </div>
            <Felt label="Notater">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
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
                className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs font-medium text-destructive hover:border-destructive/50 disabled:opacity-60"
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
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30";

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
