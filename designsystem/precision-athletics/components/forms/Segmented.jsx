import React from "react";
import { Icon } from "../core/Icon.jsx";
const cx = (...a) => a.filter(Boolean).join(" ");

export function Segmented({ options = [], value, onChange, size = "md", fullWidth, className }) {
  const [inner, setInner] = React.useState(value ?? (options[0] && (options[0].value ?? options[0])));
  const cur = value ?? inner;
  return (
    <div role="group" className={cx("pa-seg", size === "lg" && "pa-seg--lg", fullWidth && "pa-seg--full", className)}>
      {options.map((o) => {
        const v = o.value ?? o, l = o.label ?? o;
        return <button key={v} type="button" className="pa-seg__opt" aria-pressed={cur === v} onClick={() => { setInner(v); onChange && onChange(v); }}>{o.icon && <Icon name={o.icon} size={16} />}{l}</button>;
      })}
    </div>
  );
}
