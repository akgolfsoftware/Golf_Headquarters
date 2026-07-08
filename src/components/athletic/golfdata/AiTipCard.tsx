import type React from "react";
import { Icon } from "./Icon";

/**
 * AK Golf HQ — AiTipCard
 * Portet fra design-handover v14 (components/feedback/AiTipCard.jsx). Flaten
 * AI-Caddie snakker gjennom: sparkle-merke, mono «OPPDATERT FOR X»-eyebrow,
 * en kort innsikt (fremhev ett nøkkeltall via TipMetric), og en svak
 * lime-aksent. Kun ekte, datastøttet innsikt — aldri oppdiktet tekst.
 */

export type AiTipCardProps = {
  eyebrow?: React.ReactNode;
  updated?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function AiTipCard({
  eyebrow = "AI-Caddie",
  updated,
  title,
  children,
  action,
  className = "",
  style,
}: AiTipCardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface)",
        border: "1px solid color-mix(in srgb, var(--signal) 22%, var(--border))",
        borderRadius: "var(--radius-card)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 9999,
            background: "color-mix(in srgb, var(--signal) 16%, transparent)",
            color: "var(--signal)",
            flex: "none",
          }}
        >
          <Icon name="sparkles" size={16} />
        </span>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: "var(--text-11)",
            letterSpacing: "var(--tracking-eyebrow)",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {eyebrow}
          {updated ? ` · Oppdatert for ${updated}` : ""}
        </div>
      </div>

      {title != null && (
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "var(--text-16)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--text)",
          }}
        >
          {title}
        </div>
      )}

      <div style={{ fontSize: "var(--text-15)", lineHeight: 1.55, color: "var(--text-2)" }}>{children}</div>

      {action != null && <div style={{ marginTop: 2 }}>{action}</div>}
    </div>
  );
}

/** Inline-fremheving for det ene nøkkeltallet inni en AiTipCard-innsikt. */
export function TipMetric({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <strong
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        color: "var(--signal)",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {children}
    </strong>
  );
}
