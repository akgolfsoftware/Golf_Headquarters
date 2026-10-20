/** Prøvefil for AG-11 Ukeverksted (coachens Workbench, flaten Uke). Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { WorkbenchSamlet } from "@/components/workbench/WorkbenchSamlet";
import { summerTreningsvolum } from "@/lib/workbench/treningsvolum";
import type { WorkbenchSamletData } from "@/lib/workbench/workbench-samlet-typer";
import { FYS, KILDER, MAL, ROSTER, SPILLER, TOM_FYS, uke } from "./_wb-data";

export const sti = "/admin/workbench/p1?flate=uke";

const volum = summerTreningsvolum([], { fraDato: new Date("2026-09-28T00:00:00Z"), tilDato: new Date("2026-10-05T00:00:00Z"), naa: new Date("2026-09-30T12:00:00Z") } as Parameters<typeof summerTreningsvolum>[1]);

const data = (tom = false): WorkbenchSamletData => ({
  player: { id: "p1", navn: SPILLER }, routeSurface: "agency", role: "coach", flate: "uke",
  planKontekst: { visning: "uke", weekStart: "2026-09-28", monthStart: "2026-09-01", year: 2026, isoWeekYear: 2026, weekNumber: 40, harValgtUke: true, referanse: { uke: "2026-09-28" } },
  uke: uke(tom), kilder: tom ? [] : KILDER, goals: tom ? [] : MAL, fys: tom ? TOM_FYS : FYS,
  roster: ROSTER.map((r) => ({ id: r.id, navn: r.navn })), grupper: [], valgtGruppeId: null, volum, volumKilde: "Publiserte økter i uka",
  valgtOkt: null, sesong: null, bord: null, analyse: null, varsler: [],
});

const Vis = ({ tom = false }: { tom?: boolean }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach"><WorkbenchSamlet data={data(tom)} /></AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: <Vis />,
  tom: <Vis tom />,
};
