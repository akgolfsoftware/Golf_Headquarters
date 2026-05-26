/**
 * mdx-components.tsx — kreves av @next/mdx.
 * Tilgjengeliggjør custom-styled MDX-komponenter globalt i content/blogg/*.mdx.
 * Brand-tokens matches til stats-designsystemet (CSS-variabler fra stats.css).
 */

import type { MDXComponents } from "mdx/types";
import { Stat } from "@/components/blogg/Stat";
import { Sammendrag } from "@/components/blogg/Sammendrag";
import { Quote } from "@/components/blogg/Quote";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Overskrifter
    h1: ({ children }) => (
      <h1
        style={{
          fontFamily: "var(--font-display, var(--font-sans))",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginTop: "2rem",
          marginBottom: "1rem",
          color: "var(--s-fg)",
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        style={{
          fontFamily: "var(--font-display, var(--font-sans))",
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: 600,
          lineHeight: 1.15,
          letterSpacing: "-0.015em",
          marginTop: "2.5rem",
          marginBottom: "0.75rem",
          color: "var(--s-fg)",
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          fontFamily: "var(--font-display, var(--font-sans))",
          fontSize: "1.15rem",
          fontWeight: 600,
          lineHeight: 1.2,
          marginTop: "2rem",
          marginBottom: "0.5rem",
          color: "var(--s-fg)",
        }}
      >
        {children}
      </h3>
    ),
    // Brødtekst
    p: ({ children }) => (
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.75,
          color: "var(--s-fg)",
          marginBottom: "1.25rem",
        }}
      >
        {children}
      </p>
    ),
    // Lister
    ul: ({ children }) => (
      <ul
        style={{
          paddingLeft: "1.5rem",
          marginBottom: "1.25rem",
          listStyleType: "disc",
          fontSize: 17,
          lineHeight: 1.7,
          color: "var(--s-fg)",
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{
          paddingLeft: "1.5rem",
          marginBottom: "1.25rem",
          listStyleType: "decimal",
          fontSize: 17,
          lineHeight: 1.7,
          color: "var(--s-fg)",
        }}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ marginBottom: "0.35rem" }}>{children}</li>
    ),
    // Kode
    code: ({ children }) => (
      <code
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.875em",
          background: "var(--s-secondary)",
          padding: "2px 6px",
          borderRadius: 4,
          color: "var(--s-fg)",
        }}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          background: "var(--s-secondary)",
          border: "1px solid var(--s-border)",
          borderRadius: "var(--s-r-md)",
          padding: "1.25rem 1.5rem",
          overflowX: "auto",
          marginBottom: "1.5rem",
          lineHeight: 1.6,
        }}
      >
        {children}
      </pre>
    ),
    // Sitat / blockquote
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: "3px solid var(--s-primary)",
          paddingLeft: "1.25rem",
          margin: "2rem 0",
          fontStyle: "italic",
          color: "var(--s-muted-fg)",
          fontSize: 18,
          lineHeight: 1.65,
        }}
      >
        {children}
      </blockquote>
    ),
    // Horisontal linje
    hr: () => (
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--s-border)",
          margin: "2.5rem 0",
        }}
      />
    ),
    // Sterk + kursiv
    strong: ({ children }) => (
      <strong style={{ fontWeight: 600, color: "var(--s-fg)" }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ fontStyle: "italic", color: "var(--s-primary)" }}>{children}</em>
    ),
    // Custom MDX-komponenter tilgjengelige uten import i .mdx-filer
    Stat,
    Sammendrag,
    Quote,
    ...components,
  };
}
