import React from "react";

/**
 * AK Golf HQ — Avatar
 * Circular avatar with image or initials fallback.
 * Ported 1:1 from design-handover structure/Avatar.jsx
 */

const SIZE_PX: Record<string, number> = { xs: 24, sm: 32, md: 40, lg: 52, xl: 72 };
const FONT_SIZE: Record<string, number> = { xs: 9, sm: 11, md: 14, lg: 18, xl: 24 };

function initials(name = ""): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || "?").toUpperCase();
}

export type AvatarProps = {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  style?: React.CSSProperties;
  className?: string;
};

export function Avatar({ src, name = "", size = "md", style, className = "" }: AvatarProps) {
  const [imgErr, setImgErr] = React.useState(false);
  const px = SIZE_PX[size] || 40;
  const fs = FONT_SIZE[size] || 14;
  const ini = initials(name);

  if (src && !imgErr) {
    return (
      <div
        className={`ak-av ${className}`}
        style={{ width: px, height: px, fontSize: fs, ...style }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name || "avatar"}
          onError={() => setImgErr(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`ak-av ${className}`}
      style={{ width: px, height: px, fontSize: fs, ...style }}
      aria-label={name || "avatar"}
    >
      {ini}
    </div>
  );
}

export type AvatarGroupProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function AvatarGroup({ children, className = "", style }: AvatarGroupProps) {
  return (
    <div className={`ak-av-group ${className}`} style={style}>
      {children}
    </div>
  );
}
