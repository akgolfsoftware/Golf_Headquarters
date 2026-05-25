/**
 * /admin/stats/overview — admin dashboard (design 29)
 *
 * Krever ADMIN.
 * Hardkodet placeholder-data — kobles til Plausible + DB-helse i fremtidig sprint.
 */

import "../../../(marketing)/stats/stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Reveal } from "@/components/stats/reveal";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { CountUp } from "@/components/stats/count-up";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats overview | Admin",
  description: "Admin-dashboard for AK Golf Stats.",
  robots: { index: false },
};

// ---------------------------------------------------------------------------
// Stub-data
// ---------------------------------------------------------------------------

const ADMIN_DATA = {
  besok30d: 4287,
  besokEndring: 12,
  signups: 143,
  signupsEndring: 8,
  playerHQConv: 38,
  playerHQConvPct: 26.6,
  playerHQConvEndring: 4,
  revenue: "11 400",
  revenueEndring: 15,
  topSider: [
    { url: "/stats", besok: 1204, snittTid: "2:14", konv: 28 },
    { url: "/stats/spillere", besok: 847, snittTid: "3:42", konv: 19 },
    { url: "/stats/sg-sammenlign", besok: 612, snittTid: "4:01", konv: 34 },
    { url: "/stats/verktoy/sg-estimator", besok: 445, snittTid: "1:52", konv: 22 },
    { url: "/stats/blogg", besok: 378, snittTid: "2:33", konv: 12 },
  ],
  trafikk: { google: 54, direkte: 28, sosial: 11, referer: 7 },
  sync: [
    { navn: "PGA Tour DataGolf-sync", status: "ok", tid: "13:42", detalj: "847 oppdatert" },
    { navn: "Srixon Tour NHF-fetch", status: "ok", tid: "13:35", detalj: "12 nye" },
    { navn: "WAGR-import", status: "warning", tid: "12:00", detalj: "Manuell override" },
    { navn: "Bildeoppdatering Cloudinary", status: "error", tid: "11:30", detalj: "403 Forbidden" },
  ],
  moderering: { turneringer: 4, resultater: 5, profiler: 2, slett: 1 },
  raske: [
    "Kjør manuell sync av PGA-data",
    "Send ukentlig roundup nå",
    "Sjekk DB-helse",
    "Roter CRON_SECRET",
  ],
};

