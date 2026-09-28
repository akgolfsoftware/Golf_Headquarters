import React from "react";
import { Icon } from "./Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function IconButton({ icon, label, variant = "ghost", size = "md", className, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label} className={cx("pa-iconbtn", variant !== "ghost" && "pa-iconbtn--" + variant, size === "sm" && "pa-iconbtn--sm", className)} {...rest}>
      <Icon name={icon} size={size === "sm" ? 16 : 20} />
    </button>
  );
}
