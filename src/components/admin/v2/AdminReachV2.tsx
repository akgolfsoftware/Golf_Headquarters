"use client";

/**
 * AgencyOS v2 — Reach & engasjement (`/admin/reach`, AgencyOS Bølge 3.16,
 * 2026-07-14). Port fra `(legacy)/reach/page.tsx` + `reach-client.tsx` —
 * samme `ReachData`-kontrakt og aggregerings-logikk (uendret i page.tsx),
 * samme egendefinerte SVG-linjegraf/bar-chart (kun farger byttet til
 * v2-tokens, tegne-matematikken er uendret).
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { Caps, Tittel, Kort, StatusPill, Icon, T, AvatarFoto } from "@/components/v2";

export type ReachDataV2 = {
  totalPlayers: number;
  active7d: number;
  active30d: number;
  avgCompliance: number;
  messageReadRate: number;
  daily: { date: string; active: number }[];
  players: {
    id: string;
    name: string;
    avatarUrl: string | null;
    sessions7d: number;
    compliancePct: number;
    lastSeen: string | null;
    status: "green" | "amber" | "red";
  }[];
  topEngaged: {
    id: string;
    name: string;
    avatarUrl: string | null;
    compliancePct: number;
    readRatePct: number;
    aiCaddieThreads: number;
  }[];
  needsFollowup: {
    id: string;
    name: string;
    avatarUrl: string | null;
    compliancePct: number;
    readRatePct: number;
    lastSeen: string | null;
  }[];
  featureUsage: { label: string; count: number }[];
};

const FILTERS = ["Alle", "Trenger oppfølging", "Topp engasjerte"] as const;
type Filter = (typeof FILTERS)[number];

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

function formatRelative(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return "i dag";
  if (d === 1) return "i går";
  if (d < 7) return `${d}d siden`;
  if (d < 30) return `${Math.floor(d / 7)}u siden`;
  return `${Math.floor(d / 30)}mnd siden`;
}

function complianceFarge(pct: number): string {
  if (pct >= 75) return T.up;
  if (pct >= 50) return T.warn;
  return T.down;
}

function KpiV2({ icon, label, value, sub, progress, tone = "neutral" }: {
  icon: string; label: string; value: string; sub?: string; progress?: number; tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const valueColor = tone === "bad" ? T.down : tone === "good" ? T.lime : T.fg;
  const barColor = tone === "bad" ? T.down : tone === "warn" ? T.warn : T.lime;
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Caps size={9}>{label}</Caps>
        <span style={{ width: 24, height: 24, borderRadius: 8, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.mut }}><Icon name={icon} size={14} /></span>
      </div>
      <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 32, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: valueColor }}>{value}</div>
      {typeof progress === "number" && (
        <div style={{ marginTop: 10, height: 5, borderRadius: 9999, background: T.panel3, overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, progress)}%`, height: "100%", borderRadius: 9999, background: barColor }} />
        </div>
      )}
      {sub && <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{sub}</div>}
    </Kort>
  );
}

function StatusDotV2({ status }: { status: "green" | "amber" | "red" }) {
  const c = status === "green" ? T.up : status === "amber" ? T.warn : T.down;
  const l = status === "green" ? "På sporet" : status === "amber" ? "Følg med" : "Trenger oppfølging";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: c, flex: "none" }} />
      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{l}</span>
    </span>
  );
}

function LineChartV2({ data, totalPlayers }: { data: { date: string; active: number }[]; totalPlayers: number }) {
  const width = 720, height = 200, padX = 40, padY = 24;
  const innerW = width - padX * 2, innerH = height - padY * 2;
  const maxValue = Math.max(totalPlayers || 1, ...data.map((d) => d.active), 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const points = data.map((d, i) => ({ x: padX + i * step, y: padY + innerH - (d.active / maxValue) * innerH, ...d }));
  const pathLine = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const pathArea = points.length > 0
    ? `${pathLine} L${points[points.length - 1].x.toFixed(2)},${(padY + innerH).toFixed(2)} L${points[0].x.toFixed(2)},${(padY + innerH).toFixed(2)} Z`
    : "";
  const yTicks = [0, Math.round(maxValue / 2), maxValue];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ height: 200, width: "100%", minWidth: 560 }} role="img" aria-label="Daglig aktive spillere siste 30 dager">
        <defs>
          <linearGradient id="reach-area-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.lime} stopOpacity="0.22" />
            <stop offset="100%" stopColor={T.lime} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => {
          const y = padY + innerH - (tick / maxValue) * innerH;
          return (
            <g key={tick}>
              <line x1={padX} x2={width - padX} y1={y} y2={y} stroke={T.border} strokeDasharray="2 4" strokeWidth="1" />
              <text x={padX - 8} y={y + 4} textAnchor="end" fontFamily={T.mono} fontSize="10" fill={T.mut}>{tick}</text>
            </g>
          );
        })}
        {pathArea && <path d={pathArea} fill="url(#reach-area-v2)" />}
        {pathLine && <path d={pathLine} fill="none" stroke={T.lime} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p, i) => (i % 5 === 0 || i === points.length - 1) ? (
          <g key={p.date}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={T.panel} stroke={T.lime} strokeWidth="2" />
            <text x={p.x} y={height - 6} textAnchor="middle" fontFamily={T.mono} fontSize="9" fill={T.mut}>{p.date.slice(5)}</text>
          </g>
        ) : null)}
      </svg>
    </div>
  );
}

function FeatureBarChartV2({ data, totalPlayers }: { data: { label: string; count: number }[]; totalPlayers: number }) {
  const max = Math.max(totalPlayers || 1, ...data.map((d) => d.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((feat) => {
        const pct = Math.round((feat.count / max) * 100);
        const adoptionPct = totalPlayers ? Math.round((feat.count / totalPlayers) * 100) : 0;
        return (
          <div key={feat.label} style={{ display: "grid", gridTemplateColumns: "140px 1fr 60px", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg }}>{feat.label}</span>
            <div style={{ position: "relative", height: 24, borderRadius: 6, background: T.panel3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: T.lime }} />
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.onLime, mixBlendMode: "difference" }}>{feat.count} spillere</span>
            </div>
            <span style={{ textAlign: "right", fontFamily: T.mono, fontSize: 12, color: T.mut }}>{adoptionPct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminReachV2({ data }: { data: ReachDataV2 }) {
  const [filter, setFilter] = useState<Filter>("Alle");

  const active7dPct = data.totalPlayers ? Math.round((data.active7d / data.totalPlayers) * 100) : 0;
  const active30dPct = data.totalPlayers ? Math.round((data.active30d / data.totalPlayers) * 100) : 0;

  const filteredPlayers = useMemo(() => {
    if (filter === "Trenger oppfølging") return data.players.filter((p) => p.status === "red" || p.compliancePct < 50);
    if (filter === "Topp engasjerte") return [...data.players].sort((a, b) => b.compliancePct - a.compliancePct).slice(0, 10);
    return data.players;
  }, [filter, data.players]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>Reach &amp; engasjement · Siste 30 dager</Caps>
        <Tittel em="engasjement">Plattform-</Tittel>
        <p style={{ marginTop: 6, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>
          {data.totalPlayers} spillere · hvor mye lander det vi sender, og hvem trenger oppmerksomhet?
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: T.gap }}>
        <KpiV2 icon="users" label="Aktive (7d)" value={String(data.active7d)} sub={`av ${data.totalPlayers} (${active7dPct}%)`} progress={active7dPct} />
        <KpiV2 icon="trending-up" label="Aktive (30d)" value={String(data.active30d)} sub={`av ${data.totalPlayers} (${active30dPct}%)`} progress={active30dPct} />
        <KpiV2 icon="check-circle" label="Snitt-compliance" value={`${data.avgCompliance}%`} sub="Fullført vs planlagt" progress={data.avgCompliance} tone={data.avgCompliance >= 75 ? "good" : data.avgCompliance >= 50 ? "warn" : "bad"} />
        <KpiV2 icon="message-circle" label="Åpningsrate meldinger" value={`${data.messageReadRate}%`} sub="Read-rate siste 30d" progress={data.messageReadRate} tone={data.messageReadRate >= 75 ? "good" : data.messageReadRate >= 50 ? "warn" : "bad"} />
      </div>

      <Kort eyebrow="Daglig" action={<Caps size={9}>Siste 30 dager</Caps>}>
        <div style={{ marginBottom: 4, fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Daglige aktive spillere</div>
        <div style={{ marginBottom: 14, fontFamily: T.mono, fontSize: 11, color: T.mut }}>Spillere som logget økt, runde, AI-tråd, mål eller åpnet melding</div>
        <LineChartV2 data={data.daily} totalPlayers={data.totalPlayers} />
      </Kort>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: T.gap }}>
        <Kort>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="flame" size={16} style={{ color: T.lime }} />
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Topp engasjerte</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.topEngaged.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 10, border: `1px solid ${T.border}`, padding: 12 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>#{i + 1}</span>
                <AvatarFoto src={p.avatarUrl} navn={p.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/admin/spillere/${p.id}`} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, textDecoration: "none" }}>{p.name}</Link>
                  <div style={{ marginTop: 2, display: "flex", flexWrap: "wrap", gap: 4, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
                    <span>{p.compliancePct}% compliance</span><span>·</span><span>{p.readRatePct}% lest</span><span>·</span><span>{p.aiCaddieThreads} AI-tråder</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Kort>

        <Kort style={{ border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 4%, transparent)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="alert-triangle" size={16} style={{ color: T.down }} />
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.down }}>Trenger oppfølging</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.needsFollowup.map((p) => {
              const dager = p.lastSeen ? daysSince(p.lastSeen) : null;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 10, border: `1px solid ${T.border}`, padding: 12 }}>
                  <AvatarFoto src={p.avatarUrl} navn={p.name} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/admin/spillere/${p.id}`} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, textDecoration: "none" }}>{p.name}</Link>
                    <div style={{ marginTop: 2, display: "flex", flexWrap: "wrap", gap: 4, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
                      <span style={{ color: T.down }}>{p.compliancePct}% compliance</span><span>·</span><span>{p.readRatePct}% lest</span>
                      {dager != null && <><span>·</span><span>sett {dager}d siden</span></>}
                    </div>
                  </div>
                  <Link href={`/admin/innboks?ny=${p.id}`} style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, background: T.lime, padding: "6px 12px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.onLime, textDecoration: "none" }}>
                    <Icon name="send" size={11} />Send
                  </Link>
                </div>
              );
            })}
          </div>
        </Kort>
      </div>

      <div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Compliance per spiller</div>
            <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 11, color: T.mut }}>Sortert etter lavest compliance · klikk for å åpne profilen</div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 2, borderRadius: 9999, border: `1px solid ${T.border}`, padding: 3 }}>
            {FILTERS.map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} style={{ borderRadius: 9999, border: "none", padding: "6px 14px", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", background: filter === f ? T.lime : "transparent", color: filter === f ? T.onLime : T.mut }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2, textAlign: "left" }}>
                  {["Spiller", "Økter sist uke", "Compliance", "Sist sett", "Status", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "28px 14px", textAlign: "center", fontFamily: T.mono, fontSize: 11, color: T.mut }}>Ingen spillere matcher filteret.</td></tr>
                ) : (
                  filteredPlayers.map((p) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <AvatarFoto src={p.avatarUrl} navn={p.name} size={26} />
                          <Link href={`/admin/spillere/${p.id}`} style={{ fontWeight: 600, color: T.fg, textDecoration: "none" }}>{p.name}</Link>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", fontFamily: T.mono, fontSize: 12 }}>{p.sessions7d}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 90, height: 6, borderRadius: 9999, background: T.panel3, overflow: "hidden" }}>
                            <div style={{ width: `${p.compliancePct}%`, height: "100%", borderRadius: 9999, background: complianceFarge(p.compliancePct) }} />
                          </div>
                          <span style={{ fontFamily: T.mono, fontSize: 12 }}>{p.compliancePct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", fontFamily: T.mono, fontSize: 11.5, color: T.mut }}>{p.lastSeen ? formatRelative(p.lastSeen) : "—"}</td>
                      <td style={{ padding: "10px 14px" }}><StatusDotV2 status={p.status} /></td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <Link href={`/admin/spillere/${p.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 10, color: T.mut, textDecoration: "none" }}>Åpne <Icon name="arrow-right" size={11} /></Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Kort eyebrow="Adoption" action={<StatusPill tone="info">30 dager</StatusPill>}>
        <div style={{ marginBottom: 4, fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Feature-bruk</div>
        <div style={{ marginBottom: 14, fontFamily: T.mono, fontSize: 11, color: T.mut }}>Antall unike spillere som har brukt featuret siste 30 dager</div>
        <FeatureBarChartV2 data={data.featureUsage} totalPlayers={data.totalPlayers} />
      </Kort>
    </div>
  );
}
