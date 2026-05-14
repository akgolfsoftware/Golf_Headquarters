"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { oppdaterPreferences } from "../actions";

type Helsedata = {
  restingHr?: number;
  sleep?: number;
};

export function HelseForm({ initial }: { initial: Helsedata }) {
  const router = useRouter();
  const [restingHr, setRestingHr] = useState(
    initial.restingHr != null ? String(initial.restingHr) : ""
  );
  const [sleep, setSleep] = useState(
    initial.sleep != null ? String(initial.sleep) : ""
  );
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await oppdaterPreferences({
        // @ts-expect-error — utvider preferences med helse-felt ad-hoc
        helse: {
          restingHr: restingHr ? Number(restingHr) : undefined,
          sleep: sleep ? Number(sleep) : undefined,
        },
      });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  return (
    <form
      onSubmit={lagre}
      className="space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Manuelt
      </span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Felt label="Hvilepuls (bpm)">
          <input
            type="number"
            value={restingHr}
            onChange={(e) => setRestingHr(e.target.value)}
            placeholder="f.eks. 52"
            className={input}
          />
        </Felt>
        <Felt label="Søvn (timer i går natt)">
          <input
            type="number"
            step="0.5"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            placeholder="f.eks. 7,5"
            className={input}
          />
        </Felt>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Lagrer…" : "Lagre"}
        </button>
        {lagret && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
            Lagret ✓
          </span>
        )}
      </div>
    </form>
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
