/**
 * CoachHQ — Godkjenninger (agent-inbox)
 * Bygd fra wireframe/design-files-v2/screens/03-godkjenninger.html (produksjons-frame 01)
 * URL: /godkjenninger-demo
 */

import {
  Search,
  Send,
  CheckSquare,
  Check,
  AlertTriangle,
  RotateCcw,
  MessageCircle,
  Clock,
  Activity,
  CircleCheck,
  Info,
  ChevronDown,
} from "lucide-react";

type Severity = "urgent" | "warn" | "info";
type AgentKind = "escalation" | "deload" | "signal" | "periodisering";
type IconKind = "alert" | "rotate" | "msg" | "clock" | "trend" | "info" | "check";

type Row = {
  severity: Severity;
  avatar: string;
  avBg: string;
  avFg?: string;
  name: string;
  meta: string;
  icon: IconKind;
  heading: React.ReactNode;
  body: React.ReactNode;
  agent: AgentKind;
  agentLabel: string;
  when: string;
};

const urgentRows: Row[] = [
  {
    severity: "urgent",
    avatar: "JT",
    avBg: "#A32D2D",
    name: "Joachim Tangen",
    meta: "HCP 14,2 · Skadet",
    icon: "alert",
    heading: (
      <>
        <strong className="font-semibold">Eskalering til hovedcoach</strong> — skade-flagg fra
        dagbok
      </>
    ),
    body: (
      <>
        Spiller har rapportert{" "}
        <span className="font-mono tabular-nums">3 av 4</span> dager med smerte i venstre kne (NRS{" "}
        <span className="font-mono tabular-nums">5/10</span>). Anbefaling: stoppe alle SLAG-økter,
        henvise til fysio.
      </>
    ),
    agent: "escalation",
    agentLabel: "Escalation-agent",
    when: "14 min siden",
  },
  {
    severity: "urgent",
    avatar: "MP",
    avBg: "#005840",
    name: "Markus Roinås Pedersen",
    meta: "HCP +2,4 · GFGK",
    icon: "rotate",
    heading: (
      <>
        <strong className="font-semibold">Avlys planlagt turnering</strong> —
        overtreningsindeks kritisk
      </>
    ),
    body: (
      <>
        HRV{" "}
        <span className="rounded-sm bg-[rgba(176,68,68,0.10)] px-1 font-mono text-[10px] font-semibold text-[#A32D2D]">
          −18 %
        </span>{" "}
        over 5 dager, søvn <span className="font-mono tabular-nums">5,4 t</span> snitt. Anbefaling:
        trekk fra Sørlandsåpent helga 16.–17. mai. Plan B: lett restitusjon + Bossum range.
      </>
    ),
    agent: "deload",
    agentLabel: "Deload-agent",
    when: "42 min siden",
  },
  {
    severity: "urgent",
    avatar: "ES",
    avBg: "#1A7D56",
    name: "Emma Solberg",
    meta: "HCP 8,7 · Pro",
    icon: "msg",
    heading: (
      <>
        <strong className="font-semibold">Foreldre-melding krever svar</strong> — 6 dgr ubesvart
      </>
    ),
    body: (
      <>
        Far har sendt <span className="font-mono tabular-nums">2</span> meldinger om utstyrsbytte
        (driver-skaft). Foreslått svar generert. Aksepter for å sende, eller redigér først.
      </>
    ),
    agent: "signal",
    agentLabel: "Signal-agent",
    when: "2 t 14 min siden",
  },
];

const warnRows: Row[] = [
  {
    severity: "warn",
    avatar: "MP",
    avBg: "#005840",
    name: "Markus Roinås Pedersen",
    meta: "HCP +2,4 · GFGK",
    icon: "clock",
    heading: (
      <>
        <strong className="font-semibold">Pauseuke anbefalt</strong> — før Sørlandsåpent
      </>
    ),
    body: (
      <>
        8 ukers progresjon viser flat platå siste 12 dager. Anbefaling: redusér volum med{" "}
        <span className="font-mono tabular-nums">40 %</span> i uke 20, behold intensitet på SLAG.
      </>
    ),
    agent: "deload",
    agentLabel: "Deload-agent",
    when: "2 t 02 min siden",
  },
  {
    severity: "warn",
    avatar: "ES",
    avBg: "#1A7D56",
    name: "Emma Solberg",
    meta: "HCP 8,7 · Pro",
    icon: "trend",
    heading: (
      <>
        <strong className="font-semibold">Endre TEK-volum</strong> fra{" "}
        <span className="font-mono tabular-nums">40 %</span> →{" "}
        <span className="font-mono tabular-nums">28 %</span>
      </>
    ),
    body: (
      <>
        Sving-data viser overfokusering på TEK relativt til SLAG. Re-balansering matcher
        pyramide-mal for hennes nivå (Pro, midt-sesong).
      </>
    ),
    agent: "periodisering",
    agentLabel: "Periodisering-agent",
    when: "i går 16:42",
  },
];

