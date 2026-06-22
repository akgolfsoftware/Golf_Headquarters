"use client";

/**
 * Drills-fanen for spiller-plan-detalj (coach-context).
 *
 * Eier:
 *   1. Klient-side kategori-filtrering via FilterChip (PUTT/SLAG/TEK/FYS/SPILL).
 *   2. "Legg til drill" — gjenbruker OppgaveModal → createTask (samme mønster
 *      som den spiller-vendte oppgave-launcher.tsx). Coachen får legge til
 *      oppgaver fordi createTask/ensurePlanAccess tillater COACH/ADMIN.
 *
 * NB (datakobling): drill-lista (`drills`-propen) er fortsatt demo-data fra
 * page.tsx, ikke plan.positions[].tasks. "Legg til drill" skriver derimot ekte
 * oppgaver til DB. Filtrering virker mot demo-lista. Se rapport.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Sparkles, ChevronRight, GripVertical } from "lucide-react";
import { AthleticButton } from "@/components/athletic";
import { useToast } from "@/components/shared/toast-provider";
import {
  OppgaveModal,
  type OppgaveDraft,
  type TmGoalDraft,
  type HitRateGoalDraft,
} from "@/components/teknisk-plan/oppgave-modal";
import { SG_BUCKETS } from "@/components/teknisk-plan/constants";
import { createTask, type TaskInput } from "@/app/portal/tren/teknisk-plan/actions";

export interface DrillRow {
  name: string;
  category: string;
  mins: string;
  reps: string;
  rate: string;
  tm: boolean;
  color: string;
}

interface DrillsPanelProps {
  planId: string;
  drills: DrillRow[];
}

/** Default P-posisjon for global "Legg til drill" (modal har ikke egen P-velger). */
const DEFAULT_TARGET = { pNummer: "P7.0", pName: "Impact" };

const CATEGORIES = ["PUTT", "SLAG", "TEK", "FYS", "SPILL"] as const;

/** Tom draft — samme defaults som den spiller-vendte launcheren. */
function emptyDraft(): OppgaveDraft {
  const omraadeTab = "Tee" as keyof typeof SG_BUCKETS;
  return {
    pNummer: DEFAULT_TARGET.pNummer,
    pName: DEFAULT_TARGET.pName,
    tittel: "",
    beskrivelse: "",
    pyramide: "TEK",
    omraadeTab,
    omraade: SG_BUCKETS[omraadeTab][0],
    koller: [],
    repsMaalDry: 0,
    repsMaalLav: 0,
    repsMaalFull: 0,
    tmGoals: [],
    hitRateGoals: [],
    drillIds: [],
  };
}

function mapTmGoals(drafts: TmGoalDraft[]): TaskInput["tmGoals"] {
  const mapped = drafts
    .filter((g) => g.baselineValue !== "" && g.targetValue !== "")
    .map((g) => ({
      metric: g.metric,
      klubb: g.klubb,
      baselineValue: Number(g.baselineValue),
      targetValue: Number(g.targetValue),
      targetType: g.targetType,
      comparison: g.comparison,
    }));
  return mapped.length ? mapped : undefined;
}

function mapHitRateGoals(drafts: HitRateGoalDraft[]): TaskInput["hitRateGoals"] {
  const mapped = drafts
    .filter(
      (g) =>
        g.requiredHits !== "" &&
        g.windowSize !== "" &&
        g.corridorMin !== "" &&
        g.corridorMax !== "",
    )
    .map((g) => ({
      metric: g.metric,
      klubb: g.klubb,
      protocol: g.protocol,
      windowSize: Number(g.windowSize),
      requiredHits: Number(g.requiredHits),
      corridorMin: Number(g.corridorMin),
      corridorMax: Number(g.corridorMax),
    }));
  return mapped.length ? mapped : undefined;
}

function draftToTaskInput(planId: string, draft: OppgaveDraft): TaskInput {
  return {
    planId,
    pNummer: draft.pNummer,
    pName: draft.pName,
    tittel: draft.tittel,
    beskrivelse: draft.beskrivelse || undefined,
    pyramide: draft.pyramide,
    omraade: draft.omraade,
    koller: draft.koller,
    lFase: draft.lFase ?? null,
    cs: draft.cs ?? null,
    miljo: draft.m ?? null,
    prPress: draft.pr ?? null,
    repsMaalDry: draft.repsMaalDry,
    repsMaalLav: draft.repsMaalLav,
    repsMaalFull: draft.repsMaalFull,
    tmGoals: mapTmGoals(draft.tmGoals),
    hitRateGoals: mapHitRateGoals(draft.hitRateGoals),
  };
}

export function DrillsPanel({ planId, drills }: DrillsPanelProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [openSeq, setOpenSeq] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of drills) map[d.category] = (map[d.category] ?? 0) + 1;
    return map;
  }, [drills]);

  const visible = useMemo(
    () => (activeCategory ? drills.filter((d) => d.category === activeCategory) : drills),
    [drills, activeCategory],
  );

  const totalMin = useMemo(
    () => visible.reduce((sum, d) => sum + parseInt(d.mins, 10), 0),
    [visible],
  );

  function openModal() {
    setOpenSeq((n) => n + 1);
    setOpen(true);
  }

  async function handleSubmit(draft: OppgaveDraft) {
    if (!draft.tittel.trim()) {
      toast.error("Drillen trenger en tittel.");
      return;
    }
    try {
      await createTask(draftToTaskInput(planId, draft));
      setOpen(false);
      toast.success("Drill lagt til.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke lagre drillen.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          label="Alle"
          count={drills.length}
          active={activeCategory === null}
          onClick={() => setActiveCategory(null)}
        />
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            count={counts[cat] ?? 0}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
        <div className="ml-auto flex gap-2">
          <Link href="/portal/ai/foresla-drill">
            <AthleticButton variant="ghost-light" size="sm">
              <Sparkles className="h-3.5 w-3.5" /> AI-foreslå
            </AthleticButton>
          </Link>
          <AthleticButton variant="lime" size="sm" onClick={openModal}>
            <Plus className="h-3.5 w-3.5" /> Legg til drill
          </AthleticButton>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-base font-semibold">
              {visible.length} drills · ~{totalMin} min / uke
            </h2>
            <div className="font-mono mt-1 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
              Dra for å endre rekkefølge · klikk → for detalj
            </div>
          </div>
        </header>
        <ul className="divide-y divide-border">
          {visible.map((d, i) => (
            <li
              key={d.name}
              className="grid grid-cols-[20px_32px_1fr_auto_auto_auto] items-center gap-2 py-2"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div className="font-mono text-sm font-bold text-muted-foreground">{i + 1}</div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`font-mono rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${d.color}`}
                  >
                    {d.category}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {d.mins}
                  </span>
                  {d.tm ? (
                    <span className="font-mono rounded-sm bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-orange-700">
                      TM
                    </span>
                  ) : null}
                </div>
                <div className="font-display text-sm font-semibold">{d.name}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                  REP-MÅL
                </div>
                <div className="font-mono text-xs font-semibold">{d.reps}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                  HIT-RATE
                </div>
                <div
                  className={`font-mono text-sm font-bold ${d.rate === "—" ? "text-muted-foreground" : "text-emerald-700"}`}
                >
                  {d.rate}
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <OppgaveModal
        key={openSeq}
        open={open}
        onClose={() => setOpen(false)}
        initial={emptyDraft()}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-px tabular-nums ${active ? "bg-white/20" : "bg-muted"}`}
      >
        {count}
      </span>
    </button>
  );
}
