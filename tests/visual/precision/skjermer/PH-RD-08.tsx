/** Prøvefil for PH-RD-08 Runde ferdig. Syntetiske data (tegningens RD_DATA.summary), ingen ekte spillere. */
import { PHRD08RundeFerdig, type PHRD08Data } from "@/components/portal/precision/PHRD08RundeFerdig";

export const sti = "/portal/mal/runder/r1";

const par = [4, 5, 3, 4, 4, 5, 3, 4, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5];
const score = [4, 6, 3, 5, 4, 5, 3, 4, 4, 4, 4, 4, 5, 5, 4, 3, 5, 4];
const hull = par.map((p, i) => ({ nr: i + 1, par: p, score: score[i] }));
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

const base: PHRD08Data = {
  id: "r1", nettoppLagret: false, baneNavn: "Fredrikstad GK", datoKort: "20.09.2026",
  score: 76, par: 72, sgTotal: -1.1,
  sgKategorier: [{ akse: "OTT", sg: 0.4 }, { akse: "APP", sg: -0.8 }, { akse: "ARG", sg: -0.3 }, { akse: "PUTT", sg: -0.4 }],
  sgSource: "beregnet",
  registrering: { status: "komplett", dataQuality: "slag_for_slag_komplett", kilde: "live", sgKilde: "beregnet", antallHullMedScore: 18, antallKompletteHull: 18, kanBeregneSg: true, beskytterManuellSg: false, manglerForBeregnetSg: [] },
  granulaerSg: {}, hull, erEier: true, visKjedeStatus: false, antallKomplette: 18, antallHullMedScore: 18,
  putter: { totalt: 32, hull: 18 }, fairway: { treff: 9, av: 14 }, gir: { treff: 8, av: 18 }, straff: 1,
  ut: { score: sum(score.slice(0, 9)), par: sum(par.slice(0, 9)) }, inn: { score: sum(score.slice(9)), par: sum(par.slice(9)) },
};

export const tilstander = {
  data: <PHRD08RundeFerdig data={base} uleste={3} />,
  tom: <PHRD08RundeFerdig uleste={3} data={{ ...base, hull: [], putter: null, fairway: null, gir: null, straff: null, ut: null, inn: null, sgTotal: null, sgKategorier: [], sgSource: null }} />,
  nettopp: <PHRD08RundeFerdig uleste={3} data={{ ...base, nettoppLagret: true, visKjedeStatus: true, antallKomplette: 11, sgSource: "estimert" }} />,
  ikkeEier: <PHRD08RundeFerdig uleste={0} data={{ ...base, erEier: false }} />,
};
export const natt: string[] = ["data"];
