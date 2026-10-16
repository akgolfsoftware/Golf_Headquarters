/**
 * Prøvefil for AG-02 Kø i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 * Demodataene bor HER — produksjonsruten /admin/ko viser aldri demospillere.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG02Ko, type AG02Data, type AG02Tilstand } from "@/components/admin/precision/AG02Ko";

export const sti = "/admin/ko";

const DEMO_DATA: AG02Data = {
  godkjenninger: [
    {
      id: "g1",
      who: "Magnus Aasheim",
      grp: "WANG Toppidrett",
      title: "PlanAction · hviledag torsdag",
      kind: "PlanAction",
      from: "Belastningsagent",
      at: "I dag 08:30",
      status: "Venter",
      axis: "fys",
      due: "14:00",
      sum: "ACWR 1,62 → 1,31 etter endring",
      lines: [
        ["To 01.10", "SLAG · Innspill 150–200 m → hvile", "−90 min"],
        ["Ma 05.10", "SLAG · Innspill 150–200 m", "90 min"],
      ],
      kilde: "agent",
    },
    {
      id: "g3",
      who: "Thea Nilsen",
      grp: "Talent U16",
      title: "Bytte FYS-økt med 9 hull",
      kind: "Økt",
      from: "Spiller",
      at: "I går 19:15",
      status: "Venter",
      axis: "spill",
      due: "I dag",
      sum: "«Vil teste gameplanen før klubbmesterskapet.»",
      kilde: "forespørsel",
    },
  ],
  agentko: [
    {
      id: "a1",
      who: "Ingrid Berg",
      title: "Juster innspillstrening etter turnering",
      agent: "Caddie AI",
      t: "08:14",
      body: "Ingrid bommet 9 av 14 greentreff fra 50–100 m i helgens runde. Foreslår 2 ekstra wedge-økter denne uken.",
      facts: [
        ["Anbefaling", "2 × 45 min wedge", "SLAG"],
        ["Bakgrunn", "Strokes Gained APP −0,9", "3 RUNDER"],
      ],
      out: "Forslag til ukeplan uke 40",
      axis: "slag",
    },
  ],
  tester: [
    {
      id: "t1",
      who: "Eira Solvang",
      test: "Putting 3–6–9 fot",
      src: "Spiller",
      at: "29. sep.",
      beskrivelse: "Ti putter fra hver avstand, teller senkede.",
      scoring: "Antall treff",
    },
  ],
  dubletter: [
    {
      id: "d1",
      match: "Mulig dublett av «Srixon Tour 3 Borregaard»",
      kildeId: "d1",
      malId: "d1-kilde",
      a: { name: "Srixon 3 Borregaard", dato: "12. sep. 2026", bane: "Borregaard GK", pamelding: "1", resultater: "1", src: "Manuell" },
      b: { name: "Srixon Tour 3 Borregaard", dato: "12. sep. 2026", bane: "Borregaard GK", pamelding: "84", resultater: "84", src: "NGF" },
    },
  ],
  moderering: [
    {
      id: "m1",
      where: "Kommentar",
      who: "Anonym deltaker",
      reason: "Upassende språkbruk i fellestråd",
      at: "I går 21:05",
      text: "",
      type: "RAPPORTERT_INNHOLD",
      status: "OPEN",
    },
  ],
  epost: [
    {
      id: "ep1",
      to: "Mari Solvang",
      email: "mari.s@example.com",
      tpl: "EP-05",
      by: "Caddie",
      at: "I går 15:05",
      svc: "Privattime 60 min · fredag 25.09 kl. 14:00",
      ready: "Klar til sending — timen var i går kl. 14.00",
      note: "Flott økt med fokus på nærspill og wedger. Husk å opprettholde tempo i baksvingen.",
    },
  ],
};

function Vis({
  tilstand = "data",
  fane = "godkjenninger",
}: {
  tilstand?: AG02Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG02Ko
          tilstand={tilstand}
          startFane={fane}
          dagLabel="tirsdag 29. september"
          data={DEMO_DATA}
        />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="godkjenninger" />,
  tom: <Vis tilstand="tom" fane="godkjenninger" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  agent: <Vis tilstand="data" fane="agent" />,
  test: <Vis tilstand="data" fane="test" />,
  dublett: <Vis tilstand="data" fane="dublett" />,
  moderering: <Vis tilstand="data" fane="moderering" />,
  epost: <Vis tilstand="data" fane="epost" />,
};
