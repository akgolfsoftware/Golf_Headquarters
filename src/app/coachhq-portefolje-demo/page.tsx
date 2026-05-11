/**
 * CoachHQ — Coach-portefølje
 * Bygd fra wireframe/design-files-v2/screens/58-coachhq-portefolje.html
 * URL: /coachhq-portefolje-demo
 */

import { Search, Plus, ChevronRight, Filter } from "lucide-react";

type Tier = "PRO" | "BASIC";
type Status = "ok" | "warn" | "dan" | "mil";
type Progress = "ok" | "warn" | "danger";

type Player = {
  avatar: string;
  avGrad: string;
  name: string;
  team: string;
  hcp: string;
  delta: string;
  deltaDown: boolean;
  progress: number;
  goal: string;
  tier: Tier;
  next: string;
  nextDetail: string;
  flagText: string;
  flagTone: Status;
};

const players: Player[] = [
  { avatar: "MP", avGrad: "from-[#005840] to-[#1A7D56]", name: "Markus Roinås Pedersen", team: "U18 G · GFGK", hcp: "+2,4", delta: "↓ 0,8", deltaDown: true, progress: 66, goal: "HCP +0,5 · 66 %", tier: "PRO", next: "Sesjon i dag", nextDetail: "14:30 · range", flagText: "milepæl", flagTone: "mil" },
  { avatar: "EH", avGrad: "from-[#7d5814] to-[#B8852A]", name: "Eira Hopstad", team: "U18 J · GFGK", hcp: "3,1", delta: "↓ 1,4", deltaDown: true, progress: 78, goal: "HCP scratch · 78 %", tier: "PRO", next: "I morgen", nextDetail: "10:00 · video-økt", flagText: "på sporet", flagTone: "ok" },
  { avatar: "SK", avGrad: "from-[#3a4f5c] to-[#5a7180]", name: "Sondre Karlsen", team: "U18 G · Borre GK", hcp: "5,8", delta: "↑ 0,2", deltaDown: false, progress: 42, goal: "HCP 4,0 · 42 %", tier: "PRO", next: "Live · Kongsberg", nextDetail: "R2 pågår", flagText: "slow start", flagTone: "warn" },
  { avatar: "TF", avGrad: "from-[#5e2b2b] to-[#B04444]", name: "Tobias Fjell", team: "U16 G · Borre GK", hcp: "8,2", delta: "↓ 1,1", deltaDown: true, progress: 71, goal: "HCP 6,0 · 71 %", tier: "PRO", next: "To 16.05", nextDetail: "16:00 · range", flagText: "på sporet", flagTone: "ok" },
  { avatar: "MB", avGrad: "from-[#005840] to-[#1A7D56]", name: "Mathilde Bjerke", team: "U18 J · Borre GK", hcp: "4,1", delta: "↓ 0,3", deltaDown: true, progress: 54, goal: "HCP 2,5 · 54 %", tier: "PRO", next: "I dag 16:00", nextDetail: "putting", flagText: "på sporet", flagTone: "ok" },
  { avatar: "JN", avGrad: "from-[#7d5814] to-[#B8852A]", name: "Jonas Nordby", team: "U16 G · GFGK", hcp: "12,4", delta: "↑ 0,8", deltaDown: false, progress: 18, goal: "HCP 9,0 · 18 %", tier: "BASIC", next: "Ikke booket", nextDetail: "10 dgr siden", flagText: "risk", flagTone: "dan" },
  { avatar: "SR", avGrad: "from-[#3a4f5c] to-[#5a7180]", name: "Sofie Rinde", team: "U18 J · GFGK", hcp: "6,7", delta: "↓ 0,4", deltaDown: true, progress: 62, goal: "HCP 4,5 · 62 %", tier: "PRO", next: "Fr 17.05", nextDetail: "14:00 · range", flagText: "på sporet", flagTone: "ok" },
  { avatar: "EL", avGrad: "from-[#5e2b2b] to-[#B04444]", name: "Erik Lund", team: "U18 G · GFGK", hcp: "2,8", delta: "—", deltaDown: false, progress: 38, goal: "HCP +0,5 · 38 %", tier: "PRO", next: "Pause skade", nextDetail: "retur 24.05", flagText: "skade", flagTone: "warn" },
  { avatar: "LH", avGrad: "from-[#005840] to-[#1A7D56]", name: "Linnea Holm", team: "U16 J · GFGK", hcp: "10,2", delta: "↓ 0,6", deltaDown: true, progress: 68, goal: "HCP 8,0 · 68 %", tier: "BASIC", next: "Ma 19.05", nextDetail: "15:00 · drill", flagText: "milepæl", flagTone: "mil" },
  { avatar: "DM", avGrad: "from-[#7d5814] to-[#B8852A]", name: "Daniel Moe", team: "U16 G · Borre GK", hcp: "14,1", delta: "↓ 1,8", deltaDown: true, progress: 74, goal: "HCP 11,0 · 74 %", tier: "BASIC", next: "Ti 20.05", nextDetail: "17:00 · range", flagText: "på sporet", flagTone: "ok" },
];

