"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Tag } from "lucide-react";
import { tagClubsPracticed } from "@/app/portal/tren/[sessionId]/club-tagging-actions";
import type { TrackManEnvironment } from "@/generated/prisma/client";
import { ENVIRONMENT_OPTIONS } from "@/lib/sg-hub/environment-labels";

const DEFAULT_CLUBS = [
  "Driver", "3W", "5W", "4H", "4-jern", "5-jern", "6-jern",
  "7-jern", "8-jern", "9-jern", "PW", "GW", "SW", "LW",
];

type Props = {
  sessionId: string;
};

export function ClubTaggingModal({ sessionId }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [environment, setEnvironment] = useState<TrackManEnvironment>("SIMULATOR_INDOOR");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [shots, setShots] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lukk() {
    setOpen(false);
    setSelected({});
    setShots({});
    setError(null);
    setSuccess(false);
  }

  function toggleKolle(club: string) {
    setSelected((prev) => ({ ...prev, [club]: !prev[club] }));
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    const valgte = DEFAULT_CLUBS.filter((c) => selected[c]);
    if (valgte.length === 0) {
      setError("Velg minst én kølle.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await tagClubsPracticed(
          sessionId,
          valgte.map((club) => ({
            club,
            shotCount: shots[club] ? Number(shots[club]) : undefined,
            environment,
          })),
        );
        setSuccess(true);
        setTimeout(lukk, 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  const antalValgt = DEFAULT_CLUBS.filter((c) => selected[c]).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <Tag className="h-3.5 w-3.5" />
        Tagg køller
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 w-full max-w-lg"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Tagg</em> køller brukt i dag
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Merk hvilke køller du trente med. Brukes til SG Hub-analyser.
          </p>

          <div className="mb-4">
            <label
              htmlFor="club-tagging-environment"
              className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Treningsmiljø
            </label>
            <select
              id="club-tagging-environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as TrackManEnvironment)}
              className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              {ENVIRONMENT_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Køller ({antalValgt} valgt)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {DEFAULT_CLUBS.map((club) => (
              <div key={club} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => toggleKolle(club)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    selected[club]
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {club}
                </button>
                {selected[club] && (
                  <input
                    type="number"
                    min="1"
                    max="999"
                    placeholder="slag"
                    value={shots[club] ?? ""}
                    onChange={(e) =>
                      setShots((prev) => ({ ...prev, [club]: e.target.value }))
                    }
                    className="w-full rounded-md border border-input bg-card px-2 py-1 text-center font-mono text-xs text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {success && (
            <p className="mt-4 text-sm font-medium text-[var(--color-pyr-tek)]">
              Lagret.
            </p>
          )}

          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={lukk}
              disabled={pending}
              className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
