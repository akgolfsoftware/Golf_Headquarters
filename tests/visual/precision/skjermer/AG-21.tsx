/**
 * Prøvefil for AG-21 Oppgaver & rutiner i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG21Oppgaver,
  type AG21Data,
  type AG21Tilstand,
} from "@/components/admin/precision/AG21Oppgaver";

export const sti = "/admin/oppgaver";

const DATA: AG21Data = {
  mine: [
    { id: "o1", t: "Godkjenne timeplan for samling", due: "21.10", p: "WANG Toppidrett", by: "Notion", done: false },
    { id: "o2", t: "Sende tilbud til klubb", due: "23.10", p: "AK Golf Academy", by: "Notion", done: false },
    { id: "o3", t: "Bestille baller", due: "30.10", p: "Mulligan", by: "Notion", done: true },
  ],
  projects: [["Sesongplan 2027", 12, 5, "15.12"], ["Booking komplett", 10, 8, "31.10"]],
  routines: [["Mandag", "Gå gjennom ukas økter", "Coach", true], ["Onsdag", "Sportssjefsmøte", "Coach", false]],
  notion: { page: "Tasks og Prosjekter", synced: "20.10 10:40" },
};

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
        <AG21Oppgaver tilstand={tilstand} startFane={fane} data={DATA} />
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
