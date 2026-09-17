import { Ring } from "akgolf-hq-komponenter";

/** Prosessmål-ring: liten SVG-fremdriftsring med prosenttallet i midten. */
const rad = { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" as const };
const etikett = { fontFamily: "var(--tl-font-sans)", fontSize: 10.5, color: "var(--tl-mute)", lineHeight: 1.3 };
const MAAL: [string, number][] = [
  ["Putt < 3 m", 72],
  ["Nærspill-økter", 55],
  ["FYS-volum", 88],
];

/** Fremdrift 0–100 i standardstørrelse (34 px). */
export function Fremdrift() {
  return (
    <div style={rad}>
      {[0, 25, 55, 72, 100].map((p) => (
        <Ring key={p} pct={p} label={`${p} % av prosessmålet`} />
      ))}
    </div>
  );
}

/** Størrelser 24, 34, 48 og 64 px med samme fremdrift. */
export function Storrelser() {
  return (
    <div style={rad}>
      {[24, 34, 48, 64].map((s) => (
        <Ring key={s} pct={72} size={s} label="Putt < 3 m" />
      ))}
    </div>
  );
}

/** Slik MaalStripe bruker den: ring og etikett per prosessmål. */
export function MedEtikett() {
  return (
    <div style={rad}>
      {MAAL.map(([l, p]) => (
        <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <Ring pct={p} label={l} />
          <span style={etikett}>{l}</span>
        </span>
      ))}
    </div>
  );
}
