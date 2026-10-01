/** Prøvefil for AG-16 Grupper. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG16Grupper, type AG16Tilstand } from "@/components/admin/precision/AG16Grupper";
import type { GrupperData } from "@/components/admin/v2/GrupperV2";

export const sti = "/admin/grupper";

const data: GrupperData = {
  grupper: [
    { id: "g1", navn: "GFGK Junior Mini U10", antallMedlemmer: 8, nesteOkt: "Tor 16:00 · Range", faste: [{ id: "f1", dag: "Tor", tid: "16:00–17:00", tittel: "Fast trening", sted: "Range" }] },
    { id: "g2", navn: "GFGK Junior Basis U13", antallMedlemmer: 6, nesteOkt: "Man 16:30 · Driving Range med et langt navn som må brytes", faste: [] },
    { id: "g3", navn: "GFGK Junior Knøtt U12", antallMedlemmer: 4, nesteOkt: null, faste: [] },
    { id: "g4", navn: "WANG Toppidrett Fredrikstad med et svært langt gruppenavn som må kuttes", antallMedlemmer: 0, nesteOkt: null, faste: [] },
  ],
};

const Vis = (t: AG16Tilstand, d: GrupperData = data) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG16Grupper
        tilstand={t}
        data={d}
        nyGruppeKnapp={<button type="button" className="pa-btn pa-btn--secondary">Ny gruppe</button>}
        gfgkBootstrapKnapp={null}
      />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: Vis("data"),
  tom: Vis("tom", { grupper: [] }),
};
