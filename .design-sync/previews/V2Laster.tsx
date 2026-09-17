import { V2Laster } from "akgolf-hq-komponenter";

/** Skjelettet bærer selv hele chromen (100vh + rail-silhuett) fordi loading.tsx rendres uten V2Shell — her klippet til 560 px. */
const ramme = { height: 560, overflow: "hidden" as const, borderRadius: 12, border: "1px solid var(--tl-hair)" };

/** PH-01 «I dag laster»: caps, hero-tall, neste-økt-kort med CTA-pille, to KPI-kort. */
export function Hjem() {
  return (
    <div style={ramme}>
      <V2Laster variant="hjem" />
    </div>
  );
}

/** PH-07 «Plan laster»: dagstripe med sju piller og to ukekort. */
export function Plan() {
  return (
    <div style={ramme}>
      <V2Laster variant="plan" />
    </div>
  );
}

/** «Analyse laster»: hero-tall, tre KPI-kort og tekstpanel. */
export function Analyse() {
  return (
    <div style={ramme}>
      <V2Laster variant="analyse" />
    </div>
  );
}

/** «Meg laster»: avatar-sirkel, navn/undertekst og innstillingskort. */
export function Meg() {
  return (
    <div style={ramme}>
      <V2Laster variant="meg" />
    </div>
  );
}

/** Generisk liste: fem Rad-silhuetter med avatar, to linjer og chip. */
export function Liste() {
  return (
    <div style={ramme}>
      <V2Laster variant="liste" />
    </div>
  );
}

/** Standardvarianten «kort»: KPI-grid med fire paneler. */
export function KortGrid() {
  return (
    <div style={ramme}>
      <V2Laster />
    </div>
  );
}
