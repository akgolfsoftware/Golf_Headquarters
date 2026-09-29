/**
 * Prøvefil for AG-11-AR Workbench · årsplan og periode (spiller og gruppe),
 * opprett-veileder og periodeskjema. Bare syntetiske data: ingen ekte spillere.
 */
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import { AG11Ar, AG11GruppeAr, type AG11ArProps, type PeriodeBlokk } from "@/components/admin/precision/AG11Ar";
import { AG11Gruppe } from "@/components/admin/precision/AG11Gruppe";
import type { PeriodViewModel, PyramidArea, WorkbenchMode, YearPeriodBand, YearViewModel } from "@/lib/domain/workbench/types";
import type { PeriodeRad } from "@/lib/workbench/arsplan-view";
import { Natt } from "./_natt";
import { GRUPPER, ROSTER, SPILLER, OKTER } from "./_wb-data";

export const sti = "/admin/workbench/p1?vis=aar";

const MODE: WorkbenchMode = { kind: "AGENCY", subjectId: "p1", sources: [] };
const Z: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
const AKSER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const rad = (id: string, type: YearPeriodBand["type"], start: string, slutt: string, focus: string | null, aktiv = false): YearPeriodBand => ({
  id, type, startDate: start, endDate: slutt, focus, widthPct: 5, aktiv, balanseTimer: Z, plannedMinutes: 0, plannedToDateMinutes: 0, completedMinutes: 0, turneringer: [],
});
const PERIODER: YearPeriodBand[] = [
  rad("a", "GRUNN", "2026-01-05", "2026-03-29", "Styrke og hastighet"),
  rad("b", "SPESIAL", "2026-03-30", "2026-05-03", "Innspill og nærspill under press"),
  rad("c", "TURNERING", "2026-05-04", "2026-09-27", "Scoring 50–100 m, rutine før hvert slag som er en lang tekst som må brytes over flere linjer"),
  rad("d", "TESTUKE", "2026-06-15", "2026-06-21", null),
  rad("e", "EVALUERING", "2026-09-28", "2026-10-11", "Sesongevaluering", true),
  rad("f", "TRENINGSSAMLING", "2026-10-06", "2026-10-10", "Treningssamling"),
  rad("g", "RESTITUSJON", "2026-10-12", "2026-11-08", null),
  rad("h", "FERIE", "2026-12-21", "2026-12-31", "Juleferie"),
];
const BLOKKER: Record<string, PeriodeBlokk> = {
  a: { ukevolumMin: 360, ukevolumMax: 420, budsjett: { FYS: 3, TEK: 2 }, fraGruppe: true },
  c: { ukevolumMin: 480, ukevolumMax: null, budsjett: { SLAG: 4, SPILL: 1 }, fraGruppe: false },
};
const aar = (tom = false): YearViewModel => ({
  year: 2026, months: [], periods: tom ? [] : PERIODER,
  budget: { plannedMinutes: 0, targetMinutes: 0, byPyramid: { FYS: 3000, TEK: 2400, SLAG: 6000, SPILL: 1200, TURN: 0 } },
  plannedToDateMinutes: tom ? 0 : 9600, completedMinutes: tom ? 0 : 8100,
  completedByPyramid: { FYS: 2700, TEK: 2000, SLAG: 2700, SPILL: 700, TURN: 0 }, mode: MODE,
});
const periode = (id = "c"): PeriodViewModel => {
  const p = PERIODER.find((x) => x.id === id) ?? PERIODER[0];
  return {
    year: 2026, period: p, periods: PERIODER, sessions: OKTER, plannedMinutes: 1800, plannedToDateMinutes: 1500, completedMinutes: 1200, mode: MODE,
    weeks: [
      { weekStart: "2026-09-14", weekNumber: 38, minutes: 420, completedMinutes: 420, sessionCount: 4, dominantPyramid: "SLAG" },
      { weekStart: "2026-09-21", weekNumber: 39, minutes: 480, completedMinutes: 300, sessionCount: 5, dominantPyramid: "TEK" },
      { weekStart: "2026-09-28", weekNumber: 40, minutes: 0, completedMinutes: 0, sessionCount: 0, dominantPyramid: null },
    ],
    distribution: AKSER.map((a, i) => ({ pyramid: a, plannedMinutes: [200, 300, 800, 400, 100][i], completedMinutes: [200, 250, 500, 250, 0][i], sharePct: 20, focus: null })),
  };
};

