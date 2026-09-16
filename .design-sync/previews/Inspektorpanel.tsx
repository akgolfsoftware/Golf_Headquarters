import { InspektorBlokk, InspektorKpi, InspektorLinje, Inspektorpanel, Knapp, StatusPill } from "akgolf-hq-komponenter";

const boks = { maxWidth: 380 };
const kpiRad = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };
const tekst = { margin: 0, fontFamily: "var(--tl-font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--tl-text)" };

/** Godkjenning i køen: tittel og status-tag i hodet, «Uka i tall» som KPI-rad, detaljer som linjer, to handlinger som deler foten likt. */
export function Godkjenning() {
  return (
    <div style={boks}>
      <Inspektorpanel
        tittel="Ukeplan uke 38 · Øyvind Rohjan"
        tag={<StatusPill tone="warn">Venter</StatusPill>}
        fot={
          <>
            <Knapp ghost>Be om endring</Knapp>
            <Knapp icon="check">Godkjenn</Knapp>
          </>
        }
      >
        <InspektorBlokk label="Uka i tall">
          <div style={kpiRad}>
            <InspektorKpi label="Økter" verdi="6" sub="4 planlagt · 2 utkast" />
            <InspektorKpi label="Timer" verdi="9,5" sub="mot 8 t i årsplanen" />
          </div>
        </InspektorBlokk>
        <InspektorBlokk label="Detaljer">
          <InspektorLinje label="Sendt inn" verdi="i går 21:14" />
          <InspektorLinje label="Periode" verdi="Grunnperiode" />
          <InspektorLinje label="Fasilitet" verdi="Range, GFGK" />
          <InspektorLinje label="Turnering i uka" verdi="Nei" />
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}

/** Valgt økt i Workbench: målet som tekst, TrackMan-mål som linjer, én handling i foten. */
export function Okt() {
  return (
    <div style={boks}>
      <Inspektorpanel
        tittel="Wedge 60–100 m · 60 slag"
        tag={<StatusPill tone="up">Publisert</StatusPill>}
        fot={<Knapp icon="play">Åpne i Workbench</Knapp>}
      >
        <InspektorBlokk label="Mål">
          <p style={tekst}>Carry 90 m ± 5 på 8 av 10 slag. Lav fart de første 20 slagene, full fart de siste 40.</p>
        </InspektorBlokk>
        <InspektorBlokk label="TrackMan-mål">
          <InspektorLinje label="Carry" verdi="90 m ± 5" />
          <InspektorLinje label="Attack Angle" verdi="−4° til −6°" />
          <InspektorLinje label="Spin Rate" verdi="8 500–9 500" />
          <InspektorLinje label="Launch Angle" verdi="28–32°" />
        </InspektorBlokk>
        <InspektorBlokk label="Når og hvor">
          <InspektorLinje label="Torsdag 18. september" verdi="16:00–17:30" />
          <InspektorLinje label="Sted" verdi="Range, GFGK" />
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}

/** Mal i planbiblioteket: tre KPI-fliser i rad og fordeling som linjer — ingen fot, panelet slutter etter innholdet. */
export function MalUtenFot() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Mal · Grunnuke junior" tag={<StatusPill>Mal</StatusPill>}>
        <InspektorBlokk label="Innhold">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            <InspektorKpi label="Økter" verdi="5" sub="per uke" />
            <InspektorKpi label="Timer" verdi="7,5" sub="per uke" />
            <InspektorKpi label="Brukt" verdi="12" sub="ganger" />
          </div>
        </InspektorBlokk>
        <InspektorBlokk label="Fordeling">
          <InspektorLinje label="Teknikk" verdi="2 økter" />
          <InspektorLinje label="Slag" verdi="1 økt" />
          <InspektorLinje label="Spill" verdi="1 økt" />
          <InspektorLinje label="Fysisk" verdi="1 økt" />
        </InspektorBlokk>
        <InspektorBlokk label="Sist brukt">
          <InspektorLinje label="WANG VG2 · uke 36" verdi="Anders Kristiansen" />
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}
