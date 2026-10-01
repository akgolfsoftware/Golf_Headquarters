import React from "react";
import { Icon } from "./Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Button({ variant = "primary", size = "md", icon, iconRight, fullWidth, loading, loadingText = "Lagrer …", disabled, children, className, ...rest }) {
  const is = size === "sm" ? 16 : size === "xl" ? 22 : 18;
  return (
    <button type="button" className={cx("pa-btn", "pa-btn--" + variant, size !== "md" && "pa-btn--" + size, fullWidth && "pa-btn--full", !loading && icon && children != null && "pa-btn--icon-l", !loading && iconRight && children != null && "pa-btn--icon-r", className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="pa-btn__loading">{loadingText}</span> : (<>
        {icon && <Icon name={icon} size={is} />}
        {children}
        {iconRight && <Icon name={iconRight} size={is} />}
      </>)}
    </button>
  );
}
