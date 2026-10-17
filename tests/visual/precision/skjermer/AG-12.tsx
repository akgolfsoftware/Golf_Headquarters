/** Prøvefil for AG-12 Øktark etter live i nytt design. Oppdiktede navn og tall, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Feil, Laster } from "@/components/admin/agencyos-ny/ny";
import type { OktarkData } from "@/components/admin/precision/AG12Oktark";
import { AG12OktarkNy } from "@/components/admin/precision/AG12OktarkNy";

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
  data: <Skall><AG12OktarkNy data={data} /></Skall>,
  aktiv: <Skall><AG12OktarkNy data={{ ...data, status: "AKTIV", okt: { ...data.okt!, opptak: null, coachBrief: "", coachRating: null } }} /></Skall>,
  tom: <Skall><AG12OktarkNy data={tom} /></Skall>,
  laster: <Skall><div className="agn-s"><Laster tekst="Henter øktarket …" hoyder={[120, 200, 200]} /></div></Skall>,
  feil: <Skall><div className="agn-s"><Feil tittel="Øktarket kunne ikke hentes" tekst="Ingenting i økta er endret. Opptak ligger lagret på økta. Prøv igjen." kode="FEIL · ØKTARK" onProv={() => {}} /></div></Skall>,
};
