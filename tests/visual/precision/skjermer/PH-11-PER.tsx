/** Prøvefil for PH-11-PER Periode og PH-11-PERSKJEMA i nytt design (pakke 3). Syntetiske data: i dag mandag 5. oktober 2026 (uke 41). */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH11Periode, PH11PeriodeSkjema } from "@/components/portal/precision/PH11Periode";
import type { PeriodViewModel, PyramidArea, YearPeriodBand } from "@/lib/domain/workbench/types";

export const sti = "/portal/planlegge/workbench?niva=periode";

const IDAG = "2026-10-05";
const tom = (): Record<PyramidArea, number> => ({ FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
const leggTil = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

function periode(id: string, type: YearPeriodBand["type"], startDate: string, endDate: string, extra: Partial<YearPeriodBand> = {}): YearPeriodBand {
  return {
    id, type, startDate, endDate, focus: null, widthPct: 10, aktiv: startDate <= IDAG && IDAG <= endDate,
    balanseTimer: tom(), plannedMinutes: 0, plannedToDateMinutes: 0, completedMinutes: 0, turneringer: [], ...extra,
  };
}

const GRUNN = periode("p5", "GRUNN", "2026-09-14", "2026-11-29", {
  focus: "Lengdekontroll 100–150 m med TrackMan",
  axisMinutes: { FYS: 150, TEK: 300, SLAG: 270, SPILL: 90, TURN: 0 },
  axisMinutesLight: { FYS: 90, TEK: 150, SLAG: 120, SPILL: 60, TURN: 0 },
  notat: "Skoleuke med tentamen 20.–22. okt. Tar lett uke da, og flytter innspill til helga.",
  turneringer: [{ navn: "Klubbmesterskap innendørs", dato: "2026-11-17" }],
});
const PERIODER = [
  periode("p4", "EVALUERING", "2026-08-31", "2026-09-13"),
  GRUNN,
  periode("t1", "TESTUKE", "2026-10-19", "2026-10-25"),
  periode("p6", "FERIE", "2026-12-21", "2027-01-03", { fraGruppe: true }),
];

function modell(valgt: YearPeriodBand | null, fyll = true): PeriodViewModel {
  if (!valgt) return { year: 2026, period: null, periods: [], sessions: [], weeks: [], distribution: [], plannedMinutes: 0, plannedToDateMinutes: 0, completedMinutes: 0, mode: { kind: "PLAYER", subjectId: "p", sources: [] } };
  const weeks: PeriodViewModel["weeks"] = [];
  for (let c = valgt.startDate, i = 0; c <= valgt.endDate; c = leggTil(c, 7), i++) {
    const by = tom();
    if (fyll) { by.FYS = 150; by.TEK = i === 5 ? 150 : 300; by.SLAG = 270; by.SPILL = 90; }
    const minutes = Object.values(by).reduce((a, b) => a + b, 0);
    weeks.push({ weekStart: c, weekNumber: 38 + i, minutes, completedMinutes: c < "2026-09-28" ? Math.round(minutes * 0.82) : 0, sessionCount: fyll ? 9 : 0, dominantPyramid: "TEK", byPyramid: by });
  }
  const planned = weeks.reduce((s, w) => s + w.minutes, 0);
  const toDate = weeks.filter((w) => w.weekStart < "2026-09-28").reduce((s, w) => s + w.minutes, 0);
  return {
    year: 2026, period: valgt, periods: PERIODER, sessions: [], weeks, distribution: [],
    plannedMinutes: planned, plannedToDateMinutes: toDate, completedMinutes: weeks.reduce((s, w) => s + w.completedMinutes, 0),
    mode: { kind: "PLAYER", subjectId: "p", sources: [] },
  };
}

const vis = (m: PeriodViewModel) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>
    <PH11Periode playerId="p" periode={m} referanse={{}} idag={IDAG} />
  </PlayerHQSkall>
);

export const tilstander = {
  na: vis(modell(GRUNN)),
  ferdig: vis(modell(PERIODER[0])),
  kommende: vis(modell(PERIODER[3], false)),
  tom: vis(modell(null)),
  skjema: <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}><div className="phn"><PH11PeriodeSkjema playerId="p" year={2026} periode={GRUNN} onLukk={() => {}} onLagret={() => {}} /></div></PlayerHQSkall>,
};
