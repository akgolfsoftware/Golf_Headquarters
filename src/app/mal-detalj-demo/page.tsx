/**
 * PILOT — PlayerHQ HCP-mål detalj
 * Bygd direkte fra wireframe/design-files-v2/playerhq-A/02-mal-detalj.html
 * URL: /mal-detalj-demo
 *
 * Mock-data: Markus Roinås Pedersen, mai 2026.
 * Pro-tier rendres med full visning. Coach-notat + agent-innsikt er Pro-låst.
 */

import {
  TrendingUp,
  Download,
  Pencil,
  Share2,
  Calendar,
  Check,
  AlertTriangle,
  Trophy,
  Target,
  Zap,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function MalDetaljDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground p-8">
      <Breadcrumb />
      <DetailHead />
      <StatRow />
      <Tabs />
      <StatusBanner />
      <ChartCard />
      <SubgoalsHead />
      <Subgoals />
      <TwoCol />
    </div>
  );
}

function Breadcrumb() {
  return (
    <div className="mb-4 flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
      <a className="text-muted-foreground hover:text-foreground">Mål</a>
      <span>/</span>
      <a className="text-muted-foreground hover:text-foreground">Aktive mål</a>
      <span>/</span>
      <span className="text-foreground">HCP til scratch</span>
    </div>
  );
}

function DetailHead() {
  return (
    <div className="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-lg border border-border bg-card p-6">
      <div
        className="grid h-16 w-16 place-items-center rounded-2xl"
        style={{
          background: "rgba(26,125,86,0.10)",
          color: "var(--status-success, #1A7D56)",
        }}
      >
        <TrendingUp className="h-8 w-8" />
      </div>
      <div>
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight">
          HCP-mål: <em className="font-medium italic">til scratch innen jul</em>
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-[13px] text-muted-foreground">
          <span>
            Nåværende{" "}
            <strong className="font-mono font-medium text-foreground">+2,4</strong>
          </span>
          <Dot />
          <span>Mål-dato 31.12.2026</span>
          <Dot />
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              background: "rgba(26,125,86,0.10)",
              color: "var(--status-success,#1A7D56)",
            }}
          >
            På rute — forventet truffet
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
          <Download className="h-4 w-4" />
          Eksporter PDF
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
          <Pencil className="h-4 w-4" />
          Endre mål
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          <Share2 className="h-4 w-4" />
          Del med foresatte
        </button>
      </div>
    </div>
  );
}

