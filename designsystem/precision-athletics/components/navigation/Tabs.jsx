import React from "react";
export function Tabs({ tabs = [], value, onChange, className }) {
  const [inner, setInner] = React.useState(value ?? (tabs[0] && (tabs[0].value ?? tabs[0])));
  const cur = value ?? inner;
  return (
    <div role="tablist" className={"pa-tabs " + (className || "")}>
      {tabs.map((t) => {
        const v = t.value ?? t, l = t.label ?? t;
        return <button key={v} role="tab" type="button" className="pa-tab" aria-selected={cur === v} onClick={() => { setInner(v); onChange && onChange(v); }}>{l}{t.count != null && <span className="pa-tab__count">{t.count}</span>}</button>;
      })}
    </div>
  );
}
