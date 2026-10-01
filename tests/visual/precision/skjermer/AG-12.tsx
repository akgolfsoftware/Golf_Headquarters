/** Prøvefil for AG-12 Øktark etter live. Oppdiktede navn og tall, ingen ekte spillere. */
import { CircleAlert, RotateCw } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import { AG12Oktark, type OktarkData } from "@/components/admin/precision/AG12Oktark";

export const sti = "/admin/gjennomfore/okter/b1";

const data: OktarkData = {
  bookingId: "b1", status: "GJENNOMFORT", spillerNavn: "Test Spiller Med Et Langt Etternavn", spillerMeta: "HCP 4,2 · 17 år", fornavn: "Test",
  dateLabel: "fredag 26. september", startTime: "10:00", endTime: "11:00", facilityLabel: "Prøvestudio", durationMin: 60, trainingSessionV2Id: "t1",
  okt: {
    tittel: "Teknisk økt", malsetning: "Startretning innenfor ±2°",
    driller: [
      { id: "d1", navn: "Speil P6.0–P7.0 uten ball", varighetMin: 10, pyramide: "TEK", logget: true },
      { id: "d2", navn: "7-jern lav hastighet, 50 % av Club Speed", varighetMin: 20, pyramide: "SLAG", logget: true },
      { id: "d3", navn: "Utslag mot smalt mål med et langt navn som må brytes", varighetMin: 15, pyramide: "SLAG", logget: false },
    ],
    opptak: { status: "DONE", durationSec: 3312, harAvskrift: true, sammendrag: "Vi jobbet med startretning.\n\n- Oppstilling: sjekk sikte før hvert slag.\n- Neste gang: lav hastighet før full fart." },
    coachBrief: "Fokus på rolig tempo i baksvingen.",
    coachRating: 4,
  },
};

const tom: OktarkData = { ...data, status: "PLANLAGT", trainingSessionV2Id: null, okt: null, facilityLabel: null };

const Skall = ({ children }: { children: React.ReactNode }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">{children}</AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: <Skall><AG12Oktark data={data} /></Skall>,
  aktiv: <Skall><AG12Oktark data={{ ...data, status: "AKTIV", okt: { ...data.okt!, opptak: null, coachBrief: "", coachRating: null } }} /></Skall>,
  tom: <Skall><AG12Oktark data={tom} /></Skall>,
  laster: <Skall><div className="pa-side"><LasterTilstand text="Henter øktarket …" /></div></Skall>,
  feil: <Skall><div className="pa-side"><FeilTilstand icon={CircleAlert} title="Øktarket kunne ikke hentes" text="Ingenting i økta er endret. Notater og opptak ligger lagret på økta. Prøv igjen."
    retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw">Prøv igjen</Knapp>} /></div></Skall>,
};
