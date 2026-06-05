/**
 * AgencyOS — Stallen spillertabell (/admin/spillere).
 * Pixel-port av public/design-handover/agencyos/components-agency-player-table.html.
 *
 * Panel med:
 *   - Tittelrad (STALLEN eyebrow + "N spillere · uke X" + meta-tall)
 *   - Toolbar (gruppe-filter-piller + søk + Filter/Sortér/Ny spiller)
 *   - BatchActionBar (betinget — vises når rader er valgt, lime-tint)
 *   - Sortbar tabell (checkbox-kolonne, Spiller, Gruppe, Coach, Tier,
 *     Økter uke, Tim. 30 d, SG-trend sparkline, Pyr. uke 5-akse-meter, Status)
 *   - Pagination
 *
 * Client component: håndterer multi-select + batch-bar. Sortering, gruppe-filter,
 * søk og paginering er URL-drevet (server leser searchParams via loadStallen) —
 * 3-state sort sykler asc → desc → av per kolonne-klikk.
 *
 * Ingen hardkodet hex, ingen emoji (kun lucide). DS-tokens overalt.
 */

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowDownNarrowWide,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Download,
  FolderInput,
  GraduationCap,
  Leaf,
  Plus,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Trophy,
  UserCog,
  UserRoundSearch,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  StallenRow,
  StallenSort,
  SortDir,
  GroupBucket,
  TierKind,
  Axis,
} from "@/lib/admin/stallen-data";

type ColKey = StallenSort;

const PAGE_SIZE = 10;

const groupClass: Record<GroupBucket, string> = {
  WANG: "bg-muted-foreground/10 text-muted-foreground",
  GFGK: "bg-[var(--color-pyr-fys-track)] text-success",
  AKA: "bg-[var(--color-pyr-tek-track)] text-warning",
};

const tierIcon: Record<TierKind, typeof Trophy> = {
  konk: Trophy,
  mosj: Leaf,
  akad: GraduationCap,
};
const tierIconClass: Record<TierKind, string> = {
  konk: "text-primary",
  mosj: "text-muted-foreground",
  akad: "text-warning",
};

const axisBar: Record<Axis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const sgStroke: Record<StallenRow["sgTone"], string> = {
  pos: "var(--success)",
  neg: "var(--destructive)",
  flat: "var(--muted-foreground)",
};
const sgValClass: Record<StallenRow["sgTone"], string> = {
  pos: "text-success",
  neg: "text-destructive",
  flat: "text-muted-foreground",
};

const statusClass: Record<StallenRow["status"], string> = {
  aktiv: "bg-[var(--color-pyr-fys-track)] text-success",
  bak: "bg-[var(--color-pyr-tek-track)] text-warning",
  inaktiv: "bg-destructive/10 text-destructive",
  veil: "bg-accent text-primary",
};
const statusDot: Record<StallenRow["status"], string> = {
  aktiv: "bg-success shadow-[0_0_6px_hsl(var(--success)/0.6)]",
  bak: "bg-warning",
  inaktiv: "bg-destructive",
  veil: "bg-primary",
};

