/**
 * Prøvefil for AG-24 Drift i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG24Drift,
  type AG24Tilstand,
} from "@/components/admin/precision/AG24Drift";

export const sti = "/admin/drift";

function Vis({
  tilstand = "data",
  fane = "gdpr",
}: {
  tilstand?: AG24Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG24Drift tilstand={tilstand} startFane={fane} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="gdpr" />,
  tom: <Vis tilstand="tom" fane="gdpr" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  audit: <Vis tilstand="data" fane="audit" />,
  feillogg: <Vis tilstand="data" fane="feil" />,
  hjelp: <Vis tilstand="data" fane="hjelp" />,
};
