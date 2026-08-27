"use client";

/**
 * OktArkV2 — AgencyOS økt-ark for coach (T6, 27.08.2026).
 *
 * Fasit: `A-14 iPhone Okt-ark Filip.dc.html` — bunnark-look (mørk flate,
 * avrundet topp, grabber, liten caps-metalinje, stor tittel, chips-rad,
 * driller-liste, kontekst-boks, én hvit primær-CTA + sekundær tekst-rad).
 * Fasitens SPESIFIKKE scenario er et Caddie-forslag som skal godkjennes —
 * denne skjermen har EKTE handlinger (start/fullfør/avlys en booket økt),
 * så CTA-tekst og innhold følger den ekte statusmaskinen i page.tsx, ikke
 * fasitens ordrette «Godkjenn uke 34».
 *
 * Datakilde er fortsatt `Booking` (ikke WorkbenchSession) — se
 * ../gjennomfore/okter/[id]/page.tsx for loader og actions.ts for
 * start/avlys-logikken. Kun visningslaget er nytt her; all forretningslogikk
 * (statusutledning fra tid, coach-scoping, varsling) er uendret.
 *
 * Samme visuelle idiom som spillerens `OktArk`
 * (src/components/portal/workbench/OktArk.tsx) — TL-tokens, ett hvitt
 * primær-CTA, sekundær tekst-knapp under. SESSION_DRILLS og «etter økt»-
 * innholdet er fortsatt plassholder portet 1:1 fra legacy (ikke min
 * endring — flagget i page.tsx-kommentaren, egen datakobling gjenstår).
 */

import { useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { startOkt, kansellerBooking } from "@/app/admin/gjennomfore/okter/[id]/actions";

export type OktStatus = "OM 2 TIMER" | "AKTIV NÅ" | "GJENNOMFØRT";

export type OktArkDrill = {
  name: string;
  category: string;
  mins: string;
  reps: string;
  done: number;
  target: number;
};

export type OktArkData = {
  bookingId: string;
  status: OktStatus;
  spillerNavn: string;
  spillerInitialer: string;
  spillerMeta: string;
  fornavn: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  facilityLabel: string;
  durationMin: number;
  trainingSessionV2Id: string | null;
  drills: OktArkDrill[];
  prepNotat: string;
  onsketNotat: string;
  etterOkt: { rating: number; oppsummering: string; nesteOktLabel: string } | null;
  siste5: { bokstav: string; dato: string }[];
};

const eyebrow: CSSProperties = {
  fontFamily: TL.font.mono,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: TL.track.capsSm,
  textTransform: "uppercase",
  color: TL.mute,
};

const kort: CSSProperties = {
  background: TL.elev,
  borderRadius: TL.radius.card,
  padding: 18,
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

const ghostKnapp: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  width: "100%",
  borderRadius: TL.radius.pill,
  border: `1px solid ${TL.hair}`,
  background: "transparent",
  color: TL.text,
  fontFamily: TL.font.sans,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const sekundærKnapp: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  width: "100%",
  border: "none",
  background: "none",
  color: TL.danger,
  fontFamily: TL.font.sans,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export function OktArkV2({ data }: { data: OktArkData }) {
  const router = useRouter();
  const [travel, startTravel] = useTransition();
  const [aktivHandling, setAktivHandling] = useState<"start" | "avlys" | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [avlysApen, setAvlysApen] = useState(false);
  const { status, drills, etterOkt } = data;

  function start() {
    setFeil(null);
    setAktivHandling("start");
    startTravel(async () => {
      const res = await startOkt(data.bookingId);
      if (res.ok && res.sessionId) {
        router.push(`/admin/live/${res.sessionId}/brief`);
      } else {
        setFeil(res.error ?? "Kunne ikke starte økten. Prøv igjen.");
      }
    });
  }

  function bekreftAvlys() {
    setFeil(null);
    setAktivHandling("avlys");
    startTravel(async () => {
      const res = await kansellerBooking(data.bookingId);
      if (res.ok) {
        setAvlysApen(false);
        router.refresh();
      } else {
        setFeil(res.error ?? "Avlysning feilet. Prøv igjen.");
      }
    });
  }

  const statusLabel =
    status === "OM 2 TIMER" ? "Om 2 timer" : status === "AKTIV NÅ" ? "Aktiv nå" : "Gjennomført";
  const startLabel = status === "AKTIV NÅ" ? "Åpne live-konsoll" : "Start økt";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: TL.loft.s2, maxWidth: 620, margin: "0 auto", width: "100%" }}>
      <div>
        <span style={eyebrow}>
          {statusLabel} · {data.dateLabel} · {data.startTime}–{data.endTime}
        </span>
        <h1
          style={{
            margin: "6px 0 0",
            fontFamily: TL.font.sans,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: TL.text,
          }}
        >
          {data.spillerNavn}
        </h1>
        <span style={{ display: "block", marginTop: 4, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
          {data.facilityLabel} · {data.durationMin} min · TrackMan Bridge
        </span>
        <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip>{data.spillerMeta}</Chip>
        </div>
      </div>

      {status === "AKTIV NÅ" && <LiveProgressKort drills={drills} />}

      <div style={{ ...kort, padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 0" }}>
          <span style={eyebrow}>Driller</span>
          <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>
            {drills.length} · {data.durationMin} min
          </span>
        </div>
        <div style={{ marginTop: 8, paddingBottom: 4 }}>
          {drills.map((d, i) => {
            const erAktiv = status === "AKTIV NÅ" && i === 2;
            return (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  borderTop: `1px solid ${TL.hair}`,
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...eyebrow, fontSize: 9.5 }}>{d.category}</span>
                    {erAktiv && (
                      <span style={{ ...eyebrow, color: TL.warm, fontSize: 9.5 }}>Nå</span>
                    )}
                  </span>
                  <span style={{ display: "block", marginTop: 4, fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                    {d.name}
                  </span>
                  <span style={{ display: "block", marginTop: 2, fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>
                    {d.mins} · mål {d.reps}
                  </span>
                </span>
                {status === "GJENNOMFØRT" && (
                  <span style={{ flex: "none", fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.warm }}>
                    {d.done}/{d.target}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={kort}>
        <span style={eyebrow}>Notater</span>
        <div style={{ marginTop: 10, display: "grid", gap: 14 }}>
          <div>
            <span style={{ ...eyebrow, fontSize: 9.5 }}>Prep · du skrev</span>
            <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontStyle: "italic", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
              «{data.prepNotat}»
            </p>
          </div>
          <div>
            <span style={{ ...eyebrow, fontSize: 9.5 }}>{data.fornavn} ønsket</span>
            <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontStyle: "italic", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
              «{data.onsketNotat}»
            </p>
          </div>
        </div>
      </div>

      {etterOkt && (
        <div style={kort}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: `1px solid ${TL.hair}` }}>
            <span style={{ ...eyebrow, fontSize: 9.5 }}>Etter økt</span>
            <div style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon key={i} name="star" size={14} style={{ color: i <= etterOkt.rating ? TL.warm : TL.hair }} />
              ))}
            </div>
            <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>
              {data.fornavn} · {etterOkt.rating}/5
            </span>
          </div>
          <p style={{ margin: "12px 0 0", fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.55 }}>
            {etterOkt.oppsummering}
          </p>
        </div>
      )}

      <div style={kort}>
        <span style={eyebrow}>Spiller</span>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              flex: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: TL.avatar,
              color: TL.onAvatar,
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {data.spillerInitialer}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 700, color: TL.text }}>{data.spillerNavn}</div>
            <div style={{ ...eyebrow, marginTop: 2, fontSize: 9.5 }}>{data.spillerMeta}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {data.siste5.map((s, i) => (
            <div key={i} style={{ borderRadius: TL.radius.row, background: TL.dim, padding: "8px 4px", textAlign: "center" }}>
              <div style={{ fontFamily: TL.font.mono, fontSize: 8.5, color: TL.mute }}>{s.dato}</div>
              <div
                style={{
                  marginTop: 4,
                  display: "inline-grid",
                  placeItems: "center",
                  width: 20,
                  height: 20,
                  borderRadius: 9999,
                  background: TL.elev,
                  fontFamily: TL.font.mono,
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: TL.text,
                }}
              >
                {s.bokstav}
              </div>
            </div>
          ))}
        </div>
      </div>

      {feil && (
        <p role="alert" style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.danger }}>
          {feil}
        </p>
      )}

      {status !== "GJENNOMFØRT" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button type="button" style={primærKnapp} onClick={start} disabled={travel}>
            {travel && aktivHandling === "start" ? "Starter …" : startLabel}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/bookinger" style={{ textDecoration: "none", flex: 1 }}>
              <span style={ghostKnapp}>Reschedule</span>
            </Link>
            <button type="button" style={{ ...ghostKnapp, flex: 1, color: TL.danger }} onClick={() => setAvlysApen(true)}>
              Avlys
            </button>
          </div>
        </div>
      ) : data.trainingSessionV2Id ? (
        <Link href={`/admin/live/${data.trainingSessionV2Id}/summary`} style={{ textDecoration: "none" }}>
          <span style={primærKnapp}>Skriv oppfølging</span>
        </Link>
      ) : (
        <span style={{ ...primærKnapp, opacity: 0.5, cursor: "not-allowed" }}>Skriv oppfølging</span>
      )}

      <Link
        href="/admin/kalender"
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
        Tilbake til kalenderen
      </Link>

      {avlysApen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Avlys økt"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: TL.scrim,
          }}
          onClick={() => !travel && setAvlysApen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: TL.elev,
              borderRadius: `${TL.radius.sheet} ${TL.radius.sheet} 0 0`,
              padding: "18px 20px calc(20px + env(safe-area-inset-bottom))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: TL.grabber, margin: "0 auto 16px" }} />
            <h2 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 19, fontWeight: 700, color: TL.text }}>
              Avlys økt
            </h2>
            <p style={{ marginTop: 8, fontFamily: TL.font.sans, fontSize: 13.5, lineHeight: 1.5, color: TL.mute }}>
              Økten avlyses og {data.fornavn} får et varsel. Dette kan ikke angres herfra — ny økt
              må bookes på nytt.
            </p>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                type="button"
                style={{ ...primærKnapp, background: TL.danger, color: TL.onDanger }}
                onClick={bekreftAvlys}
                disabled={travel}
              >
                {travel && aktivHandling === "avlys" ? "Avlyser …" : "Avlys økt"}
              </button>
              <button type="button" style={sekundærKnapp} onClick={() => setAvlysApen(false)} disabled={travel}>
                Behold økten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 24,
        padding: "0 10px",
        borderRadius: TL.radius.pill,
        boxShadow: `inset 0 0 0 1px ${TL.hair}`,
        fontFamily: TL.font.mono,
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: TL.track.capsSm,
        textTransform: "uppercase",
        color: TL.mute,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function LiveProgressKort({ drills }: { drills: OktArkDrill[] }) {
  const aktivIdx = 2 < drills.length ? 2 : 0;
  const aktiv = drills[aktivIdx];
  const done = drills.filter((d) => d.done > 0).length;
  return (
    <div style={{ ...kort, background: TL.fill, color: TL.onFill }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ ...eyebrow, color: TL.onFill, opacity: 0.7 }}>Aktiv nå</span>
        <Icon name="pause" size={16} style={{ color: TL.onFill, opacity: 0.7 }} />
      </div>
      {aktiv && (
        <div style={{ marginTop: 12 }}>
          <span style={{ ...eyebrow, color: TL.onFill, opacity: 0.55, fontSize: 9.5 }}>
            Nåværende drill · {done}/{drills.length}
          </span>
          <div style={{ marginTop: 4, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 700 }}>{aktiv.name}</div>
        </div>
      )}
      <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
        {drills.map((d, i) => {
          const pct = d.target > 0 ? (d.done / d.target) * 100 : 0;
          return (
            <div key={i} style={{ height: 4, flex: 1, borderRadius: 9999, background: `color-mix(in srgb, ${TL.onFill} 20%, transparent)`, overflow: "hidden" }}>
              <div style={{ height: "100%", background: TL.onFill, width: `${Math.min(100, pct)}%` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
