import type { TodaySession } from "@/app/portal/actions";
import { sorterDag, type KalenderHendelse } from "@/lib/domain/kalender-lag";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { osloMinuttAvDogen } from "./idag-visning";

export type IDagAgendaHendelse = KalenderHendelse & { fullfort?: boolean; planSessionId?: string | null };

/** Øktradene kommer fra Plan; øvrige kalenderlag beholder sin identitet.
 * En fullført økt merkes fra status, aldri fordi klokkeslettet har passert. */
export function byggIDagAgenda(hendelser: readonly KalenderHendelse[], sessions: readonly TodaySession[]): IDagAgendaHendelse[] {
  const okter: IDagAgendaHendelse[] = sessions
    .filter((s) => s.status !== "CANCELLED" && s.status !== "SKIPPED")
    .map((s) => ({
      id: `okt-${s.id}`,
      planSessionId: s.planSessionId,
      lag: "OEKTER",
      dato: OSLO_YMD_FMT.format(s.startTime),
      tittel: s.title,
      undertekst: [s.sted, `${s.durationMin} min`].filter(Boolean).join(" · "),
      startMin: osloMinuttAvDogen(s.startTime),
      sluttMin: OSLO_YMD_FMT.format(s.startTime) === OSLO_YMD_FMT.format(s.endTime) ? osloMinuttAvDogen(s.endTime) : 1440,
      heldag: false,
      href: s.href,
      fullfort: s.status === "COMPLETED",
    }));
  return sorterDag([...hendelser.filter((h) => h.lag !== "OEKTER"), ...okter]) as IDagAgendaHendelse[];
}
