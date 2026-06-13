import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

export type LiveSessionShellProps = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  closeHref?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Full-screen mørk skall for live-økt.
 *
 * Mørk fullscreen-skall med foreground-bakgrunn, store touch-mål og safe-area-håndtering for mobil.
 */
export function LiveSessionShell({
  title,
  subtitle,
  backHref,
  closeHref,
  children,
  footer,
}: LiveSessionShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-foreground text-background"
      style={{ isolation: "isolate" }}
    >
      {/* Header */}
      <header
        className="flex h-16 flex-shrink-0 items-center justify-between gap-4 px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Tilbake"
            className="grid h-12 w-12 place-items-center rounded-full border border-background/15 bg-background/5 text-background/80 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
          </Link>
        ) : (
          <span className="w-12" />
        )}

        <div className="min-w-0 text-center">
          {subtitle && (
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent/80">
              {subtitle}
            </div>
          )}
          {title && (
            <div className="truncate font-display text-sm font-semibold text-background/90">
              {title}
            </div>
          )}
        </div>

        {closeHref ? (
          <Link
            href={closeHref}
            aria-label="Lukk"
            className="grid h-12 w-12 place-items-center rounded-full border border-background/15 bg-background/5 text-background/80 active:scale-95"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </Link>
        ) : (
          <span className="w-12" />
        )}
      </header>

      {/* Innhold */}
      <main
        className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
        style={{ minHeight: 0 }}
      >
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer
          className="flex-shrink-0 border-t border-background/10 bg-foreground px-4 pt-4"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}
