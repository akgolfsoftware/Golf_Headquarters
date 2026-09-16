import { Toast } from "akgolf-hq-komponenter";

/**
 * Toast: dim-flate nederst med 6 px tone-prikk, melding i Poppins 600 og valgfri «Angre»-handling.
 * Rendres statisk i egen demo-ramme (uten scrim). Den forsvinner selv i appen — ingen lukke-X.
 */

/** Kanonisk bruk: bekreftelse etter logging, med angre. */
export function Logget() {
  return <Toast melding="Økten er logget — 1,5 t nærspill" angre="Angre" tone="up" />;
}

/** Fullført-status er alltid warm, aldri ok (grønn er forbeholdt Godta/Publisert). */
export function Fullfort() {
  return <Toast melding="Uke 38 er fullført — 6 av 6 økter" angre={null} tone="warm" />;
}

/** Tone-aksen: fargen ligger i prikken, aldri i flaten. */
export function Toner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Toast h={96} tone="warn" melding="TrackMan-filen mangler 12 slag — sjekk eksporten" angre="Se filen" />
      <Toast h={96} tone="down" melding="Kunne ikke lagre økten" angre="Prøv igjen" />
      <Toast h={96} tone="info" melding="Uke 39 er kopiert fra uke 38" angre="Angre" />
      <Toast h={96} tone="lime" melding="Abonnementet er aktivt — velkommen til FULL" angre={null} />
    </div>
  );
}

/** Uten angre: meldingen står alene. */
export function UtenAngre() {
  return <Toast melding="Forslaget er sendt til Anders for godkjenning" angre={null} tone="info" />;
}
