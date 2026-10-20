/** Prøvefil for TN-03 Fellestesting og én testdag i retning «Skrå». Syntetiske spillere og testdager. */
import { TnFellestestingVisning, TnTestdagVisning } from "@/components/team-norway/skjermer/tn-fellestesting-visning";
import type { TnArbeidskontekst, TnSpillerRad, TnTestdag, TnTestdagRad } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/fellestesting";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const t = (m: number, d: number, h = 9) => new Date(Date.UTC(2026, m - 1, d, h - 1));

const navn = ["Spiller A", "Spiller B", "Spiller C", "Spiller D", "Spiller E", "Spiller F", "Spiller G", "Spiller H"];
const rader: TnSpillerRad[] = navn.map((n, i) => ({
  id: `s${i}`, navn: n, hcp: 1 + i / 2, klubb: `Klubb ${i + 1}`, skole: `Skole ${"ABCDEF"[i % 6]}`, skolear: null, status: "ACTIVE",
  tester: i < 6 ? 3 - (i % 3) : 0, sisteTest: i < 6 ? t(9, 14) : null, sisteTestNavn: i < 6 ? "Wedge Gate" : null,
  aktivPlan: null, planStart: null, planSlutt: null, fodselsdato: null,
}));

const dagRad = (id: string, title: string, d: Date, status: TnTestdagRad["status"], ferdig: number): TnTestdagRad => ({
  id, title, eventId: null, stationName: null, groupName: "Landslag junior", location: "Oslo golfklubb", scheduledAt: d, status, protokollNavn: "Wedge Gate", antallDeltakere: 8, antallFullfort: ferdig,
});
const testdager = { kontekst, dager: [dagRad("d1", "Fellestest vintersamling", t(11, 2), "PLANNED", 0), dagRad("d0", "Fellestest høstsamling", t(9, 14), "COMPLETED", 8)] };

const protokoller = [{ id: "wedge-gate", navn: "Wedge Gate" }, { id: "driver-basic", navn: "Driver Basic" }];
const protokollbibliotek = {
  versjon: "2026.1",
  rader: ["Driver Basic", "Inspill Basic", "Wedge Variation", "8-balls variation", "Putt 1–3 m", "Wedge Gate"].map((n, i) => ({ id: `p${i}`, navn: n, omrade: "pei", forsok: 9, kilde: "Team Norway", status: "KLAR" })),
} as unknown as Parameters<typeof TnFellestestingVisning>[0]["protokollbibliotek"];

const dag: TnTestdag = {
  id: "d1", title: "Fellestest vintersamling", location: "Oslo golfklubb", scheduledAt: t(11, 2), status: "ACTIVE", protokollNavn: "Wedge Gate",
  eventId: null, stationName: null, groupName: "Landslag junior", stations: [],
  deltakere: navn.map((n, i) => ({ id: `x${i}`, spillerId: `s${i}`, spillerNavn: n, order: i, status: i < 3 ? "DONE" : i === 3 ? "ABSENT" : "PENDING", scoreTekst: i < 3 ? `${30 - i * 2} p` : null, lagredeForsok: i < 3 ? 9 : 0, totaltForsok: 9 })),
};

export const tilstander = {
  oversikt: <TnFellestestingVisning brukerNavn="Trener 1" visDataGolf={false} spillerside={{ kontekst, rader }} testdager={testdager} fellesgrupper={[]} protokoller={protokoller} protokollbibliotek={protokollbibliotek} />,
  testdag: <TnTestdagVisning brukerNavn="Trener 1" visDataGolf={false} valgt={{ kontekst, dag }} />,
};
