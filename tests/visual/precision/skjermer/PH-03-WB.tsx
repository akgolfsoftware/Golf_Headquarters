/** Prøvefil for PH-03 Øktark for en Workbench-økt (pakke 2, /portal/tren/wb/[sessionId]). Syntetiske data fra utkastet. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH03WbOktark } from "@/components/portal/precision/PH03WbOktark";
import type { WorkbenchSession, SessionStatus } from "@/lib/domain/workbench/types";

export const sti = "/portal/tren/wb/w1";

const ovelse = (id: string, title: string, min: number, label: string) => ({
  id, title, durationMinutes: min, order: 0, akFormel: { pyramid: "SLAG", area: "INNSPILL", label },
}) as unknown as WorkbenchSession["drills"][number];

const okt = (status: SessionStatus, ekstra: Partial<WorkbenchSession> = {}): WorkbenchSession => ({
  id: "w1", playerId: "p1", coachId: "c1", date: "2026-10-05", startMinute: 930, durationMinutes: 75,
  title: "Innspill og nærspill", pyramid: "SLAG", status, blockType: "OEKT", location: "Range 3 · Fredrikstad GK",
  maalsetning: "7 av 10 innspill 50–100 m innenfor 4 m", rationale: "Hold samme rytme på alle lengder.",
  origin: "COACH", perceivedEffort: null, actualMinutes: null, fokusEtterOkt: null,
  drills: [
    ovelse("d1", "Oppvarming · Halv swing fra 50 m", 10, "SLAG · Innspill 50–100 m · Lav hastighet · Alene"),
    ovelse("d2", "Innspill 100–150 m · Lengdekontroll", 20, "SLAG · Innspill 100–150 m · Automatikk · Observert"),
    ovelse("d3", "Putting 3–5 fot · Ballstart", 10, "SLAG · Putting 3–5 fot · Automatikk · Alene"),
  ],
  createdAt: "2026-10-03T10:00:00Z", updatedAt: "2026-10-03T10:00:00Z", createdBy: "c1",
  ...ekstra,
}) as WorkbenchSession;

const Vis = ({ s }: { s: WorkbenchSession }) => <PlayerHQSkall innboksHref="#" uleste={2}><PH03WbOktark session={s} /></PlayerHQSkall>;

export const tilstander = {
  publisert: <Vis s={okt("PUBLISHED")} />,
  pagar: <Vis s={okt("IN_PROGRESS")} />,
  gjennomfort: <Vis s={okt("COMPLETED", { perceivedEffort: 7, fokusEtterOkt: 8, actualMinutes: 72 })} />,
  ikkeVurdert: <Vis s={okt("COMPLETED", { actualMinutes: 75 })} />,
  fysisk: <Vis s={okt("COMPLETED", { pyramid: "FYS", title: "Styrke bein og kjerne", location: "Styrkerommet", drills: [] })} />,
  tom: <Vis s={okt("PUBLISHED", { drills: [], maalsetning: undefined, rationale: undefined, location: undefined })} />,
};
