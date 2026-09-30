import { Play } from "lucide-react";
import type { LiveV2Session } from "./types";
import { plannedVolumText } from "./types";
import { AXIS_LABEL } from "@/lib/portal-live/format";
import { briefAction, type BriefBlockReason } from "@/lib/portal-live/brief-state";
import { SessionBrief } from "./SessionBrief";
import { KnappLenke } from "@/components/precision/pa";
import { akseFraPyramide } from "./brief-akse";

export type LiveBriefProps = { data: LiveV2Session; canStart: boolean; blockReason: BriefBlockReason };
const date = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", timeZone: "Europe/Oslo" });

/** PH-04 Før start (Precision Athletics). Presentasjonen ligger i SessionBrief. */
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
  return <SessionBrief odId="playerhq-live-brief-v2" title={data.title} durationMin={durationMin} scheduledAtISO={data.scheduledAtISO} location={data.location} context={AXIS_LABEL[data.pyramide]} sections={sections} message={choice.message} provenance={provenance}
    akse={akseFraPyramide(data.pyramide)}
    action={<>{href && <KnappLenke size="xl" fullWidth href={href} icon={choice.kind === "start" || choice.kind === "continue" ? Play : undefined} iconName="play">{choice.label}</KnappLenke>}{canStart && choice.kind === "start" && <KnappLenke variant="ghost" fullWidth href="/portal/planlegge/workbench">Åpne i Workbench</KnappLenke>}</>}
    drills={data.drills.map((drill) => ({ id: drill.id, name: drill.name, notes: [drill.description, drill.notes !== drill.description ? drill.notes : null].filter(Boolean).join("\n"), meta: [drill.durationMinutes > 0 ? `${drill.durationMinutes} min` : null, plannedVolumText(drill) ?? (drill.plannedReps > 0 ? `${drill.plannedReps} repetisjoner` : null), AXIS_LABEL[drill.pyramide]].filter((value): value is string => Boolean(value)) }))} />;
}
