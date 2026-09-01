"use client";

import type { CSSProperties, ReactNode } from "react";
import { TN } from "@/lib/v2/team-norway";
import { Icon } from "@/components/v2";

/**
 * Team Norway — delte primitiver (Claw batch 3, 01.09.2026).
 *
 * Fasit: designsystem/team-norway/templates/tn-skall/TnSkall.dc.html (rail),
 * gjenkjennelig identisk oppsett i tn-gruppeposter/tn-dokumentdeling/tn-samtykke.
 * Bruker KUN TN.* (aldri TL.* / --p-* / --tl-*) — Claw og Train-lock er to
 * parallelle systemer, en skjerm bruker aldri begge (beslutninger.md).
 *
 * `Icon` gjenbrukes fra @/components/v2 — den er generisk (Lucide-wrapper),
 * ikke Train-lock-spesifikk.
 */

// ───────────────────────── Kort ─────────────────────────

export function TnKort({
  children,
  style,
  padding = 24,
}: {
  children: ReactNode;
  style?: CSSProperties;
  padding?: number;
}) {
  return (
    <div
      style={{
        background: TN.surfaceCard,
        borderRadius: TN.radius.lg,
        boxShadow: TN.shadow.sm,
        padding,
        fontFamily: TN.font.body,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ───────────────────────── Pille (status/merke) ─────────────────────────

export type TnPilleTone = "navy" | "green" | "amber" | "red" | "info" | "nøytral";

const PILLE_TONE: Record<TnPilleTone, { bg: string; fg: string }> = {
  navy: { bg: TN.navy50, fg: TN.navy700 },
  green: { bg: TN.status.greenBg, fg: TN.status.greenText },
  amber: { bg: TN.status.amberBg, fg: TN.status.amberText },
  red: { bg: TN.status.redBg, fg: TN.status.redText },
  info: { bg: TN.status.infoBg, fg: TN.status.infoText },
  nøytral: { bg: TN.ink100, fg: TN.ink700 },
};

export function TnPille({ children, tone = "nøytral" }: { children: ReactNode; tone?: TnPilleTone }) {
  const t = PILLE_TONE[tone];
  return (
    <span
      style={{
        fontFamily: TN.font.mono,
        fontSize: TN.text.micro,
        fontWeight: TN.weight.semibold,
        letterSpacing: TN.tracking.eyebrow,
        textTransform: "uppercase",
        padding: "4px 9px",
        borderRadius: TN.radius.xs,
        background: t.bg,
        color: t.fg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ───────────────────────── Avatar-initialer ─────────────────────────

export function TnAvatarInitialer({
  navn,
  size = 30,
}: {
  navn: string;
  size?: number;
}) {
  const initialer = navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((del) => del[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: TN.radius.full,
        background: TN.ink200,
        color: TN.ink700,
        fontFamily: TN.font.mono,
        fontSize: TN.text.xs,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initialer || "?"}
    </span>
  );
}

// ───────────────────────── Knapp ─────────────────────────

export function TnKnapp({
  children,
  variant = "sekundaer",
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primaer" | "sekundaer";
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const primaer = variant === "primaer";
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        height: 40,
        padding: "0 18px",
        borderRadius: TN.radius.full,
        background: primaer ? TN.navy900 : "transparent",
        border: primaer ? "none" : `1px solid ${TN.borderDefault}`,
        color: primaer ? TN.white : TN.navy900,
        fontFamily: TN.font.body,
        fontSize: TN.text.sm,
        fontWeight: TN.weight.semibold,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ───────────────────────── Rail (org-skall) ─────────────────────────

export type TnMenyPunkt =
  | { type: "overskrift"; label: string }
  | { type: "lenke"; label: string; href: string; aktiv?: boolean; badge?: string };

export type TnBrukerFot = { navn: string; rolle: string };

/**
 * 232px sidepanel — logo på hvit plate (rød stolpe), grupperte menypunkter
 * (aktiv = navy-50 bakgrunn + rød markør), bruker-fot nederst. Fasit:
 * TnSkall.dc.html §rail. Ikke ansvarlig for ruting — kall-siden gir `href`
 * og avgjør `aktiv` selv (unngår en client-side routing-avhengighet her).
 */
export function TnRail({ punkter, bruker }: { punkter: TnMenyPunkt[]; bruker: TnBrukerFot }) {
  return (
    <div
      style={{
        width: 232,
        flexShrink: 0,
        background: TN.surfaceCard,
        borderRight: `1px solid ${TN.borderSubtle}`,
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px 18px",
        gap: 20,
      }}
    >
      <div
        style={{
          background: TN.white,
          border: `1px solid ${TN.borderSubtle}`,
          borderRadius: TN.radius.md,
          padding: "11px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ width: 9, height: 24, borderRadius: 3, background: TN.red600, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.bold, color: TN.navy900 }}>
            Team Norway
          </div>
          <div
            style={{
              fontFamily: TN.font.mono,
              fontSize: TN.text.micro,
              letterSpacing: TN.tracking.eyebrow,
              color: TN.ink400,
              marginTop: 1,
              textTransform: "uppercase",
            }}
          >
            Junior
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0, overflow: "auto" }}>
        {punkter.map((p, i) =>
          p.type === "overskrift" ? (
            <div
              key={`h-${i}`}
              style={{
                fontFamily: TN.font.mono,
                fontSize: TN.text.micro,
                letterSpacing: TN.tracking.eyebrow,
                textTransform: "uppercase",
                color: TN.ink400,
                padding: "14px 12px 6px",
              }}
            >
              {p.label}
            </div>
          ) : (
            <a
              key={p.href}
              href={p.href}
              style={{
                height: 40,
                borderRadius: TN.radius.xs,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                background: p.aktiv ? TN.navy100 : "transparent",
                color: p.aktiv ? TN.navy900 : TN.textSecondary,
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: TN.radius.full,
                  background: p.aktiv ? TN.red600 : "transparent",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.medium, flex: 1, minWidth: 0 }}>
                {p.label}
              </span>
              {p.badge && (
                <span style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, color: TN.ink400 }}>{p.badge}</span>
              )}
            </a>
          ),
        )}
      </div>

      <div style={{ borderTop: `1px solid ${TN.borderSubtle}`, paddingTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <TnAvatarInitialer navn={bruker.navn} size={32} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>
            {bruker.navn}
          </div>
          <div
            style={{
              fontFamily: TN.font.mono,
              fontSize: TN.text.micro,
              letterSpacing: TN.tracking.eyebrow,
              textTransform: "uppercase",
              color: TN.textSecondary,
              marginTop: 1,
            }}
          >
            {bruker.rolle}
          </div>
        </div>
        <Icon name="chevron-up" size={14} style={{ color: TN.ink400 }} />
      </div>
    </div>
  );
}
