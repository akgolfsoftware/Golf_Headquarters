/**
 * PILOT — Admin Agent-pipeline Overview
 * Bygd fra wireframe/design-files-v2/screens/06-agent-pipeline-overview.html
 * URL: /agent-pipeline-overview-demo
 *
 * Sidebar/rail strippet — kun produksjons-skjermen.
 */

import {
  TrendingUp,
  Activity,
  Target,
  CalendarDays,
  Award,
  MapPin,
  Heart,
  Trophy,
  type LucideIcon,
} from "lucide-react";

type Signal = {
  icon: LucideIcon;
  name: string;
  detail: string;
  active: boolean;
};

type Skill = {
  name: string;
  desc: string;
  last: string;
};

type Agent = {
  name: string;
  desc: string;
  queue: string;
  active: boolean;
  zero?: boolean;
};

const signals: Signal[] = [
  { icon: TrendingUp, name: "HCP-trend", detail: "12 spillere", active: false },
  { icon: Activity, name: "Aktivitets-data", detail: "Live · 47 spillere", active: true },
  { icon: Target, name: "Mål-status", detail: "30 mål tracked", active: false },
  { icon: CalendarDays, name: "Booking-mønster", detail: "Siste 90 d", active: true },
  { icon: Award, name: "Test-resultater", detail: "NGF-batch", active: false },
  { icon: MapPin, name: "Bane-data", detail: "47 runder", active: false },
  { icon: Heart, name: "Helse-tracker", detail: "12 koblet", active: false },
  { icon: Trophy, name: "Konkurranse-res.", detail: "Siste 12 mnd", active: true },
];

const skills: Skill[] = [
  { name: "Plan-analyse", desc: "Fremdrift mot mål", last: "Sist anbefalt 8 m siden" },
  { name: "Volum-analyse", desc: "Rep-tetthet over tid", last: "Sist anbefalt 15 m siden" },
  { name: "Talent-projeksjon", desc: "6 mnd HCP-estimat", last: "Sist anbefalt 2 t siden" },
  { name: "Konkurranse-vekting", desc: "Topp-form-timing", last: "Sist anbefalt 1 d siden" },
  { name: "Klubb-kapasitet", desc: "Coach-belegg", last: "Sist anbefalt 22 m siden" },
];

const agents: Agent[] = [
  { name: "Plan-watcher", desc: "Justerer plan basert på fremdrift", queue: "3 aksjoner i kø", active: true },
  { name: "Test-påminneren", desc: "Forvarsler tester", queue: "7 ute", active: false },
  { name: "Coach-allokator", desc: "Foreslår coach-bytte", queue: "0 i kø", active: false, zero: true },
  { name: "Tournament-watch", desc: "Påmelding + taper-fase", queue: "1 i kø", active: false },
  { name: "Faktura-følger", desc: "Forsinket-betaling", queue: "2 i kø", active: false },
];

