import { KodeInput } from "akgolf-hq-komponenter";

/** Tom kode: første boks har aktiv (lime) kant. */
export function Tom() {
  return <KodeInput label="Engangskode fra e-post" defaultValue="" />;
}

/** Tre av seks siffer skrevet — neste boks er markert. */
export function Delvis() {
  return <KodeInput label="Engangskode fra e-post" defaultValue="482" />;
}

export function Fullstendig() {
  return <KodeInput label="Engangskode fra e-post" defaultValue="482913" />;
}

/** Kortere kode (4 siffer) til forelder-bekreftelse. Kontrollert med statisk verdi. */
export function FireSiffer() {
  return <KodeInput label="Kode fra SMS" lengde={4} value="73" onChange={() => {}} />;
}
