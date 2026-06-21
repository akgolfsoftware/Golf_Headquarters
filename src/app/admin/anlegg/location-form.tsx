"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  createFacility,
  updateFacility,
  deleteFacility,
} from "./location-actions";

type LocationProps = {
  initial?: {
    id: string;
    name: string;
    address: string;
    active: boolean;
  };
  triggerLabel: string;
};

export function LocationForm({ initial, triggerLabel }: LocationProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [active, setActive] = useState(initial?.active ?? true);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setError("Navn og adresse er påkrevd.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) await updateLocation(initial.id, { name, address, active });
        else await createLocation({ name, address, active });
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm(`Slett lokasjonen «${initial.name}» (inkl. tilhørende fasiliteter)?`)) return;
    startTransition(async () => {
      try {
        await deleteLocation(initial.id);
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
            lokasjon
          </h2>

          <div className="mt-6 space-y-4">
            <Felt label="Navn">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="f.eks. Mulligan Indoor"
                className={input}
              />
            </Felt>
            <Felt label="Adresse">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Storgata 1, 1601 Fredrikstad"
                className={input}
              />
            </Felt>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="accent-primary"
              />
              <span>Aktiv</span>
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

type FacilityProps = {
  locationId: string;
  initial?: {
    id: string;
    name: string;
    capacity: number;
    active: boolean;
  };
  triggerLabel: string;
};

export function FacilityForm({ locationId, initial, triggerLabel }: FacilityProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [capacity, setCapacity] = useState(initial ? String(initial.capacity) : "1");
  const [active, setActive] = useState(initial?.active ?? true);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    const cap = Number(capacity);
    if (!name.trim() || isNaN(cap) || cap < 1) {
      setError("Navn og kapasitet >= 1 er påkrevd.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) await updateFacility(initial.id, { name, capacity: cap, active });
        else await createFacility({ locationId, name, capacity: cap, active });
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm(`Slett fasiliteten «${initial.name}»?`)) return;
    startTransition(async () => {
      try {
        await deleteFacility(initial.id);
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
              {initial ? "Endre" : "Ny"}
            </em>{" "}
            fasilitet
          </h2>

          <div className="mt-6 space-y-4">
            <Felt label="Navn">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="f.eks. Performance Studio"
                className={input}
              />
            </Felt>
            <Felt label="Kapasitet">
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className={input}
              />
            </Felt>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="accent-primary"
              />
              <span>Aktiv</span>
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
