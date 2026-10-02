/** Prøvefil for AG-11-GRUPPE Workbench · gruppe. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG11Gruppe } from "@/components/admin/precision/AG11Gruppe";
import { GruppeAarsplanKlient } from "@/app/admin/grupper/[id]/workbench/gruppe-aarsplan-klient";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";
import { Feil, Laster } from "./AG-11";
import { GRUPPER } from "./_wb-data";

export const sti = "/admin/grupper/g1/workbench";

const ok = async () => ({ ok: true });
const Vis = ({ tom = false }: { tom?: boolean }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG11Gruppe gruppe={{ id: "g1", navn: "Testgruppe A", medlemmer: tom ? 0 : 8 }} grupper={GRUPPER}
        faste={tom ? [] : [{ id: "1", dag: "Tir", tid: "16:00–17:30", sted: "Testbanen range" }, { id: "2", dag: "Tor", tid: "16:00–17:30", sted: null }]}
        aarsplan={<div style={TL_SCOPE}><GruppeAarsplanKlient gruppeNavn="Testgruppe A" medlemmer={tom ? 0 : 8} seasonBlocks={[]} onLagre={ok} onSlett={ok} onRullUt={ok} /></div>} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = { data: <Vis />, tom: <Vis tom />, laster: <Laster />, feil: <Feil /> };
