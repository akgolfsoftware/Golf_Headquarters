import React from "react";

/**
 * AK Golf HQ — Avatar / AvatarGroup
 * Circular avatar with image or initials fallback.
 * Sizes: xs 24 / sm 32 / md 40 / lg 52 / xl 72.
 * AvatarGroup stacks avatars with overlap; shows +N overflow.
 */

const SIZE_PX = { xs: 24, sm: 32, md: 40, lg: 52, xl: 72 };
const FONT_SIZE = { xs: 9, sm: 11, md: 14, lg: 18, xl: 24 };

const CSS = `
.ak-av{
  display:inline-flex;align-items:center;justify-content:center;
  border-radius:9999px;overflow:hidden;flex-shrink:0;
  background:var(--surface-2);border:1px solid var(--border);
  font-family:var(--font-ui);font-weight:600;
  color:var(--text-2);user-select:none;
}
.ak-av img{width:100%;height:100%;object-fit:cover;}
.ak-av-group{display:flex;align-items:center;}
.ak-av-group .ak-av{margin-left:-8px;border:2px solid var(--bg);}
.ak-av-group .ak-av:first-child{margin-left:0;}
.ak-av-overflow{
  display:inline-flex;align-items:center;justify-content:center;
  border-radius:9999px;background:var(--surface-2);
  border:2px solid var(--bg);margin-left:-8px;
  font-family:var(--font-mono);font-size:11px;font-weight:600;color:var(--text-muted);
  flex-shrink:0;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-av-css")) {
  const s = document.createElement("style");
  s.id = "ak-av-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || "?").toUpperCase();
}

export function Avatar({ src, name = "", size = "md", style, className = "" }) {
  const [imgErr, setImgErr] = React.useState(false);
  const px = SIZE_PX[size] || 40;
  const fs = FONT_SIZE[size] || 14;
  return (
    <span
      className={`ak-av ${className}`}
      style={{ width: px, height: px, fontSize: fs, ...style }}
      title={name}
      aria-label={name}
    >
      {src && !imgErr
        ? <img src={src} alt={name} onError={() => setImgErr(true)} />
        : initials(name)}
    </span>
  );
}

export function AvatarGroup({ avatars = [], max = 5, size = "sm" }) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const px = SIZE_PX[size] || 32;
  return (
    <div className="ak-av-group">
      {visible.map((a, i) => <Avatar key={i} {...a} size={size} />)}
      {overflow > 0 && (
        <span className="ak-av-overflow" style={{ width: px, height: px }}>
          +{overflow}
        </span>
      )}
    </div>
  );
}
