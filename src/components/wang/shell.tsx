import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  canAccessScreen,
  groupsVisibleTo,
  type Role,
  type ScreenId,
} from "@/lib/wang/access";
import { GROUPS, MEMBERSHIPS, ROLE_ACTORS } from "@/lib/wang/data";
import { MOBILE_TABS, NAV_GROUPS, SCREEN_TITLES } from "@/lib/wang/nav";
import { WangScreen } from "./screens";

const ALL_GROUPS = GROUPS.map((g) => g.id);

export function WangShell({
  screen,
  onScreen,
  role,
  onRole,
}: {
  screen: ScreenId;
  onScreen: (id: ScreenId) => void;
  role: Role;
  onRole: (role: Role) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const actor = ROLE_ACTORS.find((a) => a.role === role)!;
  const groups = groupsVisibleTo(
    MEMBERSHIPS,
    actor.userId,
    role,
    ALL_GROUPS,
  );

  const filteredNav = useMemo(
    () =>
      NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((item) => canAccessScreen(role, item.id)),
      })).filter((g) => g.items.length > 0),
    [role],
  );

  return (
    <div
      data-brand="wang"
      className="min-h-dvh bg-wang-app font-wang-body text-wang-ink"
    >
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-wang-rail flex-col bg-wang-navy text-white lg:flex">
        <div className="flex h-[88px] items-center border-b border-white/10 px-4">
          <div className="rounded-xl bg-white px-2 py-1.5">
            <img
              src="/wang-logo-horizontal.svg"
              alt="WANG Treningsplattform"
              className="h-10 w-auto"
            />
          </div>
        </div>
        <div className="border-b border-white/10 px-5 py-3">
          <p className="font-wang-brand text-[11px] uppercase tracking-[0.08em] text-wang-mint">
            Du ser {groups.length} av 6 grupper
          </p>
          <p className="mt-1 text-sm text-white/80">WANG Golf · Fredrikstad</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {filteredNav.map((group) => (
            <div key={group.heading} className="mb-4">
              <p className="px-3 pb-1 font-wang-brand text-[11px] font-medium uppercase tracking-[0.08em] text-wang-mint/80">
                {group.heading}
              </p>
              {group.items.map((item) => {
                const active = item.id === screen;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onScreen(item.id)}
                    className={`flex h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition-colors duration-150 ${
                      active
                        ? "bg-white/15 font-semibold text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-wang-chip bg-wang-burgunder px-2 py-0.5 font-wang-brand text-[11px] font-semibold">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link
            to="/agencyos"
            className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            Til AgencyOS
          </Link>
        </div>
      </aside>

      <div className="lg:pl-wang-rail">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-wang-line bg-wang-app/95 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full bg-wang-navy text-white lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Meny"
            >
              <Menu size={20} />
            </button>
            <img
              src="/wang-crest.svg"
              alt=""
              className="hidden h-10 w-auto sm:block lg:hidden"
            />
            <div className="min-w-0">
              <p className="truncate font-wang-brand text-lg font-bold text-wang-navy">
                {SCREEN_TITLES[screen]}
              </p>
              <p className="truncate text-xs text-wang-muted">{actor.hint}</p>
            </div>
          </div>
          <div className="flex max-w-[60%] gap-1.5 overflow-x-auto">
            {ROLE_ACTORS.map((a) => (
              <button
                key={a.role}
                type="button"
                onClick={() => onRole(a.role)}
                className={`h-8 rounded-wang-chip px-3 font-wang-brand text-[11px] font-semibold active:scale-[0.97] ${
                  a.role === role
                    ? "bg-wang-navy text-white"
                    : "bg-wang-navy/10 text-wang-navy"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </header>

        <main className="px-4 py-5 pb-28 lg:px-8 lg:pb-10">
          <WangScreen
            id={screen}
            role={role}
            userId={actor.userId}
            onOpen={onScreen}
          />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-wang-line bg-white/95 px-1 py-1 backdrop-blur lg:hidden">
        {MOBILE_TABS.map((tab) => {
          const active =
            tab.id !== "mer" &&
            (tab.id === screen ||
              (tab.id === "oversikt" && screen === "oversikt"));
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                if (tab.id === "mer") setMobileOpen(true);
                else onScreen(tab.id);
              }}
              className="flex h-14 flex-col items-center justify-center gap-0.5"
            >
              <span
                className={`font-wang-brand text-[11px] font-semibold ${
                  active ? "text-wang-burgunder" : "text-wang-muted"
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`h-0.5 w-6 rounded-full ${active ? "bg-wang-burgunder" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </nav>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-wang-deep/40"
            aria-label="Lukk meny"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-wang-navy text-white shadow-wang">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="rounded-xl bg-white px-2 py-1">
                <img
                  src="/wang-logo-horizontal.svg"
                  alt="WANG"
                  className="h-9 w-auto"
                />
              </div>
              <button
                type="button"
                className="size-11 text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Lukk"
              >
                <X />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 pb-8">
              {filteredNav.map((group) => (
                <div key={group.heading} className="mb-4">
                  <p className="px-3 pb-1 font-wang-brand text-[11px] uppercase tracking-[0.08em] text-wang-mint">
                    {group.heading}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onScreen(item.id);
                        setMobileOpen(false);
                      }}
                      className="flex h-12 w-full items-center rounded-xl px-3 text-left text-sm text-white/90"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
