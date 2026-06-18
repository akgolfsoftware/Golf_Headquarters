"use client";

/**
 * HandlingssenterClient — hybrid terminal design.
 * Kanban / Tabell / Liste med detail-panel.
 * Alle tokens løses via .dark-scope fra AdminShell.
 */

import { useState } from "react";
import {
  Check,
  CheckCheck,
  LayoutGrid,
  List,
  Plus,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgPage } from "@/components/admin/agencyos/ui";

// ─────────────────────────────────────────────── Types ──

export type OppgaveRad = {
  id: string;
  title: string;
  player: string;
  av: string;
  pri: string;
  priKey: "high" | "mid" | "low";
  tag: string;
  due: string;
  status: string;
  col: "todo" | "doing" | "done" | "backlog";
  desc: string;
};

type View = "kanban" | "table" | "list";
type Filter = "alle" | "haster" | "mine" | "ferdig";
type TableSortKey = "title" | "player" | "priKey" | "due" | "col";

// ─────────────────────────────────────────────── Helpers ──

// Sorterbar tabell-header — modulnivå (ikke definert under render).
function Th({
  k,
  sortKey,
  onSort,
  children,
  className,
}: {
  k: TableSortKey;
  sortKey: TableSortKey;
  onSort: (k: TableSortKey) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "cursor-pointer select-none whitespace-nowrap border-b border-border bg-card px-3 py-[10px] text-left font-mono text-[9px] font-semibold uppercase tracking-[0.07em] hover:text-foreground",
        sortKey === k ? "text-accent" : "text-muted-foreground",
        className,
      )}
      onClick={() => onSort(k)}
    >
      {children}
    </th>
  );
}

function priChipClass(k: "high" | "mid" | "low"): string {
  return cn(
    "font-mono text-[8.5px] font-bold tracking-[0.04em] uppercase px-[7px] py-[2px] rounded-full",
    k === "high"
      ? "bg-destructive/12 text-destructive"
      : k === "mid"
        ? "bg-warning/12 text-warning"
        : "bg-secondary text-muted-foreground",
  );
}

function tagChipClass(tag: string): string {
  const base =
    "font-mono text-[8.5px] font-bold tracking-[0.04em] uppercase px-[7px] py-[2px] rounded-[4px]";
  const map: Record<string, string> = {
    ARG: "bg-accent/14 text-accent",
    OTT: "bg-primary/16 text-success",
    PUTT: "bg-info/12 text-info",
    FYS: "bg-warning/12 text-warning",
    SG: "bg-success/12 text-success",
  };
  const extra = map[tag] ?? "bg-secondary text-muted-foreground";
  return cn(base, extra);
}

function statusChipClass(col: OppgaveRad["col"]): string {
  const base =
    "font-mono text-[9px] font-bold tracking-[0.04em] uppercase px-[7px] py-[2px] rounded-full";
  return cn(
    base,
    col === "todo"
      ? "bg-warning/12 text-warning"
      : col === "doing"
        ? "bg-info/12 text-info"
        : col === "done"
          ? "bg-success/12 text-success"
          : "bg-secondary text-muted-foreground",
  );
}

// ─────────────────────────────────────────── Avatar ──

function Av({ initials }: { initials: string }) {
  return (
    <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[8.5px] font-bold text-accent">
      {initials}
    </span>
  );
}

// ─────────────────────────────────────── ViewPill ──

