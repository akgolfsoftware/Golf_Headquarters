"use client";

/**
 * Drills-fanen for spiller-plan-detalj (coach-context).
 *
 * Eier:
 *   1. Klient-side kategori-filtrering via FilterChip (pyramide-aksene
 *      FYS/TEK/SLAG/SPILL/TURN — fra ekte PositionTask.pyramide).
 *   2. "Legg til drill" — gjenbruker OppgaveModal → createTask (samme mønster
 *      som den spiller-vendte oppgave-launcher.tsx).
 *   3. Per-drill "Rediger" — OppgaveModal i edit-modus → updateTaskBasics.
 *   4. Per-drill "Slett" — deleteTask.
 *
 * Drill-lista (`drills`-propen) er nå planens EKTE positions[].tasks (mappet i
 * page.tsx), ikke demo-data. Hver rad har en ekte taskId + ferdig OppgaveDraft.
 */

import { Knapp } from "@/components/v2";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import {
  OppgaveModal,
  type OppgaveDraft,
  type TmGoalDraft,
  type HitRateGoalDraft,
} from "@/components/teknisk-plan/oppgave-modal";
import { SG_BUCKETS, type PyramidArea } from "@/components/teknisk-plan/constants";
import {
  createTask,
  updateTaskBasics,
  deleteTask,
  logReps,
  type TaskInput,
} from "@/app/portal/tren/teknisk-plan/actions";
import { uploadTaskMedia } from "@/lib/storage/task-media";
import { skalerBilde, MAKS_ACTION_BYTES } from "@/lib/klient/skaler-avatar";

/** Pyramide-aksene — kategori-chip-settet. Speiler PositionTask.pyramide. */
const CATEGORIES: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/** Tailwind-tone per pyramide-akse (AgencyOS-lyst, samme palett som tag-radene). */
const CATEGORY_COLOR: Record<PyramidArea, string> = {
  FYS: "bg-purple-100 text-purple-800",
  TEK: "bg-sky-100 text-sky-800",
  SLAG: "bg-emerald-100 text-emerald-800",
  SPILL: "bg-orange-100 text-orange-800",
  TURN: "bg-amber-100 text-amber-800",
};

export interface DrillRow {
  taskId: string;
  name: string;
  category: PyramidArea;
  omraade: string;
  minLabel: string;
  reps: string;
  rate: string;
  tm: boolean;
  /** Ferdig draft for edit-modal — speiler den lagrede oppgaven. */
  draft: OppgaveDraft;
}

interface DrillsPanelProps {
  planId: string;
  /** Default mål-posisjon for global "Legg til drill" — planens hovedfokus/første P. */
  defaultTarget: { pNummer: string; pName: string };
  drills: DrillRow[];
}

/** Tom draft for "Legg til drill". */
function emptyDraft(target: { pNummer: string; pName: string }): OppgaveDraft {
  const omraadeTab = "Tee" as keyof typeof SG_BUCKETS;
  return {
    pNummer: target.pNummer,
    pName: target.pName,
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
    kategori: draft.kategori ?? null,
    repsMaalDry: draft.repsMaalDry,
    repsMaalLav: draft.repsMaalLav,
    repsMaalFull: draft.repsMaalFull,
    tmGoals: mapTmGoals(draft.tmGoals),
    hitRateGoals: mapHitRateGoals(draft.hitRateGoals),
  };
}

/** updateTaskBasics tar bare basis-feltene (ikke planId/P/tmGoals/hitRateGoals). */
function draftToBasicsPatch(draft: OppgaveDraft) {
  return {
    tittel: draft.tittel,
    beskrivelse: draft.beskrivelse || undefined,
    pyramide: draft.pyramide,
    omraade: draft.omraade,
    koller: draft.koller,
    lFase: draft.lFase ?? null,
    cs: draft.cs ?? null,
    miljo: draft.m ?? null,
    prPress: draft.pr ?? null,
    kategori: draft.kategori ?? null,
    repsMaalDry: draft.repsMaalDry,
    repsMaalLav: draft.repsMaalLav,
    repsMaalFull: draft.repsMaalFull,
  };
}

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; taskId: string; draft: OppgaveDraft }
  | null;

