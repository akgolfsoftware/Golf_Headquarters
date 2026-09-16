import { Velger } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };
const KLUBBER = ["Gamle Fredrikstad GK", "Onsøy GK", "Borregaard GK", "Kongsvinger GK"];

export function Standard() {
  return (
    <div style={boks}>
      <Velger label="Klubb" options={KLUBBER} defaultValue="Gamle Fredrikstad GK" />
    </div>
  );
}

/** Id-basert valg: matching på value, aldri på visningsnavn. Kontrollert med statisk verdi. */
export function IdValg() {
  return (
    <div style={boks}>
      <Velger
        label="Coach"
        options={[
          { value: "ak", label: "Anders Kristiansen" },
          { value: "mrp", label: "Markus Røinås Pedersen" },
        ]}
        value="ak"
        onChange={() => {}}
      />
    </div>
  );
}

export function Feil() {
  return (
    <div style={boks}>
      <Velger
        label="Treningsområde"
        options={["Velg område", "Nærspill", "Tee-slag", "Innspill 100–150 m", "Putting"]}
        defaultValue="Velg område"
        feil="Velg et treningsområde før du lagrer økten."
      />
    </div>
  );
}

export function Deaktivert() {
  return (
    <div style={boks}>
      <Velger label="Coaching-pakke" options={["Performance", "Performance Pro"]} defaultValue="Performance" disabled />
    </div>
  );
}
