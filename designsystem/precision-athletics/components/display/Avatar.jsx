import React from "react";
export function Avatar({ name = "", src, size = 36 }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return <span className="pa-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} title={name}>{src ? <img src={src} alt="" /> : initials}</span>;
}
