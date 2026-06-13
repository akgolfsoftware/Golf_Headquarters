"use client";

/**
 * Mobile drawer for AgencyOS — hamburger-knapp + slide-in fra venstre.
 * Vises kun på < md. Rendrer samme nav-struktur som desktop-sidebaren
 * fra delt config i `@/lib/admin-nav` (tekstlenker, ingen ikoner/badges).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SidebarBrand } from "@/components/shared/sidebar-brand";
import { buildAdminNav, leafActive } from "@/lib/admin-nav";

export function AdminMobileDrawer({ workbenchHref }: { workbenchHref: string }) {
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
        className="grid h-11 w-11 place-items-center rounded-md border border-border bg-card text-foreground hover:border-input active:border-input/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <Menu width={20} height={20} aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        >
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--color-coach-sidebar)] text-white"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="AgencyOS-meny"
          >
            <div className="relative flex justify-center px-4 py-6">
              <div>
                <SidebarBrand variant="coach" role="HEAD COACH" />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Lukk meny"
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X width={20} height={20} aria-hidden />
              </button>
            </div>
            <nav
              aria-label="Hovednavigasjon"
              className="flex-1 space-y-6 overflow-y-auto px-4 pb-6"
            >
              {buildAdminNav(workbenchHref).map((section) => (
                <div key={section.label}>
                  <div className="px-4 pb-1 pt-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">
                    {section.label}
                  </div>
                  {section.items.map((it) => {
                    if (it.type === "item") {
                      const aktiv = leafActive(path, it);
                      return (
                        <Link
                          key={it.key}
                          href={it.href}
                          onClick={() => setOpen(false)}
                          aria-current={aktiv ? "page" : undefined}
                          className={`relative block min-h-11 rounded-md px-4 py-2.5 text-base transition-colors ${
                            aktiv
                              ? "bg-[var(--color-accent-fill)] font-semibold text-white before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {it.label}
                        </Link>
                      );
                    }
                    return (
                      <div key={it.key}>
                        <div className="mb-1 flex items-center px-4 py-2.5 text-base font-semibold text-white">
                          {it.label}
                        </div>
                        <div className="ml-4 space-y-0.5 border-l border-white/10 pl-1">
                          {it.children.map((c) => {
                            const aktiv = leafActive(path, c);
                            return (
                              <Link
                                key={c.key}
                                href={c.href}
                                onClick={() => setOpen(false)}
                                aria-current={aktiv ? "page" : undefined}
                                className={`relative block min-h-11 rounded-md px-4 py-2.5 text-base transition-colors ${
                                  aktiv
                                    ? "bg-[var(--color-accent-fill)] font-semibold text-white before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-[var(--color-brand-accent)]"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                {c.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
