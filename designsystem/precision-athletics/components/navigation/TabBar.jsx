import React from "react";
import { Icon } from "../core/Icon.jsx";
export const PLAYERHQ_TABS = [
  { id: "idag", label: "I dag", icon: "sun" },
  { id: "plan", label: "Plan", icon: "calendar-days" },
  { id: "analyse", label: "Analyse", icon: "chart-no-axes-column" },
  { id: "meg", label: "Meg", icon: "user" },
];
export function TabBar({ tabs = PLAYERHQ_TABS, active, onSelect }) {
  return (
    <nav className="pa-tabbar" aria-label="Hovedmeny">
      {tabs.map((t) => (
        <button key={t.id} type="button" className="pa-tabbar__item" aria-current={active === t.id ? "page" : undefined} onClick={() => onSelect && onSelect(t.id)}>
          <Icon name={t.icon} size={22} />{t.label}
        </button>
      ))}
    </nav>
  );
}
