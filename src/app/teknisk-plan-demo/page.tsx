/**
 * PILOT — CoachHQ Teknisk plan / roadmap
 * Bygd fra wireframe/design-files-v2/screens/29-coachhq-teknisk-plan.html
 * URL: /teknisk-plan-demo
 *
 * Intern admin-skjerm for org-eier: roadmap, burn-down, perf-budget.
 */

import { ChevronDown, ChevronRight, Plus } from "lucide-react";

type EpicStatus = "Levert" | "Pågår" | "Ikke startet" | "Spec'd" | "Forslag";
type EpicKind = "F" | "B" | "I" | "A" | "D";

interface Epic {
  kind: EpicKind;
  name: string;
  tags: { label: string; tone?: "default" | "api" | "dep" }[];
  effort: string;
  status: EpicStatus;
  expanded?: boolean;
  desc?: string;
  subTasks?: { done: "done" | "progress" | "todo"; label: string; meta: string }[];
}

interface Quarter {
  label: string;
  badge: "Nå" | "Neste" | "Backlog" | "Levert";
  span: string;
  epics: Epic[];
  more?: string;
}

const QUARTERS: Quarter[] = [
  {
    label: "Q3 · 2026",
    badge: "Nå",
    span: "jul · aug · sep · 42 dager igjen",
    epics: [
      {
        kind: "F",
        name: "Live Tapper v2 — flerkamera + slowmo",
        tags: [{ label: "Feature" }, { label: "api: capture/v2", tone: "api" }, { label: "eier: Markus" }],
        effort: "8d / 13d",
        status: "Pågår",
      },
      {
        kind: "B",
        name: "Booking 2.0 — gruppe-booking + venteliste",
        tags: [
          { label: "Backend" },
          { label: "avh: Auth migration", tone: "dep" },
          { label: "api: book/v3", tone: "api" },
          { label: "eier: Emil" },
        ],
        effort: "14d / 21d",
        status: "Pågår",
        expanded: true,
        desc: "Booking-modellen håndterer i dag kun 1:1. Vi rebuilder for gruppe-økter (Pro-team), venteliste og betal-først flow. Avhenger av Auth-migrasjonen (ferdig 18. juli) før den kan deploye.",
        subTasks: [
          { done: "done", label: "Datamodell migrert (3 nye tabeller)", meta: "02. mai" },
          { done: "done", label: "API-spec /book/v3 godkjent", meta: "07. mai" },
          { done: "progress", label: "Gruppe-booking POST endpoint", meta: "pågår — 60 %" },
          { done: "todo", label: "Venteliste-state machine", meta: "ikke startet" },
          { done: "todo", label: "Betal-først flow (Stripe Connect)", meta: "blokkert av Auth" },
          { done: "todo", label: "UI-integrasjon CoachHQ + PlayerHQ", meta: "spec'd" },
        ],
      },
      {
        kind: "I",
        name: "Auth-migrasjon — Auth0 til eget IdP",
        tags: [{ label: "Infra" }, { label: "eier: Lars" }, { label: "blokker: Booking 2.0, SSO", tone: "dep" }],
        effort: "9d / 12d",
        status: "Pågår",
      },
      {
        kind: "A",
        name: "Skade-Agent v2.2 — RPE-input",
        tags: [{ label: "Agent" }, { label: "api: agents/v1", tone: "api" }, { label: "eier: Sara" }],
        effort: "4d / 5d",
        status: "Levert",
      },
      {
        kind: "F",
        name: "Foreldre-portal phase 2 — leveranser",
        tags: [{ label: "Feature" }, { label: "eier: Julie" }],
        effort: "0d / 8d",
        status: "Ikke startet",
      },
      {
        kind: "D",
        name: "Design-tokens v3 — semantisk lag",
        tags: [{ label: "DevEx" }, { label: "eier: Sara" }],
        effort: "3d / 5d",
        status: "Pågår",
      },
    ],
    more: "+ 6 epics til i Q3 · klikk for å se alle",
  },
  {
    label: "Q4 · 2026",
    badge: "Neste",
    span: "okt · nov · des",
    epics: [
      {
        kind: "F",
        name: "Periodiserings-Agent v2 — multi-spiller plan",
        tags: [{ label: "Agent" }, { label: "avh: Auth", tone: "dep" }],
        effort: "— / 18d",
        status: "Spec'd",
      },
      {
        kind: "F",
        name: "SSO for klubber — Google + Microsoft",
        tags: [{ label: "Feature" }, { label: "avh: Auth", tone: "dep" }],
        effort: "— / 10d",
        status: "Spec'd",
      },
      {
        kind: "I",
        name: "Event-bus → Kafka",
        tags: [{ label: "Infra" }, { label: "eier: Lars" }],
        effort: "— / 15d",
        status: "Spec'd",
      },
    ],
    more: "+ 5 epics til i Q4",
  },
];

