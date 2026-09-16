import { InspektorBlokk, InspektorKpi, Inspektorpanel } from "akgolf-hq-komponenter";

const boks = { maxWidth: 380 };
const kpiRad = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };

/** KPI-flis: Caps-etikett, verdi i mono 22 px, sub i mute — to i rad i «Køen i tall». */
export function ToIRad() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Køen i tall">
        <InspektorBlokk label="Siste 30 dager">
          <div style={kpiRad}>
            <InspektorKpi label="Avgjort" verdi="41" sub="38 godkjent · 3 sendt tilbake" />
            <InspektorKpi label="Svartid" verdi="1,4 d" sub="snitt fra sendt til svar" />
          </div>
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}

/** Tre i rad i 380 px: sub-teksten bryter inne i flisen, verdien holder én linje. */
export function TreIRad() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Øyvind Rohjan · siste 10 runder">
        <InspektorBlokk label="Målt">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            <InspektorKpi label="Snitt" verdi="74,3" sub="slag" />
            <InspektorKpi label="SG" verdi="+1,8" sub="mot eget snitt" />
            <InspektorKpi label="Putt" verdi="31,2" sub="per runde" />
          </div>
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}

/** Tom verdi vises som tankestrek — aldri 0 — med forklaringen i sub. */
export function Tom() {
  return (
    <div style={boks}>
      <Inspektorpanel tittel="Øyvind Rohjan · runder">
        <InspektorBlokk label="Siste 30 dager">
          <div style={kpiRad}>
            <InspektorKpi label="Runder" verdi="—" sub="Ingen runder registrert" />
            <InspektorKpi label="SG" verdi="—" sub="Trenger minst 3 runder" />
          </div>
        </InspektorBlokk>
      </Inspektorpanel>
    </div>
  );
}
