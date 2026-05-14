"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";

import { leggTilITalent, type LeggTilState } from "./actions";

const NIVAA = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;

const INITIAL: LeggTilState = { ok: false };

export function LeggTilForm({
  userId,
  spillerNavn,
  homeClub,
}: {
  userId: string;
  spillerNavn: string;
  homeClub: string | null;
}) {
  const [apen, setApen] = useState(false);
  const [state, formAction, pending] = useActionState(
    leggTilITalent,
    INITIAL,
  );

  if (state.ok) {
    return (
      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
        Lagt til
      </span>
    );
  }

  if (!apen) {
    return (
      <button
        type="button"
        onClick={() => setApen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
        Legg til
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 rounded-md border border-primary/40 bg-card p-4"
    >
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {spillerNavn}
        </span>
        <button
          type="button"
          onClick={() => setApen(false)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Lukk"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Nivå
        </span>
        <select
          name="niva"
          required
          defaultValue="U14"
          className="rounded-md border border-input bg-background px-3 py-2 text-[12px]"
        >
          {NIVAA.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Klubb
        </span>
        <input
          name="klubb"
          type="text"
          maxLength={120}
          defaultValue={homeClub ?? ""}
          className="rounded-md border border-input bg-background px-3 py-2 text-[12px]"
          placeholder="GFGK"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Region
        </span>
        <input
          name="region"
          type="text"
          maxLength={80}
          className="rounded-md border border-input bg-background px-3 py-2 text-[12px]"
          placeholder="Østfold"
        />
      </label>

      {state.error && (
        <p className="text-[11px] text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Lagrer …" : "Legg til i talent"}
      </button>
    </form>
  );
}
