import { RadioGruppe } from "akgolf-hq-komponenter";

const boks = { maxWidth: 400 };

/** Motorikk-steget i AK-formelen: tre valg med kort mono-forklaring. */
export function Motorikk() {
  return (
    <div style={boks}>
      <RadioGruppe
        label="Motorikk"
        options={[
          { v: "UTEN_BALL", l: "Uten ball", sub: "Tørrsving" },
          { v: "LAV_HAST", l: "Lav hastighet", sub: "50–70 %" },
          { v: "AUTO", l: "Auto", sub: "Full fart" },
        ]}
        defaultValue="LAV_HAST"
      />
    </div>
  );
}

/** Press-nivå — hvem som ser på. Kontrollert med statisk verdi. */
export function Press() {
  return (
    <div style={boks}>
      <RadioGruppe
        label="Press"
        options={[
          { v: "ALENE", l: "Alene", sub: "Ingen ser på" },
          { v: "OBSERVERT", l: "Observert", sub: "Coach ser på" },
          { v: "KONKURRANSE", l: "Konkurranse", sub: "Mot en annen" },
          { v: "TURNERING", l: "Turnering", sub: "Tellende runde" },
        ]}
        value="OBSERVERT"
        onChange={() => {}}
      />
    </div>
  );
}

/** Uten undertekst. */
export function Tee() {
  return (
    <div style={boks}>
      <RadioGruppe
        label="Tee"
        options={[
          { v: "60", l: "Tee 60 (hvit)" },
          { v: "56", l: "Tee 56 (gul)" },
          { v: "52", l: "Tee 52 (rød)" },
        ]}
        defaultValue="56"
      />
    </div>
  );
}