// ── SG sparkline (8-punkt linje + endepunkt-dot i delta-farge) ───
function SgSparkline({ values, tone }: { values: number[]; tone: StallenRow["sgTone"] }) {
  const w = 64;
  const h = 26;
  if (values.length < 2) {
    return <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">—</span>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stroke = sgStroke[tone];
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const last = pts[pts.length - 1].split(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-[26px] w-16" aria-hidden>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2} fill={stroke} />
    </svg>
  );
}

function fmtDelta(d: number | null, tone: StallenRow["sgTone"]): string {
  if (d == null) return "—";
  const sign = tone === "pos" ? "+" : tone === "neg" ? "−" : "±";
  return `${sign}${Math.abs(d).toFixed(2).replace(".", ",")}`;
}

function fmtHours(h: number): string {
  return h.toFixed(1).replace(".", ",");
}

// ── Sort-header ──────────────────────────────────────────────────
function SortTh({
  label,
  col,
  activeSort,
  activeDir,
  align = "left",
  onSort,
  className,
}: {
  label: string;
  col: ColKey;
  activeSort: ColKey;
  activeDir: SortDir;
  align?: "left" | "right" | "center";
  onSort: (col: ColKey) => void;
  className?: string;
}) {
  const isSorted = activeSort === col;
  const Icon = !isSorted ? ChevronsUpDown : activeDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      onClick={() => onSort(col)}
      className={cn(
        "cursor-pointer select-none border-b border-border bg-card px-3 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em]",
        isSorted ? "text-foreground" : "text-muted-foreground",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <Icon
          className={cn("h-2.5 w-2.5", isSorted ? "opacity-100 text-foreground" : "opacity-40")}
          strokeWidth={2}
          aria-hidden
        />
      </span>
    </th>
  );
}

export type StallenTableProps = {
  rows: StallenRow[];
  total: number;
  counts: { all: number; WANG: number; GFGK: number; AKA: number };
  bakPlan: number;
  inaktive: number;
  hoursDelta: number;
  weekNo: number;
  activeGroup: GroupBucket | "alle";
  activeSort: ColKey;
  activeDir: SortDir;
  query: string;
};

export function StallenTable({
  rows,
  total,
  counts,
  bakPlan,
  inaktive,
  hoursDelta,
  weekNo,
  activeGroup,
  activeSort,
  activeDir,
  query,
}: StallenTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState(query);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [rows, safePage],
  );

  const pageIds = pageRows.map((r) => r.id);
  const allOnPageChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someChecked = selected.size > 0;
  const someOnPageChecked = pageIds.some((id) => selected.has(id));

  function pushParams(next: Record<string, string | null>) {
    const sp = new URLSearchParams();
    sp.set("view", "tabell");
    const merged: Record<string, string | null> = {
      group: activeGroup === "alle" ? null : activeGroup,
      sort: activeSort,
      dir: activeDir,
      q: query || null,
      ...next,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v != null && v !== "") sp.set(k, v);
    }
    startTransition(() => router.push(`/admin/spillere?${sp.toString()}`));
  }

  // 3-state sort: asc → desc → av (tilbake til default sg/desc).
  function onSort(col: ColKey) {
    if (activeSort !== col) {
      pushParams({ sort: col, dir: "desc" });
    } else if (activeDir === "desc") {
      pushParams({ sort: col, dir: "asc" });
    } else {
      pushParams({ sort: "sg", dir: "desc" });
    }
  }

  function onFilterGroup(g: GroupBucket | "alle") {
    setPage(1);
    pushParams({ group: g === "alle" ? null : g });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    pushParams({ q: searchValue.trim() || null });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageChecked) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  const groupPills: { key: GroupBucket | "alle"; label: string; ct: number }[] = [
    { key: "alle", label: "Alle", ct: counts.all },
    { key: "WANG", label: "WANG", ct: counts.WANG },
    { key: "GFGK", label: "GFGK", ct: counts.GFGK },
    { key: "AKA", label: "AKA", ct: counts.AKA },
  ];

  const isEmpty = rows.length === 0;
  const isSearchEmpty = isEmpty && (query.length > 0 || activeGroup !== "alle");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* ── Tittelrad ── */}
      <div className="flex items-baseline gap-4 px-5 pb-3.5 pt-[18px]">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          STALLEN
        </span>
        <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-foreground">
          {total} spillere · uke {weekNo}
        </h2>
        <span className="ml-auto inline-flex items-center gap-4 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          <span>
            <b className="font-bold text-foreground">{bakPlan}</b> bak plan
          </span>
          <span>·</span>
          <span>
            <b className="font-bold text-foreground">{inaktive}</b> inaktive
          </span>
          <span>·</span>
          <span>
            <b className="font-bold text-foreground">
              {hoursDelta >= 0 ? `+${hoursDelta} t` : `${hoursDelta} t`}
            </b>{" "}
            vs forrige 30 d
          </span>
        </span>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2.5 border-y border-border bg-background px-5 py-2.5">
        <div className="inline-flex gap-1.5" role="tablist">
          {groupPills.map((p) => {
            const on = activeGroup === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onFilterGroup(p.key)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em]",
                  on
                    ? "border-primary bg-primary text-accent"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                {p.label}
                <span
                  className={cn(
                    "rounded-full px-[5px] py-0.5 font-mono text-[9px] font-extrabold",
                    on ? "bg-accent/30 text-accent" : "bg-primary/[0.08] text-muted-foreground",
                  )}
                >
                  {p.ct}
                </span>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={onSearchSubmit}
          className="inline-flex h-7 max-w-[320px] min-w-[220px] flex-1 items-center gap-2 rounded-full border border-input bg-card px-2.5"
        >
          <Search className="h-[13px] w-[13px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Søk på navn, coach, status …"
            className="min-w-0 flex-1 bg-transparent font-sans text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="rounded-[3px] bg-secondary px-[5px] py-px font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
            ⌘F
          </span>
        </form>

        <div className="ml-auto inline-flex gap-1.5">
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
          >
            <SlidersHorizontal className="h-3 w-3" strokeWidth={2} aria-hidden />
            Filter
          </button>
          <button
            type="button"
            onClick={() => onSort(activeSort)}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
          >
            <ArrowDownNarrowWide className="h-3 w-3" strokeWidth={2} aria-hidden />
            Sortér
          </button>
          <Link
            href="/admin/spillere/ny"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-accent hover:opacity-90"
          >
            <Plus className="h-3 w-3" strokeWidth={2} aria-hidden />
            Ny spiller
          </Link>
        </div>
      </div>

      {/* ── BatchActionBar (betinget) ── */}
      {someChecked && (
        <div className="flex items-center gap-3.5 border-b border-border bg-accent/[0.13] px-5 py-2.5">
          <span className="inline-flex items-center gap-[7px] font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
            <b className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-[5px] text-[10px] font-extrabold text-accent">
              {selected.size}
            </b>
            valgt
          </span>
          <div className="inline-flex gap-1.5">
            {[
              { icon: UserCog, label: "Tildel coach" },
              { icon: Send, label: "Send melding" },
              { icon: FolderInput, label: "Flytt gruppe" },
              { icon: Download, label: "Eksporter" },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <button
                  key={b.label}
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
                >
                  <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
                  {b.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" strokeWidth={2} aria-hidden />
            Avbryt
          </button>
        </div>
      )}

      {/* ── Tabell / tom-tilstand ── */}
      {isEmpty ? (
        <div className="flex flex-col items-center gap-1 px-6 pb-14 pt-13 text-center">
          <span className="mb-2.5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <UserRoundSearch className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
          </span>
          <h3 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">
            {query
              ? `Ingen spillere matcher «${query}»`
              : "Ingen spillere i denne gruppen"}
          </h3>
          <p className="max-w-[40ch] text-[13px] leading-relaxed text-muted-foreground">
            {isSearchEmpty
              ? "Prøv et annet navn, eller nullstill søk og filter for å søke i hele stallen."
              : "Legg til din første spiller for å komme i gang."}
          </p>
          {isSearchEmpty ? (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                setPage(1);
                pushParams({ q: null, group: null });
              }}
              className="mt-3.5 inline-flex h-8 items-center gap-[7px] rounded-full border border-border bg-card px-4 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
            >
              <RotateCcw className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
              Nullstill søk &amp; filter
            </button>
          ) : (
            <Link
              href="/admin/spillere/ny"
              className="mt-3.5 inline-flex h-8 items-center gap-[7px] rounded-full border border-border bg-card px-4 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground hover:bg-secondary"
            >
              <Plus className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
              Ny spiller
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse font-sans">
              <colgroup>
                <col className="w-11" />
                <col className="w-60" />
                <col className="w-[76px]" />
                <col className="w-[122px]" />
                <col className="w-[92px]" />
                <col className="w-[110px]" />
                <col className="w-[90px]" />
                <col className="w-[130px]" />
                <col className="w-40" />
                <col className="w-[120px]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="border-b border-border bg-card px-3 py-2.5 text-center">
                    <Checkbox
                      state={allOnPageChecked ? "on" : someOnPageChecked ? "ind" : "off"}
                      onClick={toggleAllOnPage}
                      label="Velg alle"
                    />
                  </th>
                  <SortTh label="Spiller" col="name" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                  <SortTh label="Gruppe" col="group" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                  <SortTh label="Coach" col="coach" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                  <SortTh label="Tier" col="tier" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                  <SortTh label="Økter uke" col="okt" align="right" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                  <SortTh label="Tim. 30 d" col="hours" align="right" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                  <SortTh label="SG-trend" col="sg" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                  <SortTh label="Pyr. uke" col="adh" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                  <SortTh label="Status" col="status" activeSort={activeSort} activeDir={activeDir} onSort={onSort} />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <Row
                    key={r.id}
                    row={r}
                    checked={selected.has(r.id)}
                    onToggle={() => toggleRow(r.id)}
                    onOpen={() => router.push(`/admin/spillere/${r.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between border-t border-border bg-background px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
            <span className="tabular-nums">
              Viser{" "}
              <b className="text-foreground">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)}
              </b>{" "}
              av <b className="text-foreground">{rows.length}</b> spillere
            </span>
            {pageCount > 1 && (
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40"
                  aria-label="Forrige side"
                >
                  <ChevronLeft className="h-3 w-3" strokeWidth={2} aria-hidden />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1)
                  .slice(0, 6)
                  .map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={cn(
                        "h-[26px] min-w-[26px] rounded-md px-2 font-mono text-[11px] font-extrabold",
                        n === safePage
                          ? "border border-primary bg-primary text-accent"
                          : "text-foreground hover:bg-secondary",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  type="button"
                  disabled={safePage === pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40"
                  aria-label="Neste side"
                >
                  <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Checkbox ─────────────────────────────────────────────────────
function Checkbox({
  state,
  onClick,
  label,
}: {
  state: "on" | "off" | "ind";
  onClick: () => void;
  label: string;
}) {
  return (
    <span
      role="checkbox"
      aria-checked={state === "ind" ? "mixed" : state === "on"}
      aria-label={label}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "relative inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border-[1.5px] transition-colors",
        state === "off"
          ? "border-input bg-card hover:border-primary"
          : "border-accent bg-accent",
      )}
    >
      {state === "on" && <Check className="h-[11px] w-[11px] text-primary" strokeWidth={3} aria-hidden />}
      {state === "ind" && <span className="h-0.5 w-2 rounded-[1px] bg-primary" />}
    </span>
  );
}

// ── Rad ──────────────────────────────────────────────────────────
function Row({
  row: r,
  checked,
  onToggle,
  onOpen,
}: {
  row: StallenRow;
  checked: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const TierIcon = tierIcon[r.tier];
  const oktTone =
    r.oktPlanned > 0 && r.oktDone < r.oktPlanned
      ? "below"
      : r.oktDone > r.oktPlanned
        ? "over"
        : "on";
  const oktPctRaw = r.oktPlanned > 0 ? (r.oktDone / r.oktPlanned) * 100 : 0;
  const oktPct = Math.min(100, Math.round(oktPctRaw));
  const adhToneClass =
    r.adhPct == null
      ? "text-foreground"
      : r.adhPct < 40
        ? "text-destructive"
        : r.adhPct < 60
          ? "text-warning"
          : "text-foreground";

  return (
    <tr
      onClick={onOpen}
      className={cn(
        "cursor-pointer border-b border-border transition-colors last:border-b-0",
        checked ? "bg-accent/[0.06] hover:bg-accent/10" : "hover:bg-primary/[0.03]",
      )}
    >
      {/* checkbox */}
      <td className="px-3 py-[11px] text-center align-middle">
        <Checkbox
          state={checked ? "on" : "off"}
          onClick={onToggle}
          label={`Velg ${r.name}`}
        />
      </td>

      {/* Spiller */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <div className="flex items-center gap-2.5">
          {r.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <span
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold",
                r.status === "veil"
                  ? "bg-accent text-primary"
                  : r.status === "bak"
                    ? "bg-primary text-accent"
                    : "bg-secondary text-foreground",
              )}
            >
              {r.initials}
            </span>
          )}
          <span className="flex min-w-0 flex-col leading-[1.15]">
            <span className="truncate text-[13px] font-semibold tracking-[-0.005em] text-foreground">
              {r.name}
            </span>
            <span className="mt-px truncate font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              {r.sub}
            </span>
          </span>
        </div>
      </td>

      {/* Gruppe */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        {r.group ? (
          <span
            className={cn(
              "inline-flex h-[22px] items-center justify-center rounded-full px-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
              groupClass[r.group],
            )}
          >
            {r.group}
          </span>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground">—</span>
        )}
      </td>

      {/* Coach */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        {r.coachName ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
            <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[8px] font-bold text-foreground">
              {r.coachInitials}
            </span>
            <span className="truncate">{r.coachName}</span>
          </span>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground">Ingen</span>
        )}
      </td>

      {/* Tier */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-foreground">
          <TierIcon className={cn("h-3.5 w-3.5", tierIconClass[r.tier])} strokeWidth={2} aria-hidden />
          {r.tierLabel}
        </span>
      </td>

      {/* Økter uke */}
      <td className="border-b border-border px-3 py-[11px] text-right align-middle">
        <span className="inline-flex items-center gap-2 font-mono tabular-nums">
          <span
            className={cn(
              "text-xs font-bold tracking-[-0.01em]",
              oktTone === "below" ? "text-warning" : oktTone === "over" ? "text-success" : "text-foreground",
            )}
          >
            {r.oktDone}
            <span className="font-semibold text-muted-foreground">/{r.oktPlanned}</span>
          </span>
          <span className="h-1 w-14 overflow-hidden rounded-full bg-foreground/[0.06]">
            <span
              className={cn(
                "block h-full",
                oktTone === "below" ? "bg-warning" : oktTone === "over" ? "bg-success" : "bg-primary",
              )}
              style={{ width: `${oktPct}%` }}
            />
          </span>
        </span>
      </td>

      {/* Tim. 30 d */}
      <td className="border-b border-border px-3 py-[11px] text-right align-middle font-mono text-[13px] font-semibold tabular-nums text-foreground">
        {fmtHours(r.hours30)}
      </td>

      {/* SG-trend */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span className="inline-flex items-center gap-2 font-mono tabular-nums">
          <SgSparkline values={r.sgTrend} tone={r.sgTone} />
          <span className={cn("text-xs font-bold tracking-[-0.01em]", sgValClass[r.sgTone])}>
            {fmtDelta(r.sgDelta, r.sgTone)}
          </span>
        </span>
      </td>

      {/* Pyr. uke */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span className="flex items-center gap-2">
          <span className="flex w-[100px] gap-0.5">
            {r.adherence.map((a) => (
              <span
                key={a.axis}
                className={cn(
                  "relative h-3.5 flex-1 overflow-hidden rounded-[2px] bg-foreground/[0.06]",
                  a.alarm && "shadow-[inset_0_0_0_1px_hsl(var(--destructive))]",
                )}
              >
                <span
                  className={cn("absolute inset-x-0 bottom-0 rounded-[2px]", axisBar[a.axis])}
                  style={{ height: `${a.pct}%` }}
                />
              </span>
            ))}
          </span>
          <span className={cn("font-mono text-[11px] font-bold tabular-nums tracking-[-0.01em]", adhToneClass)}>
            {r.adhPct == null ? "—" : `${r.adhPct} %`}
          </span>
        </span>
      </td>

      {/* Status */}
      <td className="border-b border-border px-3 py-[11px] align-middle">
        <span
          className={cn(
            "inline-flex h-[22px] items-center gap-1.5 rounded-full pl-2 pr-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
            statusClass[r.status],
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[r.status])} />
          {r.statusLabel}
        </span>
      </td>
    </tr>
  );
}
