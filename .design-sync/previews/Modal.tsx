import { Modal } from "akgolf-hq-komponenter";

/**
 * Modal rendres statisk i sin egen demo-ramme (scrim + sentrert panel) — ingen open-prop, ingen portal.
 * Paper-modalen har ingen hjørne-X: den lukkes kun via handlingsraden (ghost = avbryt, solid = bekreft).
 */

/** Bekreft sletting: destruktiv handling med klarspråk om hva som beholdes. */
export function SlettOkt() {
  return (
    <Modal
      title="Slett økten?"
      body="«Wedge 60–100 m» fjernes fra uke 38. Loggførte data fra tidligere gjennomføringer beholdes."
      avbryt="Avbryt"
      bekreft="Slett økten"
    />
  );
}

/** Publisering: coachens vanligste bekreftelse i Workbench. */
export function PubliserUke() {
  return (
    <Modal
      title="Publiser uke 38 til Øyvind?"
      body="Seks økter blir synlige i planen hans. Han får ett varsel, ikke seks. Du kan fortsatt endre økter etter publisering."
      avbryt="Ikke ennå"
      bekreft="Publiser"
    />
  );
}

/** Mobil (390 px): panelet holder 12 px luft til kantene, knappene bryter til ny rad ved behov. */
export function Mobil() {
  return (
    <Modal
      w={390}
      h={400}
      title="Avslutt økten?"
      body="Du har logget 42 av 60 slag. Resten kan føres senere fra I dag."
      avbryt="Fortsett"
      bekreft="Avslutt økten"
    />
  );
}
