"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, X } from "lucide-react";

import { avatarBg } from "@/lib/avatar-colors";
import { leggTilGruppemedlem } from "./actions";

export type Kandidat = {
  id: string;
  name: string;
  hcp: number | null;
  homeClub: string | null;
};

function initialer(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtHcp(h: number | null): string {
  if (h == null) return "–";
  return h >= 0 ? h.toFixed(1).replace(".", ",") : `+${Math.abs(h).toFixed(1).replace(".", ",")}`;
}

export function LeggTilMedlemModal({
  groupId,
  kandidater,
  onClose,
}: {
  groupId: string;
  kandidater: Kandidat[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sokRef = useRef<HTMLInputElement>(null);

  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [sok, setSok] = useState("");
  const [valgt, setValgt] = useState<string | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => sokRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        lukk();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrerte = useMemo(() => {
    const q = sok.trim().toLowerCase();
    if (!q) return kandidater;
    return kandidater.filter((k) => {
      const navn = k.name.toLowerCase();
      const klubb = (k.homeClub ?? "").toLowerCase();
      return navn.includes(q) || klubb.includes(q);
    });
  }, [kandidater, sok]);

  function lukk() {
    dialogRef.current?.close();
    onClose();
  }

  function bekreft() {
    if (!valgt) {
      setFeil("Velg en spiller.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await leggTilGruppemedlem(groupId, valgt);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      router.refresh();
      lukk();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-modal="true"
      aria-labelledby="legg-til-medlem-title"
      className="m-0 h-full max-h-full w-full max-w-full rounded-none border-0 bg-card p-0 shadow-xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm sm:m-auto sm:h-auto sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-2xl sm:border sm:border-border"
    >
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Gruppe · legg til medlem
            </div>
            <h3
              id="legg-til-medlem-title"
              className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight"
            >
              Legg til{" "}
              <span className="font-display italic text-primary">spiller</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={lukk}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Søkefelt */}
        <div className="relative mb-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <input
            ref={sokRef}
            type="text"
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            placeholder="Søk på navn eller klubb…"
            className="w-full rounded-md border border-input bg-card py-2 pl-8 pr-4 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
            autoComplete="off"
            aria-label="Søk spillere"
          />
        </div>

        {/* Kandidat-liste */}
        <div className="max-h-[50vh] sm:max-h-[360px] overflow-y-auto rounded-md border border-border bg-background">
          {kandidater.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Alle spillere er allerede medlem av gruppen.
            </div>
          ) : filtrerte.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Ingen spillere matcher.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtrerte.map((k) => {
                const erValgt = valgt === k.id;
                return (
                  <li key={k.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-2 px-4 py-2 transition-colors ${
                        erValgt ? "bg-primary/5" : "hover:bg-secondary"
                      }`}
                    >
                      <input
                        type="radio"
                        name="kandidat"
                        checked={erValgt}
                        onChange={() => setValgt(k.id)}
                        className="h-4 w-4 shrink-0 border-input text-primary focus:ring-ring/30"
                        aria-label={`Velg ${k.name}`}
                      />
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold text-white"
                        style={{ background: avatarBg(k.name) }}
                        aria-hidden="true"
                      >
                        {initialer(k.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {k.name}
                        </span>
                        <span className="block truncate font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                          {k.homeClub ?? "Uten klubb"} · HCP{" "}
                          <span className="tabular-nums">{fmtHcp(k.hcp)}</span>
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {feil && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {feil}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={lukk}
            disabled={pending}
            className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={bekreft}
            disabled={pending || !valgt}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? (
              "Legger til…"
            ) : (
              <>
                <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                Legg til
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
