import { Input } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };
const etikett = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 };

/** Tomt felt med plassholder. Etiketten er en vanlig <label> — Input har ingen egen. */
export function Tom() {
  return (
    <div style={boks}>
      <label htmlFor="inp-fornavn" style={etikett}>Fornavn</label>
      <Input id="inp-fornavn" placeholder="Slik det står i GolfBox" />
    </div>
  );
}

export function Utfylt() {
  return (
    <div style={boks}>
      <label htmlFor="inp-navn" style={etikett}>Navn</label>
      <Input id="inp-navn" defaultValue="Øyvind Rohjan" />
    </div>
  );
}

/** Målte tall i IBM Plex Mono (className="font-mono") og numerisk tastatur på mobil — slik en runde føres. */
export function MaalteTall() {
  return (
    <div style={{ ...boks, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <label htmlFor="inp-score" style={etikett}>Score</label>
        <Input id="inp-score" className="font-mono tabular-nums" inputMode="numeric" defaultValue="74" />
      </div>
      <div>
        <label htmlFor="inp-putt" style={etikett}>Putter</label>
        <Input id="inp-putt" className="font-mono tabular-nums" inputMode="numeric" defaultValue="31" />
      </div>
    </div>
  );
}

/** Søkefelt øverst i Stall. */
export function Sok() {
  return (
    <div style={boks}>
      <Input type="search" placeholder="Søk spiller, økt eller øvelse …" aria-label="Søk" />
    </div>
  );
}

export function Deaktivert() {
  return (
    <div style={boks}>
      <label htmlFor="inp-klubb" style={etikett}>Klubb</label>
      <Input id="inp-klubb" defaultValue="Gamle Fredrikstad GK" disabled />
    </div>
  );
}
