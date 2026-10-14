/** Prøvefil for PH-11-AR Årsplan i nytt design (pakke 3). Syntetiske data: Øyvind Rohjan, 2026, i dag mandag 5. oktober (uke 41). */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH11Aarsplan } from "@/components/portal/precision/PH11Aarsplan";
import type { PyramidArea, YearPeriodBand, YearViewModel, YearWeekRow } from "@/lib/domain/workbench/types";

export const sti = "/portal/planlegge/workbench?niva=ar";

const IDAG = "2026-10-05";
const AKSER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const tom = (): Record<PyramidArea, number> => ({ FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
const leggTil = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

function uker(fyll: boolean): YearWeekRow[] {
  const ut: YearWeekRow[] = [];
  for (let i = 0; i < 53; i++) {
    const weekStart = leggTil("2025-12-29", i * 7);
    const p = tom();
    if (fyll && i % 13 !== 12) {
      const sommer = i >= 18 && i <= 37;
      p.FYS = 150; p.TEK = sommer ? 180 : 300; p.SLAG = sommer ? 240 : 270; p.SPILL = sommer ? 240 : 90; p.TURN = sommer && i % 2 ? 300 : 0;
    }
    const sum = AKSER.reduce((s, a) => s + p[a], 0);
    ut.push({ weekStart, weekNumber: i + 1, plannedByPyramid: p, completedMinutes: weekStart < "2026-09-28" ? Math.round(sum * (0.75 + (i % 4) * 0.06)) : 0 });
  }
  return ut;
}

function periode(id: string, type: YearPeriodBand["type"], startDate: string, endDate: string, extra: Partial<YearPeriodBand> = {}): YearPeriodBand {
  return {
    id, type, startDate, endDate, focus: null, widthPct: 10, aktiv: startDate <= IDAG && IDAG <= endDate,
    balanseTimer: tom(), plannedMinutes: 0, plannedToDateMinutes: 0, completedMinutes: 0, turneringer: [], ...extra,
  };
}

const PERIODER: YearPeriodBand[] = [
  periode("p1", "GRUNN", "2026-01-05", "2026-03-29", { fraGruppe: true }),
  periode("p2", "SPESIAL", "2026-03-30", "2026-05-03", { fraGruppe: true }),
  periode("p3", "TURNERING", "2026-05-04", "2026-08-30", { turneringer: [{ navn: "Srixon Tour 3 Kristiansand", dato: "2026-06-13" }, { navn: "NM junior Miklagard", dato: "2026-08-06" }] }),
  periode("p4", "EVALUERING", "2026-08-31", "2026-09-13"),
  periode("p5", "GRUNN", "2026-09-14", "2026-11-29", { focus: "Innspill 100–150 m", turneringer: [{ navn: "Klubbmesterskap innendørs", dato: "2026-11-17" }] }),
  periode("p6", "FERIE", "2026-12-21", "2027-01-03"),
  periode("s1", "TRENINGSSAMLING", "2026-10-10", "2026-10-11", { focus: "Larvik GK" }),
  periode("t1", "TESTUKE", "2026-10-19", "2026-10-25"),
  periode("t2", "TESTUKE", "2026-02-09", "2026-02-15"),
];

function aar(fyll: boolean, perioder: YearPeriodBand[]): YearViewModel {
  const w = uker(fyll);
  const planlagt = w.filter((u) => u.weekStart < "2026-09-28").reduce((s, u) => s + AKSER.reduce((t, a) => t + u.plannedByPyramid[a], 0), 0);
  return {
    year: 2026, months: [], periods: perioder, weeks: w,
    budget: { byPyramid: tom(), plannedMinutes: 0, targetMinutes: 0 },
    plannedToDateMinutes: planlagt, completedMinutes: w.reduce((s, u) => s + u.completedMinutes, 0), completedByPyramid: tom(),
    mode: { kind: "PLAYER", subjectId: "p", sources: [] },
  };
}

const vis = (data: YearViewModel) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>
    <PH11Aarsplan playerId="p" aar={data} referanse={{}} idag={IDAG} />
  </PlayerHQSkall>
);

export const tilstander = {
  aar: vis(aar(true, PERIODER)),
  tom: vis(aar(false, [])),
};