export function DrillsPanel({ planId, defaultTarget, drills }: DrillsPanelProps) {
  const router = useRouter();
  const toast = useToast();
  const [modal, setModal] = useState<ModalState>(null);
  const [openSeq, setOpenSeq] = useState(0);
  const [activeCategory, setActiveCategory] = useState<PyramidArea | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

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
    () => visible.reduce((sum, d) => sum + (parseInt(d.minLabel, 10) || 0), 0),
    [visible],
  );

  function openCreate() {
    setOpenSeq((n) => n + 1);
    setModal({ mode: "create" });
  }

  function openEdit(d: DrillRow) {
    setOpenSeq((n) => n + 1);
    setModal({ mode: "edit", taskId: d.taskId, draft: d.draft });
  }

  async function handleSubmit(draft: OppgaveDraft) {
    if (!draft.tittel.trim()) {
      toast.error("Drillen trenger en tittel.");
      return;
    }
    try {
      if (modal?.mode === "edit") {
        await updateTaskBasics(modal.taskId, draftToBasicsPatch(draft));
        toast.success("Drill oppdatert.");
      } else {
        await createTask(draftToTaskInput(planId, draft));
        toast.success("Drill lagt til.");
      }
      setModal(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke lagre drillen.");
    }
  }

  async function handleDelete(d: DrillRow) {
    if (!window.confirm(`Slette drillen «${d.name}»? Dette kan ikke angres.`)) return;
    setBusyTaskId(d.taskId);
    try {
      await deleteTask(d.taskId);
      toast.success("Drill slettet.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke slette drillen.");
    } finally {
      setBusyTaskId(null);
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
            <Knapp ghost icon="sparkles">
              AI-foreslå
            </Knapp>
          </Link>
          <Knapp icon="plus" onClick={openCreate}>
            Legg til drill
          </Knapp>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-base font-semibold">
              {visible.length} drills · ~{totalMin} min / uke
            </h2>
            <div className="font-mono mt-1 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
              Klikk rediger for å endre · slett for å fjerne
            </div>
          </div>
        </header>

        {visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <div className="font-display text-sm font-semibold">
              {drills.length === 0
                ? "Ingen drills i denne planen ennå"
                : "Ingen drills i denne kategorien"}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {drills.length === 0
                ? "Legg til den første drillen for å bygge ut planen."
                : "Velg en annen kategori eller legg til en ny drill."}
            </p>
            {drills.length === 0 ? (
              <div className="mt-4 flex justify-center">
                <Knapp icon="plus" onClick={openCreate}>
                  Legg til drill
                </Knapp>
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((d, i) => (
              <li
                key={d.taskId}
                className="grid grid-cols-[20px_32px_1fr_auto_auto_auto] items-center gap-2 py-2"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="font-mono text-sm font-bold text-muted-foreground">{i + 1}</div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`font-mono rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${CATEGORY_COLOR[d.category]}`}
                    >
                      {d.category}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      {d.omraade}
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(d)}
                    aria-label={`Rediger ${d.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d)}
                    disabled={busyTaskId === d.taskId}
                    aria-label={`Slett ${d.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal ? (
        <OppgaveModal
          key={openSeq}
          open
          onClose={() => setModal(null)}
          initial={modal.mode === "edit" ? modal.draft : emptyDraft(defaultTarget)}
          isEditing={modal.mode === "edit"}
          onSubmit={handleSubmit}
          onLogReps={
            modal.mode === "edit"
              ? (reps) => logReps(modal.taskId, reps).then(() => router.refresh())
              : undefined
          }
          onUploadMedia={
            modal.mode === "edit"
              ? async (file, kind) => {
                  // Server action-grensen (4 MB) avviser store filer FØR uploadTaskMedia
                  // kjører: bilder nedskaleres på klienten, video sjekkes med ærlig feil.
                  const sendes = kind === "bilde" ? await skalerBilde(file, 1600) : file;
                  if (sendes.size > MAKS_ACTION_BYTES) {
                    throw new Error("Fila er for stor (maks ~3,5 MB). Full videostøtte for større filer kommer.");
                  }
                  const fd = new FormData();
                  fd.append("file", sendes);
                  const res = await uploadTaskMedia(modal.taskId, fd, kind);
                  if (!res.ok) throw new Error(res.error);
                  router.refresh();
                  return res.url;
                }
              : undefined
          }
        />
      ) : null}
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
