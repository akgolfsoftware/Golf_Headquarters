"use client";

/**
 * PlayerHQ · Slagteller- og repetisjonsshell.
 * Støtter full sving (køller), nærspill (chip, pitch, lob, bunker)
 * og putting (kortputt, mellomputt, lengdeputt), samt repetisjonstyper (full fart, lav fart, tørrsving).
 *
 * Fasit: designsystem/train-lock/PH-05 Live.dc.html
 * Avvik:
 *   - Ingen riggrad for fullskjerm-tapperen ennå; innholdet avhenger av øktas køller, rep-typer og lagrede tellinger.
 *   - Utvidet med repetisjonstyper og områder for AK-formelen.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";
import { LiveCoachPanel } from "@/components/portal/live/LiveCoachPanel";
import type { LiveCoachPanelData } from "@/components/portal/live/types";
import { saveTapperCounts, finishTapperSession } from "./actions";
import { leggIKo, tomKo } from "@/lib/offline-queue/tapper-queue";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import {
  RepetitionArea,
  RepetitionType,
  REPETITION_AREAS,
  REPETITION_TYPES,
  SHORT_GAME_TARGETS,
  PUTTING_TARGETS,
  buildRepKey,
  parseRepKey,
  formatRepLabel,
} from "@/lib/domain/workbench/reps";

type Club = { id: string; name: string };

type LogEntry = {
  club: string;
  count: number;
  area?: string | null;
  category?: string | null;
  repetitionType?: string | null;
};

type Props = {
  sessionId: string;
  /** Øktas navn — mono-sublinjen i toppen. */
  oktLabel: string;
  /** Kølleknappene — fra spillerens utstyrsbag (bygget i page.tsx). */
  clubs: Club[];
  coachPanel: LiveCoachPanelData;
  /** Tidligere lagrede tellinger (session_ball_logs) — gjenopptak etter refresh. */
  initialCounts?: Record<string, number>;
  initialLogs?: LogEntry[];
};

/** Lokalt tapp denne nettleserøkta — bærer «siste rep kl. X» + Angre. */
type Tapp = { key: string; label: string; kl: string };

