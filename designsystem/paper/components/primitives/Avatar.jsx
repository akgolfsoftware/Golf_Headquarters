import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-avatar{display:grid;place-items:center;border-radius:50%;flex:none;box-sizing:border-box;background:var(--soft);color:var(--muted);font-family:var(--mono);font-weight:600;letter-spacing:.02em;overflow:hidden;user-select:none}
.akhq-avatar img{width:100%;height:100%;object-fit:cover;display:block}
}
@layer akhq-modifier{
.akhq-avatar--sm{width:28px;height:28px;font-size:9px}
.akhq-avatar--md{width:36px;height:36px;font-size:10px}
.akhq-avatar--lg{width:48px;height:48px;font-size:13px}
.akhq-avatar--ink{background:var(--fg);color:var(--bg)}
.akhq-avatar--outline{background:transparent;color:var(--muted);border:1px solid var(--border)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-avatar")) { const s = document.createElement("style"); s.id = "akhq-css-avatar"; s.textContent = css; document.head.appendChild(s); }
export function initialsFrom(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
export function Avatar({ name = "", initials, src, size = "md", tone = "soft", decorative = false, dataOdId = "avatar", ...rest }) {
  const text = initials || initialsFrom(name);
  const a11y = decorative || !name ? { "aria-hidden": "true" } : { role: "img", "aria-label": name };
  return (
    <span className={"akhq-avatar akhq-avatar--" + size + (tone !== "soft" ? " akhq-avatar--" + tone : "")} data-od-id={dataOdId} {...a11y} {...rest}>
      {src ? <img src={src} alt="" /> : text}
    </span>
  );
}
Avatar.initials = initialsFrom;
