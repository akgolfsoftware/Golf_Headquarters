import { Inndata } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };

/** Tomt felt med plassholder og hjelpetekst — slik onboardingen starter. */
export function Tom() {
  return (
    <div style={boks}>
      <Inndata label="Fornavn" defaultValue="" placeholder="Slik det står i GolfBox" hint="Vises for coach og forelder." />
    </div>
  );
}

export function Utfylt() {
  return (
    <div style={boks}>
      <Inndata label="Fornavn" defaultValue="Øyvind" />
    </div>
  );
}

/** Målte tall settes i IBM Plex Mono med enhet som suffiks. */
export function MonoMedSuffiks() {
  return (
    <div style={boks}>
      <Inndata label="Handicap" defaultValue="4,2" mono suffix="hcp" hint="Bruk komma som desimaltegn." />
    </div>
  );
}

/** Feiltekst vinner over hjelpetekst; feltet får rød kant og ring. */
export function Feil() {
  return (
    <div style={boks}>
      <Inndata label="Fødselsår" defaultValue="2031" mono feil="Fødselsåret kan ikke være i framtiden." />
    </div>
  );
}

export function Deaktivert() {
  return (
    <div style={boks}>
      <Inndata label="Klubb" defaultValue="Gamle Fredrikstad GK" disabled hint="Klubben endres av coachen din." />
    </div>
  );
}
