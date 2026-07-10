"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService, deleteService } from "./actions";

type ServiceFormProps = {
  initial?: {
    id: string;
    name: string;
    description: string | null;
    priceOre: number;
    durationMin: number;
    active: boolean;
  };
  triggerLabel: string;
};

export function ServiceForm({ initial, triggerLabel }: ServiceFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceKr, setPriceKr] = useState(
    initial ? String(initial.priceOre / 100) : ""
  );
  const [durationMin, setDurationMin] = useState(
    initial ? String(initial.durationMin) : "60"
  );
  const [active, setActive] = useState(initial?.active ?? true);

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
    const pris = Number(priceKr);
    const varighet = Number(durationMin);
    if (isNaN(pris) || pris < 0) {
      setError("Pris må være et tall.");
      return;
    }
    if (isNaN(varighet) || varighet < 5) {
      setError("Varighet må være minst 5 min.");
      return;
    }
    setError(null);
    const data = {
      name,
      description,
      priceOre: Math.round(pris * 100),
      durationMin: varighet,
      active,
    };
    startTransition(async () => {
      try {
        if (initial) await updateService(initial.id, data);
        else await createService(data);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm(`Slett tjenesten «${initial.name}»?`)) return;
    startTransition(async () => {
      try {
        await deleteService(initial.id);
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
            tjeneste
          </h2>

          <div className="mt-6 space-y-4">
            <Felt label="Navn">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="f.eks. Coaching 60 min"
                className={input}
              />
            </Felt>
            <Felt label="Beskrivelse (valgfritt)">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                rows={2}
                className={input}
              />
            </Felt>
            <div className="grid grid-cols-2 gap-4">
              <Felt label="Pris (kr)">
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={priceKr}
                  onChange={(e) => setPriceKr(e.target.value)}
                  className={input}
                />
              </Felt>
              <Felt label="Varighet (min)">
                <input
                  type="number"
                  step="5"
                  min="5"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className={input}
                />
              </Felt>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="accent-primary"
              />
              <span>Aktiv (kan bookes)</span>
            </label>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
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
