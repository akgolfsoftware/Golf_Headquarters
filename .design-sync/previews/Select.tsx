import { Select } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };
const etikett = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 };

/** Native select med chevron til høyre; valgt verdi settes med defaultValue. */
export function Standard() {
  return (
    <div style={boks}>
      <label htmlFor="sel-klubb" style={etikett}>Hjemmeklubb</label>
      <Select id="sel-klubb" defaultValue="gfgk">
        <option value="gfgk">Gamle Fredrikstad GK</option>
        <option value="onsoy">Onsøy GK</option>
        <option value="borregaard">Borregaard GK</option>
        <option value="moss">Moss & Rygge GK</option>
      </Select>
    </div>
  );
}

/** Periodene fra ordboka, slik de velges i årsplanen. */
export function Periode() {
  return (
    <div style={boks}>
      <label htmlFor="sel-periode" style={etikett}>Periode</label>
      <Select id="sel-periode" defaultValue="SPESIAL">
        <option value="GRUNN">Grunn</option>
        <option value="SPESIAL">Spesial</option>
        <option value="TURNERING">Turnering</option>
        <option value="EVALUERING">Evaluering</option>
        <option value="TESTUKE">Testuke</option>
        <option value="FERIE">Ferie</option>
      </Select>
    </div>
  );
}

/** Ingen verdi valgt ennå: første option er en deaktivert plassholder med tom verdi. */
export function Plassholder() {
  return (
    <div style={boks}>
      <label htmlFor="sel-tee" style={etikett}>Tee</label>
      <Select id="sel-tee" defaultValue="">
        <option value="" disabled>Velg tee …</option>
        <option value="60">Tee 60 · hvit</option>
        <option value="56">Tee 56 · gul</option>
        <option value="52">Tee 52 · rød</option>
        <option value="46">Tee 46 · oransje</option>
      </Select>
    </div>
  );
}

export function Deaktivert() {
  return (
    <div style={boks}>
      <label htmlFor="sel-coach" style={etikett}>Coach</label>
      <Select id="sel-coach" defaultValue="ak" disabled>
        <option value="ak">Anders Kristiansen</option>
      </Select>
    </div>
  );
}
