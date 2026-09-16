import { InspektorBlokk, InspektorKpi, InspektorLinje, Inspektorpanel, StatusPill } from "akgolf-hq-komponenter";

const boks = { maxWidth: 380 };
const kpiRad = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };
const tekst = { margin: 0, fontFamily: "var(--tl-font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--tl-text)" };

/** Blokk = Caps-etikett over innhold med 8 px gap. To blokker med nøkkel/verdi-linjer i spillerpanelet i stallen. */
export function MedLinjer() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Øyvind Rohjan" tag={<StatusPill tone="up">I rute</StatusPill>}>
        <InspektorBlokk label="Denne uka">
          <InspektorLinje label="Økter fullført" verdi="5 av 6" />
          <InspektorLinje label="Neste økt" verdi="Torsdag 16:00" />
          <InspektorLinje label="Sist aktiv" verdi="i går" />
        </InspektorBlokk>
        <InspektorBlokk label="Siste 30 dager">
          <InspektorLinje label="SG totalt" verdi="+1,8" />
          <InspektorLinje label="Snittscore" verdi="74,3" />
          <InspektorLinje label="Putt per runde" verdi="31,2" />
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}

/** Blokk rundt en KPI-rad: etiketten over, flisene i to kolonner under. */
export function MedKpi() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Køen i tall">
        <InspektorBlokk label="Venter på deg">
          <div style={kpiRad}>
            <InspektorKpi label="Saker" verdi="3" sub="2 ukeplaner · 1 booking" />
            <InspektorKpi label="Eldste" verdi="2 d" sub="ukeplan uke 38" />
          </div>
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}

/** Blokker med fritekst: spillerens vurdering og coachens notat, den andre med egen style (hårlinje over). */
export function MedTekst() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Wedge 60–100 m · 60 slag" tag={<StatusPill tone="warm">Fullført</StatusPill>}>
        <InspektorBlokk label="Spillerens vurdering">
          <p style={tekst}>Traff Carry-målet på 7 av 10. Slo tynt de siste ti slagene da jeg ble sliten.</p>
        </InspektorBlokk>
        <InspektorBlokk label="Coachens notat" style={{ paddingTop: 12, borderTop: "1px solid var(--tl-hair)" }}>
          <p style={tekst}>God kontroll fram til tretthet. Neste gang: 40 slag med pause etter 20.</p>
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}
