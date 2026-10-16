/**
 * Prøvefil for AG-17 Turneringer i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG17Turneringer, type AG17Tilstand } from "@/components/admin/precision/AG17Turneringer";

export const sti = "/admin/turnering";

function Vis({
  tilstand = "data",
  fane = "alle",
}: {
  tilstand?: AG17Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG17Turneringer
          tilstand={tilstand}
          startFane={fane}
        />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="alle" />,
  tom: <Vis tilstand="tom" fane="alle" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  mine: <Vis tilstand="data" fane="mine" />,
  kart: <Vis tilstand="data" fane="kart" />,
  dublett: <Vis tilstand="data" fane="dup" />,
  ny: <Vis tilstand="data" fane="ny" />,
};
