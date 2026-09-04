import type { CSSProperties, ReactNode } from "react";

/* Kilde: designsystem/ak-golf/components/melding/Merkelapp.jsx. */

const VARIANTFARGER = {
  junior: "var(--ak-v-junior)",
  academy: "var(--ak-signal)",
  hq: "var(--ak-v-hq)",
  organisasjon: "var(--ak-v-org)",
  produkt: "var(--ak-v-produkt)",
  fag: "var(--ak-fag)",
  noytral: "var(--ak-dempet)",
} as const;

export type MerkelappVariant = keyof typeof VARIANTFARGER;

export function Merkelapp({
  variant = "noytral",
  fylt = false,
  children,
  style,
}: {
  variant?: MerkelappVariant;
  fylt?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const farge = VARIANTFARGER[variant];
  return (
    <span
      className="ak-maalt"
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 var(--ak-r-2)",
        fontSize: "var(--ak-t-11)",
        fontWeight: 500,
        letterSpacing: "var(--ak-sp-vid)",
        textTransform: "uppercase",
        borderRadius: "var(--ak-hjorne-sm)",
        border: `1px solid ${fylt ? "transparent" : farge}`,
        background: fylt ? farge : "transparent",
        color: fylt ? "var(--ak-signal-tekst)" : farge,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
