/**
 * DEMO — Talent · Region-pipeline
 * Spec: docs/spec/talent/11-region-pipeline.md
 * URL: /talent-region-pipeline-demo
 *
 * Scout-deepdive på én region. Norgeskart + KPI + topp-klubber +
 * spillere fra valgt region.
 */

import { ArrowLeft, ArrowRight } from "lucide-react";

type RegionId = "ost" | "vest" | "sor" | "nord" | "midt" | "innland" | "trondelag";

const REGIONS: { id: RegionId; label: string; path: string }[] = [
  { id: "ost", label: "Øst", path: "M180 240 L255 235 L260 305 L185 320 Z" },
  { id: "vest", label: "Vest", path: "M85 230 L165 245 L160 320 L80 305 Z" },
  { id: "sor", label: "Sør", path: "M120 330 L240 330 L225 395 L130 395 Z" },
  { id: "nord", label: "Nord", path: "M205 30 L280 60 L240 145 L165 110 Z" },
  { id: "midt", label: "Midt", path: "M165 150 L260 145 L255 230 L170 235 Z" },
  { id: "innland", label: "Innland", path: "M230 175 L295 165 L298 240 L260 240 Z" },
  { id: "trondelag", label: "Trøndelag", path: "M145 115 L240 130 L235 175 L150 165 Z" },
];

const SELECTED: RegionId = "ost";

const KLUBBER: { name: string; count: number }[] = [
  { name: "Bærum GK", count: 28 },
  { name: "Oslo GK", count: 22 },
  { name: "Bogstad GK", count: 18 },
  { name: "Drammen GK", count: 14 },
  { name: "Holmestrand GK", count: 12 },
  { name: "GFGK Fredrikstad", count: 10 },
  { name: "Sarpsborg GK", count: 9 },
  { name: "Hauger GK", count: 8 },
];

const SPILLERE: { initials: string; name: string; club: string; hcp: string; primary?: boolean }[] = [
  { initials: "MR", name: "Markus Roinås", club: "GFGK", hcp: "+2,4", primary: true },
  { initials: "AN", name: "Anders Nedrum", club: "Bossum", hcp: "+1,8", primary: true },
  { initials: "JV", name: "Joachim Vik", club: "GFGK", hcp: "+1,2", primary: true },
  { initials: "EL", name: "Eirik Lund", club: "Mulligan", hcp: "+1,6", primary: true },
  { initials: "IS", name: "Ida Sletten", club: "Bærum GK", hcp: "+0,8" },
  { initials: "OV", name: "Oskar Vinje", club: "Drammen GK", hcp: "2,4" },
  { initials: "HL", name: "Henrik Lassen", club: "Bossum", hcp: "4,8" },
  { initials: "AK", name: "Anders Kristiansen", club: "GFGK", hcp: "3,2" },
  { initials: "MS", name: "Mia Stensrud", club: "Bogstad GK", hcp: "5,1" },
  { initials: "TN", name: "Truls Nesheim", club: "Sarpsborg GK", hcp: "4,4" },
  { initials: "LE", name: "Lars Eikrem", club: "Hauger GK", hcp: "3,9" },
  { initials: "RB", name: "Rikke Berge", club: "Holmestrand GK", hcp: "2,7" },
];

const SELECTED_LABEL = REGIONS.find((r) => r.id === SELECTED)!.label;
const MAX_KLUBB = KLUBBER[0]!.count;

export default function TalentRegionPipelineDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground">
      {/* Header */}
      <header className="grid grid-cols-[1fr_auto] items-end gap-6 border-b border-border pb-5 pt-1 mb-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Scout · Regional pipeline
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            Region <em className="font-medium italic">{SELECTED_LABEL}</em>
          </h1>
          <p className="mt-1.5 max-w-[520px] text-[13px] leading-[1.5] text-muted-foreground">
            Hvor sterk er pipelinen i regionen? Klubber, retention, topp-talenter.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Tilbake
        </button>
      </header>

      {/* Action-strip */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sammendrag
        </span>
        <ActionItem tone="success">
          <b>38 %</b> av topp-100
        </ActionItem>
        <ActionItem tone="info">
          Pipeline-helse: <b>sterk</b>
        </ActionItem>
        <ActionItem>
          Retention 5-år: <b>68 %</b>
        </ActionItem>
        <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Sammenlign regioner
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Filter row — region pills */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              r.id === SELECTED
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            Region {r.label}
          </button>
        ))}
      </div>

      {/* Row 1: kart + KPI */}
      <div className="mb-4 grid grid-cols-[5fr_7fr] gap-4">
        <Card eyebrow="Valgt region" title={`Region ${SELECTED_LABEL}`}>
          <NorgesMap />
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Kpi label="Aktive talenter" value="186" delta="+12" deltaTone="up" sub="i Region Øst" />
          <Kpi label="Topp-100 fra region" value="38" delta="+4" deltaTone="up" sub="andel: 38 %" />
          <Kpi label="Retention 5-år" value="68 %" delta="+3 %" deltaTone="up" sub="snitt nasjonalt: 54 %" />
          <Kpi label="Ny-rekruttering" value="42" delta="+9" deltaTone="up" sub="siste 12 mnd" />
          <DarkKpi />
        </div>
      </div>

      {/* Row 2: klubber + spillere */}
      <div className="grid grid-cols-[5fr_7fr] gap-4">
        <Card eyebrow={`Topp 8 klubber i ${SELECTED_LABEL}`} title="Klubbfordeling">
          <div className="flex flex-col gap-2.5">
            {KLUBBER.map((k) => (
              <KlubbBar key={k.name} {...k} max={MAX_KLUBB} />
            ))}
          </div>
        </Card>

        <Card eyebrow={`Spillere fra ${SELECTED_LABEL}`} title="Topp 12">
          <div className="grid grid-cols-4 gap-3">
            {SPILLERE.map((s) => (
              <PlayerCard key={s.name} {...s} />
            ))}
          </div>
          <button className="mt-4 inline-flex items-center gap-1.5 self-end rounded-full border border-border bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
            Vis alle 186 spillere
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </Card>
      </div>
    </div>
  );
}

