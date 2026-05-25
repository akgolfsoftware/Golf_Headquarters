/**
 * FlagGlyph — tiny stylized 3-stripe SVG flag
 * Server component — pure SVG.
 */

export type FlagCode =
  | "no"
  | "se"
  | "dk"
  | "is"
  | "fi"
  | "us"
  | "ie"
  | "jp"
  | "za"
  | "es"
  | "gb"
  | "kr";

interface FlagGlyphProps {
  code?: FlagCode | string;
  size?: number;
}

const PALETTES: Record<string, [string, string, string]> = {
  no: ["#BA0C2F", "#FFFFFF", "#00205B"],
  se: ["#006AA7", "#FECC00", "#006AA7"],
  dk: ["#C8102E", "#FFFFFF", "#C8102E"],
  is: ["#02529C", "#FFFFFF", "#DC1E35"],
  fi: ["#FFFFFF", "#003580", "#FFFFFF"],
  us: ["#B22234", "#FFFFFF", "#3C3B6E"],
  ie: ["#169B62", "#FFFFFF", "#FF883E"],
  jp: ["#FFFFFF", "#BC002D", "#FFFFFF"],
  za: ["#007749", "#FFB81C", "#001489"],
  es: ["#AA151B", "#F1BF00", "#AA151B"],
  gb: ["#012169", "#FFFFFF", "#C8102E"],
  kr: ["#FFFFFF", "#CD2E3A", "#0047A0"],
};

export function FlagGlyph({ code = "no", size = 14 }: FlagGlyphProps) {
  const c = PALETTES[code] ?? PALETTES.no;
  const isScandinavian = code === "no" || code === "is";

  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 20 14"
      style={{
        display: "inline-block",
        flexShrink: 0,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <rect x="0" y="0" width="20" height="14" fill={c[0]} />
      {isScandinavian ? (
        <>
          <rect x="6" y="0" width="2.5" height="14" fill={c[1]} />
          <rect x="0" y="5.5" width="20" height="3" fill={c[1]} />
          <rect x="7" y="0" width="1" height="14" fill={c[2]} />
          <rect x="0" y="6.5" width="20" height="1" fill={c[2]} />
        </>
      ) : (
        <>
          <rect x="0" y="4.5" width="20" height="5" fill={c[1]} />
          <rect x="0" y="9.5" width="20" height="4.5" fill={c[2]} />
        </>
      )}
    </svg>
  );
}
