import { SlagLekkasje } from "akgolf-hq-komponenter";

const BAAND = [
  { id: "tee", label: "Tee-slag", sg: 0.2, slag: 98 },
  { id: "app150", label: "Innspill 150–100 m", sg: -0.8, slag: 62 },
  { id: "app100", label: "Innspill 100–50 m", sg: -0.3, slag: 44 },
  { id: "arg", label: "Nærspill", sg: 0.1, slag: 51 },
  { id: "putt6", label: "Putting 0–6 ft", sg: -0.6, slag: 88 },
];

/** Heat per avstandsbånd: rødt der slagene forsvinner, grønt der de hentes, sum per runde nederst. */
export function Standard() {
  return <SlagLekkasje baand={BAAND} baseline="Broadie scratch" grunnlag="14 runder" />;
}

/** Trykkbar analytikerkjede: valgt bånd får kant, hint nederst til høyre. */
export function Valgt() {
  return (
    <SlagLekkasje
      baand={BAAND}
      valgtId="app150"
      onVelgBaand={() => {}}
      baseline="Broadie scratch"
      grunnlag="14 runder"
      tittel="Hvor slagene forsvinner"
    />
  );
}

/** Manuelle detaljområder som overlapper: to desimaler og ingen sum. */
export function Detaljomrader() {
  return (
    <SlagLekkasje
      tittel="Putting i detalj"
      baand={[
        { id: "p3", label: "Putt 3–6 ft", sg: -0.04, slag: 41 },
        { id: "p6", label: "Putt 6–10 ft", sg: -0.11, slag: 36 },
        { id: "p10", label: "Putt 10–20 ft", sg: 0.03, slag: 29 },
        { id: "lag", label: "Lag-putt over 20 ft", sg: -0.08, slag: 65 },
      ]}
      desimaler={2}
      visSum={false}
      baseline="eget snitt 2025"
      grunnlag="20 runder"
    />
  );
}

/** Sterk periode: alle bånd henter slag, summen grønn. */
export function Positiv() {
  return (
    <SlagLekkasje
      tittel="Slagene hentes inn"
      baand={[
        { id: "tee", label: "Tee-slag", sg: 0.5, slag: 84 },
        { id: "app", label: "Innspill 150–50 m", sg: 0.7, slag: 90 },
        { id: "arg", label: "Nærspill", sg: 0.2, slag: 38 },
        { id: "putt", label: "Putting", sg: 0.4, slag: 176 },
      ]}
      baseline="Broadie scratch"
      grunnlag="6 runder · august"
    />
  );
}
