import { useState } from "react";
import { PLAYER } from "@/lib/hq/data";
import { PORTAL_TABS } from "@/lib/hq/nav";
import { PORTAL_TITLES, type PortalRole, type PortalScreenId, type UiState } from "@/lib/hq/types";
import { ProductLinks } from "./admin-shell";
import { cn } from "./ui";

function tabFor(screen: PortalScreenId): PortalScreenId {
  if (screen === "plan" || screen === "oktoppskrift") return "plan";
  if (screen === "analyse" || screen === "aerlig") return "analyse";
  if (screen === "i-dag") return "i-dag";
  if (["live-slag", "live-ovelse", "oppsummering", "live-desktop"].includes(screen)) return "i-dag";
  return "meg";
}

export function PortalShell({
  screen,
  onScreen,
  role,
  onRole,
  tilstand,
  live,
  children,
}: {
  screen: PortalScreenId;
  onScreen: (id: PortalScreenId) => void;
  role: PortalRole;
  onRole: (role: PortalRole) => void;
  tilstand?: UiState;
  live?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const tab = tabFor(screen);
  const hideChrome = live;

  return (
    <div
      data-brand="playerhq"
      className={cn("min-h-dvh", live ? "bg-grafitt-900 text-sand-100" : "bg-flate text-ink")}
    >
      {hideChrome ? (
        <div className="flex min-h-dvh flex-col">
          <header className="flex h-14 items-center gap-2.5 border-b border-grafitt-700 px-4">
            <img src="/ak-golf-logo.svg" alt="" className="h-6 w-7 opacity-80" />
            <span className="font-display text-sm font-semibold uppercase tracking-display">
              {PORTAL_TITLES[screen]}
            </span>
            <span className="ml-auto font-meta text-2xs text-natt-300">lokal · ikke synket</span>
          </header>
          <main className="flex-1 overflow-auto px-4 py-4">{children}</main>
        </div>
      ) : (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col xl:max-w-none xl:grid xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden flex-col gap-6 border-r border-sand-200 bg-sand-150 px-3.5 py-5 xl:flex">
            <div className="flex items-center gap-2.5 px-2">
              <img src="/ak-golf-logo.svg" alt="AK Golf" className="h-[30px] w-[34px]" />
              <span className="font-display text-md font-semibold uppercase tracking-display">PlayerHQ</span>
            </div>
            <nav>
              {PORTAL_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onScreen(t.id)}
                  className={cn(
                    "flex h-9 w-full items-center rounded-control px-2.5 text-left text-sm",
                    tab === t.id ? "bg-grafitt-900 font-medium text-sand-100" : "text-grafitt-600",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto border-t border-sand-200 px-2 pt-3">
              <ProductLinks current="portal" />
            </div>
          </aside>

          <div className="flex min-h-dvh min-w-0 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sand-200 px-4">
              <img src="/ak-golf-logo.svg" alt="" className="h-[26px] w-[30px]" />
              <span className="font-display text-md font-semibold uppercase tracking-display">
                {PORTAL_TABS.find((t) => t.id === tab)?.label ?? PORTAL_TITLES[screen]}
              </span>
              <span className="ml-auto font-meta text-xs text-grafitt-600">16:10</span>
              <span className="size-[30px] rounded-full bg-sand-400" />
            </header>
            <main className="flex-1 overflow-auto px-4 pb-[90px] xl:pb-8">{children}</main>
          </div>
        </div>
      )}

      {hideChrome ? null : (
        <nav className="fixed inset-x-0 bottom-0 z-20 grid h-[72px] grid-cols-4 border-t border-sand-200 bg-hevet pb-2 xl:hidden">
          {PORTAL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onScreen(t.id)}
              className={cn(
                "flex h-[52px] items-center justify-center text-sm",
                tab === t.id
                  ? "border-t-[3px] border-rust-500 font-semibold text-grafitt-900"
                  : "border-t-[3px] border-transparent text-grafitt-600",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
