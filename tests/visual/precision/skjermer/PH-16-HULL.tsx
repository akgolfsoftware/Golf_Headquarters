/** Prøvefil for Hull (pakke 13): Soner og Hull for hull. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16dHull } from "@/components/portal/precision/PH16dHull";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import { byggPH16Stats, type PH16RundeInn } from "@/lib/portal-analyse/ph16-stats-data";
import { byggHullSoner, byggHullVarme, type HullData, type HullRadInn, type SgRundeInn } from "@/lib/portal-analyse/omrade-data";

export const sti = "/portal/analysere/hull";

const runder: PH16RundeInn[] = Array.from({ length: 12 }, (_, i) => ({
  id: `r${i}`, playedAt: new Date(Date.UTC(2026, 9, 4 - i * 10)), score: 73, roundType: "trening", courseName: "Fredrikstad GK",
  sgTotal: -1.1, sgSource: "beregnet", benchmarkLevelSnapshot: "PGA_TOUR", holeScores: Array.from({ length: 18 }, () => ({ par: 4 })),
  sgTee: 0.2, sgApp200: -0.1, sgApp150: -0.2, sgApp100: -0.5, sgApp50: -0.1,
  sgChip: -0.1, sgPitch: -0.2, sgLob: null, sgBunker: -0.1,
  sgPutt0_3: 0.1, sgPutt3_5: 0, sgPutt5_10: -0.1, sgPutt10_15: 0, sgPutt15_25: 0, sgPutt25_40: 0, sgPutt40plus: null,
}));
const sgRunder: SgRundeInn[] = runder;
const PAR = [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4];
const EKSTRA = [0, 0, -1, 1, 0, 0, 1, 0, 0, 0, 1, 0, -1, 1, 0, 0, 0, 1];
const hullRader: HullRadInn[] = Array.from({ length: 9 }, (_, r) => PAR.map((par, h) => ({
  holeNumber: h + 1, par, strokes: par + ((EKSTRA[h]! + r + h) % 3 === 0 ? EKSTRA[h]! : 0), roundId: `h${r}`, courseName: "Fredrikstad GK",
  playedAt: new Date(Date.UTC(2026, 3 + Math.floor(r / 2), 12)),
}))).flat();
const siste = { bane: "Fredrikstad GK", dato: "4. okt.", brutto: 72, motPar: 0, hull: PAR.map((par, i) => ({ nr: i + 1, par, slag: par + [0, 0, -1, 0, 0, 1, 1, 0, 0, 0, 0, 0, -1, 1, 0, 0, 0, -1][i]! })) };
const stats = byggPH16Stats({ navn: "Øyvind Rohjan", runder, tmSlag: [] });
const data: HullData = {
  kategori: "C", ...byggHullSoner(stats, sgRunder),
  trening: { tee: { min: 130, okter: 3 }, innspill: { min: 400, okter: 7 }, naer: { min: 255, okter: 5 }, putt: { min: 230, okter: 6 } },
  treningPeriode: "5. sep.–5. okt.", varme: byggHullVarme(hullRader), runderMedHull: 9, siste,
};
const tomStats = byggPH16Stats({ navn: "Ny", runder: [], tmSlag: [] });
const tom: HullData = { kategori: null, ...byggHullSoner(tomStats, []), trening: null, treningPeriode: "5. sep.–5. okt.", varme: null, runderMedHull: 2, siste: null };

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH16dHull data={data} />),
  "hull-for-hull": skall(<PH16dHull data={data} start="hull" />),
  tom: skall(<PH16dHull data={tom} />),
  "tom-hull": skall(<PH16dHull data={tom} start="hull" />),
  laster: skall(<TmLaster tekst="Henter hullene" />),
  feil: skall(<SdFeil tittel="Hullene kunne ikke hentes" tekst="Rundene dine er trygge. Prøv igjen om litt." reset={() => {}} />),
};
