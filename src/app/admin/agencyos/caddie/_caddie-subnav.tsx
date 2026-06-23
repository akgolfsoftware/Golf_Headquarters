"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUBTABS = [
  { href: "/admin/agencyos/caddie", label: "Samtale", exact: true },
  { href: "/admin/agencyos/caddie/dashbord", label: "Dashbord" },
  { href: "/admin/agencyos/caddie/aktivitet", label: "Aktivitet" },
];

/**
 * Sub-navigasjon for Caddie-skjermen: Samtale (chat) · Dashbord (co-agent:
 * utkast/fleet/logg) · Aktivitet (tidslinje). Samler de tre visningene under
 * Caddie-fanen.
 */
export function CaddieSubNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Caddie-visninger"
      className="mb-4 flex items-center gap-1 border-b border-border"
    >
      {SUBTABS.map((t) => {
        const aktiv = t.exact ? path === t.href : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={aktiv ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.10em] transition-colors ${
              aktiv
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
