"use client";

import { useState } from "react";
import { Check, X, AlertTriangle, Sparkles } from "lucide-react";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
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
  { id: "turneringer", label: "Turneringer" },
  { id: "resultater", label: "Resultater" },
  { id: "profil", label: "Profil-endringer" },
  { id: "slett", label: "Slett-forespørsler" },
  { id: "historikk", label: "Historikk" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function ModeringClient({
  turneringer,
  slett,
  stats,
}: {
  turneringer: Turnering[];
  slett: Slett;
  stats: Stats;
}) {
  const [aktifTab, setAktifTab] = useState<Tab>("turneringer");
  const [valgte, setValgte] = useState<string[]>([]);
  const totaltVentende =
    stats.turneringer + stats.resultater + stats.profilEndringer + stats.slett;

  const toggleValgt = (id: string) =>
    setValgte((v) => (v.includes(id) ? v.filter((s) => s !== id) : [...v, id]));

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section
        style={{
          padding: "32px 64px 24px",
          background: "var(--s-secondary)",
          borderBottom: "1px solid var(--s-border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <StatsEyebrow>Admin · Stats</StatsEyebrow>
            <h1
              className="font-display"
              style={{ fontSize: 36, fontWeight: 600, marginTop: 8, letterSpacing: "-0.025em" }}
            >
              Moderering
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              className="font-mono"
              style={{ fontSize: 56, color: "var(--s-primary)", lineHeight: 1, fontWeight: 500 }}
            >
              {totaltVentende}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--s-muted-fg)",
              }}
            >
              Ventende
            </div>
          </div>
        </div>
      </section>

      {/* KPI-strip */}
      <Reveal>
        <div
          className="stats-kpi-strip"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", borderRadius: 0 }}
        >
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Ventende</div>
            <div className="stats-kpi-value">
              <CountUp value={totaltVentende} />
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Godkjent denne uka</div>
            <div className="stats-kpi-value">
              <CountUp value={stats.godkjentDenneUka} />
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Avvist denne uka</div>
            <div className="stats-kpi-value">
              <CountUp value={stats.avvistDenneUka} />
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Snitt-tid</div>
            <div
              className="stats-kpi-value font-mono"
              style={{ fontSize: 28, marginTop: 8 }}
            >
              {stats.snittTid}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Tab-bar */}
      <div
        style={{
          borderBottom: "1px solid var(--s-border)",
          padding: "0 64px",
          display: "flex",
          gap: 0,
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => {
          const count =
            t.id === "turneringer"
              ? stats.turneringer
              : t.id === "resultater"
                ? stats.resultater
                : t.id === "profil"
                  ? stats.profilEndringer
                  : t.id === "slett"
                    ? stats.slett
                    : undefined;

          return (
            <button
              key={t.id}
              onClick={() => setAktifTab(t.id)}
              style={{
                padding: "16px 20px",
                background: "transparent",
                border: "none",
                borderBottom:
                  aktifTab === t.id ? "2px solid var(--s-primary)" : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: aktifTab === t.id ? "var(--s-primary)" : "var(--s-muted-fg)",
                fontWeight: aktifTab === t.id ? 600 : 400,
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
              {count !== undefined && count > 0 && (
                <span
                  style={{
                    background: t.id === "slett" ? "#BE3D3D" : "var(--s-primary)",
                    color: t.id === "slett" ? "#FFF" : "var(--s-primary-fg)",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: 10,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab-innhold */}
      <div style={{ padding: "32px 64px" }}>
        {aktifTab === "turneringer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {turneringer.map((t) => (
              <div
                key={t.id}
                style={{
                  background: "var(--s-card)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-md)",
                  padding: 20,
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <input
                  type="checkbox"
                  checked={valgte.includes(t.id)}
                  onChange={() => toggleValgt(t.id)}
                  style={{ marginTop: 3, cursor: "pointer", accentColor: "var(--s-primary)" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div
                      className="font-display"
                      style={{ fontSize: 17, fontWeight: 600 }}
                    >
                      {t.navn}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--s-muted-fg)",
                      }}
                    >
                      {t.dato.toUpperCase()}
                    </span>
                    {t.flagg > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          color: t.flagg >= 3 ? "#BE3D3D" : "#B57317",
                          fontWeight: 600,
                          background:
                            t.flagg >= 3 ? "rgba(190,61,61,0.1)" : "rgba(181,115,23,0.1)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <AlertTriangle size={11} strokeWidth={2} />
                        {t.flagg} FLAGG
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--s-muted-fg)", fontSize: 13, marginTop: 6 }}>
                    Innlagt av <strong>{t.innlegger}</strong>
                    {t.dubletter.length > 0 && (
                      <> · Mulige dubletter: {t.dubletter.join(", ")}</>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    style={{
                      background: "var(--s-accent)",
                      border: "none",
                      borderRadius: 6,
                      width: 36,
                      height: 36,
                      color: "var(--s-accent-fg)",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                    title="Godkjenn"
                  >
                    <Check size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    style={{
                      background: "rgba(190,61,61,0.1)",
                      border: "none",
                      borderRadius: 6,
                      width: 36,
                      height: 36,
                      color: "#BE3D3D",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                    title="Avvis"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {aktifTab === "slett" && (
          <div
            style={{
              background: "rgba(190,61,61,0.05)",
              border: "1px solid #BE3D3D",
              borderRadius: "var(--s-r-lg)",
              padding: 32,
              maxWidth: 640,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#BE3D3D",
                marginBottom: 12,
              }}
            >
              GDPR · Slett-forespørsel
            </div>
            <h2
              className="font-display"
              style={{ fontSize: 28, fontWeight: 600 }}
            >
              {slett.spiller}
            </h2>
            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "8px 24px",
                fontSize: 14,
              }}
            >
              <span style={{ color: "var(--s-muted-fg)" }}>Forespurt av:</span>
              <span>{slett.forespurAv}</span>
              <span style={{ color: "var(--s-muted-fg)" }}>Mottatt:</span>
              <span>{slett.mottatt}</span>
              <span style={{ color: "var(--s-muted-fg)" }}>Grunn:</span>
              <span>«{slett.grunn}»</span>
            </div>

            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "rgba(190,61,61,0.08)",
                borderRadius: "var(--s-r-md)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#BE3D3D",
                  marginBottom: 10,
                }}
              >
                Konsekvens
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <li>· Sletter PublicPlayer + {slett.rader} PublicPlayerEntry-rader</li>
                <li>· Markerer {slett.rader} turneringer som «anonym deltaker»</li>
                <li>· Sender bekreftelse til {slett.forespurAv}</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                style={{
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "#BE3D3D",
                  color: "#FFF",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Bekreft sletting
              </button>
              <button
                style={{
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "var(--s-secondary)",
                  color: "var(--s-fg)",
                  border: "1px solid var(--s-border)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Avvis med begrunnelse
              </button>
            </div>
          </div>
        )}

        {aktifTab !== "turneringer" && aktifTab !== "slett" && (
          <div
            style={{
              padding: 64,
              textAlign: "center",
              color: "var(--s-muted-fg)",
            }}
          >
            <Sparkles
              size={32}
              style={{ opacity: 0.4, margin: "0 auto 16px", display: "block" }}
              strokeWidth={1.5}
            />
            <div style={{ fontSize: 14 }}>Ingen ventende i denne kategorien akkurat nå.</div>
          </div>
        )}
      </div>

      {/* Sticky batch-bar */}
      {valgte.length > 0 && (
        <div
          style={{
            position: "sticky",
            bottom: 16,
            left: 64,
            right: 64,
            background: "var(--s-primary)",
            color: "var(--s-bg)",
            borderRadius: 999,
            padding: "12px 24px",
            margin: "0 64px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 12px 32px rgba(0,88,64,0.3)",
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: 13 }}
          >
            {valgte.length} VALGT
          </span>
          <button
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: "transparent",
              color: "var(--s-primary-fg)",
              border: "1px solid var(--s-primary-fg)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
            }}
          >
            Godkjenn alle
          </button>
          <button
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: "transparent",
              color: "var(--s-primary-fg)",
              border: "1px solid var(--s-primary-fg)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
            }}
          >
            Avvis alle
          </button>
          <button
            onClick={() => setValgte([])}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "var(--s-primary-fg)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
