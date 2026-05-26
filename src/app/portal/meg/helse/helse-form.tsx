"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { lagreHelseEntry } from "./actions";

type Initial = {
  date: string;
  restingHr: number | null;
  sleepHours: number | null;
  weightKg: number | null;
  notes: string | null;
};

export function HelseForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [date, setDate] = useState(initial.date);
  const [restingHr, setRestingHr] = useState(
    initial.restingHr != null ? String(initial.restingHr) : "",
  );
  const [sleep, setSleep] = useState(
    initial.sleepHours != null ? String(initial.sleepHours) : "",
  );
  const [weight, setWeight] = useState(
    initial.weightKg != null ? String(initial.weightKg) : "",
  );
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    startTransition(async () => {
      try {
        const norm = (raw: string) => raw.replace(",", ".").trim();
        await lagreHelseEntry({
          date,
          restingHr: restingHr ? Number(norm(restingHr)) : null,
          sleepHours: sleep ? Number(norm(sleep)) : null,
          weightKg: weight ? Number(norm(weight)) : null,
          notes: notes.trim() ? notes.trim() : null,
        });
        setLagret(true);
        router.refresh();
        setTimeout(() => setLagret(false), 1500);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  return (
    <form
      onSubmit={lagre}
      className="space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Manuelt — én logg per dato
      </span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Felt label="Dato">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={input}
          />
        </Felt>
        <Felt label="Hvilepuls (bpm)">
          <input
            type="number"
            inputMode="numeric"
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
            inputMode="decimal"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            placeholder="f.eks. 7,5"
            className={input}
          />
        </Felt>
        <Felt label="Vekt (kg)">
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="f.eks. 78,4"
            className={input}
          />
        </Felt>
      </div>

      <Felt label="Notater (valgfritt)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Hvordan føler du deg i dag?"
          className={`${input} resize-none`}
        />
      </Felt>

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
            Lagret
          </span>
        )}
        {feil && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
            {feil}
          </span>
        )}
      </div>
    </form>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
