/**
 * Felles sidebar + topbar for CoachHQ-stubs (Batch D Claude Design).
 * Wraps children inside .coachhq-stubs-scope + .app-cs > .main > children.
 */

import "./styles.css";
import { CoachhqStubsSprite } from "./icons";

type NavItem = {
  icon: string;
  label: string;
  active?: boolean;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS_DEFAULT: NavGroup[] = [
  {
    label: "Oversikt",
    items: [
      { icon: "ic-home", label: "Hjem" },
      { icon: "ic-bolt", label: "Daglig brief" },
      { icon: "ic-inbox", label: "Innboks", badge: "7" },
      { icon: "ic-target", label: "Tildelt meg", badge: "14" },
    ],
  },
  {
    label: "Stall",
    items: [
      { icon: "ic-users", label: "Spillere" },
      { icon: "ic-bar", label: "Talent-radar" },
    ],
  },
  {
    label: "Planlegge",
    items: [
      { icon: "ic-cal", label: "Årsplan" },
      { icon: "ic-file-text", label: "Plan-maler" },
    ],
  },
  {
    label: "Gjennomføre",
    items: [
      { icon: "ic-card", label: "Bookinger" },
      { icon: "ic-clipboard", label: "Test-økt" },
    ],
  },
  {
    label: "Innsikt",
    items: [{ icon: "ic-check", label: "Godkjenninger", badge: "11" }],
  },
  {
    label: "Admin",
    items: [{ icon: "ic-settings", label: "Innstillinger" }],
  },
];

export type Crumb = { label: string; current?: boolean; brand?: boolean };

type Props = {
  activeLabel: string;
  crumbs: Crumb[];
  children: React.ReactNode;
};

export function CoachhqStubsShell({ activeLabel, crumbs, children }: Props) {
  return (
    <div className="coachhq-stubs-scope">
      <CoachhqStubsSprite />

      <div className="app-cs">
        {/* Sidebar */}
        <aside className="sidebar sb-cs">
          <div className="sidebar-brand">
            <div className="name">AK GOLF</div>
            <div className="meta">COACHHQ · HEAD COACH</div>
          </div>
          <div className="sidebar-profile">
            <div className="avatar">AK</div>
            <div>
              <div className="nm">Anders K.</div>
              <div className="role">38 spillere</div>
            </div>
          </div>

          {NAV_GROUPS_DEFAULT.map((g) => (
            <div key={g.label} className="nav-group">
              <div className="nav-group-label">{g.label}</div>
              {g.items.map((it) => {
                const isActive = it.label === activeLabel;
                return (
                  <button
                    key={it.label}
                    className={`nav-item${isActive ? " active" : ""}`}
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <use href={`#${it.icon}`} />
                    </svg>
                    {it.label}
                    {it.badge && <span className="badge-count">{it.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="main">
          <header className="topbar tb-cs">
            <div className="crumb">
              {crumbs.map((c, i) => (
                <span key={i} style={{ display: "contents" }}>
                  <span
                    className={
                      c.brand ? "brand-link" : c.current ? "current" : undefined
                    }
                  >
                    {c.label}
                  </span>
                  {i < crumbs.length - 1 && <span className="sep">/</span>}
                </span>
              ))}
            </div>
            <div className="tb-right">
              <button className="tb-icon-btn" type="button" aria-label="Søk">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <use href="#ic-search" />
                </svg>
              </button>
              <button className="tb-icon-btn" type="button" aria-label="Varsler">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <use href="#ic-bell" />
                </svg>
                <span className="dot-notif" aria-hidden />
              </button>
            </div>
          </header>

          <div className="page-cs">{children}</div>
        </main>
      </div>
    </div>
  );
}
