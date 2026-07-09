"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSlot, updateSlot, deleteSlot } from "./actions";

const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export type LocationOption = { id: string; name: string };

type Props = {
  locations: LocationOption[];
  initial?: {
    id: string;
    weekday: number | null;
    date: string | null; // ISO YYYY-MM-DD
    startTime: string;
    endTime: string;
    active: boolean;
    locationId: string | null;
    validFrom: string | null;
    validTo: string | null;
    recurrenceInterval: number | null;
  };
  defaultWeekday?: number;
  triggerLabel: string;
};

export function SlotForm({ locations, initial, defaultWeekday, triggerLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // «Ukentlig» (gjentas hver uke) vs «Spesifikk dato» (én gang).
  const [mode, setMode] = useState<"weekly" | "date">(
    initial?.date ? "date" : "weekly",
  );
  const [weekday, setWeekday] = useState(initial?.weekday ?? defaultWeekday ?? 0);
  const [date, setDate] = useState(initial?.date ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "10:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "18:00");
  const [active, setActive] = useState(initial?.active ?? true);
  const [locationId, setLocationId] = useState(initial?.locationId ?? locations[0]?.id ?? "");
  const [visPeriode, setVisPeriode] = useState(
    Boolean(initial?.validFrom || initial?.validTo),
  );
  const [validFrom, setValidFrom] = useState(initial?.validFrom ?? "");
  const [validTo, setValidTo] = useState(initial?.validTo ?? "");
  const [recurrence, setRecurrence] = useState(initial?.recurrenceInterval ?? 1);

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
    if (mode === "date" && !date) {
      setError("Velg en dato.");
      return;
    }
    if (!locationId) {
      setError("Velg et anlegg.");
      return;
    }
    setError(null);
    const payload = {
      weekday: mode === "weekly" ? weekday : null,
      date: mode === "date" ? date : null,
      startTime,
      endTime,
      active,
      locationId,
      validFrom: visPeriode && validFrom ? validFrom : null,
      validTo: visPeriode && validTo ? validTo : null,
      recurrenceInterval: mode === "weekly" ? recurrence : null,
    };
    startTransition(async () => {
      try {
        if (initial) await updateSlot(initial.id, payload);
        else await addSlot(payload);
        setOpen(false);
        router.refresh();
      } catch (err) {
        // Server kaster lesbare feil (f.eks. no-dobbeltsted) — vis dem.
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
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
            : "rounded-md border border-input bg-card px-4 py-1.5 text-xs font-medium hover:border-border"
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

          <div className="mt-6 space-y-4">
            <Felt label="Anlegg">
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className={input}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Felt>

            {/* Ukentlig vs spesifikk dato */}
            <div className="grid grid-cols-2 gap-2">
              <ModeKnapp aktiv={mode === "weekly"} onClick={() => setMode("weekly")}>
                Ukentlig
              </ModeKnapp>
              <ModeKnapp aktiv={mode === "date"} onClick={() => setMode("date")}>
                Spesifikk dato
              </ModeKnapp>
            </div>

            {mode === "weekly" ? (
              <>
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
                <Felt label="Repetisjon">
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(Number(e.target.value))}
                    className={input}
                  >
                    <option value={1}>Hver uke</option>
                    <option value={2}>Annenhver uke</option>
                    <option value={3}>Hver tredje uke</option>
                    <option value={4}>Hver fjerde uke</option>
                  </select>
                </Felt>
              </>
            ) : (
              <Felt label="Dato">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={input}
                />
              </Felt>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Felt label="Start">
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={input} />
              </Felt>
              <Felt label="Slutt">
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={input} />
              </Felt>
            </div>

            {/* Periode (års-perioder) — valgfritt, kun for ukentlig */}
            {mode === "weekly" && (
              <div>
                <button
                  type="button"
                  onClick={() => setVisPeriode((v) => !v)}
                  className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
                >
                  {visPeriode ? "− Periode" : "+ Begrens til periode (valgfritt)"}
                </button>
                {visPeriode && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <Felt label="Fra">
                      <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={input} />
                    </Felt>
                    <Felt label="Til">
                      <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className={input} />
                    </Felt>
                  </div>
                )}
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-primary" />
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

function ModeKnapp({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={
        "rounded-md border px-4 py-2 text-sm font-medium transition-colors " +
        (aktiv
          ? "border-primary bg-primary/[0.06] text-primary"
          : "border-input bg-card text-foreground hover:border-border")
      }
    >
      {children}
    </button>
  );
}

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
