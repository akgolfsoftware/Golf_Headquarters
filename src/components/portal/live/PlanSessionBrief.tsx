import type { LiveSessionData } from "@/lib/portal-live/types";
import { AXIS_LABEL } from "@/lib/portal-live/format";
import { startPlanSession } from "@/lib/portal-live/actions";
import { briefAction, type BriefBlockReason } from "@/lib/portal-live/brief-state";
import { SessionBrief } from "./SessionBrief";
import { BriefStart } from "./BriefStart";
import { PH04Lenke, PH04TilbakeIDag, PH04TilbakeTilPlan } from "@/components/portal/precision/PH04LiveBrief";

export type PlanSessionBriefProps = { data: LiveSessionData; canStart: boolean; blockReason: BriefBlockReason };

export function PlanSessionBrief({ data, canStart, blockReason }: PlanSessionBriefProps) {
  const choice = briefAction(data.status, canStart, blockReason);
  const href = choice.kind === "summary" ? `/portal/live/${data.sessionId}/summary` : choice.kind === "continue" ? `/portal/live/${data.sessionId}/tapper` : blockReason === "tier" ? "/portal/meg/abonnement" : null;
  const sperret = choice.kind === "blocked";
  const action = choice.kind === "start"
    ? data.drills.length === 0 ? <PH04TilbakeIDag /> : <BriefStart action={startPlanSession.bind(null, data.sessionId)} />
    : <>{href && <PH04Lenke href={href}>{choice.label}</PH04Lenke>}{sperret && <PH04TilbakeTilPlan />}</>;
  const ekstra = [];
  if (data.rationale && data.rationale !== data.maalsetning) ekstra.push({ label: data.maalsetning ? "Om økta" : "Mål for økta", text: data.rationale });
  if (data.planName) ekstra.push({ label: "Plan", text: data.planName });
  return <SessionBrief title={data.title} durationMin={data.durationMin} scheduledAtISO={data.scheduledAtISO} location={data.location} pyramide={data.axis}
    maal={data.maalsetning} sections={ekstra} action={action} message={choice.message}
    drills={data.drills.map((drill) => ({ id: drill.id, navn: drill.name, pyramide: drill.axis, notat: drill.notes || null,
      min: drill.durationMin && drill.durationMin > 0 ? drill.durationMin : null, mengde: drill.repsLabel || null,
      under: drill.axis !== data.axis ? AXIS_LABEL[drill.axis] : null,
    }))} />;
}
