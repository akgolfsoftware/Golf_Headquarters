/** Faktiske skjermkomponenter, kun syntetiske data. Ingen database eller lagring. */
import { createRoot } from "react-dom/client";
import { WorkbenchShell } from "@/components/workbench/WorkbenchShell";
import { WorkbenchUke } from "@/components/workbench/WorkbenchUke";
import { WorkbenchOkt } from "@/components/workbench/WorkbenchOkt";
import type { WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";

const sessions: WorkbenchSession[] = [
  ["2026-09-14", 420, 75, "Styrke underkropp", "FYS"],
  ["2026-09-14", 960, 60, "Ballflukt · jern", "TEK"],
  ["2026-09-15", 960, 90, "Innspill · 40–60 m", "SLAG"],
  ["2026-09-15", 990, 30, "Gjennomgang", "TEK"],
  ["2026-09-16", 420, 45, "Vedlikehold", "FYS"],
  ["2026-09-17", 960, 60, "Nærspill · fot", "SLAG"],
  ["2026-09-19", 600, 120, "Baneplan · 9 hull", "SPILL"],
].map(([date, startMinute, durationMinutes, title, pyramid], i) => ({
  id: `syntetisk-${i}`, playerId: "syntetisk-spiller", coachId: "syntetisk-coach",
  date: String(date), startMinute: Number(startMinute), durationMinutes: Number(durationMinutes),
  title: String(title), pyramid: pyramid as WorkbenchSession["pyramid"], status: "DRAFT", blockType: "OEKT",
  drills: [], origin: "COACH", createdBy: "COACH", createdAt: "2026-09-14T00:00:00Z", updatedAt: "2026-09-14T00:00:00Z",
}));
const empty = new URLSearchParams(location.search).get("fixture") === "empty";
const week: WeekViewModel = {
  weekStart: "2026-09-14", mode: { kind: "AGENCY", subjectId: "syntetisk-spiller", sources: [] },
  budget: { plannedMinutes: empty ? 0 : 480, targetMinutes: 0, byPyramid: { FYS: 120, TEK: 90, SLAG: 150, SPILL: 120, TURN: 0 } },
  days: Array.from({ length: 7 }, (_, i) => {
    const date = `2026-09-${14 + i}`;
    return { date, weekday: i + 1, sessions: empty ? [] : sessions.filter(s => s.date === date), lockedBlocks: !empty && i === 2 ? [{ id: "syntetisk-skole", startMinute: 480, durationMinutes: 360, title: "Skole", kind: "SKOLE", dimmed: true }] : [] };
  }),
};
const okt = new URLSearchParams(location.search).get("fixture") === "okt";
if (okt) {
  const drill = (id: string, title: string, area: "TEE" | "INNSPILL_100" | "STYRKE", pyramid: "TEK" | "FYS", detaljer: NonNullable<WorkbenchSession["drills"][number]["akFormel"]["detaljer"]>, motorikk?: "LAV_HAST") => ({
    id, title, durationMinutes: 25, order: 0,
    akFormel: { pyramid, area, label: `${pyramid} · ${area}`, ...(motorikk ? { motorikk } : {}), press: "OBSERVERT" as const, belastning: "INNENDORS" as const, detaljer },
  });
  const valgt = week.days[0].sessions[1];
  valgt.drills = [
    drill("d1", "Lengdekontroll 100–150 m", "INNSPILL_100", "TEK", {
      hastighetProsent: 50, tekniskFokus: "LENGDEKONTROLL", sted: { hoved: "INNENDORS_GOLF", delvalg: "Simulator" },
      maaleutstyr: "MED_TRACKMAN", treningsmaate: "BLOKK", mengde: { enhet: "SLAG", antall: 30 }, mal: { resultatkrav: "20 av 30 innenfor målområdet" },
    }, "LAV_HAST"),
    drill("d2", "Putt 3–5 fot, ballstart", "STYRKE", "FYS", { mengde: { enhet: "SERIER", antall: 4, reps: 6 } }),
  ];
  createRoot(document.getElementById("root")!).render(
    <WorkbenchShell coachName="Anders Kristiansen" playerId="syntetisk-spiller">
      <WorkbenchOkt playerId="syntetisk-spiller" spillerNavn="Øyvind Rojahn" uke={week} selectedSessionId={valgt.id} kilder={[]} roster={[{ id: "syntetisk-spiller", navn: "Øyvind Rojahn" }]} />
    </WorkbenchShell>,
  );
} else
createRoot(document.getElementById("root")!).render(
  <WorkbenchShell coachName="Anders Kristiansen" playerId="syntetisk-spiller">
    <WorkbenchUke playerId="syntetisk-spiller" spillerNavn="Øyvind Rojahn" uke={week} kilder={[]} roster={[{ id: "syntetisk-spiller", navn: "Øyvind Rojahn" }]} />
  </WorkbenchShell>,
);