function StatRow() {
  const stats: {
    label: string;
    value: string;
    delta: string;
    icon: React.ReactNode;
    tone: "up" | "flat";
  }[] = [
    {
      label: "Δ siste 6 mnd",
      value: "−1,8",
      delta: "Best siden okt 2024",
      icon: <TrendingUp className="h-3 w-3" />,
      tone: "up",
    },
    {
      label: "Sist runde",
      value: "+1,2",
      delta: "−0,3 vs. forrige",
      icon: <TrendingUp className="h-3 w-3" />,
      tone: "up",
    },
    {
      label: "Beste runde HCP",
      value: "−2,8",
      delta: "4. mai 2026",
      icon: <Calendar className="h-3 w-3" />,
      tone: "flat",
    },
    {
      label: "Peer-snitt (HCP 10–15)",
      value: "+3,1",
      delta: "Du ligger 0,7 foran",
      icon: <TrendingUp className="h-3 w-3" />,
      tone: "up",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col gap-1.5 rounded-md border border-border bg-card p-4"
        >
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {s.label}
          </div>
          <div className="font-mono text-[28px] font-medium tabular-nums leading-none -tracking-tight text-foreground">
            {s.value}
          </div>
          <div
            className={`inline-flex items-center gap-1 font-mono text-[12px] ${
              s.tone === "up"
                ? "text-[var(--status-success,#1A7D56)]"
                : "text-muted-foreground"
            }`}
          >
            {s.icon}
            {s.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tabs() {
  const tabs = [
    { name: "Trend", active: true },
    { name: "Delmål", count: 5 },
    { name: "Sammenlikning" },
    { name: "Coach-notater", count: 3 },
  ];
  return (
    <div className="mb-6 flex gap-6 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.name}
          className={`inline-flex items-center gap-2 border-b-2 py-3 text-[14px] font-semibold transition-colors ${
            t.active
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.name}
          {t.count !== undefined && (
            <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function StatusBanner() {
  return (
    <div
      className="mb-6 flex items-center gap-4 rounded-md border p-4"
      style={{
        background: "rgba(26,125,86,0.10)",
        borderColor: "rgba(26,125,86,0.2)",
      }}
    >
      <div
        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-md text-white"
        style={{ background: "var(--status-success,#1A7D56)" }}
      >
        <Check className="h-4 w-4" />
      </div>
      <div>
        <strong
          className="block font-display text-[15px] font-bold"
          style={{ color: "var(--status-success,#1A7D56)" }}
        >
          Forventet truffet 31. desember 2026
        </strong>
        <p className="mt-0.5 text-[13px] text-foreground">
          Basert på trend siste 12 uker. Du må holde −0,15 HCP/mnd for å nå mål.
        </p>
      </div>
      <div className="ml-auto flex flex-shrink-0 gap-5 font-mono text-[12px] text-muted-foreground">
        <span>
          <strong
            className="block font-mono text-[14px]"
            style={{ color: "var(--status-success,#1A7D56)" }}
          >
            −0,21
          </strong>
          siste 12 uker
        </span>
        <span>
          <strong
            className="block font-mono text-[14px]"
            style={{ color: "var(--status-success,#1A7D56)" }}
          >
            +0,06
          </strong>
          buffer/mnd
        </span>
        <span>
          <strong
            className="block font-mono text-[14px]"
            style={{ color: "var(--status-success,#1A7D56)" }}
          >
            7,5 mnd
          </strong>
          til mål
        </span>
      </div>
    </div>
  );
}

function ChartCard() {
  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-display text-[18px] font-bold tracking-tight">
            HCP-utvikling og projeksjon
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            13 måneder · historikk siden november 2025 · projeksjon basert på
            trend
          </p>
        </div>
        <div className="flex gap-4 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-foreground" />
            Historikk
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-accent" />
            Projeksjon
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ background: "var(--status-warning, #B8852A)" }}
            />
            Mål 0,0
          </span>
        </div>
      </div>
      <div className="h-80 w-full">
        <svg
          viewBox="0 0 1200 320"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A1F18" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0A1F18" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D1F843" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D1F843" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g fontFamily="monospace" fontSize="10" fill="#9C9990">
            <line x1="50" y1="40" x2="1180" y2="40" stroke="#EFEDE6" />
            <text x="40" y="44" textAnchor="end">−3</text>
            <line x1="50" y1="100" x2="1180" y2="100" stroke="#EFEDE6" />
            <text x="40" y="104" textAnchor="end">0</text>
            <line x1="50" y1="160" x2="1180" y2="160" stroke="#EFEDE6" />
            <text x="40" y="164" textAnchor="end">3</text>
            <line x1="50" y1="220" x2="1180" y2="220" stroke="#EFEDE6" />
            <text x="40" y="224" textAnchor="end">6</text>
            <line x1="50" y1="280" x2="1180" y2="280" stroke="#EFEDE6" />
            <text x="40" y="284" textAnchor="end">9</text>
          </g>

          <line
            x1="50"
            y1="100"
            x2="1180"
            y2="100"
            stroke="#B8852A"
            strokeWidth="1.5"
            strokeDasharray="2 4"
          />
          <text
            x="1180"
            y="92"
            textAnchor="end"
            fontFamily="monospace"
            fontSize="10"
            fill="#B8852A"
            fontWeight="500"
          >
            Mål: HCP 0,0
          </text>

          <line
            x1="615"
            y1="20"
            x2="615"
            y2="300"
            stroke="#C4C0B8"
            strokeDasharray="3 3"
            opacity="0.6"
          />
          <text
            x="608"
            y="32"
            textAnchor="end"
            fontFamily="monospace"
            fontSize="10"
            fill="#5E5C57"
          >
            Nå
          </text>
          <text
            x="622"
            y="32"
            fontFamily="monospace"
            fontSize="10"
            fill="#5E5C57"
          >
            Projeksjon →
          </text>

          <path
            d="M 80 200 L 130 195 L 180 205 L 230 188 L 280 178 L 330 170 L 380 160 L 430 145 L 480 152 L 530 140 L 580 130 L 615 124 L 615 300 L 80 300 Z"
            fill="url(#histGrad)"
          />
          <path
            d="M 80 200 L 130 195 L 180 205 L 230 188 L 280 178 L 330 170 L 380 160 L 430 145 L 480 152 L 530 140 L 580 130 L 615 124"
            stroke="#0A1F18"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 615 124 L 700 116 L 780 108 L 860 100 L 940 92 L 1020 88 L 1100 90 L 1170 95 L 1170 300 L 615 300 Z"
            fill="url(#projGrad)"
            opacity="0.55"
          />
          <path
            d="M 615 124 L 700 116 L 780 108 L 860 100 L 940 92 L 1020 88 L 1100 90 L 1170 95"
            stroke="#005840"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="5 4"
          />

          <g>
            {[80, 130, 180, 230, 280, 330, 380, 480, 530, 580].map((x, i) => {
              const ys = [200, 195, 205, 188, 178, 170, 160, 152, 140, 130];
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={ys[i]}
                  r="3.5"
                  fill="#fff"
                  stroke="#0A1F18"
                  strokeWidth="2"
                />
              );
            })}
            <circle cx="430" cy="145" r="6" fill="#D1F843" stroke="#0A1F18" strokeWidth="2" />
            <circle cx="615" cy="124" r="7" fill="#0A1F18" />
            <circle cx="615" cy="124" r="3" fill="#D1F843" />
          </g>

          <g fontFamily="monospace" fontSize="10" fill="#9C9990">
            {[
              ["NOV", 80],
              ["DES", 180],
              ["JAN", 280],
              ["FEB", 380],
              ["MAR", 480],
              ["APR", 580],
              ["MAI", 700],
              ["JUN", 780],
              ["JUL", 860],
              ["AUG", 940],
              ["SEP", 1020],
              ["OKT", 1100],
            ].map(([m, x]) => (
              <text
                key={m}
                x={x as number}
                y="312"
                textAnchor="middle"
                fill={m === "MAI" ? "#0A1F18" : "#9C9990"}
              >
                {m}
              </text>
            ))}
            <text x="1170" y="312" textAnchor="end" fill="#B8852A" fontWeight="500">
              DES MÅL
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

function SubgoalsHead() {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-[18px] font-bold tracking-tight">Delmål</h2>
      <a className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
        Se alle 5
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

type Subgoal = {
  icon: React.ReactNode;
  title: string;
  statusLabel: string;
  status: "done" | "progress" | "risk";
  width: number;
  metaLeft: string;
  metaRight: string;
};

const subgoals: Subgoal[] = [
  {
    icon: <Target className="h-3.5 w-3.5" />,
    title: "Score < 75 i 3 runder på rad",
    statusLabel: "2 / 3",
    status: "progress",
    width: 66,
    metaLeft: "Sist: 74 ✓",
    metaRight: "1 igjen",
  },
  {
    icon: <Check className="h-3.5 w-3.5" />,
    title: "TrackMan Driver carry > 270 m",
    statusLabel: "Ferdig",
    status: "done",
    width: 100,
    metaLeft: "Truffet 05.05.26",
    metaRight: "275 m",
  },
  {
    icon: <Target className="h-3.5 w-3.5" />,
    title: "Sand-test 30 m: nå 8,0 av 10",
    statusLabel: "På rute",
    status: "progress",
    width: 68,
    metaLeft: "6,8 nå",
    metaRight: "Mål 8,0",
  },
  {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    title: "18-hulls SG-Total > +1,0",
    statusLabel: "I fare",
    status: "risk",
    width: 48,
    metaLeft: "+0,4 snitt",
    metaRight: "Mål +1,0",
  },
  {
    icon: <Trophy className="h-3.5 w-3.5" />,
    title: "Topp 3 i klubbmesterskap juni",
    statusLabel: "Pågår",
    status: "progress",
    width: 30,
    metaLeft: "Påmeldt",
    metaRight: "14.06.26",
  },
];

function Subgoals() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {subgoals.map((sg) => (
        <SubgoalCard key={sg.title} sg={sg} />
      ))}
    </div>
  );
}

function SubgoalCard({ sg }: { sg: Subgoal }) {
  const statusStyles: Record<Subgoal["status"], string> = {
    done: "bg-[rgba(26,125,86,0.10)] text-[var(--status-success,#1A7D56)]",
    progress: "bg-accent/40 text-accent-foreground",
    risk: "bg-[rgba(184,133,42,0.16)] text-[var(--status-warning,#B8852A)]",
  };
  const iconBg: Record<Subgoal["status"], string> = {
    done: "bg-[rgba(26,125,86,0.10)] text-[var(--status-success,#1A7D56)]",
    progress: "bg-primary/10 text-primary",
    risk: "bg-[rgba(184,133,42,0.16)] text-[var(--status-warning,#B8852A)]",
  };
  const barStyle: Record<Subgoal["status"], string> = {
    done: "bg-[var(--status-success,#1A7D56)]",
    progress: "bg-accent",
    risk: "bg-[var(--status-warning,#B8852A)]",
  };
  return (
    <div className="flex cursor-pointer flex-col gap-2.5 rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`grid h-7 w-7 place-items-center rounded-sm ${iconBg[sg.status]}`}>
          {sg.icon}
        </div>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${statusStyles[sg.status]}`}
        >
          {sg.statusLabel}
        </span>
      </div>
      <div className="text-[13px] font-semibold leading-snug text-foreground">
        {sg.title}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full ${barStyle[sg.status]}`}
            style={{ width: `${sg.width}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{sg.metaLeft}</span>
          <span>{sg.metaRight}</span>
        </div>
      </div>
    </div>
  );
}

function TwoCol() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <RecentRounds />
      <CoachColumn />
    </div>
  );
}

function RecentRounds() {
  const rows: {
    day: string;
    month: string;
    name: string;
    sub: string;
    score: string;
    diff: string;
    diffTone: "muted" | "success";
    hcp: string;
    hcpTone: "down" | "up";
    pr?: boolean;
  }[] = [
    {
      day: "09",
      month: "mai",
      name: "GFGK",
      sub: "Hjemmebane · 18 hull",
      score: "78",
      diff: "(+8)",
      diffTone: "muted",
      hcp: "−0,2",
      hcpTone: "down",
    },
    {
      day: "04",
      month: "mai",
      name: "Borre",
      sub: "Sand-test PR · 18 hull",
      score: "74",
      diff: "(−1)",
      diffTone: "success",
      hcp: "−0,4",
      hcpTone: "down",
      pr: true,
    },
    {
      day: "28",
      month: "apr",
      name: "Oslo GK",
      sub: "Park · 18 hull",
      score: "79",
      diff: "(+7)",
      diffTone: "muted",
      hcp: "+0,1",
      hcpTone: "up",
    },
    {
      day: "22",
      month: "apr",
      name: "Larvik",
      sub: "Links · 18 hull",
      score: "78",
      diff: "(+8)",
      diffTone: "muted",
      hcp: "−0,1",
      hcpTone: "down",
    },
    {
      day: "15",
      month: "apr",
      name: "Hauger",
      sub: "Skog · 18 hull",
      score: "82",
      diff: "(+10)",
      diffTone: "muted",
      hcp: "+0,3",
      hcpTone: "up",
    },
    {
      day: "08",
      month: "apr",
      name: "Stiklestad",
      sub: "Resort · 18 hull",
      score: "84",
      diff: "(+12)",
      diffTone: "muted",
      hcp: "+0,2",
      hcpTone: "up",
    },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[16px] font-bold">
          Siste 6 runder · som bidrar til HCP
        </h3>
        <a className="text-[12px] font-semibold text-primary">Logg →</a>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className={`grid grid-cols-[56px_1fr_auto_auto] items-center gap-3.5 py-2.5 ${i < rows.length - 1 ? "border-b border-border" : ""}`}
        >
          <div className="text-center font-mono text-[11px] leading-tight text-muted-foreground">
            {r.day}.
            <strong className="block text-[14px] font-medium text-foreground">
              {r.month}
            </strong>
          </div>
          <div>
            <div className="text-[13px] font-medium text-foreground">
              {r.name}
              {r.pr && (
                <span className="ml-2 inline-block rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-accent-foreground">
                  PR
                </span>
              )}
            </div>
            <span className="block text-[11px] text-muted-foreground">
              {r.sub}
            </span>
          </div>
          <div className="font-mono text-[16px] font-medium tabular-nums">
            {r.score}{" "}
            <span
              className={`text-[11px] ${r.diffTone === "success" ? "text-[var(--status-success,#1A7D56)]" : "text-muted-foreground"}`}
            >
              {r.diff}
            </span>
          </div>
          <div
            className={`rounded-full px-2 py-0.5 font-mono text-[12px] font-medium ${
              r.hcpTone === "up"
                ? "bg-[rgba(163,45,45,0.10)] text-destructive"
                : "bg-[rgba(26,125,86,0.10)] text-[var(--status-success,#1A7D56)]"
            }`}
          >
            {r.hcp}
          </div>
        </div>
      ))}
    </div>
  );
}

