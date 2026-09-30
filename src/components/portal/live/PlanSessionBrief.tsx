import type { LiveSessionData } from "@/lib/portal-live/types";
import { AXIS_LABEL } from "@/lib/portal-live/format";
import { startPlanSession } from "@/lib/portal-live/actions";
import { briefAction, type BriefBlockReason } from "@/lib/portal-live/brief-state";
import { BriefLenke, SessionBrief, tilAkse } from "./SessionBrief";
import { BriefStart } from "./BriefStart";

export type PlanSessionBriefProps = { data: LiveSessionData; canStart: boolean; blockReason: BriefBlockReason };

export function PlanSessionBrief({ data, canStart, blockReason }: PlanSessionBriefProps) {
  const choice = briefAction(data.status, canStart, blockReason);
  const href = choice.kind === "summary" ? `/portal/live/${data.sessionId}/summary` : choice.kind === "continue" ? `/portal/live/${data.sessionId}/tapper` : blockReason === "tier" ? "/portal/meg/abonnement" : null;
  const action = choice.kind === "start" ? <BriefStart action={startPlanSession.bind(null, data.sessionId)} /> : href ? <BriefLenke href={href}>{choice.label}</BriefLenke> : null;
  const sections = [];
  if (data.maalsetning) sections.push({ label: "Mål for økta", text: data.maalsetning });
  if (data.rationale && data.rationale !== data.maalsetning) sections.push({ label: data.maalsetning ? "Om økta" : "Mål for økta", text: data.rationale });
  return <SessionBrief odId="playerhq-live-brief-plan" title={data.title} durationMin={data.durationMin} scheduledAtISO={data.scheduledAtISO} location={data.location}
    axes={tilAkse(data.axis)} sections={sections} action={action} startable={choice.kind === "start"} message={choice.message}
    drills={data.drills.map((drill) => ({ id: drill.id, name: drill.name, notes: drill.notes, reps: drill.plannedReps > 0 ? drill.plannedReps : null, min: drill.durationMin ?? null,
      meta: [drill.repsLabel || null, AXIS_LABEL[drill.axis]].filter((value): value is string => Boolean(value)),
    }))} />;
}
