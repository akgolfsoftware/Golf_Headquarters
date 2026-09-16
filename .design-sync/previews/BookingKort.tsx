import { BookingKort } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 480 };

/** Bekreftet privattime: tittel, dato, klokkeslett i mono, coach og sted. */
export function Bekreftet() {
  return (
    <div style={kolonne}>
      <BookingKort
        tittel="Privattime 90 min — nærspill"
        dato="Tor 24. september"
        tid="14:00–15:30"
        coach="Anders Kristiansen"
        sted="Gamle Fredrikstad GK, nærspillsområdet"
        status="bekreftet"
      />
    </div>
  );
}

/** Status-aksen: venter på bekreftelse (gul) og avlyst (rød). */
export function Statuser() {
  return (
    <div style={kolonne}>
      <BookingKort
        tittel="Kartleggingsøkt 90 min"
        dato="Man 21. september"
        tid="16:00–17:30"
        coach="Anders Kristiansen"
        sted="AK Golf Academy, Fredrikstad"
        status="venter"
      />
      <BookingKort
        tittel="TrackMan-økt 60 min"
        dato="Ons 23. september"
        tid="18:00–19:00"
        coach="Anders Kristiansen"
        sted="Mulligan Indoor Golf, simulator 2"
        status="avlyst"
      />
    </div>
  );
}
