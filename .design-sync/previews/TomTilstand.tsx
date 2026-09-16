import { Kort, TomTilstand } from "akgolf-hq-komponenter";

/** Tom tilstand med én vei videre i teksten. Ikonsirkel 32 px, tittel 14,5/600, forklaring maks 44 tegn per linje. */
export function Standard() {
  return (
    <TomTilstand
      icon="calendar"
      title="Ingen økter denne uka"
      sub="Kopier forrige uke, eller be Anders om et forslag til torsdag og lørdag."
    />
  );
}

export function KunTittel() {
  return <TomTilstand icon="search" title="Ingen treff på «wedge 40 m»" />;
}

/** Slik den står inne i et kort som ennå ikke har data. */
export function IKort() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Kort eyebrow="TrackMan">
        <TomTilstand
          icon="radar"
          title="Ingen TrackMan-økter ennå"
          sub="Last opp CSV-en fra økta, eller ta bilde av skjermen etter neste økt."
        />
      </Kort>
    </div>
  );
}
