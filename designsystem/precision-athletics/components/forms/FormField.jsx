import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function FormField({ label, hint, error, required, optional, id, children, className }) {
  const auto = React.useId();
  const fid = id || auto;
  const hid = fid + "-hint", eid = fid + "-err";
  const described = [hint && hid, error && eid].filter(Boolean).join(" ") || undefined;
  const child = React.isValidElement(children) ? React.cloneElement(children, { id: children.props.id || fid, "aria-describedby": described, "aria-invalid": error ? true : undefined, "aria-required": required || undefined, required: children.props.required ?? required }) : children;
  return (
    <div className={cx("pa-field", "pa-formfield", error && "pa-formfield--error", className)}>
      {label && <div className="pa-formfield__top"><label className="pa-field__label" htmlFor={fid}>{label}</label>{required && <span className="pa-formfield__req">PÅKREVD</span>}{optional && !required && <span className="pa-formfield__opt">VALGFRITT</span>}</div>}
      {hint && <span id={hid} className="pa-field__hint">{hint}</span>}
      <div className="pa-formfield__control">{child}</div>
      {error && <span id={eid} className="pa-formfield__error" role="alert"><Icon name="circle-alert" size={16} /><span>{error}</span></span>}
    </div>
  );
}
export function TextInput({ mono, error, className, ...rest }) {
  return <div className={cx("pa-control", mono && "pa-control--mono", rest["aria-invalid"] && "pa-control--error", className)}><input {...rest} /></div>;
}
