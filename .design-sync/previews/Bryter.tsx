import { Bryter } from "akgolf-hq-komponenter";

const boks = { maxWidth: 400 };

/** På = fill-farge, knott til høyre. */
export function Paa() {
  return (
    <div style={boks}>
      <Bryter label="Varsle meg før økter" sub="Push-varsel 30 minutter før" defaultChecked />
    </div>
  );
}

export function Av() {
  return (
    <div style={boks}>
      <Bryter label="Del fremgang med forelder" sub="Foreldreportalen viser ukesstatus og neste økt" defaultChecked={false} />
    </div>
  );
}

/** Uten undertekst, kontrollert med statisk verdi. */
export function UtenSub() {
  return (
    <div style={boks}>
      <Bryter label="Mørk modus" sub={null} checked onChange={() => {}} />
    </div>
  );
}

/** Varselinnstillinger slik de står på Meg-fanen. */
export function Innstillinger() {
  return (
    <div style={{ ...boks, display: "flex", flexDirection: "column", gap: 4 }}>
      <Bryter label="Påminnelse før økt" sub="30 minutter før planlagt start" defaultChecked />
      <Bryter label="Ukesoppsummering" sub="Søndag kveld, e-post" defaultChecked />
      <Bryter label="Turneringsresultater" sub="Når GolfBox har publisert scoren" defaultChecked={false} />
      <Bryter label="Melding fra coach" sub="Push og e-post" defaultChecked />
    </div>
  );
}
