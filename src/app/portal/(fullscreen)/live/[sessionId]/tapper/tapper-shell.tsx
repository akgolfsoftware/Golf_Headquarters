"use client";

/**
 * PlayerHQ · Slagteller-shell — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-live-tapper.html.
 *
 * Struktur per fasit: topp (tilbake + Slagteller + økt-sub) → stort tellertall
 * «slag denne økta» → «siste slag kl. X» med Angre → fordeling per kølle →
 * bunnfestet fangstflate med kølleknapper (60px-mål) + clay «Avslutt og lagre».
 *
 * Databegrensning (bevisst): persisteringen er dagens SessionBallLog-
 * AGGREGATER (saveTapperCounts) — ingen Shot-skriving. «Siste slag kl. X» og
 * Angre bæres derfor av LOKAL state i denne shell-en (kun tapp gjort i denne
 * nettleserøkta); uten lokale tapp utelates raden ærlig. Debounce, offline-kø
 * (leggIKo/tomKo) og gjenopptak fra initialCounts er uendret.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";
import { LiveCoachPanel } from "@/components/portal/live/LiveCoachPanel";
import type { LiveCoachPanelData } from "@/components/portal/live/types";
import { saveTapperCounts } from "./actions";
import { leggIKo, tomKo } from "@/lib/offline-queue/tapper-queue";

type Club = { id: string; name: string };

type Props = {
  sessionId: string;
  /** Øktas navn — mono-sublinjen i toppen. */
  oktLabel: string;
  /** Kølleknappene — fra spillerens utstyrsbag (bygget i page.tsx). */
  clubs: Club[];
  coachPanel: LiveCoachPanelData;
  /** Tidligere lagrede tellinger (session_ball_logs) — gjenopptak etter refresh. */
  initialCounts?: Record<string, number>;
};

/** Lokalt tapp denne nettleserøkta — bærer «siste slag kl. X» + Angre. */
type Tapp = { clubId: string; kl: string };

