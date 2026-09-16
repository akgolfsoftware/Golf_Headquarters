import { Radio, RadioGroup } from "akgolf-hq-komponenter";

const rad = { display: "flex", alignItems: "center", gap: 10, fontSize: 14, lineHeight: 1.4, cursor: "pointer" };

/** Standard: vertikal, 8 px mellom valgene. Periodene fra ordboka. */
export function Vertikal() {
  const perioder = ["Grunn", "Spesial", "Turnering", "Evaluering"];
  return (
    <RadioGroup aria-label="Periode">
      {perioder.map((p, i) => (
        <label key={p} style={rad}>
          <Radio name="periode" checked={i === 1} readOnly />
          {p}
        </label>
      ))}
    </RadioGroup>
  );
}

/** orientation="horizontal": valgene på rad, bryter linje når det blir trangt. */
export function Horisontal() {
  return (
    <RadioGroup orientation="horizontal" aria-label="Antall hull" style={{ columnGap: 24 }}>
      <label style={rad}>
        <Radio name="hull" checked={false} readOnly />
        9 hull
      </label>
      <label style={rad}>
        <Radio name="hull" checked readOnly />
        18 hull
      </label>
    </RadioGroup>
  );
}

/** Hvem ser på? Pressnivået for økta, med forklaring under hvert valg. */
export function MedBeskrivelse() {
  const niva = [
    { t: "Alene", s: "Ingen ser på" },
    { t: "Observert", s: "Coach eller medspiller følger med" },
    { t: "Konkurranse", s: "Mot en annen spiller, med tellende resultat" },
    { t: "Turnering", s: "Offisiell runde i GolfBox" },
  ];
  return (
    <RadioGroup aria-label="Press" style={{ maxWidth: 420 }}>
      {niva.map((n, i) => (
        <label key={n.t} style={{ ...rad, alignItems: "flex-start", padding: "6px 0" }}>
          <Radio name="press" checked={i === 2} readOnly className="mt-0.5" />
          <span>
            <span style={{ display: "block", fontWeight: 600 }}>{n.t}</span>
            <span style={{ display: "block", fontSize: 12, color: "var(--tl-mute)" }}>{n.s}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
