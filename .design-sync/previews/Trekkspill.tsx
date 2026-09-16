import { Trekkspill } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };

const ANALYSE = [
  {
    t: "Hvordan beregnes Strokes Gained?",
    c: "Hvert slag sammenlignes med forventet antall slag fra samme avstand og underlag. Summen per runde er SG totalt — positivt tall betyr at du vinner slag mot referansen.",
  },
  {
    t: "Hva er forskjellen på Carry og Total?",
    c: "Carry er lengden ballen flyr før den lander. Total tar med rullen. Planen bruker Carry, fordi det er den du styrer med svingen.",
  },
  {
    t: "Hvorfor står det dato og kilde ved hvert tall?",
    c: "Alt appen påstår om deg skal kunne spores til en måling. Tall uten måling merkes som eksempel eller estimat.",
  },
];

/** Hjelp i Analyse: én seksjon åpen (chevron opp i fill), de andre lukket. */
export function EnAapen() {
  return (
    <div style={boks}>
      <Trekkspill items={[{ ...ANALYSE[0], open: true }, ANALYSE[1], ANALYSE[2]]} />
    </div>
  );
}

/** Alle lukket: ingen open-flagg — bare titler og chevron ned. */
export function AlleLukket() {
  return (
    <div style={boks}>
      <Trekkspill items={ANALYSE} />
    </div>
  );
}

/** Forelderflaten: samtykkespørsmål, andre seksjon åpen. */
export function Foreldre() {
  return (
    <div style={boks}>
      <Trekkspill
        items={[
          { t: "Hvem ser barnets treningsdata?", c: "Bare barnet, du som forelder og coachen. Organisasjoner som WANG og Team Norway ser bare det du eksplisitt deler." },
          { t: "Hva kan deles med skolen?", c: "Tester, turneringer og statistikk kan deles gratis. Treningsplan og TrackMan krever full profil og et eget ja fra deg.", open: true },
          { t: "Kan jeg trekke samtykket?", c: "Ja, når som helst under Personvern og deling. Delingen stopper med en gang." },
        ]}
      />
    </div>
  );
}
