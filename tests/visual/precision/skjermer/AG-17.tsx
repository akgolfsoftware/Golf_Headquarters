/**
 * Prøvefil for AG-17 Turneringer i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG17Turneringer, type AG17Data, type AG17Tilstand } from "@/components/admin/precision/AG17Turneringer";

export const sti = "/admin/turnering";

const DATA: AG17Data = {
  tournaments: [
    { id: "t1", name: "Norgescup 1", date: "23.–25. okt", course: "Oslo GK", lat: 59.9, lon: 10.7, paameldte: 3, st: "Påmeldt" },
    { id: "t2", name: "Østlandstour 4", date: "31. okt", course: "Drøbak GK", lat: 59.66, lon: 10.63, paameldte: 2, st: "Påmeldt" },
    { id: "t3", name: "Junior Masters", date: "7.–8. nov", course: "Miklagard", lat: 59.99, lon: 11.04, paameldte: null, st: "Åpen" },
    { id: "t4", name: "Høstcup", date: "10. okt", course: null, lat: null, lon: null, paameldte: 1, st: "Spilt" },
  ],
  tDups: [{ id: "d1", match: "Overlapp: Norgescup 1", a: { src: "Manuell", name: "Norgescup", date: "23.10.2026", course: "Oslo GK" }, b: { src: "GolfBox", name: "Norgescup 1", date: "23.10.2026", course: "Oslo GK" } }],
};

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
          data={DATA}
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
