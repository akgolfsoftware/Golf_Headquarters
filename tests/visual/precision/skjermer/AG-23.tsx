/**
 * Prøvefil for AG-23 Oppsett i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG23Oppsett,
  type AG23Tilstand,
} from "@/components/admin/precision/AG23Oppsett";

export const sti = "/admin/oppsett";

function Vis({
  tilstand = "data",
  fane = "team",
}: {
  tilstand?: AG23Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG23Oppsett tilstand={tilstand} startFane={fane} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="team" />,
  tom: <Vis tilstand="tom" fane="team" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  profil: <Vis tilstand="data" fane="profil" />,
  inviter: <Vis tilstand="data" fane="inviter" />,
  ekstern: <Vis tilstand="data" fane="ekstern" />,
  varsler: <Vis tilstand="data" fane="varsler" />,
  integrasjoner: <Vis tilstand="data" fane="integr" />,
  markedsforing: <Vis tilstand="data" fane="mark" />,
  virksomhet: <Vis tilstand="data" fane="virks" />,
};
