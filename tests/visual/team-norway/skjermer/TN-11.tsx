/** Prøvefil for TN-11 Månedsplan i retning «Skrå» (pakke 5). Syntetiske data. */
import { TnManedsplanVisning } from "@/components/team-norway/skjermer/tn-manedsplan-visning";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/manedsplan";

type Props = Parameters<typeof TnManedsplanVisning>[0];

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const naa = new Date(Date.UTC(2026, 10, 4, 10));
const t = (m: number, d: number, h = 8, min = 0) => new Date(Date.UTC(2026, m - 1, d, h - 1, min));

const okt = (id: string, title: string, m: number, d: number, h: number, varighet: number, location: string | null) => ({
  id, title, description: null, startAt: t(m, d, h), endAt: new Date(t(m, d, h).getTime() + varighet * 6e4), location, kind: null,
});

const perioder = [
  { id: "p1", lPhase: "GRUNN", startDate: t(10, 26), endDate: t(12, 20), focus: null, weeklyVolMin: null, weeklyVolMax: null, axisMinutes: { FYS: 240, TEK: 300, SLAG: 240, SPILL: 120, TURN: 0 }, axisMinutesLight: null },
];

const data = {
  kontekst, fra: t(10, 25), til: t(12, 8),
  okter: [
    okt("o1", "Fysisk, styrke", 11, 3, 7, 60, "Treningssenteret"),
    okt("o2", "Teknisk plan, P6.0", 11, 4, 9, 90, "Range"),
    okt("o3", "Wedge og nærspill", 11, 5, 15, 120, "Nærspillsområdet"),
    okt("o4", "Putting, 1–3 m", 11, 10, 15, 60, "Inne"),
    okt("o5", "9 hull med oppgaver", 11, 12, 13, 180, "Bane"),
    okt("o6", "Fysisk, rotasjon", 11, 17, 7, 60, "Treningssenteret"),
  ],
  perioder,
} as unknown as Props["data"];

const samlingsdata = {
  kontekst, antallSpillere: 14, planHref: null,
  samlinger: [{ id: "v1", name: "Vintersamling", startDate: t(11, 20), endDate: t(11, 22, 17), location: "Oslo golfklubb", notes: null, antallDeltakere: 14 }],
} as unknown as Props["samlingsdata"];

const turneringsdata = {
  kontekst,
  turneringer: [{ id: "r1", name: "Vintertour 1", startDate: t(11, 27), endDate: t(11, 28), location: "Spania", sourceOrigin: null, results: [], entries: [] }],
} as unknown as Props["turneringsdata"];

const tomData = { ...data, okter: [], perioder: [] } as unknown as Props["data"];

export const tilstander = {
  kalender: <TnManedsplanVisning brukerNavn="Trener 1" visDataGolf={false} data={data} turneringsdata={turneringsdata} samlingsdata={samlingsdata} aar={2026} maned={11} visning="kalender" dagParam={undefined} naa={naa} />,
  tom: <TnManedsplanVisning brukerNavn="Trener 1" visDataGolf={false} data={tomData} turneringsdata={null} samlingsdata={null} aar={2026} maned={12} visning="kalender" dagParam={undefined} naa={naa} />,
};
