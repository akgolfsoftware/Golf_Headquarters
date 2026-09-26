"use client";

/**
 * Spillerens økt-ark for en publisert Workbench-økt (Loop 3S).
 * Fasit: designsystem/train-lock/PH-04 Økt-ark.dc.html
 * Lys: designsystem/train-lock/B3 Lys nøkkelskjermer.dc.html (Lys PH-04
 * Økt-ark) — mekanisk (PX-7, 29.08.2026): filen leser konsekvent TL.* uten
 * hardkodet hex, verifisert med grep — ingen manuell lys-finpuss utover det.
 * Avvik:
 *   - tegningen er et ark; koden er en side (fase 2, Anders 08.09). Ingen
 *     riggrad ennå. Start går til live-tapper (samme beslutning som I dag).
 * Start → IN_PROGRESS + `/portal/live/{id}/tapper`. Pågående: Fortsett til
 * tapper (primær) + Fullfør på arket. Ferdig: Se recap til summary.
 * Kaller wb-actions direkte (server actions) — WbResultat + toast ved feil,
 * lokal state oppdateres optimistisk fra returnert økt (ingen full reload).
 */

import { useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import {
  UI,
  PYRAMID_LABEL,
  formatMinutes,
} from "@/lib/domain/workbench/labels";
import { formatIntervallPunkt } from "@/lib/portal/idag-visning";
import { oktArkLiveHref } from "@/lib/portal/session-hrefs";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import {
  startSession,
  completeSessionWithEffort,
  skipSession,
  updateSessionEffort,
} from "@/lib/workbench/wb-actions";
import { computeSessionLoad, RPE_SKALA } from "@/lib/domain/workbench/load";
import { STATUS_CAPS, WARM } from "@/components/workbench/wb-visuelt";

type Handling = "start" | "fullfor" | "hopp-over";

const kort: CSSProperties = {
  background: TL.elev,
  borderRadius: TL.radius.card,
  padding: 20,
};

/** PH-04: caps-linjen er sans 11/600 med 0.08em — ikke mono. */
const eyebrow: CSSProperties = {
  fontFamily: TL.font.sans,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
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
  textDecoration: "none",
  boxSizing: "border-box",
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
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [travel, startTravel] = useTransition();
  const [aktivHandling, setAktivHandling] = useState<Handling | null>(null);
  const [valgtEffort, setValgtEffort] = useState<number | null>(session.perceivedEffort ?? null);
  const [faktiskeMinutter, setFaktiskeMinutter] = useState<string>(
    session.actualMinutes != null ? String(session.actualMinutes) : String(session.durationMinutes)
  );

  const parsedMin = parseInt(faktiskeMinutter, 10);
  const faktiskTid = Number.isFinite(parsedMin) && parsedMin > 0 ? parsedMin : session.durationMinutes;
  const loadBeregnet = computeSessionLoad({
    durationMinutes: session.durationMinutes,
    actualMinutes: faktiskTid,
    perceivedEffort: valgtEffort,
  });

  function lagreBelastning() {
    startTravel(async () => {
      const res = await updateSessionEffort({
        sessionId: session.id,
        perceivedEffort: valgtEffort,
        actualMinutes: faktiskTid,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSession(res.data);
      toast.success("Belastning lagret");
    });
  }

  function utfor(handling: Handling) {
    setAktivHandling(handling);
    startTravel(async () => {
      const res =
        handling === "start"
          ? await startSession(session.id)
          : handling === "fullfor"
            ? await completeSessionWithEffort({
                sessionId: session.id,
                perceivedEffort: valgtEffort,
                actualMinutes: faktiskTid,
              })
            : await skipSession(session.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (handling === "start") {
        router.push(oktArkLiveHref(session.id, "IN_PROGRESS"));
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
        <span style={{ ...eyebrow, color: session.status === "COMPLETED" ? TL.warmText : eyebrow.color }}>
          {session.status === "PUBLISHED" ? UI.inspectorTitle : STATUS_CAPS[session.status]} ·{" "}
          {formatMinutes(session.durationMinutes)}
        </span>
        <h1 style={{ margin: "7px 0 0", fontFamily: TL.font.sans, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          {session.title}
        </h1>
        <span style={{ display: "block", marginTop: 4, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {[
            PYRAMID_LABEL[session.pyramid],
            session.location?.trim(),
            formatIntervallPunkt(session.startMinute, session.durationMinutes),
          ]
            .filter(Boolean)
            .join(" · ")}
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
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
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
          <Link href={oktArkLiveHref(session.id, "IN_PROGRESS")} style={primærKnapp}>
            {UI.continueSession}
          </Link>
          <button type="button" style={sekundærKnapp} onClick={() => utfor("fullfor")} disabled={travel}>
            {laster("fullfor") ? "Fullfører …" : UI.completeSession}
          </button>
          <button type="button" style={sekundærKnapp} onClick={() => utfor("hopp-over")} disabled={travel}>
            {laster("hopp-over") ? "Lagrer …" : UI.skipSession}
          </button>
        </div>
      )}

      {(session.status === "IN_PROGRESS" || session.status === "COMPLETED") && (
        <div style={{ ...kort, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={eyebrow}>Opplevd anstrengelse (sRPE)</span>
            {loadBeregnet != null && (
              <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.warmText }}>
                {loadBeregnet} belastningspoeng
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 12, fontFamily: TL.font.sans, color: TL.mute }}>
            Hvor anstrengende var økten på en skala fra 1 (veldig lett) til 10 (maksimalt)?
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const aktiv = valgtEffort === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setValgtEffort(num)}
                  title={`${num}: ${RPE_SKALA[num]?.kort} — ${RPE_SKALA[num]?.beskrivelse}`}
                  style={{
                    height: 36,
                    borderRadius: 4,
                    border: `1px solid ${aktiv ? "var(--ak-grunn-farge-rust-600)" : TL.hair}`,
                    background: aktiv ? "var(--ak-grunn-farge-rust-600)" : TL.dock,
                    color: aktiv ? "#ffffff" : TL.text,
                    fontFamily: TL.font.mono,
                    fontSize: 13,
                    fontWeight: aktiv ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {valgtEffort != null && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: TL.dock, padding: "6px 10px", borderRadius: 4 }}>
              <span style={{ fontSize: 12, fontFamily: TL.font.sans, fontWeight: 600, color: TL.text }}>
                {valgtEffort} / 10 · {RPE_SKALA[valgtEffort]?.kort}
              </span>
              <span style={{ fontSize: 11, fontFamily: TL.font.sans, color: TL.mute }}>
                {RPE_SKALA[valgtEffort]?.beskrivelse}
              </span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <label style={{ fontSize: 12, fontFamily: TL.font.sans, color: TL.mute, flex: 1 }}>
              Faktisk varighet (minutter):
            </label>
            <input
              type="number"
              min="1"
              max="600"
              value={faktiskeMinutter}
              onChange={(e) => setFaktiskeMinutter(e.target.value)}
              style={{
                width: 80,
                height: 32,
                borderRadius: 4,
                border: `1px solid ${TL.hair}`,
                background: TL.dock,
                color: TL.text,
                fontFamily: TL.font.mono,
                fontSize: 13,
                textAlign: "center",
              }}
            />
          </div>

          {session.status === "COMPLETED" && (
            <button
              type="button"
              onClick={lagreBelastning}
              disabled={travel}
              style={{
                ...sekundærKnapp,
                marginTop: 6,
                background: "var(--ak-grunn-farge-rust-600)",
                color: "#ffffff",
                border: "none",
              }}
            >
              {travel ? "Lagrer …" : "Lagre belastning"}
            </button>
          )}
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
          <Link
            href={oktArkLiveHref(session.id, "COMPLETED")}
            style={{ ...primærKnapp, marginTop: 16 }}
          >
            {UI.seRecap}
          </Link>
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
