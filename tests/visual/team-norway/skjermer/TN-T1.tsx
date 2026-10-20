/** Prøvefil for T1 Testoversikt (øverst på Fellestesting) og T3 Registrering ute (trenerens føring på testdag). Syntetiske data. */
import { TnTestoversikt, type TnTestoversiktRad } from "@/components/team-norway/skjermer/tn-testoversikt";
import { TnTestdagScorecard } from "@/components/team-norway/tn-testdag-scorecard";
import type { ReactNode } from "react";
import { TnShell } from "@/components/team-norway/tn-shell";
import type { TnTestdagDeltakerDetalj } from "@/lib/domain/tn-arbeidsflate";
import { TESTBATTERI } from "@/lib/portal-tester/testbatteri";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";

export const sti = "/team-norway/fellestesting";

const skoler = ["Skole A", "Skole B", "Skole C", "Andre skoler"];
const tilstand = ["alle", "noen", "ingen"] as const;
const medianer = ["6,8 %", "5,9 %", "7,4 %", "6,2 %", "31 slag", "9,6 m", "8,1 %", null, "4 / 6 OK", "27 / 36 p", "7 / 10 OK", "24 / 36 p", "22 / 36 p", "38 cm"];
const rader: TnTestoversiktRad[] = TESTBATTERI.map((test, i) => ({
  test,
  protokollId: test.protokoller[0] ?? null,
  medResultat: test.del === "Fysisk" ? 0 : 14 - (i % 6),
  median: test.del === "Fysisk" ? null : medianer[i] ?? null,
  perSkole: Object.fromEntries(skoler.map((s, j) => [s, test.del === "Fysisk" ? "ingen" : tilstand[(i + j) % 3]!])),
}));

const ramme = (barn: ReactNode) => (
  <TnShell aktiv="fellestesting" brukerNavn="Trener 1" rolle="Trener" groupId="g1" visTrenerflater kanAdministrere>{barn}</TnShell>
);

const wedgeGate = TN_CATALOG.find((p) => p.id === "wedge-gate")!;
const driverGate = TN_CATALOG.find((p) => p.id === "driver-gate")!;
const deltaker = (protokoll: typeof wedgeGate, verdier: string[]): TnTestdagDeltakerDetalj => ({
  id: "d1", spillerNavn: "Spiller B", protokollId: protokoll.id, protokollNavn: protokoll.name, status: "PENDING", scoreTekst: null,
  testDagId: "dag1", testDagTitle: "Vintersamling, fellestest", testDagStatus: "ACTIVE", forrigePendingDeltakerId: null, nestePendingDeltakerId: "d2",
  eksisterendeUtkast: { revision: 1, values: Object.fromEntries(verdier.map((v, i) => [String(i + 1), { ok: v }])), notes: "" }, utkastFeil: null, kanSkrive: true,
});

export const tilstander = {
  testoversikt: ramme(<TnTestoversikt rader={rader} skoler={skoler} spillere={14} />),
  "registrering-poeng": ramme(<TnTestdagScorecard deltaker={deltaker(wedgeGate, ["I sonen", "Gjennom porten", "I sonen", "Bom", "I sonen"])} protocol={wedgeGate} testDagId="dag1" />),
  "registrering-ok": ramme(<TnTestdagScorecard deltaker={deltaker(driverGate, ["Godkjent", "Bom"])} protocol={driverGate} testDagId="dag1" />),
};
