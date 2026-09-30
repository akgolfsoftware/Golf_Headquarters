import Link from "next/link";
import { Play } from "lucide-react";
import { Ikon } from "@/components/precision/pa";
import { PH04Lenke, PH04TilbakeIDag, PH04TilbakeTilPlan } from "@/components/portal/precision/PH04LiveBrief";
import type { LiveV2Session } from "./types";
import { plannedVolumText } from "./types";
import { AXIS_LABEL } from "@/lib/portal-live/format";
import { briefAction, type BriefBlockReason } from "@/lib/portal-live/brief-state";
import { SessionBrief } from "./SessionBrief";

export type LiveBriefProps = { data: LiveV2Session; canStart: boolean; blockReason: BriefBlockReason };
const date = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", timeZone: "Europe/Oslo" });

/** PH-04 Live-økt: før start (Precision Athletics). Tegning og avvik: PH04LiveBrief.tsx. */
export function LiveBrief({ data, canStart, blockReason }: LiveBriefProps) {
  const windowMin = Math.max(0, Math.round((new Date(data.endTimeISO).getTime() - new Date(data.scheduledAtISO).getTime()) / 60_000));
  const drillMin = data.drills.reduce((sum, drill) => sum + drill.durationMinutes, 0);
  const durationMin = Number.isFinite(windowMin) && windowMin > 0 ? windowMin : drillMin;
  const choice = briefAction(data.status, canStart, blockReason);
  const href = choice.kind === "summary" ? `/portal/live/${data.sessionId}/summary` : ["start", "continue"].includes(choice.kind) ? `/portal/live/${data.sessionId}/active` : blockReason === "tier" ? "/portal/meg/abonnement" : null;
  const provenance = [data.publishedAtISO ? `Lagt i planen ${date.format(new Date(data.publishedAtISO))}` : null, windowMin <= 0 && drillMin > 0 ? "Planlagt tid er summen av øvelsene." : null].filter(Boolean).join(" · ");
  const ekstra = [];
  if (data.coachComment) ekstra.push({ label: "Fra coachen", text: data.coachComment });
  if (provenance) ekstra.push({ label: "Om økta", text: provenance });
  const sperret = choice.kind === "blocked";
  const tomStart = data.drills.length === 0 && choice.kind === "start";
  const action = tomStart ? <PH04TilbakeIDag /> : <>{href && <PH04Lenke href={href} ikon={choice.kind === "start" ? <Ikon icon={Play} size={22} name="play" /> : undefined}>{choice.kind === "start" ? "Start økt" : choice.label}</PH04Lenke>}
    {canStart && choice.kind === "start" && <Link className="pa-btn pa-btn--secondary pa-btn--lg pa-btn--full" href="/portal/planlegge/workbench" data-od-id="brief-flytt-okta">Åpne i Workbench</Link>}
    {sperret && <PH04TilbakeTilPlan />}</>;
  return <SessionBrief title={data.title} durationMin={durationMin} scheduledAtISO={data.scheduledAtISO} location={data.location} pyramide={data.pyramide} hvem={data.studentName} coach={data.coachName}
    maal={data.maalsetning} fokus={data.focus} sections={ekstra} message={choice.message} action={action}
    drills={data.drills.map((drill) => ({ id: drill.id, navn: drill.name, pyramide: drill.pyramide, notat: [drill.description, drill.notes !== drill.description ? drill.notes : null].filter(Boolean).join("\n") || null,
      min: drill.durationMinutes > 0 ? drill.durationMinutes : null, mengde: plannedVolumText(drill) ?? (drill.plannedReps > 0 ? `${drill.plannedReps} reps` : null),
      under: drill.pyramide !== data.pyramide ? AXIS_LABEL[drill.pyramide] : null }))} />;
}
