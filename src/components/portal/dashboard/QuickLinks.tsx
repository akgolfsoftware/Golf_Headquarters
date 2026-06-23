"use client";

import Link from "next/link";
import { BarChart3, MessageSquare, Plus, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickLinksProps = {
  className?: string;
};

export function QuickLinks({ className }: QuickLinksProps) {
  const links = [
    { href: "/portal/ny-okt", label: "Ny økt", icon: Plus },
    { href: "/portal/mal/runder", label: "Logg runde", icon: Flag },
    { href: "/portal/analysere", label: "Analyser", icon: BarChart3 },
    { href: "/portal/coach", label: "Coach", icon: MessageSquare },
  ];

  return (
    <nav aria-label="Snarveier" className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2", className)}>
      {links.map((l) => {
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-secondary"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon size={18} strokeWidth={1.75} aria-hidden />
            </div>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
