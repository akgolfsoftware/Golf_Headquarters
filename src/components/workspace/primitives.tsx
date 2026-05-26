/**
 * Workspace · Felles primitives
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (workspace/shared.jsx). Gjenbrukbare på tvers av alle workspace-skjermer.
 */

import {
  Lock,
  Users,
  Globe,
  GraduationCap,
  Briefcase,
} from "lucide-react";

// ────────────────────────────────────────────────────────────── VISIBILITY ──

export type VisibilityKind = "PRIVAT" | "AK" | "JUNIOR" | "SELSKAP" | "ALLE";

const VIS_CONFIG: Record<
  VisibilityKind,
  { Icon: typeof Lock; label: string; bg: string; fg: string }
> = {
  PRIVAT: { Icon: Lock, label: "PRIVAT", bg: "bg-muted/40", fg: "text-muted-foreground" },
  AK: { Icon: Users, label: "AK GOLF", bg: "bg-primary/10", fg: "text-primary" },
  JUNIOR: { Icon: GraduationCap, label: "JR COACH", bg: "bg-accent/40", fg: "text-[#3B4310]" },
  SELSKAP: { Icon: Briefcase, label: "MULLIGAN", bg: "bg-amber-100", fg: "text-amber-900" },
  ALLE: { Icon: Globe, label: "ALLE COACHES", bg: "bg-emerald-100", fg: "text-emerald-800" },
};

export function VisibilityPill({
  kind,
  label,
  compact = false,
}: {
  kind: VisibilityKind;
  label?: string;
  compact?: boolean;
}) {
  const v = VIS_CONFIG[kind];
  const Icon = v.Icon;
  return (
    <span
      className={`font-mono inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-[0.08em] ${
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[9.5px]"
      } ${v.bg} ${v.fg}`}
    >
      <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
      {!compact ? label ?? v.label : null}
    </span>
  );
}

export function VisibilityIcon({ kind }: { kind: VisibilityKind }) {
  const v = VIS_CONFIG[kind];
  const Icon = v.Icon;
  return (
    <span
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded ${v.bg} ${v.fg}`}
      title={v.label}
    >
      <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
    </span>
  );
}

// ──────────────────────────────────────────────────────────────── SOURCE ──

export type SourceKind = "N" | "M";

export function SourceBadge({ kind }: { kind: SourceKind }) {
  if (kind === "N") {
    return (
      <span
        className="font-display inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white"
        title="Synket fra Notion"
      >
        N
      </span>
    );
  }
  return (
    <span
      className="font-display inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[10px] font-bold text-muted-foreground"
      title="Manuell"
    >
      M
    </span>
  );
}

// ────────────────────────────────────────────────────────────── PRIORITY ──

export type PrioKind = "BRENNER" | "HOY" | "MED" | "LAV";

const PRIO_CONFIG: Record<PrioKind, { color: string; label: string }> = {
  BRENNER: { color: "bg-destructive", label: "BRENNER" },
  HOY: { color: "bg-amber-600", label: "HØY" },
  MED: { color: "bg-blue-700", label: "MED" },
  LAV: { color: "bg-muted-foreground/50", label: "LAV" },
};

export function PrioDot({
  kind,
  withLabel = false,
}: {
  kind: PrioKind;
  withLabel?: boolean;
}) {
  const p = PRIO_CONFIG[kind];
  return (
    <span className="inline-flex items-center gap-1.5" title={p.label}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.color}`} />
      {withLabel ? (
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em]">
          {p.label}
        </span>
      ) : null}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────── PROJECT ──

export type CompanyKind = "AK" | "MULLIGAN" | "WANG" | "SKARP" | "PRIVAT";

const COMPANY_CONFIG: Record<
  CompanyKind,
  { bg: string; fg: string; bar: string; name: string }
> = {
  AK: { bg: "bg-primary/10", fg: "text-primary", bar: "bg-primary", name: "AK GOLF" },
  MULLIGAN: { bg: "bg-amber-100", fg: "text-amber-900", bar: "bg-amber-600", name: "MULLIGAN" },
  WANG: { bg: "bg-purple-100", fg: "text-purple-900", bar: "bg-purple-700", name: "WANG TOPP" },
  SKARP: { bg: "bg-emerald-100", fg: "text-emerald-800", bar: "bg-emerald-600", name: "SKARPNORD" },
  PRIVAT: { bg: "bg-muted/40", fg: "text-muted-foreground", bar: "bg-muted-foreground/60", name: "PRIVAT" },
};

