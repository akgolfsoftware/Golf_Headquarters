"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { Sprout, Target, Trophy } from "lucide-react";
import type { LPhase } from "@/generated/prisma/client";
import type { WorkbenchPlanTemplate } from "@/lib/workbench/load-workbench";
import { FONT, WB } from "./theme";
import { Card, Tag } from "@/components/athletic/golfdata";

type MalFilter = "alle" | "naerspill" | "putting" | "utslag" | "turnering" | "full";

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
  /** Bruk mal i workbench — bytter til Gantt/uke (ikke bare admin-lenke). */
  onUseTemplate: (template: WorkbenchPlanTemplate) => void;
  /** Spillerens aktive periode akkurat nå — matchende maler fremheves og sorteres øverst. Skjuler aldri andre. */
  activePeriodLPhase?: LPhase | null;
};

const FILTERS: { key: MalFilter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "naerspill", label: "Nærspill" },
  { key: "putting", label: "Putting" },
  { key: "utslag", label: "Utslag" },
  { key: "turnering", label: "Turnering" },
  { key: "full", label: "Full sesong" },
];

function categoryChip(t: WorkbenchPlanTemplate): string {
  const n = t.name.toLowerCase();
  if (/putt/i.test(n)) return "PUTTING";
  if (/nær|chip|wedge|arg/i.test(n)) return "NÆRSPILL";
  if (/tee|driver|utslag/i.test(n)) return "UTSLAG";
  return FASE_LABEL[t.lPhase].split(" ")[0]!.toUpperCase();
}

function matchesFilter(t: WorkbenchPlanTemplate, f: MalFilter): boolean {
  if (f === "alle") return true;
  const n = t.name.toLowerCase();
  if (f === "naerspill") return /nær|chip|wedge|arg/i.test(n);
  if (f === "putting") return /putt/i.test(n);
  if (f === "utslag") return /tee|driver|utslag/i.test(n);
  if (f === "turnering") return t.lPhase === "TURNERING" || /turn/i.test(n);
  if (f === "full") return t.varighetUker >= 8 || /sesong|helår/i.test(n);
  return true;
}

export function MalerTab({
  templates,
  isCoach,
  onUseTemplate,
  activePeriodLPhase,
}: MalerTabProps): ReactElement {
  const [filter, setFilter] = useState<MalFilter>("alle");
  const visible = useMemo(() => {
    const matching = templates.filter((t) => matchesFilter(t, filter));
    if (!activePeriodLPhase) return matching;
    // Anbefaling, ikke filter: maler for aktiv periode først, resten uendret bak — aldri skjult.
    const anbefalt = matching.filter((t) => t.lPhase === activePeriodLPhase);
    const resten = matching.filter((t) => t.lPhase !== activePeriodLPhase);
    return [...anbefalt, ...resten];
  }, [templates, filter, activePeriodLPhase]);

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
                background: active ? WB.limeSoft : WB.cardBg,
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
          const editHref = isCoach ? `/admin/plan-templates/${t.id}/rediger` : undefined;
          const anbefalt = activePeriodLPhase != null && t.lPhase === activePeriodLPhase;
          return (
            <Card
              key={t.id}
              compact
              style={{ height: "100%", ...(anbefalt ? { border: `1px solid ${WB.lime}` } : {}) }}
              bodyStyle={{ display: "flex", flexDirection: "column", gap: 10, height: "100%" }}
            >
              {anbefalt && (
                <span
                  style={{
                    alignSelf: "flex-start",
                    fontFamily: FONT.mono,
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: WB.lime,
                    color: WB.limeDark,
                  }}
                >
                  Anbefalt for {FASE_LABEL[t.lPhase]}
                </span>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <Tag size="sm" variant="outline">
                  {categoryChip(t)}
                </Tag>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    color:
                      t.effectivenessAvg == null
                        ? WB.muted3
                        : t.effectivenessAvg >= 0
                          ? WB.lime
                          : WB.err,
                    flexShrink: 0,
                  }}
                  title={
                    t.effectivenessAvg == null
                      ? "Snitt SG-effekt vises når fullførte planer har brukt malen"
                      : "Snitt SG-Total-delta fra fullførte planer med denne malen"
                  }
                >
                  {t.effectivenessAvg == null
                    ? "—"
                    : `${t.effectivenessAvg >= 0 ? "+" : ""}${t.effectivenessAvg
                        .toFixed(1)
                        .replace(".", ",")} SG`}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: WB.limeFaint,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} style={{ color: WB.lime }} strokeWidth={1.6} />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: WB.text }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: WB.muted, marginTop: 4, lineHeight: 1.4 }}>
                    {t.sessionCount} økter over {t.varighetUker} uker — {FASE_LABEL[t.lPhase].toLowerCase()}
                  </div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted3, marginTop: 4 }}>
                    {FASE_LABEL[t.lPhase]} · {t.varighetUker} uker · {t.sessionCount} økter
                  </div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted, marginTop: 6 }}>
                    {t.usageCount > 0 ? `Brukt ${t.usageCount}×` : "Ny mal"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                {editHref && (
                  <Link
                    href={editHref}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontFamily: FONT.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: `1px solid ${WB.panelBorder}`,
                      color: WB.muted,
                      textDecoration: "none",
                    }}
                  >
                    Rediger
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => onUseTemplate(t)}
                  style={{
                    flex: 1,
                    fontFamily: FONT.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "8px 10px",
                    borderRadius: 999,
                    border: "none",
                    background: WB.lime,
                    color: WB.limeDark,
                    cursor: "pointer",
                  }}
                >
                  Bruk
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}