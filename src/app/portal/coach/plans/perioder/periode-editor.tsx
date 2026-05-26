"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { LPhase } from "@/generated/prisma/client";
import { PERIODE_TYPER } from "@/lib/taxonomy";
import { PeriodeConstraintBadges } from "@/components/portal/periode-constraint-badges";
import { opprettPeriodForSpiller, slettPeriodCoach } from "./actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PeriodBlockData = {
  id: string;
  lPhase: LPhase;
  startDate: Date;
  endDate: Date;
  focus: string | null;
  weeklyVolMin: number | null;
  weeklyVolMax: number | null;
};

type PlanData = {
  id: string;
  year: number;
  name: string | null;
  startDate: Date;
  endDate: Date;
  periodBlocks: PeriodBlockData[];
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
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

// ---------------------------------------------------------------------------
// Tidslinje
// ---------------------------------------------------------------------------

function Tidslinje({ plan, blocks }: { plan: PlanData; blocks: PeriodBlockData[] }) {
  const yearStart = new Date(plan.year, 0, 1);
  const yearEnd = new Date(plan.year, 11, 31);
  const totalMs = yearEnd.getTime() - yearStart.getTime();

  function pct(d: Date) {
    const ms = Math.max(0, Math.min(totalMs, new Date(d).getTime() - yearStart.getTime()));
    return (ms / totalMs) * 100;
  }

  return (
    <div>
      <div className="relative mb-1 flex">
        {MONTHS.map((m) => (
          <div key={m} className="flex-1 text-center font-mono text-[9px] text-muted-foreground">
            {m}
          </div>
        ))}
      </div>

      <div className="relative h-12 overflow-hidden rounded-md bg-secondary">
        {MONTHS.slice(1).map((_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 w-px bg-border/60"
            style={{ left: `${((i + 1) / 12) * 100}%` }}
          />
        ))}

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

      {blocks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3">
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
// NyPeriodeSkjema — med constraints
// ---------------------------------------------------------------------------

function NyPeriodeSkjema({
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

  const constraints = PERIODE_TYPER[lPhase];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    startTransition(async () => {
      const res = await opprettPeriodForSpiller({
        seasonPlanId,
        lPhase,
        startDate,
        endDate,
        focus: focus || undefined,
        weeklyVolMin: volMin ? Number(volMin) : undefined,
        weeklyVolMax: volMax ? Number(volMax) : undefined,
      });
      if (res.ok) onDone();
      else setFeil(res.feil ?? "Ukjent feil");
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-secondary/50 p-4 space-y-4">
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
              className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition-all ${
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

      {/* Constraint-badges for valgt fase */}
      <PeriodeConstraintBadges lPhase={lPhase} />

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Fra</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Til</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
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
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">
            Min. min/uke
          </span>
          <input
            type="number"
            value={volMin}
            onChange={(e) => setVolMin(e.target.value)}
            placeholder="60"
            min={0}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">
            Maks min/uke
            {constraints.maxVolumMin != null && (
              <span className="ml-1 text-muted-foreground/60">
                (maks {constraints.maxVolumMin})
              </span>
            )}
          </span>
          <input
            type="number"
            value={volMax}
            onChange={(e) => setVolMax(e.target.value)}
            placeholder={constraints.maxVolumMin?.toString() ?? ""}
            min={0}
            max={constraints.maxVolumMin ?? undefined}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      {feil && <p className="text-sm text-destructive">{feil}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Lagrer..." : "Legg til periode"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// PeriodRad — en periode med constraint-badges + slett
// ---------------------------------------------------------------------------

function PeriodRad({
  block,
  onSlett,
  sletter,
}: {
  block: PeriodBlockData;
  onSlett: (id: string) => void;
  sletter: boolean;
}) {
  const meta = LPHASE_META[block.lPhase];

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-2">
      <div className="flex items-center gap-3">
        <div className={`h-3 w-3 flex-none rounded-sm ${meta.color}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
              {meta.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {fmtDate(block.startDate)} – {fmtDate(block.endDate)}
            </span>
          </div>
          {block.focus && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{block.focus}</p>
          )}
        </div>
        {block.weeklyVolMin != null && (
          <span className="flex-none font-mono text-xs tabular-nums text-muted-foreground">
            {block.weeklyVolMin}–{block.weeklyVolMax ?? "?"}m/uke
          </span>
        )}
        <button
          onClick={() => onSlett(block.id)}
          disabled={sletter}
          className="flex-none rounded-md p-1 text-muted-foreground hover:text-destructive disabled:opacity-40"
          title="Slett periode"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <PeriodeConstraintBadges lPhase={block.lPhase} compact />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PeriodeEditor — hovedkomponent
// ---------------------------------------------------------------------------

export function PeriodeEditor({ plan }: { plan: PlanData }) {
  const [visSkjema, setVisSkjema] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function slett(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await slettPeriodCoach(id);
      setDeletingId(null);
    });
  }

  const sorted = [...plan.periodBlocks].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-4">
      <Tidslinje plan={plan} blocks={sorted} />

      {/* Periodeliste */}
      <div className="space-y-2">
        {sorted.length === 0 && !visSkjema && (
          <p className="text-sm text-muted-foreground">
            Ingen perioder lagt til enda.
          </p>
        )}
        {sorted.map((b) => (
          <PeriodRad
            key={b.id}
            block={b}
            onSlett={slett}
            sletter={isPending && deletingId === b.id}
          />
        ))}
      </div>

      {/* Ny periode */}
      {visSkjema ? (
        <NyPeriodeSkjema
          seasonPlanId={plan.id}
          year={plan.year}
          onDone={() => setVisSkjema(false)}
        />
      ) : (
        <button
          onClick={() => setVisSkjema(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-medium hover:border-foreground/20"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Legg til periode
        </button>
      )}
    </div>
  );
}
