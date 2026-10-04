/**
 * Prøvefil for AG-21 Oppgaver & rutiner i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG21Oppgaver,
  type AG21Tilstand,
} from "@/components/admin/precision/AG21Oppgaver";

export const sti = "/admin/oppgaver";

function Vis({
  tilstand = "data",
  fane = "mine",
}: {
  tilstand?: AG21Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG21Oppgaver tilstand={tilstand} startFane={fane} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="mine" />,
  tom: <Vis tilstand="tom" fane="mine" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  prosjekter: <Vis tilstand="data" fane="prosj" />,
  rutiner: <Vis tilstand="data" fane="rutiner" />,
  notion: <Vis tilstand="data" fane="notion" />,
};
