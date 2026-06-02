/**
 * AgencyOS — Spillere (Stallen) komplett spilleroversikt.
 * Presentasjonell, props-drevet port av v10-fasiten:
 *   - Visuell fasit: public/design-handover/_screens/ag-stallen.png
 *   - Struktur-/CSS-referanse: public/design-handover/agencyos/
 *       components-agency-player-table.html
 *
 * Panel med:
 *   - Tittelrad (STALLEN eyebrow + "N spillere · uke X" + meta-tall)
 *   - Toolbar (gruppe-filter-piller + søk + Filter/Sortér/Ny spiller)
 *   - Sortbar tabell (checkbox-kolonne, Spiller, Gruppe, Coach, Tier,
 *     Økter uke, Tim. 30 d, SG-trend sparkline, Pyr. uke 5-akse-meter, Status)
 *   - Pagination
 *
 * Desktop (≥1024px): bred tabell, pixel-nær fasiten.
 * Mobil (≤640px): hver spiller som stablet kort, søk/filter kollapsbar på topp.
 *
 * Client component for lokal interaktivitet (gruppe-filter, søk, multi-select
 * + betinget BatchActionBar). INGEN Prisma/DB/auth — alt kommer via props.
 * Ingen hardkodet hex utenfor DS-token-referanser, ingen emoji (kun lucide).
 */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowDownNarrowWide,
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
import { cn } from "@/lib/utils";

// ── Domenetyper ──────────────────────────────────────────────────────

export type GroupBucket = "WANG" | "GFGK" | "AKA";
export type TierKind = "konk" | "mosj" | "akad";
export type SgTone = "pos" | "neg" | "flat";
export type PlayerStatus = "aktiv" | "bak" | "inaktiv" | "veil";
export type AvatarTone = "default" | "pri" | "lime";

export interface SpillerRow {
  id: string;
  initials: string;
  avatarTone: AvatarTone;
  name: string;
  /** Sekundær mono-linje under navnet, f.eks. "SRIXON #2 · 12 DG" */
  sub: string;
  group: GroupBucket;
  coachInitials: string;
  coachName: string;
  tier: TierKind;
  /** Økter denne uka — gjennomført / planlagt */
  oktDone: number;
  oktPlanned: number;
  /** Treningstimer siste 30 d, ferdig formatert (norsk komma), f.eks. "14,5" */
  hours30: string;
  /** SG-trend: 8-punkt sparkline-verdier (siste 8 uker) */
  sgSpark: number[];
  /** SG delta-etikett, ferdig formatert, f.eks. "−0,42" */
  sgValue: string;
  sgTone: SgTone;
  /** Pyramide-adherence uke: 5 akser i rekkefølge fys, tek, slag, spill, turn (0–100) */
  adherence: [number, number, number, number, number];
  /** Aggregat-prosent for uka, heltall 0–100 */
  adherencePct: number;
  status: PlayerStatus;
}

export interface SpillerListeData {
  /** Eyebrow over tittel (default "STALLEN") */
  eyebrow?: string;
  /** Ukenummer vist i tittel, f.eks. 23 */
  week: number;
  /** Meta-tall i tittelrad */
  bakPlan: number;
  inaktive: number;
  /** Ferdig formatert timer-delta, f.eks. "+18 t" */
  hoursDelta: string;
  rows: SpillerRow[];
  /** Basis-URL for spillerdetalj — id appendes (default "/admin/spillere") */
  detailBase?: string;
  /** URL for "Ny spiller" (default "/admin/spillere/ny") */
  newHref?: string;
}

// ── Token-mapping (samme som stallen-table.tsx — DS-tokens, ingen hex) ──