const infoRows: Row[] = [
  {
    severity: "info",
    avatar: "LH",
    avBg: "#D1F843",
    avFg: "#0A1F18",
    name: "Lina Hellesund",
    meta: "HCP 4,1 · Elite",
    icon: "info",
    heading: (
      <>
        <strong className="font-semibold">Ny fase klar</strong> — &quot;Sommer-toppform&quot; går
        fra Base → Spesifikk
      </>
    ),
    body: (
      <>
        Spiller har fullført <span className="font-mono tabular-nums">14 av 16</span> base-økter
        med snitt{" "}
        <span className="rounded-sm bg-[rgba(45,107,76,0.12)] px-1 font-mono text-[10px] font-semibold text-[#1A7D56]">
          +12 %
        </span>
        . Neste fase aktiveres ved godkjenning.
      </>
    ),
    agent: "periodisering",
    agentLabel: "Periodisering-agent",
    when: "i går 11:08",
  },
  {
    severity: "info",
    avatar: "JD",
    avBg: "#5E5C57",
    name: "Jon Dahl",
    meta: "HCP 14,0 · Pro",
    icon: "check",
    heading: (
      <>
        <strong className="font-semibold">Plan ferdig</strong> — &quot;Konsistens fra tee&quot;
        arkiveres
      </>
    ),
    body: (
      <>
        Mål oppnådd: greens-in-regulation{" "}
        <span className="rounded-sm bg-[rgba(45,107,76,0.12)] px-1 font-mono text-[10px] font-semibold text-[#1A7D56]">
          +8 %
        </span>{" "}
        over 10 uker. Anbefaling: arkiver og start oppfølgings-plan.
      </>
    ),
    agent: "periodisering",
    agentLabel: "Periodisering-agent",
    when: "2 dgr siden",
  },
];

export default function GodkjenningerDemo() {
  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Coach HQ · Godkjenninger
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Sju anbefalinger <em className="italic text-primary">venter på deg.</em>
          </h1>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
            <Send size={14} strokeWidth={1.5} />
            Send agent-feedback
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90">
            <CheckSquare size={14} strokeWidth={1.5} />
            Velg flere
          </button>
        </div>
      </header>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3.5">
        <KpiFeature label="Venter" value="7">
          <div className="mt-1 flex flex-wrap gap-3 font-mono text-[10px] text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D45353]" />3 urgent
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D1F843]" />2 warning
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />2 info
            </span>
          </div>
        </KpiFeature>
        <Kpi label="Godkjent siste 7d" value="23" delta="+5 vs forrige uke" deltaTone="good" />
        <Kpi label="Avslått siste 7d" value="4" delta="17 % avslagsrate" />
        <Kpi label="Snitt responstid" value="2 t 14 m" delta="−18 m vs sist uke" deltaTone="good" />
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.5} />
          <span className="flex-1">Søk spiller eller action</span>
          <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </span>
        </div>
        <Chip active>Alle <Count>7</Count></Chip>
        <Chip>Urgent <Count>3</Count></Chip>
        <Chip>Warning <Count>2</Count></Chip>
        <Chip>Info <Count>2</Count></Chip>
        <span className="h-5 w-px bg-border" />
        <Chip>Agent <Count>3</Count></Chip>
        <Chip>Spiller</Chip>
        <button className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
          Nyeste
          <ChevronDown size={12} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>
          Viser <span className="font-medium text-foreground">7 av 7</span> · gruppert etter
          severity
        </span>
        <span>
          <span className="font-medium text-foreground">Auto-refresh</span> · sist 14 sek siden
        </span>
      </div>

      {/* Inbox */}
      <div className="flex flex-col gap-2">
        <GroupHead color="#A32D2D" title="Urgent — krever umiddelbar respons" count={3} />
        {urgentRows.map((r) => (
          <InboxRow key={r.name + r.when} row={r} />
        ))}

        <GroupHead color="#B8852A" title="Warning" count={2} />
        {warnRows.map((r) => (
          <InboxRow key={r.name + r.when} row={r} />
        ))}

        <GroupHead color="var(--color-primary,#005840)" title="Info" count={2} />
        {infoRows.map((r) => (
          <InboxRow key={r.name + r.when} row={r} />
        ))}
      </div>
    </div>
  );
}

