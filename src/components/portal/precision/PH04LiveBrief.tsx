"use client";

/**
 * Kilde: ui_kits/playerhq/screens/PH-04.jsx.
 * PH-04 Live-økt: brief — Precision Athletics (nattmodus/fokus).
 *
 * Ingen hex/rgba i inline-styles (kun var(--...)).
 * Viser øktoversikt, dagens målsetning, øvelsesliste med køller og reps,
 * samt "Start økt"-aksjon (64px høyde).
 */

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Play, ArrowLeft, ListPlus } from "lucide-react";
import { AkseMerke, Meta, Tall } from "@/components/precision/pa";
import type { LiveBriefData } from "@/lib/portal-live/ph04-07-data";
import "@/styles/precision-athletics.css";

interface PH04LiveBriefProps {
  data: LiveBriefData;
  onStart?: () => void;
  onCloseHref?: string;
}

export function PH04LiveBrief({
  data,
  onStart,
  onCloseHref = "/portal/planlegge/workbench",
}: PH04LiveBriefProps) {
  const router = useRouter();
  const empty = !data.drills || data.drills.length === 0;

  const handleStart = () => {
    if (onStart) {
      onStart();
    } else {
      router.push(`/portal/live/${data.sessionId}/active`);
    }
  };

  return (
    <div
      className="pa-root ph04"
      data-theme="night"
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
          href={onCloseHref}
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
            {data.scheduledTime} · {data.location.toUpperCase()}
          </Meta>
        </div>
      </header>

      {/* Hovedinnhold med maksbredde 640px */}
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
            {data.title}
          </h1>
          <Meta style={{ display: "block", marginTop: 6 }}>
            {data.totalMinutes} MIN · {empty ? "—" : `${data.drills.length} ØVELSER`} ·{" "}
            {data.belastning.toUpperCase()} · {data.press.toUpperCase()}
          </Meta>
        </div>

        {empty ? (
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
                {data.goal}
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
                  {data.focus}
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
              {data.drills.map((drill, index) => (
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
                      {drill.club.toUpperCase()}
                      {drill.param ? ` · ${drill.param}` : ""}
                    </Meta>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Tall style={{ fontSize: 17, fontWeight: 600 }}>{drill.quantity}</Tall>
                    <Meta style={{ display: "block" }}>
                      {drill.unit.toUpperCase()} · {drill.minutes} MIN
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
              <AkseMerke axis={data.axis} />
              <Meta style={{ alignSelf: "center" }}>
                TRACKMAN KOBLET · {data.trackmanBay || "BAY 3"}
              </Meta>
            </div>
          </>
        )}
      </main>

      {/* Bunnaksjon: Start økt eller tilbake */}
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
        <div style={{ width: "100%", maxWidth: 640 }}>
          {empty ? (
            <Link
              href={onCloseHref}
              style={{
                height: 64,
                width: "100%",
                borderRadius: 8,
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-card)",
                color: "var(--text-primary)",
                font: "600 17px/1 var(--font-sans)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={20} />
              <span>Tilbake til øktarket</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled={!data.canStart}
              onClick={handleStart}
              style={{
                height: 64,
                width: "100%",
                borderRadius: 8,
                border: "none",
                background: data.canStart ? "var(--primary)" : "var(--surface-sunken)",
                color: data.canStart ? "var(--text-on-primary)" : "var(--text-muted)",
                font: "600 17px/1 var(--font-sans)",
                cursor: data.canStart ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Play size={20} fill={data.canStart ? "currentColor" : "none"} />
              <span>
                {data.blockReason === "completed"
                  ? "Økta er fullført"
                  : data.blockReason === "tier"
                    ? "Oppgrader for å starte"
                    : "Start økt"}
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
