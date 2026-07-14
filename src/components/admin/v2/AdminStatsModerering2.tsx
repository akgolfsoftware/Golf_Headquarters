"use client";

/**
 * AgencyOS v2 — Stats-moderering (`/admin/stats/moderering`, AgencyOS
 * Bølge 3.18, 2026-07-14). Port fra `(legacy)/stats/moderering/page.tsx` +
 * `client.tsx` — INGEN modererings-/GDPR-slett-kø finnes ennå i
 * datamodellen (page.tsx sender alltid tomme lister/0-tall og ingen
 * server actions), så dette er fortsatt et rent UI-skall: fane-bytte er
 * ekte klient-state, men Godkjenn/Avvis/Bekreft-slett-knappene har ingen
 * handling (samme som legacy — bevisst ikke lagt til ny funksjonalitet i
 * en design-port).
 */

import { useState } from "react";
import { Caps, Tittel, Kort, Knapp, KpiFlis, Icon, T } from "@/components/v2";

type Turnering = { id: string; navn: string; dato: string; innlegger: string; flagg: number; dubletter: string[] };
type Slett = { spiller: string; forespurAv: string; mottatt: string; grunn: string; rader: number };
type Stats = { turneringer: number; resultater: number; profilEndringer: number; slett: number; godkjentDenneUka: number; avvistDenneUka: number; snittTid: string };

const TABS = [
  { id: "turneringer", label: "Turneringer", icon: "trophy" },
  { id: "resultater", label: "Resultater", icon: "list" },
  { id: "profil", label: "Profil-endringer", icon: "user" },
  { id: "slett", label: "Slett-forespørsler", icon: "trash" },
  { id: "historikk", label: "Historikk", icon: "history" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const EMPTY_LABELS: Record<Tab, string> = {
  turneringer: "turneringer",
  resultater: "resultater",
  profil: "profil-endringer",
  slett: "slett-forespørsler",
  historikk: "historikk",
};

function TomFaneV2({ kind }: { kind: Tab }) {
  return (
    <Kort>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "40px 16px", textAlign: "center" }}>
        <span style={{ width: 48, height: 48, borderRadius: 14, background: T.panel3, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.mut }}><Icon name="check" size={22} /></span>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen ventende {EMPTY_LABELS[kind]}</div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Køen er tom akkurat nå.</p>
      </div>
    </Kort>
  );
}

