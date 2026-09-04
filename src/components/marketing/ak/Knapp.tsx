"use client";

import Link from "next/link";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/* Hover, trykk og snurre ligger i tokens/samspill.css (.ak-trykk) — ikke her.
   Kilde: designsystem/ak-golf/components/handling/Knapp.jsx. */

type Variant = "primaer" | "sekundaer" | "tekst";
type Storrelse = "sm" | "md" | "lg";

const BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--ak-r-2)",
  fontFamily: "var(--ak-sans)",
  fontWeight: 500,
  lineHeight: 1,
  border: "1px solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  minHeight: "var(--ak-treff)",
};

const STORRELSER: Record<Storrelse, CSSProperties> = {
  sm: { fontSize: "var(--ak-t-15)", padding: "0 var(--ak-r-4)", minHeight: 36 },
  md: { fontSize: "var(--ak-t-17)", padding: "0 var(--ak-r-5)" },
  lg: { fontSize: "var(--ak-t-21)", padding: "0 var(--ak-r-6)", minHeight: 56 },
};

/* Hviletilstand inline; hover-verdiene sendes som custom properties som
   samspill.css leser. Hver farge finnes fortsatt bare ett sted. */
type ToneStil = CSSProperties & Record<`--ak-h-${"bg" | "kant" | "tekst"}`, string>;

const TONER: Record<Variant, ToneStil> = {
  primaer: {
    background: "var(--ak-signal-fyll)",
    color: "var(--ak-signal-tekst)",
    borderColor: "transparent",
    "--ak-h-bg": "var(--ak-signal)",
    "--ak-h-kant": "transparent",
    "--ak-h-tekst": "var(--ak-signal-tekst)",
  },
  sekundaer: {
    background: "transparent",
    color: "var(--ak-tekst)",
    borderColor: "var(--ak-linje-hard)",
    "--ak-h-bg": "var(--ak-grunn-senk)",
    "--ak-h-kant": "var(--ak-linje-hard)",
    "--ak-h-tekst": "var(--ak-tekst)",
  },
  tekst: {
    background: "transparent",
    color: "var(--ak-signal)",
    borderColor: "transparent",
    padding: "0 var(--ak-r-2)",
    textDecoration: "underline",
    textDecorationThickness: 1,
    textUnderlineOffset: 4,
    "--ak-h-bg": "transparent",
    "--ak-h-kant": "transparent",
    "--ak-h-tekst": "var(--ak-tekst)",
  },
};

export function Knapp({
  variant = "primaer",
  storrelse = "md",
  pill = false,
  fullBredde = false,
  deaktivert = false,
  laster = false,
  ikon,
  href,
  onClick,
  children,
  className,
  style,
  type = "button",
}: {
  variant?: Variant;
  storrelse?: Storrelse;
  pill?: boolean;
  fullBredde?: boolean;
  deaktivert?: boolean;
  laster?: boolean;
  ikon?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit";
}) {
  const av = deaktivert || laster;
  const s: CSSProperties = {
    ...BASE,
    ...STORRELSER[storrelse],
    ...TONER[variant],
    borderRadius: pill ? "var(--ak-hjorne-pill)" : "var(--ak-hjorne-sm)",
    width: fullBredde ? "100%" : undefined,
    opacity: av ? 0.42 : 1,
    cursor: av ? "not-allowed" : "pointer",
    ...style,
  };
  const klasse = ["ak-trykk", className].filter(Boolean).join(" ");
  const innhold = (
    <>
      {laster ? <span className="ak-snurre" aria-hidden="true" /> : ikon}
      {children}
    </>
  );

  if (href && !av) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} style={s} className={klasse} data-ak-variant={variant} onClick={onClick}>
          {innhold}
        </Link>
      );
    }
    return (
      <a href={href} style={s} className={klasse} data-ak-variant={variant} onClick={onClick}>
        {innhold}
      </a>
    );
  }
  return (
    <button
      type={type}
      style={s}
      className={klasse}
      data-ak-variant={variant}
      disabled={av}
      aria-disabled={av || undefined}
      aria-busy={laster || undefined}
      onClick={av ? undefined : onClick}
    >
      {innhold}
    </button>
  );
}
