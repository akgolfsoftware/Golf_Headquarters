"use client";

/**
 * AgencyOS · Live-active — v2 (retning C «Presis»). Coachens sanntids-
 * monitorering av en pågående TrainingSessionV2. Ingen egen Claude Design-
 * mockup finnes for denne skjermen (kun Brief/Summary er tegnet i
 * agencyos-drift.jsx) — komponert fra samme v2-språk og -tokens som de to
 * porterte søsterskjermene (16. juli 2026-port), per design-system-regelens
 * «dekket via komponentsystem»-prinsipp.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { T, type AkseKey } from "@/lib/v2/tokens";
import { Caps, Tittel, StatusPill, KpiFlis, Kort, CTAPill, AkseChip, AvatarInit, Ring } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { LiveMelding } from "@/app/admin/(legacy)/live/[sessionId]/active/_live-melding";

function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

export type AdminLiveActiveDrill = { id: string; navn: string; aktiv: boolean };

export type AdminLiveActiveV2Data = {
  sessionId: string;
  tittel: string;
  spillerNavn: string | null;
  akse: AkseKey;
  statusLabel: string;
  erAktiv: boolean;
  startetLabel: string | null;
  varighetMin: number;
  tidIgjenMin: number;
  miljoLabel: string;
  praksisLabel: string;
  drills: AdminLiveActiveDrill[];
  planFremdriftPct: number;
  briefHref: string;
  summaryHref: string;
};

export function AdminLiveActiveV2({ data }: { data: AdminLiveActiveV2Data }) {
  const mobile = useMobile();

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>
          <Link href={data.briefHref} style={{ color: "inherit", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="arrow-left" size={11} />Brief
          </Link>
          {" · Live-økt · Coach"}
        </Caps>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
          {data.erAktiv && (
            <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10, flex: "none" }}>
              <span className="v2-live-ping" style={{ position: "absolute", inset: 0, borderRadius: 9999, background: T.lime, opacity: 0.6 }} />
              <span style={{ position: "relative", width: 10, height: 10, borderRadius: 9999, background: T.lime }} />
            </span>
          )}
          <Tittel mobile={mobile}>{data.tittel}</Tittel>
        </div>
        {data.erAktiv && data.startetLabel && (
          <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 11, color: T.lime }}>
            Pågår · {data.startetLabel} · {data.varighetMin} min
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {data.spillerNavn && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}` }}>
            <AvatarInit navn={data.spillerNavn} size={26} />
            <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>{data.spillerNavn}</span>
          </span>
        )}
        <AkseChip a={data.akse} />
        <StatusPill tone={data.erAktiv ? "lime" : "info"}>{data.statusLabel}</StatusPill>
      </div>
    </div>
  );

  const kpi = (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: T.gap }}>
      <KpiFlis label="Drills" value={String(data.drills.length)} />
      <KpiFlis label="Økttype" value={data.praksisLabel} />
      <KpiFlis label="Tid igjen" value={`${data.tidIgjenMin} min`} />
      <KpiFlis label="Status" value={data.statusLabel} />
    </div>
  );

  const drillliste = (
    <Kort eyebrow="Drill-løp">
      {data.drills.length === 0 && (
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>Ingen drills registrert for denne økten ennå.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {data.drills.map((d, i) => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 11, background: d.aktiv ? T.panel2 : "transparent", border: `1px solid ${d.aktiv ? T.borderS : "transparent"}` }}>
            <span style={{ width: 22, height: 22, flex: "none", borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 10, fontWeight: 700, background: d.aktiv ? T.lime : T.panel3, color: d.aktiv ? T.onLime : T.mut }}>{i + 1}</span>
            <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13, fontWeight: d.aktiv ? 600 : 500, color: d.aktiv ? T.fg : T.fg2 }}>{d.navn}</span>
            {d.aktiv && <Icon name="activity" size={13} style={{ color: T.lime }} />}
          </div>
        ))}
      </div>
    </Kort>
  );

  const fremdriftKort = (
    <Kort eyebrow="Plan-fremdrift">
      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
        <Ring pct={data.planFremdriftPct} size={96} label="fullført" />
      </div>
    </Kort>
  );

  const statusKort = (
    <Kort eyebrow="Status">
      {[
        { l: "Økt-status", v: data.statusLabel },
        { l: "Miljø", v: data.miljoLabel },
        { l: "Autosave", v: "På" },
      ].map((s) => (
        <div key={s.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>{s.l}</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "2px 9px" }}>{s.v}</span>
        </div>
      ))}
    </Kort>
  );

  const meldingKort = (
    <Kort eyebrow="Send melding til spiller">
      <LiveMelding sessionId={data.sessionId} />
    </Kort>
  );

  const avslutt = (
    <Link href={data.summaryHref} style={{ display: "contents" }}>
      <CTAPill icon="flag" full>Avslutt og se sammendrag</CTAPill>
    </Link>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <style>{`@keyframes v2LivePing{0%{transform:scale(1);opacity:.6}75%,100%{transform:scale(2.2);opacity:0}}.v2-live-ping{animation:v2LivePing 1.6s cubic-bezier(0,0,.2,1) infinite}`}</style>
      {hode}
      {kpi}
      {mobile ? (
        <>
          {fremdriftKort}
          {drillliste}
          {statusKort}
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: T.gap, alignItems: "start" }}>
          {drillliste}
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>{fremdriftKort}{statusKort}</div>
        </div>
      )}
      {meldingKort}
      {avslutt}
    </div>
  );
}
