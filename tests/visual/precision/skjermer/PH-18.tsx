/** Prøvefil for PH-18 Runder og statistikk. Syntetiske data, ingen ekte spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH18Runder, type PH18Props } from "@/components/portal/precision/PH18Runder";
import { byggPH18, type PH18RundeInn } from "@/lib/portal-runder/ph18-data";

export const sti = "/portal/mal/runder";
export const natt = ["data-natt", "sesonger-natt"];

const PAR = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5];
const hs = (slag: number[]) => slag.map((s, i) => ({ holeNumber: i + 1, par: PAR[i], strokes: s, putts: 2, fairway: PAR[i] === 3 ? null : i % 3 !== 0, gir: i % 2 === 0 }));
const inn = (id: string, dato: string, slag: number[], o: Partial<PH18RundeInn> = {}): PH18RundeInn => ({
  id, playedAt: new Date(dato), score: slag.reduce((a, b) => a + b, 0), courseName: "Gamle Fredrikstad Golfklubb med et langt banenavn", coursePar: 72,
  sgTotal: 0.4, sgSource: "manual", roundType: "trening", holeScores: hs(slag), ...o,
});
const jevn = (d: number) => PAR.map((p, i) => p + (i % 4 === 0 ? d : i % 5 === 0 ? -1 : 0));
const modell = byggPH18([
  inn("r10", "2026-09-20T10:00:00Z", [4, 5, 2, 6, 4, 5, 3, 4, 7, 4, 4, 4, 5, 5, 4, 3, 4, 5]),
  inn("r9", "2026-09-13T10:00:00Z", jevn(1).slice(0, 9), { sgTotal: null, sgSource: null, holeScores: hs(jevn(1)).slice(0, 9), courseName: "Onsøy" }),
  inn("r8", "2026-08-30T10:00:00Z", jevn(1)),
  inn("r7", "2026-07-12T10:00:00Z", jevn(2), { sgTotal: -1.2 }),
  inn("r6", "2026-06-01T10:00:00Z", jevn(1), { holeScores: [], score: 79 }),
  inn("r5", "2025-08-01T10:00:00Z", jevn(2)),
  inn("r4", "2025-05-01T10:00:00Z", jevn(3)),
]);
const base: PH18Props = { tilstand: "data", modell, registrerHref: "#", liveHref: "#", delHref: () => "#", detaljHref: () => "#" };
const Vis = (p: Partial<PH18Props>) => <PlayerHQSkall innboksHref="#" uleste={0}><PH18Runder {...base} {...p} /></PlayerHQSkall>;
export const tilstander = {
  data: <Vis />,
  "data-natt": <Vis />,
  statistikk: <Vis startFane="stat" />,
  hull: <Vis startFane="hull" />,
  sesonger: <Vis startFane="sesong" />,
  "sesonger-natt": <Vis startFane="sesong" />,
  tom: <Vis tilstand="tom" modell={{ runder: [], hull: null, sesonger: [] }} />,
  feil: <Vis tilstand="feil" modell={{ runder: [], hull: null, sesonger: [] }} ukjentKode="FEIL 502 · RUNDER" />,
};
