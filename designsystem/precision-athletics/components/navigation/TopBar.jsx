import React from "react";
import { IconButton } from "../core/IconButton.jsx";
export function TopBar({ title, sub, onBack, actions, transparent, leading }) {
  return (
    <header className={"pa-topbar" + (transparent ? " pa-topbar--transparent" : "")}>
      {onBack && <IconButton icon="arrow-left" label="Tilbake" onClick={onBack} style={{ marginLeft: -10 }} />}
      {leading}
      <div className="pa-topbar__title">{title}{sub && <span className="pa-topbar__sub">{sub}</span>}</div>
      {actions}
    </header>
  );
}
