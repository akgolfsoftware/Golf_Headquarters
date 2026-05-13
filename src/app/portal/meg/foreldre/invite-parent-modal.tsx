"use client";

import { useState, useTransition } from "react";
import { UserPlus, X } from "lucide-react";
import { inviterForelder } from "./actions";

const RELATIONS = [
  { value: "FATHER", label: "Far" },
  { value: "MOTHER", label: "Mor" },
  { value: "GUARDIAN", label: "Verge / annen foresatt" },
] as const;

type Relation = (typeof RELATIONS)[number]["value"];

export function InviteParentButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <UserPlus className="h-4 w-4" strokeWidth={1.5} />
        Inviter forelder
      </button>
      {open ? <InviteModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState<Relation>("GUARDIAN");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await inviterForelder({ email, relation });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inviter forelder"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
    >
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              PlayerHQ · Foreldre
            </div>
            <h2 className="mt-1 font-display text-2xl italic">
              Inviter <em className="italic">forelder</em>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              E-postadresse
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="forelder@eksempel.no"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Relasjon
            </span>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value as Relation)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {RELATIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Forelderen får en e-post med en lenke som er gyldig i 7 dager.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {pending ? "Sender…" : "Send invitasjon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
