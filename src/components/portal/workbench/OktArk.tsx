"use client";

/**
 * Spillerens økt-ark for en publisert Workbench-økt (Loop 3S).
 * Start → IN_PROGRESS, Fullfør → COMPLETED, Hopp over → SKIPPED.
 * Kaller wb-actions direkte (server actions) — WbResultat + toast ved feil,
 * lokal state oppdateres optimistisk fra returnert økt (ingen full reload).
 */

import { useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import {
  UI,
  PYRAMID_LABEL,
  formatMinutes,
  formatTime,
} from "@/lib/domain/workbench/labels";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { startSession, completeSession, skipSession } from "@/lib/workbench/wb-actions";
import { STATUS_CAPS, WARM } from "@/components/workbench/wb-visuelt";

type Handling = "start" | "fullfor" | "hopp-over";

const kort: CSSProperties = {
  background: TL.elev,
  borderRadius: TL.radius.card,
  padding: 20,
};

const eyebrow: CSSProperties = {
  fontFamily: TL.font.mono,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: TL.track.capsSm,
  textTransform: "uppercase",
  color: TL.mute,
};

const primærKnapp: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  width: "100%",
  borderRadius: TL.radius.pill,
  border: "none",
  background: TL.fill,
  color: TL.onFill,
  fontFamily: TL.font.sans,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};

const sekundærKnapp: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  width: "100%",
  border: "none",
  background: "none",
  color: TL.mute,
  fontFamily: TL.font.sans,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

export function OktArk({ session: initial }: { session: WorkbenchSession }) {
  const [session, setSession] = useState(initial);
  const [travel, startTravel] = useTransition();
  const [aktivHandling, setAktivHandling] = useState<Handling | null>(null);

  function utfor(handling: Handling) {
    setAktivHandling(handling);
    startTravel(async () => {
      const res =
        handling === "start"
          ? await startSession(session.id)
          : handling === "fullfor"
            ? await completeSession(session.id)
            : await skipSession(session.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSession(res.data);
      if (handling === "fullfor") toast.success("Økt fullført");
      if (handling === "hopp-over") toast.success("Hoppet over");
    });
  }

  const laster = (h: Handling) => travel && aktivHandling === h;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: TL.loft.s2, maxWidth: 460, margin: "0 auto", width: "100%" }}>
      <div>
        <span style={{ ...eyebrow, color: session.status === "COMPLETED" ? TL.warm : eyebrow.color }}>
          {STATUS_CAPS[session.status]} · {formatMinutes(session.durationMinutes)}
        </span>
        <h1 style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          {session.title}
        </h1>
        <span style={{ display: "block", marginTop: 4, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
          {PYRAMID_LABEL[session.pyramid]} · {formatTime(session.startMinute)}
        </span>
      </div>

      {session.notes && (
        <div style={kort}>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            {session.notes}
          </p>
        </div>
      )}

      <div style={{ ...kort, padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
          <span style={eyebrow}>{UI.drills}</span>
          <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{session.drills.length}</span>
        </div>
        {session.drills.length === 0 ? (
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: 0, padding: "12px 20px 20px" }}>
            {UI.emptyDrills}
          </p>
        ) : (
          <div style={{ marginTop: 8, paddingBottom: 4 }}>
            {session.drills.map((d, i) => (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderTop: `1px solid ${TL.hair}`,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flex: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: TL.fill,
                    color: TL.onFill,
                    fontFamily: TL.font.sans,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>{d.title}</span>
                  <span style={{ display: "block", marginTop: 2, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>{d.techniqueFocus}</span>
                </span>
                <span style={{ flex: "none", fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>
                  {d.durationMinutes} min
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {session.status === "PUBLISHED" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button type="button" style={primærKnapp} onClick={() => utfor("start")} disabled={travel}>
            {laster("start") ? "Starter …" : UI.startSession}
          </button>
          <button type="button" style={sekundærKnapp} onClick={() => utfor("hopp-over")} disabled={travel}>
            {laster("hopp-over") ? "Lagrer …" : UI.skipSession}
          </button>
        </div>
      )}

      {session.status === "IN_PROGRESS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button type="button" style={primærKnapp} onClick={() => utfor("fullfor")} disabled={travel}>
            {laster("fullfor") ? "Fullfører …" : UI.completeSession}
          </button>
          <button type="button" style={sekundærKnapp} onClick={() => utfor("hopp-over")} disabled={travel}>
            {laster("hopp-over") ? "Lagrer …" : UI.skipSession}
          </button>
        </div>
      )}

      {session.status === "COMPLETED" && (
        <div style={kort}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Warm hake med tegne-animasjon — delight-budsjettet (én gang per
                økt). Ring lander fra scale(0.9), haken tegnes rett etter. */}
            <span
              className="v2-hake-ring"
              aria-hidden
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: `1.5px solid ${WARM}`,
                flex: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  className="v2-hake-tegn"
                  d="M2.5 7.5 L5.5 10.5 L11.5 3.5"
                  stroke={WARM}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              {UI.sessionCompletedTitle}
            </span>
          </div>
        </div>
      )}

      {session.status === "SKIPPED" && (
        <div style={kort}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="arrow-right" size={18} style={{ color: TL.mute }} />
            <span style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              {UI.sessionSkippedTitle}
            </span>
          </div>
        </div>
      )}

      <Link
        href="/portal"
        style={{
          textDecoration: "none",
          textAlign: "center",
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: 600,
          color: TL.mute,
          padding: "4px 0",
        }}
      >
        {UI.backToToday}
      </Link>
    </div>
  );
}
