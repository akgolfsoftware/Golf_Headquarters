import { InspektorTom } from "akgolf-hq-komponenter";

const boks = { maxWidth: 380 };

/** Ingenting valgt i masterlista: stiplet dock-flate med tittel og én setning om hva som skjer når du velger. */
export function IngenValgt() {
  return (
    <div style={boks}>
      <InspektorTom tittel="Velg en sak" tekst="Klikk på en rad i køen for å se detaljer og avgjøre den her, uten å bytte side." />
    </div>
  );
}

/** Stallen uten valgt spiller. */
export function TomStall() {
  return (
    <div style={boks}>
      <InspektorTom tittel="Ingen spiller valgt" tekst="Velg en spiller i stallen for å se ukestatus, siste aktivitet og neste økt." />
    </div>
  );
}
