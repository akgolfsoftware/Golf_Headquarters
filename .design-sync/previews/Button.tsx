import { Button } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" };

/** De fem variantene, slik de brukes i appen: lime kun for kjøp/oppgradering. */
export function Varianter() {
  return (
    <div style={rad}>
      <Button variant="lime">Start gratis prøving</Button>
      <Button variant="primary">Logg økt</Button>
      <Button variant="secondary">Filter</Button>
      <Button variant="ghost-light">Avbryt</Button>
    </div>
  );
}

export function Storrelser() {
  return (
    <div style={rad}>
      <Button size="sm">Liten · 36 px</Button>
      <Button size="md">Standard · 44 px</Button>
      <Button size="lg">Stor · 52 px</Button>
    </div>
  );
}

/** ghost-dark er laget for mørke hero-/featured-flater. */
export function PaMorkFlate() {
  return (
    <div style={{ ...rad, background: "#0f2a1f", padding: 20, borderRadius: 16 }}>
      <Button variant="ghost-dark">Se hele planen</Button>
      <Button variant="lime" size="lg">Bestill time</Button>
    </div>
  );
}

export function Deaktivert() {
  return (
    <div style={rad}>
      <Button disabled>Lagrer …</Button>
      <Button variant="secondary" disabled>Ikke tilgjengelig</Button>
    </div>
  );
}
