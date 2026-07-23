"use client";

/**
 * AgencyOS Reach — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Engasjement & compliance. T.* only.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, StatusPill, AvatarFoto, TomTilstand, CTAPill, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export interface ReachSpiller {
  id: string;
  navn: string;
  avatarUrl: string | null;
  compliancePct: number;
  sistSett: string | null;
  status: "green" | "amber" | "red";
}
export interface ReachTopEngasjert {
  id: string;
  navn: string;
  avatarUrl: string | null;
  compliancePct: number;
  readRatePct: number;
  aiCaddieThreads: number;
}
export interface ReachTrengerOppfolging {
  id: string;
  navn: string;
  avatarUrl: string | null;
  compliancePct: number;
  readRatePct: number;
  sistSett: string | null;
}
export interface AdminReachV2Data {
  totaltSpillere: number;
  aktiv7d: number;
  aktiv30d: number;
  snittCompliance: number;
  meldingLesRate: number;
  daglig: { dato: string; aktive: number }[];
  spillere: ReachSpiller[];
  toppEngasjerte: ReachTopEngasjert[];
  trengerOppfolging: ReachTrengerOppfolging[];
  featureBruk: { label: string; antall: number }[];
}

const FILTERS = ["Alle", "Trenger oppfølging", "Topp engasjerte"] as const;
type ReachFilter = (typeof FILTERS)[number];

const STATUS_TONE: Record<ReachSpiller["status"], "up" | "warn" | "down"> = { green: "up", amber: "warn", red: "down" };
const STATUS_LABEL: Record<ReachSpiller["status"], string> = { green: "På sporet", amber: "Følg med", red: "Trenger oppfølging" };

function Kpi({ label, value, sub, progress, tone = "lime" }: { label: string; value: string; sub: string; progress: number; tone?: "lime" | "warn" | "down" }) {
  const c = tone === "down" ? T.down : tone === "warn" ? T.warn : T.lime;
  return (
    <Kort>
      <Caps>{label}</Caps>
      <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 30, color: T.fg, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ height: 6, borderRadius: 9999, background: T.track, marginTop: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, progress)}%`, background: c, borderRadius: 9999 }} />
      </div>
      <p style={{ margin: "8px 0 0", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{sub}</p>
    </Kort>
  );
}

function DagligAktivitet({ data, totaltSpillere }: { data: { dato: string; aktive: number }[]; totaltSpillere: number }) {
  const width = 720;
  const height = 180;
  const padX = 36;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const maxVerdi = Math.max(totaltSpillere || 1, ...data.map((d) => d.aktive), 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const points = data.map((d, i) => ({ x: padX + i * step, y: padY + innerH - (d.aktive / maxVerdi) * innerH, ...d }));
  const linje = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const flate = points.length > 0 ? `${linje} L${points[points.length - 1].x.toFixed(2)},${(padY + innerH).toFixed(2)} L${points[0].x.toFixed(2)},${(padY + innerH).toFixed(2)} Z` : "";

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ height: 160, width: "100%", minWidth: 480 }} role="img" aria-label="Daglig aktive spillere siste 30 dager">
        <defs>
          <linearGradient id="reach-area-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.lime} stopOpacity={0.25} />
            <stop offset="100%" stopColor={T.lime} stopOpacity={0} />
          </linearGradient>
        </defs>
        {flate && <path d={flate} fill="url(#reach-area-v2)" />}
        {linje && <path d={linje} fill="none" stroke={T.lime} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p, i) =>
          i % 5 === 0 || i === points.length - 1 ? (
            <g key={p.dato}>
              <circle cx={p.x} cy={p.y} r={3.5} fill={T.panel} stroke={T.lime} strokeWidth={2} />
              <text x={p.x} y={height - 4} textAnchor="middle" fontSize={9} fill={T.mut} fontFamily={T.mono}>
                {p.dato.slice(5)}
              </text>
            </g>
          ) : null,
        )}
      </svg>
    </div>
  );
}

function FeatureBruk({ data, totaltSpillere }: { data: { label: string; antall: number }[]; totaltSpillere: number }) {
  const max = Math.max(totaltSpillere || 1, ...data.map((d) => d.antall), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((f) => {
        const pct = Math.round((f.antall / max) * 100);
        const adopsjon = totaltSpillere ? Math.round((f.antall / totaltSpillere) * 100) : 0;
        return (
          <div key={f.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr 44px", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: T.mono, fontSize: 11.5, color: T.fg }}>{f.label}</span>
            <div style={{ position: "relative", height: 22, borderRadius: 6, background: T.track, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: T.lime, borderRadius: 6 }} />
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.onLime }}>
                {f.antall} spillere
              </span>
            </div>
            <span style={{ textAlign: "right", fontFamily: T.mono, fontSize: 11, color: T.mut }}>{adopsjon} %</span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminReachV2({ data }: { data: AdminReachV2Data }) {
  const [filter, setFilter] = useState<ReachFilter>("Alle");

  const aktiv7dPct = data.totaltSpillere ? Math.round((data.aktiv7d / data.totaltSpillere) * 100) : 0;
  const aktiv30dPct = data.totaltSpillere ? Math.round((data.aktiv30d / data.totaltSpillere) * 100) : 0;

  const filtrerte = useMemo(() => {
    if (filter === "Trenger oppfølging") return data.spillere.filter((p) => p.status === "red" || p.compliancePct < 50);
    if (filter === "Topp engasjerte") return [...data.spillere].sort((a, b) => b.compliancePct - a.compliancePct).slice(0, 10);
    return data.spillere;
  }, [filter, data.spillere]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>Reach & engasjement · Siste 30 dager · AgencyOS</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="engasjement.">Plattform</Tittel>
          </div>
          <p style={{ fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut, margin: "8px 0 0" }}>
            {data.totaltSpillere} spillere · hvor mye lander det vi sender, og hvem trenger oppmerksomhet?
          </p>
        </div>
        <StatusPill tone={data.trengerOppfolging.length > 0 ? "warn" : "lime"}>
          {data.trengerOppfolging.length > 0
            ? `${data.trengerOppfolging.length} trenger oppfølging`
            : "I rute"}
        </StatusPill>
      </div>

      {/* B: én primær CTA */}
      <Link href="/admin/innboks" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="message-circle" full>
          Åpne innboks
        </CTAPill>
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <Kpi label="Aktive (7d)" value={String(data.aktiv7d)} sub={`av ${data.totaltSpillere} (${aktiv7dPct} %)`} progress={aktiv7dPct} />
        <Kpi label="Aktive (30d)" value={String(data.aktiv30d)} sub={`av ${data.totaltSpillere} (${aktiv30dPct} %)`} progress={aktiv30dPct} />
        <Kpi label="Snitt-compliance" value={`${data.snittCompliance} %`} sub="Fullført vs planlagt" progress={data.snittCompliance} tone={data.snittCompliance >= 75 ? "lime" : data.snittCompliance >= 50 ? "warn" : "down"} />
        <Kpi label="Åpningsrate meldinger" value={`${data.meldingLesRate} %`} sub="Read-rate siste 30d" progress={data.meldingLesRate} tone={data.meldingLesRate >= 75 ? "lime" : data.meldingLesRate >= 50 ? "warn" : "down"} />
      </div>

      <Kort eyebrow="Daglig">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <div>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>Daglige aktive spillere</span>
            <p style={{ margin: "4px 0 0", fontFamily: T.mono, fontSize: 11, color: T.mut }}>
              Siste 30 dager · spillere som logget økt, runde, AI-tråd, mål eller åpnet melding
            </p>
          </div>
        </div>
        <DagligAktivitet data={data.daglig.map((d) => ({ dato: d.dato, aktive: d.aktive }))} totaltSpillere={data.totaltSpillere} />
      </Kort>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
        <Kort>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="flame" size={15} style={{ color: T.lime }} />
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>Topp engasjerte</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.toppEngasjerte.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}` }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, width: 16 }}>#{i + 1}</span>
                <AvatarFoto src={p.avatarUrl} navn={p.navn} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/admin/spillere/${p.id}`} style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, textDecoration: "none" }}>
                    {p.navn}
                  </Link>
                  <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
                    {p.compliancePct}% compliance · {p.readRatePct}% lest · {p.aiCaddieThreads} AI-tråder
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Kort>

        <Kort style={{ borderColor: `color-mix(in srgb, ${T.down} 35%, ${T.border})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Icon name="triangle-alert" size={15} style={{ color: T.down }} />
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>Trenger oppfølging</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.trengerOppfolging.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}` }}>
                <AvatarFoto src={p.avatarUrl} navn={p.navn} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/admin/spillere/${p.id}`} style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, textDecoration: "none" }}>
                    {p.navn}
                  </Link>
                  <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 10, color: T.down }}>
                    {p.compliancePct}% compliance <span style={{ color: T.mut }}>· {p.readRatePct}% lest{p.sistSett ? ` · sett ${p.sistSett}` : ""}</span>
                  </div>
                </div>
                <Link href={`/admin/innboks?ny=${p.id}`}>
                  <Knapp icon="send">Send</Knapp>
                </Link>
              </div>
            ))}
          </div>
        </Kort>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>Compliance per spiller</span>
            <p style={{ margin: "4px 0 0", fontFamily: T.mono, fontSize: 11, color: T.mut }}>Sortert etter lavest compliance · klikk for å åpne profilen</p>
          </div>
          <div style={{ display: "inline-flex", gap: 6, borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, padding: 4 }}>
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{ appearance: "none", cursor: "pointer", border: "none", borderRadius: 9999, padding: "6px 14px", fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", background: on ? T.lime : "transparent", color: on ? T.onLime : T.mut }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <Kort pad="0">
          {filtrerte.length === 0 ? (
            <TomTilstand
              icon="users"
              title="Ingen spillere matcher filteret"
              sub="Bytt filter eller følg opp stallen for å se engasjement her."
            />
          ) : (
            filtrerte.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i ? `1px solid ${T.border}` : "none", flexWrap: "wrap" }}>
                <AvatarFoto src={p.avatarUrl} navn={p.navn} size={30} />
                <Link href={`/admin/spillere/${p.id}`} style={{ flex: "1 1 160px", minWidth: 0, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, textDecoration: "none" }}>
                  {p.navn}
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 140px" }}>
                  <span style={{ height: 6, width: 96, borderRadius: 9999, background: T.track, overflow: "hidden", display: "inline-block" }}>
                    <span style={{ display: "block", height: "100%", width: `${p.compliancePct}%`, borderRadius: 9999, background: p.compliancePct >= 75 ? T.lime : p.compliancePct >= 50 ? T.warn : T.down }} />
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg }}>{p.compliancePct}%</span>
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, flex: "0 0 auto" }}>{p.sistSett ?? "—"}</span>
                <StatusPill tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</StatusPill>
                <Link href={`/admin/spillere/${p.id}`} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em", color: T.mut, textDecoration: "none" }}>
                  Åpne <Icon name="arrow-right" size={12} />
                </Link>
              </div>
            ))
          )}
        </Kort>
      </div>

      <Kort eyebrow="Adoption">
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>Feature-bruk</span>
          <p style={{ margin: "4px 0 0", fontFamily: T.mono, fontSize: 11, color: T.mut }}>Antall unike spillere som har brukt featuret siste 30 dager</p>
        </div>
        <FeatureBruk data={data.featureBruk} totaltSpillere={data.totaltSpillere} />
      </Kort>
    </div>
  );
}
