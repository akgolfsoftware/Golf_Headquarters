import { StatusPill } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" as const };

/** Standard-tonen er nøytral tekstfarge, aldri neon. Prikk + 10 %-fyll + 26 %-kant i samme tone. */
export function Standard() {
  return (
    <div style={rad}>
      <StatusPill>Planlagt</StatusPill>
      <StatusPill>Nå</StatusPill>
    </div>
  );
}

/** De seks tonene slik de brukes: utkast, publisert, fullført, venter, avlyst, live. */
export function AlleToner() {
  return (
    <div style={rad}>
      <StatusPill tone="lime">Utkast</StatusPill>
      <StatusPill tone="up">Publisert</StatusPill>
      <StatusPill tone="warm">Fullført</StatusPill>
      <StatusPill tone="warn">Venter på svar</StatusPill>
      <StatusPill tone="down">Avlyst</StatusPill>
      <StatusPill tone="info">Live</StatusPill>
    </div>
  );
}

/** Fullført er alltid warm. Grønn (up) er forbeholdt Godta/Publisert — aldri fullført-semantikk. */
export function FullfortMotPublisert() {
  return (
    <div style={rad}>
      <StatusPill tone="warm">Fullført · 45 min</StatusPill>
      <StatusPill tone="up">Publisert til Øyvind</StatusPill>
    </div>
  );
}
