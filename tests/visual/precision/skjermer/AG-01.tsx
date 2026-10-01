/** Prøvefil for AG-01 Cockpit. Oppdiktede navn og tall, ingen ekte data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG01Cockpit, type AG01Tilstand } from "@/components/admin/precision/AG01Cockpit";
import type { AG01Data } from "@/lib/agencyos/cockpit-precision";

export const sti = "/admin/agencyos";

const data: AG01Data = {
  kicker: "Tirsdag 29. september · uke 40",
  klokke: "10:24",
  naaMin: 10 * 60 + 24,
  kalender: [
    { id: "k1", start: "07:30", slutt: "09:00", startMin: 450, sluttMin: 540, tittel: "Gruppeøkt", hvem: "Prøvegruppe Nord", sted: "Testbanen GK · Range 1", status: "ferdig", href: "#" },
    { id: "k2", start: "10:00", slutt: "11:00", startMin: 600, sluttMin: 660, tittel: "Privattime", hvem: "Eirik Dalen", sted: "Studio 1 · TrackMan", status: "pagar", href: "#" },
    { id: "k3", start: "11:15", slutt: "12:15", startMin: 675, sluttMin: 735, tittel: "Privattime med et langt tjenestenavn som må brytes pent", hvem: "Mari Solberg-Kristoffersen", sted: "Studio 1 · TrackMan", status: "neste", href: "#" },
    { id: "k4", start: "14:30", slutt: "16:00", startMin: 870, sluttMin: 960, tittel: "Gruppeøkt", hvem: "Prøvegruppe Sør", sted: null, status: "planlagt", href: null },
  ],
  venter: {
    totalt: 7,
    rader: [
      { id: "v1", hvem: "Henrik Vik", tittel: "Økt-forespørsel", detalj: "Ønsker ekstra økt før helga", nar: "07:52", haster: true },
      { id: "v2", hvem: "Nora Aune", tittel: "Juster intensitet", detalj: null, nar: "I går", haster: false },
      { id: "v3", hvem: "Sander Moe", tittel: "TrackMan-baseline fra test", detalj: "Baseline for Club Speed på «full sving» fra test «Høsttest»: 101,2", nar: "2 d", haster: false },
    ],
  },
  oppgaver: [
    { id: "n1", tittel: "Send turneringsplan for oktober til prøvegruppa", ferdig: false, fristIDag: true, tag: "DAG" },
    { id: "n2", tittel: "Oppdater testbatteri høst", ferdig: false, fristIDag: false, tag: "TOR" },
    { id: "n3", tittel: "Klipp video fra privattime", ferdig: true, fristIDag: false, tag: "2 t" },
  ],
  turneringer: [
    { id: "t1", hvem: "Eirik Dalen", navn: "Prøvetour · runde 6", sted: "Testbanen GK", dagerTil: 4 },
    { id: "t2", hvem: "Nora Aune", navn: "Regionfinale junior", sted: null, dagerTil: 1 },
    { id: "t3", hvem: "Sander Moe", navn: "Klubbmesterskap", sted: "Testbanen GK", dagerTil: -1 },
  ],
  utenforPlan: [
    { id: "p1", navn: "Jonas Prøve", forrige: 58, siste: 52, href: "#" },
    { id: "p2", navn: "Live Testesen", forrige: 66, siste: 61, href: "#" },
  ],
  utenforPlanUker: "UKE 38–39",
  nokkeltall: [
    { label: "Aktive spillere", verdi: "31", kilde: "INNLOGGET SISTE 30 DAGER · EGEN STALL" },
    { label: "Økter i dag", verdi: "4", kilde: "1 FERDIG · 1 PÅGÅR · 2 IGJEN" },
    { label: "Strokes Gained, snitt", verdi: "+0,4", kilde: "RUNDER SISTE 30 DAGER · EGEN STALL" },
    { label: "Planøkter gjennomført", verdi: "83 %", kilde: "FULLFØRTE AV PLANLAGTE · ALLE PLANER · 30 DAGER" },
  ],
};

const Vis = (t: AG01Tilstand, erAdmin = true, d: AG01Data = data) => (
  <AdminRolleProvider erAdmin={erAdmin}>
    <AgencyOSSkall navn="Test Coach">
      <AG01Cockpit tilstand={t} data={d} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: Vis("data"),
  coach: Vis("data", false),
  tom: Vis("tom"),
  laster: Vis("laster"),
  feil: Vis("feil"),
};
