import type { LiveV2Session } from "./types";
import { plannedVolumText } from "./types";
import { AXIS_LABEL } from "@/lib/portal-live/format";
import { briefAction, type BriefBlockReason } from "@/lib/portal-live/brief-state";
import { BriefLenke, SessionBrief, tilAkse } from "./SessionBrief";

export type LiveBriefProps = { data: LiveV2Session; canStart: boolean; blockReason: BriefBlockReason };
const date = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", timeZone: "Europe/Oslo" });

/** Valgt PH-04-innhold. Tidligere referanse: playerhq-live-brief.html.
 * Avvik:
 *   - Direkte øktlenke har egen side; bakgrunn/overlegg kontrolleres videre.
 */
export function LiveBrief({ data, canStart, blockReason }: LiveBriefProps) {
  const windowMin = Math.max(0, Math.round((new Date(data.endTimeISO).getTime() - new Date(data.scheduledAtISO).getTime()) / 60_000));
  const drillMin = data.drills.reduce((sum, drill) => sum + drill.durationMinutes, 0);
  const durationMin = Number.isFinite(windowMin) && windowMin > 0 ? windowMin : drillMin;
  const choice = briefAction(data.status, canStart, blockReason);
  const href = choice.kind === "summary" ? `/portal/live/${data.sessionId}/summary` : ["start", "continue"].includes(choice.kind) ? `/portal/live/${data.sessionId}/active` : blockReason === "tier" ? "/portal/meg/abonnement" : null;
  const sections = [];
  if (data.maalsetning) sections.push({ label: "Mål for økta", text: data.maalsetning });
  if (data.focus) sections.push({ label: "Fokus", text: data.focus });
  if (data.coachComment) sections.push({ label: "Fra coachen", text: data.coachComment });
  const provenance = [data.coachName ? `Fra ${data.coachName}` : null, data.publishedAtISO ? `Lagt i planen ${date.format(new Date(data.publishedAtISO))}` : null, windowMin <= 0 && drillMin > 0 ? "Planlagt tid er summen av øvelsene." : null].filter(Boolean).join(" · ");
  return <SessionBrief odId="playerhq-live-brief-v2" title={data.title} durationMin={durationMin} scheduledAtISO={data.scheduledAtISO} location={data.location} axes={tilAkse(data.pyramide)}
    who={data.studentName} coach={data.coachName} sections={sections} message={choice.message} provenance={provenance} startable={choice.kind === "start"}
    action={href ? <BriefLenke href={href} odId="brief-start">{choice.label}</BriefLenke> : null}
    secondary={canStart && choice.kind === "start" ? <BriefLenke href="/portal/planlegge/workbench" odId="brief-flytt-okta" variant="ghost">Åpne i Workbench</BriefLenke> : null}
    drills={data.drills.map((drill) => ({ id: drill.id, name: drill.name, notes: [drill.description, drill.notes !== drill.description ? drill.notes : null].filter(Boolean).join("\n"), reps: drill.plannedReps > 0 ? drill.plannedReps : null, min: drill.durationMinutes,
      meta: [plannedVolumText(drill), AXIS_LABEL[drill.pyramide]].filter((value): value is string => Boolean(value)) }))} />;
}
