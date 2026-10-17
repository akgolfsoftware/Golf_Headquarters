/** Prøvefil for AG-11-GRUPPE og AG-11-GRUPPE-AR: Workbench · gruppe med gruppas årsplan i nytt design. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG11GruppeNy } from "@/components/admin/precision/AG11GruppeNy";
import type { PeriodeArkPeriode } from "@/components/admin/precision/AG11PeriodeArk";
import { Feil, Laster } from "./AG-11";
import { GRUPPER } from "./_wb-data";

export const sti = "/admin/grupper/g1/workbench";

const ok = async () => ({ ok: true });
const PERIODER: PeriodeArkPeriode[] = [
  { id: "g1", type: "EVALUERING", startDate: "2026-08-17", endDate: "2026-08-30", focus: null, axisMinutes: { FYS: 60, TEK: 60, SLAG: 60, SPILL: 0, TURN: 0 } },
  { id: "g2", type: "GRUNN", startDate: "2026-08-31", endDate: "2026-11-29", focus: "Grunnteknikk og styrke", axisMinutes: { FYS: 180, TEK: 240, SLAG: 180, SPILL: 60, TURN: 0 } },
  { id: "g3", type: "FERIE", startDate: "2026-12-21", endDate: "2027-01-03", focus: null },
  { id: "g4", type: "SPESIAL", startDate: "2027-01-04", endDate: "2027-03-28", focus: "Innspill og nærspill", axisMinutes: { FYS: 120, TEK: 180, SLAG: 240, SPILL: 120, TURN: 0 } },
  { id: "g5", type: "TURNERING", startDate: "2027-04-19", endDate: "2027-06-20", focus: null, axisMinutes: { FYS: 60, TEK: 90, SLAG: 180, SPILL: 180, TURN: 240 } },
];
const MEDLEMMER = [
  { id: "m1", navn: "Ola Testesen", egen: null },
  { id: "m2", navn: "Kari Prøvesen", egen: null },
  { id: "m3", navn: "Per Eksempelsen med et svært langt etternavn som må brytes", egen: "Egen Spesialperiode fra uke 2" },
  { id: "m4", navn: "Live Testdatter", egen: "Egen Restitusjon fra uke 47" },
];

const Vis = ({ tom = false, kanRulleUt = true }: { tom?: boolean; kanRulleUt?: boolean }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG11GruppeNy gruppe={{ id: "g1", navn: "Testgruppe A", medlemmer: tom ? 0 : 12 }} grupper={GRUPPER} perioder={tom ? [] : PERIODER} medlemmer={tom ? [] : MEDLEMMER} kanRulleUt={kanRulleUt}
        faste={tom ? [] : [{ id: "1", dag: "Tir", tid: "16:00–17:30", sted: "Testbanen range" }, { id: "2", dag: "Tor", tid: "16:00–17:30", sted: null }]}
        onLagre={ok} onSlett={ok} onRullUt={async () => ({ ok: true, spillere: 12, perioderLagt: 48, hoppet: [] })} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = { data: <Vis />, "assistent": <Vis kanRulleUt={false} />, tom: <Vis tom />, laster: <Laster />, feil: <Feil /> };
