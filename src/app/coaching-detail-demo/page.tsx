/**
 * DEMO — PlayerHQ Coaching-plan-detalj
 * Spec: design2.0/06-playerhq-B/spec.md (Pakke 3/5)
 * URL: /coaching-detail-demo
 *
 * Default state: Plan-tab, foran skjema, lyst tema. Ingen sidebar/shell.
 */

import {
  Play,
  Edit3,
  ArrowUpRight,
  ChevronRight,
  Quote,
  Target,
  Calendar,
  TrendingUp,
} from "lucide-react";

const TABS = ["Plan", "Faser", "Økter", "Tester", "Mål"] as const;

const WEEK_TASKS = [
  { day: "I dag · man", title: "TEK 1:1 Pitch 50–100 m", time: "14:00", type: "TEK" },
  { day: "Tirsdag", title: "Sand-test 30 m", time: "10:00", type: "TEST" },
  { day: "Onsdag", title: "SPILL 9-hulls", time: "16:00", type: "SPILL" },
  { day: "Torsdag", title: "FYS 60 min", time: "07:30", type: "FYS" },
  { day: "Fredag", title: "TEK 1:1 Driver-baseline", time: "14:00", type: "TEK" },
];

export default function CoachingDetailDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <button className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
            Coaching-planer
          </button>

          <div className="flex flex-wrap items-start gap-6">
            <div className="relative shrink-0">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-mono text-[22px] font-semibold text-primary-foreground ring-4 ring-accent">
                AK
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Aktiv coaching-plan
              </span>
              <h1 className="mt-1 font-display text-[36px] italic font-medium leading-[1.05] tracking-tight">
                Sommer-toppform
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Coachet av Anders K · 9. mai – 30. juni · Fase 3 av 5
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatPill label="Ferdige økter" value="13 / 19" />
                <StatPill label="I dag" value="Pitch 50–100 m" tone="accent" />
                <StatPill label="Til neste test" value="3 d" />
                <StatPill label="Til peak" value="21 d" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90">
                <Play size={16} strokeWidth={1.5} />
                Start dagens økt
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Edit3 size={16} strokeWidth={1.5} />
                Be om endring
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="mb-6 flex gap-1 border-b border-border">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`relative px-4 py-3 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Insight-banner */}
        <div className="mb-6 flex items-center gap-3 rounded-md border border-accent/50 bg-accent/15 px-5 py-4">
          <TrendingUp size={18} strokeWidth={1.5} className="text-foreground" />
          <p className="text-[14px] text-foreground">
            Du er <b>2 dager foran skjema</b> basert på adherence siste 14 dager. Hold tempoet.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Plan-overview */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6 lg:col-span-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Plan-oversikt
                </div>
                <h2 className="mt-1 font-display text-[20px] font-semibold leading-snug">
                  Sommer-toppform
                </h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Coach: Anders Kristiansen · 9. mai – 30. juni
                </p>
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:underline"
              >
                Se hele planen
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </a>
            </div>

            {/* Periode-stripe med fase-markører */}
            <div className="mt-6">
              <div className="relative h-2 w-full rounded-full bg-secondary">
                <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: "64%" }} />
                {[20, 40, 60, 80].map((p) => (
                  <span
                    key={p}
                    className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-border"
                    style={{ left: `${p}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-5 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                <span>F1 · base</span>
                <span>F2 · build</span>
                <span className="font-semibold text-foreground">F3 · spes</span>
                <span>F4 · peak</span>
                <span>F5 · taper</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-md bg-secondary/60 px-4 py-3">
              <span className="text-[12px] text-muted-foreground">Fremdrift</span>
              <span className="font-mono text-[14px] font-semibold tabular-nums">64 %</span>
            </div>
          </section>

          {/* Coach-quote */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6 lg:col-span-4">
            <Quote size={20} strokeWidth={1.5} className="text-accent" />
            <p className="mt-3 font-display text-[18px] italic leading-snug text-foreground">
              «Markus, vi har tre uker til Sørlandsåpent. Konsentrer deg om pitch 50–100 m — det er
              hovedforskjellen mellom 5. og 1. plass.»
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                AK
              </div>
              <div>
                <div className="text-[12px] font-semibold leading-none">Anders Kristiansen</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">8. mai · 16:42</div>
              </div>
            </div>
          </section>

          {/* Hva du skal gjøre denne uka */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Denne uka · 13. – 17. mai
                </div>
                <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                  Hva du skal gjøre
                </h3>
              </div>
              <Calendar size={16} strokeWidth={1.5} className="text-muted-foreground" />
            </div>

            <ul className="divide-y divide-border rounded-md border border-border">
              {WEEK_TASKS.map((t, i) => (
                <li
                  key={t.title}
                  className="grid grid-cols-[110px_1fr_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary/60"
                >
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.08em] ${
                      i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t.day}
                  </span>
                  <div className="flex items-center gap-2">
                    <TypeTag type={t.type} />
                    <span className="text-[13px] font-medium">{t.title}</span>
                  </div>
                  <span className="font-mono text-[12px] tabular-nums text-muted-foreground">{t.time}</span>
                  <button className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <ArrowUpRight size={14} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Goals */}
          <section className="col-span-12 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Target size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Plan-mål
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Goal title="Pitch-konsistens" value="80 %" sub="SD under 1,5 m fra 75 m" />
              <Goal title="HCP-mål" value="+1,8" sub="ned fra +2,4" />
              <Goal title="SG-approach" value="+0,4" sub="snitt over 8 runder" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "accent";
}) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    muted: "bg-secondary text-foreground border-border",
    accent: "bg-accent/30 text-foreground border-accent/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${styles[tone]}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
    </span>
  );
}

function TypeTag({ type }: { type: string }) {
  const map: Record<string, string> = {
    FYS: "bg-[#E5F1EA] text-[#16A34A]",
    TEK: "bg-primary/10 text-primary",
    SLAG: "bg-accent/30 text-foreground",
    SPILL: "bg-[#FBF1D9] text-[#B8852A]",
    TURN: "bg-secondary text-muted-foreground",
    TEST: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold ${map[type] ?? "bg-secondary"}`}>
      {type}
    </span>
  );
}

function Goal({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-4">
      <div className="text-[12px] font-medium text-muted-foreground">{title}</div>
      <div className="mt-2 font-mono text-[22px] font-semibold tabular-nums leading-none">{value}</div>
      <div className="mt-2 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
