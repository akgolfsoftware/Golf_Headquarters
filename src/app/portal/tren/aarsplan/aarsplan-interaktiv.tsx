"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { opprettSeasonPlan, opprettPeriodBlock, slettPeriodBlock } from "./actions";
import type { LPhase } from "@/generated/prisma/client";
import { PeriodeConstraintBadges } from "@/components/portal/periode-constraint-badges";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PeriodBlockData = {
  id: string;
  lPhase: LPhase;
  startDate: Date;
  endDate: Date;
  focus: string | null;
  weeklyVolMin: number | null;
  weeklyVolMax: number | null;
};

export type SeasonPlanData = {
  id: string;
  year: number;
  name: string | null;
  startDate: Date;
  endDate: Date;
  periodBlocks: PeriodBlockData[];
};

export type TurneringPin = {
  id: string;
  navn: string;
  dato: Date;
  priority: "MAJOR" | "NORMAL" | "LOCAL";
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LPHASE_META: Record<LPhase, { label: string; color: string; desc: string }> = {
  GRUNN:     { label: "Grunnperiode",           color: "bg-emerald-600", desc: "Fysisk og teknisk grunnlag" },
  SPESIAL:   { label: "Spesialiseringsperiode", color: "bg-teal-600",   desc: "Spesialisert trening" },
  TURNERING: { label: "Turneringsperiode",      color: "bg-amber-500",  desc: "Kampforberedelse og prestasjon" },
};

const LPHASE_ORDER: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];

// ---------------------------------------------------------------------------
// Tidslinje (vannrett Jan–Des med periode-band)
// ---------------------------------------------------------------------------

const PIN_COLOR: Record<"MAJOR" | "NORMAL" | "LOCAL", string> = {
  MAJOR: "text-primary",
  NORMAL: "text-accent-foreground",
  LOCAL: "text-muted-foreground",
};

