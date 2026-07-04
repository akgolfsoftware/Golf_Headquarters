import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AK Golf HQ — AiTipCard
 * The surface the AI-Caddie speaks through: a sparkle mark, a mono "OPPDATERT
 * FOR X" eyebrow, a short insight (highlight a key number in lime via the
 * highlight prop or inline markup), and a subtle lime accent. Kept calm.
 */
export function AiTipCard({
  eyebrow = "AI-Caddie",
  updated,
  title,
  children,
  action,
  className = "",
  style,
}) {
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

      <div style={{ fontSize: "var(--text-14)", lineHeight: 1.55, color: "var(--text-2)" }}>
        {children}
      </div>

      {action != null && <div style={{ marginTop: 2 }}>{action}</div>}
    </div>
  );
}

/** Inline highlight for the one key number inside an AiTipCard insight. */
export function TipMetric({ children, style }) {
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
