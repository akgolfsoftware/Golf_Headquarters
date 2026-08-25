"use client";

/**
 * Spillerens økt-ark for en publisert Workbench-økt (Loop 3S).
 * Start → IN_PROGRESS, Fullfør → COMPLETED, Hopp over → SKIPPED.
 * Kaller wb-actions direkte (server actions) — WbResultat + toast ved feil,
 * lokal state oppdateres optimistisk fra returnert økt (ingen full reload).
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Kort, Rad, CTAPill, StatusPill, Icon, T } from "@/components/v2";
import { AkseChip } from "@/components/v2/core";
import {
  UI,
  PYRAMID_LABEL,
  formatMinutes,
  formatTime,
} from "@/lib/domain/workbench/labels";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { startSession, completeSession, skipSession } from "@/lib/workbench/wb-actions";
import { harHake, STATUS_CAPS, WARM } from "@/components/workbench/wb-visuelt";

type Handling = "start" | "fullfor" | "hopp-over";

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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 680, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 18, fontWeight: 600, color: T.fg }}>
            {session.title}
          </h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 4 }}>
            {formatTime(session.startMinute)} · {formatMinutes(session.durationMinutes)}
          </span>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: T.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.07em",
            color: harHake(session.status) ? WARM : T.mut,
          }}
        >
          {harHake(session.status) && <Icon name="check" size={11} style={{ color: WARM }} />}
          {STATUS_CAPS[session.status]}
        </span>
      </div>

      <Kort>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <AkseChip a={session.pyramid} />
          <StatusPill tone="info">{PYRAMID_LABEL[session.pyramid]}</StatusPill>
        </div>
        {session.notes && (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, marginTop: 12, marginBottom: 0 }}>
            {session.notes}
          </p>
        )}
      </Kort>

      <Kort eyebrow={UI.drills} action={<span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{session.drills.length}</span>}>
        {session.drills.length === 0 ? (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>{UI.emptyDrills}</p>
        ) : (
          session.drills.map((d, i) => (
            <Rad
              key={d.id}
              leading={
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 9999,
                    flex: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: T.panel2,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <Icon name="circle" size={13} style={{ color: T.mut }} />
                </span>
              }
              title={d.title}
              sub={d.techniqueFocus}
              trailing={
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                  {d.durationMinutes} min
                </span>
              }
              last={i === session.drills.length - 1}
            />
          ))
        )}
      </Kort>

      {session.status === "PUBLISHED" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <CTAPill icon="play" full onClick={() => utfor("start")}>
            {laster("start") ? "Starter …" : UI.startSession}
          </CTAPill>
          <CTAPill ghost icon="arrow-right" onClick={() => utfor("hopp-over")}>
            {laster("hopp-over") ? "Lagrer …" : UI.skipSession}
          </CTAPill>
        </div>
      )}

      {session.status === "IN_PROGRESS" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <CTAPill icon="check" full enTing onClick={() => utfor("fullfor")}>
            {laster("fullfor") ? "Fullfører …" : UI.completeSession}
          </CTAPill>
          <CTAPill ghost icon="arrow-right" onClick={() => utfor("hopp-over")}>
            {laster("hopp-over") ? "Lagrer …" : UI.skipSession}
          </CTAPill>
        </div>
      )}

      {session.status === "COMPLETED" && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="check" size={18} style={{ color: WARM }} />
            <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>
              {UI.sessionCompletedTitle}
            </span>
          </div>
        </Kort>
      )}

      {session.status === "SKIPPED" && (
        <Kort>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="arrow-right" size={18} style={{ color: T.mut }} />
            <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>
              {UI.sessionSkippedTitle}
            </span>
          </div>
        </Kort>
      )}

      <Link
        href="/portal"
        style={{
          textDecoration: "none",
          textAlign: "center",
          fontFamily: T.ui,
          fontSize: 12,
          fontWeight: 600,
          color: T.mut,
          padding: "4px 0",
        }}
      >
        {UI.backToToday}
      </Link>
    </div>
  );
}
