import Link from "next/link";
import { X } from "lucide-react";
import { T } from "@/lib/v2/tokens";

export type LiveSessionShellProps = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  closeHref?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * "paper" — Paper cream fullscreen (fasit playerhq-live-*.html). Default.
   * "dark"  — alias for paper (legacy prop; forest dark er utgått vs Paper-fasit).
   * "light" — samme som paper (aktiv økt topbar med tittel).
   */
  variant?: "dark" | "light" | "paper";
};

/**
 * Full-screen skall for live-økt — Paper-fasit (lys cream, ikke forest-mørk).
 */
export function LiveSessionShell({
  title,
  subtitle,
  closeHref,
  children,
  footer,
  variant = "paper",
}: LiveSessionShellProps) {
  const showTitleBar = Boolean(title) || variant === "light";

  return (
    <div
      data-paper-live-shell
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: T.bg, color: T.fg, isolation: "isolate" }}
    >
      <header
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 18px",
          paddingTop: "max(env(safe-area-inset-top) + 10px, 14px)",
          borderBottom: `1px solid ${T.border}`,
          background: T.panel,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          {showTitleBar && title ? (
            <>
              <div
                style={{
                  fontFamily: T.disp,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: T.fg,
                }}
              >
                {title}
              </div>
              {subtitle && (
                <div
                  style={{
                    marginTop: 2,
                    fontFamily: T.mono,
                    fontSize: 10.5,
                    color: T.mut,
                  }}
                >
                  {subtitle}
                </div>
              )}
            </>
          ) : (
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: T.mut,
              }}
            >
              PlayerHQ · Live
            </span>
          )}
        </div>
        {closeHref && (
          <Link
            href={closeHref}
            aria-label="Lukk"
            data-od-id="live-shell-lukk"
            className="v2-press v2-focus"
            style={{
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: `1px solid ${T.border}`,
              background: T.panel2,
              color: T.fg2,
              textDecoration: "none",
            }}
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        )}
      </header>

      <main
        className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
        style={{ minHeight: 0, background: T.bg }}
      >
        {children}
      </main>

      {footer && (
        <footer
          style={{
            flex: "none",
            borderTop: `1px solid ${T.border}`,
            background: T.panel,
            padding: "12px 16px",
            paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>{footer}</div>
        </footer>
      )}
    </div>
  );
}
