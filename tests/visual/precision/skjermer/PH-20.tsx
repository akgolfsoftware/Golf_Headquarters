/** Prøvefil for PH-20 Gameplan i nytt design. Bare syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Gameplan } from "@/components/portal/precision/PH20Gameplan";
import { PHIupLaster } from "@/components/portal/precision/PHIupTilstand";
import type { GameplanCourseItem } from "@/lib/portal-gameplan/ph20-data";

export const sti = "/portal/gameplan";

const hull: Array<[number, number]> = [[4, 352], [3, 158], [5, 471], [4, 338], [4, 395], [3, 172], [4, 362], [5, 488], [4, 326], [4, 371], [3, 145], [4, 402], [5, 455], [4, 318], [3, 188], [4, 344], [4, 381], [5, 492]];
const baner: GameplanCourseItem[] = [
  { id: "syn-fgk", name: "Fredrikstad GK", tee: "Gul tee", par: 72, len: 6286, played: 6, avg: 72.4, plan: "Gameplan klar", holes: hull.map(([par, len]) => ({ par, len, avgScoreDiff: 0 })) },
  { id: "syn-bgk", name: "Borregaard GK", tee: "Gul tee", par: 71, len: 5980, played: 0, avg: null, plan: "Ingen gameplan", holes: [] },
];

const Vis = (p: Partial<Parameters<typeof PH20Gameplan>[0]>) => <PlayerHQSkall innboksHref="#" uleste={0}><PH20Gameplan courses={baner} {...p} /></PlayerHQSkall>;

export const tilstander = {
  data: <Vis />,
  hull: <Vis startHull={6} />,
  utenHull: <Vis defaultCourseId="syn-bgk" />,
  tom: <Vis tilstand="tom" courses={[]} />,
  laster: <PlayerHQSkall innboksHref="#" uleste={0}><PHIupLaster tekst="Henter banen …" /></PlayerHQSkall>,
  feil: <Vis tilstand="feil" />,
};
