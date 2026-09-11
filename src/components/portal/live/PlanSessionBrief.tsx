import Link from "next/link";
import type { LiveSessionData } from "@/lib/portal-live/types";
import { AXIS_LABEL } from "@/lib/portal-live/format";
import { startPlanSession } from "@/lib/portal-live/actions";
import { briefAction, type BriefBlockReason } from "@/lib/portal-live/brief-state";
import { SessionBrief } from "./SessionBrief";
import { BriefStart } from "./BriefStart";
import styles from "./session-brief.module.css";

const L_PHASE_LABEL: Record<string, string> = { GRUNN: "Grunnperiode", SPESIAL: "Spesialiseringsperiode", TURNERING: "Turneringsperiode" };
export type PlanSessionBriefProps = { data: LiveSessionData; canStart: boolean; blockReason: BriefBlockReason };

export function PlanSessionBrief({ data, canStart, blockReason }: PlanSessionBriefProps) {
  const choice = briefAction(data.status, canStart, blockReason);
  const href = choice.kind === "summary" ? `/portal/live/${data.sessionId}/summary` : choice.kind === "continue" ? `/portal/live/${data.sessionId}/tapper` : blockReason === "tier" ? "/portal/meg/abonnement" : null;
  const action = choice.kind === "start" ? <BriefStart action={startPlanSession.bind(null, data.sessionId)} /> : href ? <Link href={href} className={styles.primary}>{choice.label}</Link> : null;
  const sections = [];
  if (data.maalsetning) sections.push({ label: "Mål for økta", text: data.maalsetning });
  if (data.rationale && data.rationale !== data.maalsetning) sections.push({ label: data.maalsetning ? "Om økta" : "Mål for økta", text: data.rationale });
  return <SessionBrief odId="playerhq-live-brief-plan" title={data.title} durationMin={data.durationMin} scheduledAtISO={data.scheduledAtISO} location={data.location}
    context={`${data.planName} · ${AXIS_LABEL[data.axis]}`} sections={sections} action={action} message={choice.message}
    drills={data.drills.map((drill) => ({ id: drill.id, name: drill.name, notes: drill.notes,
      meta: [drill.durationMin && drill.durationMin > 0 ? `${drill.durationMin} min` : null, drill.repsLabel || null, AXIS_LABEL[drill.axis], drill.lPhase ? L_PHASE_LABEL[drill.lPhase] ?? drill.lPhase : null].filter((value): value is string => Boolean(value)),
      target: drill.csTarget != null ? `Gjennomføringsmål (CS): ${drill.csTarget}` : null,
    }))} />;
}
