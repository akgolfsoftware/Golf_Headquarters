/** Prøvefil for AG-11-GRUPPE Workbench · gruppe. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG11Gruppe } from "@/components/admin/precision/AG11Gruppe";
import { AG11GruppeAr } from "@/components/admin/precision/AG11Ar";
import type { PeriodeRad } from "@/lib/workbench/arsplan-view";
import { Feil, Laster } from "./AG-11";
import { GRUPPER } from "./_wb-data";

export const sti = "/admin/grupper/g1/workbench";

const PERIODER: PeriodeRad[] = [
  { id: "g1", type: "TURNERING", startDate: "2026-08-03", endDate: "2026-10-04", focus: "Scoring 50–100 m", ukevolumMin: 420, ukevolumMax: 480, budsjett: { SLAG: 4 } },
  { id: "g2", type: "EVALUERING", startDate: "2026-10-05", endDate: "2026-10-18", focus: null, ukevolumMin: null, ukevolumMax: null, budsjett: null },
  { id: "g3", type: "GRUNN", startDate: "2026-11-16", endDate: "2027-01-31", focus: "Styrke og hastighet", ukevolumMin: 300, ukevolumMax: null, budsjett: null },
];
const Vis = ({ tom = false }: { tom?: boolean }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG11Gruppe gruppe={{ id: "g1", navn: "Testgruppe A", medlemmer: tom ? 0 : 8 }} grupper={GRUPPER}
        faste={tom ? [] : [{ id: "1", dag: "Tir", tid: "16:00–17:30", sted: "Testbanen range" }, { id: "2", dag: "Tor", tid: "16:00–17:30", sted: null }]}
        aarsplan={<AG11GruppeAr gruppeId="g1" gruppeNavn="Testgruppe A" medlemmer={tom ? 0 : 8} perioder={tom ? [] : PERIODER} idag="2026-09-29" />} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = { data: <Vis />, tom: <Vis tom />, laster: <Laster />, feil: <Feil /> };
