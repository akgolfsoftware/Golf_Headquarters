"use client";

/**
 * Planlegge = Workbench-mobil (ph-workbench.jsx · WorkbenchScreen mobil).
 * Mode-rail (6 moduser) + Treningsplan-tidslinje (default). Avanserte moduser
 * åpnes i den komplette Workbenchen (/portal/planlegge/workbench).
 */

import { useState } from "react";
import Link from "next/link";
import {
  CalendarRange,
  ListChecks,
  Dumbbell,
  Target,
  Swords,
  CirclePlus,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { AthleticBadge } from "@/components/athletic/badge";
import type { PlanleggeData, PlanDag, PyrKey } from "@/lib/portal-planlegge/planlegge-data";

const MODES = [
  { key: "arsplan", label: "Årsplan", icon: CalendarRange, sub: "Sesong · periodisering" },
  { key: "trening", label: "Treningsplan", icon: ListChecks, sub: "Uka · økter" },
  { key: "fys", label: "Fysplan", icon: Dumbbell, sub: "Styrke + speed" },
  { key: "mal", label: "Mål", icon: Target, sub: "Sesongmål" },
  { key: "drills", label: "Drills", icon: Swords, sub: "Øvelsesbibliotek" },
  { key: "okt", label: "Ny økt", icon: CirclePlus, sub: "Planlegg en enkelt økt" },
] as const;
type ModeKey = (typeof MODES)[number]["key"];

const PYR_VAR: Record<PyrKey, string> = {
  fys: "var(--pyr-fys)", tek: "var(--pyr-tek)", slag: "var(--pyr-slag)", spill: "var(--pyr-spill)", turn: "var(--pyr-turn)",
};

function PlanRad({ o }: { o: PlanDag["items"][number] }) {
  return (
    <Link
      href={o.href}
      className="flex items-center gap-3 rounded-xl border border-border border-l-[3px] bg-card p-3 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ borderLeftColor: PYR_VAR[o.omr] }}
    >
      <span className="w-[46px] shrink-0 text-right font-mono text-xs font-semibold text-foreground">{o.tid}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold tracking-[-0.005em] text-foreground">{o.tittel}</span>
          {o.naa && <AthleticBadge variant="lime">Nå</AthleticBadge>}
        </span>
        <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{o.tag} · {o.dur}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={2} aria-hidden />
    </Link>
  );
}

function Trening({ data }: { data: PlanleggeData }) {
  if (data.antall === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Ingen økter planlagt denne uka.</p>
        <Link href="/portal/planlegge/workbench" className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
          Åpne Workbench <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-4 font-mono text-xs leading-relaxed text-muted-foreground">
        Fra coachen din · <b className="text-primary">{data.antall} {data.antall === 1 ? "økt" : "økter"}</b> denne uka.
      </div>
      {data.dager.map((d) => (
        <div key={d.dag + d.dato}>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-mono text-[11px] font-bold uppercase text-foreground">{d.dag} {d.dato}.</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            {d.items.map((o) => (
              <PlanRad key={o.id} o={o} />
            ))}
          </div>
        </div>
      ))}
      {/* Inspector-hint (matcher fasitens bunn-sheet tomtilstand) */}
      <div className="mt-2 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-7 text-center">
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
          <ListChecks className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="font-display text-base font-bold text-foreground">Treningsplan</div>
        <p className="mx-auto mt-1 max-w-[30ch] text-sm text-muted-foreground">
          Trykk en økt for å se detaljer og redigere den.
        </p>
      </div>
    </div>
  );
}

function ModusIntro({ mode }: { mode: (typeof MODES)[number] }) {
  const Ikon = mode.icon;
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-8 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
        <Ikon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="font-display text-lg font-bold text-foreground">{mode.label}</div>
      <p className="mx-auto mt-1 max-w-[34ch] text-sm text-muted-foreground">{mode.sub}. Full redigering skjer i Workbench.</p>
      <Link
        href="/portal/planlegge/workbench"
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        Åpne i Workbench
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </Link>
    </div>
  );
}

export function PlanleggeWorkbench({ data }: { data: PlanleggeData }) {
  const [mode, setMode] = useState<ModeKey>("trening");
  const aktiv = MODES.find((m) => m.key === mode)!;
  return (
    <div>
      {/* Mode-rail */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MODES.map((m) => {
          const Ikon = m.icon;
          const on = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.04em] transition-colors " +
                (on ? "bg-primary text-accent" : "bg-secondary text-foreground hover:bg-secondary/70")
              }
            >
              <Ikon className="h-4 w-4" strokeWidth={2} aria-hidden />
              {m.label}
            </button>
          );
        })}
      </div>

      {mode === "trening" ? <Trening data={data} /> : <ModusIntro mode={aktiv} />}
    </div>
  );
}
