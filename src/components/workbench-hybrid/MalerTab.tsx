"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { Sprout, Target, Trophy } from "lucide-react";
import type { WorkbenchPlanTemplate } from "@/lib/workbench/load-workbench";
import { FONT, WB } from "./theme";

type MalFilter = "alle" | "naerspill" | "putting" | "full";

const FASE_IKON = {
  GRUNN: Sprout,
  SPESIAL: Target,
  TURNERING: Trophy,
} as const;

const FASE_LABEL = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Turneringsfase",
} as const;

type MalerTabProps = {
  templates: WorkbenchPlanTemplate[];
  isCoach: boolean;
};

const FILTERS: { key: MalFilter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "naerspill", label: "Nærspill" },
  { key: "putting", label: "Putting" },
  { key: "full", label: "Full sesong" },
];

function matchesFilter(t: WorkbenchPlanTemplate, f: MalFilter): boolean {
  if (f === "alle") return true;
  const n = t.name.toLowerCase();
  if (f === "naerspill") return /nær|chip|wedge|arg/i.test(n);
  if (f === "putting") return /putt/i.test(n);
  if (f === "full") return t.varighetUker >= 8 || /sesong|helår/i.test(n);
  return true;
}

export function MalerTab({ templates, isCoach }: MalerTabProps): ReactElement {
  const [filter, setFilter] = useState<MalFilter>("alle");
  const visible = useMemo(
    () => templates.filter((t) => matchesFilter(t, filter)),
    [templates, filter],
  );

  if (templates.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          color: WB.muted,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ margin: "0 0 8px", color: WB.text, fontWeight: 600 }}>Ingen planmaler ennå</p>
          <p style={{ margin: 0, maxWidth: 320 }}>
            {isCoach
              ? "Opprett maler i AgencyOS under Plan-maler — de vises her for rask planlegging."
              : "Coach legger inn planmaler — de dukker opp her når de er klare."}
          </p>
          {isCoach && (
            <Link
              href="/admin/plan-templates"
              style={{
                display: "inline-block",
                marginTop: 14,
                fontFamily: FONT.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: WB.lime,
              }}
            >
              Åpne plan-maler →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wb-scroll" style={{ flex: 1, overflow: "auto", padding: 16 }}>
      <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <span style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 700, color: WB.text }}>
            Mal-bibliotek
          </span>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: WB.muted }}>
            {visible.length} av {templates.length} maler
          </p>
        </div>
        {isCoach && (
          <Link
            href="/admin/plan-templates/ny"
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "8px 14px",
              borderRadius: 999,
              border: "none",
              background: WB.lime,
              color: WB.limeDark,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            + Ny mal
          </Link>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${active ? WB.lime : WB.panelBorder}`,
                background: active ? `${WB.lime}22` : WB.cardBg,
                color: active ? WB.lime : WB.muted,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
        }}
      >
        {visible.map((t) => {
          const Icon = FASE_IKON[t.lPhase];
          const href = isCoach ? `/admin/plan-templates/${t.id}/rediger` : undefined;
          const inner = (
            <div
              style={{
                background: WB.cardBg,
                border: `1px solid ${WB.innerBorder}`,
                borderRadius: 12,
                padding: "14px 16px",
                height: "100%",
                cursor: href ? "pointer" : "default",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${WB.lime}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={WB.lime} strokeWidth={1.6} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: WB.text }}>{t.name}</div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted3, marginTop: 4 }}>
                    {FASE_LABEL[t.lPhase]} · {t.varighetUker} uker · {t.sessionCount} økter
                  </div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted, marginTop: 6 }}>
                    {t.usageCount > 0 ? `Brukt ${t.usageCount}×` : "Ny mal"}
                  </div>
                </div>
              </div>
              {href && (
                <div style={{ marginTop: 10 }}>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: WB.lime,
                    }}
                  >
                    Bruk →
                  </span>
                </div>
              )}
            </div>
          );
          return href ? (
            <Link key={t.id} href={href} style={{ textDecoration: "none" }}>
              {inner}
            </Link>
          ) : (
            <div key={t.id}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}