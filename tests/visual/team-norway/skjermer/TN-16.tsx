/** Prøvefil for TN-16 Rangliste i retning «Skrå». Syntetiske spillere, bare brutto. */
import { TnRanglisteVisning } from "@/components/team-norway/skjermer/tn-rangliste-visning";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/rangliste";

type Props = Parameters<typeof TnRanglisteVisning>[0];
const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const navn = ["Spiller C", "Spiller J", "Spiller B", "Spiller D", "Spiller L", "Spiller H", "Spiller F", "Spiller A", "Spiller N"];
const data = {
  kontekst,
  rader: navn.map((n, i) => i === 8
    ? { id: `s${i}`, navn: n, klubb: null, koblet: false, starter: 0, runder: 0, snittplassering: null, bruttoSnitt: null, bruttoScore: null }
    : { id: `s${i}`, navn: n, klubb: `Klubb ${i + 1}`, koblet: true, starter: 7 - (i % 4), runder: 14 - i, snittplassering: 6 + i * 1.7, bruttoSnitt: 71.4 + i * 0.6, bruttoScore: 71.4 + i * 0.6 }),
} as unknown as Props["data"];

export const tilstander = {
  data: <TnRanglisteVisning brukerNavn="Trener 1" visDataGolf={false} data={data} aar={2026} sortering="brutto" />,
};
