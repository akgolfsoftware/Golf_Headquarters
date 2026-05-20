"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/agencyos", label: "I dag" },
  { href: "/admin/agencyos/uka", label: "Uka" },
  { href: "/admin/agencyos/spillere", label: "Spillere" },
  { href: "/admin/agencyos/okonomi", label: "Økonomi" },
  { href: "/admin/agencyos/caddie", label: "Caddie" },
];

export function AgencyOSTabNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="AgencyOS-faner"
      className="flex items-center gap-1 overflow-x-auto rounded-md border border-border bg-card p-1 sm:flex-wrap"
    >
      {TABS.map((t) => {
        const aktiv = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={aktiv ? "page" : undefined}
            className={`shrink-0 rounded-sm px-3 py-2 font-mono text-[11px] uppercase tracking-[0.10em] transition-colors sm:px-4 sm:py-1.5 ${
              aktiv
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
