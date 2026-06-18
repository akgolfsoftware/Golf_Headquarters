import Link from "next/link";
import { X } from "lucide-react";

export type LiveSessionShellProps = {
  title?: string;
  subtitle?: string;
  /** Bruges kun på dark-modus brief-skjerm. */
  backHref?: string;
  closeHref?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * "dark"  — forest-mørk fullscreen (brief + summary).
   * "light" — lys bakgrunn med hvit topbar (aktiv økt).
   */
  variant?: "dark" | "light";
};

/**
 * Full-screen skall for live-økt.
 *
 * Variant "dark": forest-radial gradient bakgrunn, accent-farger.
 * Variant "light": cream-bakgrunn med hvit topbar og grønn/svart tekst.
 */
export function LiveSessionShell({
  title,
  subtitle,
  closeHref,
  children,
  footer,
  variant = "dark",
}: LiveSessionShellProps) {
  if (variant === "light") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{ background: "var(--background)", isolation: "isolate" }}
      >
        {/* Topbar */}
        <header
          className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-[18px] py-[10px]"
          style={{ paddingTop: "max(env(safe-area-inset-top) + 10px, 54px)" }}
        >
          <div>
            {title && (
              <div className="font-display text-[16px] font-bold leading-tight -tracking-[0.01em] text-foreground">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="mt-[2px] font-mono text-[9.5px] font-semibold text-muted-foreground">
                {subtitle}
              </div>
            )}
          </div>
          {closeHref && (
            <Link
              href={closeHref}
              aria-label="Avslutt økt"
              className="rounded-full border border-destructive/20 bg-destructive/8 px-3 py-[6px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-destructive"
            >
              Avslutt
            </Link>
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
            className="flex-shrink-0 border-t border-border bg-card px-4 pt-4"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
          >
            {footer}
          </footer>
        )}
      </div>
    );
  }

  // Dark variant (brief + summary)
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-background"
      style={{
        background: "radial-gradient(120% 80% at 50% 0%, #0d2218, #0A1F17 70%)",
        isolation: "isolate",
      }}
    >
      {/* Header */}
      <header
        className="flex h-16 flex-shrink-0 items-center justify-between gap-4 px-5"
        style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-background/40">
          PlayerHQ · Live-økt
        </span>

        {closeHref ? (
          <Link
            href={closeHref}
            aria-label="Lukk"
            className="grid h-10 w-10 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70 active:scale-95"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        ) : (
          <span className="w-10" />
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
          className="flex-shrink-0 border-t border-background/10 bg-transparent px-4 pt-4"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}