const SYNC_CFG = {
  ok: { bg: "#2EA66B15", col: "#2EA66B", icon: "✓" },
  warning: { bg: "#B5731715", col: "#B57317", icon: "⚠" },
  error: { bg: "#BE3D3D15", col: "#BE3D3D", icon: "✗" },
} as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminStatsOverviewPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const a = ADMIN_DATA;
  const now = new Date();

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
              Overview
            </h1>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
            }}
          >
            SIST OPPDATERT {now.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
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
            <div className="stats-kpi-eyebrow">Besøk 30d</div>
            <div className="stats-kpi-value font-mono" style={{ fontSize: 36 }}>
              {a.besok30d.toLocaleString("nb-NO")}
            </div>
            <div className="stats-kpi-sub">
              <span style={{ color: "var(--s-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                +{a.besokEndring}%
              </span>{" "}
              mot forrige
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Signups</div>
            <div className="stats-kpi-value">
              <CountUp value={a.signups} />
            </div>
            <div className="stats-kpi-sub">
              <span style={{ color: "var(--s-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                +{a.signupsEndring}%
              </span>{" "}
              mot forrige
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">PlayerHQ-conv</div>
            <div className="stats-kpi-value">
              {a.playerHQConv}{" "}
              <span style={{ fontSize: 18, color: "var(--s-muted-fg)" }}>
                ({a.playerHQConvPct}%)
              </span>
            </div>
            <div className="stats-kpi-sub">
              <span style={{ color: "var(--s-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                +{a.playerHQConvEndring}%
              </span>{" "}
              mot forrige
            </div>
          </div>
          <div className="stats-kpi">
            <div className="stats-kpi-eyebrow">Revenue</div>
            <div className="stats-kpi-value font-mono" style={{ fontSize: 32 }}>
              {a.revenue} kr
            </div>
            <div className="stats-kpi-sub">
              <span style={{ color: "var(--s-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                +{a.revenueEndring}%
              </span>{" "}
              mot forrige
            </div>
          </div>
        </div>
      </Reveal>

      {/* Top sider + trafikk-donut */}
      <section style={{ padding: "32px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Reveal>
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                padding: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <StatsEyebrow>Top 5 sider</StatsEyebrow>
                <a
                  href="#"
                  style={{
                    fontSize: 13,
                    color: "var(--s-primary)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Full liste →
                </a>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--s-border)" }}>
                    <th style={{ padding: "8px 0", textAlign: "left", fontWeight: 500, color: "var(--s-muted-fg)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9 }}>
                      Side
                    </th>
                    <th style={{ padding: "8px 0", textAlign: "right", fontWeight: 500, color: "var(--s-muted-fg)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9 }}>
                      Besøk
                    </th>
                    <th style={{ padding: "8px 0", textAlign: "right", fontWeight: 500, color: "var(--s-muted-fg)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9 }}>
                      Snittid
                    </th>
                    <th style={{ padding: "8px 0", textAlign: "right", fontWeight: 500, color: "var(--s-muted-fg)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9 }}>
                      Konv.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {a.topSider.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px dashed var(--s-border)" }}>
                      <td style={{ padding: "10px 0", color: "var(--s-primary)" }}>{s.url}</td>
                      <td style={{ padding: "10px 0", textAlign: "right" }}>{s.besok}</td>
                      <td style={{ padding: "10px 0", textAlign: "right" }}>{s.snittTid}</td>
                      <td
                        style={{
                          padding: "10px 0",
                          textAlign: "right",
                          color: s.konv >= 20 ? "var(--s-primary)" : "inherit",
                          fontWeight: s.konv >= 20 ? 600 : 500,
                        }}
                      >
                        {s.konv}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                padding: 28,
              }}
            >
              <StatsEyebrow>Trafikkilder</StatsEyebrow>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { lbl: "Google search", n: a.trafikk.google, c: "#005840" },
                  { lbl: "Direkte", n: a.trafikk.direkte, c: "#D1F843" },
                  { lbl: "Sosial", n: a.trafikk.sosial, c: "#5E5C57" },
                  { lbl: "Referer", n: a.trafikk.referer, c: "#E5E3DD" },
                ].map((r, i) => (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            background: r.c,
                            borderRadius: 2,
                          }}
                        />
                        {r.lbl}
                      </span>
                      <span className="font-mono" style={{ fontWeight: 500 }}>
                        {r.n}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: "var(--s-secondary)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${r.n}%`, height: "100%", background: r.c, transition: "width .6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sync-status */}
      <section style={{ padding: "0 64px 32px" }}>
        <Reveal>
          <StatsEyebrow>Sync-status</StatsEyebrow>
          <h2
            className="font-display"
            style={{ fontSize: 24, fontWeight: 600, marginTop: 12, marginBottom: 20, letterSpacing: "-0.02em" }}
          >
            Pipeline — siste kjøring.
          </h2>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {a.sync.map((s, i) => {
            const cfg = SYNC_CFG[s.status as keyof typeof SYNC_CFG];
            return (
              <Reveal key={i} delay={i * 40}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr auto auto",
                    gap: 16,
                    alignItems: "center",
                    padding: 14,
                    background: cfg.bg,
                    border: `1px solid var(--s-border)`,
                    borderRadius: "var(--s-r-md)",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: `${cfg.col}15`,
                      color: cfg.col,
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {cfg.icon}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{s.navn}</span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 12, color: "var(--s-muted-fg)" }}
                  >
                    {s.tid}
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 12, color: cfg.col, fontWeight: 500 }}
                  >
                    {s.detalj}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Modereringskø */}
      <section
        style={{
          padding: "0 64px 32px",
          borderTop: "1px solid var(--s-border)",
          paddingTop: 32,
        }}
      >
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <StatsEyebrow>Modereringskø</StatsEyebrow>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600, marginTop: 8, letterSpacing: "-0.02em" }}>
                {a.moderering.turneringer + a.moderering.resultater + a.moderering.profiler + a.moderering.slett} ventende handlinger.
              </h2>
            </div>
            <Link href="/admin/stats/moderering">
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "var(--s-primary)",
                  color: "var(--s-primary-fg)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Til moderering
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </Link>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { lbl: "Turneringer", n: a.moderering.turneringer, haster: false },
            { lbl: "Resultater", n: a.moderering.resultater, haster: false },
            { lbl: "Profiler", n: a.moderering.profiler, haster: false },
            { lbl: "Slett (haster)", n: a.moderering.slett, haster: true },
          ].map((m, i) => (
            <Reveal key={i} delay={i * 40}>
              <div
                style={{
                  background: m.haster ? "rgba(190,61,61,0.06)" : "var(--s-secondary)",
                  border: m.haster ? "1px solid #BE3D3D" : "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-md)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: m.haster ? "#BE3D3D" : "var(--s-muted-fg)",
                    marginBottom: 8,
                  }}
                >
                  {m.lbl.toUpperCase()}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 48, color: m.haster ? "#BE3D3D" : "var(--s-fg)", fontWeight: 500 }}
                >
                  {m.n}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Raske handlinger */}
      <section
        style={{
          padding: "0 64px 64px",
          borderTop: "1px solid var(--s-border)",
          paddingTop: 32,
        }}
      >
        <Reveal>
          <StatsEyebrow>Raske handlinger</StatsEyebrow>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 600, marginTop: 8, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Cron + admin-snarveier.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {a.raske.map((tekst, i) => (
            <Reveal key={i} delay={i * 40}>
              <button
                style={{
                  background: "var(--s-card)",
                  border: "1px solid var(--s-border)",
                  borderRadius: "var(--s-r-md)",
                  padding: 20,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  lineHeight: 1.4,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  transition: "border-color .2s",
                }}
              >
                <Play
                  size={16}
                  style={{ color: "var(--s-primary)" }}
                  strokeWidth={1.75}
                />
                <div style={{ fontWeight: 500 }}>{tekst}</div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
