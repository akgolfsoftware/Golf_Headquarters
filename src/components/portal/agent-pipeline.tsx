import { Activity, Calendar, Moon, Target } from "lucide-react";

/**
 * AgentPipeline — viser signal → skill → agent-grafen for PlayerHQ.
 * Designet etter wireframe/design-package/project/screens/03-playerhq-agent-pipeline.html
 *
 * Tre kolonner: SIGNAL (220px) · SKILL (200px) · AGENT (88px), forbundet med
 * linjer. Aktive noder/linjer pulserer i lime accent. Server-renderbar — alt
 * input kommer som props, ingen klient-state.
 */

export type PipelineSignal = {
  id: string;
  label: string;
  icon: "trackman" | "hcp" | "sleep" | "live";
  active?: boolean;
};

export type PipelineSkill = {
  id: string;
  title: string;
  description: string;
  /** signal-IDer som mater denne skillen */
  inputs: string[];
  active?: boolean;
};

export type PipelineAgent = {
  id: string;
  shortLabel: string;
  icon: "drill" | "period" | "deload";
  /** skill-IDer som mater denne agenten */
  inputs: string[];
  active?: boolean;
};

type Props = {
  signals: PipelineSignal[];
  skills: PipelineSkill[];
  agents: PipelineAgent[];
  lastUpdated?: string;
  recommendationsCount?: number;
};

const SIGNAL_ICONS = {
  trackman: Target,
  hcp: Activity,
  sleep: Moon,
  live: Activity,
} as const;

const AGENT_ICONS = {
  drill: Target,
  period: Calendar,
  deload: Activity,
} as const;

