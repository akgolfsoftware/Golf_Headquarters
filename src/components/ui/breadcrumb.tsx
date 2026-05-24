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
        "flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          aria-label="Tilbake"
        >
          <ChevronLeft size={14} aria-hidden />
        </Link>
      )}
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
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
