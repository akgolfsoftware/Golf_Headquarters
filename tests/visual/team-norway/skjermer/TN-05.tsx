/** Prøvefil for TN-05 Uttak og kriterier i retning «Skrå» (canvaset «Team Norway nøkkelskjermer», tavle 5). Syntetiske data. */
import { TnUttakVisning } from "@/components/team-norway/skjermer/tn-uttak-visning";
import type { TnArbeidskontekst, TnUttakRad, TnUttaksrundeRad } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/uttak";

type Props = Parameters<typeof TnUttakVisning>[0];
const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const naa = new Date(Date.UTC(2026, 9, 20, 10));
const navn = ["Spiller C", "Spiller J", "Spiller B", "Spiller D", "Spiller L", "Spiller H", "Spiller F", "Spiller A"];
const data = {
  kontekst,
  rader: navn.map((n, i) => ({ id: `s${i}`, navn: n, klubb: `Klubb ${i + 1}`, koblet: true, starter: 6 - (i % 3), runder: 12, snittplassering: 8 + i, bruttoSnitt: 72 + i / 2, bruttoScore: 72 + i / 2 })),
} as unknown as Props["data"];

const NM = "Nordisk mesterskap junior";
const uttak: TnUttakRad[] = [
  { id: "u1", spillerId: "s0", arrangement: NM, status: "UTTATT", begrunnelse: "Best på kriterium 1 og 2.", decidedAt: new Date(Date.UTC(2026, 9, 15)) },
  { id: "u2", spillerId: "s1", arrangement: NM, status: "UTTATT", begrunnelse: null, decidedAt: new Date(Date.UTC(2026, 9, 15)) },
  { id: "u3", spillerId: "s4", arrangement: NM, status: "RESERVE", begrunnelse: null, decidedAt: new Date(Date.UTC(2026, 9, 15)) },
];
const rundeData: TnUttaksrundeRad[] = [{ arrangement: NM, frist: new Date(Date.UTC(2026, 10, 3)), plasser: 4, reserver: 2 }];

export const tilstander = {
  data: <TnUttakVisning brukerNavn="Trener 1" visDataGolf={false} data={data} uttak={uttak} rundeData={rundeData} naa={naa} />,
  tom: <TnUttakVisning brukerNavn="Trener 1" visDataGolf={false} data={data} uttak={[]} rundeData={[]} naa={naa} />,
};
