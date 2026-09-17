import { VideoKort } from "akgolf-hq-komponenter";

/* Liten SVG-plakat som data-URL — ingen ekte video, ingen ekstern ressurs. */
const plakat =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f4d3a"/><stop offset="1" stop-color="#0b1f16"/></linearGradient></defs>' +
      '<rect width="320" height="180" fill="url(#g)"/>' +
      '<rect y="122" width="320" height="58" fill="#2f6b4f" opacity="0.75"/>' +
      '<line x1="24" y1="122" x2="296" y2="122" stroke="#fff" stroke-opacity="0.35"/>' +
      '<line x1="96" y1="118" x2="214" y2="46" stroke="#fff" stroke-opacity="0.6" stroke-width="2" stroke-dasharray="5 5"/>' +
      '<circle cx="96" cy="118" r="4" fill="#fff"/>' +
      "</svg>",
  );

const boks = { maxWidth: 320 };

/** Coach-video med plakat, varighet nederst til høyre, tag og dato. */
export function MedPlakat() {
  return (
    <div style={boks}>
      <VideoKort
        title="P4 — venstre arm parallell, fra siden"
        coach="Anders Kristiansen"
        tag="Teknikk"
        dato="12. september"
        varighet="1:48"
        thumbnailUrl={plakat}
      />
    </div>
  );
}

/** Uten plakat: gradient-fallback bak play-knappen, aldri brutt-bilde-ikon. */
export function UtenPlakat() {
  return (
    <div style={boks}>
      <VideoKort title="Wedge 60–100 m — tempo og Carry-kontroll" coach="Anders Kristiansen" tag="Golfslag" dato="9. september" varighet="3:12" />
    </div>
  );
}

/** Henter signert URL: kortet dempes og kan ikke trykkes. */
export function Laster() {
  return (
    <div style={boks}>
      <VideoKort title="Putting — oppsett og øyne over ballen" coach="Anders Kristiansen" tag="Golfslag" dato="5. september" varighet="2:05" thumbnailUrl={plakat} pending />
    </div>
  );
}

/** Feil under henting: rolig feilmelding under kortet. */
export function Feil() {
  return (
    <div style={boks}>
      <VideoKort
        title="Bunker — åpen bladvinkel og sandtrinn"
        coach="Anders Kristiansen"
        tag="Golfslag"
        dato="28. august"
        varighet="2:40"
        error="Kunne ikke hente videoen. Prøv igjen om litt."
      />
    </div>
  );
}
