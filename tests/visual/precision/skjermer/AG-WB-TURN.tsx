/** Prøvefil for AG-WB-TURN i coachens Workbench. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG11Turnering } from "@/components/admin/precision/AG11Moduler";
import { Feil, Laster } from "./AG-11";
import { FYS, SPILLER, TOM_FYS } from "./_wb-data";

export const sti = "/admin/workbench/p1";

const ok = async () => ({ ok: true });
const actions = { opprettFysiskBlokk: ok, opprettFysiskOkt: ok, flyttFysiskOkt: ok, publiserFysiskBlokk: ok, opprettTurneringsplan: ok, publiserTurneringsplan: ok };

const Vis = ({ tom = false }: { tom?: boolean }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG11Turnering playerId="p1" spillerNavn={SPILLER} data={tom ? TOM_FYS : FYS} actions={actions} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: <Vis />,
  tom: <Vis tom />,
  laster: <Laster />,
  feil: <Feil />,
};
