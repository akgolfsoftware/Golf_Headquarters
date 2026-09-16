import { MndKalender } from "akgolf-hq-komponenter";

const boks = { maxWidth: 400 };

const SEPTEMBER = [
  { date: 1, oktAntall: 1 }, { date: 2, oktAntall: 2 }, { date: 3, oktAntall: 1 }, { date: 5, oktAntall: 3 },
  { date: 7, oktAntall: 1 }, { date: 8, oktAntall: 2 }, { date: 9, oktAntall: 1 }, { date: 10, oktAntall: 2 },
  { date: 12, oktAntall: 3 }, { date: 14, oktAntall: 1 }, { date: 15, oktAntall: 1 }, { date: 16, oktAntall: 2, today: true },
  { date: 17, oktAntall: 1 }, { date: 19, oktAntall: 1 }, { date: 20, oktAntall: 1 },
];

/** September 2026 (month er 0-basert): varme etter øktmengde, i dag 16. med fyllkant. */
export function September2026() {
  return (
    <div style={boks}>
      <MndKalender year={2026} month={8} days={SEPTEMBER} />
    </div>
  );
}

/** Valgt dag (18.) fylles med tekstfarge — varmen skjules på den valgte. */
export function MedValgtDag() {
  return (
    <div style={boks}>
      <MndKalender year={2026} month={8} days={SEPTEMBER} valgt={18} onChange={() => {}} />
    </div>
  );
}

/** Oktober uten økter: bare rutenett og datoer, ingen varme, ingen prikker. */
export function TomMaaned() {
  return (
    <div style={boks}>
      <MndKalender year={2026} month={9} days={[]} />
    </div>
  );
}
