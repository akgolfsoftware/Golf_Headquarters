"use client";

/**
 * Kilde: ui_kits/playerhq/screens/PH-04.jsx.
 * PH-04 før økta / Live-økt brief — Precision Athletics (nattmodus/fokus).
 * Handlinger og data-od-id beholdes hos kalleren.
 *
 * Ingen hex eller rgba i inline styles (kun var(--...)).
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { X, ListPlus } from "lucide-react";
import { AkseMerke, Meta, Tall } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

export type BriefDrill = {
  id: string;
  name: string;
  meta: string[];
  notes?: string | null;
  target?: string | null;
};

export type SessionBriefProps = {
  title: string;
  durationMin: number;
  scheduledAtISO: string;
  location?: string | null;
  context: string;
  drills: BriefDrill[];
  sections: { label: string; text: string }[];
  action: ReactNode;
  message?: string | null;
  provenance?: string | null;
  odId: string;
};

const clock = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export function SessionBrief({
  title,
  durationMin,
  scheduledAtISO,
  location,
  context,
  drills,
  sections,
  action,
  message,
  provenance,
  odId,
}: SessionBriefProps) {
  const start = new Date(scheduledAtISO);
  const validDate = Number.isFinite(start.getTime());
  const end = new Date(start.getTime() + Math.max(0, durationMin) * 60_000);
  const clockText = validDate
    ? `${clock.format(start)}${durationMin > 0 ? `–${clock.format(end)}` : ""}`
    : "14:30";

  const goalSection = sections.find(
    (s) => s.label.toLowerCase().includes("mål") || s.label.toLowerCase().includes("om"),
  );
  const focusSection = sections.find((s) => s.label.toLowerCase().includes("fokus"));

  const goalText = goalSection?.text || "Stabil ballbane og god kontakt.";
  const focusText = focusSection?.text || "Senterballtreff og jevn svingbane.";

  return (
    <div
      className="pa-root ph04"
      data-theme="night"
      data-od-id={odId}
      style={{
        minHeight: "100dvh",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fokus-topp */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-hairline)",
          background: "var(--surface-card)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <Link
          href="/portal/planlegge"
          aria-label="Lukk brief"
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-card)",
            color: "var(--text-primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <X size={22} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker" style={{ color: "var(--text-secondary)" }}>
            Live-økt · brief
          </div>
          <Meta style={{ color: "var(--text-muted)" }}>
            {clockText} · {(location || "RANGE 3").toUpperCase()}
          </Meta>
        </div>
      </header>

      {/* Hovedinnhold (maks 640px) */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 640,
          margin: "0 auto",
          padding: "24px 20px 100px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Tittel og meta */}
        <div>
          <h1
            style={{
              margin: 0,
              font: "var(--type-title-l)",
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h1>
          <Meta style={{ display: "block", marginTop: 6 }}>
            {durationMin} MIN · {drills.length === 0 ? "—" : `${drills.length} ØVELSER`} · MODERAT · MIDDELS
          </Meta>
        </div>

        {drills.length === 0 ? (
          <div
            className="pa-state pa-state--empty"
            style={{
              padding: 32,
              background: "var(--surface-card)",
              borderRadius: 8,
              border: "1px dashed var(--border-hairline)",
              textAlign: "center",
            }}
          >
            <span
              className="pa-state__icon"
              style={{
                display: "inline-flex",
                marginBottom: 12,
                color: "var(--text-muted)",
              }}
            >
              <ListPlus size={32} />
            </span>
            <div className="pa-state__title" style={{ fontWeight: 600, fontSize: 16 }}>
              Ingen øvelser i økta
            </div>
            <div
              className="pa-state__body"
              style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}
            >
              Anders har ikke lagt inn øvelser. Start ikke før økta er klar.
            </div>
          </div>
        ) : (
          <>
            {/* Dagens målsetning kort */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: "var(--surface-card)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
              }}
            >
              <span className="kicker" style={{ color: "var(--text-secondary)" }}>
                Dagens målsetning
              </span>
              <div
                style={{
                  font: "600 21px/1.3 var(--font-sans)",
                  color: "var(--text-primary)",
                  textWrap: "pretty",
                }}
              >
                {goalText}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                  paddingTop: 12,
                  borderTop: "1px solid var(--border-hairline)",
                }}
              >
                <span
                  className="pa-field__label"
                  style={{ color: "var(--text-secondary)", fontSize: 13 }}
                >
                  Fokus
                </span>
                <span
                  style={{
                    font: "600 17px/1.2 var(--font-sans)",
                    color: "var(--text-primary)",
                  }}
                >
                  {focusText}
                </span>
                <Meta style={{ marginLeft: "auto" }}>ÉN TEKNISK DIMENSJON</Meta>
              </div>
            </div>

            {/* Øvelsesliste-kort */}
            <div
              className="pa-card"
              style={{
                padding: "8px 16px",
                background: "var(--surface-card)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
              }}
            >
              {drills.map((drill, index) => (
                <div
                  key={drill.id || index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px minmax(0, 1fr) auto",
                    gap: 12,
                    alignItems: "center",
                    minHeight: 64,
                    borderTop: index ? "1px solid var(--border-hairline)" : "none",
                  }}
                >
                  <Meta style={{ font: "var(--type-num-s)" }}>
                    {String(index + 1).padStart(2, "0")}
                  </Meta>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        font: "500 15px/1.3 var(--font-sans)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {drill.name}
                    </div>
                    <Meta>
                      {drill.meta.join(" · ") || context}
                    </Meta>
                    {drill.notes && (
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                        {drill.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Tall style={{ fontSize: 17, fontWeight: 600 }}>
                      {drill.target || "20"}
                    </Tall>
                    <Meta style={{ display: "block" }}>
                      SLAG
                    </Meta>
                  </div>
                </div>
              ))}
            </div>

            {/* Akse-badge og telemetri */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <AkseMerke axis="slag" />
              <Meta style={{ alignSelf: "center" }}>
                TRACKMAN KOBLET · BAY 3
              </Meta>
            </div>
          </>
        )}

        {provenance && (
          <Meta style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {provenance}
          </Meta>
        )}
      </main>

      {/* Bunnaksjon */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--surface-page)",
          borderTop: "1px solid var(--border-hairline)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "center",
          zIndex: 30,
        }}
      >
        <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 8 }}>
          {message && (
            <Meta style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
              {message}
            </Meta>
          )}
          {action}
        </div>
      </footer>
    </div>
  );
}
