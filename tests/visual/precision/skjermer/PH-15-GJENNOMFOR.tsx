/** Prøvefil for testgjennomføringen (PH15TestGjennomfor, /portal/tren/tester/[testId]/gjennomfor). Syntetiske data. */
import { PH15TestGjennomfor } from "@/components/portal/precision/PH15TestGjennomfor";
import type { ScorekortSpec } from "@/lib/portal-tester/protocol";

export const sti = "/portal/tren/tester/t1/gjennomfor";

const avstand: ScorekortSpec = {
  unit: "m",
  forsok: Array.from({ length: 10 }, (_, i) => ({ nr: i + 1, label: `Slag ${i + 1}`, felter: [{ key: "avstand", type: "meter" as const, label: "Avstand til flagg", unit: "m" }] })),
};
const godkjent: ScorekortSpec = {
  forsok: Array.from({ length: 9 }, (_, i) => ({ nr: i + 1, label: `Slag ${i + 1}`, felter: [{ key: "ok", type: "checkbox" as const, label: "Godkjent" }] })),
};

const felles = { testId: "t1", beskrivelse: null, scoringRule: "", omraade: "Innspill", protocol: null };

export const tilstander = {
  start: <PH15TestGjennomfor {...felles} testNavn="Inspill Basic" sist={{ score: 6, dato: "03.10.2026" }} spec={avstand} gjenopptak={null} />,
  underveis: <PH15TestGjennomfor {...felles} testNavn="Inspill Basic" sist={null} spec={avstand} gjenopptak={{ sessionId: "s1", verdier: { 1: { avstand: "2,4" }, 2: { avstand: "5,1" }, 3: { avstand: "3,0" } } }} />,
  godkjent: <PH15TestGjennomfor {...felles} testNavn="Wedge Gate" sist={null} spec={godkjent} gjenopptak={null} />,
};
