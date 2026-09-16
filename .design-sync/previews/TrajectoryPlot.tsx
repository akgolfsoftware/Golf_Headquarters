import { TrajectoryPlot } from "akgolf-hq-komponenter";

/** Kanonisk bruk: 7-jern, seks siste slag — det beste tegnes i fill, resten mute. */
export function SyvJern() {
  return (
    <TrajectoryPlot
      kolle="7-jern"
      grunnlag="6 siste slag · TrackMan"
      baner={[
        { carry: 148, apex: 24 }, { carry: 155, apex: 28 }, { carry: 152, apex: 26 },
        { carry: 158, apex: 30, beste: true }, { carry: 144, apex: 21 }, { carry: 151, apex: 25 },
      ]}
    />
  );
}

/** Driver: lengre carry og høyere apex — tick-merkene 50/100/150 m følger skalaen. */
export function Driver() {
  return (
    <TrajectoryPlot
      kolle="Driver"
      grunnlag="8 siste slag · TrackMan"
      baner={[
        { carry: 228, apex: 29 }, { carry: 236, apex: 33 }, { carry: 241, apex: 31 }, { carry: 248, apex: 35, beste: true },
        { carry: 231, apex: 27 }, { carry: 244, apex: 32 }, { carry: 225, apex: 30 }, { carry: 239, apex: 34 },
      ]}
    />
  );
}

/** Wedge: kort carry med høy bue — bare 50 m-merket får plass. */
export function Wedge() {
  return (
    <TrajectoryPlot
      kolle="56°"
      grunnlag="5 siste slag · TrackMan"
      baner={[
        { carry: 78, apex: 24 }, { carry: 82, apex: 26 }, { carry: 84, apex: 27, beste: true },
        { carry: 76, apex: 22 }, { carry: 80, apex: 25 },
      ]}
    />
  );
}

/** Ingen baner for køllen ennå. */
export function Tom() {
  return <TrajectoryPlot kolle="3-tre" baner={[]} />;
}
