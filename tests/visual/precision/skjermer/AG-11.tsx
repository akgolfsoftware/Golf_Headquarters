/** Prøvefil for AG-11 Workbench (coach) i nytt design, nivå Uke. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Feil as FeilNy, Laster as LasterNy } from "@/components/admin/agencyos-ny/ny";
import { AG11WorkbenchNy } from "@/components/admin/precision/AG11WorkbenchNy";
import type { YearPeriodBand } from "@/lib/domain/workbench/types";
import { FYS, GRUPPER, KILDER, MAL, ROSTER, SPILLER, TOM_FYS, uke } from "./_wb-data";

export const sti = "/admin/workbench/p1";

const tomAkser = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
export const PERIODER: YearPeriodBand[] = [
  { id: "p1", type: "GRUNN", startDate: "2026-09-14", endDate: "2026-11-29", focus: "Lengdekontroll 100–150 m", widthPct: 20, aktiv: true, balanseTimer: tomAkser, plannedMinutes: 0, plannedToDateMinutes: 0, completedMinutes: 0, turneringer: [], axisMinutes: { FYS: 120, TEK: 180, SLAG: 150, SPILL: 120, TURN: 0 } },
  { id: "p2", type: "TESTUKE", startDate: "2026-10-19", endDate: "2026-10-25", focus: null, widthPct: 2, aktiv: false, balanseTimer: tomAkser, plannedMinutes: 0, plannedToDateMinutes: 0, completedMinutes: 0, turneringer: [] },
  { id: "p3", type: "FERIE", startDate: "2026-12-21", endDate: "2027-01-03", focus: null, widthPct: 4, aktiv: false, balanseTimer: tomAkser, plannedMinutes: 0, plannedToDateMinutes: 0, completedMinutes: 0, turneringer: [], fraGruppe: true },
];
const NOTATER = [{ id: "n1", content: "Turnering lørdag. Hold torsdag lett, ingen FYS etter onsdag.", createdAt: "2026-09-27T18:00:00Z" }];

/** `niva`, `side` og `valgtOktId` beholdes for prøvene AG-11-OKT, -MAL og -FYS, som viser nivåene i gammel inndeling. */
export const Vis = ({ tom = false, startNiva, niva }: { tom?: boolean; startNiva?: "uke" | "periode" | "mal"; niva?: string; side?: string; valgtOktId?: string }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG11WorkbenchNy playerId="p1" spillerNavn={SPILLER} uke={uke(tom)} kilder={tom ? [] : KILDER} roster={ROSTER} grupper={GRUPPER}
        goals={tom ? [] : MAL} fys={tom ? TOM_FYS : FYS} perioder={tom ? [] : PERIODER} notater={tom ? [] : NOTATER} startNiva={startNiva ?? (niva === "mal" ? "mal" : "uke")} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const Laster = () => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="agn-s"><LasterNy tekst="Henter planen …" hoyder={[120, 72, 320]} /></div></AgencyOSSkall></AdminRolleProvider>
);

export const Feil = () => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="agn-s">
    <FeilNy tittel="Workbench kunne ikke lastes" tekst="Ingen økter er endret. Prøv igjen, eller gå tilbake til stallen." kode="FEIL 503 · WORKBENCH" onProv={() => {}} />
  </div></AgencyOSSkall></AdminRolleProvider>
);

export const tilstander = {
  data: <Vis />,
  perioder: <Vis startNiva="periode" />,
  malsetninger: <Vis startNiva="mal" />,
  tom: <Vis tom />,
  laster: <Laster />,
  feil: <Feil />,
};
