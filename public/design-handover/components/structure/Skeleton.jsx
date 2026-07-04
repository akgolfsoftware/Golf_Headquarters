import React from "react";

/**
 * AK Golf HQ — Skeleton / SkeletonRow
 * Shimmer placeholder shown while content loads.
 * variant: text (14px bar) · title (20px bar) · circle · card.
 * SkeletonRow: stacked lines with title + N body lines, variable width.
 */

const CSS = `
@keyframes ak-shimmer{
  0%{background-position:200% 0}
  100%{background-position:-200% 0}
}
.ak-sk{
  border-radius:var(--radius-tag);
  background:linear-gradient(
    90deg,
    var(--surface-2) 25%,
    var(--surface-hover) 50%,
    var(--surface-2) 75%
  );
  background-size:200% 100%;
  animation:ak-shimmer 1.8s ease-in-out infinite;
  flex-shrink:0;
}
.ak-sk--text{height:14px;border-radius:4px;}
.ak-sk--title{height:20px;border-radius:6px;}
.ak-sk--circle{border-radius:9999px;}
.ak-sk--card{border-radius:var(--radius-card);}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-sk-css")) {
  const s = document.createElement("style");
  s.id = "ak-sk-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Skeleton({ variant = "text", width = "100%", height, style, className = "" }) {
  const baseH = { text: 14, title: 20 }[variant];
  return (
    <div
      className={`ak-sk ak-sk--${variant} ${className}`}
      style={{ width, height: height || baseH, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonRow({ lines = 2, style }) {
  const widths = ["60%", "100%", "85%", "70%", "90%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      <Skeleton variant="title" width="55%" />
      {Array.from({ length: lines - 1 }, (_, i) => (
        <Skeleton key={i} width={widths[(i + 1) % widths.length]} />
      ))}
    </div>
  );
}
