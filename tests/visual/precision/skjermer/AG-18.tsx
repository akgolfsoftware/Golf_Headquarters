/**
 * Prøvefil for AG-18 TrackMan og video i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG18TrackManVideo,
  type AG18Data,
  type AG18Tilstand,
} from "@/components/admin/precision/AG18TrackManVideo";

export const sti = "/admin/trackman";

const DATA: AG18Data = {
  tmSessions: [
    { id: "m1", date: "20.10", who: "Spiller A", club: "Driver", shots: 42, video: 1, bay: "Mulligan", rows: [["Club Speed", "mph", 104.2], ["Smash Factor", "", 1.47], ["Attack Angle", "°", 1.8], ["Carry", "m", 248.1], ["Spin Rate", "rpm", 2410], ["Launch Angle", "°", null]] },
    { id: "m2", date: "19.10", who: "Spiller B", club: "Jern 7", shots: 36, video: null, bay: null, rows: [["Club Speed", "mph", 86.4], ["Carry", "m", 142.0]] },
  ],
  videos: [{ id: "v1", s: "m1", title: "Driver, bakfra", player: "Spiller A", by: "Coach A", at: "20.10", len: "0:14", note: "Se på rotasjonen" }, { id: "v2", s: "x", title: "Putting", player: "Spiller B", by: null, at: "18.10", len: null }],
};

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
        <AG18TrackManVideo tilstand={tilstand} startFane={fane} data={DATA} />
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
