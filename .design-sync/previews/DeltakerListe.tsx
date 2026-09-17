import { DeltakerListe } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };

/** Gruppeøkt: spillere med bekreftet/venter/avbud, coach som vert. Teller i eyebrow. */
export function Gruppeokt() {
  return (
    <div style={boks}>
      <DeltakerListe
        tittel="Deltakere"
        deltakere={[
          { navn: "Øyvind Rohjan", rolle: "Spiller · WANG Toppidrett", status: "Bekreftet", tone: "up" },
          { navn: "Mina Solheim", rolle: "Spiller · WANG Toppidrett", status: "Bekreftet", tone: "up" },
          { navn: "Jonas Bergli", rolle: "Spiller · GFGK junior", status: "Venter", tone: "warn" },
          { navn: "Emil Haugen", rolle: "Spiller · GFGK junior", status: "Meldt avbud", tone: "down" },
          { navn: "Anders Kristiansen", rolle: "Coach", status: "Vert", tone: "lime" },
        ]}
      />
    </div>
  );
}

/** Ingen påmeldte ennå: tom tilstand inne i kortet. */
export function Tom() {
  return (
    <div style={boks}>
      <DeltakerListe tittel="Deltakere" deltakere={[]} />
    </div>
  );
}
