"use client";

import React from "react";

/**
 * AK Golf HQ — Avatar / AvatarGroup
 * Circular avatar with image or initials fallback.
 * Sizes: xs 24 / sm 32 / md 40 / lg 52 / xl 72.
 * AvatarGroup stacks avatars with overlap; shows +N overflow.
 * Portet 1:1 fra Claude Design-prosjektets components/structure/Avatar.jsx
 * (hentet via DesignSync 2026-07-08). CSS: ./golfdata.css (.ak-av).
 */

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 52, xl: 72 };
const FONT_SIZE: Record<AvatarSize, number> = { xs: 9, sm: 11, md: 14, lg: 18, xl: 24 };

function initials(name = ""): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || "?").toUpperCase();
}

export type AvatarProps = {
  src?: string;
  name?: string;
  size?: AvatarSize;
  style?: React.CSSProperties;
  className?: string;
};

export function Avatar({ src, name = "", size = "md", style, className = "" }: AvatarProps) {
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
      {src && !imgErr ? (
        // eslint-disable-next-line @next/next/no-img-element -- 1:1 port fra DS-kontrakten; liten dekorativ avatar med onError-fallback
        <img src={src} alt={name} onError={() => setImgErr(true)} />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export type AvatarGroupProps = {
  avatars?: AvatarProps[];
  max?: number;
  size?: AvatarSize;
};

export function AvatarGroup({ avatars = [], max = 5, size = "sm" }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const px = SIZE_PX[size] || 32;
  return (
    <div className="ak-av-group">
      {visible.map((a, i) => (
        <Avatar key={i} {...a} size={size} />
      ))}
      {overflow > 0 && (
        <span className="ak-av-overflow" style={{ width: px, height: px }}>
          +{overflow}
        </span>
      )}
    </div>
  );
}
