import React from "react";
import { Button } from "../core/Button.jsx";
import { Eyebrow } from "../core/Eyebrow.jsx";

/**
 * AK Golf HQ — FeaturedCard
 * One featured hero card for marketing: a full-bleed photo (or forest surface)
 * under a forest scrim, with eyebrow, title, optional description and a CTA pill.
 * Forest is the marketing brand surface; lime stays the accent.
 */
export function FeaturedCard({
  image,
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaVariant = "primary",
  onCta,
  href,
  height = 340,
  eyebrowLarge = false,
  align = "bottom", // "bottom" | "center"
  className = "",
  style,
}) {
  const scrim = image
    ? "linear-gradient(180deg, rgba(4,36,26,0.15) 0%, rgba(4,36,26,0.35) 45%, rgba(4,36,26,0.88) 100%)"
    : "linear-gradient(160deg, var(--forest-700) 0%, var(--forest-900) 100%)";
  const justify = align === "center" ? "center" : "flex-end";
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-sheet)",
        minHeight: height,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        backgroundColor: "var(--forest-900)",
        backgroundImage: image ? `url(${image})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        isolation: "isolate",
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: scrim, zIndex: 0 }} />
      <div
        className="dark"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "var(--space-8)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          alignItems: align === "center" ? "center" : "flex-start",
          textAlign: align === "center" ? "center" : "left",
          maxWidth: 540,
        }}
      >
        {eyebrow != null && (
          <Eyebrow
            tone="signal"
            style={eyebrowLarge ? { fontSize: "var(--text-18)", fontWeight: 700, letterSpacing: "0.12em" } : undefined}
          >
            {eyebrow}
          </Eyebrow>
        )}
        {title != null && (
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-30)",
              lineHeight: 1.1,
              letterSpacing: "var(--tracking-display)",
              color: "var(--on-destructive)",
              margin: 0,
            }}
          >
            {title}
          </h3>
        )}
        {description != null && (
          <p
            style={{
              fontSize: "var(--text-14)",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.82)",
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
        {ctaLabel != null && (
          <div style={{ marginTop: "var(--space-2)" }}>
            <Button variant={ctaVariant} as={href ? "a" : "button"} href={href} onClick={onCta} iconRight="arrow-right">
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
