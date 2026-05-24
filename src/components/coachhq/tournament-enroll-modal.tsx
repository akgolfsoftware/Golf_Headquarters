"use client";

/**
 * TournamentEnrollModal — rask multi-select påmelding av spillere til en turnering.
 *
 * - Liste over alle PLAYER-users (med HCP og tier)
 * - Søk-filter
 * - Checkbox + prioritet-dropdown (MAJOR / NORMAL / LOCAL)
 * - Viser eksisterende påmeldinger med "fjern"-knapp
 * - Bulk-action: meldPaSpillere
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, X, Trash2 } from "lucide-react";
import {
  meldPaSpillere,
  fjernPamelding,
  oppdaterPrioritet,
} from "@/app/admin/tournaments/actions";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

export type EnrollPlayer = {
  id: string;
  name: string;
  hcp: number | null;
  tier: string;
};

export type EnrollExisting = {
  entryId: string;
  userId: string;
  name: string;
  hcp: number | null;
  tier: string;
  priority: string;
};

type Props = {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  players: EnrollPlayer[];
  existing: EnrollExisting[];
  triggerLabel?: string;
  triggerClass?: string;
};

const PRIO_LABEL: Record<string, string> = {
  MAJOR: "Major",
  NORMAL: "Normal",
  LOCAL: "Lokal",
};

const PRIO_TONE: Record<string, string> = {
  MAJOR: "bg-primary/15 text-primary",
  NORMAL: "bg-secondary text-foreground",
  LOCAL: "bg-muted text-muted-foreground",
};

export function TournamentEnrollModal({
  tournamentId,
  tournamentName,
  tournamentDate,
  players,
  existing,
  triggerLabel = "Meld på",
  triggerClass,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [valgt, setValgt] = useState<Record<string, { on: boolean; priority: string }>>({});

  const eksisterendeIds = useMemo(
    () => new Set(existing.map((e) => e.userId)),
    [existing],
  );

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, players]);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function toggleValg(id: string) {
    setValgt((prev) => {
      const cur = prev[id];
      if (cur?.on) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { on: true, priority: cur?.priority ?? "NORMAL" } };
    });
  }

  function endrePrio(id: string, priority: string) {
    setValgt((prev) => ({
      ...prev,
      [id]: { on: true, priority },
    }));
  }

  function meldPaa() {
    const liste = Object.entries(valgt)
      .filter(([, v]) => v.on)
      .map(([userId, v]) => ({ userId, priority: v.priority }));
    if (liste.length === 0) {
      setError("Velg minst én spiller");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await meldPaSpillere(tournamentId, liste);
        setStatusMsg(
          `${res.opprettet} ny${res.opprettet === 1 ? "" : "e"} · ${res.oppdatert} oppdatert`,
        );
        setValgt({});
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kunne ikke melde på");
      }
    });
  }

  function fjern(entryId: string) {
    startTransition(async () => {
      try {
        await fjernPamelding(entryId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kunne ikke fjerne");
      }
    });
  }

  function endreEksisterendePrio(entryId: string, priority: string) {
    startTransition(async () => {
      try {
        await oppdaterPrioritet(entryId, priority);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kunne ikke oppdatere");
      }
    });
  }

  const antallValgt = Object.values(valgt).filter((v) => v.on).length;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className={
          triggerClass ??
          "inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
        }
      >
        <UserPlus size={13} strokeWidth={1.75} />
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="m-0 w-full max-w-3xl rounded-lg border border-border bg-card p-0 text-foreground backdrop:bg-foreground/40 sm:m-auto"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Påmelding · {tournamentDate}
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold tracking-tight">
              {tournamentName}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {existing.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Påmeldte spillere ({existing.length})
              </h3>
              <ul className="space-y-2">
                {existing.map((e) => (
                  <li
                    key={e.entryId}
                    className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <Avatar name={e.name} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {e.name}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        HCP {e.hcp ?? "—"} · {e.tier}
                      </div>
                    </div>
                    <select
                      value={e.priority}
                      onChange={(ev) => endreEksisterendePrio(e.entryId, ev.target.value)}
                      disabled={pending}
                      className="h-8 rounded-md border border-border bg-card px-2 text-xs"
                    >
                      <option value="MAJOR">Major</option>
                      <option value="NORMAL">Normal</option>
                      <option value="LOCAL">Lokal</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => fjern(e.entryId)}
                      disabled={pending}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Fjern ${e.name}`}
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Legg til spillere
            </h3>
            <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <Search size={14} strokeWidth={1.75} className="text-muted-foreground" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk spiller …"
                aria-label="Søk spiller"
                className="flex-1 border-none bg-transparent outline-none"
              />
            </div>

            {filteredPlayers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Ingen spillere matcher søket.
              </p>
            ) : (
              <ul className="space-y-1">
                {filteredPlayers.map((p) => {
                  const erPaameldt = eksisterendeIds.has(p.id);
                  const v = valgt[p.id];
                  const valgtAv = !!v?.on;
                  return (
                    <li
                      key={p.id}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                        valgtAv
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background"
                      } ${erPaameldt ? "opacity-60" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={valgtAv}
                        disabled={erPaameldt}
                        onChange={() => toggleValg(p.id)}
                        aria-label={`Velg ${p.name}`}
                        className="h-4 w-4 accent-[color:var(--color-primary)]"
                      />
                      <Avatar name={p.name} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {p.name}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                          HCP {p.hcp ?? "—"} · {p.tier}
                          {erPaameldt && " · allerede påmeldt"}
                        </div>
                      </div>
                      <select
                        value={v?.priority ?? "NORMAL"}
                        onChange={(ev) => endrePrio(p.id, ev.target.value)}
                        disabled={!valgtAv || erPaameldt}
                        className="h-8 rounded-md border border-border bg-card px-2 text-xs disabled:opacity-40"
                      >
                        <option value="MAJOR">Major</option>
                        <option value="NORMAL">Normal</option>
                        <option value="LOCAL">Lokal</option>
                      </select>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary/30 px-6 py-4">
          <div className="text-xs text-muted-foreground">
            {error && <span className="text-destructive">{error}</span>}
            {!error && statusMsg && <span className="text-primary">{statusMsg}</span>}
            {!error && !statusMsg && (
              <span>
                {antallValgt} valgt
                {antallValgt === 1 ? " spiller" : " spillere"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Lukk
            </button>
            <button
              type="button"
              onClick={meldPaa}
              disabled={pending || antallValgt === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <UserPlus size={14} strokeWidth={1.75} />
              {pending ? "Lagrer …" : `Meld på ${antallValgt || ""}`.trim()}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
      style={{ background: avatarBg(name) }}
      aria-hidden="true"
    >
      {initialsFromName(name)}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: string }) {
  const tone = PRIO_TONE[priority] ?? PRIO_TONE.NORMAL;
  const label = PRIO_LABEL[priority] ?? priority;
  return (
    <span
      className={`inline-flex w-fit items-center rounded-sm px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${tone}`}
    >
      {label}
    </span>
  );
}
