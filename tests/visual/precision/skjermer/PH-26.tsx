/** Prøvefil for PH-26 Utenfor banen. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH26UtenforBanen } from "@/components/portal/precision/PH26UtenforBanen";
import { Natt } from "./_natt";

export const sti = "/portal/utenfor-banen";

const demoDagensFys = {
  tittel: "Eksplosiv styrke & rotasjon",
  tid: "KL 17:00",
  varighetMin: 60,
  sted: "Mulligan Fysisk Avdeling",
  ovelser: [
    { navn: "Trap-bar markløft", mengde: "4 × 5 @ 120 kg", rir: "RIR 2" },
    { navn: "Medisinball rotasjonskast", mengde: "3 × 6 per side @ 5 kg", rir: "Maksimal innsats" },
    { navn: "Bulgarsk utfall", mengde: "3 × 8 per bein @ 24 kg", rir: "RIR 1" },
  ],
};

const demoVenner = [
  { id: "v1", name: "Sander H" },
  { id: "v2", name: "Markus B" },
  { id: "v3", name: "Henrik N" },
];

const demoUtfordringer = [
  {
    id: "u1",
    title: "Putting: 10 putter fra 2 meter",
    status: "Aktiv" as const,
    win: "hi" as const,
    unit: "treff",
    ends: "12. oktober",
    by: "Anders Kristiansen",
    rows: [
      ["Anders Kristiansen", 8] as [string, number | null],
      ["Øyvind Rohjan", 7] as [string, number | null],
      ["Sander H", 5] as [string, number | null],
    ],
  },
  {
    id: "u2",
    title: "Nærspill: 15-meters opp og ned",
    status: "Aktiv" as const,
    win: "lo" as const,
    unit: "slag",
    ends: "18. oktober",
    by: "Øyvind Rohjan",
    rows: [
      ["Øyvind Rohjan", 18] as [string, number | null],
      ["Markus B", 21] as [string, number | null],
    ],
  },
];

const Vis = ({ nattModus = false, fane = "fys" }: { nattModus?: boolean; fane?: "fys" | "utf" | "putt" | "turn" | "digest" }) => {
  const comp = (
    <PlayerHQSkall innboksHref="#" uleste={0}>
      <PH26UtenforBanen
        spillerNavn="Øyvind Rohjan"
        dagensFysOkt={demoDagensFys}
        venner={demoVenner}
        utfordringer={demoUtfordringer}
        initialFane={fane}
      />
    </PlayerHQSkall>
  );
  return nattModus ? <Natt>{comp}</Natt> : comp;
};

export const tilstander = {
  fys: <Vis fane="fys" />,
  utfordringer: <Vis fane="utf" />,
  puttelab: <Vis fane="putt" />,
  turneringer: <Vis fane="turn" />,
  digest: <Vis fane="digest" />,
  nattFys: <Vis fane="fys" nattModus />,
  nattPutt: <Vis fane="putt" nattModus />,
};

export const natt = ["nattFys", "nattPutt"];