const groupChipClass: Record<GroupBucket, string> = {
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
const tierLabel: Record<TierKind, string> = {
  konk: "KONK",
  mosj: "MOSJ",
  akad: "AKAD",
};

const avatarToneClass: Record<AvatarTone, string> = {
  default: "bg-secondary text-foreground",
  pri: "bg-primary text-accent",
  lime: "bg-accent text-primary",
};

const axisBarClass: Record<number, string> = {
  0: "bg-pyr-fys",
  1: "bg-pyr-tek",
  2: "bg-pyr-slag",
  3: "bg-pyr-spill",
  4: "bg-pyr-turn",
};

const sgStroke: Record<SgTone, string> = {
  pos: "hsl(var(--success))",
  neg: "hsl(var(--destructive))",
  flat: "hsl(var(--muted-foreground))",
};
const sgValClass: Record<SgTone, string> = {
  pos: "text-success",
  neg: "text-destructive",
  flat: "text-muted-foreground",
};

const statusChipClass: Record<PlayerStatus, string> = {
  aktiv: "bg-[var(--color-pyr-fys-track)] text-success",
  bak: "bg-[var(--color-pyr-tek-track)] text-warning",
  inaktiv: "bg-destructive/10 text-destructive",
  veil: "bg-accent text-primary",
};
const statusDotClass: Record<PlayerStatus, string> = {
  aktiv: "bg-success shadow-[0_0_6px_hsl(var(--success)/0.6)]",
  bak: "bg-warning",
  inaktiv: "bg-destructive",
  veil: "bg-primary",
};
const statusLabel: Record<PlayerStatus, string> = {
  aktiv: "Aktiv",
  bak: "Bak plan",
  inaktiv: "Inaktiv",
  veil: "Ønsker veil.",
};

// Aggregat-farge per terskel: rød < 40 %, varsel < 60 %, ellers forest default.
function adherencePctClass(pct: number): string {
  if (pct < 40) return "text-destructive";
  if (pct < 60) return "text-warning";
  return "text-foreground";
}
// Akse-alarm: under 40 % får rød ramme.
function axisIsAlarm(value: number): boolean {
  return value < 40;
}

// ── SG sparkline (8-punkt linje + endepunkt-dot i delta-farge) ────────

function SgSparkline({ values, tone }: { values: number[]; tone: SgTone }) {
  const w = 64;
  const h = 26;
  const pad = 3;
  if (values.length < 2) {
    return (
      <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
        —
      </span>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return [x, y] as const;
  });
  const d = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const [lastX, lastY] = pts[pts.length - 1];
  const stroke = sgStroke[tone];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="block h-[26px] w-16"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2} fill={stroke} />
    </svg>
  );
}

// ── Pyramide-adherence meter (5 thin akser) ───────────────────────────

function AdherenceMeter({
  axes,
  pct,
  size = "table",
}: {
  axes: [number, number, number, number, number];
  pct: number;
  size?: "table" | "card";
}) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("flex gap-0.5", size === "card" ? "w-20" : "w-[100px]")}>
        {axes.map((value, i) => (
          <span
            key={i}
            className={cn(
              "relative h-3.5 flex-1 overflow-hidden rounded-[2px] bg-foreground/[0.06]",
              axisIsAlarm(value) &&
                "shadow-[inset_0_0_0_1px_hsl(var(--destructive))]",
            )}
          >
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 rounded-[2px]",
                axisBarClass[i],
              )}
              style={{ height: `${value}%` }}
            />
          </span>
        ))}
      </span>
      <span
        className={cn(
          "whitespace-nowrap font-mono text-[11px] font-bold tabular-nums tracking-[-0.01em]",
          adherencePctClass(pct),
        )}
      >
        {pct} %
      </span>
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────

