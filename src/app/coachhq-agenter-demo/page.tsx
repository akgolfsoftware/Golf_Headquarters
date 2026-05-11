/**
 * PILOT — CoachHQ Agenter
 * Bygd fra wireframe/design-files-v2/screens/09-coachhq-agenter.html
 * URL: /coachhq-agenter-demo
 */

import {
  FileText,
  Clock,
  Users,
  Trophy,
  Receipt,
  type LucideIcon,
} from "lucide-react";

type AgentCard = {
  name: string;
  desc: string;
  icon: LucideIcon;
  iconStyle: string;
  status: "active" | "paused";
  actions30d: number;
  approved: number;
  approvedPct?: number;
  rejected: number;
  queued: number;
  aggressiveness: number;
  meta: string;
};

const agents: AgentCard[] = [
  {
    name: "Plan-watcher",
    desc: "Justerer plan basert på fremdrift",
    icon: FileText,
    iconStyle: "bg-primary/10 text-primary",
    status: "active",
    actions30d: 47,
    approved: 42,
    approvedPct: 89,
    rejected: 3,
    queued: 2,
    aggressiveness: 6,
    meta: "A/B vs v0,9 · siden 12.05",
  },
  {
    name: "Test-påminneren",
    desc: "Forvarsler tester før forfall",
    icon: Clock,
    iconStyle: "bg-[#FFF0D6] text-[#B8852A]",
    status: "active",
    actions30d: 23,
    approved: 22,
    approvedPct: 96,
    rejected: 1,
    queued: 7,
    aggressiveness: 8,
    meta: "A/B vs v1,1 · siden 03.05",
  },
  {
    name: "Coach-allokator",
    desc: "Foreslår coach-bytte ved kapasitet",
    icon: Users,
    iconStyle: "bg-secondary text-muted-foreground",
    status: "paused",
    actions30d: 0,
    approved: 0,
    rejected: 0,
    queued: 0,
    aggressiveness: 3,
    meta: "Pauset 06.05 av Anders",
  },
  {
    name: "Tournament-watch",
    desc: "Påmelding + taper-fase varsling",
    icon: Trophy,
    iconStyle: "bg-accent/20 text-primary",
    status: "active",
    actions30d: 12,
    approved: 11,
    approvedPct: 92,
    rejected: 1,
    queued: 1,
    aggressiveness: 5,
    meta: "Aktiv siden 28.04",
  },
  {
    name: "Faktura-følger",
    desc: "Forsinket-betaling oppfølging",
    icon: Receipt,
    iconStyle: "bg-destructive/10 text-destructive",
    status: "active",
    actions30d: 18,
    approved: 17,
    approvedPct: 94,
    rejected: 1,
    queued: 2,
    aggressiveness: 9,
    meta: "A/B vs v0,8 · siden 18.04",
  },
];

export default function CoachhqAgenterDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top */}
      <header className="border-b border-border px-10 py-7">
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Verktøy · Agenter
        </div>
        <h1 className="mt-2.5 font-display text-[36px] font-normal italic leading-[1.1] -tracking-[0.02em]">
          Agenter. 5.
        </h1>
        <p className="mt-1.5 max-w-[560px] text-[14px] leading-[1.5] text-muted-foreground">
          Fem agenter du faktisk stoler på. Tune, test, eller pause.
        </p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-5 px-10 py-7">
        {agents.map((a) => {
          const Icon = a.icon;
          const paused = a.status === "paused";
          return (
            <article
              key={a.name}
              className={`grid min-h-[240px] gap-4 rounded-lg border border-border bg-card p-6 shadow-sm ${
                paused ? "opacity-75" : ""
              }`}
            >
              {/* Header */}
              <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5">
                <span className={`grid h-11 w-11 place-items-center rounded-md ${a.iconStyle}`}>
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <div>
                  <div className="font-display text-[18px] font-bold leading-tight -tracking-[0.01em]">
                    {a.name}
                  </div>
                  <div className="mt-1 text-[13px] text-muted-foreground">{a.desc}</div>
                </div>
                {a.status === "active" ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/20 px-3 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-primary">
                    <span
                      className="h-2 w-2 rounded-full bg-accent"
                      style={{ boxShadow: "0 0 0 3px rgba(209,248,67,0.25)" }}
                    />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    Pause
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="rounded-sm border border-border bg-background px-3 py-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    Aksjoner 30 d
                  </div>
                  <div className="mt-1.5 font-mono text-[18px] tabular-nums">{a.actions30d}</div>
                </div>
                <div className="rounded-sm border border-border bg-background px-3 py-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    Godkjent
                  </div>
                  <div
                    className={`mt-1.5 font-mono text-[18px] tabular-nums ${
                      a.approvedPct ? "text-primary" : ""
                    }`}
                  >
                    {a.approved}
                    {a.approvedPct !== undefined && (
                      <sub className="ml-0.5 align-baseline text-[11px] text-muted-foreground">
                        {" "}
                        {a.approvedPct} %
                      </sub>
                    )}
                  </div>
                </div>
                <div className="rounded-sm border border-border bg-background px-3 py-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    Avvist
                  </div>
                  <div className="mt-1.5 font-mono text-[18px] tabular-nums">{a.rejected}</div>
                </div>
                <div className="rounded-sm border border-border bg-background px-3 py-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    I kø
                  </div>
                  <div className="mt-1.5 font-mono text-[18px] tabular-nums">{a.queued}</div>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-border pt-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      Aggressivitet
                    </div>
                    <div className="font-mono text-[13px] font-semibold tabular-nums">
                      {a.aggressiveness} / 10
                    </div>
                  </div>
                  <div className="relative mt-2 h-1.5 rounded-full bg-secondary">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${a.aggressiveness * 10}%`,
                        background: paused
                          ? "var(--color-muted-foreground)"
                          : "linear-gradient(90deg, var(--color-accent), var(--color-accent))",
                      }}
                    />
                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card shadow-sm"
                      style={{
                        left: `${a.aggressiveness * 10}%`,
                        borderColor: paused ? "var(--color-muted-foreground)" : "var(--color-primary)",
                      }}
                    />
                  </div>
                </div>
                <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {a.meta}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-10 py-4.5">
        <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
          Sist deployment 11.05.26 14:32 · v1.4.2 · ML-confidence 0,86
        </span>
        <button className="h-10 rounded-sm border border-destructive bg-card px-4 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/10">
          Globalstopp
        </button>
      </footer>
    </div>
  );
}
