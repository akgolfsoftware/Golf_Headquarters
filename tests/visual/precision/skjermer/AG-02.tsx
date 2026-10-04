/**
 * Prøvefil for AG-02 Kø i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG02Ko, type AG02Tilstand } from "@/components/admin/precision/AG02Ko";

export const sti = "/admin/ko";

function Vis({
  tilstand = "data",
  fane = "godkjenninger",
}: {
  tilstand?: AG02Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG02Ko
          tilstand={tilstand}
          startFane={fane}
          dagLabel="tirsdag 29. september"
        />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="godkjenninger" />,
  tom: <Vis tilstand="tom" fane="godkjenninger" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  agent: <Vis tilstand="data" fane="agent" />,
  test: <Vis tilstand="data" fane="test" />,
  dublett: <Vis tilstand="data" fane="dublett" />,
  moderering: <Vis tilstand="data" fane="moderering" />,
  epost: <Vis tilstand="data" fane="epost" />,
};
