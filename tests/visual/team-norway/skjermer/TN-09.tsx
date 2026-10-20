/** Prøvefil for TN-09 Gruppeanalyse i retning «Skrå» (pakke 6). Syntetiske data. */
import { TnAnalyseVisning } from "@/components/team-norway/skjermer/tn-analyse-visning";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";

export const sti = "/team-norway/analyse";

type Props = Parameters<typeof TnAnalyseVisning>[0];

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };

const valg = {
  kontekst,
  protokoller: [{ id: "p1", navn: "Driver Basic" }, { id: "p2", navn: "Inspill Basic" }, { id: "p3", navn: "Wedge Variation" }],
  testdager: [{ id: "d1", title: "Fellestest høst", scheduledAt: new Date(Date.UTC(2026, 9, 12, 8)) }, { id: "d2", title: "Fellestest vår", scheduledAt: new Date(Date.UTC(2026, 3, 20, 8)) }],
} as unknown as Props["valg"];

const navn = ["Spiller A", "Spiller B", "Spiller C", "Spiller D", "Spiller E", "Spiller F", "Spiller G"];
const resultat: Props["resultat"] = {
  kontekst,
  protokollNavn: "Inspill Basic",
  lowerIsBetter: false,
  grunnlag: { type: "testdag", navn: "Fellestest høst", dato: new Date(Date.UTC(2026, 9, 12, 8)) },
  rader: navn.map((n, i) => (i < 5
    ? { spillerId: `s${i}`, spillerNavn: n, skole: i === 4 ? "Skole A" : null, status: "DONE" as const, score: 62 - i * 4, formatert: String(62 - i * 4) }
    : { spillerId: `s${i}`, spillerNavn: n, skole: null, status: "ABSENT" as const, score: null, formatert: null })),
};

export const tilstander = {
  resultat: <TnAnalyseVisning brukerNavn="Trener 1" visDataGolf={false} valg={valg} resultat={resultat} ugyldigValg={false} sp={{ dag: "d1" }} />,
  tom: <TnAnalyseVisning brukerNavn="Trener 1" visDataGolf={false} valg={valg} resultat={null} ugyldigValg={false} sp={{}} />,
};
