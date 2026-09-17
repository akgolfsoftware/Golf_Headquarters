import { DeltaChip, InspektorBlokk, InspektorLinje, Inspektorpanel, StatusPill } from "akgolf-hq-komponenter";

const boks = { maxWidth: 380 };

/** Nøkkel til venstre i Poppins, verdi i mono til høyre — slik detaljblokken i panelet er bygd. */
export function NokkelVerdi() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Booking · lørdag 20. september">
        <InspektorBlokk label="Detaljer">
          <InspektorLinje label="Tid" verdi="10:00–11:30" />
          <InspektorLinje label="Sted" verdi="Mulligan Indoor Golf" />
          <InspektorLinje label="Type" verdi="Enkelttime 90 min" />
          <InspektorLinje label="Pris" verdi="2 500 kr" />
          <InspektorLinje label="Betalt" verdi="Nei" />
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}

/** Lang etikett klippes med ellipse; verdien er flex:none og står alltid hel. */
export function LangEtikett() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Siste TrackMan-økt">
        <InspektorBlokk label="Mulligan Indoor Golf · 12. sep">
          <InspektorLinje label="Carry med 56° wedge fra 90 m, snitt av 60 slag i økta" verdi="88,4 m" />
          <InspektorLinje label="Attack Angle" verdi="−5,1°" />
          <InspektorLinje label="Spin Rate" verdi="9 120" />
          <InspektorLinje label="Smash Factor" verdi="1,12" />
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}

/** Verdien er ReactNode: StatusPill eller DeltaChip i stedet for mono-tekst. */
export function MedPille() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Ukeplan uke 37 · Øyvind Rohjan">
        <InspektorBlokk label="Status per økt">
          <InspektorLinje label="Wedge 60–100 m" verdi={<StatusPill tone="warm">Fullført</StatusPill>} />
          <InspektorLinje label="Putting · 3 m lag-drill" verdi={<StatusPill tone="warm">Fullført</StatusPill>} />
          <InspektorLinje label="Styrke · underkropp" verdi={<StatusPill tone="down">Avlyst</StatusPill>} />
          <InspektorLinje label="SG mot forrige uke" verdi={<DeltaChip v="+0,4" dir="up" />} />
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}
