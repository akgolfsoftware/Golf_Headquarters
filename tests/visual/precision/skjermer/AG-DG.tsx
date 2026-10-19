/** Prøvefil for Data Golf for coach (AgencyOS pakke 10). Syntetiske tall og testnavn. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { DG01Oversikt, DG02Katalog, DG03Proff, DG04Topplister, DG08Norske, DG09Kilde } from "@/components/admin/precision/AGDataGolf";

export const sti = "/admin/datagolf";

const d = new Date(Date.UTC(2026, 9, 12));
const proffer = [
  { dgId: 1, navn: "Test Proff En", land: "NOR", tour: "pga", sgTotal: 1.42, dgRang: 12, owgr: 20, norsk: true },
  { dgId: 2, navn: "Proff med et svært langt navn som må brytes", land: "USA", tour: "pga", sgTotal: -0.2, dgRang: 140, owgr: null, norsk: false },
];
const S = ({ children }: { children: React.ReactNode }) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach">{children}</AgencyOSSkall></AdminRolleProvider>;

export const tilstander = {
  oversikt: <S><DG01Oversikt d={{ antallProffer: 412, kildedato: d, sistSynk: d, feiletSynk: 1, endepunkter: 6, norske: proffer, forsinket: false }} /></S>,
  tom: <S><DG01Oversikt d={{ antallProffer: 0, kildedato: null, sistSynk: null, feiletSynk: 0, endepunkter: 0, norske: [], forsinket: true }} /></S>,
  katalog: <S><DG02Katalog rader={proffer} turer={["pga", "euro"]} valg={{ sok: "", norskForst: true }} totalt={412} sidenr={1} sider={9} /></S>,
  proff: <S><DG03Proff tak={{ name: "Test Proff En", country: "NOR", primaryTour: "pga", asOf: d, sgTotal: 1.42, sgOtt: 0.3, sgApp: 0.6, sgArg: 0.1, sgPutt: 0.42, drivingDistY: 310, drivingAcc: 0.58, dgRank: 12, owgrRank: 20, bands: [{ band: "innspill100", lie: "fairway", proximityMeters: 6.4, girRate: 0.78, shotCount: 220 }] }} sesonger={[{ tour: "pga", year: 2026, rounds: 70, avgScore: 69.8, fairwayPct: 61, girPct: 68, puttsPerRound: 28.9, sgTotal: 1.4 }]} /></S>,
  topplister: <S><DG04Topplister kategorier={[{ id: "sgTotal", label: "SG total" }, { id: "avgScore", label: "Snittscore" }]} aktiv="sgTotal" tour="pga" aar={2026} aarValg={[2026, 2025]} turValg={["pga"]} rader={[{ dgId: 1, navn: "Test Proff En", land: "NOR", runder: 70, verdi: 1.42 }]} oppdatert={d} /></S>,
  norske: <S><DG08Norske spillere={[{ id: "p1", name: "Test Proff En", entries: [{ id: "e1", position: 4, scoreToPar: -9, tournament: { name: "Testturnering", startDate: d } }] }]} kommende={[{ id: "t1", name: "Neste turnering", startDate: d, tour: "pga" }]} /></S>,
  kilde: <S><DG09Kilde rader={[{ endepunkt: "preds/skill-ratings", rader: 412, status: 200, feil: null, sist: d }, { endepunkt: "historical-raw-data/rounds", rader: null, status: 500, feil: "Siste synk feilet.", sist: d }]} /></S>,
};
