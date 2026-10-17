/** Prøvefil for AG-WB-FYS i coachens Workbench, nytt design. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG11FysiskNy } from "@/components/admin/precision/AG11ModulerNy";
import { Feil, Laster } from "./AG-11";
import { FYS, SPILLER, TOM_FYS } from "./_wb-data";

export const sti = "/admin/workbench/p1";

const ok = async () => ({ ok: true });
const actions = { opprettFysiskBlokk: ok, opprettFysiskOkt: ok, flyttFysiskOkt: ok, publiserFysiskBlokk: ok, opprettTurneringsplan: ok, publiserTurneringsplan: ok };

const Vis = ({ tom = false }: { tom?: boolean }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG11FysiskNy playerId="p1" spillerNavn={SPILLER} data={tom ? TOM_FYS : FYS} actions={actions} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: <Vis />,
  tom: <Vis tom />,
  laster: <Laster />,
  feil: <Feil />,
};
