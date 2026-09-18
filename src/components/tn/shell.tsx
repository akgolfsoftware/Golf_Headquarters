import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "./ds";
import { canAccessScreen, groupsVisibleTo, type Role, type TnScreen } from "@/lib/tn/access";
import { MOBILE_TABS, NAV_GROUPS, PLAYER_MOBILE_TABS, PLAYER_NAV_GROUPS, SCREEN_TITLES } from "@/lib/tn/nav";
import { TN_ACTORS } from "@/lib/tn/demo";
import { GROUPS, MEMBERSHIPS } from "@/lib/wang/data";
import type { Tilstand } from "./frame-key";
import { TnScreenBody } from "./screens";

const ALL_GROUPS = GROUPS.map((g) => g.id);

export function TnShell({
  screen,
  onScreen,
  role,
  onRole,
  tilstand = "suksess",
}: {
  screen: TnScreen;
  onScreen: (id: TnScreen) => void;
  role: Role;
  onRole: (role: Role) => void;
  tilstand?: Tilstand;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const actor = TN_ACTORS.find((a) => a.role === role) ?? TN_ACTORS[0]!;
  const groups = groupsVisibleTo(MEMBERSHIPS, actor.userId, role, ALL_GROUPS);

  const player = role === "SP" || role === "FO";
  const groupsSrc = player ? PLAYER_NAV_GROUPS : NAV_GROUPS;
  const filteredNav = useMemo(
    () =>
      groupsSrc
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => canAccessScreen(role, item.id)),
        }))
        .filter((g) => g.items.length > 0),
    [role, groupsSrc],
  );
  const tabs = player ? PLAYER_MOBILE_TABS : MOBILE_TABS;

  useEffect(() => {
    if (player && screen === "oversikt") onScreen("iup");
  }, [player, screen, onScreen]);

  const avgrenset = role !== "SS";
  const initials = (() => {
    const name = actor.hint.split("·")[0]?.trim() ?? actor.label;
    const parts = name.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }
    return actor.label.slice(0, 2).toUpperCase();
  })();

  return (
    <div
      className="tn-root"
      style={{
        minHeight: "100dvh",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-base)",
        lineHeight: "var(--leading-normal)",
        letterSpacing: "var(--tracking-normal)",
        display: "flex",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <aside
        className="hidden lg:flex"
        style={{
          width: 252,
          flexShrink: 0,
          background: "var(--surface-card)",
          borderRight: "1px solid var(--border-subtle)",
          flexDirection: "column",
          padding: "20px 14px 18px",
          gap: 20,
          position: "sticky",
          top: 0,
          height: "100dvh",
        }}
      >
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 9,
          }}
        >
          <img src="/tn/team-norway-golf.png" alt="Team Norway Golf" style={{ height: 46, width: "auto", display: "block" }} />
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-micro)",
              letterSpacing: "var(--tracking-eyebrow)",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            NGF · juniorlandslag
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0, overflow: "auto" }}>
          {filteredNav.map((group) => (
            <div key={group.heading}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-micro)",
                  letterSpacing: "var(--tracking-eyebrow)",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  padding: "16px 12px 6px",
                }}
              >
                {group.heading}
              </div>
              {group.items.map((item) => {
                const active = item.id === screen;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onScreen(item.id)}
                    style={{
                      height: 40,
                      borderRadius: "var(--radius-xs)",
                      padding: "0 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      border: 0,
                      background: active ? "var(--navy-100)" : "transparent",
                      color: active ? "var(--navy-900)" : "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 3,
                        height: 18,
                        borderRadius: "var(--radius-full)",
                        flexShrink: 0,
                        background: active ? "var(--red-600)" : "transparent",
                      }}
                    />
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{item.label}</span>
                    <div style={{ flex: 1 }} />
                    {item.badge ? (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--text-micro)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-full)",
              background: "var(--navy-100)",
              color: "var(--navy-800)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-micro)",
              fontWeight: "var(--weight-semibold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {initials}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--navy-900)" }}>
              {actor.hint.split("·")[0]?.trim()}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-micro)",
                letterSpacing: "var(--tracking-eyebrow)",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                marginTop: 1,
              }}
            >
              {actor.label}
            </div>
          </div>
        </div>
        <Link
          to="/admin"
          search={{ skjerm: "hjem", rolle: "COACH", tilstand: "normal" }}
          style={{ fontSize: "var(--text-xs)", color: "var(--navy-600)", padding: "4px 12px 0" }}
        >
          Til AgencyOS
        </Link>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 64,
            flexShrink: 0,
            background: "var(--surface-card)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 16,
          }}
        >
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Meny"
            style={{
              minHeight: 44,
              minWidth: 44,
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-full)",
              background: "transparent",
            }}
          >
            <Menu size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-micro)",
                letterSpacing: "var(--tracking-eyebrow)",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}
            >
              Team Norway
            </span>
            <span style={{ color: "var(--ink-300)" }}>/</span>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--navy-900)" }}>
              {SCREEN_TITLES[screen]}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          {avgrenset ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                background: "var(--status-amber-bg)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "var(--radius-full)",
                  background: "var(--status-amber)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--weight-semibold)",
                  color: "var(--status-amber-text)",
                }}
              >
                Avgrenset tilgang · du ser {groups.length} av 6 grupper
              </span>
            </div>
          ) : null}
          <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
            {TN_ACTORS.map((a) => (
              <button
                key={a.role}
                type="button"
                onClick={() => onRole(a.role)}
                style={{
                  minHeight: 44,
                  padding: "0 12px",
                  borderRadius: "var(--radius-full)",
                  border: a.role === role ? "1px solid var(--navy-900)" : "1px solid var(--border-default)",
                  background: a.role === role ? "var(--navy-900)" : "transparent",
                  color: a.role === role ? "var(--white)" : "var(--navy-900)",
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--weight-semibold)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "var(--tracking-eyebrow)",
                  textTransform: "uppercase",
                }}
              >
                {a.role}
              </button>
            ))}
          </div>
        </header>

        <main style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <TnScreenBody id={screen} role={role} userId={actor.userId} onOpen={onScreen} tilstand={tilstand} />
        </main>
      </div>

      <nav
        className="lg:hidden"
        style={{
          position: "fixed",
          insetInline: 0,
          bottom: 0,
          height: 76,
          background: "var(--surface-card)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "flex-start",
          padding: "8px 8px 0",
          zIndex: 20,
        }}
      >
        {tabs.map((tab) => {
          const active = tab.id !== "mer" && tab.id === screen;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                if (tab.id === "mer") setMobileOpen(true);
                else onScreen(tab.id);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                height: 52,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                border: 0,
                background: "transparent",
                color: active ? "var(--navy-900)" : "var(--text-secondary)",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 3,
                  borderRadius: "var(--radius-full)",
                  background: active ? "var(--red-600)" : "transparent",
                }}
              />
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)" }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {mobileOpen ? (
        <div className="lg:hidden" style={{ position: "fixed", inset: 0, zIndex: 40 }}>
          <button
            type="button"
            aria-label="Lukk"
            onClick={() => setMobileOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(6,17,31,.4)", border: 0 }}
          />
          <div
            style={{
              position: "absolute",
              insetBlock: 0,
              left: 0,
              width: "min(100%,20rem)",
              background: "var(--surface-card)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
              <img src="/tn/team-norway-golf.png" alt="Team Norway Golf" style={{ height: 40 }} />
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Lukk" style={{ width: 44, height: 44, border: 0, background: "transparent" }}>
                <X />
              </button>
            </div>
            <nav style={{ flex: 1, overflow: "auto", padding: 12 }}>
              {filteredNav.map((group) => (
                <div key={group.heading}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-micro)",
                      letterSpacing: "var(--tracking-eyebrow)",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                      padding: "14px 12px 6px",
                    }}
                  >
                    {group.heading}
                  </div>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onScreen(item.id);
                        setMobileOpen(false);
                      }}
                      style={{
                        height: 44,
                        width: "100%",
                        textAlign: "left",
                        padding: "0 12px",
                        border: 0,
                        background: "transparent",
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
              <Link
                to="/admin"
                search={{ skjerm: "hjem", rolle: "COACH", tilstand: "normal" }}
                style={{ display: "block", padding: 16, fontSize: "var(--text-xs)", color: "var(--navy-600)" }}
              >
                Til AgencyOS
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
