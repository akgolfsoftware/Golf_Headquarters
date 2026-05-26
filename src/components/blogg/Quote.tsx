/**
 * <Quote> — italic pull-quote for MDX-artikler.
 * Viser et sitert utsagn med valgfri kilde.
 *
 * Bruk i .mdx:
 * <Quote kilde="Svensk juniortrener, 2026">
 *   Vi bruker 30 minutter per uke på speed-drills. Alltid.
 * </Quote>
 */

import type { ReactNode } from "react";

type QuoteProps = {
  children: ReactNode;
  kilde?: string;
};

export function Quote({ children, kilde }: QuoteProps) {
  return (
    <figure
      style={{
        margin: "2.5rem 0",
        padding: "1.5rem 2rem",
        borderLeft: "3px solid var(--s-primary, var(--primary))",
        background: "transparent",
      }}
    >
      <blockquote
        style={{
          fontSize: "clamp(18px, 2.5vw, 24px)",
          fontStyle: "italic",
          lineHeight: 1.55,
          color: "var(--s-fg, var(--foreground))",
          margin: 0,
        }}
      >
        {children}
      </blockquote>
      {kilde && (
        <figcaption
          style={{
            marginTop: "0.75rem",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--s-muted-fg, var(--muted-foreground))",
          }}
        >
          — {kilde}
        </figcaption>
      )}
    </figure>
  );
}
