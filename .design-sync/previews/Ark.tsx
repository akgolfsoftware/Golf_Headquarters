import { Ark } from "akgolf-hq-komponenter";

/**
 * Bunn-ark på mobil (390 px), rendret statisk åpent i egen demo-ramme med scrim.
 * Håndtaket er lukkeknappen (ingen hjørne-X); hver rad bærer akse-chip som meta.
 */

/** Kanonisk bruk: velg område før en økt logges. */
export function Treningsomrade() {
  return (
    <Ark
      title="Velg treningsområde"
      items={[
        { t: "Nærspill", s: "Chip, pitch og bunker", a: "SPILL" },
        { t: "Putting", s: "Lengdekontroll og lesing", a: "SPILL" },
        { t: "Driver", s: "Club Speed og retning", a: "SLAG" },
        { t: "Jern", s: "Treffbilde og avstandskontroll", a: "TEK" },
      ]}
    />
  );
}

/** Alle fem aksene i ett ark: Fysisk, Teknikk, Slag, Spill, Turnering. */
export function OktType() {
  return (
    <Ark
      h={540}
      title="Hva slags økt?"
      items={[
        { t: "Styrke og mobilitet", s: "45 min · gym eller hjemme", a: "FYS" },
        { t: "Teknikk med video", s: "P2–P4 med speil · Mulligan Indoor Golf", a: "TEK" },
        { t: "Slag på range", s: "60 slag med TrackMan-mål", a: "SLAG" },
        { t: "Spill på bane", s: "9 eller 18 hull med hullregistrering", a: "SPILL" },
        { t: "Turnering", s: "Hentes fra GolfBox etterpå", a: "TURN" },
      ]}
    />
  );
}

/** Kort liste: arket blir bare så høyt som innholdet — resten er scrim. */
export function KortListe() {
  return (
    <Ark
      h={340}
      title="Legg til test i uka"
      items={[
        { t: "Putt Speed Control", s: "3 m · 10 putter · delt protokoll", a: "SPILL" },
        { t: "Benkpress 1RM", s: "Testdag WANG · føres spiller for spiller", a: "FYS" },
      ]}
    />
  );
}
