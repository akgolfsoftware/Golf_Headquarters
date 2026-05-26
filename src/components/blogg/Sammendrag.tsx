/**
 * <Sammendrag> — TL;DR-boks med lime accent for MDX-artikler.
 *
 * Bruk i .mdx:
 * <Sammendrag>
 *   Norske 17-åringer synker 18 % på 5-meteren mot svenske 24 %.
 * </Sammendrag>
 */

import type { ReactNode } from "react";

type SammendragProps = {
  children: ReactNode;
  tittel?: string;
};

export function Sammendrag({ children, tittel = "TL;DR" }: SammendragProps) {
  return (
    <div
      style={{
        background: "var(--s-secondary, var(--secondary))",
        borderLeft: "4px solid var(--s-accent, var(--accent))",
        borderRadius: "var(--s-r-md, 0.75rem)",
        padding: "1.25rem 1.5rem",
        margin: "2rem 0",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--s-muted-fg, var(--muted-foreground))",
          marginBottom: "0.5rem",
        }}
      >
        {tittel}
      </div>
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.65,
          color: "var(--s-fg, var(--foreground))",
          fontStyle: "italic",
        }}
      >
        {children}
      </div>
    </div>
  );
}