function progressVariant(p: number, tone: Status): Progress {
  if (tone === "dan") return "danger";
  if (p < 50) return "warn";
  return "ok";
}

export default function CoachHqPortefoljeDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Portefølje
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Spillerne dine <em className="italic text-primary">· 18 aktive.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          3 trenger oppfølging i dag · 2 milepæler oppnådd i uke 19 · 1 spiller pause.
        </p>
      </header>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-3.5">
        <Kpi dark label="Aktive spillere" value="18" det="14 GFGK · 4 Borre GK" />
        <Kpi label="Trenger oppf." value="3" valueColor="warning" det="flagget av agent" />
        <Kpi label="Milepæler U19" value="2" delta="uke 19" det="snitt 1,4 / uke" />
        <Kpi label="Mål-framdrift" value="72 %" delta="+4 %" det="portefølje-snitt" />
        <Kpi label="Sesjon i dag" value="4" delta="2 igjen" det="neste 14:30" />
      </div>

      <div className="grid grid-cols-[1fr_320px] items-start gap-5">
        <div>
          {/* Toolbar */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <div className="flex overflow-hidden rounded-md border border-border bg-card">
                {["Alle", "Aktive", "Risk", "Pause"].map((s, i) => (
                  <div
                    key={s}
                    className={`cursor-pointer border-r border-border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] last:border-r-0 ${i === 0 ? "bg-foreground text-background" : "text-muted-foreground"}`}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground">
              <Search size={14} strokeWidth={1.5} />
              <span>Søk navn, klubb, HCP…</span>
            </div>
            <div className="flex gap-1.5">
              <button className="inline-flex items-center gap-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium">
                <Filter size={14} strokeWidth={1.5} />
                Filter
              </button>
              <button className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground">
                <Plus size={14} strokeWidth={1.5} />
                Ny spiller
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-border bg-card">
            <div className="grid grid-cols-[42px_1.6fr_80px_1fr_100px_130px_90px_60px] gap-3.5 border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-4 py-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span />
              <span>Spiller</span>
              <span>HCP</span>
              <span>Mål-framdrift</span>
              <span>Tier</span>
              <span>Neste</span>
              <span>Status</span>
              <span />
            </div>
            {players.map((p) => (
              <PlayerRow key={p.name} player={p} />
            ))}
            <div className="bg-[var(--surface-alt,#F1EEE5)] px-4 py-2.5 text-center font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              Viser 10 av 18 · trykk for flere
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <SideCard title="Trenger oppfølging · 3">
            <Alert
              tone="dan"
              title="Jonas Nordby (U16 G)"
              body="Ingen sesjon på 10 dager. HCP +0,8 sist 4 runder. Foreldre uoppsøkt."
              who="Agent · 14.05 06:30"
            />
            <Alert
              tone="warn"
              title="Sondre K. — slow start"
              body="R2 Kongsberg: +3 etter 6 hull. Vurder pep-melding etter R2."
              who="Live-feed · 13:42"
            />
            <Alert
              tone="warn"
              title="Erik L. — ettersjekk skade"
              body="Fysio Mia ber om kort prat mtp. retur 24.05."
              who="Mia (fysio) · i går 18:14"
            />
          </SideCard>

          <SideCard title="Mål-fordeling · portefølje">
            <Dist label="på sporet" pct={67} count="12" />
            <Dist label="milepæl" pct={11} count="2" />
            <Dist label="treng oppf." pct={17} count="3" tone="warn" />
            <Dist label="risk" pct={5} count="1" tone="dan" />
          </SideCard>

          <SideCard title="Milepæler oppnådd · U19">
            <Alert tone="mil" title="Markus P. · HCP +2,4" body="SG approach > 0 i 5 rader. 66 % til hovedmål." who="14.05 · auto-bekreftet" />
            <Alert tone="mil" title="Linnea H. · HCP 10,2" body="Først under HCP 11. 68 % til mål." who="13.05 · auto-bekreftet" />
          </SideCard>
        </aside>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  det,
  dark = false,
  valueColor,
}: {
  label: string;
  value: string;
  delta?: string;
  det: string;
  dark?: boolean;
  valueColor?: "warning";
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-md border ${dark ? "border-transparent bg-gradient-to-br from-[#1A1916] to-[#2a2823] text-white" : "border-border bg-card"} p-4`}
    >
      <div className={`font-mono text-[9px] font-semibold uppercase tracking-[0.10em] ${dark ? "text-white/55" : "text-muted-foreground"}`}>
        {label}
      </div>
      <div
        className={`font-display text-[30px] font-medium leading-none tracking-tight ${dark ? "text-white" : valueColor === "warning" ? "text-[#B8852A]" : "text-foreground"}`}
      >
        {value}
        {delta && (
          <small className="ml-1 font-mono text-[11px] font-medium tracking-[0.02em] text-[#1A7D56]">{delta}</small>
        )}
      </div>
      <div className={`font-mono text-[10px] tracking-[0.02em] ${dark ? "text-white/55" : "text-muted-foreground"}`}>{det}</div>
    </div>
  );
}

function PlayerRow({ player: p }: { player: Player }) {
  const flagStyle: Record<Status, string> = {
    ok: "bg-[rgba(45,107,76,0.12)] text-[#1A7D56]",
    warn: "bg-[rgba(184,133,42,0.12)] text-[#7d5814]",
    dan: "bg-[rgba(176,68,68,0.10)] text-[#A32D2D]",
    mil: "bg-primary/10 text-primary",
  };
  const progStyle: Record<Progress, string> = {
    ok: "bg-primary",
    warn: "bg-[#B8852A]",
    danger: "bg-[#A32D2D]",
  };
  const progVar = progressVariant(p.progress, p.flagTone);
  return (
    <div className="grid cursor-pointer grid-cols-[42px_1.6fr_80px_1fr_100px_130px_90px_60px] items-center gap-3.5 border-b border-border px-4 py-3 text-[12px] last:border-b-0 hover:bg-[var(--surface-alt,#F1EEE5)]">
      <div className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${p.avGrad} font-display text-[11px] font-semibold text-white`}>
        {p.avatar}
      </div>
      <div className="font-medium leading-tight">
        {p.name}
        <small className="mt-0.5 block font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{p.team}</small>
      </div>
      <div className="font-mono text-[13px] font-semibold tracking-[0.02em]">
        {p.hcp}
        <small className={`mt-0.5 block font-mono text-[10px] font-medium ${p.deltaDown ? "text-[#1A7D56]" : "text-[#A32D2D]"}`}>{p.delta}</small>
      </div>
      <div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-border">
          <div className={`h-full rounded-full ${progStyle[progVar]}`} style={{ width: `${p.progress}%` }} />
        </div>
        <div className="mt-1 font-mono text-[9px] text-muted-foreground">{p.goal}</div>
      </div>
      <div
        className={`rounded-sm px-1.5 py-1 text-center font-mono text-[9px] font-bold tracking-[0.06em] ${p.tier === "PRO" ? "bg-primary/10 text-primary" : "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"}`}
      >
        {p.tier}
      </div>
      <div className="font-mono text-[11px] leading-snug tracking-[0.02em] text-muted-foreground">
        <b className="text-foreground">{p.next}</b>
        <br />
        {p.nextDetail}
      </div>
      <div className="flex flex-wrap gap-1">
        <span className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] ${flagStyle[p.flagTone]}`}>
          {p.flagText}
        </span>
      </div>
      <div className="text-right text-muted-foreground">
        <ChevronRight size={14} strokeWidth={1.5} />
      </div>
    </div>
  );
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-card p-4">
      <h4 className="mb-3 font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Alert({ tone, title, body, who }: { tone: Status; title: string; body: string; who: string }) {
  const styles: Record<Status, string> = {
    ok: "bg-[var(--surface-alt,#F1EEE5)] border-l-muted-foreground",
    warn: "bg-[rgba(184,133,42,0.06)] border-l-[#B8852A]",
    dan: "bg-[rgba(176,68,68,0.05)] border-l-[#A32D2D]",
    mil: "bg-primary/6 border-l-primary",
  };
  return (
    <div className={`mb-2 rounded-r-sm border-l-[3px] px-3 py-2.5 text-[12px] leading-relaxed last:mb-0 ${styles[tone]}`}>
      <b className="block text-[12px] font-semibold text-foreground">{title}</b>
      <div className="text-[11.5px] text-muted-foreground">{body}</div>
      <div className="mt-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{who}</div>
    </div>
  );
}

function Dist({ label, pct, count, tone = "ok" }: { label: string; pct: number; count: string; tone?: Status }) {
  const fill: Record<Status, string> = {
    ok: "bg-primary",
    warn: "bg-[#B8852A]",
    dan: "bg-[#A32D2D]",
    mil: "bg-primary",
  };
  return (
    <div className="grid grid-cols-[80px_1fr_30px] items-center gap-2.5 py-1 text-[11px]">
      <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">{label}</span>
      <div className="relative h-4 overflow-hidden rounded-sm bg-border">
        <div className={`h-full rounded-sm ${fill[tone]}`} style={{ width: `${pct}%` }} />
      </div>
      <b className="text-right font-mono font-semibold tracking-[0.02em]">{count}</b>
    </div>
  );
}