function Card({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {eyebrow}
        </div>
        <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
          <em className="font-medium italic">{title}</em>
        </h3>
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function NorgesMap() {
  return (
    <svg
      viewBox="0 0 380 430"
      className="w-full"
      style={{ height: 360 }}
      role="img"
      aria-label="Norge — regioner"
    >
      <rect x={0} y={0} width={380} height={430} fill="var(--surface-alt, #F1EEE5)" rx={8} />
      {REGIONS.map((r) => {
        const isSelected = r.id === SELECTED;
        return (
          <g key={r.id}>
            <path
              d={r.path}
              fill={
                isSelected ? "var(--color-pyr-fys, #005840)" : "var(--color-card, #FFFFFF)"
              }
              stroke={
                isSelected
                  ? "var(--color-pyr-slag, #D1F843)"
                  : "var(--color-border, #E5E3DD)"
              }
              strokeWidth={isSelected ? 3 : 1.25}
            />
            <text
              x={pathCentroid(r.path).x}
              y={pathCentroid(r.path).y}
              textAnchor="middle"
              fontFamily="var(--font-geist)"
              fontSize={isSelected ? 13 : 11}
              fontWeight={600}
              fill={isSelected ? "#D1F843" : "var(--color-foreground, #0A1F17)"}
            >
              {r.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function pathCentroid(path: string): { x: number; y: number } {
  // Simple centroid of "M x y L x y L x y L x y Z"
  const matches = path.match(/-?\d+(\.\d+)?/g);
  if (!matches) return { x: 0, y: 0 };
  const nums = matches.map(Number);
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    sx += nums[i]!;
    sy += nums[i + 1]!;
    n++;
  }
  return { x: sx / n, y: sy / n };
}

function Kpi({
  label,
  value,
  delta,
  deltaTone = "up",
  sub,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone?: "up" | "flat" | "down";
  sub: string;
}) {
  const deltaStyle =
    deltaTone === "up"
      ? "bg-[#E5F1EA] text-[#1A7D56]"
      : deltaTone === "down"
        ? "bg-[#FBE5E5] text-[#A32D2D]"
        : "bg-secondary text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <span className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${deltaStyle}`}>
          {delta}
        </span>
      </div>
      <div className="mt-3.5 mb-1.5 font-mono text-[28px] font-medium tabular-nums leading-none -tracking-tight">
        {value}
      </div>
      <div className="text-[12px] leading-[1.4] text-muted-foreground">{sub}</div>
    </div>
  );
}

function DarkKpi() {
  return (
    <div
      className="col-span-2 rounded-lg p-5 text-[color:#F5F4EE]"
      style={{ background: "var(--color-pyr-fys, #005840)" }}
    >
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#D1F843]">
        Pipeline-helse
      </div>
      <div className="mt-2 font-display text-[36px] font-medium italic leading-none">
        Sterk
      </div>
      <div className="mt-3 max-w-[560px] text-[13px] leading-[1.5] text-[#D1F843]/85">
        Diversitet i klubber · 8 klubber leverer ≥ 10 spillere · ny-rekruttering &gt; avgang i &gt; 3 år.
      </div>
    </div>
  );
}

function KlubbBar({ name, count, max }: { name: string; count: number; max: number }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div className="grid grid-cols-[140px_1fr_36px] items-center gap-3">
      <div className="text-[13px] font-semibold leading-none">{name}</div>
      <div className="relative h-3 rounded-full bg-[var(--surface-alt,#F1EEE5)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: "var(--color-pyr-fys, #005840)",
          }}
        />
      </div>
      <div className="text-right font-mono text-[14px] font-semibold tabular-nums leading-none">
        {count}
      </div>
    </div>
  );
}

function PlayerCard({
  initials,
  name,
  club,
  hcp,
  primary,
}: {
  initials: string;
  name: string;
  club: string;
  hcp: string;
  primary?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-[var(--line-soft,#EFEDE6)] bg-[var(--surface-alt,#F1EEE5)]/50 px-2 py-3 text-center">
      <div
        className={`grid h-12 w-12 place-items-center rounded-full font-display text-[15px] font-semibold ${
          primary ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
        }`}
      >
        {initials}
      </div>
      <div className="mt-1 text-[12px] font-semibold leading-tight">{name}</div>
      <div className="text-[10px] leading-tight text-muted-foreground">{club}</div>
      <div className="mt-0.5 font-mono text-[11px] font-semibold tabular-nums">
        HCP {hcp}
      </div>
    </div>
  );
}

function ActionItem({
  tone,
  children,
}: {
  tone?: "info" | "warn" | "success";
  children: React.ReactNode;
}) {
  const bg =
    tone === "info"
      ? "bg-primary/8 text-primary"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : tone === "success"
          ? "bg-[#E5F1EA] text-[#1A7D56]"
          : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium ${bg}`}
    >
      {children}
    </span>
  );
}
