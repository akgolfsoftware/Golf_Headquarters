/**
 * /admin/talent — Talent Coach (hybrid terminal design)
 *
 * Design: AgencyOS Talent Coach (hybrid).dc.html
 * Tre paneler: SkillRadar · PercentileGauge · Talent-akser + H2H
 * Datakilde: TalentTracking (Prisma). Spiller-selector fra URL-param.
 * Roller: ADMIN, COACH.
 */

import Link from "next/link";
import { Search } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ spiller?: string }>;
};

// Talent-akser (TalentTracking) — eget konstrukt, IKKE pyramide-budsjettet. Bruker
// nøytrale chart-tokens, ikke --color-pyr-*, for å unngå å blande de to nøklene.
const PYR_AKSER = [
  { key: "fysisk" as const, label: "FYSISK", color: "var(--color-chart-1)", track: "color-mix(in srgb, var(--color-chart-1) 12%, transparent)" },
  { key: "teknikk" as const, label: "TEKNIKK", color: "var(--color-chart-2)", track: "color-mix(in srgb, var(--color-chart-2) 14%, transparent)" },
  { key: "taktikk" as const, label: "TAKTIKK", color: "var(--color-chart-3)", track: "color-mix(in srgb, var(--color-chart-3) 12%, transparent)" },
  { key: "mental" as const, label: "MENTAL", color: "var(--color-chart-4)", track: "color-mix(in srgb, var(--color-chart-4) 20%, transparent)" },
  { key: "motivasjon" as const, label: "MOT.", color: "var(--color-chart-5)", track: "color-mix(in srgb, var(--color-chart-5) 12%, transparent)" },
] as const;

type PyrKey = typeof PYR_AKSER[number]["key"];

