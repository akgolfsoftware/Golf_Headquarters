import type { CSSProperties, ElementType, ReactNode } from "react";

/* Kilde: designsystem/ak-golf/components/merke/Instrumentflate.jsx.
   Rutenettet som tekstur. Ett instrumentelement per flate — er det rutenett
   her, skal det ikke være målestokk og kryss i samme visning. */

function Kryss({ hjorne, mork }: { hjorne: "tv" | "nh"; mork: boolean }) {
  const pos: CSSProperties =
    hjorne === "tv" ? { top: 24, left: 24 } : { bottom: 24, right: 24 };
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        width: "var(--ak-kryss)",
        height: "var(--ak-kryss)",
        ...pos,
        color: mork ? "var(--ak-dempet)" : "var(--ak-linje-hard)",
      }}
    >
      <span style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: 1, background: "currentColor" }} />
      <span style={{ position: "absolute", top: 0, left: "50%", height: "100%", width: 1, background: "currentColor" }} />
    </span>
  );
}

export function Instrumentflate({
  tett = false,
  mork = false,
  kryss = false,
  styrke,
  som,
  children,
  style,
}: {
  tett?: boolean;
  mork?: boolean;
  kryss?: boolean;
  styrke?: number;
  som?: ElementType;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const rute = tett ? "var(--ak-rute-tett)" : "var(--ak-rute)";
  const linje = mork ? "var(--ak-rute-mork)" : "var(--ak-rute-lys)";
  const Tag = som ?? "div";
  return (
    <Tag
      style={{
        position: "relative",
        opacity: styrke,
        ...style,
        // Rutenettet settes ETTER kallerens style: en `background`-kortform
        // utenfra ville ellers slå av instrumentlaget stille.
        backgroundImage:
          `linear-gradient(${linje} var(--ak-rute-linje), transparent var(--ak-rute-linje)),` +
          `linear-gradient(90deg, ${linje} var(--ak-rute-linje), transparent var(--ak-rute-linje))`,
        backgroundSize: `${rute} ${rute}`,
      }}
    >
      {kryss && <Kryss hjorne="tv" mork={mork} />}
      {kryss && <Kryss hjorne="nh" mork={mork} />}
      {children}
    </Tag>
  );
}