export function AgentPipeline({
  signals,
  skills,
  agents,
  lastUpdated,
  recommendationsCount,
}: Props) {
  // Posisjons-mapping etter index — fast layout som matcher wireframe.
  // Signal-rader: 24, 96, 168, 240. Skill-rader: 24, 156. Agent-rader: 24, 156, 288.
  const SIG_TOPS = [24, 96, 168, 240];
  const SKILL_TOPS = [24, 156];
  const AGENT_TOPS = [24, 156, 288];

  const sigPos = new Map(signals.map((s, i) => [s.id, SIG_TOPS[i] ?? 24]));
  const skillPos = new Map(skills.map((s, i) => [s.id, SKILL_TOPS[i] ?? 24]));
  const agentPos = new Map(agents.map((a, i) => [a.id, AGENT_TOPS[i] ?? 24]));

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            AI Agent Pipeline
          </div>
          <h2 className="mt-1 font-display text-[20px] font-medium -tracking-[0.01em] text-foreground">
            Signal → Skill → Agent
          </h2>
        </div>
        {lastUpdated && (
          <div className="font-mono text-[11px] text-muted-foreground">
            Sist oppdatert: {lastUpdated}
          </div>
        )}
      </header>

      {/* Grid med kolonne-labels */}
      <div className="relative mx-auto mb-2 grid h-6 max-w-[1120px] grid-cols-[220px_1fr_88px] gap-8 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span>Signal</span>
        <span>Skill</span>
        <span className="text-right">Agent</span>
      </div>

      <div className="relative mx-auto h-[360px] w-full max-w-[1120px]">
        {/* Linjer SIGNAL → SKILL */}
        {signals.map((sig) => {
          const top = sigPos.get(sig.id) ?? 24;
          // Tegn linje fra signal til hver skill som tar inn dette signalet
          return skills
            .filter((sk) => sk.inputs.includes(sig.id))
            .map((sk) => {
              const skTop = skillPos.get(sk.id) ?? 24;
              const isActive = sig.active && sk.active;
              return (
                <Line
                  key={`${sig.id}-${sk.id}`}
                  left={36}
                  top={top + 16}
                  width={280}
                  toTop={skTop + 50}
                  active={isActive}
                />
              );
            });
        })}

        {/* Linjer SKILL → AGENT */}
        {skills.map((sk) => {
          const top = skillPos.get(sk.id) ?? 24;
          return agents
            .filter((ag) => ag.inputs.includes(sk.id))
            .map((ag) => {
              const agTop = agentPos.get(ag.id) ?? 24;
              const isActive = sk.active && ag.active;
              return (
                <Line
                  key={`${sk.id}-${ag.id}`}
                  left={520}
                  top={top + 50}
                  width={480}
                  toTop={agTop + 44}
                  active={isActive}
                />
              );
            });
        })}

        {/* Signal-noder */}
        {signals.map((sig) => {
          const Icon = SIGNAL_ICONS[sig.icon];
          const top = sigPos.get(sig.id) ?? 24;
          return (
            <div
              key={sig.id}
              className={`absolute left-0 flex w-[220px] items-center gap-2 text-[13px] ${
                sig.active ? "text-foreground" : "text-foreground/55"
              }`}
              style={{ top }}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full border bg-secondary ${
                  sig.active
                    ? "border-accent text-accent shadow-[0_0_0_4px_rgba(209,248,67,0.08)]"
                    : "border-border text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              {sig.label}
            </div>
          );
        })}

        {/* Skill-noder */}
        {skills.map((sk) => {
          const top = skillPos.get(sk.id) ?? 24;
          return (
            <div
              key={sk.id}
              className={`absolute flex h-[100px] w-[200px] flex-col justify-center gap-1 rounded-xl border p-4 ${
                sk.active
                  ? "border-accent bg-[rgba(209,248,67,0.04)]"
                  : "border-border bg-secondary"
              }`}
              style={{ left: 320, top }}
            >
              <h4 className="font-sans text-[14px] font-semibold text-foreground">
                {sk.title}
              </h4>
              <p className="font-sans text-[11px] leading-[1.4] text-muted-foreground">
                {sk.description}
              </p>
            </div>
          );
        })}

        {/* Agent-noder */}
        {agents.map((ag) => {
          const Icon = AGENT_ICONS[ag.icon];
          const top = agentPos.get(ag.id) ?? 24;
          return (
            <div
              key={ag.id}
              className={`absolute right-0 flex h-[88px] w-[88px] flex-col items-center justify-center gap-0.5 rounded-full border-2 ${
                ag.active
                  ? "border-accent bg-secondary text-primary shadow-[0_0_0_6px_rgba(209,248,67,0.08),0_0_24px_rgba(209,248,67,0.35)]"
                  : "border-border bg-secondary text-foreground"
              }`}
              style={{ top }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              <span className="font-mono text-[9px] tracking-[0.06em]">
                {ag.shortLabel}
              </span>
            </div>
          );
        })}
      </div>

      {(recommendationsCount != null || true) && (
        <footer className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="font-mono text-[11.5px] text-muted-foreground">
            {recommendationsCount ?? 0} anbefalinger siste 7 dager
          </div>
        </footer>
      )}
    </section>
  );
}

function Line({
  left,
  top,
  width,
  toTop,
  active,
}: {
  left: number;
  top: number;
  width: number;
  toTop: number;
  active?: boolean;
}) {
  // Diagonal-linje via inline SVG path, slik at vi kan koble noder på ulike y-koord.
  const dx = width;
  const dy = toTop - top;
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left, top, width, height: Math.max(2, Math.abs(dy) + 4) }}
      viewBox={`0 0 ${width} ${Math.max(2, Math.abs(dy) + 4)}`}
    >
      <line
        x1={0}
        y1={dy < 0 ? Math.abs(dy) : 0}
        x2={dx}
        y2={dy < 0 ? 0 : dy}
        stroke={active ? "hsl(var(--accent))" : "hsl(var(--border))"}
        strokeWidth={active ? 2 : 1.5}
        strokeDasharray={active ? "6 6" : undefined}
      >
        {active && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-24"
            dur="1.4s"
            repeatCount="indefinite"
          />
        )}
      </line>
    </svg>
  );
}
