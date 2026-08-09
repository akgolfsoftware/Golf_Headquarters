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
   * "dark" / "light" — alias for paper (legacy).
   */
  variant?: "dark" | "light" | "paper";
  /** data-od-id / wave marker */
  odId?: string;
};

/**
 * Full-screen skall for live-økt — Paper-fasit (cream, topp 17px, dokk clay).
 * Fasit: playerhq-live-brief/okt/summary.html
 */
export function LiveSessionShell({
  title,
  subtitle,
  backHref,
  closeHref,
  children,
  footer,
  variant = "paper",
  odId,
}: LiveSessionShellProps) {
  void variant;
  const showTitleBar = Boolean(title);

  return (
    <div
      data-paper-live-shell
      data-paper-wave-c={odId ?? "live"}
      data-od-id={odId}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: T.bg, color: T.fg, isolation: "isolate", fontFamily: T.ui }}
     data-paper-slug="playerhq-live">
      <header
        data-paper-topp
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          paddingTop: "max(env(safe-area-inset-top) + 10px, 14px)",
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
        }}
      >
        {backHref && (
          <Link
            href={backHref}
            aria-label="Tilbake"
            data-od-id="live-shell-tilbake"
            className="v2-press v2-focus"
            style={{
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: `1px solid ${T.border}`,
              background: T.panel,
              color: T.fg,
              textDecoration: "none",
              flex: "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          {showTitleBar && title ? (
            <>
              <h1
                style={{
                  margin: 0,
                  fontFamily: T.disp,
                  fontSize: 17,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: T.fg,
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <div
                  style={{
                    display: "block",
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
              background: T.panel,
              color: T.fg2,
              textDecoration: "none",
              flex: "none",
            }}
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        )}
      </header>

      <main
        data-paper-kropp
        className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
        style={{ minHeight: 0, background: T.bg }}
      >
        {children}
      </main>

      {footer && (
        <footer
          data-paper-dokk
          style={{
            flex: "none",
            borderTop: `1px solid ${T.border}`,
            background: T.bg,
            padding: "12px 16px",
            paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>{footer}</div>
        </footer>
      )}
    </div>
  );
}
