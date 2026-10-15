/** Prøvefil for PH-18 Runder (pakke 5). Syntetiske data, ingen ekte spillere. */
import type { ReactNode } from "react";
import { PH18Runder } from "@/components/portal/precision/PH18Runder";
import { RunderLaster } from "@/components/portal/precision/PHRunderFelles";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { byggPH18, type PH18RundeInn } from "@/lib/portal-runder/ph18-data";

export const sti = "/portal/mal/runder";

const PAR = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5];
const SCORER = [75, 74, 76, 73, 74, 75, 72, 74, 73, 72, 74, 71, 73, 72, 73, 71, 72, 72];
const BANER = ["Fredrikstad GK", "Borre GK", "Larvik GK", "Miklagard GK"];

function runde(i: number): PH18RundeInn {
  const total = SCORER[i];
  const strokes = PAR.map((p) => p);
  let diff = total - 72;
  for (let k = 0; diff !== 0; k = (k + 5) % 18) { strokes[k] += Math.sign(diff); diff -= Math.sign(diff); }
  const dato = new Date(Date.UTC(2026, 3, 12 + i * 10, 12));
  return {
    id: `r${i}`, playedAt: dato, score: total, courseName: BANER[i % 4], coursePar: 72,
    source: i % 3 === 0 ? "etterregistrering" : "live", sgSource: i % 3 === 0 ? null : "beregnet", sgTotal: i % 3 === 0 ? null : -0.4,
    roundType: i % 2 ? "turnering" : "trening",
    holeScores: strokes.map((s, k) => ({ holeNumber: k + 1, par: PAR[k], strokes: s, putts: 2, fairway: PAR[k] > 3 ? k % 2 === 0 : null, gir: k % 3 !== 0 })),
  };
}
const inn = SCORER.map((_, i) => runde(i)).reverse();
inn.unshift({ ...runde(0), id: "fjor", playedAt: new Date(Date.UTC(2025, 6, 1, 12)), score: 75 });
inn.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
const modell = byggPH18(inn);
const tom = byggPH18([]);

const skall = (n: ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH18Runder tilstand="data" modell={modell} />),
  tom: skall(<PH18Runder tilstand="tom" modell={tom} />),
  laster: skall(<RunderLaster tekst="Henter rundene" />),
  feil: skall(<PH18Runder tilstand="feil" modell={tom} ukjentKode="TEST-1" />),
};