function Tidslinje({
  plan,
  blocks,
  turneringer,
}: {
  plan: SeasonPlanData;
  blocks: PeriodBlockData[];
  turneringer: TurneringPin[];
}) {
  const [aktivPin, setAktivPin] = useState<string | null>(null);
  const yearStart = new Date(plan.year, 0, 1);
  const yearEnd = new Date(plan.year, 11, 31);
  const totalMs = yearEnd.getTime() - yearStart.getTime();

  function pct(d: Date) {
    const ms = Math.max(0, Math.min(totalMs, d.getTime() - yearStart.getTime()));
    return (ms / totalMs) * 100;
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-6">
      <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Tidslinje {plan.year}
      </div>

      {/* Turnerings-pins (▲) over tidslinjen */}
      {turneringer.length > 0 && (
        <div className="relative mb-1 h-6">
          {turneringer.map((t) => {
            const left = pct(t.dato);
            const aktiv = aktivPin === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAktivPin(aktiv ? null : t.id)}
                className={`absolute -translate-x-1/2 ${PIN_COLOR[t.priority]} hover:scale-125 transition-transform`}
                style={{ left: `${left}%`, top: 0 }}
                title={`${t.navn} — ${t.dato.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}`}
                aria-label={`Turnering ${t.navn}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <polygon points="7,2 13,12 1,12" fill="currentColor" />
                </svg>
                {aktiv && (
                  <div className="absolute left-1/2 top-full z-20 mt-1 w-48 -translate-x-1/2 rounded-md border border-border bg-card p-2 text-left shadow-lg">
                    <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                      {t.dato.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-foreground">{t.navn}</div>
                    <Link
                      href="/portal/tren/turneringer"
                      className="mt-1 inline-block text-[10px] font-medium text-primary hover:underline"
                    >
                      Se detaljer →
                    </Link>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Month labels */}
      <div className="relative mb-1 flex">
        {MONTHS.map((m) => (
          <div key={m} className="flex-1 text-center font-mono text-[9px] text-muted-foreground">
            {m}
          </div>
        ))}
      </div>

      {/* Grid + bands */}
      <div className="relative h-12 overflow-hidden rounded-md bg-secondary">
        {/* Month lines */}
        {MONTHS.slice(1).map((_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 w-px bg-border/60"
            style={{ left: `${((i + 1) / 12) * 100}%` }}
          />
        ))}

        {/* Period bands */}
        {blocks.map((b) => {
          const left = pct(b.startDate);
          const right = pct(b.endDate);
          const width = Math.max(0.5, right - left);
          const meta = LPHASE_META[b.lPhase];
          return (
            <div
              key={b.id}
              className={`absolute inset-y-1 flex items-center justify-center overflow-hidden rounded-sm ${meta.color} opacity-80`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${meta.label}${b.focus ? ` — ${b.focus}` : ""}`}
            >
              {width > 8 && (
                <span className="truncate px-1 font-mono text-[9px] font-semibold text-white">
                  {meta.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {blocks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {LPHASE_ORDER.filter((p) => blocks.some((b) => b.lPhase === p)).map((p) => {
            const meta = LPHASE_META[p];
            return (
              <span key={p} className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                <span className={`h-2.5 w-2.5 rounded-sm ${meta.color}`} />
                {meta.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OpprettSesonPlan form
// ---------------------------------------------------------------------------

export function OpprettSesonPlanSkjema({ year }: { year: number }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(`${year}-01-01`);
  const [endDate, setEndDate] = useState(`${year}-12-31`);
  const [name, setName] = useState(`Sesong ${year}`);
  const [feil, setFeil] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    startTransition(async () => {
      const res = await opprettSeasonPlan({ year, startDate, endDate, name });
      if (!res.ok) setFeil(res.feil);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-[14px] font-semibold text-primary-foreground hover:opacity-90"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Opprett sesongplan for {year}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 max-w-sm rounded-xl border border-border bg-card p-6 space-y-4"
    >
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Ny sesongplan — {year}
      </div>

      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">Navn</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Startdato</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Sluttdato</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      {feil && <p className="text-sm text-destructive">{feil}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Oppretter…" : "Opprett sesongplan"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// PeriodSkjema — legg til ny periode
// ---------------------------------------------------------------------------

function PeriodSkjema({
  seasonPlanId,
  year,
  onDone,
}: {
  seasonPlanId: string;
  year: number;
  onDone: () => void;
}) {
  const [lPhase, setLPhase] = useState<LPhase>("GRUNN");
  const [startDate, setStartDate] = useState(`${year}-01-01`);
  const [endDate, setEndDate] = useState(`${year}-02-28`);
  const [focus, setFocus] = useState("");
  const [volMin, setVolMin] = useState("");
  const [volMax, setVolMax] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    startTransition(async () => {
      const res = await opprettPeriodBlock({
        seasonPlanId,
        lPhase,
        startDate,
        endDate,
        focus: focus || undefined,
        weeklyVolMin: volMin ? Number(volMin) : undefined,
        weeklyVolMax: volMax ? Number(volMax) : undefined,
      });
      if (res.ok) onDone();
      else setFeil(res.feil);
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-secondary/50 p-4 space-y-2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Ny periode
      </div>

      {/* LPhase-velger */}
      <div className="flex flex-wrap gap-2">
        {LPHASE_ORDER.map((p) => {
          const meta = LPHASE_META[p];
          return (
            <button
              key={p}
              type="button"
              onClick={() => setLPhase(p)}
              className={`rounded-full px-4 py-1 font-mono text-[11px] font-semibold transition-all ${
                lPhase === p
                  ? `${meta.color} text-white`
                  : "border border-border bg-card text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Fra</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-4 py-1.5 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Til</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-4 py-1.5 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">Fokus (valgfritt)</span>
        <input
          type="text"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder={`f.eks. "${LPHASE_META[lPhase].desc}"`}
          className="mt-1 w-full rounded-md border border-input bg-background px-4 py-1.5 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Min. min/uke</span>
          <input
            type="number"
            value={volMin}
            onChange={(e) => setVolMin(e.target.value)}
            placeholder="60"
            min={0}
            className="mt-1 w-full rounded-md border border-input bg-background px-4 py-1.5 text-sm tabular-nums focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Maks min/uke</span>
          <input
            type="number"
            value={volMax}
            onChange={(e) => setVolMax(e.target.value)}
            placeholder="120"
            min={0}
            className="mt-1 w-full rounded-md border border-input bg-background px-4 py-1.5 text-sm tabular-nums focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      {feil && <p className="text-sm text-destructive">{feil}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Lagrer…" : "Legg til periode"}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-muted-foreground hover:text-foreground">
          Avbryt
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// PeriodListe — viser blokker med slett-knapp
// ---------------------------------------------------------------------------

function PeriodListe({
  blocks,
}: {
  blocks: PeriodBlockData[];
}) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function slett(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await slettPeriodBlock(id);
      setDeletingId(null);
    });
  }

  if (blocks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Ingen perioder lagt til enda.</p>
    );
  }

  const sorted = [...blocks].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  return (
    <div className="space-y-2">
      {sorted.map((b) => {
        const meta = LPHASE_META[b.lPhase];
        const fmtDate = (d: Date) =>
          d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
        return (
          <div
            key={b.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2"
          >
            <div className={`h-3 w-3 flex-none rounded-sm ${meta.color}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
                  {meta.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {fmtDate(b.startDate)} – {fmtDate(b.endDate)}
                </span>
              </div>
              {b.focus && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{b.focus}</p>
              )}
              <div className="mt-1">
                <PeriodeConstraintBadges lPhase={b.lPhase} compact />
              </div>
            </div>
            {b.weeklyVolMin && (
              <span className="flex-none font-mono text-xs tabular-nums text-muted-foreground">
                {b.weeklyVolMin}–{b.weeklyVolMax ?? "?"}m/uke
              </span>
            )}
            <button
              onClick={() => slett(b.id)}
              disabled={isPending && deletingId === b.id}
              className="flex-none rounded-md p-1 text-muted-foreground hover:text-destructive disabled:opacity-40"
              title="Slett periode"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export — AarsplanInteraktiv
// ---------------------------------------------------------------------------

export function AarsplanInteraktiv({
  plan,
  turneringer = [],
}: {
  plan: SeasonPlanData;
  turneringer?: TurneringPin[];
}) {
  const [visSkjema, setVisSkjema] = useState(false);
  const [visDetaljer, setVisDetaljer] = useState(false);

  return (
    <div className="space-y-6">
      <Tidslinje plan={plan} blocks={plan.periodBlocks} turneringer={turneringer} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Perioder */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Perioder
            </div>
            {!visSkjema && (
              <button
                onClick={() => setVisSkjema(true)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-4 py-1 text-xs font-medium hover:border-foreground/20"
              >
                <Plus className="h-3 w-3" strokeWidth={2} />
                Legg til periode
              </button>
            )}
          </div>

          <PeriodListe blocks={plan.periodBlocks} />

          {visSkjema && (
            <div className="mt-4">
              <PeriodSkjema
                seasonPlanId={plan.id}
                year={plan.year}
                onDone={() => setVisSkjema(false)}
              />
            </div>
          )}
        </div>

        {/* Sesong-info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <button
            onClick={() => setVisDetaljer(!visDetaljer)}
            className="flex w-full items-center justify-between"
          >
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Sesong-info
            </div>
            {visDetaljer ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            )}
          </button>

          {visDetaljer && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Navn</span>
                <span className="text-foreground">{plan.name ?? `Sesong ${plan.year}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Start</span>
                <span className="tabular-nums text-foreground">
                  {plan.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Slutt</span>
                <span className="tabular-nums text-foreground">
                  {plan.endDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Perioder</span>
                <span className="tabular-nums text-foreground">{plan.periodBlocks.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
