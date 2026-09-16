import { Kort, SgKategorier } from "akgolf-hq-komponenter";

const KAT = [
  { akse: "OTT", sg: 0.3 },
  { akse: "APP", sg: 0.6 },
  { akse: "ARG", sg: -0.4 },
  { akse: "PUTT", sg: -1.2 },
];

/** Divergerende stolper fra nullbaseline: grønn til høyre, rød til venstre, «størst tap» merket. */
export function Standard() {
  return <SgKategorier kategorier={KAT} baseline="Broadie scratch" />;
}

/** Fagkoder i mono i stedet for norske navn — for coach-flater. Hjelpetips på eyebrow. */
export function Fagkoder() {
  return <SgKategorier kategorier={KAT} fagkoder baseline="Broadie scratch" hjelp="sgOmrade" />;
}

/** Tette verdier trenger to desimaler — med én blir alle fire «−0,0» og rangeringen usynlig. */
export function ToDesimaler() {
  return (
    <SgKategorier
      kategorier={[
        { akse: "OTT", sg: -0.04 },
        { akse: "APP", sg: 0.02 },
        { akse: "ARG", sg: -0.03 },
        { akse: "PUTT", sg: -0.01 },
      ]}
      desimaler={2}
      baseline="eget snitt 2025"
    />
  );
}

/** `bar`: uten egen ramme, inne i et annet kort — kanten dobles ikke. */
export function IAnnetKort() {
  return (
    <Kort eyebrow="Analyse · siste 30 dager" action={<span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" }}>12 runder · 14.09.2026</span>}>
      <SgKategorier kategorier={KAT} bar baseline="Broadie scratch" />
    </Kort>
  );
}
