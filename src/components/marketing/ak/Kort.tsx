"use client";

import type { CSSProperties, ElementType, MouseEventHandler, ReactNode } from "react";

/* Kilde: designsystem/ak-golf/components/flate/Kort.jsx.
   Tyngden er hvor mye kortet løfter seg fra grunnen — ikke hvor viktig
   innholdet er. Hover og trykk ligger i tokens/samspill.css. */

const LOFT = {
  1: "var(--ak-loft-1)",
  2: "var(--ak-loft-2)",
  3: "var(--ak-loft-3)",
} as const;

export function Kort({
  tyngde = 1,
  trykkbar = false,
  aksent,
  rutenett = false,
  som,
  onClick,
  children,
  className,
  style,
}: {
  tyngde?: 1 | 2 | 3;
  trykkbar?: boolean;
  aksent?: string;
  rutenett?: boolean;
  som?: ElementType;
  onClick?: MouseEventHandler<HTMLElement>;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const Tag = som ?? "div";
  const rute: CSSProperties | null = rutenett
    ? {
        backgroundImage:
          "linear-gradient(var(--ak-rute-lys) 1px, transparent 1px), linear-gradient(90deg, var(--ak-rute-lys) 1px, transparent 1px)",
        backgroundSize: "var(--ak-rute-tett) var(--ak-rute-tett)",
      }
    : null;
  return (
    <Tag
      onClick={onClick}
      className={
        [trykkbar && "ak-trykk", trykkbar && "ak-kort-trykk", className]
          .filter(Boolean)
          .join(" ") || undefined
      }
      style={{
        background: "var(--ak-ark)",
        border: `1px solid ${tyngde === 1 ? "var(--ak-linje)" : "transparent"}`,
        borderRadius: "var(--ak-hjorne-md)",
        boxShadow: LOFT[tyngde],
        borderTop: aksent ? `3px solid ${aksent}` : undefined,
        padding: "var(--ak-r-5)",
        cursor: trykkbar ? "pointer" : undefined,
        ...style,
        // Etter kallerens style: en `background`-kortform utenfra ville ellers
        // nullstille background-image og fjerne rutenettet uten varsel.
        ...rute,
      }}
    >
      {children}
    </Tag>
  );
}