export default function AgentPipelineOverviewDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border px-9 py-6">
        <div>
          <div className="text-[13px] text-muted-foreground">
            Verktøy <span className="opacity-50">›</span> Agenter <span className="opacity-50">›</span>{" "}
            <b className="font-semibold text-foreground">Pipeline</b>
          </div>
          <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.1] -tracking-[0.02em]">
            <em className="font-medium italic">Agent</em>-pipeline — System Overview
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">Hvordan signaler blir til handling.</p>
        </div>
        <div>
          <div className="inline-flex gap-0.5 rounded-full border border-border bg-secondary p-1">
            <button className="rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-accent-foreground shadow-sm">
              Live
            </button>
            <button className="rounded-full px-4 py-2 text-[12px] font-medium text-muted-foreground">
              Statisk
            </button>
            <button className="rounded-full px-4 py-2 text-[12px] font-medium text-muted-foreground">
              Replay
            </button>
          </div>
          <div className="mt-2 text-right font-mono text-[12px] tabular-nums text-muted-foreground">
            <span
              className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle"
              style={{ boxShadow: "0 0 0 3px rgba(209,248,67,0.25)" }}
            />
            Sist 14:32:18 · 3 aktive ruter
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="relative grid grid-cols-[1fr_60px_1fr_60px_1fr] items-start px-9 py-7">
        {/* SVG wires */}
        <svg
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
          viewBox="0 0 1180 720"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M300 38 C 360 38, 360 60, 420 60" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M300 110 C 360 110, 360 60, 420 60" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="5 4" fill="none" />
          <path d="M300 180 C 360 180, 360 160, 420 160" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M300 254 C 360 254, 360 160, 420 160" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="5 4" fill="none" />
          <path d="M300 322 C 360 322, 360 260, 420 260" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M300 392 C 360 392, 360 360, 420 360" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M300 462 C 360 462, 360 460, 420 460" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M300 532 C 360 532, 360 460, 420 460" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="5 4" fill="none" />
          <path d="M700 60 C 760 60, 760 50, 820 50" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="5 4" fill="none" />
          <path d="M700 160 C 760 160, 760 50, 820 50" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M700 160 C 760 160, 760 170, 820 170" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M700 260 C 760 260, 760 290, 820 290" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M700 360 C 760 360, 760 290, 820 290" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="5 4" fill="none" />
          <path d="M700 360 C 760 360, 760 410, 820 410" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M700 460 C 760 460, 760 530, 820 530" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Col 1 — Signals */}
        <div className="relative z-[2] flex min-w-0 flex-col gap-3">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Signaler · <b className="text-foreground">8</b>
          </div>
          {signals.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className={`relative grid grid-cols-[28px_1fr] items-center gap-2.5 rounded-xl border bg-card px-3.5 py-2.5 shadow-sm ${
                  s.active ? "border-accent" : "border-border"
                }`}
                style={s.active ? { boxShadow: "0 0 0 2px rgba(209,248,67,0.25)" } : undefined}
              >
                <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary/10 text-primary">
                  <Icon size={16} strokeWidth={1.5} />
                </span>
                <div>
                  <div className="text-[13px] font-semibold leading-tight">{s.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {s.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div />

        {/* Col 2 — Skills */}
        <div className="relative z-[2] flex min-w-0 flex-col gap-4 pt-4">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Skills · <b className="text-foreground">5</b>
          </div>
          {skills.map((s) => (
            <div key={s.name} className="rounded-xl border border-border bg-secondary px-4 py-3.5">
              <div className="text-[14px] font-semibold leading-tight">{s.name}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">{s.desc}</div>
              <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">{s.last}</div>
            </div>
          ))}
        </div>

        <div />

        {/* Col 3 — Agents */}
        <div className="relative z-[2] flex min-w-0 flex-col gap-6 pt-2">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Agenter · <b className="text-foreground">5</b>
          </div>
          {agents.map((a) => (
            <div
              key={a.name}
              className={`flex flex-col gap-1 rounded-xl border bg-card px-4 py-4 shadow-sm ${
                a.active ? "border-2 border-accent" : "border border-border"
              }`}
              style={a.active ? { boxShadow: "0 0 0 4px rgba(209,248,67,0.12)" } : undefined}
            >
              <div className="font-display text-[16px] font-bold leading-tight -tracking-[0.01em]">
                {a.name}
              </div>
              <div className="text-[12px] text-muted-foreground">{a.desc}</div>
              <div
                className={`mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.02em] ${
                  a.zero ? "text-muted-foreground" : "text-primary"
                }`}
              >
                {a.zero ? "○" : "●"} {a.queue}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-9 py-4 text-[12px] text-muted-foreground">
        <span>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent"
              style={{ boxShadow: "0 0 0 3px rgba(209,248,67,0.25)" }}
            />
            Live
          </span>
          {" · "}
          <span className="font-mono tabular-nums">14:32:18</span> · 3 aktive ruter · 7 anbefalinger ventet siden 06:00
        </span>
        <span className="flex gap-5">
          <a className="font-semibold text-primary" href="#snapshot">Eksporter snapshot →</a>
          <a className="font-semibold text-primary" href="#feedback">Send agent-feedback →</a>
        </span>
      </footer>
    </div>
  );
}
