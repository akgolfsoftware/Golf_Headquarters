"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  Users as UsersIcon,
  CalendarRange,
  Receipt,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

const NAV = [
  { href: "/forelder", label: "Oversikt", Icon: HomeIcon },
  { href: "/forelder/barn", label: "Mine barn", Icon: UsersIcon },
  { href: "/forelder/ukerapport", label: "Ukerapport", Icon: CalendarRange },
  { href: "/forelder/fakturaer", label: "Fakturaer", Icon: Receipt },
  { href: "/forelder/varsler", label: "Varsler", Icon: Bell },
  { href: "/forelder/samtykke", label: "Samtykker", Icon: ShieldCheck },
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
      <nav aria-label="Hovednavigasjon" className="flex-1 space-y-1 px-4">
        {NAV.map((n) => {
          const aktiv = path === n.href || (n.href !== "/forelder" && path.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={aktiv ? "page" : undefined}
              className={`block rounded-md px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
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
        className="m-4 rounded-md bg-accent/20 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-accent"
      >
        FORELDER
      </div>
    </aside>
  );
}

export function ForelderMobileNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Foreldreportal mobil-navigasjon"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-primary text-primary-foreground lg:hidden pb-[env(safe-area-inset-bottom)]"
    >
      {NAV.map((n) => {
        const aktiv = path === n.href || (n.href !== "/forelder" && path.startsWith(n.href));
        const Icon = n.Icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={aktiv ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors ${
              aktiv
                ? "text-primary-foreground"
                : "text-primary-foreground/60 hover:text-primary-foreground"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            <span className="leading-none">{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
