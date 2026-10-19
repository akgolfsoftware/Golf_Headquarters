/** Prøvefil for PH-11-MAL-IUP IUP-måltall (plan.html, mal «iup»). Syntetiske tall fra utkastet: skoleåret 2026/27, K1. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHIupMaaltall } from "@/components/portal/precision/PHIupMaaltall";
import { byggMaaltall, sesongFor, type MaaltallRunde } from "@/lib/iup/maaltall";

export const sti = "/portal/mal/maaltall";

const sesong = sesongFor("2026-10-05");
const hull = (n: number) => Array.from({ length: n }, (_, i) => ({ par: 4, strokes: i % 3 ? 4 : 5, firstPuttFt: (i % 6) * 4 + 1, putts: i % 4 ? 2 : 1, fairway: i % 2 === 0, gir: i % 3 !== 0 }));
const runde = (dato: string, score: number, turnering: boolean, sg: number): MaaltallRunde => ({
  dato, score, turnering, konkurranseId: turnering ? dato : null, sgTotal: sg, sgOtt: 0.2, sgApp: -0.9, sgArg: -0.4, sgPutt: 0, hull: hull(18),
});
const rader = byggMaaltall({
  sesong, idag: "2026-10-05",
  runder: [runde("2026-08-12", 74, true, -1.3), runde("2026-08-30", 73, true, -1.1), runde("2026-09-14", 72, false, -0.9), runde("2026-09-20", 70, true, -0.8)],
  okter: [{ dato: "2026-09-01", fys: false, minutter: 4320 }, { dato: "2026-09-02", fys: true, minutter: 882 }],
  mal: new Map([["ranking-ngf", "20"], ["snitt-turnering", "72,5"], ["sg-totalt", "−0,5"], ["sg-innspill", "−0,4"], ["putt-3-5", "93 %"], ["konkurranser", "10"], ["treningstid-golf", "400 t"]]),
});

function Vis({ medMal = true }: { medMal?: boolean }) {
  return <PlayerHQSkall innboksHref="#" uleste={2}>
    <PHIupMaaltall tilbake="#" data={{ sesong, org: "WANG Toppidrett", rader: medMal ? rader : rader.map((r) => ({ ...r, mal: null })) }} />
  </PlayerHQSkall>;
}

export const tilstander = {
  data: <Vis />,
  utenMal: <Vis medMal={false} />,
};
