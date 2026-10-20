/** Prøvefil for TN-13 Gruppeposter og TN-14 Dokumenter i retning «Skrå» (canvaset, tavlene D1–D2). Syntetiske data. */
import { TnDokumenterVisning, TnGruppeposterVisning } from "@/components/team-norway/skjermer/tn-gruppe-visning";
import type { TnInnlegg } from "@/components/team-norway/tn-gruppe-klient";

export const sti = "/team-norway/g1";

const iso = (m: number, d: number, h: number) => new Date(Date.UTC(2026, m - 1, d, h - 2)).toISOString();
const innlegg: TnInnlegg[] = [
  { id: "p1", forfatter: "Trener 1", rolle: "Trener", tidIso: iso(10, 20, 9), tekst: "Spillermøte før vintersamlingen: torsdag 29.10 kl. 19 på Teams. Vi går gjennom programmet og testene dag 1.", vedlegg: [], totalt: 14, lest: 6, paaminnelse: null, endret: false, kanEndre: true, kanSlette: true },
  { id: "p2", forfatter: "Trener 2", rolle: "Assist Coach", tidIso: iso(10, 19, 18), tekst: "Avreise til Oslo mandag 2.11 kl. 07:00 fra Fredrikstad stasjon. Ta med TrackMan-kort og treningsdagbok.", vedlegg: [{ id: "v1", fileName: "reiseplan-vintersamling.pdf" }], totalt: 14, lest: 11, paaminnelse: { sendtAtIso: iso(10, 20, 8), antall: 3 }, endret: true, kanEndre: false, kanSlette: true },
  { id: "p3", forfatter: "Trener 1", rolle: "Trener", tidIso: iso(10, 16, 14), tekst: "Ny versjon av testbeskrivelsen er lagt under Dokumenter. Wedge Gate føres nå med 1 og 4 poeng, maks 36.", vedlegg: [], totalt: 14, lest: 14, paaminnelse: null, endret: false, kanEndre: true, kanSlette: true },
];

const d = (m: number, dag: number) => new Date(Date.UTC(2026, m - 1, dag, 10));
const dok = (id: string, fileName: string, kategori: string | null, kilde: "LASTET_OPP" | "FRA_POST", dato: Date, fileSize: number, apnet: number) => ({
  postId: `post-${id}`, attachmentId: id, fileName, fileType: null, fileSize, path: `x/${id}`, opplasterNavn: "Trener 1", opplasterId: "t1", oppdatert: dato, kilde, kategori, kvittering: { totalt: 14, apnet, manglerIder: [] },
});
const dokumenter = [
  dok("a", "program-vintersamling-2026.pdf", "Sesongplan", "LASTET_OPP", d(10, 20), 1_200_000, 9),
  dok("b", "team-norway-golf-tester-2026.pdf", "Test", "LASTET_OPP", d(10, 16), 3_400_000, 14),
  dok("c", "scorekort-teknikk-og-golfslag.xlsx", "Test", "LASTET_OPP", d(10, 16), 220_000, 7),
  dok("d", "uttakskriterier-junior-2027.pdf", "Uttak", "LASTET_OPP", d(10, 2), 640_000, 12),
  dok("e", "reiseplan-vintersamling.pdf", null, "FRA_POST", d(10, 19), 150_000, 8),
];
const felles = { brukerNavn: "Trener 1", rolleEtikett: "Trener", groupId: "g1", harTrenertilgang: true, erTrener: true, gruppeNavn: "Landslag junior" };
const send = async () => ({ ok: true as const });

export const tilstander = {
  poster: <TnGruppeposterVisning {...felles} utovere={14} under18={9} innlegg={innlegg} send={send as never} />,
  "poster-tom": <TnGruppeposterVisning {...felles} utovere={14} under18={0} innlegg={[]} send={send as never} />,
  "poster-spiller": <TnGruppeposterVisning {...felles} rolleEtikett="Spiller" harTrenertilgang={false} erTrener={false} utovere={14} under18={0} innlegg={innlegg} send={send as never} />,
  dokumenter: <TnDokumenterVisning {...felles} brukerId="t1" dokumenter={dokumenter} kategori={null} kategorier={["Sesongplan", "Uttak", "Reise", "Test", "Helse"]} maksMb={50} />,
};
