import { KvitteringKort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };

/** Betalt kvittering: linjer med beløp i mono, sum og dato nederst. */
export function Betalt() {
  return (
    <div style={boks}>
      <KvitteringKort
        tittel="Kvittering"
        nr="2026-0412"
        dato="1. september 2026"
        status="Betalt"
        linjer={[
          { l: "PlayerHQ FULL — månedlig", v: "299,00" },
          { l: "Privattime 90 min — nærspill", v: "2 500,00" },
        ]}
        sum="2 799,00"
        valuta="kr"
      />
    </div>
  );
}

/** Årsabonnement: én linje, sum lik linjen. */
export function Aarsabonnement() {
  return (
    <div style={boks}>
      <KvitteringKort
        tittel="Kvittering"
        nr="2026-0388"
        dato="15. august 2026"
        status="Betalt"
        linjer={[{ l: "PlayerHQ FULL — årlig", v: "2 690,00" }]}
        sum="2 690,00"
        valuta="kr"
      />
    </div>
  );
}

/** Coaching-pakke med tre linjer. */
export function CoachingPakke() {
  return (
    <div style={boks}>
      <KvitteringKort
        tittel="Kvittering"
        nr="2026-0431"
        dato="15. september 2026"
        status="Betalt"
        linjer={[
          { l: "Performance — september", v: "1 200,00" },
          { l: "TrackMan-økt 60 min", v: "950,00" },
          { l: "Rangeballer, 3 kurver", v: "180,00" },
        ]}
        sum="2 330,00"
        valuta="kr"
      />
    </div>
  );
}