const basis = (tom: boolean): Omit<AG11ArProps, "niva" | "periode"> => ({
  playerId: "p1", spillerNavn: SPILLER, roster: ROSTER, grupper: GRUPPER, aar: aar(tom),
  plan: tom ? null : { navn: "Sesong 2026", notater: "Fra kategori D mot C." }, blokker: tom ? {} : BLOKKER, fjorAntall: tom ? 0 : 6, idag: "2026-09-29",
});
const Rolle = ({ children, natt = false }: { children: React.ReactNode; natt?: boolean }) => {
  const skall = <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach">{children}</AgencyOSSkall></AdminRolleProvider>;
  return natt ? <Natt>{skall}</Natt> : skall;
};
const Ar = ({ tom = false, startApen, natt = false }: { tom?: boolean; startApen?: AG11ArProps["startApen"]; natt?: boolean }) => <Rolle natt={natt}><AG11Ar {...basis(tom)} niva="ar" periode={null} startApen={startApen} /></Rolle>;
const Per = ({ startApen, tom = false, natt = false }: { startApen?: AG11ArProps["startApen"]; tom?: boolean; natt?: boolean }) => (
  <Rolle natt={natt}><AG11Ar {...basis(tom)} niva="periode" periode={tom ? { ...periode(), period: null, periods: [], sessions: [], weeks: [] } : periode()} startApen={startApen} /></Rolle>
);

const GP: PeriodeRad[] = [
  { id: "g1", type: "TURNERING", startDate: "2026-08-03", endDate: "2026-10-04", focus: "Scoring 50–100 m", ukevolumMin: 420, ukevolumMax: 480, budsjett: { SLAG: 4 } },
  { id: "g2", type: "EVALUERING", startDate: "2026-10-05", endDate: "2026-10-18", focus: null, ukevolumMin: null, ukevolumMax: null, budsjett: null },
  { id: "g3", type: "TRENINGSSAMLING", startDate: "2026-10-06", endDate: "2026-10-10", focus: "Sør-Spania", ukevolumMin: null, ukevolumMax: null, budsjett: null },
  { id: "g4", type: "GRUNN", startDate: "2026-11-16", endDate: "2027-01-31", focus: "Styrke og hastighet", ukevolumMin: 300, ukevolumMax: null, budsjett: null },
  { id: "g5", type: "TURNERING", startDate: "2027-04-05", endDate: "2027-06-27", focus: null, ukevolumMin: null, ukevolumMax: null, budsjett: null },
];
const Gruppe = ({ tom = false, natt = false }: { tom?: boolean; natt?: boolean }) => (
  <Rolle natt={natt}>
    <AG11Gruppe gruppe={{ id: "g1", navn: "Testgruppe A", medlemmer: tom ? 0 : 8 }} grupper={GRUPPER} faste={[]}
      aarsplan={<AG11GruppeAr gruppeId="g1" gruppeNavn="Testgruppe A" medlemmer={tom ? 0 : 8} perioder={tom ? [] : GP} idag="2026-09-29" />} />
  </Rolle>
);

const Laster = () => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="pa-side"><LasterTilstand text="Henter planen …" /></div></AgencyOSSkall></AdminRolleProvider>;
const Feil = () => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="pa-side">
    <FeilTilstand icon={CalendarX} title="Workbench kunne ikke lastes" text="Ingen perioder er endret. Prøv igjen, eller gå tilbake til stallen." code="FEIL 503 · WORKBENCH"
      retry={<Knapp variant="secondary">Prøv igjen</Knapp>} />
  </div></AgencyOSSkall></AdminRolleProvider>
);

export const tilstander = {
  data: <Ar />,
  tom: <Ar tom />,
  laster: <Laster />,
  feil: <Feil />,
  periode: <Per />,
  "periode-tom": <Per tom />,
  veileder: <Ar tom startApen="veileder" />,
  periodeskjema: <Per startApen="skjema" />,
  "ny-periode": <Ar startApen="ny-periode" />,
  gruppe: <Gruppe />,
  "gruppe-tom": <Gruppe tom />,
  "natt-data": <Ar natt />,
  "natt-periode": <Per natt />,
  "natt-veileder": <Ar tom startApen="veileder" natt />,
  "natt-periodeskjema": <Per startApen="skjema" natt />,
  "natt-gruppe": <Gruppe natt />,
};
export const natt = ["natt-data", "natt-periode", "natt-veileder", "natt-periodeskjema", "natt-gruppe"];
