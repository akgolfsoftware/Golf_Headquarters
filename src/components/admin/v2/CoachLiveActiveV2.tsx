"use client";

/**
 * AgencyOS v2 — Live-økt aktiv, coach (`/admin/live/[sessionId]/active`,
 * AgencyOS Bølge 1.3, 2026-07-14). Port fra `(legacy)/live/[sessionId]/active/
 * page.tsx` + `_live-melding.tsx` — samme `sendLiveMelding`-kontrakt og
 * plan-fremdrift-proxy (andel drills, ingen per-rep-logging her ennå).
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Kort, Knapp, StatusPill, Icon, T, type StatusTone } from "@/components/v2";
import { MicButton } from "@/components/shared/mic-button";
import { sendLiveMelding } from "@/app/admin/(legacy)/live/[sessionId]/active/actions";

export interface CoachLiveActiveV2Data {
  sessionId: string;
  spiller: { id: string; name: string; hcp: number | null } | null;
  erAktiv: boolean;
  statusLabel: string;
  statusTone: StatusTone;
  startTid: string;
  varighetMin: number;
  practiceLabel: string;
  miljo: string;
  aktivDrill: { name: string; notes: string | null } | null;
  antallDrills: number;
  tidIgjenMin: number;
  planFremdriftPct: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function FremdriftRing({ pct }: { pct: number }) {
  const r = 50, o = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" width={96} height={96}>
      <circle cx="60" cy="60" r={r} fill="none" stroke={T.border} strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={T.lime} strokeWidth="10" strokeLinecap="round" strokeDasharray={o} strokeDashoffset={Math.round(o * (1 - pct / 100))} transform="rotate(-90 60 60)" />
      <text x="60" y="55" textAnchor="middle" fontFamily={T.mono} fontSize="9" fill={T.mut}>FULLFØRT</text>
      <text x="60" y="76" textAnchor="middle" fontFamily={T.mono} fontSize="22" fontWeight={700} fill={T.fg}>{pct}%</text>
    </svg>
  );
}

function LiveMeldingV2({ sessionId }: { sessionId: string }) {
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [pending, startTransition] = useTransition();

  const send = () => {
    const trimmet = tekst.trim();
    if (!trimmet) { setFeil("Skriv en melding først"); return; }
    setFeil(null);
    setSendt(false);
    startTransition(async () => {
      const res = await sendLiveMelding(sessionId, trimmet);
      if (!res.ok) setFeil(res.error); else { setTekst(""); setSendt(true); }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
          <input
            value={tekst}
            onChange={(e) => { setTekst(e.target.value); setSendt(false); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !pending) { e.preventDefault(); send(); } }}
            disabled={pending}
            placeholder="Skriv en rask melding …"
            style={{ width: "100%", boxSizing: "border-box", appearance: "none", background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11, padding: "10px 44px 10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none" }}
          />
          <span style={{ position: "absolute", right: 6 }}>
            <MicButton variant="suffix" onResult={(t) => setTekst((prev) => (prev ? `${prev} ${t}` : t))} disabled={pending} />
          </span>
        </div>
        <Knapp icon="send" onClick={send} disabled={pending}>{pending ? "Sender…" : "Send"}</Knapp>
      </div>
      {feil && <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down }}>{feil}</span>}
      {sendt && !pending && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 11.5, color: T.up }}><Icon name="check" size={13} /> Sendt til spiller</span>}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg, padding: 10 }}>
      <div style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: T.fg }}>{value}</div>
    </div>
  );
}

export function CoachLiveActiveV2({ sessionId, spiller, erAktiv, statusLabel, statusTone, startTid, varighetMin, practiceLabel, miljo, aktivDrill, antallDrills, tidIgjenMin, planFremdriftPct }: CoachLiveActiveV2Data) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.border}`, paddingBottom: 14 }}>
        <Link href={`/admin/live/${sessionId}/brief`} style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Icon name="arrow-left" size={13} /> Brief
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {erAktiv && <span style={{ width: 9, height: 9, borderRadius: 9999, background: T.up, flex: "none" }} />}
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg, lineHeight: 1.1 }}>Live-økt · Coach</div>
            {erAktiv && <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.up }}>Pågår · {startTid} · {varighetMin} min</div>}
          </div>
        </div>

        {spiller && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 14, border: `1px solid ${T.border}`, background: T.panel, padding: "8px 12px" }}>
            <span style={{ width: 28, height: 28, borderRadius: 9999, background: T.lime, color: T.onLime, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 10, fontWeight: 700, flex: "none" }}>{initials(spiller.name)}</span>
            <div>
              <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.1 }}>{spiller.name}</div>
              {spiller.hcp !== null && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>HCP {spiller.hcp.toFixed(1).replace(".", ",")} · {practiceLabel}</div>}
            </div>
          </div>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
          <Link href={`/admin/live/${sessionId}/summary`} style={{ textDecoration: "none" }}>
            <Knapp ghost>Avslutt</Knapp>
          </Link>
        </div>
      </div>

      <Kort eyebrow="Aktiv drill">
        {aktivDrill ? (
          <>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg }}>{aktivDrill.name}</div>
            {aktivDrill.notes && <div style={{ marginTop: 4, fontFamily: T.mono, fontSize: 11, color: T.mut }}>{aktivDrill.notes}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10, marginTop: 14 }}>
              <Kpi label="Drills" value={String(antallDrills)} />
              <Kpi label="Økttype" value={practiceLabel.slice(0, 6)} />
              <Kpi label="Tid igjen" value={`${Math.max(0, tidIgjenMin)} min`} />
              <Kpi label="Status" value={statusLabel} />
            </div>
          </>
        ) : (
          <div style={{ padding: "18px 0", fontFamily: T.mono, fontSize: 12, color: T.mut }}>Ingen drills registrert for denne økten ennå.</div>
        )}
      </Kort>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Kort eyebrow="Plan-fremdrift">
          <div style={{ display: "flex", justifyContent: "center" }}><FremdriftRing pct={planFremdriftPct} /></div>
        </Kort>
        <Kort eyebrow="Status">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Økt-status</span>
              <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Miljø</span>
              <StatusPill tone="info">{miljo}</StatusPill>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Autosave</span>
              <StatusPill tone="lime">På</StatusPill>
            </div>
          </div>
        </Kort>
      </div>

      <Kort eyebrow="Send melding til spiller">
        <LiveMeldingV2 sessionId={sessionId} />
      </Kort>

      <Link href={`/admin/live/${sessionId}/summary`} style={{ textDecoration: "none" }}>
        <Knapp icon="check-circle" full ghost>Avslutt og se sammendrag</Knapp>
      </Link>
    </div>
  );
}