function Avatar({
  initials,
  tone,
  size = "row",
}: {
  initials: string;
  tone: AvatarTone;
  size?: "row" | "coach";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        avatarToneClass[tone],
        size === "row" ? "h-8 w-8 text-[11px]" : "h-[18px] w-[18px] text-[8px]",
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────

function Checkbox({
  state,
  onClick,
  label,
}: {
  state: "off" | "on" | "indeterminate";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === "indeterminate" ? "mixed" : state === "on"}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors",
        state === "off"
          ? "border-input bg-card hover:border-primary"
          : "border-accent bg-accent",
      )}
    >
      {state === "on" && (
        <Check className="h-[11px] w-[11px] text-primary" strokeWidth={3} aria-hidden />
      )}
      {state === "indeterminate" && (
        <span className="h-0.5 w-2 rounded-[1px] bg-primary" />
      )}
    </button>
  );
}

// ── Hjelpere ──────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const GROUP_TABS: Array<{ key: "ALLE" | GroupBucket; label: string }> = [
  { key: "ALLE", label: "Alle" },
  { key: "WANG", label: "WANG" },
  { key: "GFGK", label: "GFGK" },
  { key: "AKA", label: "AKA" },
];

function oktTone(done: number, planned: number): "below" | "over" | "" {
  if (planned > 0 && done < planned) return "below";
  if (done > planned) return "over";
  return "";
}

// ── Hovedkomponent ────────────────────────────────────────────────────

