/** Prøvefil for AG-11-MND Workbench · måned. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG11Maned } from "@/components/admin/precision/AG11Maned";
import type { MonthDayCell, MonthViewModel, PyramidArea } from "@/lib/domain/workbench/types";
import { Feil, Laster } from "./AG-11";
import { Natt } from "./_natt";
import { KILDER, MAL, ROSTER, SPILLER } from "./_wb-data";

export const sti = "/admin/workbench/p1?vis=maned&maned=2026-10";

type Linje = [tittel: string, akse: PyramidArea, min: number, hairline?: boolean];
const PLAN: Record<string, Linje[]> = {
  "2026-10-01": [["Styrke underkropp", "FYS", 60]],
  "2026-10-02": [["Innspill 50–100 m", "SLAG", 90], ["Ballstart jern", "TEK", 60]],
  "2026-10-05": [["Tempo og rytme", "TEK", 60]],
  "2026-10-07": [["Baneplan 9 hull med en lang tittel som må brytes", "SPILL", 120]],
  "2026-10-08": [["Styrke overkropp", "FYS", 60], ["Putting 3–5 fot", "SLAG", 45], ["Wedge-test", "SLAG", 60, true], ["Mobilitet", "FYS", 30]],
  "2026-10-10": [["Klubbturnering", "TURN", 240, true]],
  "2026-10-14": [["Innspill 100 m", "SLAG", 60]],
  "2026-10-20": [["Ballstart driver", "TEK", 60]],
  "2026-10-27": [["Baneplan 18 hull", "SPILL", 180]],
};

function lag(tom: boolean): MonthViewModel {
  const mandag0 = "2026-09-28";
  const weeks = Array.from({ length: 5 }, (_, w) => {
    const start = new Date(`${mandag0}T12:00:00Z`); start.setUTCDate(start.getUTCDate() + w * 7);
    const days: MonthDayCell[] = Array.from({ length: 7 }, (_, d) => {
      const dt = new Date(start); dt.setUTCDate(dt.getUTCDate() + d);
      const iso = dt.toISOString().slice(0, 10);
      const alle = tom ? [] : PLAN[iso] ?? [];
      return { date: iso, dayOfMonth: dt.getUTCDate(), inMonth: iso.startsWith("2026-10"), restCount: Math.max(0, alle.length - 3),
        lines: alle.slice(0, 3).map(([title, pyramid, durationMinutes, hairline]) => ({ title, pyramid, durationMinutes, hairline: !!hairline })) };
    });
    return { weekStart: start.toISOString().slice(0, 10), weekNumber: 40 + w, days };
  });
  const min = (a: PyramidArea) => Object.entries(PLAN).flatMap(([, l]) => l).filter((l) => l[1] === a).reduce((s, l) => s + l[2], 0);
  const per = (a: PyramidArea) => (tom ? 0 : min(a));
  const gjort = { FYS: 60, TEK: 120, SLAG: 135, SPILL: 0, TURN: 0 };
  return {
    monthStart: "2026-10-01", label: "Oktober 2026", weeks, empty: tom, mode: { kind: "AGENCY", subjectId: "p1", sources: [] },
    budget: { plannedMinutes: (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as PyramidArea[]).reduce((s, a) => s + per(a), 0), targetMinutes: 0,
      byPyramid: { FYS: per("FYS"), TEK: per("TEK"), SLAG: per("SLAG"), SPILL: per("SPILL"), TURN: per("TURN") } },
    sessionCount: tom ? 0 : Object.values(PLAN).flat().length,
    weekSummaries: weeks.map((w, i) => {
      const byPyramid = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 } as Record<PyramidArea, number>;
      if (!tom) for (const d of w.days) if (d.inMonth) for (const l of PLAN[d.date] ?? []) byPyramid[l[1]] += l[2];
      const minutes = Object.values(byPyramid).reduce((a, b) => a + b, 0);
      return { weekStart: w.weekStart, weekNumber: w.weekNumber, sessionCount: tom ? 0 : (w.days.filter((d) => d.inMonth).reduce((a, d) => a + (PLAN[d.date]?.length ?? 0), 0)), minutes, byPyramid };
    }),
    plannedToDateMinutes: tom ? 0 : 420, completedMinutes: tom ? 0 : 315,
    completedByPyramid: tom ? { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 } : gjort,
  };
}

const Vis = ({ tom = false }: { tom?: boolean }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG11Maned playerId="p1" spillerNavn={SPILLER} maned={lag(tom)} roster={ROSTER} kilder={tom ? [] : KILDER} goals={tom ? [] : MAL}
        periode={tom ? null : { type: "Turneringsperiode", fokus: "Putting 3–5 fot og korte innspill", start: "2026-10-06", slutt: "2026-12-20", budsjett: { FYS: 2, TEK: 2, SLAG: 3, SPILL: 1 } }} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: <Vis />,
  tom: <Vis tom />,
  laster: <Laster />,
  feil: <Feil />,
  "natt-data": <Natt><Vis /></Natt>,
  "natt-tom": <Natt><Vis tom /></Natt>,
};
export const natt: string[] = ["natt-data", "natt-tom"];
