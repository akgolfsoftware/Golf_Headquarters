import { Kort, ListeIkon, Rad, RadMeta, UlestPrikk } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };
const kolonne = { display: "flex", flexDirection: "column" as const, gap: 10, alignItems: "flex-start" };

/** Teller og tid høyrestilt i mono, slik Kø og Innboks bruker dem; klikkbare rader får chevron etter meta. */
export function TellerOgTid() {
  const aapne = () => {};
  return (
    <div style={boks}>
      <Kort eyebrow="Kø · i dag" pad="15px 17px">
        <Rad leading={<ListeIkon icon="mail" />} title="Foreldre · Rohjan" sub="Spørsmål om samlingen i oktober" meta={<RadMeta>3 nye · 09:12</RadMeta>} onClick={aapne} />
        <Rad leading={<ListeIkon icon="calendar" />} title="Booking venter på svar" sub="Torsdag 16:00 · 60 min" meta={<RadMeta>2</RadMeta>} onClick={aapne} />
        <Rad leading={<ListeIkon icon="radar" />} title="TrackMan-økt lastet opp" sub="Øyvind Rohjan · 168 slag" meta={<RadMeta>14.09</RadMeta>} onClick={aapne} last />
      </Kort>
    </div>
  );
}

/** Innholdet den tar: teller, tid, dato, andel — og ulest-prikk foran telleren. */
export function Varianter() {
  return (
    <div style={kolonne}>
      <RadMeta>3 nye · 09:12</RadMeta>
      <RadMeta>14.09.2026</RadMeta>
      <RadMeta>4 av 6</RadMeta>
      <RadMeta><UlestPrikk />1 ny</RadMeta>
    </div>
  );
}
