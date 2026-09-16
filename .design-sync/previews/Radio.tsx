import { Radio, RadioGroup } from "akgolf-hq-komponenter";

const rad = { display: "flex", alignItems: "center", gap: 10, fontSize: 14, lineHeight: 1.4, cursor: "pointer" };

/** Radio lever alltid i en RadioGroup. Visuell tilstand følger `checked`; nøyaktig én i gruppa er valgt. */
export function IGruppe() {
  const niva = ["Alene", "Observert av coach", "Konkurranse mot en annen spiller", "Turnering"];
  return (
    <RadioGroup aria-label="Press">
      {niva.map((n, i) => (
        <label key={n} style={rad}>
          <Radio name="press" checked={i === 1} readOnly />
          {n}
        </label>
      ))}
    </RadioGroup>
  );
}

/** Valgt (kant og prikk i primærfargen) ved siden av umerket. */
export function MerketOgUmerket() {
  return (
    <div style={{ display: "flex", gap: 28 }}>
      <label style={rad}>
        <Radio name="tilstand" checked readOnly />
        Valgt
      </label>
      <label style={rad}>
        <Radio name="tilstand" checked={false} readOnly />
        Ikke valgt
      </label>
    </div>
  );
}

/** To linjer per valg: tittel og forklaring — slik varighet velges i booking. */
export function MedBeskrivelse() {
  const valg = [
    { t: "30 minutter", s: "Én ting: putting eller ett slag" },
    { t: "60 minutter", s: "Standard time" },
    { t: "90 minutter", s: "Anbefalt for kartleggingsøkt" },
  ];
  return (
    <RadioGroup aria-label="Varighet" style={{ maxWidth: 400 }}>
      {valg.map((v, i) => (
        <label key={v.t} style={{ ...rad, alignItems: "flex-start", padding: "6px 0" }}>
          <Radio name="varighet" checked={i === 2} readOnly className="mt-0.5" />
          <span>
            <span style={{ display: "block", fontWeight: 600 }}>{v.t}</span>
            <span style={{ display: "block", fontSize: 12, color: "var(--tl-mute)" }}>{v.s}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