const STACK = [
  { k: "Frontend", v: "Next 16 · React 19" },
  { k: "Backend", v: "Hono · Node 22" },
  { k: "DB", v: "Postgres 16 (Supabase)" },
  { k: "Auth", v: "Supabase Auth → migrerer" },
  { k: "Agents", v: "Claude Opus 4.7 · GPT-5" },
  { k: "Hosting", v: "Vercel (oslo)" },
  { k: "CDN", v: "Cloudflare" },
];

const PERF = [
  { l: "p50 LCP", v: "1,1 s", pct: 42, tone: "ok" as const },
  { l: "p95 LCP", v: "2,4 s", pct: 72, tone: "default" as const },
  { l: "p99 API", v: "840 ms", pct: 88, tone: "warn" as const },
  { l: "Uptime", v: "99,97 %", pct: 99, tone: "ok" as const },
  { l: "Error rate", v: "0,02 %", pct: 8, tone: "ok" as const },
];

const BURN = [90, 78, 70, 62, 48, 38, 28, 18, 8];

export default function TekniskPlanDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            CoachHQ · Intern · Teknisk plan
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Teknisk plan. <em className="font-normal italic">Hvor stacken går neste 12 måneder.</em>
          </h1>
          <p className="mt-3 max-w-[720px] text-[14px] text-muted-foreground">
            Intern — kun synlig for Anders Kristiansen (org-eier) og hovedcoach. Synkronisert med Linear hver natt. Sist sync 11. mai 03:00.
          </p>
        </header>

        <div className="grid grid-cols-[1fr_320px] items-start gap-6">
          {/* Roadmap */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-[22px] font-semibold tracking-tight">
                  Roadmap. <em className="font-normal italic text-muted-foreground">Q2 → Q4 2026 og Q1 2027.</em>
                </h2>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  42 epics totalt · 18 levert · 12 pågår · 12 spec'd · last pull 03:00
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
                  Eksporter PDF
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  Ny epic
                </button>
              </div>
            </div>

            {/* Quarter overview */}
            <div className="grid grid-cols-4 gap-3 rounded-lg border border-border bg-card p-4">
              <QuarterStat label="Q2 · levert" value="18" detail="100 % · 47 dager" />
              <QuarterStat label="Q3 · nå" value="12" detail="5 av 12 ferdig · 42 %" active />
              <QuarterStat label="Q4 · neste" value="8" detail="spec'd · 0 % bygget" />
              <QuarterStat label="Q1 · 27 backlog" value="4" detail="forslag — ikke estimert" />
            </div>

            <div className="flex gap-1 border-b border-border">
              {["Tidslinje", "Liste", "Avhengigheter", "Risiko · 4", "Endringslogg"].map((tab, i) => (
                <button
                  key={tab}
                  className={`relative px-3.5 py-2 text-[12px] font-medium ${
                    i === 0
                      ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tidslinje */}
            <div className="flex flex-col gap-6">
              {QUARTERS.map((q) => (
                <div key={q.label}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] font-semibold text-foreground">{q.label}</span>
                    <QuarterBadge badge={q.badge} />
                    <span className="font-mono text-[10px] text-muted-foreground">{q.span}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {q.epics.map((e, i) => (
                      <EpicCard key={i} epic={e} />
                    ))}
                    {q.more && (
                      <div className="px-4 py-2 text-center font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                        {q.more}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidekolonner */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-display text-[14px] font-semibold tracking-tight">Q3 burn-down · ukentlig</h3>
              <div className="mt-4 flex h-24 items-end gap-1.5">
                {BURN.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm ${i === 4 ? "bg-primary" : i > 4 ? "bg-secondary" : "bg-primary/50"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>uke 27</span>
                <span>uke 35</span>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                <strong className="font-medium text-foreground">På rute.</strong> 48 % gjenstår · 42 dager · 1,1 % per dag — innenfor target.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-3 font-display text-[14px] font-semibold tracking-tight">Stack · produksjon</h3>
              <div className="divide-y divide-border">
                {STACK.map((s) => (
                  <SideRow key={s.k} label={s.k} value={s.v} />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-3 font-display text-[14px] font-semibold tracking-tight">Perf-budget · siste 7d</h3>
              <div className="flex flex-col gap-2.5">
                {PERF.map((p) => (
                  <div key={p.l} className="grid grid-cols-[80px_1fr_60px] items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{p.l}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${
                          p.tone === "ok" ? "bg-[#1A7D56]" : p.tone === "warn" ? "bg-[#B8852A]" : "bg-primary"
                        }`}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                    <span className="text-right font-mono text-[11px] tabular-nums text-foreground">{p.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-accent/15 p-5">
              <h3 className="mb-3 font-display text-[14px] font-semibold tracking-tight text-primary">Eksternt · status</h3>
              <div className="divide-y divide-primary/10">
                <SideRow label="Supabase quota" value={<span className="text-[#B8852A]">82 %</span>} />
                <SideRow label="Claude tokens" value="1,4 M / 2 M" />
                <SideRow label="Stripe payouts" value="ok" />
                <SideRow label="Vercel regions" value="2 / 2 healthy" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function QuarterStat({ label, value, detail, active }: { label: string; value: string; detail: string; active?: boolean }) {
  return (
    <div className={`rounded-md p-3 ${active ? "bg-primary text-primary-foreground" : "bg-background"}`}>
      <div className={`font-mono text-[9px] uppercase tracking-[0.06em] ${active ? "opacity-70" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-1 font-display text-[24px] font-medium leading-none tabular-nums">{value}</div>
      <div className={`mt-1 font-mono text-[10px] ${active ? "opacity-90" : "text-muted-foreground"}`}>{detail}</div>
    </div>
  );
}

function QuarterBadge({ badge }: { badge: Quarter["badge"] }) {
  const styles = {
    Nå: "bg-primary text-primary-foreground",
    Neste: "bg-secondary text-foreground",
    Backlog: "bg-secondary text-muted-foreground",
    Levert: "bg-[#E5F1EA] text-[#1A7D56]",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${styles[badge]}`}>{badge}</span>;
}

function EpicCard({ epic }: { epic: Epic }) {
  return (
    <div
      className={`rounded-lg border bg-card ${
        epic.expanded ? "border-primary shadow-sm" : "border-border"
      }`}
    >
      <div className="grid grid-cols-[40px_1fr_120px_100px_24px] items-center gap-3 px-4 py-3">
        <KindIcon kind={epic.kind} />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">{epic.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {epic.tags.map((t) => (
              <TagPill key={t.label} tone={t.tone}>
                {t.label}
              </TagPill>
            ))}
          </div>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{epic.effort}</span>
        <StatusPill status={epic.status} />
        {epic.expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        )}
      </div>
      {epic.expanded && epic.desc && (
        <div className="border-t border-border bg-background/40 px-4 py-3">
          <p className="text-[12px] leading-relaxed text-muted-foreground">{epic.desc}</p>
          {epic.subTasks && (
            <div className="mt-3 flex flex-col gap-1.5">
              {epic.subTasks.map((s) => (
                <div key={s.label} className="grid grid-cols-[18px_1fr_120px] items-center gap-3 py-1">
                  <SubMark done={s.done} />
                  <span className={`text-[12px] ${s.done === "todo" ? "text-muted-foreground" : "text-foreground"}`}>{s.label}</span>
                  <span className="text-right font-mono text-[10px] text-muted-foreground">{s.meta}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KindIcon({ kind }: { kind: EpicKind }) {
  const colors: Record<EpicKind, string> = {
    F: "#005840",
    B: "#B8852A",
    I: "#0A1F17",
    A: "#A32D2D",
    D: "#5848A8",
  };
  const colorIsLight = kind === "D" || kind === "A" || kind === "B";
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-md font-display text-[14px] font-bold"
      style={{ background: colors[kind], color: colorIsLight ? "#FFFFFF" : "#D1F843" }}
    >
      {kind}
    </div>
  );
}

function TagPill({ children, tone }: { children: React.ReactNode; tone?: "default" | "api" | "dep" }) {
  const cls =
    tone === "api"
      ? "bg-accent/30 text-accent-foreground font-mono"
      : tone === "dep"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : "bg-secondary text-muted-foreground";
  return <span className={`rounded-sm px-1.5 py-0.5 text-[10px] ${cls}`}>{children}</span>;
}

function StatusPill({ status }: { status: EpicStatus }) {
  const styles: Record<EpicStatus, string> = {
    Levert: "bg-[#E5F1EA] text-[#1A7D56]",
    Pågår: "bg-[#FFF0D6] text-[#B8852A]",
    "Ikke startet": "bg-secondary text-muted-foreground",
    "Spec'd": "bg-background text-muted-foreground border border-border",
    Forslag: "bg-background text-muted-foreground border border-border",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-center text-[10px] font-semibold ${styles[status]}`}>{status}</span>;
}

function SubMark({ done }: { done: "done" | "progress" | "todo" }) {
  if (done === "done") {
    return <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">✓</span>;
  }
  if (done === "progress") {
    return <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FFF0D6] text-[10px] text-[#B8852A]">·</span>;
  }
  return <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] text-muted-foreground">·</span>;
}

function SideRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