const OSLO_KL = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export function TapperShell({
  sessionId,
  oktLabel,
  clubs,
  coachPanel,
  initialCounts,
  initialLogs,
}: Props) {
  const router = useRouter();
  const eierId = useLokalDataEier();

  const [activeArea, setActiveArea] = useState<RepetitionArea>("FULL_SVING");
  const [activeRepType, setActiveRepType] = useState<RepetitionType>("FULL_SPEED");

  const [counts, setCounts] = useState<Record<string, number>>(() => ({
    ...Object.fromEntries(clubs.map((c) => [c.id, 0])),
    ...(initialCounts ?? {}),
  }));
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [tapp, setTapp] = useState<Tapp[]>([]);
  const [lagreStatus, setLagreStatus] = useState<"ok" | "kolagt" | "gitt-opp">("ok");

  // Metadata-oppslag for nøkkel
  function getMeta(key: string) {
    const { baseId, repType } = parseRepKey(key);

    const clubMatch = clubs.find((c) => c.id === baseId);
    if (clubMatch) {
      return {
        name: formatRepLabel(clubMatch.name, repType),
        baseName: clubMatch.name,
        area: "FULL_SVING" as RepetitionArea,
        category: baseId,
        repetitionType: repType,
      };
    }

    const shortMatch = SHORT_GAME_TARGETS.find((s) => s.baseId === baseId);
    if (shortMatch) {
      return {
        name: formatRepLabel(shortMatch.name, repType),
        baseName: shortMatch.name,
        area: "NAERSPILL" as RepetitionArea,
        category: shortMatch.category,
        repetitionType: repType,
      };
    }

    const puttMatch = PUTTING_TARGETS.find((p) => p.baseId === baseId);
    if (puttMatch) {
      return {
        name: formatRepLabel(puttMatch.name, repType),
        baseName: puttMatch.name,
        area: "PUTTING" as RepetitionArea,
        category: puttMatch.category,
        repetitionType: repType,
      };
    }

    const logMatch = initialLogs?.find((l) => l.club === key);
    if (logMatch) {
      return {
        name: formatRepLabel(logMatch.club, (logMatch.repetitionType as RepetitionType) || repType),
        baseName: logMatch.club,
        area: (logMatch.area as RepetitionArea) || "FULL_SVING",
        category: logMatch.category || logMatch.club,
        repetitionType: (logMatch.repetitionType as RepetitionType) || repType,
      };
    }

    return {
      name: formatRepLabel(baseId, repType),
      baseName: baseId,
      area: "FULL_SVING" as RepetitionArea,
      category: baseId,
      repetitionType: repType,
    };
  }

  const navnFor = (key: string) => getMeta(key).name;

  // ── Persistering: debounce + flush ──────────
  const countsRef = useRef(counts);
  useEffect(() => {
    countsRef.current = counts;
  }, [counts]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildPayload() {
    return Object.entries(countsRef.current).map(([club, count]) => {
      const meta = getMeta(club);
      return {
        club,
        count,
        area: meta.area,
        category: meta.category,
        repetitionType: meta.repetitionType,
      };
    });
  }

  async function lagre(): Promise<boolean> {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const payload = buildPayload();
    try {
      const res = await saveTapperCounts(sessionId, payload);
      if (res.ok) {
        setLagreStatus("ok");
        return true;
      }
    } catch {
      /* nettverksfeil — køes lokalt under */
    }
    const kolagt = eierId
      ? await leggIKo(eierId, sessionId, payload).catch(() => false)
      : false;
    setLagreStatus(kolagt ? "kolagt" : "gitt-opp");
    return false;
  }

  function planleggLagring() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void lagre(), 5_000);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    async function synk() {
      if (!eierId) return;
      const resultat = await tomKo(eierId, sessionId, saveTapperCounts);
      if (resultat === "synket") setLagreStatus("ok");
      else if (resultat === "gitt-opp") setLagreStatus("gitt-opp");
    }
    void synk();
    window.addEventListener("online", synk);
    return () => window.removeEventListener("online", synk);
  }, [eierId, sessionId]);

  async function avslutt() {
    if (finishing) return;
    setFinishing(true);
    setFinishError(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      const result = await finishTapperSession(sessionId, buildPayload());
      if (!result.ok) {
        setFinishError(result.error ?? "Økten ble ikke avsluttet. Prøv igjen.");
        return;
      }
      router.push(`/portal/live/${sessionId}/summary`);
    } catch {
      setFinishError("Økten ble ikke avsluttet. Behold siden åpen og prøv igjen når nettet er tilbake.");
    } finally {
      setFinishing(false);
    }
  }

  function tappElement(baseId: string) {
    if (finishing) return;
    const key = buildRepKey(baseId, activeRepType);
    const label = navnFor(key);
    setCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    setTapp((prev) => [{ key, label, kl: OSLO_KL.format(new Date()) }, ...prev]);
    planleggLagring();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(20);
      } catch {
        /* noop */
      }
    }
  }

  function angre() {
    if (finishing) return;
    const siste = tapp[0];
    if (!siste) return;
    setCounts((prev) => ({
      ...prev,
      [siste.key]: Math.max(0, (prev[siste.key] ?? 0) - 1),
    }));
    setTapp((prev) => prev.slice(1));
    planleggLagring();
  }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  // Fordeling av registrerte repetisjoner
  const fordelingKeys = Object.keys(counts).filter((key) => (counts[key] ?? 0) > 0);
  const maks = Math.max(1, ...fordelingKeys.map((key) => counts[key] ?? 0));

  return (
    <div
      data-paper-slug="playerhq-live-tapper"
      data-od-id="playerhq-live-tapper"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: TL.scene,
        color: TL.text,
      }}
    >
      {/* Topp — tilbake + Slagteller + økt-sub */}
      <header
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "calc(12px + env(safe-area-inset-top)) 16px 12px",
          borderBottom: `1px solid ${TL.hair}`,
          background: TL.elev,
        }}
      >
        <Link
          href={`/portal/live/${sessionId}`}
          aria-label="Til live-økta"
          data-od-id="tapper-tilbake"
          className="v2-press v2-focus"
          style={{
            flex: "none",
            width: 44,
            height: 44,
            display: "grid",
            placeItems: "center",
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <Icon name="chevron-left" size={18} />
        </Link>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600 }}>Slag og repetisjoner</h1>
          <span
            style={{
              display: "block",
              fontFamily: TL.font.mono,
              fontSize: 10.5,
              color: TL.mute,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {oktLabel}
          </span>
        </div>
      </header>

      {/* Kropp */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: 16,
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {finishError && <p role="alert">{finishError}</p>}
        {lagreStatus !== "ok" && (
          <div
            role="alert"
            style={{
              padding: "16px",
              background: TL.dock,
              border: `1px dashed ${TL.hair}`,
              borderRadius: TL.radius.card,
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              Tellingene ble ikke lagret
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
              {lagreStatus === "gitt-opp"
                ? "Fikk ikke synket etter flere forsøk — repetisjonene ligger fortsatt trygt på telefonen. Sjekk nettet ditt."
                : `Nettet forsvant under lagringen. De ${totalCount} repetisjonene ligger trygt på telefonen og sendes automatisk når nettet er tilbake.`}
            </p>
            <button
              type="button"
              onClick={() => void lagre()}
              data-od-id="tapper-retry"
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "0 16px",
                fontFamily: TL.font.sans,
                fontSize: 14,
                fontWeight: 500,
                background: "transparent",
                border: `1px solid ${TL.hair}`,
                borderRadius: TL.radius.card,
                color: TL.text,
                cursor: "pointer",
              }}
            >
              Prøv igjen nå
            </button>
          </div>
        )}

        {/* Telleren — hovedoppslag */}
        <div style={{ textAlign: "center", padding: "20px 0 14px" }}>
          <span
            style={{
              display: "block",
              fontFamily: TL.font.mono,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            repetisjoner denne økta
          </span>
          <div
            style={{
              fontFamily: TL.font.mono,
              fontSize: 44,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
              marginTop: 4,
            }}
          >
            {totalCount}
          </div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, marginTop: 4 }}>
            Velg område og fart nedenfor — ett tapp per slag eller repetisjon.
          </div>
        </div>

        {/* Siste repetisjon + Angre */}
        {tapp.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: TL.elev,
              border: `1px solid ${TL.hair}`,
              borderRadius: TL.radius.card,
              padding: "10px 14px",
              marginBottom: 14,
              minWidth: 0,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontFamily: TL.font.sans }}>
              <span style={{ fontWeight: 600 }}>{tapp[0].label}</span>
              {" · sist registrert"}
              <span
                style={{
                  display: "block",
                  fontFamily: TL.font.mono,
                  fontSize: 10.5,
                  color: TL.mute,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                kl. {tapp[0].kl}
              </span>
            </div>
            <button
              type="button"
              onClick={angre}
              data-od-id="tapper-angre"
              className="v2-press v2-focus"
              style={{
                flex: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 40,
                padding: "0 14px",
                fontFamily: TL.font.sans,
                fontSize: 13,
                fontWeight: 500,
                background: "transparent",
                border: `1px solid ${TL.hair}`,
                borderRadius: TL.radius.card,
                color: TL.text,
                cursor: "pointer",
              }}
            >
              Angre
            </button>
          </div>
        )}

        {/* Fordeling */}
        {fordelingKeys.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                display: "block",
                fontFamily: TL.font.mono,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: TL.mute,
                marginBottom: 6,
              }}
            >
              fordeling denne økta
            </span>
            {fordelingKeys.map((key, i) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0",
                  fontSize: 13,
                  fontFamily: TL.font.sans,
                  borderBottom: i === fordelingKeys.length - 1 ? "none" : `1px solid ${TL.hair}`,
                  minWidth: 0,
                }}
              >
                <span style={{ minWidth: 110, flex: "none", fontWeight: 500 }}>{navnFor(key)}</span>
                <span
                  style={{
                    flex: 1,
                    height: 6,
                    background: TL.dock,
                    borderRadius: TL.radius.pill,
                    overflow: "hidden",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${Math.round(((counts[key] ?? 0) / maks) * 100)}%`,
                      background: TL.mute,
                      borderRadius: TL.radius.pill,
                    }}
                  />
                </span>
                <span
                  style={{
                    fontFamily: TL.font.mono,
                    fontVariantNumeric: "tabular-nums",
                    minWidth: "3ch",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  {counts[key]}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bunnfestet fangstflate: Område-tabs + Type-chips + Tapp-knapper + Avslutt */}
      <div
        style={{
          flex: "none",
          borderTop: `1px solid ${TL.hair}`,
          background: TL.elev,
          padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
          {/* Område-faner: Full sving | Nærspill | Putting */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {REPETITION_AREAS.map((a) => {
              const active = activeArea === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActiveArea(a.id)}
                  data-od-id={`tapper-omraade-${a.id.toLowerCase()}`}
                  className="v2-press v2-focus"
                  style={{
                    flex: 1,
                    minHeight: 38,
                    border: active ? `1px solid ${TL.fill}` : `1px solid ${TL.hair}`,
                    background: active ? TL.fill : "transparent",
                    color: active ? TL.onFill : TL.mute,
                    borderRadius: TL.radius.card,
                    fontFamily: TL.font.sans,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {a.label}
                </button>
              );
            })}
          </div>

          {/* Repetisjonstype-chips: Full fart | Lav fart | Tørrsving */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10, justifyContent: "center" }}>
            {REPETITION_TYPES.map((t) => {
              const active = activeRepType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveRepType(t.id)}
                  data-od-id={`tapper-type-${t.id.toLowerCase()}`}
                  className="v2-press v2-focus"
                  style={{
                    padding: "4px 10px",
                    border: active ? `1px solid ${TL.hair}` : "1px solid transparent",
                    background: active ? TL.dock : "transparent",
                    color: active ? TL.text : TL.mute,
                    borderRadius: TL.radius.pill,
                    fontFamily: TL.font.sans,
                    fontSize: 11.5,
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tappeknapper for valgt område */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                activeArea === "NAERSPILL" || activeArea === "PUTTING"
                  ? "repeat(4, 1fr)"
                  : "repeat(3, 1fr)",
              gap: 8,
              marginBottom: 10,
            }}
          >
            {activeArea === "FULL_SVING" &&
              clubs.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => tappElement(c.id)}
                  data-od-id={`tapper-klubb-${c.id}`}
                  className="v2-press v2-focus"
                  style={{
                    minHeight: 56,
                    border: `1px solid ${TL.hair}`,
                    borderRadius: TL.radius.card,
                    background: TL.scene,
                    color: TL.text,
                    fontFamily: TL.font.sans,
                    fontSize: 13.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  <span>{c.name}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute }}>
                    {activeRepType === "FULL_SPEED"
                      ? "1 slag"
                      : activeRepType === "LOW_SPEED"
                      ? "lav fart"
                      : "tørrsving"}
                  </span>
                </button>
              ))}

            {activeArea === "NAERSPILL" &&
              SHORT_GAME_TARGETS.map((t) => (
                <button
                  key={t.baseId}
                  type="button"
                  onClick={() => tappElement(t.baseId)}
                  data-od-id={`tapper-naerspill-${t.baseId}`}
                  className="v2-press v2-focus"
                  style={{
                    minHeight: 56,
                    border: `1px solid ${TL.hair}`,
                    borderRadius: TL.radius.card,
                    background: TL.scene,
                    color: TL.text,
                    fontFamily: TL.font.sans,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  <span>{t.name}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute }}>
                    {activeRepType === "FULL_SPEED"
                      ? "1 rep"
                      : activeRepType === "LOW_SPEED"
                      ? "lav fart"
                      : "tørrsving"}
                  </span>
                </button>
              ))}

            {activeArea === "PUTTING" &&
              PUTTING_TARGETS.map((p) => (
                <button
                  key={p.baseId}
                  type="button"
                  onClick={() => tappElement(p.baseId)}
                  data-od-id={`tapper-putting-${p.baseId}`}
                  className="v2-press v2-focus"
                  style={{
                    minHeight: 52,
                    padding: "4px 2px",
                    border: `1px solid ${TL.hair}`,
                    borderRadius: TL.radius.card,
                    background: TL.scene,
                    color: TL.text,
                    fontFamily: TL.font.sans,
                    fontSize: 11.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    minWidth: 0,
                    textAlign: "center",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{p.name}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>
                    {activeRepType === "FULL_SPEED"
                      ? "1 rep"
                      : activeRepType === "LOW_SPEED"
                      ? "lav fart"
                      : "tørrsving"}
                  </span>
                </button>
              ))}
          </div>

          {/* Avslutt og lagre */}
          <button
            type="button"
            disabled={finishing}
            onClick={() => void avslutt()}
            data-od-id="tapper-avslutt"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 50,
              width: "100%",
              border: "none",
              borderRadius: TL.radius.card,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {finishing ? "Lagrer …" : "Avslutt og lagre"}
          </button>
        </div>
      </div>

      <LiveCoachPanel data={coachPanel} />
    </div>
  );
}
