"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSlot, updateSlot, deleteSlot } from "./actions";

const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

type Props = {
  initial?: {
    id: string;
    weekday: number;
    startTime: string;
    endTime: string;
    active: boolean;
  };
  defaultWeekday?: number;
  triggerLabel: string;
};

export function SlotForm({ initial, defaultWeekday, triggerLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [weekday, setWeekday] = useState(initial?.weekday ?? defaultWeekday ?? 0);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "08:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "16:00");
  const [active, setActive] = useState(initial?.active ?? true);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (startTime >= endTime) {
      setError("Slutt-tid må være etter start-tid.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) await updateSlot(initial.id, { weekday, startTime, endTime, active });
        else await addSlot({ weekday, startTime, endTime, active });
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm("Slett tidsvinduet?")) return;
    startTransition(async () => {
      try {
        await deleteSlot(initial.id);
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
            : "rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium hover:border-border"
        }
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-sm w-full"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">
              {initial ? "Endre" : "Nytt"}
            </em>{" "}
            tidsvindu
          </h2>

          <div className="mt-5 space-y-3">
            <Felt label="Ukedag">
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className={input}
              >
                {DAGER.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </Felt>
            <div className="grid grid-cols-2 gap-3">
              <Felt label="Start">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={input}
                />
              </Felt>
              <Felt label="Slutt">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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
              <span>Aktiv (bookbar)</span>
            </label>
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
