/** Prøvefil for TN-10 Lisens og økonomi i retning «Skrå» (pakke 6). Syntetiske data. */
import { TnLisensVisning } from "@/components/team-norway/skjermer/tn-lisens-visning";
import type { TnArbeidskontekst, TnSpillerRad, TnSpillerstatusRad } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/lisens-okonomi";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const naa = new Date(Date.UTC(2026, 9, 20, 10));
const d = (m: number, dag: number, a = 2026) => new Date(Date.UTC(a, m - 1, dag));

const spiller = (id: string, navn: string): TnSpillerRad => ({ id, navn, hcp: null, klubb: null, skole: null, skolear: null, status: "AKTIV", tester: 0, sisteTest: null, sisteTestNavn: null, aktivPlan: null, planStart: null, planSlutt: null, fodselsdato: null });
const spillere = ["Spiller A", "Spiller B", "Spiller C", "Spiller D", "Spiller E"].map((n, i) => spiller(`s${i}`, n));

const status = new Map<string, TnSpillerstatusRad>([
  ["s0", { spillerId: "s0", lisensStatus: "BETALT", lisensBetaltDato: d(2, 1), helseattestUtloper: d(6, 30, 2027), antidopingSignert: d(1, 15) }],
  ["s1", { spillerId: "s1", lisensStatus: "BETALT", lisensBetaltDato: d(2, 3), helseattestUtloper: d(11, 5), antidopingSignert: d(1, 15) }],
  ["s2", { spillerId: "s2", lisensStatus: "UBETALT", lisensBetaltDato: null, helseattestUtloper: d(3, 1, 2027), antidopingSignert: null }],
  ["s3", { spillerId: "s3", lisensStatus: "FRITAK", lisensBetaltDato: null, helseattestUtloper: d(8, 1, 2027), antidopingSignert: d(3, 2) }],
]);

export const tilstander = {
  liste: <TnLisensVisning brukerNavn="Trener 1" visDataGolf={false} kontekst={kontekst} spillere={spillere} status={status} aar={2026} naa={naa} />,
  tom: <TnLisensVisning brukerNavn="Trener 1" visDataGolf={false} kontekst={kontekst} spillere={[]} status={new Map()} aar={2026} naa={naa} />,
};
