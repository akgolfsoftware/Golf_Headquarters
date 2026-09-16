import { Checkbox } from "akgolf-hq-komponenter";

const rad = { display: "flex", alignItems: "center", gap: 10, fontSize: 14, lineHeight: 1.4, cursor: "pointer" };

/** Visuell tilstand følger `checked` — send alltid kontrollert (readOnly i statiske eksempler). Etiketten er en vanlig <label>. */
export function Umerket() {
  return (
    <label style={rad}>
      <Checkbox checked={false} readOnly />
      Send meg ukesoppsummering på e-post
    </label>
  );
}

/** Avkrysset: fylt boks i primærfargen med hvit hake, 20 px boks og 40 px treffmål. */
export function Avkrysset() {
  return (
    <label style={rad}>
      <Checkbox checked readOnly />
      Del fremgang med forelder
    </label>
  );
}

/** Øvelser valgt inn i økta — slik coach setter sammen en Workbench-økt. */
export function Ovelsesvalg() {
  const ovelser = [
    { t: "Wedge 60–100 m · 20 min", v: true },
    { t: "Putting 1–2 m · 15 min", v: true },
    { t: "Bunkerslag · 10 min", v: false },
    { t: "Driver, Club Speed-serie · 15 min", v: true },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
      {ovelser.map((o) => (
        <label key={o.t} style={rad}>
          <Checkbox checked={o.v} readOnly />
          {o.t}
        </label>
      ))}
    </div>
  );
}

/** Ukedager for en serie — kort etikett over boksen, horisontalt. */
export function Ukedager() {
  const dager = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];
  const valgt = new Set(["Ti", "To", "Lø"]);
  return (
    <div style={{ display: "flex", gap: 18 }}>
      {dager.map((d) => (
        <label
          key={d}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 12, color: "var(--tl-mute)", cursor: "pointer" }}
        >
          {d}
          <Checkbox checked={valgt.has(d)} readOnly />
        </label>
      ))}
    </div>
  );
}
