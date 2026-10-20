/** Prøvefil for TN-04 Samlinger og én samling i retning «Skrå» (canvaset «Team Norway nøkkelskjermer», tavle 4). Syntetiske data. */
import { TnSamlingVisning, TnSamlingerVisning } from "@/components/team-norway/skjermer/tn-samlinger-visning";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/samlinger";

type ListeProps = Parameters<typeof TnSamlingerVisning>[0];
type EnProps = Parameters<typeof TnSamlingVisning>[0];

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const naa = new Date(Date.UTC(2026, 9, 20, 10));
const t = (m: number, d: number, h = 8, min = 0) => new Date(Date.UTC(2026, m - 1, d, h - 1, min));

const samlinger: ListeProps["data"]["samlinger"] = [
  { id: "v1", name: "Vintersamling", startDate: t(11, 2), endDate: t(11, 4, 17), location: "Oslo golfklubb", notes: "Fellestest dag 1. Program dag for dag under.", antallDeltakere: 14 },
  { id: "v2", name: "Treningssamling, Spania", startDate: t(1, 12), endDate: t(1, 18, 17), location: null, notes: null, antallDeltakere: 14 },
  { id: "v0", name: "Høstsamling", startDate: t(9, 12), endDate: t(9, 14, 17), location: "Bossum", notes: null, antallDeltakere: 14 },
];

const data: ListeProps["data"] = { kontekst, antallSpillere: 14, planHref: null, samlinger };

const turneringsdata: ListeProps["turneringsdata"] = {
  kontekst,
  turneringer: [
    { id: "r1", name: "Junior Open, Spania", startDate: t(10, 18), endDate: t(10, 20), location: "Spania", sourceOrigin: null, results: [], entries: [] },
    { id: "r2", name: "Vintertour 1", startDate: t(11, 21), endDate: t(11, 22), location: "Spania", sourceOrigin: null, results: [], entries: [] },
  ],
} as ListeProps["turneringsdata"];

const okt = (id: string, title: string, m: number, d: number, h: number, varighet: number, location: string | null) => ({
  id, title, description: null, startAt: t(m, d, h), endAt: new Date(t(m, d, h).getTime() + varighet * 6e4), location, kind: null,
});
const plan = {
  kontekst, fra: t(11, 2), til: t(11, 5),
  okter: [
    okt("o1", "Oppmøte og oppvarming", 11, 2, 8, 30, "Klubbhuset"), okt("o2", "Fellestest, 4 stasjoner", 11, 2, 9, 240, "Range og nærspill"),
    okt("o3", "Wedge og nærspill", 11, 3, 8, 150, "Nærspillsområdet"), okt("o4", "9 hull med oppgaver", 11, 3, 11, 180, "Bane"),
    okt("o5", "Teknisk plan, P6.0", 11, 4, 8, 90, "Range"), okt("o6", "Konkurranse, 18 hull", 11, 4, 10, 300, "Bane"),
  ],
  perioder: [],
} as unknown as EnProps["plan"];

export const tilstander = {
  liste: <TnSamlingerVisning brukerNavn="Trener 1" visDataGolf={false} data={data} turneringsdata={turneringsdata} aar={2026} maned={11} naa={naa} />,
  samling: <TnSamlingVisning brukerNavn="Trener 1" visDataGolf={false} data={data} valgt={samlinger[0]!} plan={plan} kanPublisere={false} naa={naa} />,
  "uten-program": <TnSamlingVisning brukerNavn="Trener 1" visDataGolf={false} data={data} valgt={samlinger[1]!} plan={null} kanPublisere={false} naa={naa} />,
};