function CoachColumn() {
  return (
    <div className="flex flex-col gap-4">
      {/* Coach note */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary text-accent font-display text-[14px] font-semibold">
            AK
          </div>
          <div>
            <div className="text-[14px] font-semibold">Anders Kristiansen</div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Hovedcoach · 07.05.26
            </div>
          </div>
        </div>
        <p className="mb-4 text-[14px] leading-relaxed text-foreground">
          Trenden fra 4. mai er reell — bunkerteknikken har låst seg i konsistent
          kontaktpunkt. Hold puttetempoet, vi tar én økt på 3-meterspar denne
          uka for å sikre delmålet på SG-Total.
        </p>
        <div className="flex gap-2">
          <button className="rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
            Svar
          </button>
          <button className="rounded-md px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
            Book økt →
          </button>
        </div>
      </div>

      {/* Pro-locked insight */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-accent/20 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <strong className="font-bold text-[12px] uppercase tracking-[0.08em] text-primary">
            Innsikt
          </strong>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Lock className="h-2.5 w-2.5" />
            Pro
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-foreground">
          Du forbedrer HCP 2,3× raskere i mai vs. snitt-spiller med samme nivå.
          Hovedfaktor: sand-treningen siden mars.
        </p>
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span
      className="inline-block h-1 w-1 rounded-full"
      style={{ background: "var(--ink-disabled, #C4C0B8)" }}
    />
  );
}