export function ProjectPill({
  company,
  name,
  compact = false,
}: {
  company: CompanyKind;
  name?: string;
  compact?: boolean;
}) {
  const c = COMPANY_CONFIG[company];
  return (
    <span
      className={`font-mono inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-[0.06em] ${
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[9.5px]"
      } ${c.bg} ${c.fg}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.bar}`} />
      {name ?? c.name}
    </span>
  );
}

export function getCompanyBar(company: CompanyKind): string {
  return COMPANY_CONFIG[company].bar;
}

// ───────────────────────────────────────────────────────────── TASK CHECK ──

export function TaskCheck({
  done,
  onClick,
  size = 18,
}: {
  done: boolean;
  onClick?: () => void;
  size?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition ${
        done ? "border-0 bg-primary text-accent" : "border-[1.5px] border-input bg-card"
      }`}
      style={{ width: size, height: size }}
      aria-pressed={done}
    >
      {done ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          width={size * 0.55}
          height={size * 0.55}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : null}
    </button>
  );
}

// ──────────────────────────────────────────────────────────── AVATAR STACK ──

export type AvatarItem = {
  name: string;
  initials?: string;
  color?: string; // c1-c8
};

export function AvatarStack({
  items,
  max = 3,
  size = 22,
}: {
  items: AvatarItem[];
  max?: number;
  size?: number;
}) {
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  function getInitials(name: string): string {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }

  return (
    <div className="inline-flex items-center">
      {visible.map((p, i) => (
        <div
          key={i}
          className="inline-flex items-center justify-center rounded-full border-2 border-card bg-primary font-bold text-accent"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.42,
            marginLeft: i === 0 ? 0 : -6,
            zIndex: 10 - i,
            position: "relative",
          }}
        >
          {p.initials ?? getInitials(p.name)}
        </div>
      ))}
      {overflow > 0 ? (
        <div
          className="font-mono inline-flex items-center justify-center rounded-full border-2 border-card bg-muted/40 font-bold text-muted-foreground"
          style={{ width: size, height: size, marginLeft: -6, fontSize: size * 0.38 }}
        >
          +{overflow}
        </div>
      ) : null}
    </div>
  );
}

// ────────────────────────────────────────────────────────────── DUE DATE ──

export function DueDate({
  value,
  today = false,
  overdue = false,
}: {
  value: string;
  today?: boolean;
  overdue?: boolean;
}) {
  return (
    <span
      className={`font-mono text-[10.5px] uppercase tracking-[0.04em] ${
        overdue
          ? "font-bold text-destructive"
          : today
            ? "font-bold text-foreground"
            : "font-medium text-muted-foreground"
      }`}
    >
      {today ? "I DAG" : value}
    </span>
  );
}

// ───────────────────────────────────────────────────────────────── KPI ──

export function WorkspaceKpi({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaTone?: "muted" | "success" | "danger" | "warning";
}) {
  const toneClass =
    deltaTone === "success"
      ? "text-emerald-700"
      : deltaTone === "danger"
        ? "text-destructive"
        : deltaTone === "warning"
          ? "text-amber-700"
          : "text-muted-foreground";
  return (
    <div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display mt-1 text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </div>
      {delta ? (
        <div className={`font-mono mt-0.5 text-[10.5px] uppercase tracking-[0.04em] ${toneClass}`}>
          {delta}
        </div>
      ) : null}
    </div>
  );
}

// ────────────────────────────────────────────────────────────── STATUS ──

export type StatusKind = "TODO" | "DOING" | "DONE" | "BLOKKERT";

const STATUS_CONFIG: Record<StatusKind, { bg: string; fg: string; label: string }> = {
  TODO: { bg: "bg-muted/40", fg: "text-muted-foreground", label: "TODO" },
  DOING: { bg: "bg-accent/45", fg: "text-[#3B4310]", label: "DOING" },
  DONE: { bg: "bg-emerald-100", fg: "text-emerald-800", label: "DONE" },
  BLOKKERT: { bg: "bg-destructive/10", fg: "text-destructive", label: "BLOKKERT" },
};

export function StatusPill({
  kind,
  compact = false,
}: {
  kind: StatusKind;
  compact?: boolean;
}) {
  const s = STATUS_CONFIG[kind];
  return (
    <span
      className={`font-mono inline-flex items-center rounded-full font-bold uppercase tracking-[0.10em] ${
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[9.5px]"
      } ${s.bg} ${s.fg}`}
    >
      {s.label}
    </span>
  );
}

// ────────────────────────────────────────────────────────────── TASK ROW ──

export type WorkspaceTask = {
  id: string | number;
  title: string;
  done: boolean;
  brenner?: boolean;
  prio: PrioKind;
  vis: VisibilityKind;
  source: SourceKind;
  project?: { company: CompanyKind; name?: string };
  due: string;
  today?: boolean;
  overdue?: boolean;
  assignees?: AvatarItem[];
};

export function TaskRow({
  task,
  dense = false,
  onToggleDone,
  onClick,
}: {
  task: WorkspaceTask;
  dense?: boolean;
  onToggleDone?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`grid cursor-pointer grid-cols-[20px_1fr_auto_auto_auto_auto_auto] items-center gap-2.5 rounded-lg border transition ${
        task.brenner
          ? "border-destructive/25 bg-destructive/[0.04]"
          : "border-border bg-card hover:bg-muted/30"
      } ${dense ? "px-2.5 py-1.5" : "px-3 py-2.5"} ${task.done ? "opacity-55" : ""}`}
    >
      <TaskCheck done={task.done} onClick={onToggleDone} />
      <div
        className={`overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium ${
          task.done ? "line-through" : ""
        }`}
      >
        {task.title}
      </div>
      {task.project ? (
        <ProjectPill company={task.project.company} name={task.project.name} compact />
      ) : null}
      <PrioDot kind={task.prio} />
      <DueDate value={task.due} today={task.today} overdue={task.overdue} />
      <VisibilityIcon kind={task.vis} />
      <SourceBadge kind={task.source} />
    </div>
  );
}

// ────────────────────────────────────────────────────────── WORKSPACE HERO ──

export function WorkspaceHero({
  eyebrow,
  title,
  titleItalic,
  sub,
  actions,
  kpis,
}: {
  eyebrow: string;
  title: string;
  titleItalic?: string;
  sub?: string;
  actions?: React.ReactNode;
  kpis?: Array<{
    label: string;
    value: React.ReactNode;
    delta?: string;
    deltaTone?: "muted" | "success" | "danger" | "warning";
  }>;
}) {
  return (
    <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-7 md:-mx-8 md:-mt-8 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {title}{" "}
            {titleItalic ? (
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontStyle: "italic",
                  color: "#005840",
                }}
              >
                {titleItalic}
              </em>
            ) : null}
          </h1>
          {sub ? (
            <div className="font-mono mt-2.5 text-[11.5px] uppercase tracking-[0.04em] text-muted-foreground">
              {sub}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {kpis && kpis.length > 0 ? (
        <div
          className="mt-6 grid gap-5 border-t border-border pt-5"
          style={{ gridTemplateColumns: `repeat(${kpis.length}, minmax(0, 1fr))` }}
        >
          {kpis.map((k, i) => (
            <WorkspaceKpi key={i} {...k} />
          ))}
        </div>
      ) : null}
    </header>
  );
}

// ──────────────────────────────────────────────────────── WORKSPACE TABS ──

export function WorkspaceTabs({
  active,
  counts,
}: {
  active: "uke" | "oppgaver" | "prosjekter" | "tildelt" | "notion";
  counts?: Partial<Record<"uke" | "oppgaver" | "prosjekter" | "tildelt" | "notion", number>>;
}) {
  const tabs = [
    { id: "uke", label: "Min uke", href: "/admin/workspace" },
    { id: "oppgaver", label: "Oppgaver", href: "/admin/workspace/oppgaver" },
    { id: "prosjekter", label: "Prosjekter", href: "/admin/workspace/prosjekter" },
    { id: "tildelt", label: "Tildelt meg", href: "/admin/workspace/tildelt-meg" },
    { id: "notion", label: "Notion", href: "/admin/workspace/notion" },
  ] as const;

  return (
    <nav
      role="tablist"
      aria-label="Workspace seksjoner"
      className="-mx-4 flex items-center gap-0 border-b border-border bg-card px-4 md:-mx-8 md:px-8"
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        const count = counts?.[t.id];
        return (
          <a
            key={t.id}
            href={t.href}
            role="tab"
            aria-selected={isActive}
            className={`font-display -mb-px inline-flex items-center gap-2 border-b-[3px] px-4 py-3.5 text-[13px] font-semibold transition ${
              isActive
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {typeof count === "number" ? (
              <span
                className={`font-mono rounded px-1.5 py-px text-[10px] tabular-nums ${
                  isActive ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
                }`}
              >
                {count}
              </span>
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}
