/** Bare syntetiske protokolltyper. Ingen faktiske testresultater. */
import { PH15TestGjennomfor } from "@/components/portal/precision/PH15TestGjennomfor";
export const sti = "/portal/tren/tester/syntetisk/gjennomfor";
const base = { testId: "syntetisk", testNavn: "Syntetisk testprotokoll", beskrivelse: "Før den målte verdien for hvert forsøk. Dette er en syntetisk skjermkontroll.", scoringRule: "SUM", omraade: "FYS", sist: null, protocol: null, gjenopptak: null };
export const tilstander = {
  nummer: <PH15TestGjennomfor {...base} spec={{ forsok: [{ nr: 1, label: "Målt verdi", felter: [{ key: "kg", label: "Belastning", type: "number", unit: "kg", min: 0, max: 300 }] }] }} />,
  flere: <PH15TestGjennomfor {...base} spec={{ forsok: [{ nr: 1, label: "Forsøk", felter: [{ key: "kg", label: "Belastning", type: "number", unit: "kg", min: 0, max: 300 }, { key: "side", label: "Side", type: "select", options: ["Venstre", "Høyre"] }] }] }} />,
  treff: <PH15TestGjennomfor {...base} omraade="SLAG" spec={{ forsok: Array.from({ length: 5 }, (_, i) => ({ nr: i + 1, label: "Forsøk", felter: [{ key: "ok", label: "Treff", type: "checkbox" }] })) }} />,
};
export const natt = ["nummer", "flere", "treff"];
