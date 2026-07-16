"use client";

/**
 * /admin/stats/moderering — coach modereringskø, v2-port 16. juli 2026.
 * Erstatter Tailwind/shadcn-tokens med v2 T-tokens. Ingen modererings- eller
 * GDPR-slett-kø finnes ennå i datamodellen (se page.tsx) — skjermen viser
 * derfor bevisst tomme tilstander og de samme ikke-koblede knappene som før
 * (Godkjenn/Avvis/Bekreft sletting mangler fortsatt reell handling — det er
 * IKKE en regresjon fra denne porten, det var slik også før).
 */

import { useState } from "react";
import { Caps, Kort, StatusPill, TomTilstand, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { CountUp } from "@/components/stats/count-up";

type Turnering = {
  id: string;
  navn: string;
  dato: string;
  innlegger: string;
  flagg: number;
  dubletter: string[];
};

type Slett = {
  spiller: string;
  forespurAv: string;
  mottatt: string;
  grunn: string;
  rader: number;
};

type Stats = {
  turneringer: number;
  resultater: number;
  profilEndringer: number;
  slett: number;
  godkjentDenneUka: number;
  avvistDenneUka: number;
  snittTid: string;
};

const TABS = [
  { id: "turneringer", label: "Turneringer", icon: "trophy" },
  { id: "resultater", label: "Resultater", icon: "list" },
  { id: "profil", label: "Profil-endringer", icon: "user" },
  { id: "slett", label: "Slett-forespørsler", icon: "trash-2" },
  { id: "historikk", label: "Historikk", icon: "history" },
] as const;

type Tab = (typeof TABS)[number]["id"];

function Kpi({ label, value, tone }: { label: string; value: number; tone: "lime" | "up" | "down" }) {
  const c = tone === "up" ? T.up : tone === "down" ? T.down : T.fg;
  return (
    <Kort>
      <Caps>{label}</Caps>
      <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 30, fontWeight: 700, lineHeight: 1, color: c, fontVariantNumeric: "tabular-nums" }}>
        <CountUp value={value} />
      </div>
    </Kort>
  );
}

function KpiText({ label, value }: { label: string; value: string }) {
  return (
    <Kort>
      <Caps>{label}</Caps>
      <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 26, fontWeight: 700, lineHeight: 1, color: T.fg }}>{value}</div>
    </Kort>
  );
}

function EmptyTab({ kind }: { kind: Tab }) {
  const labels: Record<Tab, string> = {
    turneringer: "turneringer",
    resultater: "resultater",
    profil: "profil-endringer",
    slett: "slett-forespørsler",
    historikk: "historikk",
  };
  return (
    <Kort>
      <TomTilstand icon="check" title={`Ingen ventende ${labels[kind]}`} sub="Køen er tom akkurat nå." />
    </Kort>
  );
}

