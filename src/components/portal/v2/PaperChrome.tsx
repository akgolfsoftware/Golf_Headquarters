"use client";

/**
 * Paper page chrome — sticky .topp + 720 kropp.
 * Wave A fasit: designsystem/paper/fase1 playerhq-*.html (.topp / .kropp / .dokk).
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { TemaHeaderKnapp } from "@/components/v2/tema";

export function PaperTopp({
  tittel,
  sub,
  trailing,
  children,
  utenTema,
}: {
  tittel: string;
  sub?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  /** Flater som er låst til ett tema (onboarding) skjuler bryteren. */
  utenTema?: boolean;
}) {
  return (
    <header
      data-paper-topp
      data-paper-wave-a="topp"
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderBottom: `1px solid ${T.border}`,
        background: T.bg,
        position: "sticky",
        top: 0,
        zIndex: 5,
      }}
    >
      {children}
      <div style={{ minWidth: 0, flex: 1 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: T.disp,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.fg,
            lineHeight: 1.15,
          }}
        >
          {tittel}
        </h1>
        {sub != null && sub !== "" && (
          <div
            className="paper-sub"
            style={{
              display: "block",
              fontFamily: T.mono,
              fontSize: 10.5,
              color: T.mut,
              marginTop: 2,
              lineHeight: 1.35,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {trailing}
      {/* Paper har temabryteren i headeren på hver skjerm — den satt bare i
          railen før, altså usynlig på mobil. Sist i rekken, som i fasiten. */}
      {!utenTema && <TemaHeaderKnapp />}
    </header>
  );
}

export function PaperKropp({
  children,
  style,
  maxWidth = 720,
}: {
  children: ReactNode;
  style?: CSSProperties;
  maxWidth?: number;
}) {
  return (
    <div
      data-paper-kropp
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        padding: "16px 16px calc(32px + env(safe-area-inset-bottom))",
        background: T.bg,
        ...style,
      }}
    >
      <div
        style={{
          maxWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Sticky bottom dock — Paper .dokk (én clay-handling).
 * Bunn-paddingen legger til `--ak-cookie-h` (satt av CookieBanner) slik at
 * handlingen forskyves opp mens cookie-banneret vises — ellers ligger banneret
 * oppå knappen og fanger trykket.
 */
export function PaperDokk({ children }: { children: ReactNode }) {
  return (
    <div
      data-paper-dokk
      style={{
        flex: "none",
        position: "sticky",
        bottom: 0,
        zIndex: 4,
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))",
        background: `linear-gradient(to top, ${T.bg} 70%, transparent)`,
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

export function PaperPage({
  children,
  odId,
}: {
  children: ReactNode;
  odId?: string;
}) {
  return (
    <div
      data-paper-page
      data-paper-wave-a={odId ?? true}
      data-od-id={odId}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        height: "100%",
        background: T.bg,
      }}
    >
      {children}
    </div>
  );
}
