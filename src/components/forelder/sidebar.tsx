"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

const NAV = [
  { href: "/forelder", label: "Oversikt" },
  { href: "/forelder/barn", label: "Mine barn" },
  { href: "/forelder/ukerapport", label: "Ukerapport" },
  { href: "/forelder/fakturaer", label: "Fakturaer" },
  { href: "/forelder/varsler", label: "Varsler" },
];

export function ForelderSidebar() {
  const path = usePathname();
  return (
    <aside
      aria-label="Foreldreportal sidemeny"
      className="flex w-56 shrink-0 flex-col bg-primary text-primary-foreground"
    >
      <div className="px-6 py-8">
        <Link href="/forelder" aria-label="AK Golf — Foreldreportal" className="inline-flex flex-col gap-2">
          <AkGolfLogo variant="white" width={48} />
          <span className="font-display text-base font-bold leading-none tracking-tight">
            <em className="font-normal text-accent md:italic">forelder</em>
          </span>
        </Link>
      </div>
      <nav aria-label="Hovednavigasjon" className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const aktiv = path === n.href || (n.href !== "/forelder" && path.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={aktiv ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
                aktiv
                  ? "bg-primary-foreground/10 font-semibold text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div
        aria-label="Foreldreportal"
        className="m-3 rounded-md bg-accent/20 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        FORELDER
      </div>
    </aside>
  );
}
