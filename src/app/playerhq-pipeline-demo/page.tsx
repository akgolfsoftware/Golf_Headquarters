/**
 * PILOT — PlayerHQ Agent Pipeline
 * Bygd fra wireframe/design-files-v2/screens/05-playerhq-agent-pipeline.html
 * URL: /playerhq-pipeline-demo
 *
 * Sidebar/rail/shell er strippet — kun produksjons-skjermen.
 */

import {
  TrendingUp,
  Target,
  Activity,
  MapPin,
  Award,
  Heart,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type Signal = {
  icon: LucideIcon;
  name: string;
  detail: string;
  firing: boolean;
};

type Skill = {
  name: string;
  desc: string;
  last: string;
};

type Recommendation = {
  label: string;
  title: string;
  desc: string;
  cta: string;
  active: boolean;
};

const signals: Signal[] = [
  { icon: TrendingUp, name: "HCP-utvikling", detail: "12,4 → 11,8 på 30 d", firing: true },
  { icon: Target, name: "Mål-status", detail: "70 % mot sesongmål", firing: false },
  { icon: Activity, name: "Trenings-frekvens", detail: "4 økter denne uka", firing: true },
  { icon: MapPin, name: "Bane-data", detail: "5 nye runder logget", firing: false },
  { icon: Award, name: "Test-resultater", detail: "NGF-batch oppdatert", firing: false },
  { icon: Heart, name: "Helse", detail: "Søvn-score 76", firing: false },
];

const skills: Skill[] = [
  { name: "Plan-analyse", desc: "Vurderer fremdrift mot mål", last: "Sist: 8 m siden" },
  { name: "Volum-analyse", desc: "Sjekker rep-tetthet over tid", last: "Sist: 15 m siden" },
  { name: "Talent-projeksjon", desc: "Estimerer 6 mnd HCP", last: "Sist: 2 t siden" },
  { name: "Konkurranse-vekting", desc: "Topp-form-timing før kamp", last: "Sist: 1 d siden" },
];

const recommendations: Recommendation[] = [
  {
    label: "Plan-justering",
    title: "Øk putte-volum 20 % neste uke",
    desc: "Basert på lav putte-tetthet siste 14 d.",
    cta: "Se forslag",
    active: true,
  },
  {
    label: "Test-påminnelse",
    title: "NGF-test forfaller om 3 dager",
    desc: "Book tid hos Anders før 14. mai.",
    cta: "Book test",
    active: true,
  },
  {
    label: "Coaching-input",
    title: "Spør Anders om driver-tipp",
    desc: "Driver-presisjon har gått ned 4 %.",
    cta: "Send melding",
    active: false,
  },
];

export default function PlayerhqPipelineDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border px-10 py-6">
        <div>
          <div className="text-[13px] text-muted-foreground">
            Coach <span className="opacity-50">›</span> Agent-pipeline
          </div>
          <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.1] -tracking-[0.02em]">
            <em className="font-medium italic">Agent</em>-pipeline
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">Hvordan systemet leser deg.</p>
        </div>
        <div className="font-mono text-[12px] tabular-nums text-muted-foreground">
          Sist oppdatert 14:32
        </div>
      </header>

      {/* Board */}
      <div className="relative grid grid-cols-[320px_1fr_320px_1fr_320px] items-start gap-0 px-10 py-8">
        {/* SVG line layer */}
        <svg
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
          viewBox="0 0 1180 720"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M300 60 C 390 60, 390 120, 480 120" stroke="rgba(10,31,24,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M300 140 C 390 140, 390 140, 480 140" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="6 5" fill="none" />
          <path d="M300 220 C 390 220, 390 240, 480 240" stroke="rgba(10,31,24,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M300 300 C 390 300, 390 240, 480 240" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="6 5" fill="none" />
          <path d="M300 380 C 390 380, 390 360, 480 360" stroke="rgba(10,31,24,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M300 460 C 390 460, 390 480, 480 480" stroke="rgba(10,31,24,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M700 140 C 790 140, 790 130, 880 130" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="6 5" fill="none" />
          <path d="M700 240 C 790 240, 790 130, 880 130" stroke="rgba(10,31,24,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M700 360 C 790 360, 790 280, 880 280" stroke="rgba(10,31,24,0.08)" strokeWidth="1.5" fill="none" />
          <path d="M700 360 C 790 360, 790 290, 880 290" stroke="var(--color-pyr-slag)" strokeWidth="2" strokeDasharray="6 5" fill="none" />
          <path d="M700 480 C 790 480, 790 440, 880 440" stroke="rgba(10,31,24,0.08)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Col 1 — Signals */}
        <div className="relative z-[2] flex flex-col gap-5">
          <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Signaler · <b className="text-foreground">6</b>
          </div>
          {signals.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="relative grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <div>
                  <div className="text-[14px] font-semibold leading-tight">{s.name}</div>
                  <div className="mt-1 font-mono text-[12px] tabular-nums text-muted-foreground">
                    {s.detail}
                  </div>
                </div>
                {s.firing && (
                  <span
                    className="h-2 w-2 rounded-full bg-accent"
                    style={{ boxShadow: "0 0 0 4px rgba(209,248,67,0.25)" }}
                    aria-label="aktiv"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div />

        {/* Col 2 — Skills */}
        <div className="relative z-[2] flex flex-col gap-8 pt-4">
          <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Skills · <b className="text-foreground">4</b>
          </div>
          {skills.map((s) => (
            <div key={s.name} className="rounded-2xl border border-border bg-secondary p-5">
              <div className="text-[15px] font-semibold leading-tight">{s.name}</div>
              <div className="mt-1.5 text-[13px] text-muted-foreground">{s.desc}</div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.02em] text-muted-foreground">
                {s.last}
              </div>
            </div>
          ))}
        </div>

        <div />

        {/* Col 3 — Recommendations */}
        <div className="relative z-[2] flex flex-col gap-10 pt-8">
          <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Anbefalinger · <b className="text-foreground">3</b>
          </div>
          {recommendations.map((r) => (
            <div
              key={r.title}
              className={`relative rounded-2xl border bg-card p-5 shadow-sm ${
                r.active
                  ? "border-2 border-accent"
                  : "border border-border"
              }`}
              style={
                r.active
                  ? { boxShadow: "0 0 0 4px rgba(209,248,67,0.15)" }
                  : undefined
              }
            >
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-primary">
                {r.label}
              </div>
              <div className="mt-1.5 font-display text-[16px] font-semibold leading-tight -tracking-[0.01em]">
                {r.title}
              </div>
              <div className="mt-1.5 text-[13px] text-muted-foreground">{r.desc}</div>
              <button className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary">
                {r.cta}
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-10 py-4 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent"
            style={{ boxShadow: "0 0 0 3px rgba(209,248,67,0.25)" }}
          />
          Live · Sist oppdatert 14:32
        </span>
        <span>
          Spørsmål? <a className="font-semibold text-primary" href="#anders">Snakk med Anders →</a>
        </span>
      </footer>
    </div>
  );
}
