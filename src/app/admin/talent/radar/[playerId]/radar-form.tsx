"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { oppdaterRadar, type OppdaterState } from "./actions";

const AKSER = ["fysisk", "teknikk", "taktikk", "mental", "motivasjon"] as const;

const ETIKETT: Record<(typeof AKSER)[number], string> = {
  fysisk: "Fysisk",
  teknikk: "Teknikk",
  taktikk: "Taktikk",
  mental: "Mental",
  motivasjon: "Motivasjon",
};

const INITIAL: OppdaterState = { ok: false };

export function RadarForm({
  playerId,
  initial,
}: {
  playerId: string;
  initial: Record<(typeof AKSER)[number], number | null>;
}) {
  const [state, formAction, pending] = useActionState(
    oppdaterRadar,
    INITIAL,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-lg border border-border bg-card p-6"
    >
      <input type="hidden" name="playerId" value={playerId} />
      <div>
        <h2 className="font-display text-[18px] font-semibold leading-tight">
          Oppdater vurdering
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Sett verdi 1–10 per akse, eller la stå tom for ukjent.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AKSER.map((a) => (
          <label key={a} className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {ETIKETT[a]}
            </span>
            <input
              type="number"
              name={a}
              min={1}
              max={10}
              step={1}
              defaultValue={initial[a] ?? ""}
              className="rounded-md border border-input bg-background px-4 py-2 font-mono text-[14px] tabular-nums"
            />
          </label>
        ))}
      </div>

      {state.error && (
        <p className="text-[12px] text-destructive">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-[12px] text-primary">Lagret.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Save className="h-4 w-4" strokeWidth={1.5} />
        {pending ? "Lagrer …" : "Lagre vurdering"}
      </button>
    </form>
  );
}
