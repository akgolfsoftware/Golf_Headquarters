/** Prøvefil for TN-12 Spillere i retning «Skrå» (canvaset «Team Norway nøkkelskjermer», tavle 2). Bare syntetiske navn. */
import { TnSpillerutviklingVisning } from "@/components/team-norway/skjermer/tn-spillerutvikling-visning";
import type { TnArbeidskontekst, TnGruppetreningRad, TnSpillerRad } from "@/lib/domain/tn-arbeidsflate";
import type { TnSpillerTrening } from "@/lib/domain/tn-trenger-deg";

export const sti = "/team-norway/spillere";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const naa = new Date(Date.UTC(2026, 9, 20, 10));

const S: [string, string, number, number, number][] = [
  // navn, skole, hcp, prosent av planen to siste uker, prosent fire uker
  ["Spiller C", "Skole B", -2.1, 52, 58], ["Spiller H", "Skole B", 1.4, 61, 64], ["Spiller K", "Skole D", 2.8, 66, 69],
  ["Spiller J", "Skole A", -1.6, 98, 96], ["Spiller B", "Skole A", -0.8, 94, 91], ["Spiller D", "Skole A", 0.4, 90, 88],
  ["Spiller L", "Skole F", 1.1, 88, 86], ["Spiller F", "Skole B", 1.9, 85, 84], ["Spiller E", "Skole C", 2.2, 83, 82],
  ["Spiller A", "Skole A", 3.0, 80, 79], ["Spiller G", "Skole E", 3.4, 77, 78], ["Spiller I", "Skole C", 2.6, 76, 75],
];

const ikkeDeltApne = [["Ida Moe", 412], ["Jonas Vik", null], ["Sara Dahl", 1088], ["Tobias Lund", 2210]].map(([navn, plass], i) => ({ id: `ikke-${i}`, navn: String(navn), wagrPlass: plass as number | null, wagrDato: plass ? new Date("2026-10-19T00:00:00Z") : null, delt: false }));
const rader: TnSpillerRad[] = S.map(([navn, skole, hcp], i) => ({
  id: `s${i}`, navn, hcp, klubb: `Klubb ${i + 1}`, skole, skolear: null, status: "ACTIVE", tester: 3, sisteTest: null, sisteTestNavn: null,
  aktivPlan: "Grunnperiode", planStart: null, planSlutt: null, fodselsdato: null,
}));

const akser = ["TEK", "SLAG", "FYS", "SPILL"] as const;
const trening: TnGruppetreningRad[] = S.map(([navn, , , toUker, fire], i) => {
  const plan = 720;
  const uke = (pct: number) => ({ planlagtMin: 360, gjortMin: Math.round((360 * pct) / 100), pct });
  const t: TnSpillerTrening = {
    uker: [uke(toUker), uke(toUker)],
    toUker: uke(toUker),
    mestAkse: akser[i % akser.length],
    underPlan: toUker < 70,
    fireUker: { akseMin: { FYS: 120, TEK: 180, SLAG: 160, SPILL: 80, TURN: 0 }, planlagtMin: plan * 2, gjortMin: Math.round((plan * 2 * fire) / 100) },
  };
  return { spillerId: `s${i}`, navn, klubb: `Klubb ${i + 1}`, trening: t };
});

const Vis = (p: Partial<Parameters<typeof TnSpillerutviklingVisning>[0]>) => (
  <TnSpillerutviklingVisning brukerNavn="Trener 1" kontekst={kontekst} visDataGolf={false} rader={rader} apne={[...rader.map((r) => ({ id: r.id, navn: r.navn, wagrPlass: null, wagrDato: null, delt: true })), ...ikkeDeltApne]} trening={trening} antallSpillere={14} q="" naa={naa} {...p} />
);

export const tilstander = {
  data: <Vis />,
  "ikke-delt": <Vis rader={[]} apne={ikkeDeltApne} trening={null} />,
};
