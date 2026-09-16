import { V2Feil } from "akgolf-hq-komponenter";

/** Standardteksten: ikon i danger-ramme, «Feil»-etikett i mono, tittel, kort melding, «Prøv igjen» + «Tilbake». */
export function Standard() {
  return <V2Feil reset={() => {}} tilbakeHref="/portal" />;
}

/** B1 «I dag»: fasitens kopi per flate settes via tittel og melding — aldri stack trace. */
export function DagenDin() {
  return (
    <V2Feil
      reset={() => {}}
      tilbakeHref="/portal"
      tittel="Fikk ikke lastet dagen din"
      melding="Planen din er trygg. Prøv igjen, eller gå tilbake til oversikten."
    />
  );
}

/** Analyse: SG-henting feilet. Tilbake peker til nærmeste fungerende oversikt. */
export function SG() {
  return (
    <V2Feil
      reset={() => {}}
      tilbakeHref="/portal/analysere"
      tittel="Fikk ikke hentet SG"
      melding="Rundene dine er lagret. Prøv igjen om et øyeblikk."
    />
  );
}
