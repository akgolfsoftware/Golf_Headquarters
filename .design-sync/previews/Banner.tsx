import { Banner } from "akgolf-hq-komponenter";

/**
 * Banner: info/advarsel/ok-stripe øverst på en skjerm — tonet flate og kant (color-mix), ikon i tonen,
 * klarspråk i Poppins, valgfri CTA med pil og alltid en lukk-X. Ingen demo-ramme; bredden styres av `w`.
 */

/** Kanonisk bruk: pågående synk. */
export function Info() {
  return <Banner tone="info" tekst="TrackMan-synk pågår — nye slag vises om noen minutter." cta="Se status" />;
}

/** Advarsel: noe mangler før en handling kan gjøres. */
export function Advarsel() {
  return (
    <Banner
      tone="advarsel"
      tekst="Samtykke fra forelder mangler — Øyvinds profil kan ikke deles med WANG ennå."
      cta="Be om samtykke"
    />
  );
}

/** Ok: bekreftelse på publisering. */
export function Ok() {
  return <Banner tone="ok" tekst="Uke 38 er publisert. Øyvind ser planen nå." cta="Åpne uken" />;
}

/** Uten handling: bare melding og lukk. */
export function UtenHandling() {
  return <Banner tone="info" tekst="Betalingen for september er registrert." cta={null} />;
}

/** Mobil (390 px): teksten bryter, CTA-en holder seg på én linje. */
export function Smal() {
  return (
    <Banner w={390} tone="advarsel" tekst="Du er frakoblet — endringer lagres når nettet er tilbake." cta="Prøv igjen" />
  );
}
