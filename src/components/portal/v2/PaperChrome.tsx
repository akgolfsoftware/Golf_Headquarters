"use client";

/**
 * Paper page chrome — sticky .topp + 720 kropp.
 * Gjenbrukt på Plan/Analyse/Meg/Booking fidelity-pass.
 * Fasit: designsystem/paper/fase1 (playerhq-*.html .topp / .kropp).
 */
import type { CSSProperties, ReactNode } from "react";
import { T } from "@/lib/v2/tokens";

export function PaperTopp({
  tittel,
  sub,
  trailing,
  children,
}: {
  tittel: string;
  sub?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        borderBottom: `1px solid ${T.border}`,
        background: T.panel,
        position: "sticky",
        top: 0,
        zIndex: 5,
      }}
      data-paper-topp
    >
      {children}
      <div style={{ minWidth: 0, flex: 1 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: T.disp,
            fontSize: 17,
            fontWeight: 600,
            color: T.fg,
            lineHeight: 1.2,
          }}
        >
          {tittel}
        </h1>
        {sub != null && sub !== "" && (
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 10.5,
              color: T.mut,
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {trailing}
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
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        padding: "16px 16px 32px",
        background: T.bg,
        ...style,
      }}
      data-paper-kropp
    >
      <div
        style={{
          maxWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PaperPage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        height: "100%",
        background: T.bg,
      }}
      data-paper-page
    >
      {children}
    </div>
  );
}

/** Paper empty — soft + dashed (fasit .tom / .empty) */
export function PaperTom({
  tittel,
  tekst,
  children,
  odId,
}: {
  tittel: string;
  tekst?: string;
  children?: ReactNode;
  odId?: string;
}) {
  return (
    <div
      data-od-id={odId}
      style={{
        padding: "24px 20px",
        background: T.panel2,
        border: `1px dashed ${T.border}`,
        borderRadius: T.rCard,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>{tittel}</h3>
      {tekst && (
        <p
          style={{
            margin: 0,
            fontFamily: T.bodyFont,
            fontSize: 13.5,
            color: T.mut,
            lineHeight: 1.55,
            maxWidth: "46ch",
          }}
        >
          {tekst}
        </p>
      )}
      {children}
    </div>
  );
}
