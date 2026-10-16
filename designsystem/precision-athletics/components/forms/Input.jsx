import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Input({ label, hint, error, prefix, suffix, mono, size = "md", disabled, id, className, ...rest }) {
  const iid = id || React.useId();
  return (
    <div className={cx("pa-field", className)}>
      {label && <label className="pa-field__label" htmlFor={iid}>{label}</label>}
      <div className={cx("pa-control", mono && "pa-control--mono", error && "pa-control--error", size === "lg" && "pa-control--lg", disabled && "pa-control--disabled")}>
        {prefix && <span className="pa-control__affix">{prefix}</span>}
        <input id={iid} disabled={disabled} aria-invalid={!!error || undefined} {...rest} />
        {suffix && <span className="pa-control__affix">{suffix}</span>}
      </div>
      {(error || hint) && <span className={cx("pa-field__hint", error && "pa-field__hint--error")}>{error || hint}</span>}
    </div>
  );
}