export function AdminStatsModereringV2({ turneringer, slett, stats }: { turneringer: Turnering[]; slett: Slett | null; stats: Stats }) {
  const [aktivTab, setAktivTab] = useState<Tab>("turneringer");
  const [valgte, setValgte] = useState<string[]>([]);
  const totaltVentende = stats.turneringer + stats.resultater + stats.profilEndringer + stats.slett;

  const toggleValgt = (id: string) => setValgte((v) => (v.includes(id) ? v.filter((s) => s !== id) : [...v, id]));

  const antallForTab = (id: Tab): number | undefined => {
    if (id === "turneringer") return stats.turneringer;
    if (id === "resultater") return stats.resultater;
    if (id === "profil") return stats.profilEndringer;
    if (id === "slett") return stats.slett;
    return undefined;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, paddingBottom: 80 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Caps size={9}>Admin · Stats</Caps>
          <Tittel>Moderering</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>
            Godkjenn innsendte turneringer, resultater og profil-endringer · håndter GDPR-slett
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.mono, fontSize: 48, fontWeight: 700, lineHeight: 1, color: T.lime }}>{totaltVentende}</div>
          <Caps size={9}>Ventende</Caps>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: T.gap }}>
        <KpiFlis label="Ventende" value={totaltVentende} instant />
        <KpiFlis label="Godkjent denne uka" value={stats.godkjentDenneUka} instant />
        <KpiFlis label="Avvist denne uka" value={stats.avvistDenneUka} instant />
        <KpiFlis label="Snitt-tid" value={stats.snittTid} instant />
      </div>

      <div style={{ display: "flex", gap: 4, overflowX: "auto", borderBottom: `1px solid ${T.border}` }}>
        {TABS.map((t) => {
          const count = antallForTab(t.id);
          const aktiv = aktivTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAktivTab(t.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", border: "none", background: "none", cursor: "pointer",
                borderBottom: aktiv ? `2px solid ${T.lime}` : "2px solid transparent", marginBottom: -1,
                padding: "12px 14px", fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                color: aktiv ? T.lime : T.mut,
              }}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
              {count !== undefined && count > 0 && (
                <span style={{ borderRadius: 9999, padding: "1px 6px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, background: t.id === "slett" ? T.down : T.lime, color: t.id === "slett" ? "#fff" : T.onLime }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        {aktivTab === "turneringer" && (
          turneringer.length === 0 ? <TomFaneV2 kind="turneringer" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {turneringer.map((t) => (
                <Kort key={t.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                  <input type="checkbox" checked={valgte.includes(t.id)} onChange={() => toggleValgt(t.id)} style={{ marginTop: 4, width: 16, height: 16, flex: "none", cursor: "pointer", accentColor: T.lime }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15.5, color: T.fg }}>{t.navn}</div>
                      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{t.dato.toUpperCase()}</span>
                      {t.flagg > 0 && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 6, padding: "2px 8px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: t.flagg >= 3 ? `color-mix(in srgb, ${T.down} 12%, transparent)` : `color-mix(in srgb, ${T.warn} 15%, transparent)`, color: t.flagg >= 3 ? T.down : T.warn }}>
                          <Icon name="alert-triangle" size={11} />{t.flagg} FLAGG
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
                      Innlagt av <strong style={{ color: T.fg }}>{t.innlegger}</strong>
                      {t.dubletter.length > 0 && <> · Mulige dubletter: {t.dubletter.join(", ")}</>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flex: "none", gap: 6 }}>
                    <button type="button" title="Godkjenn" style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", background: T.lime, color: T.onLime }}><Icon name="check" size={16} /></button>
                    <button type="button" title="Avvis" style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", background: `color-mix(in srgb, ${T.down} 12%, transparent)`, color: T.down }}><Icon name="x" size={16} /></button>
                  </div>
                </Kort>
              ))}
            </div>
          )
        )}

        {aktivTab === "slett" && !slett && <TomFaneV2 kind="slett" />}

        {aktivTab === "slett" && slett && (
          <Kort style={{ maxWidth: 620, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 5%, transparent)` }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.down }}>
              <Icon name="shield-check" size={14} />GDPR · Slett-forespørsel
            </div>
            <div style={{ marginTop: 8, fontFamily: T.disp, fontWeight: 700, fontSize: 24, color: T.fg }}>{slett.spiller}</div>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 20px", fontFamily: T.ui, fontSize: 13 }}>
              <span style={{ color: T.mut }}>Forespurt av:</span><span style={{ color: T.fg }}>{slett.forespurAv}</span>
              <span style={{ color: T.mut }}>Mottatt:</span><span style={{ color: T.fg }}>{slett.mottatt}</span>
              <span style={{ color: T.mut }}>Grunn:</span><span style={{ color: T.fg }}>«{slett.grunn}»</span>
            </div>
            <div style={{ marginTop: 16, borderRadius: 10, background: `color-mix(in srgb, ${T.down} 8%, transparent)`, padding: 14 }}>
              <Caps size={9}>Konsekvens</Caps>
              <ul style={{ marginTop: 8, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 5, fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>
                <li>Sletter PublicPlayer + {slett.rader} PublicPlayerEntry-rader</li>
                <li>Markerer {slett.rader} turneringer som «anonym deltaker»</li>
                <li>Sender bekreftelse til {slett.forespurAv}</li>
              </ul>
            </div>
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Knapp>Bekreft sletting</Knapp>
              <Knapp ghost>Avvis med begrunnelse</Knapp>
            </div>
          </Kort>
        )}

        {aktivTab !== "turneringer" && aktivTab !== "slett" && <TomFaneV2 kind={aktivTab} />}
      </div>

      {valgte.length > 0 && (
        <div style={{ position: "sticky", bottom: 16, zIndex: 20, display: "flex", alignItems: "center", gap: 14, borderRadius: 9999, background: T.lime, padding: "10px 20px", boxShadow: "0 12px 32px rgba(0,0,0,0.3)" }}>
          <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.onLime }}>{valgte.length} VALGT</span>
          <button type="button" style={{ borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.onLime} 40%, transparent)`, background: "transparent", padding: "6px 14px", fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.onLime, cursor: "pointer" }}>Godkjenn alle</button>
          <button type="button" style={{ borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.onLime} 40%, transparent)`, background: "transparent", padding: "6px 14px", fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.onLime, cursor: "pointer" }}>Avvis alle</button>
          <button type="button" onClick={() => setValgte([])} aria-label="Lukk utvalg" style={{ marginLeft: "auto", display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 9999, border: "none", background: "transparent", color: T.onLime, cursor: "pointer" }}>
            <Icon name="x" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
