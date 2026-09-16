import { Trend } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };

/** SG per runde, siste 10 runder, baseline 0 = eget snitt. Standardformat er fmtSg (fortegn, komma). */
export function SgSiste10() {
  return (
    <div style={boks}>
      <Trend series={[-1.2, -0.8, -1.5, -0.3, 0.2, -0.6, 0.4, 0.9, 0.3, 1.1]} yMin={-2} yMax={2} height={120} xLabels={["R1", "R5", "R10"]} />
    </div>
  );
}

/** Score per runde: heltall via fmt, baseline 0 ligger utenfor området og tegnes ikke. */
export function Score() {
  return (
    <div style={boks}>
      <Trend series={[78, 75, 79, 74, 73, 76, 72, 74, 71, 73]} yMin={70} yMax={80} height={120} fmt={(v) => String(Math.round(v))} xLabels={["06.09", "14.09"]} />
    </div>
  );
}

/** Kompakt høyde (52 px) i Stall-listen og fremgangs-kortene — samme bredde, lavere kurve. */
export function Kompakt() {
  return (
    <div style={boks}>
      <Trend series={[-0.4, 0.1, -0.2, 0.6, 0.3, 0.8, 0.5, 1.0]} height={52} yMin={-1} yMax={1.2} />
    </div>
  );
}