export function ModeringClientV2({ turneringer, slett, stats }: { turneringer: Turnering[]; slett: Slett | null; stats: Stats }) {
  const [aktivTab, setAktivTab] = useState<Tab>("turneringer");
  const [valgte, setValgte] = useState<string[]>([]);
  const totaltVentende = stats.turneringer + stats.resultater + stats.profilEndringer + stats.slett;

  const toggleValgt = (id: string) => setValgte((v) => (v.includes(id) ? v.filter((s) => s !== id) : [...v, id]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, paddingBottom: 96 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Caps>Admin · Stats</Caps>
          <h1 style={{ margin: "8px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.02em", color: T.fg }}>Moderering</h1>
          <p style={{ marginTop: 6, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>
            Godkjenn innsendte turneringer, resultater og profil-endringer · håndter GDPR-slett
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.mono, fontSize: 48, fontWeight: 700, lineHeight: 1, color: T.lime, fontVariantNumeric: "tabular-nums" }}>
            <CountUp value={totaltVentende} />
          </div>
          <div style={{ marginTop: 4, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: T.mut }}>Ventende</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <Kpi label="Ventende" value={totaltVentende} tone="lime" />
        <Kpi label="Godkjent denne uka" value={stats.godkjentDenneUka} tone="up" />
        <Kpi label="Avvist denne uka" value={stats.avvistDenneUka} tone="down" />
        <KpiText label="Snitt-tid" value={stats.snittTid} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto", borderBottom: `1px solid ${T.border}` }}>
        {TABS.map((t) => {
          const count =
            t.id === "turneringer" ? stats.turneringer : t.id === "resultater" ? stats.resultater : t.id === "profil" ? stats.profilEndringer : t.id === "slett" ? stats.slett : undefined;
          const isActive = aktivTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAktivTab(t.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
                borderBottom: `2px solid ${isActive ? T.lime : "transparent"}`, marginBottom: -1,
                padding: "14px 14px", background: "none", border: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: isActive ? T.lime : "transparent",
                fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: isActive ? T.lime : T.mut, cursor: "pointer",
              }}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
              {count !== undefined && count > 0 && (
                <span style={{ borderRadius: 9999, padding: "1px 6px", fontFamily: T.mono, fontSize: 10, fontWeight: 800, background: t.id === "slett" ? T.down : T.lime, color: t.id === "slett" ? "#fff" : T.onLime }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        {aktivTab === "turneringer" &&
          (turneringer.length === 0 ? (
            <EmptyTab kind="turneringer" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {turneringer.map((t) => (
                <Kort key={t.id}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <input type="checkbox" checked={valgte.includes(t.id)} onChange={() => toggleValgt(t.id)} style={{ marginTop: 4, width: 16, height: 16, flex: "none", cursor: "pointer" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{t.navn}</span>
                        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: T.mut }}>{t.dato.toUpperCase()}</span>
                        {t.flagg > 0 && <StatusPill tone={t.flagg >= 3 ? "down" : "warn"}>{t.flagg} flagg</StatusPill>}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, color: T.mut }}>
                        Innlagt av <strong style={{ fontWeight: 600, color: T.fg }}>{t.innlegger}</strong>
                        {t.dubletter.length > 0 && <> · Mulige dubletter: {t.dubletter.join(", ")}</>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flex: "none" }}>
                      <button type="button" title="Godkjenn" style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 10, background: T.lime, color: T.onLime, border: "none", cursor: "pointer" }}>
                        <Icon name="check" size={16} />
                      </button>
                      <button type="button" title="Avvis" style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, color: T.down, border: "none", cursor: "pointer" }}>
                        <Icon name="x" size={16} />
                      </button>
                    </div>
                  </div>
                </Kort>
              ))}
            </div>
          ))}

        {aktivTab === "slett" && !slett && <EmptyTab kind="slett" />}

        {aktivTab === "slett" && slett && (
          <Kort style={{ maxWidth: 640, borderColor: `color-mix(in srgb, ${T.down} 35%, ${T.border})`, background: `color-mix(in srgb, ${T.down} 5%, ${T.panel})` }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: T.down }}>
              <Icon name="shield-check" size={14} />
              GDPR · Slett-forespørsel
            </div>
            <h2 style={{ margin: "10px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: T.fg }}>{slett.spiller}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 20px", marginTop: 18, fontSize: 13 }}>
              <span style={{ color: T.mut }}>Forespurt av:</span>
              <span style={{ color: T.fg }}>{slett.forespurAv}</span>
              <span style={{ color: T.mut }}>Mottatt:</span>
              <span style={{ color: T.fg }}>{slett.mottatt}</span>
              <span style={{ color: T.mut }}>Grunn:</span>
              <span style={{ color: T.fg }}>«{slett.grunn}»</span>
            </div>
            <div style={{ marginTop: 20, borderRadius: 12, background: `color-mix(in srgb, ${T.down} 8%, transparent)`, padding: 14 }}>
              <div style={{ marginBottom: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: T.down }}>Konsekvens</div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, lineHeight: 1.55, color: T.fg, margin: 0, paddingLeft: 0, listStyle: "none" }}>
                <li>· Sletter PublicPlayer + {slett.rader} PublicPlayerEntry-rader</li>
                <li>· Markerer {slett.rader} turneringer som «anonym deltaker»</li>
                <li>· Sender bekreftelse til {slett.forespurAv}</li>
              </ul>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
              <button type="button" style={{ borderRadius: 9999, background: T.down, padding: "12px 22px", fontSize: 13, fontWeight: 700, color: "#fff", border: "none", cursor: "pointer" }}>
                Bekreft sletting
              </button>
              <button type="button" style={{ borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, padding: "12px 22px", fontSize: 13, fontWeight: 700, color: T.fg, cursor: "pointer" }}>
                Avvis med begrunnelse
              </button>
            </div>
          </Kort>
        )}

        {aktivTab !== "turneringer" && aktivTab !== "slett" && <EmptyTab kind={aktivTab} />}
      </div>

      {valgte.length > 0 && (
        <div style={{ position: "sticky", bottom: 16, zIndex: 20, display: "flex", alignItems: "center", gap: 16, borderRadius: 9999, background: T.lime, padding: "12px 22px", boxShadow: "0 12px 32px rgba(0,0,0,0.35)" }}>
          <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.onLime }}>{valgte.length} valgt</span>
          <button type="button" style={{ borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.onLime} 40%, transparent)`, padding: "6px 16px", fontFamily: T.mono, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.onLime, background: "none", cursor: "pointer" }}>
            Godkjenn alle
          </button>
          <button type="button" style={{ borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.onLime} 40%, transparent)`, padding: "6px 16px", fontFamily: T.mono, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.onLime, background: "none", cursor: "pointer" }}>
            Avvis alle
          </button>
          <button
            type="button"
            onClick={() => setValgte([])}
            aria-label="Lukk utvalg"
            style={{ marginLeft: "auto", display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 9999, color: T.onLime, background: "none", border: "none", cursor: "pointer" }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
