import { Periodeplan } from "akgolf-hq-komponenter";

const FASER_2026 = [
  { navn: "Grunnperiode", fraUke: 1, uker: 14 },
  { navn: "Spesialiseringsperiode", fraUke: 15, uker: 12 },
  { navn: "Turneringsperiode", fraUke: 27, uker: 16 },
  { navn: "Evaluering", fraUke: 43, uker: 10 },
];

const TURNERINGER = [
  { navn: "Norgescup 1", uke: 24, prio: "B" },
  { navn: "NM junior", uke: 30, prio: "A" },
  { navn: "Klubbmesterskap", uke: 34, prio: "C" },
  { navn: "Norgescup-finale", uke: 38, prio: "A" },
];

/** Årsplan 2026: fire perioder fra ordboka som gantt, turneringer med prioritet A/B/C under, måneder nederst. */
export function Aarsplan2026() {
  return <Periodeplan faser={FASER_2026} turneringer={TURNERINGER} />;
}

/** Uten turneringer: bare periodebaren og månedsaksen. */
export function UtenTurneringer() {
  return <Periodeplan faser={FASER_2026} turneringer={[]} />;
}

/** Vårhalvåret alene (26 uker, to perioder, én turnering). */
export function VaarHalvaar() {
  return (
    <Periodeplan
      totalUker={26}
      maaneder={["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"]}
      faser={[{ navn: "Grunnperiode", fraUke: 1, uker: 14 }, { navn: "Spesialiseringsperiode", fraUke: 15, uker: 12 }]}
      turneringer={[{ navn: "Norgescup 1", uke: 24, prio: "B" }]}
    />
  );
}
