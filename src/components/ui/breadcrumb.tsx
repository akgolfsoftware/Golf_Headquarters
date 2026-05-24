import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
  backHref?: string;
};

/**
 * Breadcrumb-navigasjon med chevron-left + parent-rute.
 *
 * Bruk:
 * <Breadcrumb
 *   items={[{ label: "Tren", href: "/portal/tren" }, { label: "FYS-planer" }]}
 *   backHref="/portal/tren"
 * />
 */
export function Breadcrumb({ items, className, backHref }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-2 overflow-x-auto scrollbar-none font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          className="flex h-11 w-11 shrink-0 items-center justify-center -ml-2 hover:text-foreground transition-colors sm:h-auto sm:w-auto sm:ml-0"
          aria-label="Tilbake"
        >
          <ChevronLeft size={18} aria-hidden />
        </Link>
      )}
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast && "font-semibold text-foreground",
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-muted-foreground/50">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
