"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SubNavItem = {
  href: string;
  label: string;
};

export function SubNav({ items }: { items: SubNavItem[] }) {
  const path = usePathname();

  return (
    <nav className="mb-6 -mx-4 sm:mx-0">
      <div className="flex gap-1 overflow-x-auto border-b border-border px-4 sm:px-0 scrollbar-none">
        {items.map((item) => {
          const aktiv =
            path === item.href ||
            (item.href !== items[0]?.href && path.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative shrink-0 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:underline ${
                aktiv
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground active:text-foreground/80"
              }`}
            >
              {item.label}
              {aktiv && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
