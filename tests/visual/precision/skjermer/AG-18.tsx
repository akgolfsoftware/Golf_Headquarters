/**
 * Prøvefil for AG-18 TrackMan og video i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG18TrackManVideo,
  type AG18Tilstand,
} from "@/components/admin/precision/AG18TrackManVideo";

export const sti = "/admin/trackman";

function Vis({
  tilstand = "data",
  fane = "okter",
}: {
  tilstand?: AG18Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG18TrackManVideo tilstand={tilstand} startFane={fane} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="okter" />,
  tom: <Vis tilstand="tom" fane="okter" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  video: <Vis tilstand="data" fane="video" />,
  opptak: <Vis tilstand="data" fane="opptak" />,
};
