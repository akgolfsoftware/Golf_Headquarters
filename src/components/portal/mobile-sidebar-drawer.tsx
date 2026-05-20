"use client";

// Mobil-drawer som wrapper PortalSidebar for skjermer < md (768px).
// Trigger via hamburger-knapp i header. Lukkes på ESC, backdrop-klikk eller
// route-endring.

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { PortalSidebar } from "./sidebar";
import type { Tier } from "@/generated/prisma/client";

type Props = {
  tier: Tier;
  varslerUlest?: number;
};

export function MobileSidebarDrawer({ tier, varslerUlest = 0 }: Props) {
  const [open, setOpen] = useState(false);

  // ESC for å lukke + body scroll-lock.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Lukk drawer når bruker klikker en lenke inni panelet.
  function handlePanelClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("a")) {
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Åpne meny"
        aria-expanded={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Hovedmeny"
          className="fixed inset-0 z-[80] md:hidden"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Lukk meny"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          {/* Drawer-panel */}
          <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-[var(--color-player-sidebar)] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Lukk meny"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </button>
            <div
              className="flex-1 overflow-y-auto"
              onClick={handlePanelClick}
            >
              <PortalSidebar tier={tier} varslerUlest={varslerUlest} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
