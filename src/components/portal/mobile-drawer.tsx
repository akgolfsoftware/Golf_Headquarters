"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Tier } from "@/generated/prisma/client";

const NAV = [
  { href: "/portal", label: "Hjem" },
  { href: "/portal/tren", label: "Tren" },
  { href: "/portal/mal", label: "Mål" },
  { href: "/portal/coach", label: "Coach" },
  { href: "/portal/meg", label: "Meg" },
];

export function MobileDrawer({ tier }: { tier: Tier }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Åpne meny"
        className="grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-foreground hover:border-input lg:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        >
          <aside
            className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[var(--color-player-sidebar)] text-white"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Hovedmeny"
          >
            <div className="flex items-center justify-between px-6 py-6">
              <span className="font-display text-lg font-bold">
                AK Golf<br />
                <em className="font-normal text-accent md:italic">player</em>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Lukk meny"
                className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {NAV.map((n) => {
                const aktiv =
                  path === n.href ||
                  (n.href !== "/portal" && path.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-3 py-3 text-base transition-colors ${
                      aktiv
                        ? "bg-white/10 font-semibold text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="m-3 rounded-md bg-accent/10 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent">
              {tier}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