export function SpillerListe({ data }: { data: SpillerListeData }) {
  const {
    eyebrow = "STALLEN",
    week,
    bakPlan,
    inaktive,
    hoursDelta,
    rows,
    detailBase = "/admin/spillere",
    newHref = "/admin/spillere/ny",
  } = data;

  const [groupFilter, setGroupFilter] = useState<"ALLE" | GroupBucket>("ALLE");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Antall per gruppe (for pille-tellere) — basert på full liste.
  const groupCounts = useMemo(() => {
    const c: Record<"ALLE" | GroupBucket, number> = {
      ALLE: rows.length,
      WANG: 0,
      GFGK: 0,
      AKA: 0,
    };
    for (const r of rows) c[r.group] += 1;
    return c;
  }, [rows]);

  // Filtrert liste (gruppe + søk på navn/coach/status).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (groupFilter !== "ALLE" && r.group !== groupFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.coachName.toLowerCase().includes(q) ||
        statusLabel[r.status].toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q)
      );
    });
  }, [rows, groupFilter, query]);

  const total = rows.length;
  const shownCount = filtered.length;

  // Header-checkbox state mot synlige (filtrerte) rader.
  const visibleIds = filtered.map((r) => r.id);
  const selectedVisible = visibleIds.filter((id) => selected.has(id)).length;
  const headerState: "off" | "on" | "indeterminate" =
    selectedVisible === 0
      ? "off"
      : selectedVisible === visibleIds.length
        ? "on"
        : "indeterminate";

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (headerState === "on") {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  }
  function clearSelection() {
    setSelected(new Set());
  }
  function resetSearchAndFilter() {
    setQuery("");
    setGroupFilter("ALLE");
  }

  const selectedCount = selected.size;
  const isEmpty = shownCount === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* ── Tittelrad ── */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 pb-3.5 pt-[18px]">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </span>
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
          {total} spillere · uke {week}
        </h2>
        <span className="ml-auto inline-flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          <span>
            <b className="font-bold text-foreground">{bakPlan}</b> bak plan
          </span>
          <span aria-hidden>·</span>
          <span>
            <b className="font-bold text-foreground">{inaktive}</b> inaktive
          </span>
          <span aria-hidden>·</span>
          <span>
            <b className="font-bold text-foreground">{hoursDelta}</b> vs forrige 30 d
          </span>
        </span>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-2.5 border-y border-border bg-background px-5 py-2.5 md:flex-row md:items-center md:gap-2.5">
        <div className="inline-flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrer på gruppe">
          {GROUP_TABS.map((tab) => {
            const on = groupFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setGroupFilter(tab.key)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] transition-colors",
                  on
                    ? "border-primary bg-primary text-accent"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 font-mono text-[9px] font-extrabold tabular-nums",
                    on ? "bg-accent/30 text-accent" : "bg-primary/[0.08] text-muted-foreground",
                  )}
                >
                  {groupCounts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        <label className="inline-flex h-7 min-w-0 flex-1 items-center gap-2 rounded-full border border-input bg-card px-2.5 md:max-w-xs">
          <Search className="h-[13px] w-[13px] shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk på navn, coach, status …"
            aria-label="Søk i stallen"
            className="min-w-0 flex-1 border-0 bg-transparent font-sans text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="hidden rounded-[3px] bg-secondary px-1.5 py-px font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground sm:inline">
            ⌘F
          </span>
        </label>

        <div className="inline-flex flex-wrap gap-1.5 md:ml-auto">
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
          >
            <SlidersHorizontal className="h-3 w-3" strokeWidth={2} aria-hidden />
            Filter
          </button>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowDownNarrowWide className="h-3 w-3" strokeWidth={2} aria-hidden />
            Sortér
          </button>
          <Link
            href={newHref}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-accent transition-colors hover:bg-[var(--color-brand-primary-hover)]"
          >
            <Plus className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Ny spiller
          </Link>
        </div>
      </div>

      {/* ── BatchActionBar (betinget) ── */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-border bg-accent/[0.13] px-5 py-2.5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
            <b className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-extrabold text-accent">
              {selectedCount}
            </b>
            valgt
          </span>
          <div className="inline-flex flex-wrap gap-1.5">
            <BatchBtn icon={UserCog} label="Tildel coach" />
            <BatchBtn icon={Send} label="Send melding" />
            <BatchBtn icon={FolderInput} label="Flytt gruppe" />
            <BatchBtn icon={Download} label="Eksporter" />
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto inline-flex items-center gap-1.5 bg-transparent font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3 w-3" strokeWidth={2} aria-hidden />
            Avbryt
          </button>
        </div>
      )}

      {/* ── Innhold: tabell (desktop) / kort (mobil) ── */}
      {isEmpty ? (
        <EmptyState query={query} group={groupFilter} onReset={resetSearchAndFilter} />
      ) : (
        <>
          {/* Desktop-tabell */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full table-fixed border-collapse font-sans">
              <colgroup>
                <col className="w-11" />
                <col className="w-[210px]" />
                <col className="w-[76px]" />
                <col className="w-[104px]" />
                <col className="w-[92px]" />
                <col className="w-[110px]" />
                <col className="w-[90px]" />
                <col className="w-[120px]" />
                <col className="w-[136px]" />
                <col className="w-[120px]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="border-b border-border bg-card px-3 py-2.5 text-center">
                    <Checkbox state={headerState} onClick={toggleAll} label="Velg alle" />
                  </th>
                  <Th>Spiller</Th>
                  <Th>Gruppe</Th>
                  <Th>Coach</Th>
                  <Th>Tier</Th>
                  <Th align="right">Økter uke</Th>
                  <Th align="right">Tim. 30 d</Th>
                  <Th sorted>SG-trend</Th>
                  <Th>Pyr. uke</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const checked = selected.has(r.id);
                  const tone = oktTone(r.oktDone, r.oktPlanned);
                  const TierIcon = tierIcon[r.tier];
                  const oktFrac = r.oktPlanned > 0 ? Math.min(100, (r.oktDone / r.oktPlanned) * 100) : 0;
                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        "group border-b border-border transition-colors last:border-b-0",
                        checked
                          ? "bg-accent/[0.06] hover:bg-accent/10"
                          : "hover:bg-primary/[0.03]",
                      )}
                    >
                      <td className="py-[11px] pl-3 pr-0 text-center align-middle">
                        <Checkbox
                          state={checked ? "on" : "off"}
                          onClick={() => toggleRow(r.id)}
                          label={`Velg ${r.name}`}
                        />
                      </td>
                      <td className="px-3 py-[11px] align-middle">
                        <Link href={`${detailBase}/${r.id}`} className="flex items-center gap-2.5 no-underline">
                          <Avatar initials={r.initials} tone={r.avatarTone} />
                          <span className="flex min-w-0 flex-col leading-[1.15]">
                            <span className="truncate text-[13px] font-semibold tracking-[-0.005em] text-foreground">
                              {r.name}
                            </span>
                            <span className="mt-px font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                              {r.sub}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-[11px] align-middle">
                        <span
                          className={cn(
                            "inline-flex h-[22px] items-center justify-center rounded-full px-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                            groupChipClass[r.group],
                          )}
                        >
                          {r.group}
                        </span>
                      </td>
                      <td className="px-3 py-[11px] align-middle">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-foreground">
                          <Avatar initials={r.coachInitials} tone="default" size="coach" />
                          {r.coachName}
                        </span>
                      </td>
                      <td className="px-3 py-[11px] align-middle">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-foreground">
                          <TierIcon className={cn("h-3.5 w-3.5", tierIconClass[r.tier])} strokeWidth={2} aria-hidden />
                          {tierLabel[r.tier]}
                        </span>
                      </td>
                      <td className="px-3 py-[11px] text-right align-middle">
                        <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                          <span
                            className={cn(
                              "text-xs font-bold tracking-[-0.01em]",
                              tone === "below" ? "text-warning" : tone === "over" ? "text-success" : "text-foreground",
                            )}
                          >
                            {r.oktDone}
                            <span className="font-semibold text-muted-foreground">/{r.oktPlanned}</span>
                          </span>
                          <span className="h-1 w-14 overflow-hidden rounded-full bg-foreground/[0.06]">
                            <span
                              className={cn(
                                "block h-full",
                                tone === "below" ? "bg-warning" : tone === "over" ? "bg-success" : "bg-primary",
                              )}
                              style={{ width: `${oktFrac}%` }}
                            />
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-[11px] text-right align-middle font-mono text-[13px] font-semibold tabular-nums text-foreground">
                        {r.hours30}
                      </td>
                      <td className="px-3 py-[11px] align-middle">
                        <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                          <SgSparkline values={r.sgSpark} tone={r.sgTone} />
                          <span className={cn("text-xs font-bold tracking-[-0.01em]", sgValClass[r.sgTone])}>
                            {r.sgValue}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-[11px] align-middle">
                        <AdherenceMeter axes={r.adherence} pct={r.adherencePct} />
                      </td>
                      <td className="px-3 py-[11px] align-middle">
                        <span
                          className={cn(
                            "inline-flex h-[22px] items-center gap-1.5 rounded-full pl-2 pr-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
                            statusChipClass[r.status],
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", statusDotClass[r.status])} aria-hidden />
                          {statusLabel[r.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobil-kort */}
          <ul className="divide-y divide-border md:hidden">
            {filtered.map((r) => {
              const checked = selected.has(r.id);
              const tone = oktTone(r.oktDone, r.oktPlanned);
              const TierIcon = tierIcon[r.tier];
              return (
                <li
                  key={r.id}
                  className={cn("p-4 transition-colors", checked && "bg-accent/[0.06]")}
                >
                  <div className="flex items-start gap-3">
                    <span className="pt-0.5">
                      <Checkbox
                        state={checked ? "on" : "off"}
                        onClick={() => toggleRow(r.id)}
                        label={`Velg ${r.name}`}
                      />
                    </span>
                    <Link href={`${detailBase}/${r.id}`} className="flex min-w-0 flex-1 flex-col gap-3 no-underline">
                      {/* Topp: avatar + navn + status */}
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={r.initials} tone={r.avatarTone} />
                        <span className="flex min-w-0 flex-1 flex-col leading-tight">
                          <span className="truncate text-sm font-semibold text-foreground">{r.name}</span>
                          <span className="mt-px font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                            {r.sub}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full pl-2 pr-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
                            statusChipClass[r.status],
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", statusDotClass[r.status])} aria-hidden />
                          {statusLabel[r.status]}
                        </span>
                      </div>

                      {/* Meta-rad: gruppe + tier + coach */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex h-[22px] items-center justify-center rounded-full px-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                            groupChipClass[r.group],
                          )}
                        >
                          {r.group}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-foreground">
                          <TierIcon className={cn("h-3.5 w-3.5", tierIconClass[r.tier])} strokeWidth={2} aria-hidden />
                          {tierLabel[r.tier]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Avatar initials={r.coachInitials} tone="default" size="coach" />
                          {r.coachName}
                        </span>
                      </div>

                      {/* Stat-rad: økter, timer, SG, adherence */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <span className="flex flex-col gap-1">
                          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                            Økter uke
                          </span>
                          <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                            <span
                              className={cn(
                                "text-xs font-bold",
                                tone === "below" ? "text-warning" : tone === "over" ? "text-success" : "text-foreground",
                              )}
                            >
                              {r.oktDone}
                              <span className="font-semibold text-muted-foreground">/{r.oktPlanned}</span>
                            </span>
                          </span>
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                            Tim. 30 d
                          </span>
                          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                            {r.hours30}
                          </span>
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                            SG-trend
                          </span>
                          <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                            <SgSparkline values={r.sgSpark} tone={r.sgTone} />
                            <span className={cn("text-xs font-bold", sgValClass[r.sgTone])}>{r.sgValue}</span>
                          </span>
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                            Pyr. uke
                          </span>
                          <AdherenceMeter axes={r.adherence} pct={r.adherencePct} size="card" />
                        </span>
                      </div>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between border-t border-border bg-background px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
            <span className="tabular-nums">
              Viser <b className="text-foreground">1–{Math.min(shownCount, PAGE_SIZE)}</b> av{" "}
              <b className="text-foreground">{shownCount}</b> spillere
            </span>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                aria-label="Forrige side"
                className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-3 w-3" strokeWidth={2} aria-hidden />
              </button>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === 1 ? "page" : undefined}
                  className={cn(
                    "inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-md px-2 font-mono text-[11px] font-extrabold tabular-nums",
                    n === 1
                      ? "border border-primary bg-primary text-accent"
                      : "bg-transparent text-foreground hover:bg-secondary",
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                aria-label="Neste side"
                className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-komponenter ───────────────────────────────────────────────────

function Th({
  children,
  align = "left",
  sorted = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  sorted?: boolean;
}) {
  return (
    <th
      className={cn(
        "border-b border-border bg-card px-3 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em]",
        align === "right" ? "text-right" : "text-left",
        sorted ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1",
          align === "right" && "flex-row-reverse",
        )}
      >
        {children}
        {sorted ? (
          <ArrowDown className="h-2.5 w-2.5 text-foreground" strokeWidth={2.5} aria-hidden />
        ) : (
          <ChevronsUpDown className="h-2.5 w-2.5 opacity-40" strokeWidth={2.5} aria-hidden />
        )}
      </span>
    </th>
  );
}

function BatchBtn({ icon: Icon, label }: { icon: typeof UserCog; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
    >
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
      {label}
    </button>
  );
}

function EmptyState({
  query,
  group,
  onReset,
}: {
  query: string;
  group: "ALLE" | GroupBucket;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 pb-14 pt-[52px] text-center">
      <span className="mb-2.5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <UserRoundSearch className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">
        {query
          ? `Ingen spillere matcher «${query}»`
          : "Ingen spillere i dette utvalget"}
      </h3>
      <p className="max-w-[40ch] text-[13px] leading-relaxed text-muted-foreground">
        Prøv et annet navn
        {group !== "ALLE" ? (
          <>
            , eller fjern <b className="font-bold text-foreground">{group}</b>-filteret for å søke i hele stallen.
          </>
        ) : (
          " eller nullstill søket."
        )}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-3.5 inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-4 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Nullstill søk &amp; filter
      </button>
    </div>
  );
}