type TalentRow = {
  id: string;
  userId: string;
  niva: string;
  klubb: string | null;
  region: string | null;
  fysisk: number | null;
  teknikk: number | null;
  taktikk: number | null;
  mental: number | null;
  motivasjon: number | null;
  updatedAt: Date;
  user: { id: string; name: string; hcp: number | null };
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function akseverdi(t: TalentRow, key: PyrKey): number {
  return (t[key] ?? 0) * 10; // skaler 0-10 → 0-100
}

/** Beregner gjennomsnitt for en akse på tvers av alle spillere */
function aksesnitt(alle: TalentRow[], key: PyrKey): number {
  const vals = alle.map((t) => t[key] ?? 0).filter((v) => v > 0);
  if (vals.length === 0) return 0;
  return (vals.reduce((a, b) => a + b, 0) / vals.length) * 10;
}

/** Beregner SG-percentil (proxy: basert på snitt radar-score vs. alle i stall) */
function percentilRank(t: TalentRow, alle: TalentRow[]): number {
  const min_score = PYR_AKSER.map((a) => t[a.key] ?? 0).reduce((a, b) => a + b, 0) / PYR_AKSER.length;
  const alle_scores = alle.map((row) =>
    PYR_AKSER.map((a) => row[a.key] ?? 0).reduce((a, b) => a + b, 0) / PYR_AKSER.length
  );
  const under = alle_scores.filter((s) => s < min_score).length;
  return alle.length <= 1 ? 0.85 : under / (alle.length - 1);
}

/** SVG-radar: returner path-string for et sett med verdier (0-100) */
function radarPoints(vals: number[], cx: number, cy: number, R: number, n: number): string {
  return vals
    .map((v, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const r = (R * v) / 100;
      return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`;
    })
    .join(" ");
}

/** Radar-ring-punkter for en gitt radius */
function ringPoints(R: number, cx: number, cy: number, n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return `${(cx + Math.cos(angle) * R).toFixed(1)},${(cy + Math.sin(angle) * R).toFixed(1)}`;
  }).join(" ");
}

export default async function TalentCoachPage({ searchParams }: PageProps) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const { spiller: valgtSpillerId } = await searchParams;

  const alle = await prisma.talentTracking.findMany({
    include: { user: { select: { id: true, name: true, hcp: true } } },
    orderBy: { updatedAt: "desc" },
  }) as TalentRow[];

  if (alle.length === 0) {
    return (
      <AgPage>
        <AgPageHead
          eyebrow="AgencyOS · Talent"
          title="Talent"
          italic="Coach"
          lead="Radar · percentil · sammenligning"
        />
        <EmptyState
          icon={Users}
          titleItalic="Ingen spillere"
          titleTrail="i talent-programmet ennå"
          sub="Bruk Discovery-siden for å legge til spillere."
          cta={
            <Link href="/admin/talent/discovery" className={agBtnClass("primary")}>
              Åpne Discovery
            </Link>
          }
        />
      </AgPage>
    );
  }

  // Valgt spiller — default til første
  const valgt = alle.find((t) => t.userId === valgtSpillerId) ?? alle[0];

  // Radar-verdier for valgt spiller (0–100)
  const radarVals = PYR_AKSER.map((a) => akseverdi(valgt, a.key));

  // Percentil
  const percentil = percentilRank(valgt, alle);

  // H2H: spiller vs. stall-snitt per akse (SG-format)
  const h2h = [
    { label: "FYS", val: valgt.fysisk?.toFixed(1) ?? "—", avg: (aksesnitt(alle, "fysisk") / 10).toFixed(1), positive: (valgt.fysisk ?? 0) >= aksesnitt(alle, "fysisk") / 10 },
    { label: "TEK", val: valgt.teknikk?.toFixed(1) ?? "—", avg: (aksesnitt(alle, "teknikk") / 10).toFixed(1), positive: (valgt.teknikk ?? 0) >= aksesnitt(alle, "teknikk") / 10 },
    { label: "MENTAL", val: valgt.mental?.toFixed(1) ?? "—", avg: (aksesnitt(alle, "mental") / 10).toFixed(1), positive: (valgt.mental ?? 0) >= aksesnitt(alle, "mental") / 10 },
    { label: "MOT.", val: valgt.motivasjon?.toFixed(1) ?? "—", avg: (aksesnitt(alle, "motivasjon") / 10).toFixed(1), positive: (valgt.motivasjon ?? 0) >= aksesnitt(alle, "motivasjon") / 10 },
  ];

  // SVG radar-konstanter
  const CX = 100;
  const CY = 100;
  const R = 72;
  const N = 5;

  // Gauge-konstanter (halvmåne)
  const GCX = 100;
  const GCY = 95;
  const GR = 72;
  const GAUGE_STEPS = 40;

  // Gauge-segments som path-strenger (fargeskalaen: rød→gul→grøn→lime)
  function gaugeSegColor(p: number): string {
    if (p < 0.5) return "hsl(var(--destructive))";
    if (p < 0.7) return "hsl(var(--warning))";
    if (p < 0.85) return "#005840";
    return "hsl(var(--primary))";
  }

  function gaugePoint(p: number): [number, number] {
    const a = Math.PI - p * Math.PI;
    return [GCX + Math.cos(a) * GR, GCY - Math.sin(a) * GR];
  }

  const needleAngleDeg = -90 + percentil * 180;
  const needleRad = (needleAngleDeg * Math.PI) / 180;
  const needleTipX = (GCX + Math.cos(needleRad) * (GR - 10)).toFixed(1);
  const needleTipY = (GCY + Math.sin(needleRad) * (GR - 10)).toFixed(1);
  const topPercentil = Math.round((1 - percentil) * 100);

  return (
    <AgPage>
      {/* Side-hode */}
      <AgPageHead
        eyebrow="AgencyOS · Talent"
        title="Talent"
        italic="Coach"
        lead="Radar · percentil · sammenligning"
        actions={
          <Link href="/admin/talent/discovery" className={agBtnClass("secondary", "sm")}>
            <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
            Discovery
          </Link>
        }
      />

      {/* Spiller-selector */}
      <div className="mb-5 flex flex-wrap gap-2">
        {alle.map((t) => {
          const aktiv = t.userId === valgt.userId;
          return (
            <Link
              key={t.userId}
              href={`/admin/talent?spiller=${t.userId}`}
              className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                aktiv
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {t.user.name.split(" ")[0]}
            </Link>
          );
        })}
      </div>

      {/* 3-kolonne grid */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {/* Skill Radar */}
        <div className="relative overflow-hidden rounded-[14px] border border-border bg-card p-5">
          {/* Subtil grid-bakgrunn */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="relative mb-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Skill<em className="font-normal not-italic text-primary" style={{ fontStyle: "italic" }}>Radar</em>
            {" · "}{valgt.user.name.split(" ")[0]}
          </div>
          <svg viewBox="0 0 200 200" className="relative w-full">
            {/* Ringer */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((f) => (
              <polygon
                key={f}
                points={ringPoints(R * f, CX, CY, N)}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
            ))}
            {/* Eiker */}
            {PYR_AKSER.map((_, i) => {
              const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
              const x2 = (CX + Math.cos(angle) * R).toFixed(1);
              const y2 = (CY + Math.sin(angle) * R).toFixed(1);
              return (
                <line
                  key={i}
                  x1={CX}
                  y1={CY}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                />
              );
            })}
            {/* Dataflate */}
            <polygon
              points={radarPoints(radarVals, CX, CY, R, N)}
              fill="hsl(var(--primary) / 0.1)"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
            />
            {/* Punkter + label */}
            {PYR_AKSER.map((a, i) => {
              const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
              const r = (R * radarVals[i]) / 100;
              const dx = (CX + Math.cos(angle) * r).toFixed(1);
              const dy = (CY + Math.sin(angle) * r).toFixed(1);
              const lx = (CX + Math.cos(angle) * (R + 16)).toFixed(1);
              const ly = (CY + Math.sin(angle) * (R + 16) + 4).toFixed(1);
              return (
                <g key={a.key}>
                  <circle cx={dx} cy={dy} r="3.5" fill={a.color} />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains-mono, monospace)"
                    fontSize="9"
                    fill={a.color}
                  >
                    {a.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Percentile Gauge */}
        <div className="relative overflow-hidden rounded-[14px] border border-border bg-card p-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="relative mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Percentile<em className="font-normal not-italic text-primary" style={{ fontStyle: "italic" }}>Gauge</em>
          </div>
          <svg viewBox="0 0 200 120" className="relative mx-auto w-full max-w-[240px]">
            {/* Gauge-segmenter */}
            {Array.from({ length: GAUGE_STEPS }, (_, i) => {
              const p0 = i / GAUGE_STEPS;
              const p1 = (i + 1) / GAUGE_STEPS;
              const [x0, y0] = gaugePoint(p0);
              const [x1, y1] = gaugePoint(p1);
              return (
                <path
                  key={i}
                  d={`M${x0.toFixed(1)} ${y0.toFixed(1)} A${GR} ${GR} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
                  stroke={gaugeSegColor(p0)}
                  strokeWidth="10"
                  fill="none"
                  opacity="0.9"
                />
              );
            })}
            {/* Nål */}
            <line
              x1={GCX}
              y1={GCY}
              x2={needleTipX}
              y2={needleTipY}
              stroke="hsl(var(--foreground))"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={GCX} cy={GCY} r="5" fill="hsl(var(--foreground))" />
            <circle cx={GCX} cy={GCY} r="2" fill="hsl(var(--primary))" />
          </svg>
          <div className="relative mt-1 text-center">
            <div className="font-mono text-[28px] font-bold leading-none text-primary">
              {alle.length > 1 ? `topp ${topPercentil} %` : "—"}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              Talent-score · vs stall
            </div>
          </div>
        </div>

        {/* Talent-akser + H2H */}
        <div className="rounded-[14px] border border-border bg-card p-5">
          <div className="mb-4 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Talent-akser
          </div>
          {/* Barer — bunn→topp (column-reverse) */}
          <div className="flex flex-col-reverse gap-2">
            {PYR_AKSER.map((a) => {
              const pct = akseverdi(valgt, a.key);
              return (
                <div key={a.key} className="flex items-center gap-2.5">
                  <span className="w-14 flex-shrink-0 font-mono text-[9px] text-muted-foreground">
                    {a.label}
                  </span>
                  <div
                    className="flex-1 rounded-full"
                    style={{ height: 8, background: a.track }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: a.color, transition: "width .8s" }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
                    {pct > 0 ? `${pct}%` : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* H2H vs. stall-snitt */}
          <div className="mt-4 border-t border-border pt-3.5">
            <div className="mb-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              H2H · vs stall-snitt
            </div>
            {h2h.map((h) => (
              <div
                key={h.label}
                className="mb-1.5 grid items-center gap-1.5"
                style={{ gridTemplateColumns: "42px 1fr 42px" }}
              >
                <span
                  className={`text-right font-mono text-[10px] font-semibold ${h.positive ? "text-success" : "text-destructive"}`}
                >
                  {h.val}
                </span>
                <span className="text-center font-mono text-[8px] text-muted-foreground">
                  {h.label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {h.avg}
                </span>
              </div>
            ))}
          </div>

          {/* Link til full talent-rad */}
          <div className="mt-4 border-t border-border pt-3">
            <Link
              href={`/admin/talent/radar/${valgt.userId}`}
              className="font-mono text-[11px] font-semibold text-primary hover:underline"
            >
              Åpne full radar →
            </Link>
          </div>
        </div>
      </div>

      {/* Spiller-info-rad */}
      <div className="mt-4 rounded-[14px] border border-border bg-card px-5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-mono text-[12px] font-bold text-primary-foreground">
              {initials(valgt.user.name)}
            </span>
            <div>
              <div className="text-[13px] font-semibold text-foreground">{valgt.user.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {valgt.niva}{valgt.user.hcp !== null ? ` · HCP ${valgt.user.hcp.toFixed(1).replace(".", ",")}` : ""}{valgt.klubb ? ` · ${valgt.klubb}` : ""}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/talent/discovery"
              className={agBtnClass("secondary", "sm")}
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
              Discovery
            </Link>
            <Link href="/admin/talent/radar" className={agBtnClass("primary", "sm")}>
              Alle radar
            </Link>
          </div>
        </div>
      </div>
    </AgPage>
  );
}
