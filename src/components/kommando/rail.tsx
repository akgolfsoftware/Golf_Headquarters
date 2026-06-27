"use client";

// Venstre ikon-rail for /kommando. Dashboard/Agenter/Oppgaver er aktive i
// Etappe 1; Kalender/Prosjekter/Team er dimmet (kommer E2–E4).
// Aktiv lenke får lime flate + mørk tekst (i .dark er primary=accent=lime, så
// vi MÅ bruke text-accent-foreground, ikke text-primary — jf. design-porting-gate).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, ListChecks, Calendar, Folder, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type RailItem = {
  href: string | null;
  label: string;
  icon: typeof LayoutDashboard;
};

const ITEMS: RailItem[] = [
  { href: "/kommando", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kommando/agenter", label: "Agenter", icon: Bot },
  { href: "/kommando/oppgaver", label: "Oppgaver", icon: ListChecks },
  { href: "/kommando/kalender", label: "Kalender", icon: Calendar },
  { href: "/kommando/prosjekter", label: "Prosjekter", icon: Folder },
  { href: "/kommando/team", label: "Team", icon: Users },
];

export function KommandoRail() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 border-r border-border p-2">
      {ITEMS.map((it) => {
        const Icon = it.icon;
        const isActive =
          it.href != null &&
          (it.href === "/kommando" ? pathname === "/kommando" : pathname.startsWith(it.href));
        const base =
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors";

        if (it.href == null) {
          return (
            <span
              key={it.label}
              title={`${it.label} (kommer)`}
              aria-label={`${it.label} (kommer)`}
              className={cn(base, "text-muted-foreground/30")}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </span>
          );
        }

        return (
          <Link
            key={it.label}
            href={it.href}
            title={it.label}
            aria-label={it.label}
            className={cn(
              base,
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        );
      })}
    </nav>
  );
}
