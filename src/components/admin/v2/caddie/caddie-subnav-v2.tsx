"use client";

/**
 * Caddie · sub-navigasjon (v2). Samler Samtale (chat) · Dashbord (co-agent) ·
 * Aktivitet (tidslinje) under Caddie — speiler
 * src/app/admin/(legacy)/agencyos/caddie/_caddie-subnav.tsx, restylet med
 * v2-pilltabs-mønster (Link-basert, ekte navigasjon mellom tre ruter).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "@/components/v2";

const SUBTABS = [
  { href: "/admin/agencyos/caddie", label: "Samtale", exact: true },
  { href: "/admin/agencyos/caddie/dashbord", label: "Dashbord" },
  { href: "/admin/agencyos/caddie/aktivitet", label: "Aktivitet" },
];

export function CaddieSubNavV2() {
  const path = usePathname();
  return (
    <nav aria-label="Caddie-visninger" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
      {SUBTABS.map((t) => {
        const aktiv = t.exact ? path === t.href : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={aktiv ? "page" : undefined}
            className="v2-press v2-focus"
            style={{
              appearance: "none", fontFamily: T.ui, fontSize: 13, fontWeight: 600, padding: "8px 15px", borderRadius: 9999,
              color: aktiv ? T.onLime : T.fg2, background: aktiv ? T.lime : T.panel2, border: `1px solid ${aktiv ? "transparent" : T.border}`,
              whiteSpace: "nowrap", textDecoration: "none",
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
