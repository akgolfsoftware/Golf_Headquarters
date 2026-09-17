import { Verktoytips } from "akgolf-hq-komponenter";

/**
 * Verktøytips: mono-tekst på grafittpanel over en stiplet utløser med målt verdi.
 * Kilden setter tekstfargen til TL.text (#111111 i lys modus) på fast #222522 — lesbar bare i mørk modus.
 * «SgTotalt» viser kilden uendret; de andre cellene pakker `tekst` i on-fill-farge slik panelet er tenkt.
 */

/** Kanonisk bruk (kilden uendret): forklaring av et målt tall med kilde og dato. */
export function SgTotalt() {
  return <Verktoytips tekst="SG mot eget snitt, siste 8 runder · GolfBox 14.09.2026" trigger="SG totalt" verdi="+1,8" />;
}

const paaGrafitt = { color: "var(--tl-on-fill)" };

/** TrackMan-parameter: navnet på engelsk med stor forbokstav, forklaringen på norsk. */
export function TrackMan() {
  return (
    <Verktoytips
      tekst={<span style={paaGrafitt}>Attack Angle · median av 60 slag med driver, 15.09.2026</span>}
      trigger="Attack Angle"
      verdi="−1,2°"
    />
  );
}

/** Estimat merkes eksplisitt (TruthLayer); lang tekst bryter ved 240 px og holder seg venstrestilt. */
export function Estimat() {
  return (
    <Verktoytips
      h={200}
      tekst={
        <span style={paaGrafitt}>
          Estimat: SG-fordelingen er ikke målt for GolfBox-runder. Tallet bygger på score mot feltsnitt, spenn ± 0,3.
        </span>
      }
      trigger="SG approach"
      verdi="+0,6"
    />
  );
}
