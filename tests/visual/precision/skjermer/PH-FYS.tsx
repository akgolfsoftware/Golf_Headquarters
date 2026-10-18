/** Prøvefil for pakke 17b Fysisk program. Syntetiske data, ingen database. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHFysiskProgram, type PHFysiskProgramData } from "@/components/portal/precision/PHFysiskProgram";
import { byggFysiskProgram, type FysRadInn } from "@/lib/portal-plan/fysisk-program";

export const sti = "/portal/planlegge/fysisk";
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const r = (navn: string, o: Partial<FysRadInn> = {}): FysRadInn => ({ navn, sett: 4, repsMin: 6, repsMax: 6, belastningPst: null, loggBelastningKg: 90, rir: 2, hvile: 120, notat: null, intervallSerier: null, intervallMinutter: null, pulssone: null, pause: null, ...o });
const A = [r("Markløft trapbar"), r("Bulgarsk utfall med et langt navn som må brytes på smal skjerm", { sett: 3, repsMin: 8, repsMax: 8, loggBelastningKg: 16, notat: "Per bein" }), r("Rotasjonskast", { sett: 5, repsMin: 5, repsMax: 5, loggBelastningKg: null, rir: null, hvile: null }), r("Hofteløft", { sett: 3, repsMin: 10, repsMax: 10, loggBelastningKg: 60, rir: 3 })];
const B = [r("Knebøy", { repsMin: 5, repsMax: 5, loggBelastningKg: 80 }), r("Intervall på sykkel", { intervallSerier: 6, intervallMinutter: 3, pulssone: "S3", pause: "2 min pause mellom" })];
const okt = (id: string, navn: string, dag: "TIR" | "FRE", gjort: boolean, rader: FysRadInn[]) => ({ id, navn, dag, type: dag === "TIR" ? "styrke" : "kondisjon", estimertMinutter: 60, gjennomfortAt: gjort ? new Date("2026-09-22T16:00:00Z") : null, rader });
const program = byggFysiskProgram({
  id: "p", navn: "Underkropp A og B", startDato: new Date("2026-09-21T00:00:00Z"), fraNavn: "Anders Kristiansen",
  uker: Array.from({ length: 8 }, (_, i) => ({ ukeNr: i + 1, okter: [okt(`A${i}`, "Økt A", "TIR", i < 2, A), okt(`B${i}`, "Økt B", "FRE", i < 1, B)] })),
}, new Date("2026-10-05T12:00:00Z"));
const tester = { sist: "14. sep. 2026", rader: [
  { navn: "Markløft trapbar", verdi: "115 kg", endring: "+10", retning: "opp" as const },
  { navn: "Benkpress", verdi: "72,5 kg", endring: "±0", retning: "lik" as const },
  { navn: "Lengdehopp", verdi: "2,41 m", endring: "+0,06", retning: "opp" as const },
  { navn: "Club Speed", verdi: "108 mph", endring: null, retning: null },
] };
const data = (o: Partial<PHFysiskProgramData> = {}): PHFysiskProgramData => ({ program, tester, ...o });
export const tilstander = {
  data: <S><PHFysiskProgram data={data()} /></S>,
  "uten-test": <S><PHFysiskProgram data={data({ tester: { sist: null, rader: [] } })} /></S>,
  tom: <S><PHFysiskProgram data={data({ program: null })} /></S>,
};
