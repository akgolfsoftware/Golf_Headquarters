import { StatStrip } from "akgolf-hq-komponenter";

/** Kanonisk bruk: sesongens nøkkeltall i én remse, enhet som liten mute-suffiks. */
export function Sesong() {
  return (
    <StatStrip
      items={[
        { l: "Runder", v: "14" },
        { l: "Snittscore", v: "73,4" },
        { l: "Beste runde", v: "68" },
        { l: "Putt per runde", v: "30,2" },
        { l: "Timer trent", v: "38,5", enhet: "t" },
      ]}
    />
  );
}

/** Med delta-chip per tall — `dir` styrer fargen (up = ok-grønn, down = danger-rød). */
export function MedDelta() {
  return (
    <StatStrip
      items={[
        { l: "SG Total", v: "+1,2", delta: "+0,4", dir: "up" },
        { l: "SG Driving", v: "−0,4", delta: "−0,2", dir: "down" },
        { l: "SG Approach", v: "+0,9", delta: "+0,5", dir: "up" },
        { l: "SG Putting", v: "+0,6", delta: "+0,3", dir: "up" },
      ]}
    />
  );
}

/** Manglende tall vises som tankestrek — aldri 0. */
export function Mangler() {
  return (
    <StatStrip
      items={[
        { l: "Runder", v: "3" },
        { l: "Snittscore", v: null },
        { l: "SG Total", v: null },
        { l: "Timer trent", v: "6,0", enhet: "t" },
      ]}
    />
  );
}

/** Kompakt: tre tall i en smal kolonne (spillerkort på mobil). */
export function TreTall() {
  return (
    <div style={{ maxWidth: 360 }}>
      <StatStrip items={[{ l: "Runder", v: "14" }, { l: "Snitt", v: "73,4" }, { l: "SG Total", v: "+1,2", delta: "+0,4", dir: "up" }]} />
    </div>
  );
}
