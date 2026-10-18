import type { CSSProperties } from "react";

/**
 * Team Norways lukkede ikonsett: rette linjer, firkantede ender, ingen sirkler.
 * 24-ruter tegnet i 20 px. Fasit: docs/design-system/utkast-tn/felles/tn.js (IKON).
 * AK-settet (@/components/v2/icon) brukes ikke i Team Norway: det har runde ender.
 */
const STIER = {
  oversikt: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  kalender: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  spillere: "M6 4h5v5H6zM3 20v-4l3-3h5l3 3v4M15 6h4v4h-4M14 13h4l3 3v4h-4",
  uttak: "M4 12l5 5L20 6",
  plan: "M4 4h16v16H4zM8 9h8M8 13h8M8 17h5",
  gruppe: "M3 5h18v12H8l-5 3z",
  meg: "M8 3h8v8H8zM4 21v-4l3-3h10l3 3v4",
  mer: "M4 6h16M4 12h16M4 18h16",
  pil: "M15 5l-7 7 7 7",
  videre: "M9 5l7 7-7 7",
  lukk: "M5 5l14 14M19 5L5 19",
  ned: "M5 9l7 7 7-7",
} as const;

export type TnIkonNavn = keyof typeof STIER;

export function TnIkon({ navn, storrelse = 20, style }: { navn: TnIkonNavn; storrelse?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={storrelse} height={storrelse} aria-hidden="true" focusable="false" style={{ flex: "none", stroke: "currentColor", fill: "none", strokeWidth: 1.75, strokeLinecap: "square", strokeLinejoin: "miter", ...style }}>
      <path d={STIER[navn]} />
    </svg>
  );
}