function GroupHead({ color, title, count }: { color: string; title: string; count: number }) {
  return (
    <div className="mt-3 flex items-center gap-2.5 px-1 first:mt-0">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-foreground">
        {title}
      </span>
      <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
        {count}
      </span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

function InboxRow({ row: r }: { row: Row }) {
  const sevStyles: Record<Severity, { pill: string; border: string; dot: string }> = {
    urgent: {
      pill: "bg-[rgba(176,68,68,0.10)] text-[#A32D2D]",
      border: "border-l-[#A32D2D]",
      dot: "bg-[#A32D2D]",
    },
    warn: {
      pill: "bg-[rgba(184,133,42,0.12)] text-[#7d5814]",
      border: "border-l-[#B8852A]",
      dot: "bg-[#B8852A]",
    },
    info: {
      pill: "bg-primary/10 text-primary",
      border: "border-l-primary",
      dot: "bg-primary",
    },
  };
  const agentColors: Record<AgentKind, string> = {
    escalation: "bg-[#A32D2D] text-white",
    deload: "bg-[#B8852A] text-white",
    signal: "bg-[#5E5C57] text-white",
    periodisering: "bg-primary text-primary-foreground",
  };
  const styles = sevStyles[r.severity];

  return (
    <article
      className={`grid grid-cols-[110px_180px_1fr_180px_100px_auto] items-start gap-3.5 rounded-md border border-border border-l-[3px] bg-card p-4 text-[12px] ${styles.border}`}
    >
      <div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${styles.pill}`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          {r.severity === "urgent" ? "Urgent" : r.severity === "warn" ? "Warning" : "Info"}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div
          className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-semibold"
          style={{ background: r.avBg, color: r.avFg ?? "#FFFFFF" }}
        >
          {r.avatar}
        </div>
        <div className="leading-tight">
          <div className="font-medium text-foreground">{r.name}</div>
          <div className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
            {r.meta}
          </div>
        </div>
      </div>
      <div className="leading-snug">
        <div className="flex items-start gap-2 text-foreground">
          <IconForRow kind={r.icon} />
          <span>{r.heading}</span>
        </div>
        <div className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{r.body}</div>
      </div>
      <div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] font-medium ${agentColors[r.agent]}`}
        >
          <span className="grid h-4 w-4 place-items-center rounded-sm bg-white/20 font-mono text-[9px] font-bold">
            {r.agentLabel.charAt(0)}
          </span>
          {r.agentLabel}
        </span>
      </div>
      <div className="font-mono text-[11px] tabular-nums text-muted-foreground">{r.when}</div>
      <div className="flex items-center gap-1.5">
        <button className="rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
          Detaljer →
        </button>
        <button className="rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
          Avslå
        </button>
        <button className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground hover:opacity-90">
          <Check size={12} strokeWidth={1.5} />
          Aksepter
        </button>
      </div>
    </article>
  );
}

function IconForRow({ kind }: { kind: IconKind }) {
  const size = 15;
  const props = { size, strokeWidth: 1.5 } as const;
  const map: Record<IconKind, React.ReactNode> = {
    alert: <AlertTriangle {...props} className="mt-0.5 flex-shrink-0 text-[#A32D2D]" />,
    rotate: <RotateCcw {...props} className="mt-0.5 flex-shrink-0 text-muted-foreground" />,
    msg: <MessageCircle {...props} className="mt-0.5 flex-shrink-0 text-muted-foreground" />,
    clock: <Clock {...props} className="mt-0.5 flex-shrink-0 text-muted-foreground" />,
    trend: <Activity {...props} className="mt-0.5 flex-shrink-0 text-muted-foreground" />,
    info: <Info {...props} className="mt-0.5 flex-shrink-0 text-muted-foreground" />,
    check: <CircleCheck {...props} className="mt-0.5 flex-shrink-0 text-muted-foreground" />,
  };
  return <>{map[kind]}</>;
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-semibold tabular-nums opacity-70">{children}</span>
  );
}

function KpiFeature({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-[#1A1916] to-[#2a2823] p-4 text-white">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-white/55">
        {label}
      </div>
      <div className="font-display text-[32px] font-medium leading-none tracking-tight">
        {value}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone?: "good";
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-[32px] font-medium leading-none tracking-tight text-foreground">
        {value}
      </div>
      <div
        className={`font-mono text-[10px] tracking-[0.02em] ${
          deltaTone === "good" ? "text-[#1A7D56]" : "text-muted-foreground"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}
