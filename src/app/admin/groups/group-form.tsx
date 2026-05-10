"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGroup, updateGroup, deleteGroup } from "./actions";

type Coach = { id: string; name: string };

type Props = {
  initial?: {
    id: string;
    name: string;
    level: string | null;
    coachId: string | null;
  };
  coaches: Coach[];
  triggerLabel: string;
};

const NIVAER = ["", "A1", "A2", "A3", "A4", "A5"];

export function GroupForm({ initial, coaches, triggerLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [level, setLevel] = useState(initial?.level ?? "");
  const [coachId, setCoachId] = useState(initial?.coachId ?? "");

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Navn er påkrevd.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) {
          await updateGroup(initial.id, {
            name,
            level: level || null,
            coachId: coachId || null,
          });
        } else {
          const id = await createGroup({
            name,
            level: level || null,
            coachId: coachId || null,
          });
          router.push(`/admin/groups/${id}`);
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
    if (!confirm(`Slett gruppen «${initial.name}»?`)) return;
    startTransition(async () => {
      try {
        await deleteGroup(initial.id);
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
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-md w-full"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">
              {initial ? "Endre" : "Ny"}
            </em>{" "}
            gruppe
          </h2>

          <div className="mt-5 space-y-3">
            <Felt label="Navn">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="A1 — Senior"
                className={input}
              />
            </Felt>
            <div className="grid grid-cols-2 gap-3">
              <Felt label="Nivå">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={input}
                >
                  {NIVAER.map((n) => (
                    <option key={n} value={n}>
                      {n || "— Ingen —"}
                    </option>
                  ))}
                </select>
              </Felt>
              <Felt label="Hovedcoach">
                <select
                  value={coachId}
                  onChange={(e) => setCoachId(e.target.value)}
                  className={input}
                >
                  <option value="">— Ingen —</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Felt>
            </div>
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
