"use client";

/**
 * Indre AgenticOS-rail (AO-00 / AO-01). Ligger inni AgencyOS-skallet.
 * Desktop ≥1101: 216 px kolonne. Mobil: pille-rad som AO-00 LOCK.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { TL } from "@/lib/v2/train-lock";
import {
  AGENTICOS_NAV,
  agenticosNavAktiv,
  type AgenticosNavId,
} from "@/lib/agencyos/agenticos-ia";
import { AO_PRESS, AoCaps } from "./tl-agenticos";

export function AgenticosSkall({
  godkjennCount,
  runtimeLinje,
  children,
}: {
  godkjennCount: number;
  runtimeLinje?: string;
  children: ReactNode;
}) {
  const path = usePathname() ?? "/admin/agenticos";
  const aktiv: AgenticosNavId = agenticosNavAktiv(path);

  return (
    <div
      style={{
        display: "flex",
        minWidth: 0,
        margin: "0 -4px",
      }}
    >
      <nav
        aria-label="AgenticOS"
        className="hidden min-[1101px]:flex"
        style={{
          width: 216,
          flex: "none",
          borderRight: `1px solid ${TL.hair}`,
          padding: "18px 12px",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px 16px" }}>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: TL.warm, flex: "none" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: TL.text }}>AgenticOS</span>
        </div>
        {AGENTICOS_NAV.map((t) => {
          const on = t.id === aktiv;
          return (
            <Link
              key={t.id}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={AO_PRESS}
              style={{
                height: 36,
                borderRadius: 10,
                background: on ? TL.dock : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 12px",
                fontSize: 13,
                fontWeight: 600,
                color: on ? TL.text : TL.mute,
                textDecoration: "none",
              }}
            >
              <span>{t.label}</span>
              {t.id === "godkjenn" && godkjennCount > 0 ? (
                <span style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", color: TL.text }}>{godkjennCount}</span>
              ) : null}
            </Link>
          );
        })}
        <div style={{ flex: 1 }} />
        {runtimeLinje ? (
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${TL.hair}` }}>
            <AoCaps>Runtimes</AoCaps>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 7 }}>
              <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: TL.text }} />
              <span style={{ fontSize: 12, color: TL.mute }}>{runtimeLinje}</span>
            </div>
          </div>
        ) : null}
      </nav>

      <div style={{ flex: 1, minWidth: 0, padding: `22px 26px`, display: "flex", flexDirection: "column", gap: 18 }}>
        <nav
          aria-label="AgenticOS"
          className="flex min-[1101px]:hidden"
          style={{
            gap: 6,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 9, marginRight: 6 }}>
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: TL.warm, flex: "none" }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: TL.text }}>AgenticOS</span>
          </span>
          {AGENTICOS_NAV.map((t) => {
            const on = t.id === aktiv;
            return (
              <Link
                key={t.id}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={AO_PRESS}
                style={{
                  height: 32,
                  borderRadius: 10,
                  background: on ? TL.dock : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: on ? TL.text : TL.mute,
                  textDecoration: "none",
                }}
              >
                {t.label}
                {t.id === "godkjenn" && godkjennCount > 0 ? (
                  <span style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", color: TL.text }}>{godkjennCount}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </div>
  );
}
