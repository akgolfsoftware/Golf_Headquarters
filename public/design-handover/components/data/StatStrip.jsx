import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { KpiTile } from "./KpiTile.jsx";

/**
 * AK Golf HQ — StatStrip
 * A horizontal row of KpiTiles separated by hairline dividers.
 * Wraps with equal-width columns in a grid when wrap=true.
 * Pass gap (px, default 24) to control column spacing.
 */

export function StatStrip({ stats = [], gap = 24, wrap = false, loading = false, className = "", style }) {
  if (loading) {
    return <Skeleton variant="card" width="100%" height={72} className={className} style={style} />;
  }
  if (!stats || stats.length === 0) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: 72, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen nøkkeltall ennå</span>
      </div>
    );
  }
  if (wrap) {
    return (
      <div
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
          gap: `0`,
          ...style,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              padding: `0 ${gap}px`,
              borderLeft: i > 0 ? "1px solid var(--border)" : "none",
            }}
          >
            <KpiTile {...s} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 0,
        ...style,
      }}
    >
      {stats.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div
              style={{
                width: 1,
                alignSelf: "stretch",
                background: "var(--border)",
                margin: `0 ${gap}px`,
                flexShrink: 0,
              }}
            />
          )}
          <KpiTile {...s} />
        </React.Fragment>
      ))}
    </div>
  );
}
