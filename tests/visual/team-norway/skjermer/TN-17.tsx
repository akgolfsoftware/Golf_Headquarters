/** Prøvefil for TN-17 Skoleoversikt, TN-06 College, TN-09 Fagapparat og WANG-testresultater i retning «Skrå» (canvaset, tavlene E1–E4). Syntetiske data. */
import { TnCollegeVisning, TnFagapparatVisning, TnSkolerVisning, TnWangResultaterVisning } from "@/components/team-norway/skjermer/tn-nettverk-visning";
import type { TnArbeidskontekst, TnSpillerRad } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/skoler";

type SkoleData = Parameters<typeof TnSkolerVisning>[0]["data"];
type CollegeProps = Parameters<typeof TnCollegeVisning>[0];
type FagData = Parameters<typeof TnFagapparatVisning>[0]["data"];

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const naa = new Date(Date.UTC(2026, 9, 20, 10));
const spiller = (id: string, navn: string, skole: string | null, skolear: string | null): TnSpillerRad => ({
  id, navn, hcp: 1.2, klubb: null, skole, skolear, status: "AKTIV", tester: 3, sisteTest: null, sisteTestNavn: null, aktivPlan: null, planStart: null, planSlutt: null, fodselsdato: null,
});
const skoleData: SkoleData = {
  kontekst,
  skoler: [
    { skole: "Skole A", spillere: [spiller("a", "Spiller A", "Skole A", "VG1"), spiller("b", "Spiller B", "Skole A", "VG2"), spiller("d", "Spiller D", "Skole A", "VG2"), spiller("j", "Spiller J", "Skole A", "VG3")] },
    { skole: "Skole B", spillere: [spiller("c", "Spiller C", "Skole B", "VG1"), spiller("f", "Spiller F", "Skole B", "VG2"), spiller("h", "Spiller H", "Skole B", "VG3")] },
    { skole: "Skole C", spillere: [spiller("e", "Spiller E", "Skole C", "VG1")] },
    { skole: "Skole D", spillere: [spiller("g", "Spiller G", "Skole D", "VG2")] },
    { skole: "University A", spillere: [spiller("k", "Spiller K", "University A", null)] },
    { skole: "Ikke registrert", spillere: [spiller("n", "Spiller N", null, null)] },
  ],
} as SkoleData;

const rangRad = (id: string, navn: string, skole: string | null, bruttoScore: number | null) => ({ id, navn, skole, skolear: null, status: "AKTIV", bruttoScore });
const collegeData = { kontekst, rader: [rangRad("k", "Spiller K", "University A, Texas", 74.1), rangRad("l", "Spiller L", "College C, Arizona", 73.4), rangRad("m", "Spiller M", "Skole C", 75.2)] } as unknown as CollegeProps["data"];
const college = new Map([["k", { status: "STUDERER", skole: "University A, Texas", startDato: new Date(Date.UTC(2025, 7, 15)), notat: null }]]) as unknown as CollegeProps["college"];
const samlinger = [
  { id: "v1", name: "Vintersamling", startDate: new Date(Date.UTC(2026, 10, 2)), endDate: new Date(Date.UTC(2026, 10, 4)), location: "Oslo golfklubb", notes: null, antallDeltakere: 14 },
  { id: "v2", name: "Treningssamling, Spania", startDate: new Date(Date.UTC(2027, 0, 12)), endDate: new Date(Date.UTC(2027, 0, 18)), location: null, notes: null, antallDeltakere: 14 },
] as CollegeProps["samlinger"];

const fagData = {
  kontekst,
  rader: [
    { user: { id: "t1", name: "Trener 1", email: "trener1@golfforbundet.no" }, role: "COACH", joinedAt: new Date(Date.UTC(2024, 0, 10)) },
    { user: { id: "t2", name: "Trener 2", email: "trener2@golfforbundet.no" }, role: "ASSISTANT", joinedAt: new Date(Date.UTC(2025, 3, 2)) },
    { user: { id: "t3", name: "Trener 3", email: null }, role: "COACH", joinedAt: new Date(Date.UTC(2025, 7, 20)) },
  ],
} as unknown as FagData;

const wangRader = [
  ["WANG Fredrikstad", "Spiller B", "Inspill Basic", "4,6 %", "19. okt. 2026"], ["WANG Fredrikstad", "Spiller D", "Driver Basic", "5,2 %", "19. okt. 2026"],
  ["WANG Fredrikstad", "Spiller J", "Wedge Gate", "31 / 36 p", "19. okt. 2026"], ["WANG Oslo", "Spiller C", "Putt 1–3 m", "29 slag", "17. okt. 2026"],
  ["WANG Oslo", "Spiller C", "Club Speed", "112 mph", "17. okt. 2026"], ["WANG Bergen", "Spiller G", "Putt Gate", "8 / 10 OK", "14. okt. 2026"],
].map(([skole, spiller, test, resultat, dato], i) => ({ id: `w${i}`, skole: skole!, spiller: spiller!, test: test!, resultat: resultat!, dato: dato! }));

export const tilstander = {
  skoler: <TnSkolerVisning brukerNavn="Trener 1" visDataGolf={false} data={skoleData} />,
  college: <TnCollegeVisning brukerNavn="Trener 1" visDataGolf={false} data={collegeData} college={college} samlinger={samlinger} naa={naa} />,
  fagapparat: <TnFagapparatVisning brukerNavn="Trener 1" visDataGolf={false} data={fagData} />,
  wang: <TnWangResultaterVisning brukerNavn="Trener 1" rolle="Trener" groupId="g1" kanAdministrere skoler={[{ groupId: "w1", schoolName: "WANG Fredrikstad", antall: 5 }, { groupId: "w2", schoolName: "WANG Oslo", antall: 2 }, { groupId: "w3", schoolName: "WANG Bergen", antall: 2 }]} antall={128} side={1} sisteSide={3} rader={wangRader} />,
};
