/**
 * Prøvefil for AG-19 Caddie og Jarvis i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG19CaddieHub,
  type AG19Tilstand,
} from "@/components/admin/precision/AG19CaddieHub";

export const sti = "/admin/caddie";

function Vis({
  tilstand = "data",
  fane = "ko",
}: {
  tilstand?: AG19Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG19CaddieHub tilstand={tilstand} startFane={fane} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="ko" />,
  tom: <Vis tilstand="tom" fane="ko" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  prosjekter: <Vis tilstand="data" fane="prosj" />,
  skills: <Vis tilstand="data" fane="skills" />,
  chat: <Vis tilstand="data" fane="chat" />,
};
