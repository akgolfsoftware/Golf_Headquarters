/** Prøvefil for TN-15 Testprotokoller og IUP › Tester › én test i retning «Skrå» (canvaset, tavlene B1–B2). Syntetiske data. */
import { TnTestprotokollerVisning } from "@/components/team-norway/skjermer/tn-testprotokoller-visning";
import { TnOvrigVisning, TnVisning } from "@/app/team-norway/spiller/[spillerId]/tester/[testId]/visning";
import type { TnArbeidskontekst, TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { TN_CATALOG, tnProtocol, tnVersion, TN_POENG_VERSION } from "@/lib/portal-tester/tn-catalog";

export const sti = "/team-norway/protokoller";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const bibliotek = {
  versjon: TN_POENG_VERSION,
  rader: TN_CATALOG.map((p) => ({ id: p.id, navn: p.name, omrade: p.kind, forsok: p.rows.length, kilde: p.source, status: p.blocked ? "UTKAST" : "KLAR" })),
};
const detalj = (id: string) => {
  const p = tnProtocol(id) ?? TN_CATALOG[0]!;
  return { ...p, versjon: tnVersion(p) };
};

const tilgang: TnSpillerTilgang = { kontekst, spillerId: "b", spillerNavn: "Spiller B" };
const d = (m: number, dag: number) => new Date(Date.UTC(2026, m - 1, dag, 9));
const historikk = [
  [d(10, 19), 4.6, true, "td1"], [d(8, 24), 4.9, false, null], [d(6, 8), 5.4, true, "td0"],
  [d(4, 20), 5.8, false, null], [d(3, 12), 6.1, true, null], [d(1, 14), 6.4, false, null],
].map(([takenAt, v, kontrollert, td], i) => ({
  id: `r${i}`, takenAt: takenAt as Date, score: (v as number) / 100, unit: "pei", formatert: `${String(v).replace(".", ",")} %`,
  recordedByCoach: kontrollert as boolean, testdagDeltakerId: td as string | null,
}));
const sisteForsok = [[145, 148, "2,5 m H"], [145, 137, "4,5 m V"], [145, 153, "1,5 m H"], [160, 157, "5,5 m H"], [160, 168, "3 m V"]].map(([m, c, s], i) => ({ label: `Slag ${i + 1} · ${m} m`, verdi: `carry ${c} m · ${s}` }));

export const tilstander = {
  protokoller: <TnTestprotokollerVisning brukerNavn="Trener 1" visDataGolf={false} kontekst={kontekst} bibliotek={bibliotek} status={null} detalj={detalj("wedge-gate")} />,
  "en-protokoll": <TnTestprotokollerVisning brukerNavn="Trener 1" visDataGolf={false} kontekst={kontekst} bibliotek={bibliotek} status={null} detalj={detalj("inspill-gutter-145")} egenSide />,
  test: <TnVisning spillerId="b" brukerNavn="Trener 1" data={{ tilgang, testId: "tn-inspill", protokollNavn: "Inspill Basic", lowerIsBetter: true, besteScore: 0.046, besteFormatert: "4,6 %", historikk, antallUtelatt: 0, sisteForsok }} />,
  "test-tom": <TnVisning spillerId="b" brukerNavn="Trener 1" data={{ tilgang, testId: "tn-inspill", protokollNavn: "Inspill Basic", lowerIsBetter: true, besteScore: null, besteFormatert: null, historikk: [], antallUtelatt: 0, sisteForsok: [] }} />,
  ovrig: <TnOvrigVisning spillerId="b" brukerNavn="Trener 1" data={{ tilgang, testId: "t9", navn: "Club Speed", regel: "Beste av fem slag med driver.", enhet: "mph", lowerIsBetter: false, steg: [{ label: "Slag med driver", antall: 5, target: null }], historikk: [{ id: "a", takenAt: d(10, 1), score: 112 }, { id: "b", takenAt: d(8, 20), score: 109 }, { id: "c", takenAt: d(6, 2), score: 107 }], sisteForsok: [] }} />,
};
