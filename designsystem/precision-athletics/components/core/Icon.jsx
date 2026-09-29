import React from "react";
const CDN = "https://unpkg.com/lucide-static@0.544.0/icons";
/** Lucide glyph as CSS mask — inherits currentColor. Lucide tegner 2 px strek i 24-rutenett, så synlig strek = size/12: 16 → 1,33 · 18 → 1,5 (vanlig tekst) · 20 → 1,67 · 24 → 2 (medium/semibold). Én vekt per flate; tilstand via currentColor/opasitet, aldri egen SVG. */
export function Icon({ name, size = 20, color = "currentColor", className = "", style, ...rest }) {
  const url = `url("${CDN}/${name}.svg")`;
  return <span aria-hidden="true" data-icon={name} className={"pa-icon " + className} style={{ width: size, height: size, background: color, WebkitMaskImage: url, maskImage: url, ...style }} {...rest} />;
}
