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
    <nav className="mb-6 flex gap-1 border-b border-border">
      {items.map((item) => {
        const aktiv =
          path === item.href ||
          (item.href !== items[0]?.href && path.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline ${
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
    </nav>
  );
}
