import { Rad, SevChip } from "akgolf-hq-komponenter";

/** Alvorlighet i coachens Kø: klarspråk, aldri sperre-språk. */
export function AlleNivaer() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <SevChip s="sterk" />
      <SevChip s="medium" />
      <SevChip s="lav" />
      <SevChip s="ok" />
    </div>
  );
}

/** Slik chipen står i Kø-radene hos Anders. */
export function IKoRad() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Rad title="Øyvind Rohjan · 2 økter hoppet over" sub="Sist aktiv for 6 dager siden" meta={<SevChip s="sterk" />} />
      <Rad title="Bookingforespørsel torsdag 16:00" sub="Venter på bekreftelse fra deg" meta={<SevChip s="medium" />} />
      <Rad title="Spørsmål om wedge-oppsett" sub="Fra Caddie-samtalen i går" meta={<SevChip s="lav" />} />
      <Rad title="Uke 38 publisert" sub="Alle 6 økter bekreftet" meta={<SevChip s="ok" />} last />
    </div>
  );
}
