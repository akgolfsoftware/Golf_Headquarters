import { DagStripe } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

const DENNE_UKA = [
  { dow: "M", date: 14, state: "done" as const },
  { dow: "T", date: 15, state: "done" as const },
  { dow: "O", date: 16, today: true },
  { dow: "T", date: 17 },
  { dow: "F", date: 18 },
  { dow: "L", date: 19 },
  { dow: "S", date: 20 },
];

/** Uke 38: mandag og tirsdag gjennomført (prikk), i dag onsdag 16. valgt. */
export function DenneUka() {
  return (
    <div style={boks}>
      <DagStripe days={DENNE_UKA} value={16} onChange={() => {}} />
    </div>
  );
}

/** Fredag valgt mens i dag fortsatt er onsdag — i dag-prikken blir stående på 16. */
export function ValgtFremover() {
  return (
    <div style={boks}>
      <DagStripe days={DENNE_UKA} value={18} onChange={() => {}} />
    </div>
  );
}

/** Neste uke: ingen gjennomført, ingen i dag. Uten verdi velges første dag. */
export function NesteUke() {
  return (
    <div style={boks}>
      <DagStripe
        days={[
          { dow: "M", date: 21 },
          { dow: "T", date: 22 },
          { dow: "O", date: 23 },
          { dow: "T", date: 24 },
          { dow: "F", date: 25 },
          { dow: "L", date: 26 },
          { dow: "S", date: 27 },
        ]}
        value={null}
      />
    </div>
  );
}
