import { Caps } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 14 };

/** Seksjonsetikett: IBM Plex Mono 10/600, versaler, dempet. Står alltid over et tall eller en liste. */
export function Standard() {
  return (
    <div style={kolonne}>
      <Caps>Neste økt</Caps>
      <Caps>Siste 10 runder · GolfBox</Caps>
      <Caps>Strokes Gained per kategori</Caps>
    </div>
  );
}

/** 9 px i tette KPI-fliser, 10 px som standard, 12 px som eyebrow på et kort. */
export function Storrelser() {
  return (
    <div style={kolonne}>
      <Caps size={9}>Snittscore</Caps>
      <Caps size={10}>Denne uka</Caps>
      <Caps size={12}>Treningslogg</Caps>
    </div>
  );
}

/** Dempet er standard. Tekstfarge når etiketten er selve overskriften, warm-tekst for det som pågår nå. */
export function Farger() {
  return (
    <div style={kolonne}>
      <Caps>Planlagt · dempet</Caps>
      <Caps color="var(--tl-text)">Uke 38 · tekstfarge</Caps>
      <Caps color="var(--tl-warm-text)">Pågår nå · warm</Caps>
    </div>
  );
}
