"use client";

import { useState, useTransition } from "react";
import { Trophy, Plus, Trash2, Search, X } from "lucide-react";
import { leggTilTurnering, slettTournamentEntry, type TurnPriority } from "./actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TurneringKatalog = {
  id: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
};

export type TurnEntry = {
  id: string;
  priority: string;
  category: string | null;
  notes: string | null;
  tournamentId: string | null;
  manualName: string | null;
  manualDate: Date | null;
  manualEndDate: Date | null;
  tournament: { name: string; startDate: Date | null } | null;
  seasonPlanId: string | null;
};

export type SesonPlanOption = { id: string; year: number; name: string | null };

// ---------------------------------------------------------------------------
// Priority helpers
// ---------------------------------------------------------------------------

const PRIORITY_LABEL: Record<TurnPriority, string> = {
  MAJOR: "Major",
  NORMAL: "Normal",
  LOCAL: "Lokal",
};

const PRIORITY_CLASS: Record<TurnPriority, string> = {
  MAJOR:  "bg-primary/10 text-primary",
  NORMAL: "bg-accent/10 text-accent-foreground",
  LOCAL:  "bg-secondary text-muted-foreground",
};

// ---------------------------------------------------------------------------
// SlettKnapp
// ---------------------------------------------------------------------------

function SlettKnapp({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (!confirm("Fjerne denne turneringen fra planen?")) return;
        startTransition(async () => {
          await slettTournamentEntry(id);
        });
      }}
      disabled={isPending}
      className="rounded-md p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-40"
      title="Fjern fra plan"
    >
      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// LeggTilModal
// ---------------------------------------------------------------------------

function LeggTilModal({
  katalog,
  sesongplaner,
  onClose,
}: {
  katalog: TurneringKatalog[];
  sesongplaner: SesonPlanOption[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"katalog" | "manuell">("katalog");
  const [sok, setSok] = useState("");
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [priority, setPriority] = useState<TurnPriority>("NORMAL");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [seasonPlanId, setSeasonPlanId] = useState<string>("");

  // Manuell
  const [manualName, setManualName] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualEndDate, setManualEndDate] = useState("");

  const [feil, setFeil] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtrert = katalog.filter((t) =>
    t.name.toLowerCase().includes(sok.toLowerCase())
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    startTransition(async () => {
      const res = await leggTilTurnering({
        seasonPlanId: seasonPlanId || undefined,
        tournamentId: tab === "katalog" ? (valgtId ?? undefined) : undefined,
        manualName: tab === "manuell" ? manualName : undefined,
        manualDate: tab === "manuell" ? manualDate : undefined,
        manualEndDate: tab === "manuell" ? manualEndDate : undefined,
        category: category || undefined,
        priority,
        notes: notes || undefined,
      });
      if (res.ok) onClose();
      else setFeil(res.feil);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Legg til turnering
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            {(["katalog", "manuell"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "katalog" ? "Turneringskatalog" : "Manuell oppføring"}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          {/* Katalog-tab */}
          {tab === "katalog" && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="text"
                  value={sok}
                  onChange={(e) => setSok(e.target.value)}
                  placeholder="Søk etter turnering…"
                  className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-md border border-border">
                {filtrert.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Ingen turneringer funnet.</p>
                ) : (
                  filtrert.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setValgtId(t.id)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        valgtId === t.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <Trophy className="h-4 w-4 flex-none text-muted-foreground" strokeWidth={1.5} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{t.name}</div>
                        {t.startDate && (
                          <div className="font-mono text-xs text-muted-foreground">
                            {t.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {/* Manuell-tab */}
          {tab === "manuell" && (
            <>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Turneringsnavn *</span>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                  placeholder="f.eks. Kretsmesterskapet Østfold 2025"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">Startdato</span>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">Sluttdato</span>
                  <input
                    type="date"
                    value={manualEndDate}
                    onChange={(e) => setManualEndDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>
            </>
          )}

          {/* Felles felter */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Prioritet</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TurnPriority)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="MAJOR">Major (A-prioritet)</option>
                <option value="NORMAL">Normal</option>
                <option value="LOCAL">Lokal</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Kategori</span>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="f.eks. A-rekke"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>

          {sesongplaner.length > 0 && (
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Koble til sesongplan</span>
              <select
                value={seasonPlanId}
                onChange={(e) => setSeasonPlanId(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Ikke koblet</option>
                {sesongplaner.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? `Sesong ${p.year}`}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Notater</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Mål, forberedelse, reiseplaner…"
              className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          {feil && <p className="text-sm text-destructive">{feil}</p>}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isPending || (tab === "katalog" && !valgtId)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Legger til…" : "Legg til turnering"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TurnerigerListe — med priority-tabs og slett
// ---------------------------------------------------------------------------

export function TurneringerInteraktiv({
  entries,
  katalog,
  sesongplaner,
}: {
  entries: TurnEntry[];
  katalog: TurneringKatalog[];
  sesongplaner: SesonPlanOption[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"ALLE" | TurnPriority>("ALLE");

  const filtrert = filter === "ALLE"
    ? entries
    : entries.filter((e) => e.priority === filter);

  const sortert = [...filtrert].sort((a, b) => {
    const da = a.tournament?.startDate ?? a.manualDate ?? new Date(9999, 0);
    const db = b.tournament?.startDate ?? b.manualDate ?? new Date(9999, 0);
    return da.getTime() - db.getTime();
  });

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="inline-flex gap-1 rounded-md border border-border bg-card p-1">
          {(["ALLE", "MAJOR", "NORMAL", "LOCAL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {f === "ALLE" ? "Alle" : PRIORITY_LABEL[f as TurnPriority]}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Legg til turnering
        </button>
      </div>

      {/* Liste */}
      {sortert.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-8 py-16 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1} />
          <p className="mt-4 text-sm text-muted-foreground">
            {filter === "ALLE"
              ? "Ingen turneringer planlagt. Legg til din første."
              : `Ingen ${PRIORITY_LABEL[filter as TurnPriority].toLowerCase()}-turneringer.`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {sortert.map((e) => {
              const navn = e.tournament?.name ?? e.manualName ?? "Manuell turnering";
              const dato = e.tournament?.startDate ?? e.manualDate;
              const pri = e.priority as TurnPriority;
              return (
                <div key={e.id} className="flex items-center gap-4 px-6 py-4">
                  <Trophy className="h-5 w-5 flex-none text-muted-foreground" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{navn}</span>
                      {e.category && (
                        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {e.category}
                        </span>
                      )}
                    </div>
                    {e.notes && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.notes}</p>
                    )}
                  </div>
                  {dato && (
                    <span className="flex-none font-mono text-xs tabular-nums text-muted-foreground">
                      {dato.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <span
                    className={`flex-none rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
                      PRIORITY_CLASS[pri]
                    }`}
                  >
                    {PRIORITY_LABEL[pri]}
                  </span>
                  <SlettKnapp id={e.id} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <LeggTilModal
          katalog={katalog}
          sesongplaner={sesongplaner}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
