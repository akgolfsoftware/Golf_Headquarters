// ============================================================
// DirBRail — ported 1:1 from v10 workbench-dir-b.jsx (DirBRail).
// 56px icon rail: 7 nav items (Sesong active, Turneringer count 2),
// divider, settings, avatar pinned at the bottom.
// ============================================================
import { Icon } from "./icon";

const RAIL_ITEMS: { n: string; active?: boolean; label: string; ct?: number }[] = [
  { n: "calendar-range", active: true, label: "Sesong" },
  { n: "layers", label: "Planer" },
  { n: "layout-grid", label: "Standardøkter" },
  { n: "flag", label: "Turneringer", ct: 2 },
  { n: "clipboard-list", label: "Treningsplaner" },
  { n: "target", label: "Mål" },
  { n: "bar-chart-3", label: "Stats" },
];

export function DirBRail() {
  return (
    <div className="wbb-rail">
      {RAIL_ITEMS.map((it, i) => (
        <button
          key={i}
          type="button"
          className={"wbb-rail-btn" + (it.active ? " is-active" : "")}
          title={it.label}
        >
          <Icon n={it.n} w={18} h={18} />
          {it.ct && <span className="ct">{it.ct}</span>}
        </button>
      ))}
      <div className="wbb-rail-div" />
      <button type="button" className="wbb-rail-btn" title="Innstillinger">
        <Icon n="settings" w={18} h={18} />
      </button>
      <div className="av-b">MR</div>
    </div>
  );
}
