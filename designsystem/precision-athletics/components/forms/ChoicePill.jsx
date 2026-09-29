import React from "react";
const cx = (...a) => a.filter(Boolean).join(" ");

export function ChoicePill({ selected, axis, size = "md", mono, kbd, children, className, ...rest }) {
  return (
    <button type="button" aria-pressed={!!selected} className={cx("pa-choice", size === "lg" && "pa-choice--lg", mono && "pa-choice--mono", axis && "pa-choice--axis pa-choice--" + axis, className)} {...rest}>
      {axis && <span className="pa-choice__dot" />}
      {children}
      {kbd && <span className="pa-choice__kbd">{kbd}</span>}
    </button>
  );
}
