/**
 * Prøvefil for AG-22 Innsikt og talent i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG22InnsiktTalent,
  type AG22Tilstand,
} from "@/components/admin/precision/AG22InnsiktTalent";

export const sti = "/admin/innsikt";

function Vis({
  tilstand = "data",
  fane = "radar",
}: {
  tilstand?: AG22Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG22InnsiktTalent tilstand={tilstand} startFane={fane} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="radar" />,
  tom: <Vis tilstand="tom" fane="radar" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  discovery: <Vis tilstand="data" fane="disc" />,
  wagr: <Vis tilstand="data" fane="wagr" />,
};