const OSLO_KL = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export function TapperShell({ sessionId, oktLabel, clubs, coachPanel, initialCounts }: Props) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>(() => ({
    ...Object.fromEntries(clubs.map((c) => [c.id, 0])),
    ...(initialCounts ?? {}),
  }));
  const [tapp, setTapp] = useState<Tapp[]>([]);
  const [lagreStatus, setLagreStatus] = useState<"ok" | "kolagt" | "gitt-opp">("ok");

  // ── Persistering: debounce + flush (uendret mekanikk) ──────────
  const countsRef = useRef(counts);
  useEffect(() => {
    countsRef.current = counts;
  }, [counts]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function lagre(): Promise<boolean> {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const payload = Object.entries(countsRef.current).map(([club, count]) => ({ club, count }));
    try {
      const res = await saveTapperCounts(sessionId, payload);
      if (res.ok) {
        setLagreStatus("ok");
        return true;
      }
    } catch {
      /* nettverksfeil — køes lokalt under, ikke bare et in-memory flagg */
    }
    // IndexedDB kan i sjeldne tilfeller kaste synkront (f.eks. lukket
    // forbindelse) — skal aldri hindre avslutt() sin navigering.
    await leggIKo(sessionId, payload).catch(() => {});
    setLagreStatus("kolagt");
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

  // Tøm evt. kølagt telling fra en tidligere økt: ved mount og hver gang
  // nettet kommer tilbake mens siden er åpen.
  useEffect(() => {
    async function synk() {
      const resultat = await tomKo(sessionId, saveTapperCounts);
      if (resultat === "synket") setLagreStatus("ok");
      else if (resultat === "gitt-opp") setLagreStatus("gitt-opp");
    }
    void synk();
    window.addEventListener("online", synk);
    return () => window.removeEventListener("online", synk);
  }, [sessionId]);

  async function avslutt() {
    await lagre();
    router.push(`/portal/live/${sessionId}`);
  }

  function tappKolle(clubId: string) {
    setCounts((prev) => ({ ...prev, [clubId]: (prev[clubId] ?? 0) + 1 }));
    setTapp((prev) => [{ clubId, kl: OSLO_KL.format(new Date()) }, ...prev]);
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
    const siste = tapp[0];
    if (!siste) return;
    setCounts((prev) => ({
      ...prev,
      [siste.clubId]: Math.max(0, (prev[siste.clubId] ?? 0) - 1),
    }));
    setTapp((prev) => prev.slice(1));
    planleggLagring();
  }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const navnFor = (id: string) => clubs.find((c) => c.id === id)?.name ?? id;

  // Fordeling: kølleknappenes rekkefølge først, deretter evt. historiske
  // kølle-nøkler fra tidligere lagringer som ikke lenger er i bagen.
  const fordelingIds = [
    ...clubs.map((c) => c.id),
    ...Object.keys(counts).filter((id) => !clubs.some((c) => c.id === id)),
  ].filter((id) => (counts[id] ?? 0) > 0);
  const maks = Math.max(1, ...fordelingIds.map((id) => counts[id] ?? 0));

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
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600 }}>Slagteller</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {oktLabel}
          </span>
        </div>
      </header>

      {/* Kropp */}
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, width: "100%", maxWidth: 720, margin: "0 auto" }}>
        {/* Feil — slagene ligger trygt lokalt (offline-køen bærer dem) */}
        {lagreStatus !== "ok" && (
          <div
            role="alert"
            style={{ padding: "16px", background: TL.dock, border: `1px dashed ${TL.hair}`, borderRadius: TL.radius.card, marginBottom: 12 }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              Slagene ble ikke lagret
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
              {lagreStatus === "gitt-opp"
                ? "Fikk ikke synket etter flere forsøk — slagene ligger fortsatt trygt på telefonen. Sjekk nettet ditt."
                : `Nettet forsvant under lagringen. De ${totalCount} slagene ligger trygt på telefonen og sendes automatisk når nettet er tilbake.`}
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

        {/* Telleren — skjermens hovedoppslag */}
        <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: TL.mute }}>
            slag denne økta
          </span>
          <div style={{ fontFamily: TL.font.mono, fontSize: 40, fontWeight: 600, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
            {totalCount}
          </div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
            Tapp kølla du slo med — ett tapp per slag.
          </div>
        </div>

        {/* Siste slag + Angre — KUN når lokale tapp finnes (aggregatene fra
            databasen har ikke tidsstempler, så raden fabrikkeres aldri) */}
        {tapp.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: TL.elev,
              border: `1px solid ${TL.hair}`,
              borderRadius: TL.radius.card,
              padding: "12px 16px",
              marginBottom: 12,
              minWidth: 0,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontFamily: TL.font.sans }}>
              <span style={{ fontWeight: 600 }}>{navnFor(tapp[0].clubId)}</span>
              {" · siste slag"}
              <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
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
              Angre
            </button>
          </div>
        )}

        {/* Fordeling per kølle */}
        {fordelingIds.length > 0 && (
          <div>
            <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: TL.mute }}>
              fordeling per kølle
            </span>
            {fordelingIds.map((id, i) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0",
                  fontSize: 13,
                  fontFamily: TL.font.sans,
                  borderBottom: i === fordelingIds.length - 1 ? "none" : `1px solid ${TL.hair}`,
                  minWidth: 0,
                }}
              >
                <span style={{ minWidth: 64, flex: "none" }}>{navnFor(id)}</span>
                <span style={{ flex: 1, height: 6, background: TL.dock, borderRadius: TL.radius.pill, overflow: "hidden", minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${Math.round(((counts[id] ?? 0) / maks) * 100)}%`,
                      background: TL.mute,
                      borderRadius: TL.radius.pill,
                    }}
                  />
                </span>
                <span style={{ fontFamily: TL.font.mono, fontVariantNumeric: "tabular-nums", minWidth: "2ch", textAlign: "right" }}>
                  {counts[id]}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Køllene — bunnfestet fangstflate (Kontrakt §4: primær handling
          bunnfestet på mobil, aldri i scroll-flyt) */}
      <div
        style={{
          flex: "none",
          borderTop: `1px solid ${TL.hair}`,
          background: TL.elev,
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
            {clubs.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => tappKolle(c.id)}
                data-od-id={`tapper-klubb-${c.id}`}
                className="v2-press v2-focus"
                style={{
                  minHeight: 60,
                  border: `1px solid ${TL.hair}`,
                  borderRadius: TL.radius.card,
                  background: TL.scene,
                  color: TL.text,
                  fontFamily: TL.font.sans,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  minWidth: 0,
                }}
              >
                <span>{c.name}</span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>tapp = 1 slag</span>
              </button>
            ))}
          </div>
          {/* Kontrakt §3: skjermens ene aksenthandling — avslutter tellingen
              og lagrer slagene i økta. Kølletappene er selve fangstflaten. */}
          <button
            type="button"
            onClick={() => void avslutt()}
            data-od-id="tapper-avslutt"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
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
            Avslutt og lagre
          </button>
        </div>
      </div>

      <LiveCoachPanel data={coachPanel} />
    </div>
  );
}