function ViewPill({
  view,
  current,
  icon: Icon,
  label,
  onClick,
}: {
  view: View;
  current: View;
  icon: typeof List;
  label: string;
  onClick: () => void;
}) {
  const active = view === current;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[5px] rounded-lg border-0 px-[11px] py-[6px] font-mono text-[10px] font-semibold tracking-[0.03em] transition",
        active
          ? "bg-accent text-accent-foreground"
          : "bg-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={1.8} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────── FilterPill ──

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[5px] font-mono text-[10px] font-semibold transition",
        active
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-[6px] py-[1px] font-mono text-[9px] font-bold",
          active
            ? "bg-accent text-accent-foreground"
            : "bg-secondary text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ─────────────────────────────────────── KanbanView ──

function KanbanView({
  data,
  selId,
  onSelect,
}: {
  data: OppgaveRad[];
  selId: string | null;
  onSelect: (id: string) => void;
}) {
  const cols: { key: OppgaveRad["col"]; title: string; headCls: string }[] = [
    { key: "backlog", title: "Kø", headCls: "text-muted-foreground" },
    { key: "todo", title: "Å gjøre", headCls: "text-warning" },
    { key: "doing", title: "Pågår", headCls: "text-info" },
    { key: "done", title: "Ferdig", headCls: "text-success" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cols.map((col) => {
        const cards = data.filter((c) => c.col === col.key);
        return (
          <div
            key={col.key}
            className="min-h-[200px] rounded-[10px] border border-border bg-card p-[11px]"
          >
            <div className="mb-[10px] flex items-center justify-between">
              <span
                className={cn(
                  "font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]",
                  col.headCls,
                )}
              >
                {col.title}
              </span>
              <span className="rounded-full bg-secondary px-2 py-[1px] font-mono text-[9.5px] font-bold text-muted-foreground">
                {cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {cards.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "w-full rounded-[6px] border p-[11px_12px] text-left transition hover:-translate-y-[2px] hover:shadow-[0_6px_18px_rgba(0,0,0,0.35)]",
                    selId === c.id
                      ? "border-l-[2px] border-l-accent bg-accent/10 border-border"
                      : "border-border bg-secondary",
                  )}
                >
                  <div className="mb-2 text-[12.5px] font-semibold leading-[1.35] text-foreground">
                    {c.title}
                  </div>
                  <div className="flex items-center justify-between gap-[6px]">
                    <div className="flex flex-wrap items-center gap-[5px]">
                      <span className={priChipClass(c.priKey)}>{c.pri}</span>
                      <span className={tagChipClass(c.tag)}>{c.tag}</span>
                    </div>
                    <Av initials={c.av} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────── TableView ──

function TableView({
  data,
  selId,
  onSelect,
}: {
  data: OppgaveRad[];
  selId: string | null;
  onSelect: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<TableSortKey>("due");
  const [sortDir, setSortDir] = useState(1);

  function toggleSort(k: TableSortKey) {
    if (sortKey === k) setSortDir((d) => d * -1);
    else {
      setSortKey(k);
      setSortDir(1);
    }
  }

  const sorted = [...data].sort((a, b) => {
    const av = String(a[sortKey]);
    const bv = String(b[sortKey]);
    return av.localeCompare(bv, "nb") * sortDir;
  });

  return (
    <div className="overflow-hidden rounded-[8px] border border-border">
      <div className="max-h-[480px] overflow-y-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <Th k="title" sortKey={sortKey} onSort={toggleSort}>Oppgave</Th>
              <Th k="player" sortKey={sortKey} onSort={toggleSort}>Spiller</Th>
              <Th k="priKey" sortKey={sortKey} onSort={toggleSort}>Prioritet</Th>
              <Th k="due" sortKey={sortKey} onSort={toggleSort}>Forfall</Th>
              <Th k="col" sortKey={sortKey} onSort={toggleSort}>Status</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={cn(
                  "cursor-pointer border-b border-border transition-colors hover:bg-secondary",
                  selId === r.id && "bg-accent/10",
                )}
              >
                <td className="px-3 py-[10px] font-semibold text-foreground">
                  {r.title}
                </td>
                <td className="px-3 py-[10px] text-muted-foreground">
                  {r.player}
                </td>
                <td className="px-3 py-[10px]">
                  <span className={priChipClass(r.priKey)}>{r.pri}</span>
                </td>
                <td className="px-3 py-[10px] font-mono text-[11px] text-muted-foreground">
                  {r.due}
                </td>
                <td className="px-3 py-[10px]">
                  <span className={statusChipClass(r.col)}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────── ListView ──

function ListView({
  data,
  selId,
  onSelect,
}: {
  data: OppgaveRad[];
  selId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      {data.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={cn(
            "flex w-full items-center gap-3 rounded-[6px] border px-[14px] py-[11px] text-left transition hover:bg-secondary",
            selId === c.id
              ? "border-accent/40 bg-accent/10"
              : "border-border bg-card",
            "border-l-[2px]",
          )}
          style={{
            borderLeftColor:
              c.priKey === "high"
                ? "hsl(var(--destructive))"
                : c.priKey === "mid"
                  ? "hsl(var(--warning))"
                  : "hsl(var(--muted-foreground))",
          }}
        >
          <span className="w-[66px] shrink-0 font-mono text-[9.5px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {c.status}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-foreground">
              {c.title}
            </div>
            <div className="mt-[2px] font-mono text-[9.5px] text-muted-foreground">
              {c.tag} · {c.due}
            </div>
          </div>
          <span className={priChipClass(c.priKey)}>{c.pri}</span>
          <Av initials={c.av} />
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────── DetailPanel ──

function DetailPanel({
  item,
  onMarkDone,
}: {
  item: OppgaveRad | null;
  onMarkDone: (id: string) => void;
}) {
  if (!item) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Ingen valgt
        </span>
        <p className="max-w-[180px] text-[12px] text-muted-foreground">
          Klikk en oppgave for detaljer.
        </p>
      </div>
    );
  }

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "Status",
      value: <span className={statusChipClass(item.col)}>{item.status}</span>,
    },
    {
      label: "Prioritet",
      value: <span className={priChipClass(item.priKey)}>{item.pri}</span>,
    },
    {
      label: "Spiller",
      value: (
        <span className="text-[12.5px] font-semibold text-foreground">
          {item.player}
        </span>
      ),
    },
    {
      label: "Forfall",
      value: (
        <span className="font-mono text-[11px] text-muted-foreground">
          {item.due}
        </span>
      ),
    },
    {
      label: "Kategori",
      value: <span className={tagChipClass(item.tag)}>{item.tag}</span>,
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="p-[16px_18px]">
        <h2 className="font-display text-[16px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground">
          {item.title}
        </h2>
      </div>

      <div className="flex flex-col gap-[9px] px-[18px] pb-[18px]">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              {r.label}
            </span>
            {r.value}
          </div>
        ))}
      </div>

      <div className="mx-[18px] mb-[18px] rounded-[6px] border border-border bg-card p-3 text-[13px] leading-[1.55] text-muted-foreground">
        {item.desc}
      </div>

      <div className="mt-auto flex flex-col gap-2 px-[18px] pb-[18px]">
        {item.col !== "done" ? (
          <button
            type="button"
            onClick={() => onMarkDone(item.id)}
            className="flex w-full items-center justify-center gap-[7px] rounded-[8px] bg-accent py-[10px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-accent-foreground transition hover:opacity-90"
          >
            <Check className="h-[13px] w-[13px]" strokeWidth={2.2} />
            Merk fullført
          </button>
        ) : (
          <div className="flex w-full items-center justify-center gap-[7px] rounded-[8px] bg-success/15 py-[10px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-success">
            <CheckCheck className="h-[13px] w-[13px]" strokeWidth={2} />
            Fullført
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-[8px] border border-border bg-secondary px-3 py-[9px] font-mono text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground hover:text-foreground"
          >
            Rediger
          </button>
          <button
            type="button"
            className="flex-1 rounded-[8px] border border-border bg-secondary px-3 py-[9px] font-mono text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground hover:text-foreground"
          >
            Tildel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────── Main ──

export function HandlingssenterClient({
  oppgaver,
  openCount,
  doneToday,
}: {
  oppgaver: OppgaveRad[];
  openCount: number;
  doneToday: number;
}) {
  const [view, setView] = useState<View>("kanban");
  const [filter, setFilter] = useState<Filter>("alle");
  const [selId, setSelId] = useState<string | null>(
    oppgaver[0]?.id ?? null,
  );

  const today = new Date();
  const dagLabel = `${today.getDate()}. ${["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"][today.getMonth()]}`;

  const filtered = oppgaver.filter((o) => {
    if (filter === "haster") return o.priKey === "high";
    if (filter === "mine") return o.av === "AK";
    if (filter === "ferdig") return o.col === "done";
    return true;
  });

  const filterCounts: Record<Filter, number> = {
    alle: oppgaver.length,
    haster: oppgaver.filter((o) => o.priKey === "high").length,
    mine: oppgaver.filter((o) => o.av === "AK").length,
    ferdig: oppgaver.filter((o) => o.col === "done").length,
  };

  const selItem = filtered.find((o) => o.id === selId) ?? filtered[0] ?? null;

  function markDone(id: string) {
    // Optimistisk: oppdater lokal UI-state. Server-mutation utestår.
    const item = filtered.find((o) => o.id === id);
    if (item) item.col = "done";
    setSelId(id);
  }

  return (
    <AgPage className="max-w-full px-0 pt-0 pb-0">
      {/* ── TOP BAR ── */}
      <div
        className="flex flex-shrink-0 flex-wrap items-center gap-[14px] border-b border-border px-[22px] py-[14px]"
        style={{ background: "rgba(7,16,12,0.5)" }}
      >
        <div>
          <h1 className="font-display text-[19px] font-bold tracking-[-0.01em] text-foreground">
            Handlingssenter
          </h1>
          <p className="mt-[2px] font-mono text-[10.5px] text-muted-foreground">
            {dagLabel} · {openCount} åpne · {doneToday} fullført i dag
          </p>
        </div>

        {/* View toggle */}
        <div className="ml-[14px] flex gap-[3px] rounded-[8px] border border-border bg-card p-[3px]">
          <ViewPill
            view="kanban"
            current={view}
            icon={LayoutGrid}
            label="Kanban"
            onClick={() => setView("kanban")}
          />
          <ViewPill
            view="table"
            current={view}
            icon={Table2}
            label="Tabell"
            onClick={() => setView("table")}
          />
          <ViewPill
            view="list"
            current={view}
            icon={List}
            label="Liste"
            onClick={() => setView("list")}
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-[6px]">
          {(["alle", "haster", "mine", "ferdig"] as Filter[]).map((f) => (
            <FilterPill
              key={f}
              label={
                f === "alle"
                  ? "Alle"
                  : f === "haster"
                    ? "Haster"
                    : f === "mine"
                      ? "Mine"
                      : "Ferdig"
              }
              count={filterCounts[f]}
              active={filter === f}
              onClick={() => setFilter(f)}
            />
          ))}
        </div>

        <button
          type="button"
          className="ml-auto flex shrink-0 items-center gap-[7px] rounded-[8px] bg-accent px-[14px] py-[9px] font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-accent-foreground transition hover:opacity-90"
        >
          <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} />
          Ny oppgave
        </button>
      </div>

      {/* ── CONTENT + DETAIL ── */}
      <div className="flex min-h-0 flex-1" style={{ height: "calc(100vh - 120px)" }}>
        {/* Board / Table / List */}
        <div className="flex-1 overflow-y-auto p-[18px_20px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Ingen oppgaver
              </span>
              <p className="max-w-[260px] text-[13px] text-muted-foreground">
                Ingen oppgaver matcher dette filteret.
              </p>
            </div>
          ) : view === "kanban" ? (
            <KanbanView
              data={filtered}
              selId={selId}
              onSelect={setSelId}
            />
          ) : view === "table" ? (
            <TableView
              data={filtered}
              selId={selId}
              onSelect={setSelId}
            />
          ) : (
            <ListView
              data={filtered}
              selId={selId}
              onSelect={setSelId}
            />
          )}
        </div>

        {/* Detail panel */}
        <div className="flex w-[296px] shrink-0 flex-col border-l border-border bg-card">
          <div className="shrink-0 border-b border-border px-[18px] py-[16px]">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Oppgave · detalj
            </span>
          </div>
          <DetailPanel item={selItem} onMarkDone={markDone} />
        </div>
      </div>
    </AgPage>
  );
}
